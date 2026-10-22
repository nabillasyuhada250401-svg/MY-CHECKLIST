import { ChecklistItem, DayData, QadhaCounts, ReminderSettings, HafalanRecord } from '../types';
import { getSelfCareForDate } from './selfCareRotation';
import { DEFAULT_REMINDER_SETTINGS } from './reminderService';

export const INITIAL_PRESET_ITEMS: Omit<ChecklistItem, 'id' | 'completed'>[] = [
  // PAGI
  {
    title: 'Salat Subuh',
    category: 'pagi',
    scheduledTime: '05:00',
    durationMinutes: 25,
    notes: 'Tepat waktu dan doa pagi',
  },
  {
    title: 'Mandi pagi',
    category: 'pagi',
    scheduledTime: '05:30',
    durationMinutes: 20,
    notes: 'Segar dan siap beraktivitas',
  },
  {
    title: 'Menambah hafalan Al-Qur’an',
    category: 'pagi',
    scheduledTime: '06:00',
    durationMinutes: 30,
    notes: 'Fokus ayat baru di waktu fajar',
  },
  {
    title: 'Berangkat magang',
    category: 'pagi',
    scheduledTime: '07:15',
    durationMinutes: 45,
    notes: 'Perjalanan aman & tepat waktu',
  },

  // SELAMA MAGANG
  {
    title: 'Belajar CPNS di kantor',
    category: 'magang',
    scheduledTime: '10:00',
    durationMinutes: 40,
    notes: 'Latihan soal TWK / TIU / TKP saat sela waktu luang',
  },
  {
    title: 'Mandi siang saat istirahat',
    category: 'magang',
    scheduledTime: '12:00',
    durationMinutes: 15,
    notes: 'Penyegaran badan di tengah hari',
  },
  {
    title: 'Salat Zuhur',
    category: 'magang',
    scheduledTime: '12:26',
    durationMinutes: 25,
    notes: 'Berjamaah tepat waktu di musala kantor',
  },
  {
    title: 'Salat Asar',
    category: 'magang',
    scheduledTime: '15:45',
    durationMinutes: 25,
    notes: 'Istirahat sejenak untuk menunaikan asar',
  },

  // SORE & MALAM (Mengulang hafalan dilakukan langsung sebagai bacaan dalam salat)
  {
    title: 'Mandi sore',
    category: 'malam',
    scheduledTime: '17:30',
    durationMinutes: 20,
    notes: 'Membersihkan penat seusai magang',
  },
  {
    title: 'Salat Magrib',
    category: 'malam',
    scheduledTime: '18:24',
    durationMinutes: 25,
    notes: 'Hafalan dibaca langsung dalam rakaat salat',
  },
  {
    title: 'Salat Isya',
    category: 'malam',
    scheduledTime: '19:34',
    durationMinutes: 25,
    notes: 'Hafalan dibaca langsung dalam rakaat salat',
  },

  // PERBAIKAN DIRI
  {
    title: 'Bersyukur',
    category: 'perbaikan',
    scheduledTime: '21:00',
    durationMinutes: 15,
    notes: 'Refleksi atas nikmat & pencapaian hari ini',
  },
  {
    title: 'Mempersiapkan kebutuhan untuk besok',
    category: 'perbaikan',
    scheduledTime: '21:30',
    durationMinutes: 20,
    notes: 'Pakaian, berkas magang, tas, dan target besok',
  },
  {
    title: 'Tidur sebelum pukul 23.00',
    category: 'perbaikan',
    scheduledTime: '22:30',
    durationMinutes: 20,
    notes: 'Kualitas tidur optimal untuk bangun subuh bugar',
  },
];

const STORAGE_PREFIX = 'checklist_harian_';
const QADHA_GLOBAL_KEY = 'checklist_qadha_totals';
const REMINDERS_KEY = 'checklist_reminders_config';
const HAFALAN_HISTORY_KEY = 'checklist_hafalan_history';

export function createDefaultDayData(dateStr: string): DayData {
  const items: ChecklistItem[] = INITIAL_PRESET_ITEMS.map((item, idx) => ({
    ...item,
    id: `item-${dateStr}-${idx}`,
    completed: false,
  }));

  // Add weekly scheduled self-care task for this day
  const selfCare = getSelfCareForDate(dateStr);
  if (selfCare.timing !== 'Istirahat') {
    items.push({
      id: `selfcare-${dateStr}`,
      title: `${selfCare.icon} Perawatan Diri: ${selfCare.title} (${selfCare.timing})`,
      category: 'perawatan',
      completed: false,
      scheduledTime: selfCare.scheduledTime,
      durationMinutes: selfCare.durationMinutes,
      notes: `Jadwal hari ${selfCare.dayName} (${selfCare.timing})`,
      isCustom: false,
    });
  }

  // Retrieve global qadha
  const qadha = loadGlobalQadha();

  return {
    date: dateStr,
    items,
    qadha,
    journal: {
      hafalanSurat: '',
      hafalanAyat: '',
      bersyukurHariIni: '',
    },
    selfCareDone: false,
  };
}

export function loadDayData(dateStr: string): DayData {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${dateStr}`);
    if (raw) {
      const parsed = JSON.parse(raw);

      // Clean up legacy items & update exact prayer times
      const filteredItems = (parsed.items || [])
        // Filter out redundant "mengulang hafalan" entries as user reads it inside prayer
        .filter((item: ChecklistItem) => !item.title.toLowerCase().includes('mengulang hafalan'))
        .map((item: ChecklistItem) => {
          const lower = item.title.toLowerCase();
          if (lower.includes('subuh')) {
            return { ...item, scheduledTime: '05:00' };
          }
          if (lower.includes('zuhur')) {
            return { ...item, scheduledTime: '12:26' };
          }
          if (lower.includes('asar')) {
            return { ...item, scheduledTime: '15:45' };
          }
          if (lower.includes('magrib')) {
            return { ...item, scheduledTime: '18:24', notes: 'Hafalan dibaca langsung dalam rakaat salat' };
          }
          if (lower.includes('isya')) {
            return { ...item, scheduledTime: '19:34', notes: 'Hafalan dibaca langsung dalam rakaat salat' };
          }
          // Update self-care item title to match current weekly schedule
          if (item.category === 'perawatan') {
            const currentSchedule = getSelfCareForDate(dateStr);
            if (currentSchedule.timing !== 'Istirahat') {
              return {
                ...item,
                title: `${currentSchedule.icon} Perawatan Diri: ${currentSchedule.title} (${currentSchedule.timing})`,
                scheduledTime: currentSchedule.scheduledTime,
                durationMinutes: currentSchedule.durationMinutes,
                notes: `Jadwal hari ${currentSchedule.dayName} (${currentSchedule.timing})`,
              };
            }
          }
          return item;
        });

      // Migrate journal fields
      const journal = parsed.journal || {};
      const hafalanSurat = journal.hafalanSurat || (journal.hafalanDetails?.surat) || journal.hafalanBaru || '';
      const hafalanAyat = journal.hafalanAyat || (journal.hafalanDetails?.ayat) || '';

      return {
        ...createDefaultDayData(dateStr),
        ...parsed,
        items: filteredItems.length > 0 ? filteredItems : createDefaultDayData(dateStr).items,
        journal: {
          hafalanSurat,
          hafalanAyat,
          bersyukurHariIni: journal.bersyukurHariIni || '',
        },
      };
    }
  } catch (err) {
    console.error('Error loading day data:', err);
  }
  return createDefaultDayData(dateStr);
}

export function saveDayData(dayData: DayData): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${dayData.date}`, JSON.stringify(dayData));
    saveGlobalQadha(dayData.qadha);

    // If hafalan is entered, auto-sync or ensure it's logged in hafalan history
    if (dayData.journal.hafalanSurat.trim()) {
      autoSyncHafalanHistory(dayData.date, dayData.journal.hafalanSurat, dayData.journal.hafalanAyat);
    }
  } catch (err) {
    console.error('Error saving day data:', err);
  }
}

export function loadGlobalQadha(): QadhaCounts {
  try {
    const raw = localStorage.getItem(QADHA_GLOBAL_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading qadha:', e);
  }
  return {
    subuh: 0,
    zuhur: 0,
    asar: 0,
    magrib: 0,
    isya: 0,
  };
}

export function saveGlobalQadha(qadha: QadhaCounts): void {
  try {
    localStorage.setItem(QADHA_GLOBAL_KEY, JSON.stringify(qadha));
  } catch (e) {
    console.error('Error saving qadha:', e);
  }
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) {
      return { ...DEFAULT_REMINDER_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading reminders:', e);
  }
  return DEFAULT_REMINDER_SETTINGS;
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving reminders:', e);
  }
}

// =================== HAFALAN HISTORY LOG ===================

export function loadHafalanHistory(): HafalanRecord[] {
  try {
    const raw = localStorage.getItem(HAFALAN_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading hafalan history:', e);
  }

  // Initial seed demo record
  const initial: HafalanRecord[] = [
    {
      id: 'hafalan-init-1',
      date: '2026-10-22',
      surat: 'Surat An-Naba’',
      ayat: '1-15',
      notes: 'Dibaca pada Salat Magrib dan Isya',
      createdAt: '2026-10-22T06:30:00.000Z',
    },
  ];
  saveHafalanHistory(initial);
  return initial;
}

export function saveHafalanHistory(history: HafalanRecord[]): void {
  try {
    localStorage.setItem(HAFALAN_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Error saving hafalan history:', e);
  }
}

export function addHafalanRecord(record: { date: string; surat: string; ayat: string; notes?: string }): HafalanRecord {
  const history = loadHafalanHistory();
  const newRecord: HafalanRecord = {
    id: `hafalan-${Date.now()}`,
    date: record.date,
    surat: record.surat.trim(),
    ayat: record.ayat.trim(),
    notes: record.notes?.trim(),
    createdAt: new Date().toISOString(),
  };

  // Prepend so newest is at the top
  const updated = [newRecord, ...history];
  saveHafalanHistory(updated);
  return newRecord;
}

export function deleteHafalanRecord(id: string): void {
  const history = loadHafalanHistory();
  const updated = history.filter(h => h.id !== id);
  saveHafalanHistory(updated);
}

function autoSyncHafalanHistory(date: string, surat: string, ayat: string): void {
  const history = loadHafalanHistory();
  const existingIndex = history.findIndex(h => h.date === date && h.surat.toLowerCase() === surat.trim().toLowerCase());

  if (existingIndex !== -1) {
    // Update existing entry for this day and surah
    history[existingIndex] = {
      ...history[existingIndex],
      ayat: ayat.trim(),
    };
    saveHafalanHistory(history);
  } else {
    // Add new
    history.unshift({
      id: `hafalan-auto-${Date.now()}`,
      date,
      surat: surat.trim(),
      ayat: ayat.trim(),
      notes: 'Dicatat otomatis dari checklist harian',
      createdAt: new Date().toISOString(),
    });
    saveHafalanHistory(history);
  }
}

/**
 * Format Indonesian date: "Kamis, 22 Oktober 2026"
 */
export function formatIndonesianDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Generate formatted text copy matching user's exact specification
 */
export function generateFormattedShareText(dayData: DayData): string {
  const formattedDate = formatIndonesianDate(dayData.date);
  const getSectionItems = (cat: string) => dayData.items.filter(i => i.category === cat);

  const pagiItems = getSectionItems('pagi').map(i => `[${i.completed ? 'x' : ' '}] ${i.title}`).join('\n');
  const magangItems = getSectionItems('magang').map(i => `[${i.completed ? 'x' : ' '}] ${i.title}`).join('\n');
  const malamItems = getSectionItems('malam').map(i => `[${i.completed ? 'x' : ' '}] ${i.title}`).join('\n');
  const perbaikanItems = getSectionItems('perbaikan').map(i => `[${i.completed ? 'x' : ' '}] ${i.title}`).join('\n');

  const selfCare = getSelfCareForDate(dayData.date);
  const selfCareText = selfCare.timing !== 'Istirahat'
    ? `[${dayData.selfCareDone ? 'x' : ' '}] ${selfCare.title} (${selfCare.dayName} ${selfCare.timing})`
    : `[ ] Hari Minggu: Istirahat Kulit & Rambut`;

  const qadha = dayData.qadha;

  // Format hafalan baru purely as Surat and Ayat
  let hafalan = 'Belum dicatat';
  if (dayData.journal.hafalanSurat?.trim()) {
    hafalan = dayData.journal.hafalanSurat.trim();
    if (dayData.journal.hafalanAyat?.trim()) {
      hafalan += ` ayat ${dayData.journal.hafalanAyat.trim()}`;
    }
  } else if (dayData.journal.hafalanBaru?.trim()) {
    hafalan = dayData.journal.hafalanBaru.trim();
  }

  const syukur = dayData.journal.bersyukurHariIni?.trim() || '-';

  return `CHECKLIST HARIAN — ${formattedDate}

🌅 PAGI
${pagiItems}

🏢 SELAMA MAGANG
${magangItems}

🌇 SORE & MALAM
${malamItems}

🌷 PERBAIKAN DIRI
${perbaikanItems}

✨ PERAWATAN DIRI (${selfCare.dayName} ${selfCare.timing})
${selfCareText}

QADHA SALAT
Qadha Subuh: ${qadha.subuh} kali
Qadha Zuhur: ${qadha.zuhur} kali
Qadha Asar: ${qadha.asar} kali
Qadha Magrib: ${qadha.magrib} kali
Qadha Isya: ${qadha.isya} kali

Hafalan baru: ${hafalan}
Bersyukur Hari Ini: ${syukur}`;
}
