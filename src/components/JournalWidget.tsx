import React from 'react';
import { DailyJournal } from '../types';
import { BookOpen, Heart, Sparkles, Bookmark, BarChart2 } from 'lucide-react';

interface JournalWidgetProps {
  journal: DailyJournal;
  onChange: (newJournal: DailyJournal) => void;
  onOpenHafalanReport?: () => void;
}

const SURAH_SUGGESTIONS = [
  'Surat Al-Mulk',
  'Surat As-Sajdah',
  'Surat Al-Kahfi',
  'Surat Ar-Rahman',
  'Surat Al-Waqi’ah',
  'Surat An-Naba’',
  'Surat An-Nazi’at',
  'Surat Al-Insan',
  'Juz 30 (Surat Pendek)',
];

const GRATITUDE_PROMPTS = [
  'Kesehatan dan tenaga untuk berangkat magang tepat waktu',
  'Kemudahan belajar CPNS di kantor saat istirahat',
  'Ketenangan hati membaca hafalan Al-Qur’an dalam salat',
  'Keluarga dan rezeki makan siang yang berkah',
];

export const JournalWidget: React.FC<JournalWidgetProps> = ({
  journal,
  onChange,
  onOpenHafalanReport,
}) => {
  const handleSuratChange = (surat: string) => {
    onChange({
      ...journal,
      hafalanSurat: surat,
    });
  };

  const handleAyatChange = (ayat: string) => {
    onChange({
      ...journal,
      hafalanAyat: ayat,
    });
  };

  const handleSyukurChange = (text: string) => {
    onChange({
      ...journal,
      bersyukurHariIni: text,
    });
  };

  const addPromptToGratitude = (prompt: string) => {
    const current = journal.bersyukurHariIni.trim();
    if (!current || current === '-') {
      handleSyukurChange(`• ${prompt}`);
    } else {
      handleSyukurChange(`${current}\n• ${prompt}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Hafalan Baru Card - Murni Surat & Ayat */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col justify-between">
        <div>
          <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-stone-50 border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-stone-800 text-sm tracking-wide uppercase">
                Hafalan Al-Qur’an
              </h2>
            </div>

            {onOpenHafalanReport && (
              <button
                type="button"
                onClick={onOpenHafalanReport}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/90 hover:bg-emerald-200/90 px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lihat Laporan</span>
              </button>
            )}
          </div>

          <div className="p-4 space-y-3">
            {/* Input Nama Surat & Ayat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Surat yang Dihafal:
                </label>
                <input
                  type="text"
                  value={journal.hafalanSurat}
                  onChange={(e) => handleSuratChange(e.target.value)}
                  placeholder="Contoh: Surat An-Naba’"
                  className="w-full text-xs sm:text-sm border border-stone-300 rounded-xl px-3 py-2 bg-stone-50/50 text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ayat:
                </label>
                <input
                  type="text"
                  value={journal.hafalanAyat}
                  onChange={(e) => handleAyatChange(e.target.value)}
                  placeholder="Contoh: 1-15"
                  className="w-full text-xs sm:text-sm border border-stone-300 rounded-xl px-3 py-2 bg-stone-50/50 text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Quick Suggestions for Surah */}
            <div className="pt-1">
              <p className="text-[10px] text-stone-500 mb-1.5 flex items-center gap-1 font-medium">
                <Bookmark className="w-3 h-3 text-stone-400" /> Pilih Cepat Surat:
              </p>
              <div className="flex flex-wrap gap-1">
                {SURAH_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuratChange(s)}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 transition-colors border border-stone-200/70"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary preview */}
            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 flex items-center justify-between">
              <span className="text-[11px] text-emerald-800">Bacaan salat hari ini:</span>
              <span className="font-bold text-xs">
                {journal.hafalanSurat ? (
                  `${journal.hafalanSurat}${journal.hafalanAyat ? ` (Ayat ${journal.hafalanAyat})` : ''}`
                ) : (
                  <span className="text-stone-400 font-normal italic">Belum dicatat</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-stone-50/70 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
          <span className="italic">
            🤲 Hafalan otomatis tersimpan di riwayat laporan & dibaca dalam salat.
          </span>
          {onOpenHafalanReport && (
            <button
              type="button"
              onClick={onOpenHafalanReport}
              className="text-emerald-700 hover:underline font-semibold text-[11px]"
            >
              Buka Riwayat →
            </button>
          )}
        </div>
      </div>

      {/* Bersyukur Hari Ini Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col justify-between">
        <div>
          <div className="px-4 py-3.5 bg-gradient-to-r from-rose-50/80 via-amber-50/40 to-stone-50 border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
              <h2 className="font-bold text-stone-800 text-sm tracking-wide uppercase">
                Bersyukur Hari Ini
              </h2>
            </div>

            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Refleksi Kalbu
            </span>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Hal yang disyukuri hari ini:
              </label>
              <textarea
                value={journal.bersyukurHariIni}
                onChange={(e) => handleSyukurChange(e.target.value)}
                placeholder="• Bersyukur badan segar saat berangkat magang&#10;• Bersyukur bisa fokus latihan CPNS&#10;• Bersyukur atas ketenangan saat salat tepat waktu..."
                rows={3}
                className="w-full text-xs sm:text-sm border border-stone-300 rounded-xl p-2.5 bg-stone-50/50 text-stone-800 outline-none focus:ring-2 focus:ring-rose-400 transition-all resize-none font-medium"
              />
            </div>

            {/* Inspiration Prompt Pills */}
            <div>
              <p className="text-[10px] text-stone-500 mb-1 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-500" /> Inspirasi Cepat:
              </p>
              <div className="flex flex-wrap gap-1">
                {GRATITUDE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addPromptToGratitude(p)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-rose-50 hover:text-rose-800 text-stone-600 transition-colors truncate max-w-full"
                    title={p}
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-stone-50/70 border-t border-stone-100 text-[11px] text-stone-500 italic">
          🌸 &quot;La-in syakartum la-azidannakum&quot; (Jika kamu bersyukur, pasti Kami akan menambah nikmat-Mu).
        </div>
      </div>
    </div>
  );
};
