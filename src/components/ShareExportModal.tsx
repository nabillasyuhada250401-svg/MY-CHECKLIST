import React, { useState } from 'react';
import { DayData } from '../types';
import { generateFormattedShareText } from '../services/storageService';
import { downloadICSFile } from '../services/calendarService';
import { X, Copy, Check, MessageSquare, Download, Share2 } from 'lucide-react';

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DayData;
}

export const ShareExportModal: React.FC<ShareExportModalProps> = ({
  isOpen,
  onClose,
  dayData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const textToShare = generateFormattedShareText(dayData);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  };

  const handleDownloadICS = () => {
    downloadICSFile(dayData.date, dayData.items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Bagikan & Ekspor Checklist</h3>
              <p className="text-xs text-stone-500">Format teks siap kirim WhatsApp atau file Kalender</p>
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">Pratinjau Teks:</span>
            <button
              onClick={handleCopy}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Semua Teks'}</span>
            </button>
          </div>

          {/* Formatted Text Preview */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 font-mono text-xs text-stone-800 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed shadow-inner">
            {textToShare}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Kirim ke WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadICS}
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-stone-200"
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span>Unduh File .ics</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
