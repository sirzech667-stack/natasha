import React, { useState } from 'react';
import {
  BookMarked,
  Sparkles,
  Lightbulb,
  Plus,
  Pin,
  Tag,
  Trash2,
  FolderPlus,
  Layers,
  Save,
  Mic,
  X
} from 'lucide-react';
import { AppState, IdeaNote, Volume } from '../types';
import { getTranslation } from '../i18n/translations';

interface StoryBibleProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const StoryBible: React.FC<StoryBibleProps> = ({ state, onUpdateState }) => {
  const activeNovel = state.novels.find((n) => n.id === state.activeNovelId);

  const [activeTab, setActiveTab] = useState<'synopsis' | 'ideas' | 'volumes'>('synopsis');

  // Synopsis Form state
  const [shortSyn, setShortSyn] = useState(activeNovel?.shortSynopsis || '');
  const [longSyn, setLongSyn] = useState(activeNovel?.longSynopsis || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');

  // Idea Form state
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaContent, setIdeaContent] = useState('');
  const [ideaTags, setIdeaTags] = useState('');
  const [ideaColor, setIdeaColor] = useState('#FEF3C7');

  // Volume Form state
  const [volumeTitle, setVolumeTitle] = useState('');

  if (!activeNovel) {
    return (
      <div className="p-12 text-center text-gray-400 font-serif">
        <BookMarked className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-base font-semibold text-gray-700">Belum Ada Novel Terpilih</p>
        <p className="text-xs text-gray-400 mt-1">Pilih novel terlebih dahulu dari Rak Buku.</p>
      </div>
    );
  }

  // Handle Save Synopsis
  const handleSaveSynopsis = () => {
    onUpdateState((prev) => ({
      ...prev,
      novels: prev.novels.map((n) =>
        n.id === activeNovel.id
          ? { ...n, shortSynopsis: shortSyn, longSynopsis: longSyn, updatedAt: new Date().toISOString() }
          : n
      ),
    }));
    alert('Sinopsis berhasil disimpan!');
  };

  // Generate AI Synopsis
  const handleGenerateAiSynopsis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/synopsis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeNovel.title,
          genre: activeNovel.genre,
          keywords: aiKeywords || activeNovel.shortSynopsis,
          length: 'long',
          language: state.language === 'id' ? 'Indonesian' : 'English',
        }),
      });

      const data = await res.json();
      if (data.synopsis) {
        setLongSyn(data.synopsis);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghasilkan sinopsis AI. Pastikan server terhubung.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save New Idea
  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;

    const newIdea: IdeaNote = {
      id: `idea-${Date.now()}`,
      novelId: activeNovel.id,
      title: ideaTitle,
      content: ideaContent,
      tags: ideaTags.split(',').map((t) => t.trim()).filter(Boolean),
      color: ideaColor,
      createdAt: new Date().toISOString(),
      isPinned: false,
    };

    onUpdateState((prev) => ({
      ...prev,
      ideas: [newIdea, ...prev.ideas],
    }));

    setIsIdeaModalOpen(false);
    setIdeaTitle('');
    setIdeaContent('');
    setIdeaTags('');
  };

  const handleTogglePinIdea = (ideaId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      ideas: prev.ideas.map((i) => (i.id === ideaId ? { ...i, isPinned: !i.isPinned } : i)),
    }));
  };

  const handleDeleteIdea = (ideaId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      ideas: prev.ideas.filter((i) => i.id !== ideaId),
    }));
  };

  // Add Volume
  const handleAddVolume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volumeTitle.trim()) return;

    const newVol: Volume = {
      id: `vol-${Date.now()}`,
      novelId: activeNovel.id,
      title: volumeTitle,
      order: state.volumes.filter((v) => v.novelId === activeNovel.id).length + 1,
    };

    onUpdateState((prev) => ({
      ...prev,
      volumes: [...prev.volumes, newVol],
    }));

    setVolumeTitle('');
  };

  const novelIdeas = state.ideas.filter((i) => !i.novelId || i.novelId === activeNovel.id);
  const novelVolumes = state.volumes.filter((v) => v.novelId === activeNovel.id);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            {getTranslation(state.language, 'storyBible')}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Perencanaan sinopsis, bank ide, dan alur volume untuk{' '}
            <span className="font-semibold text-gray-800">{activeNovel.title}</span>.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium border border-gray-200">
          <button
            onClick={() => setActiveTab('synopsis')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'synopsis' ? 'bg-white shadow-xs text-indigo-900 font-semibold' : 'text-gray-600'
            }`}
          >
            Sinopsis
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'ideas' ? 'bg-white shadow-xs text-indigo-900 font-semibold' : 'text-gray-600'
            }`}
          >
            Bank Ide ({novelIdeas.length})
          </button>
          <button
            onClick={() => setActiveTab('volumes')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'volumes' ? 'bg-white shadow-xs text-indigo-900 font-semibold' : 'text-gray-600'
            }`}
          >
            Volume/Arc ({novelVolumes.length})
          </button>
        </div>
      </div>

      {/* SYNOPSIS TAB */}
      {activeTab === 'synopsis' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {getTranslation(state.language, 'shortSynopsis')}
              </h3>
              <button
                onClick={handleSaveSynopsis}
                className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={shortSyn}
              onChange={(e) => setShortSyn(e.target.value)}
              placeholder="Ringkasan 2-3 kalimat menarik untuk blurb belakang buku..."
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-serif text-gray-800"
            />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {getTranslation(state.language, 'longSynopsis')}
              </h3>

              {/* AI Generator Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Kata kunci ide AI..."
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg"
                />
                <button
                  onClick={handleGenerateAiSynopsis}
                  disabled={aiLoading}
                  className="flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{aiLoading ? 'Generasi...' : 'Generasi AI'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={longSyn}
              onChange={(e) => setLongSyn(e.target.value)}
              placeholder="Sinopsis lengkap beserta latar belakang dunia, konflik utama, dan perkembangan karakter..."
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-serif text-gray-800 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* IDEA BANK TAB */}
      {activeTab === 'ideas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-gray-900">Catatan & Memo Spontan</h3>
            <button
              onClick={() => setIsIdeaModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{getTranslation(state.language, 'addIdea')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {novelIdeas.map((idea) => (
              <div
                key={idea.id}
                style={{ backgroundColor: idea.color }}
                className="p-4 rounded-2xl border border-black/5 shadow-xs flex flex-col justify-between space-y-3 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif font-bold text-sm text-gray-900">{idea.title}</h4>
                    <button
                      onClick={() => handleTogglePinIdea(idea.id)}
                      className={`p-1 rounded-full ${
                        idea.isPinned ? 'text-amber-700' : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      <Pin className={`w-3.5 h-3.5 ${idea.isPinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 font-sans mt-2 whitespace-pre-wrap leading-relaxed">
                    {idea.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-gray-500">
                  <div className="flex items-center gap-1 flex-wrap">
                    {idea.tags.map((t, idx) => (
                      <span key={idx} className="bg-black/5 px-2 py-0.5 rounded-full text-gray-700">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VOLUMES / ARCS TAB */}
      {activeTab === 'volumes' && (
        <div className="space-y-4">
          <form onSubmit={handleAddVolume} className="flex gap-2 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
            <input
              type="text"
              required
              placeholder="Judul Volume / Arc (Contoh: Volume 1 - Permulaan)"
              value={volumeTitle}
              onChange={(e) => setVolumeTitle(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-700 shadow-xs shrink-0"
            >
              Tambah Volume
            </button>
          </form>

          <div className="space-y-3">
            {novelVolumes.map((vol, idx) => (
              <div key={vol.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-base text-gray-900">
                    Volume {idx + 1}: {vol.title}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateState((p) => ({
                        ...p,
                        volumes: p.volumes.filter((v) => v.id !== vol.id),
                      }))
                    }
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Idea Modal */}
      {isIdeaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900">Tambah Catatan Ide</h3>
              <button
                onClick={() => setIsIdeaModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIdea} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Judul Catatan *</label>
                <input
                  type="text"
                  required
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="Contoh: Ide Konflik Bab 8..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Isi Catatan</label>
                <textarea
                  rows={4}
                  value={ideaContent}
                  onChange={(e) => setIdeaContent(e.target.value)}
                  placeholder="Tuliskan memo atau gagasan spontan Anda..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tags (Pisahkan koma)</label>
                <input
                  type="text"
                  value={ideaTags}
                  onChange={(e) => setIdeaTags(e.target.value)}
                  placeholder="Climax, PlotTwist, Character"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Warna Kartu</label>
                <div className="flex gap-2">
                  {['#FEF3C7', '#E0E7FF', '#E0F2FE', '#FCE7F3', '#DCFCE7'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setIdeaColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full border ${
                        ideaColor === c ? 'ring-2 ring-indigo-600 scale-110' : 'border-black/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsIdeaModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl shadow-xs"
                >
                  Simpan Ide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
