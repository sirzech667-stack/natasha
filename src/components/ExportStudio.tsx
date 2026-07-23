import React, { useRef, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  BookOpen,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppState } from '../types';
import { getTranslation } from '../i18n/translations';
import { exportBackupJson, exportToEpub, exportToPdf, exportToTxtOrMd } from '../lib/exportUtils';

interface ExportStudioProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const ExportStudio: React.FC<ExportStudioProps> = ({ state, onUpdateState }) => {
  const activeNovel = state.novels.find((n) => n.id === state.activeNovelId);
  const novelChapters = state.chapters.filter((c) => c.novelId === state.activeNovelId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMessage, setRestoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!activeNovel) {
    return (
      <div className="p-12 text-center text-gray-400 font-serif">
        <Download className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-base font-semibold text-gray-700">Belum Ada Novel Terpilih</p>
        <p className="text-xs text-gray-400 mt-1">Pilih novel dari Rak Buku untuk mengekspor dokumen.</p>
      </div>
    );
  }

  const handleExportPdf = () => {
    exportToPdf(activeNovel, novelChapters);
  };

  const handleExportEpub = async () => {
    await exportToEpub(activeNovel, novelChapters);
  };

  const handleExportTxt = () => {
    exportToTxtOrMd(activeNovel, novelChapters, 'txt');
  };

  const handleExportMd = () => {
    exportToTxtOrMd(activeNovel, novelChapters, 'md');
  };

  const handleBackupJson = () => {
    exportBackupJson(state);
  };

  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && Array.isArray(parsed.novels) && Array.isArray(parsed.chapters)) {
          onUpdateState(() => parsed);
          setRestoreMessage({
            type: 'success',
            text: 'Data berhasil dipulihkan dari cadangan JSON!',
          });
        } else {
          setRestoreMessage({
            type: 'error',
            text: 'Format JSON cadangan tidak valid.',
          });
        }
      } catch (err) {
        console.error(err);
        setRestoreMessage({
          type: 'error',
          text: 'Gagal membaca file JSON.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          {getTranslation(state.language, 'export')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Ekspor karya novel <span className="font-semibold text-gray-800">{activeNovel.title}</span> ke
          format siap cetak / e-book, atau cadangkan seluruh database studio.
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-gray-900">Dokumen PDF Siap Cetak</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Format halaman A4 elegan bersampul judul, nama penulis Lunarica, dan pemisah bab rapi.
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
          >
            {getTranslation(state.language, 'exportPdf')}
          </button>
        </div>

        {/* EPUB Export Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-gray-900">Format EPUB E-Book</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Format buku digital standar yang dibaca di Kindle, Apple Books, Calibre, dan KOReader.
            </p>
          </div>
          <button
            onClick={handleExportEpub}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
          >
            {getTranslation(state.language, 'exportEpub')}
          </button>
        </div>

        {/* TXT / Markdown Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-gray-900">Teks Polos & Markdown</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Unduh salinan naskah mentah format TXT atau Markdown (.md) untuk penerbitan ulang.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportTxt}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-xl transition-colors"
            >
              TXT
            </button>
            <button
              onClick={handleExportMd}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-xl transition-colors"
            >
              Markdown
            </button>
          </div>
        </div>

        {/* Raw Backup JSON Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-indigo-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-gray-900">Cadangan Database Studio (JSON)</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Simpan seluruh data novel, bab, karakter, codex, dan ide ke file cadangan JSON.
            </p>
          </div>
          <button
            onClick={handleBackupJson}
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
          >
            {getTranslation(state.language, 'backupData')}
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-3">
        <h3 className="font-serif font-bold text-base text-gray-900">Pulihkan Data dari JSON</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Pilih file cadangan `.json` yang pernah diekspor sebelumnya untuk memulihkan seluruh perpustakaan Anda.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-medium px-4 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Pilih File JSON Backup</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreJson}
            className="hidden"
          />
        </div>

        {restoreMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              restoreMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {restoreMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{restoreMessage.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
