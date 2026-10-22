import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Bell, Share2, CalendarPlus, LogOut } from 'lucide-react';
import { formatIndonesianDate } from '../services/storageService';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentDateStr: string;
  onDateChange: (newDate: string) => void;
  totalItems: number;
  completedItems: number;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenCalendarSync: () => void;
  onOpenReminders: () => void;
  onOpenShare: () => void;
  isReminderActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  onDateChange,
  totalItems,
  completedItems,
  user,
  onLoginClick,
  onLogoutClick,
  onOpenCalendarSync,
  onOpenReminders,
  onOpenShare,
  isReminderActive,
}) => {
  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handlePrevDay = () => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    // Current target default is 2026-10-22 or real date
    const today = new Date().toISOString().split('T')[0];
    onDateChange(today);
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
        {/* Top bar: Brand & Auth / Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-emerald-950 flex items-center gap-2">
                  Checklist Harian
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Magang & Ibadah
                  </span>
                </h1>
                <p className="text-xs text-emerald-700/80">
                  Sinkronisasi Kalender • Pengingat Otomatis • Rotasi Perawatan
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1 sm:hidden">
              <button
                onClick={onOpenReminders}
                className={`p-2 rounded-lg border text-xs flex items-center justify-center ${
                  isReminderActive
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-stone-50 text-stone-600 border-stone-200'
                }`}
                title="Pengingat Otomatis"
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons & Google User */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenReminders}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isReminderActive
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Bell className={`w-3.5 h-3.5 ${isReminderActive ? 'text-amber-600 animate-pulse' : ''}`} />
              <span>{isReminderActive ? 'Pengingat Aktif' : 'Atur Pengingat'}</span>
            </button>

            <button
              onClick={onOpenCalendarSync}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-xs"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sinkron ke Kalender</span>
            </button>

            <button
              onClick={onOpenShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all"
              title="Salin checklist untuk WhatsApp / Catatan"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bagikan</span>
            </button>

            {/* Google Authentication */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
                <div className="flex items-center gap-2 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200 text-xs">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Akun'}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-stone-800 max-w-[90px] sm:max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={onLogoutClick}
                    title="Keluar dari Google"
                    className="text-stone-400 hover:text-rose-600 transition-colors ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 shadow-xs transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Selector & Progress bar */}
        <div className="mt-4 pt-3 border-t border-emerald-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Date Selector Navigation */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-emerald-900 font-semibold text-sm">
              <CalendarIcon className="w-4 h-4 text-emerald-700" />
              <span>{formatIndonesianDate(currentDateStr)}</span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium ml-1"
            >
              Hari Ini
            </button>

            <input
              type="date"
              value={currentDateStr}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 bg-white text-stone-700 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Daily Progress */}
          <div className="flex items-center gap-3">
            <div className="w-36 sm:w-48 bg-stone-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="text-xs font-semibold text-emerald-900 whitespace-nowrap">
              {completedItems}/{totalItems} ({percent}%)
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
