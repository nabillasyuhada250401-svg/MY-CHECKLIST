import React, { useState } from 'react';
import { HafalanRecord } from '../types';
import { formatIndonesianDate } from '../services/storageService';
import { X, BookOpen, Plus, Trash2, Copy, Check, Calendar, Search } from 'lucide-react';

interface HafalanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: HafalanRecord[];
  onAddRecord: (record: { date: string; surat: string; ayat: string; notes?: string }) => void;
  onDeleteRecord: (id: string) => void;
  currentDateStr: string;
}

export const HafalanReportModal: React.FC<HafalanReportModalProps> = ({
  isOpen,
  onClose,
  records,
  onAddRecord,
  onDeleteRecord,
  currentDateStr,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState(currentDateStr);
  const [newSurat, setNewSurat] = useState('');
  const [newAyat, setNewAyat] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredRecords = records.filter(r =>
    r.surat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.ayat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurat.trim()) return;

    onAddRecord({
      date: newDate,
      surat: newSurat.trim(),
      ayat: newAyat.trim(),
      notes: newNotes.trim() || undefined,
    });

    setNewSurat('');
    setNewAyat('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleCopyReport = async () => {
    const lines = [
      '📖 LAPORAN CAPAIAN HAFALAN AL-QUR’AN',
      `Tanggal Laporan: ${formatIndonesianDate(new Date().toISOString().split('T')[0])}`,
      `Total Catatan: ${records.length} riwayat`,
      '',
      '--- DAFTAR RIWAYAT HAFALAN ---',
      ...records.map((r, idx) => `${idx + 1}. ${formatIndonesianDate(r.date)}: ${r.surat}${r.ayat ? ` (Ayat ${r.ayat})` : ''}${r.notes ? ` — ${r.notes}` : ''}`),
      '',
      'Alhamdulillah, terus istiqamah menjaga hafalan dalam salat.'
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const latestRecord = records[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Laporan & Riwayat Hafalan</h3>
              <p className="text-xs text-stone-500">Rekap progres hafalan Al-Qur’an yang telah dipelajari</p>
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
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Summary Stats Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Total Riwayat Hafalan
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-950 mt-1 block">
                {records.length} <span className="text-xs font-normal text-emerald-700">catatan</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200">
              <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider block">
                Hafalan Terakhir
              </span>
              <span className="text-xs font-bold text-teal-950 mt-1 block truncate">
                {latestRecord ? `${latestRecord.surat} ${latestRecord.ayat ? `(${latestRecord.ayat})` : ''}` : 'Belum ada'}
              </span>
              <span className="text-[10px] text-teal-700">
                {latestRecord ? formatIndonesianDate(latestRecord.date) : '-'}
              </span>
            </div>
          </div>

          {/* Actions & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari surat atau ayat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 bg-stone-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1"
                title="Salin rekap semua hafalan"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Rekap'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Catatan</span>
              </button>
            </div>
          </div>

          {/* Add Record Form */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="p-3.5 rounded-xl bg-stone-50 border border-emerald-300 space-y-2.5 animate-fadeIn">
              <div className="font-bold text-xs text-emerald-900">Catat Capaian Hafalan Baru:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Tanggal:</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-lg p-1.5 bg-white text-stone-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Surat:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Surat An-Naba’"
                    value={newSurat}
                    onChange={(e) => setNewSurat(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-lg p-1.5 bg-white text-stone-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Ayat:</label>
                  <input
                    type="text"
                    placeholder="Contoh: 1-15"
                    value={newAyat}
                    onChange={(e) => setNewAyat(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-lg p-1.5 bg-white text-stone-800"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Catatan tambahan (opsional)"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs border border-stone-300 rounded-lg p-1.5 bg-white text-stone-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold shadow-xs"
                >
                  Simpan Hafalan
                </button>
              </div>
            </form>
          )}

          {/* Timeline of Records */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Riwayat Capaian ({filteredRecords.length})
            </div>

            {filteredRecords.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 italic bg-stone-50 rounded-xl border border-stone-200">
                Belum ada riwayat hafalan yang tercatat.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {filteredRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-900">{rec.surat}</span>
                        {rec.ayat && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Ayat {rec.ayat}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {formatIndonesianDate(rec.date)}
                        </span>
                        {rec.notes && <span>• {rec.notes}</span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="Hapus catatan ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            Tutup Laporan
          </button>
        </div>
      </div>
    </div>
  );
};
