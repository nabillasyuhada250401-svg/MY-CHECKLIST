export type ChecklistCategory = 'pagi' | 'magang' | 'malam' | 'perbaikan' | 'perawatan';

export interface ChecklistItem {
  id: string;
  title: string;
  category: ChecklistCategory;
  completed: boolean;
  scheduledTime?: string; // HH:mm format e.g. "05:00"
  durationMinutes?: number;
  notes?: string;
  isCustom?: boolean;
  syncedToGoogleCalendar?: boolean;
  googleCalendarEventId?: string;
}

export interface QadhaCounts {
  subuh: number;
  zuhur: number;
  asar: number;
  magrib: number;
  isya: number;
}

export type SelfCareActivityId = 'sampoan' | 'exfo' | 'maskeran' | 'luluran' | 'istirahat';

export interface SelfCareActivity {
  id: SelfCareActivityId;
  name: string;
  tagline: string;
  icon: string;
  description: string;
  steps: string[];
  durationMinutes: number;
  frequencyNote: string;
  badgeColor: string;
  gradient: string;
}

export interface WeeklySelfCareDay {
  dayIndex: number; // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  dayName: string;
  title: string;
  timing: 'Sore' | 'Malam' | 'Istirahat';
  scheduledTime: string;
  icon: string;
  badgeColor: string;
  description: string;
  steps: string[];
  durationMinutes: number;
}

export interface DailyJournal {
  hafalanSurat: string;
  hafalanAyat: string;
  hafalanBaru?: string; // backwards compatibility
  bersyukurHariIni: string;
}

export interface HafalanRecord {
  id: string;
  date: string; // YYYY-MM-DD
  surat: string;
  ayat: string;
  notes?: string;
  createdAt: string;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  items: ChecklistItem[];
  qadha: QadhaCounts;
  journal: DailyJournal;
  selfCareDone: boolean;
  lastSyncedAt?: string;
}

export interface ReminderSettings {
  browserNotifications: boolean;
  soundAlerts: boolean;
  leadMinutes: number; // e.g., 10, 15, or 0 (on time)
}
