/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { ChecklistSection } from './components/ChecklistSection';
import { SelfCareCard } from './components/SelfCareCard';
import { QadhaSalatWidget } from './components/QadhaSalatWidget';
import { JournalWidget } from './components/JournalWidget';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { ReminderModal } from './components/ReminderModal';
import { ShareExportModal } from './components/ShareExportModal';
import { HafalanReportModal } from './components/HafalanReportModal';
import { ChecklistCategory, ChecklistItem, DayData, ReminderSettings, HafalanRecord } from './types';
import {
  loadDayData,
  saveDayData,
  loadReminderSettings,
  saveReminderSettings,
  formatIndonesianDate,
  loadHafalanHistory,
  addHafalanRecord,
  deleteHafalanRecord,
} from './services/storageService';
import { initAuth, googleSignIn, logout, getCurrentUser } from './services/firebaseAuth';
import { createGoogleCalendarEvent } from './services/calendarService';
import { sendNotification, playChimeSound } from './services/reminderService';
import { Sparkles, Calendar, BookOpen } from 'lucide-react';

export default function App() {
  // Default to Kamis, 22 Oktober 2026 as per user brief
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-10-22');
  const [dayData, setDayData] = useState<DayData>(() => loadDayData('2026-10-22'));
  const [user, setUser] = useState<User | null>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(() => loadReminderSettings());
  const [hafalanRecords, setHafalanRecords] = useState<HafalanRecord[]>(() => loadHafalanHistory());

  // Active filter tab
  const [activeTab, setActiveTab] = useState<'all' | 'checklist' | 'selfcare' | 'qadha' | 'journal'>('all');

  // Modals state
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isHafalanModalOpen, setIsHafalanModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevCompletedCountRef = useRef<number>(0);
  const notifiedItemsRef = useRef<Set<string>>(new Set());

  // Show quick toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Initialize auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser) => {
        setUser(authUser);
      },
      () => {
        setUser(getCurrentUser());
      }
    );
    return () => unsubscribe();
  }, []);

  // Reload day data and hafalan history when date changes
  useEffect(() => {
    const loaded = loadDayData(currentDateStr);
    setDayData(loaded);
    prevCompletedCountRef.current = loaded.items.filter(i => i.completed).length;
    notifiedItemsRef.current.clear();
    setHafalanRecords(loadHafalanHistory());
  }, [currentDateStr]);

  // Persist day data on change
  const updateDayData = (updater: (prev: DayData) => DayData) => {
    setDayData((prev) => {
      const next = updater(prev);
      saveDayData(next);
      return next;
    });
  };

  // Toggle item completed
  const handleToggleItem = (itemId: string) => {
    updateDayData((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          const willBeCompleted = !item.completed;
          if (willBeCompleted) {
            playChimeSound();
          }
          return { ...item, completed: willBeCompleted };
        }
        return item;
      });

      // Check if self-care task was toggled
      const selfCareItem = updatedItems.find(i => i.category === 'perawatan');
      const isSelfCareDone = selfCareItem ? selfCareItem.completed : prev.selfCareDone;

      return {
        ...prev,
        items: updatedItems,
        selfCareDone: isSelfCareDone,
      };
    });
  };

  // Add custom task
  const handleAddItem = (category: ChecklistCategory, title: string, time?: string, notes?: string) => {
    updateDayData((prev) => {
      const newItem: ChecklistItem = {
        id: `custom-${Date.now()}`,
        title,
        category,
        completed: false,
        scheduledTime: time,
        durationMinutes: 30,
        notes,
        isCustom: true,
      };
      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });
    showToast(`Kegiatan "${title}" berhasil ditambahkan.`);
  };

  // Delete custom task
  const handleDeleteItem = (itemId: string) => {
    updateDayData((prev) => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId),
    }));
    showToast('Kegiatan telah dihapus.');
  };

  // Toggle self-care status from card
  const handleToggleSelfCareDone = () => {
    updateDayData((prev) => {
      const newStatus = !prev.selfCareDone;
      if (newStatus) {
        playChimeSound();
        showToast('Alhamdulillah, perawatan diri hari ini selesai!');
      }
      const updatedItems = prev.items.map((item) => {
        if (item.category === 'perawatan') {
          return { ...item, completed: newStatus };
        }
        return item;
      });
      return {
        ...prev,
        selfCareDone: newStatus,
        items: updatedItems,
      };
    });
  };

  // Hafalan history actions
  const handleAddHafalan = (record: { date: string; surat: string; ayat: string; notes?: string }) => {
    addHafalanRecord(record);
    const updated = loadHafalanHistory();
    setHafalanRecords(updated);
    showToast(`Capaian "${record.surat}" berhasil dicatat di laporan.`);
  };

  const handleDeleteHafalan = (id: string) => {
    deleteHafalanRecord(id);
    const updated = loadHafalanHistory();
    setHafalanRecords(updated);
    showToast('Catatan hafalan telah dihapus.');
  };

  // 1-Click single item sync to Google Calendar
  const handleSyncSingleItemToGCal = async (item: ChecklistItem) => {
    if (!user) {
      setIsCalendarModalOpen(true);
      return;
    }

    try {
      showToast(`Menyinkronkan "${item.title}" ke Google Calendar...`);
      const result = await createGoogleCalendarEvent({
        title: item.title,
        categoryName: item.category.toUpperCase(),
        dateStr: currentDateStr,
        timeStr: item.scheduledTime,
        durationMinutes: item.durationMinutes || 30,
        description: item.notes,
        reminderMinutes: reminderSettings.leadMinutes,
      });

      updateDayData((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id
            ? { ...i, syncedToGoogleCalendar: true, googleCalendarEventId: result.id }
            : i
        ),
      }));

      showToast(`"${item.title}" berhasil disinkronkan ke Google Calendar!`);
    } catch (err: any) {
      showToast(err.message || 'Gagal sinkron ke Google Calendar.');
    }
  };

  // Check 100% completion celebration
  const totalItemsCount = dayData.items.length;
  const completedCount = dayData.items.filter(i => i.completed).length;

  useEffect(() => {
    if (totalItemsCount > 0 && completedCount === totalItemsCount && completedCount > prevCompletedCountRef.current) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#fbbf24', '#f43f5e'],
      });
      showToast('🎉 Masya Allah, semua checklist hari ini telah lengkap!');
    }
    prevCompletedCountRef.current = completedCount;
  }, [completedCount, totalItemsCount]);

  // Periodic reminder background monitor
  useEffect(() => {
    if (!reminderSettings.browserNotifications && !reminderSettings.soundAlerts) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTotalMin = currentHour * 60 + currentMin;

      dayData.items.forEach((item) => {
        if (!item.scheduledTime || item.completed) return;
        const [h, m] = item.scheduledTime.split(':').map(Number);
        const itemTotalMin = h * 60 + m;

        // Trigger when within leadMinutes window
        const triggerMin = itemTotalMin - (reminderSettings.leadMinutes || 0);

        if (currentTotalMin === triggerMin && !notifiedItemsRef.current.has(item.id)) {
          notifiedItemsRef.current.add(item.id);
          sendNotification(`Waktunya: ${item.title}`, {
            body: `Jadwal pukul ${item.scheduledTime} (${item.notes || 'Checklist Harian'})`,
            sound: reminderSettings.soundAlerts,
            tag: item.id,
          });
        }
      });
    }, 45000); // Check every 45s

    return () => clearInterval(interval);
  }, [dayData.items, reminderSettings]);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      showToast('Menghubungkan ke Google...');
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        showToast(`Selamat datang, ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal masuk dengan Google.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    showToast('Telah keluar dari akun Google.');
  };

  // Group items by category
  const pagiItems = dayData.items.filter(i => i.category === 'pagi');
  const magangItems = dayData.items.filter(i => i.category === 'magang');
  const malamItems = dayData.items.filter(i => i.category === 'malam');
  const perbaikanItems = dayData.items.filter(i => i.category === 'perbaikan');

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#1E2922] pb-16 selection:bg-emerald-200">
      {/* Top Header */}
      <Header
        currentDateStr={currentDateStr}
        onDateChange={setCurrentDateStr}
        totalItems={dayData.items.length}
        completedItems={completedCount}
        user={user}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onOpenCalendarSync={() => setIsCalendarModalOpen(true)}
        onOpenReminders={() => setIsReminderModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        isReminderActive={reminderSettings.browserNotifications || reminderSettings.soundAlerts}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-5 sm:pt-6 space-y-6">
        {/* Banner with day title & inspiring reminder */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-emerald-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-200 bg-emerald-950/50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-700/50">
              Jadwal & Kedisiplinan Harian
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Checklist Harian — {formatIndonesianDate(currentDateStr)}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Istikamah menyeimbangkan ibadah salat tepat waktu, magang & belajar CPNS, perawatan diri rutin mingguan, serta murojaah hafalan dalam salat.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsHafalanModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-500/60 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
              <span>Laporan Hafalan ({hafalanRecords.length})</span>
            </button>

            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sinkronkan Kalender</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-600/60 text-xs font-semibold transition-all"
            >
              Bagikan
            </button>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -right-8 -bottom-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none blur-xl" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Semua ({dayData.items.length})
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Checklist Harian
          </button>
          <button
            onClick={() => setActiveTab('selfcare')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'selfcare'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Perawatan Diri (Senin - Minggu)
          </button>
          <button
            onClick={() => setActiveTab('qadha')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'qadha'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Qadha Salat
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'journal'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Hafalan & Syukur
          </button>
        </div>

        {/* Content sections based on active tab */}

        {/* WEEKLY SELF-CARE CARD (Senin - Minggu) */}
        {(activeTab === 'all' || activeTab === 'selfcare') && (
          <SelfCareCard
            dateStr={currentDateStr}
            isDone={dayData.selfCareDone}
            onToggleDone={handleToggleSelfCareDone}
          />
        )}

        {/* DAILY CHECKLIST SECTIONS */}
        {(activeTab === 'all' || activeTab === 'checklist') && (
          <div className="space-y-4">
            {/* 🌅 PAGI */}
            <ChecklistSection
              title="PAGI"
              emoji="🌅"
              category="pagi"
              items={pagiItems}
              dateStr={currentDateStr}
              onToggleItem={handleToggleItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onSyncItemToGCal={handleSyncSingleItemToGCal}
            />

            {/* 🏢 SELAMA MAGANG */}
            <ChecklistSection
              title="SELAMA MAGANG"
              emoji="🏢"
              category="magang"
              items={magangItems}
              dateStr={currentDateStr}
              onToggleItem={handleToggleItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onSyncItemToGCal={handleSyncSingleItemToGCal}
            />

            {/* 🌇 SORE & MALAM */}
            <ChecklistSection
              title="SORE & MALAM"
              emoji="🌇"
              category="malam"
              items={malamItems}
              dateStr={currentDateStr}
              onToggleItem={handleToggleItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onSyncItemToGCal={handleSyncSingleItemToGCal}
            />

            {/* 🌷 PERBAIKAN DIRI */}
            <ChecklistSection
              title="PERBAIKAN DIRI"
              emoji="🌷"
              category="perbaikan"
              items={perbaikanItems}
              dateStr={currentDateStr}
              onToggleItem={handleToggleItem}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onSyncItemToGCal={handleSyncSingleItemToGCal}
            />
          </div>
        )}

        {/* QADHA SALAT SECTION */}
        {(activeTab === 'all' || activeTab === 'qadha') && (
          <QadhaSalatWidget
            qadha={dayData.qadha}
            onChange={(newQadha) => {
              updateDayData((prev) => ({
                ...prev,
                qadha: newQadha,
              }));
            }}
          />
        )}

        {/* JOURNAL & HAFALAN SECTION */}
        {(activeTab === 'all' || activeTab === 'journal') && (
          <JournalWidget
            journal={dayData.journal}
            onChange={(newJournal) => {
              updateDayData((prev) => ({
                ...prev,
                journal: newJournal,
              }));
            }}
            onOpenHafalanReport={() => setIsHafalanModalOpen(true)}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-stone-800 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <CalendarSyncModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        dateStr={currentDateStr}
        items={dayData.items}
        user={user}
        onLogin={handleLogin}
        onItemsSynced={(updatedItems) => {
          updateDayData((prev) => ({
            ...prev,
            items: updatedItems,
            lastSyncedAt: new Date().toISOString(),
          }));
        }}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        settings={reminderSettings}
        onSaveSettings={(newSettings) => {
          setReminderSettings(newSettings);
          saveReminderSettings(newSettings);
          showToast('Pengaturan pengingat berhasil disimpan.');
        }}
        items={dayData.items}
      />

      <ShareExportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        dayData={dayData}
      />

      <HafalanReportModal
        isOpen={isHafalanModalOpen}
        onClose={() => setIsHafalanModalOpen(false)}
        records={hafalanRecords}
        onAddRecord={handleAddHafalan}
        onDeleteRecord={handleDeleteHafalan}
        currentDateStr={currentDateStr}
      />
    </div>
  );
}
