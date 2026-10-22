import React, { useState } from 'react';
import { ReminderSettings, ChecklistItem } from '../types';
import { requestNotificationPermission, playChimeSound, sendNotification } from '../services/reminderService';
import { X, Bell, Volume2, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onSaveSettings: (settings: ReminderSettings) => void;
  items: ChecklistItem[];
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  items,
}) => {
  const [browserPermGranted, setBrowserPermGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(settings);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setBrowserPermGranted(granted);
    if (granted) {
      const updated = { ...localSettings, browserNotifications: true };
      setLocalSettings(updated);
      onSaveSettings(updated);
      sendNotification('Notifikasi Diaktifkan!', {
        body: 'Alhamdulillah, pengingat otomatis checklist harian telah aktif.',
      });
    }
  };

  const handleToggleSound = (checked: boolean) => {
    const updated = { ...localSettings, soundAlerts: checked };
    setLocalSettings(updated);
    onSaveSettings(updated);
    if (checked) {
      playChimeSound();
    }
  };

  const handleLeadChange = (mins: number) => {
    const updated = { ...localSettings, leadMinutes: mins };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const scheduledItems = items.filter(i => i.scheduledTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-50 via-emerald-50 to-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Fitur Pengingat Otomatis</h3>
              <p className="text-xs text-stone-500">Alarm & Notifikasi Browser</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Notification Permission Card */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 text-sm">Notifikasi Browser / HP</span>
              {browserPermGranted ? (
                <span className="text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Aktif
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  Izinkan Notifikasi
                </button>
              )}
            </div>
            <p className="text-stone-600 leading-relaxed">
              Dapatkan popup notifikasi di layar komputer atau smartphone saat waktu ibadah salat, jadwal magang, atau rotasi perawatan diri tiba.
            </p>
          </div>

          {/* Sound alert option */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-stone-600" />
                <span className="font-bold text-stone-800 text-sm">Suara Bel Pengingat (Chime)</span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.soundAlerts}
                onChange={(e) => handleToggleSound(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-stone-600">Nada bunyi lembut yang menenangkan.</p>
              <button
                type="button"
                onClick={playChimeSound}
                className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 text-stone-700 font-medium transition-colors"
              >
                Tes Suara
              </button>
            </div>
          </div>

          {/* Lead time configuration */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 text-sm">Waktu Pemberitahuan</span>
            </div>
            <p className="text-stone-600">Berapa menit sebelum waktu kegiatan alarm dibunyikan?</p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[0, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleLeadChange(mins)}
                  className={`py-1.5 px-2 rounded-lg border font-semibold text-center transition-all ${
                    localSettings.leadMinutes === mins
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {mins === 0 ? 'Tepat Waktu' : `${mins} Menit Lalu`}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="border border-stone-200 rounded-xl p-3">
            <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              Daftar Waktu Pengingat Hari Ini ({scheduledItems.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {scheduledItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-50 text-[11px]"
                >
                  <span className="text-stone-800 font-medium truncate max-w-[200px]">{item.title}</span>
                  <span className="font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                    {item.scheduledTime} WIB
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
