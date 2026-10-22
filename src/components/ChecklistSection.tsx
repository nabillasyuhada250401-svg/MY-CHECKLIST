import React, { useState } from 'react';
import { ChecklistItem, ChecklistCategory } from '../types';
import { Check, Clock, Plus, Trash2, Calendar, Bell } from 'lucide-react';
import { getGoogleCalendarWebUrl } from '../services/calendarService';
import { playChimeSound, sendNotification } from '../services/reminderService';

interface ChecklistSectionProps {
  title: string;
  emoji: string;
  category: ChecklistCategory;
  items: ChecklistItem[];
  dateStr: string;
  onToggleItem: (id: string) => void;
  onAddItem: (category: ChecklistCategory, title: string, time?: string, notes?: string) => void;
  onDeleteItem: (id: string) => void;
  onSyncItemToGCal?: (item: ChecklistItem) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  title,
  emoji,
  category,
  items,
  dateStr,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onSyncItemToGCal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const completedCount = items.filter(i => i.completed).length;
  const isAllCompleted = items.length > 0 && completedCount === items.length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddItem(category, newTitle.trim(), newTime || undefined, newNotes.trim() || undefined);
    setNewTitle('');
    setNewTime('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleTestReminder = (e: React.MouseEvent, item: ChecklistItem) => {
    e.stopPropagation();
    playChimeSound();
    sendNotification(`Pengingat: ${item.title}`, {
      body: `Jadwal pukul ${item.scheduledTime || 'sekarang'} • ${item.notes || title}`,
      tag: item.id,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Section Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-stone-50 via-emerald-50/30 to-stone-50 border-b border-stone-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label={title}>{emoji}</span>
          <h2 className="font-bold text-stone-800 text-sm sm:text-base tracking-wide uppercase">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              isAllCompleted
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            {completedCount}/{items.length} Selesai
          </span>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-1 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-white transition-colors"
            title="Tambah Kegiatan Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-stone-100">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-stone-400 italic">
            Belum ada kegiatan di bagian ini.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                item.completed
                  ? 'bg-emerald-50/30 text-stone-400'
                  : 'hover:bg-emerald-50/20 text-stone-800'
              }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 border ${
                    item.completed
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-stone-300 bg-white group-hover:border-emerald-500'
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </div>

              {/* Title & Notes */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-medium text-sm transition-all ${
                      item.completed ? 'line-through text-stone-400' : 'text-stone-800'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.scheduledTime && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {item.scheduledTime}
                    </span>
                  )}
                  {item.syncedToGoogleCalendar && (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      Tersinkron GCal
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className={`text-xs mt-0.5 ${item.completed ? 'text-stone-400 line-through' : 'text-stone-500'}`}>
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Quick Actions (Sound trigger, Google Calendar link, Delete) */}
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {/* Remind me sound */}
                <button
                  type="button"
                  onClick={(e) => handleTestReminder(e, item)}
                  title="Uji coba pengingat suara & notifikasi"
                  className="p-1.5 rounded-md text-stone-400 hover:text-amber-600 hover:bg-stone-100 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>

                {/* Google Calendar Web Quick Add */}
                <a
                  href={getGoogleCalendarWebUrl(dateStr, item)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Buka langsung di Google Calendar"
                  className="p-1.5 rounded-md text-stone-400 hover:text-emerald-700 hover:bg-stone-100 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </a>

                {/* Direct Google Calendar API sync button */}
                {onSyncItemToGCal && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSyncItemToGCal(item);
                    }}
                    title="Kirim ke Akun Google Calendar"
                    className="p-1.5 rounded-md text-stone-400 hover:text-blue-600 hover:bg-stone-100 transition-colors hidden sm:block"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                  </button>
                )}

                {/* Delete button (for custom tasks) */}
                {item.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    title="Hapus kegiatan ini"
                    className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {/* Add custom item form */}
        {isAdding && (
          <form onSubmit={handleCreateTask} className="p-3 bg-stone-50 border-t border-stone-200">
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nama kegiatan (contoh: Baca buku materi SKD)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-24 text-xs border border-stone-300 rounded-lg px-2 py-1.5 bg-white text-stone-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  title="Waktu kegiatan"
                />
              </div>
              <input
                type="text"
                placeholder="Catatan tambahan (opsional)"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full text-xs border border-stone-300 rounded-lg px-2.5 py-1.5 bg-white text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded-md font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-md font-medium shadow-xs"
                >
                  Simpan Kegiatan
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
