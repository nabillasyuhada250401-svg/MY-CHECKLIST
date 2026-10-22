import React, { useState } from 'react';
import { getSelfCareForDate, getFullWeeklySchedule } from '../services/selfCareRotation';
import { Sparkles, Calendar, CheckCircle2, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';

interface SelfCareCardProps {
  dateStr: string;
  isDone: boolean;
  onToggleDone: () => void;
  onSelectDayOfWeek?: (targetDayIndex: number) => void;
}

export const SelfCareCard: React.FC<SelfCareCardProps> = ({
  dateStr,
  isDone,
  onToggleDone,
}) => {
  const currentActivity = getSelfCareForDate(dateStr);
  const [showSteps, setShowSteps] = useState(false);
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(true);
  const fullWeeklyList = getFullWeeklySchedule();

  const isRestDay = currentActivity.timing === 'Istirahat';

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Top Banner */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-rose-50/80 via-purple-50/40 to-teal-50/60 border-b border-stone-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-rose-500" />
          <div>
            <h2 className="font-bold text-stone-800 text-sm sm:text-base tracking-wide uppercase flex items-center gap-2">
              Jadwal Perawatan Diri
              <span className="text-[11px] font-semibold normal-case px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                Jadwal Mingguan Rutin
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowWeeklySchedule(!showWeeklySchedule)}
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors flex items-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{showWeeklySchedule ? 'Tutup Jadwal' : 'Lihat Jadwal Senin-Minggu'}</span>
        </button>
      </div>

      <div className="p-4 sm:p-5">
        {/* Main Routine Highlight for Selected Date */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-br from-stone-50 via-white to-stone-50 border border-stone-200">
          <div className="flex items-start gap-3.5">
            <div className="text-3xl p-2.5 rounded-2xl bg-white shadow-xs border border-stone-100 flex items-center justify-center">
              {currentActivity.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Hari {currentActivity.dayName}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-stone-900">
                  {currentActivity.title}
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentActivity.badgeColor}`}>
                  Waktu: {currentActivity.timing}
                </span>
                {currentActivity.timing !== 'Istirahat' && (
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    Pukul {currentActivity.scheduledTime} (±{currentActivity.durationMinutes} mnt)
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-xl leading-relaxed">
                {currentActivity.description}
              </p>
            </div>
          </div>

          {/* Action Checkbox */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
            {isRestDay ? (
              <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
                Hari Istirahat Kulit
              </span>
            ) : (
              <button
                onClick={onToggleDone}
                className={`w-full md:w-auto px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isDone
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-white text-stone-700 border border-stone-300 hover:border-emerald-500 hover:bg-emerald-50/50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-white' : 'text-stone-400'}`} />
                <span>{isDone ? 'Sudah Selesai Hari Ini' : 'Tandai Selesai'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Step-by-step Guide Toggle */}
        {currentActivity.steps && currentActivity.steps.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
            >
              <Info className="w-3.5 h-3.5 text-rose-500" />
              <span>Panduan Langkah {currentActivity.title}</span>
              {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSteps && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5 animate-fadeIn">
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  {currentActivity.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* 7-Day Weekly Master Schedule (Senin - Minggu) */}
        {showWeeklySchedule && (
          <div className="mt-4 pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Jadwal Mingguan Perawatan Diri Anda:
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {fullWeeklyList.map((plan) => {
                const isCurrentToday = plan.dayIndex === currentActivity.dayIndex;

                return (
                  <div
                    key={plan.dayIndex}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCurrentToday
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className={isCurrentToday ? 'text-emerald-950 font-extrabold' : 'text-stone-700'}>
                        {plan.dayName}
                      </span>
                      <span>{plan.icon}</span>
                    </div>
                    <div className="font-semibold text-xs text-stone-900 leading-snug">
                      {plan.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${plan.badgeColor}`}>
                        {plan.timing}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/70 text-[11px] text-purple-900 leading-relaxed flex items-center justify-between">
              <span>
                ✨ <strong>Ringkasan:</strong> Senin (Masker malam) • Selasa (Sampoan & Exfo sore) • Rabu (Luluran & Masker sore) • Kamis (Sampoan & Exfo) • Jumat (Masker) • Sabtu (Sampoan & Exfo) • Minggu (Istirahat).
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
