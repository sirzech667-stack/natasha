import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Sparkles,
  History,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Clock,
  FileText,
  Save,
  Plus,
  RotateCcw,
  X,
  ChevronDown
} from 'lucide-react';
import { AppState, Chapter, ChapterVersion } from '../types';
import { getTranslation } from '../i18n/translations';

interface EditorProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const Editor: React.FC<EditorProps> = ({ state, onUpdateState }) => {
  const activeChapter = state.chapters.find((c) => c.id === state.activeChapterId);
  const activeNovel = state.novels.find((n) => n.id === state.activeNovelId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Baru saja');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiMode, setAiMode] = useState<'fix' | 'describe' | 'dialogue'>('fix');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [selectedTextForAi, setSelectedTextForAi] = useState('');

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when active chapter changes
  useEffect(() => {
    if (activeChapter) {
      setTitle(activeChapter.title);
      setContent(activeChapter.content);
    }
  }, [activeChapter?.id]);

  // Real-time calculation
  const calculateCounts = (text: string) => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const readTime = Math.ceil(words / 200); // 200 WPM
    return { words, chars, readTime };
  };

  // Auto-Save Effect
  useEffect(() => {
    if (!activeChapter) return;

    if (title === activeChapter.title && content === activeChapter.content) {
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const { words, chars } = calculateCounts(content);

      onUpdateState((prev) => ({
        ...prev,
        chapters: prev.chapters.map((c) =>
          c.id === activeChapter.id
            ? {
                ...c,
                title,
                content,
                wordCount: words,
                characterCount: chars,
                updatedAt: new Date().toISOString(),
              }
            : c
        ),
      }));

      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 800);

    return () => clearTimeout(timer);
  }, [title, content]);

  // Keyboard Shortcuts (Ctrl+S / Cmd+S, Esc for Zen mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveManualVersion();
      }
      if (e.key === 'Escape' && state.zenMode) {
        onUpdateState((prev) => ({ ...prev, zenMode: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.zenMode, content, title]);

  const saveManualVersion = () => {
    if (!activeChapter) return;
    const { words } = calculateCounts(content);
    const newVersion: ChapterVersion = {
      id: `ver-${Date.now()}`,
      timestamp: new Date().toISOString(),
      content,
      wordCount: words,
      note: `Versi tersimpan manual pada ${new Date().toLocaleTimeString()}`,
    };

    onUpdateState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((c) =>
        c.id === activeChapter.id
          ? {
              ...c,
              versions: [newVersion, ...(c.versions || [])],
            }
          : c
      ),
    }));
  };

  // Formatting helpers for text insertion
  const applyFormat = (prefix: string, suffix: string = '') => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const selected = content.substring(start, end);

    const replacement = `${prefix}${selected || 'teks'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(
          start + prefix.length,
          end + prefix.length + (selected ? 0 : 4)
        );
      }
    }, 50);
  };

  const handleSceneDivider = () => {
    applyFormat('\n\n***\n\n');
  };

  // AI Assistant Call
  const handleRunAi = async () => {
    const textToProcess = selectedTextForAi || content;
    if (!textToProcess.trim()) return;

    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToProcess,
          mode: aiMode,
          language: state.language === 'id' ? 'Indonesian' : 'English',
        }),
      });

      const data = await res.json();
      if (data.enhancedText) {
        setAiResult(data.enhancedText);
      } else {
        setAiResult('Gagal memproses teks.');
      }
    } catch (err) {
      console.error(err);
      setAiResult('Error memanggil AI assistant. Pastikan server terhubung.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResultToEditor = () => {
    if (!aiResult) return;
    if (selectedTextForAi && editorRef.current) {
      // Replace selected text
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const newContent = content.substring(0, start) + aiResult + content.substring(end);
      setContent(newContent);
    } else {
      setContent(aiResult);
    }
    setIsAiModalOpen(false);
  };

  const currentCounts = calculateCounts(content);

  if (!activeChapter || !activeNovel) {
    return (
      <div className="p-12 text-center text-gray-400 font-serif">
        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-base font-semibold text-gray-700">Tidak ada bab yang dipilih</p>
        <p className="text-xs text-gray-400 mt-1">
          Pilih bab dari sidebar atau buat bab baru dari tombol tambah bab.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-full flex flex-col transition-all ${
        state.zenMode
          ? 'fixed inset-0 z-50 bg-white p-6 md:p-12 overflow-y-auto'
          : 'p-4 md:p-8 max-w-5xl mx-auto'
      }`}
    >
      {/* Floating Exit Zen Mode Bar */}
      {state.zenMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-gray-200 text-xs">
          <span className="text-gray-500 font-sans">Mode Zen (Tekan Esc untuk Keluar)</span>
          <button
            onClick={() => onUpdateState((p) => ({ ...p, zenMode: false }))}
            className="p-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Header Info Bar */}
      {!state.zenMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200/80 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{activeNovel.title}</span>
            <span>/</span>
            <span className="text-indigo-600 font-medium">{activeChapter.title}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-xs">
            {/* Auto Save Status */}
            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  saveStatus === 'saved' ? 'text-emerald-500' : 'text-amber-500 animate-spin'
                }`}
              />
              <span>
                {saveStatus === 'saved'
                  ? `${getTranslation(state.language, 'autoSaveSaved')} (${lastSavedTime})`
                  : getTranslation(state.language, 'autoSaving')}
              </span>
            </div>

            {/* Chapter Status Selector */}
            <select
              value={activeChapter.status}
              onChange={(e) => {
                const newStatus = e.target.value as 'draft' | 'review' | 'final';
                onUpdateState((prev) => ({
                  ...prev,
                  chapters: prev.chapters.map((c) =>
                    c.id === activeChapter.id ? { ...c, status: newStatus } : c
                  ),
                }));
              }}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
            >
              <option value="draft">Draf</option>
              <option value="review">Review</option>
              <option value="final">Final</option>
            </select>

            {/* Version History Button */}
            <button
              onClick={() => setIsVersionModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Riwayat ({activeChapter.versions?.length || 0})</span>
            </button>

            {/* AI Assistant Trigger */}
            <button
              onClick={() => {
                if (editorRef.current) {
                  const start = editorRef.current.selectionStart;
                  const end = editorRef.current.selectionEnd;
                  setSelectedTextForAi(content.substring(start, end));
                }
                setIsAiModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-medium rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Polish</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor Formatting Toolbar */}
      {!state.zenMode && (
        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-xs mb-4 flex items-center gap-1 flex-wrap text-gray-700 text-xs">
          <button
            onClick={() => applyFormat('**', '**')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 font-bold"
            title="Tebal (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('*', '*')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 italic"
            title="Miring (Italics)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('<u>', '</u>')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
            title="Garis Bawah (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('~~', '~~')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
            title="Coret (Strikethrough)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          <button
            onClick={() => applyFormat('# ')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('## ')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('> ')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
            title="Kutipan (Blockquote)"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          <button
            onClick={() => applyFormat('- ')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
            title="Daftar Poin"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyFormat('1. ')}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700"
            title="Daftar Angka"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1" />

          <button
            onClick={handleSceneDivider}
            className="px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg font-mono text-[11px] text-gray-600 border border-gray-200"
            title="Pemisah Adegan (***)"
          >
            *** Divider
          </button>
        </div>
      )}

      {/* Main Interactive Writing Area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 md:p-10 flex flex-col space-y-4">
        {/* Chapter Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul Bab..."
          className="w-full font-serif font-bold text-2xl md:text-3xl text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-indigo-500 focus:outline-none pb-2 transition-colors"
        />

        {/* Text Content Area */}
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Mulai menulis cerita Anda di sini..."
          className="w-full flex-1 min-h-[450px] font-serif text-base md:text-lg text-gray-800 leading-relaxed focus:outline-none resize-none bg-transparent placeholder-gray-300"
        />

        {/* Footer Word Count Stats Bar */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-sans">
          <div className="flex items-center gap-4">
            <div>
              <span className="font-semibold text-gray-900">{currentCounts.words.toLocaleString()}</span>{' '}
              {getTranslation(state.language, 'wordCount')}
            </div>
            <div>
              <span className="font-semibold text-gray-900">{currentCounts.chars.toLocaleString()}</span>{' '}
              {getTranslation(state.language, 'charCount')}
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-gray-900">{currentCounts.readTime}</span>{' '}
              {getTranslation(state.language, 'readingTime')}
            </div>
          </div>

          <button
            onClick={saveManualVersion}
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Versi</span>
          </button>
        </div>
      </div>

      {/* Version History Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {getTranslation(state.language, 'versionHistory')}
              </h3>
              <button
                onClick={() => setIsVersionModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(!activeChapter.versions || activeChapter.versions.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-8">
                Belum ada riwayat draf manual yang tersimpan.
              </p>
            ) : (
              <div className="space-y-3 text-xs">
                {activeChapter.versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between text-gray-500">
                      <span className="font-medium text-gray-800">
                        {new Date(ver.timestamp).toLocaleString()}
                      </span>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border">
                        {ver.wordCount} kata
                      </span>
                    </div>

                    <p className="font-serif text-gray-600 line-clamp-3 bg-white p-2 rounded border border-gray-100">
                      {ver.content}
                    </p>

                    <button
                      onClick={() => {
                        setContent(ver.content);
                        setIsVersionModalOpen(false);
                      }}
                      className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold pt-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{getTranslation(state.language, 'restoreVersion')}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-serif font-bold text-lg text-gray-900">
                  AI Prose Enhancer
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <label className="block font-semibold text-gray-700">Pilih Mode Pemolesan AI:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAiMode('fix')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    aiMode === 'fix'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  Grammar & Ejaan
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode('describe')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    aiMode === 'describe'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  Deskripsi Sensoris
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode('dialogue')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    aiMode === 'dialogue'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-semibold'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  Poles Dialog
                </button>
              </div>

              <div>
                <span className="text-[11px] text-gray-500 block mb-1">
                  {selectedTextForAi ? 'Teks Yang Dipilih:' : 'Seluruh Teks Bab:'}
                </span>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 max-h-24 overflow-y-auto font-serif text-gray-600 italic">
                  {selectedTextForAi || content || 'Belum ada teks.'}
                </div>
              </div>

              <button
                onClick={handleRunAi}
                disabled={aiLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{aiLoading ? 'Memproses dengan AI...' : 'Jalankan Pemolesan AI'}</span>
              </button>

              {aiResult && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-800">Hasil Pemolesan AI:</span>
                  <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 font-serif text-gray-800 leading-relaxed max-h-40 overflow-y-auto">
                    {aiResult}
                  </div>

                  <button
                    onClick={applyAiResultToEditor}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-xs"
                  >
                    Terapkan Hasil ke Editor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
