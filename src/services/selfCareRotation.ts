import { WeeklySelfCareDay } from '../types';

export const WEEKLY_SELF_CARE_SCHEDULE: Record<number, WeeklySelfCareDay> = {
  // 1: Senin - Maskeran malam
  1: {
    dayIndex: 1,
    dayName: 'Senin',
    title: 'Maskeran Wajah',
    timing: 'Malam',
    scheduledTime: '20:30',
    icon: '🧖‍♀️',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Menutrisi dan menenangkan kulit wajah setelah hari pertama magang dengan sheet mask pelembap atau calming mask.',
    steps: [
      'Cuci muka hingga bersih dengan gentle cleanser.',
      'Gunakan hydrating toner untuk mempersiapkan kulit.',
      'Aplikasikan sheet mask atau clay mask secara merata.',
      'Rileks 15–20 menit sambil istirahat malam.',
      'Tepuk-tepuk lembut essence yang tersisa hingga meresap.'
    ],
    durationMinutes: 20,
  },

  // 2: Selasa - Sampoan & Exfo wajah sore
  2: {
    dayIndex: 2,
    dayName: 'Selasa',
    title: 'Sampoan & Eksfoliasi Wajah',
    timing: 'Sore',
    scheduledTime: '17:00',
    icon: '🫧',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    description: 'Mencuci rambut secara menyeluruh dan mengangkat sel kulit mati wajah (chemical exfo AHA/BHA lembut) saat mandi sore.',
    steps: [
      'Sisir rambut sebelum keramas dengan air hangat kuku.',
      'Pijat kulit kepala dengan sampo lembut 2-3 menit, bilas bersih.',
      'Gunakan conditioner di batang hingga ujung rambut.',
      'Setelah mandi sore, aplikasikan toner/serum eksfoliasi lembut pada wajah yang kering.',
      'Kunci dengan pelembap (moisturizer) yang menenangkan.'
    ],
    durationMinutes: 35,
  },

  // 3: Rabu - Luluran & Maskeran sore
  3: {
    dayIndex: 3,
    dayName: 'Rabu',
    title: 'Luluran Tubuh & Maskeran Wajah',
    timing: 'Sore',
    scheduledTime: '17:00',
    icon: '🌸',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    description: 'Relaksasi tengah minggu: body scrub/lulur untuk kulit tubuh halus cerah dipadukan dengan masker wajah segar.',
    steps: [
      'Balurkan lulur/body scrub ke seluruh tubuh sebelum mandi sore.',
      'Gosok perlahan dengan gerakan melingkar saat setengah kering.',
      'Bilas tubuh hingga bersih dan aplikasikan body lotion.',
      'Tempelkan sheet mask dingin pada wajah selama 15 menit.',
      'Rasakan tubuh dan wajah segar kembali menjelang magrib.'
    ],
    durationMinutes: 40,
  },

  // 4: Kamis - Sampoan & Exfo sore
  4: {
    dayIndex: 4,
    dayName: 'Kamis',
    title: 'Sampoan & Eksfoliasi Wajah',
    timing: 'Sore',
    scheduledTime: '17:00',
    icon: '✨',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Keramas segar dan eksfoliasi wajah teratur agar pori-pori bersih dari debu aktivitas magang.',
    steps: [
      'Keramas rambut dengan sampo lembut dan bilas bersih.',
      'Gunakan hair mask atau conditioner lembut.',
      'Gunakan gentle chemical exfoliator pada wajah yang bersih.',
      'Oleskan moisturizer tebal untuk menjaga skin barrier.'
    ],
    durationMinutes: 35,
  },

  // 5: Jumat - Maskeran
  5: {
    dayIndex: 5,
    dayName: 'Jumat',
    title: 'Maskeran Wajah',
    timing: 'Malam',
    scheduledTime: '20:30',
    icon: '🧖‍♀️',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Masker wajah untuk menghidrasi dan menutrisi kulit menjelang akhir pekan.',
    steps: [
      'Double cleansing wajah setelah aktivitas seharian.',
      'Gunakan hydrating toner yang menyegarkan.',
      'Aplikasikan masker pilihan (sheet mask atau sleeping mask).',
      'Diamkan 15-20 menit hingga essence menyerap optimal.'
    ],
    durationMinutes: 20,
  },

  // 6: Sabtu - Sampoan & Exfo sore
  6: {
    dayIndex: 6,
    dayName: 'Sabtu',
    title: 'Sampoan & Eksfoliasi Wajah',
    timing: 'Sore',
    scheduledTime: '17:00',
    icon: '🫧',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    description: 'Perawatan rambut bersih dan wajah bebas sel kulit mati untuk menutup pekan dengan bugar.',
    steps: [
      'Keramas santai di sore hari dengan pijatan kulit kepala.',
      'Gunakan conditioner/creambath untuk menutrisi rambut.',
      'Eksfoliasi wajah dengan gentle peeling gel atau toner AHA/BHA.',
      'Lanjutkan dengan hidrasi maksimal menggunakan pelembap.'
    ],
    durationMinutes: 35,
  },

  // 0: Minggu - Istirahat / Jeda perawatan
  0: {
    dayIndex: 0,
    dayName: 'Minggu',
    title: 'Istirahat & Hidrasi Kulit',
    timing: 'Istirahat',
    scheduledTime: '17:00',
    icon: '🍃',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
    description: 'Hari jeda alami tanpa eksfoliasi atau perlakuan berat. Fokus pada kebersihan dasar, minum air cukup, dan istirahat santai.',
    steps: [
      'Mandi bersih seperti biasa.',
      'Gunakan pelembap wajah dan lotion tubuh dasar.',
      'Minum minimal 2 liter air putih.',
      'Istirahat dan siapkan energi untuk pekan berikutnya.'
    ],
    durationMinutes: 10,
  },
};

/**
 * Get the exact weekly self-care routine for any date string (YYYY-MM-DD)
 */
export function getSelfCareForDate(dateStr: string): WeeklySelfCareDay {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu

  return WEEKLY_SELF_CARE_SCHEDULE[dayOfWeek];
}

/**
 * Returns full 7 days weekly schedule starting from Senin to Minggu
 */
export function getFullWeeklySchedule(): WeeklySelfCareDay[] {
  // Order: Senin (1), Selasa (2), Rabu (3), Kamis (4), Jumat (5), Sabtu (6), Minggu (0)
  return [1, 2, 3, 4, 5, 6, 0].map(dayIndex => WEEKLY_SELF_CARE_SCHEDULE[dayIndex]);
}
