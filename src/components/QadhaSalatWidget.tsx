import React from 'react';
import { QadhaCounts } from '../types';
import { Minus, Plus, CheckCircle, ShieldCheck } from 'lucide-react';
import { playChimeSound } from '../services/reminderService';

interface QadhaSalatWidgetProps {
  qadha: QadhaCounts;
  onChange: (newQadha: QadhaCounts) => void;
}

const PRAYERS: Array<{ key: keyof QadhaCounts; label: string; icon: string; desc: string }> = [
  { key: 'subuh', label: 'Qadha Subuh', icon: '🌅', desc: '2 Rakaat' },
  { key: 'zuhur', label: 'Qadha Zuhur', icon: '☀️', desc: '4 Rakaat' },
  { key: 'asar', label: 'Qadha Asar', icon: '🌤️', desc: '4 Rakaat' },
  { key: 'magrib', label: 'Qadha Magrib', icon: '🌇', desc: '3 Rakaat' },
  { key: 'isya', label: 'Qadha Isya', icon: '🌙', desc: '4 Rakaat' },
];

export const QadhaSalatWidget: React.FC<QadhaSalatWidgetProps> = ({ qadha, onChange }) => {
  const totalQadha = qadha.subuh + qadha.zuhur + qadha.asar + qadha.magrib + qadha.isya;

  const handleIncrement = (key: keyof QadhaCounts) => {
    onChange({
      ...qadha,
      [key]: qadha[key] + 1,
    });
  };

  const handleDecrement = (key: keyof QadhaCounts) => {
    if (qadha[key] > 0) {
      playChimeSound();
      onChange({
        ...qadha,
        [key]: qadha[key] - 1,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-stone-50 border-b border-stone-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📿</span>
          <h2 className="font-bold text-stone-800 text-sm sm:text-base tracking-wide uppercase">
            Qadha Salat
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
              totalQadha === 0
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            {totalQadha === 0 ? 'Alhamdulillah Nihil' : `Total: ${totalQadha} Waktu`}
          </span>
        </div>
      </div>

      {/* Prayers List */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRAYERS.map(({ key, label, icon, desc }) => {
            const count = qadha[key];
            const hasDebt = count > 0;

            return (
              <div
                key={key}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  hasDebt
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-stone-200 bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{icon}</span>
                    <span className="font-semibold text-xs text-stone-800">{label.replace('Qadha ', '')}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">{desc}</span>
                </div>

                <div className="my-3 text-center">
                  <span className={`text-2xl font-bold font-mono ${hasDebt ? 'text-amber-700' : 'text-stone-700'}`}>
                    {count}
                  </span>
                  <span className="text-xs text-stone-500 ml-1">kali</span>
                </div>

                {/* Counter controls */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                  <button
                    onClick={() => handleDecrement(key)}
                    disabled={count === 0}
                    className="flex-1 py-1 px-2 rounded-lg bg-white border border-stone-300 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-white text-stone-700 text-xs font-semibold flex items-center justify-center transition-colors shadow-2xs"
                    title="Tunaikan 1 Qadha"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleIncrement(key)}
                    className="flex-1 py-1 px-2 rounded-lg bg-white border border-stone-300 hover:bg-amber-50 hover:border-amber-500 hover:text-amber-800 text-stone-700 text-xs font-semibold flex items-center justify-center transition-colors shadow-2xs"
                    title="Tambah 1 Hutang Qadha"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Islamic Note */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-xs text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Niat Qadha:</span> &quot;Ushalli fardhas-subhi (atau zuhri/asri/maghribi/isya&apos;i) rak&apos;ataini/arba&apos;a rak&apos;aatin qadaan lillahi ta&apos;ala.&quot;
            <span className="text-emerald-700 block mt-0.5">
              Bayarlah salat yang terlewat sesegera mungkin di sela-sela waktu luang agar hati selalu tenang.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
