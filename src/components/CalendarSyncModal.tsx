import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { ChecklistItem } from '../types';
import { createGoogleCalendarEvent, downloadICSFile } from '../services/calendarService';
import { formatIndonesianDate } from '../services/storageService';
import { X, Calendar, Download, CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  items: ChecklistItem[];
  user: User | null;
  onLogin: () => void;
  onItemsSynced: (updatedItems: ChecklistItem[]) => void;
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  items,
  user,
  onLogin,
  onItemsSynced,
}) => {
  const [syncLeadMinutes, setSyncLeadMinutes] = useState(15);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; title: string } | null>(null);
  const [syncResults, setSyncResults] = useState<{ successCount: number; errors: string[] } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const validItems = items.filter(i => i.scheduledTime);
  const formattedDate = formatIndonesianDate(dateStr);

  const handleStartBulkSync = () => {
    // Show mandatory confirmation dialog first
    setShowConfirmation(true);
  };

  const handleConfirmSync = async () => {
    setShowConfirmation(false);
    setIsSyncing(true);
    setSyncResults(null);

    const updated = [...items];
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      setSyncProgress({
        current: i + 1,
        total: validItems.length,
        title: item.title,
      });

      try {
        const result = await createGoogleCalendarEvent({
          title: item.title,
          categoryName: item.category.toUpperCase(),
          dateStr,
          timeStr: item.scheduledTime,
          durationMinutes: item.durationMinutes || 30,
          description: item.notes,
          reminderMinutes: syncLeadMinutes,
        });

        // Mark item as synced
        const idx = updated.findIndex(u => u.id === item.id);
        if (idx !== -1) {
          updated[idx] = {
            ...updated[idx],
            syncedToGoogleCalendar: true,
            googleCalendarEventId: result.id,
          };
        }
        successCount++;
      } catch (err: any) {
        errors.push(`${item.title}: ${err.message || 'Gagal sinkronisasi'}`);
      }
    }

    setIsSyncing(false);
    setSyncProgress(null);
    setSyncResults({ successCount, errors });
    onItemsSynced(updated);
  };

  const handleDownloadICS = () => {
    downloadICSFile(dateStr, items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Sinkronisasi ke Kalender</h3>
              <p className="text-xs text-stone-500">Google Calendar & Universal iCalendar (.ics)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Target Date Pill */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Jadwal Tanggal:</span>
            <span className="font-bold text-emerald-900">{formattedDate}</span>
          </div>

          {/* Section 1: Google Calendar Direct Sync */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-bold text-sm text-stone-800">Google Calendar API</span>
              </div>

              {user ? (
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Terhubung: {user.displayName || user.email}
                </span>
              ) : (
                <span className="text-xs text-stone-500">Belum Terhubung</span>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Membuat jadwal kegiatan hari ini langsung ke akun Google Calendar Anda beserta <strong>alarm pengingat otomatis</strong> di HP/laptop sebelum kegiatan dimulai.
            </p>

            {user ? (
              <div className="space-y-3 pt-1">
                {/* Reminder setting */}
                <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-stone-200">
                  <span className="text-stone-700 font-medium">Bunyikan Pengingat:</span>
                  <select
                    value={syncLeadMinutes}
                    onChange={(e) => setSyncLeadMinutes(Number(e.target.value))}
                    className="border border-stone-300 rounded px-2 py-1 text-xs bg-white text-stone-800 font-medium outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={0}>Tepat waktu kegiatan</option>
                    <option value={5}>5 menit sebelumnya</option>
                    <option value={10}>10 menit sebelumnya</option>
                    <option value={15}>15 menit sebelumnya (Disarankan)</option>
                    <option value={30}>30 menit sebelumnya</option>
                  </select>
                </div>

                {/* Progress / Results */}
                {isSyncing && syncProgress && (
                  <div className="p-3 bg-white rounded-lg border border-emerald-300 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        Menyinkronkan ({syncProgress.current}/{syncProgress.total})
                      </span>
                      <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">{syncProgress.title}</p>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-200"
                        style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {syncResults && (
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      syncResults.errors.length === 0
                        ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <p className="font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-700" />
                      Berhasil menyinkronkan {syncResults.successCount} jadwal ke Google Calendar!
                    </p>
                    {syncResults.errors.length > 0 && (
                      <p className="text-[11px] mt-1 text-rose-700">
                        {syncResults.errors.length} jadwal gagal: {syncResults.errors[0]}
                      </p>
                    )}
                  </div>
                )}

                {/* Sync Button */}
                <button
                  type="button"
                  onClick={handleStartBulkSync}
                  disabled={isSyncing || validItems.length === 0}
                  className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Sinkronkan {validItems.length} Jadwal Hari Ini ke Google Calendar</span>
                </button>
              </div>
            ) : (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-800 shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Masuk dengan Google untuk Sinkronkan</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Universal iCalendar (.ics) download */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-stone-800 flex items-center gap-2">
                <Download className="w-4 h-4 text-stone-600" />
                Unduh File Kalender Universal (.ics)
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dapat diimpor langsung ke Apple Calendar di iPhone/Mac, Samsung Calendar, Outlook, atau aplikasi kalender Android tanpa perlu login.
            </p>
            <button
              type="button"
              onClick={handleDownloadICS}
              className="w-full py-2 px-3 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File .ics ({validItems.length} Kegiatan)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Tutup
          </button>
        </div>

        {/* Mandatory User Confirmation Dialog */}
        {showConfirmation && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-stone-900">Konfirmasi Sinkronisasi</h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Aplikasi akan membuat <strong>{validItems.length} agenda kegiatan</strong> untuk tanggal{' '}
                <strong>{formattedDate}</strong> di akun Google Calendar Anda dengan pengingat otomatis{' '}
                <strong>{syncLeadMinutes} menit sebelumnya</strong>.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSync}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Ya, Sinkronkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
