import React, { useState } from 'react';
import {
  Grid,
  List,
  Search,
  Plus,
  Star,
  BookOpen,
  MoreVertical,
  Check,
  Image as ImageIcon,
  Trash2,
  Edit,
  FolderPlus,
  TrendingUp,
  X
} from 'lucide-react';
import { AppState, Novel, NovelStatus } from '../types';
import { getTranslation } from '../i18n/translations';
import { ELEGANT_PRESET_COVERS } from '../lib/storage';

interface BookshelfProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onSelectNovel: (novelId: string) => void;
}

export const Bookshelf: React.FC<BookshelfProps> = ({
  state,
  onUpdateState,
  onSelectNovel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('Lunarica');
  const [formGenre, setFormGenre] = useState('Fantasy Romance');
  const [formGoal, setFormGoal] = useState(50000);
  const [formSynopsis, setFormSynopsis] = useState('');
  const [formCoverType, setFormCoverType] = useState<'preset' | 'url' | 'dataUrl'>('preset');
  const [formCoverVal, setFormCoverVal] = useState(ELEGANT_PRESET_COVERS[0]);

  // Unique list of genres
  const genres = Array.from(new Set(state.novels.map((n) => n.genre).filter(Boolean)));

  // Filtering novels
  const filteredNovels = state.novels.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.shortSynopsis && n.shortSynopsis.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'all' || n.genre === selectedGenre;
    const matchesStatus = selectedStatus === 'all' || n.status === selectedStatus;
    const matchesPinned = !pinnedOnly || n.isPinned;

    return matchesSearch && matchesGenre && matchesStatus && matchesPinned;
  });

  const handleOpenCreateModal = () => {
    setEditingNovel(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormAuthor('Lunarica');
    setFormGenre('Fantasy Romance');
    setFormGoal(50000);
    setFormSynopsis('');
    setFormCoverType('preset');
    setFormCoverVal(ELEGANT_PRESET_COVERS[0]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (novel: Novel, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNovel(novel);
    setFormTitle(novel.title);
    setFormSubtitle(novel.subtitle || '');
    setFormAuthor(novel.author);
    setFormGenre(novel.genre);
    setFormGoal(novel.dailyGoalWords || 50000);
    setFormSynopsis(novel.shortSynopsis || '');
    setFormCoverType(novel.cover.type);
    setFormCoverVal(novel.cover.value);
    setIsCreateModalOpen(true);
  };

  const handleSaveNovel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingNovel) {
      // Edit existing
      onUpdateState((prev) => ({
        ...prev,
        novels: prev.novels.map((n) =>
          n.id === editingNovel.id
            ? {
                ...n,
                title: formTitle,
                subtitle: formSubtitle,
                author: formAuthor,
                genre: formGenre,
                dailyGoalWords: Number(formGoal),
                shortSynopsis: formSynopsis,
                cover: { type: formCoverType, value: formCoverVal },
                updatedAt: new Date().toISOString(),
              }
            : n
        ),
      }));
    } else {
      // Create new
      const newNovel: Novel = {
        id: `novel-${Date.now()}`,
        title: formTitle,
        subtitle: formSubtitle,
        author: formAuthor,
        genre: formGenre,
        shortSynopsis: formSynopsis,
        longSynopsis: formSynopsis,
        status: 'draft',
        isPinned: false,
        cover: { type: formCoverType, value: formCoverVal },
        dailyGoalWords: Number(formGoal),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [formGenre],
      };

      onUpdateState((prev) => ({
        ...prev,
        novels: [newNovel, ...prev.novels],
        activeNovelId: newNovel.id,
      }));
    }

    setIsCreateModalOpen(false);
  };

  const handleTogglePin = (novelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateState((prev) => ({
      ...prev,
      novels: prev.novels.map((n) =>
        n.id === novelId ? { ...n, isPinned: !n.isPinned } : n
      ),
    }));
  };

  const handleDeleteNovel = (novelId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(getTranslation(state.language, 'confirmDelete'))) {
      onUpdateState((prev) => ({
        ...prev,
        novels: prev.novels.filter((n) => n.id !== novelId),
        chapters: prev.chapters.filter((c) => c.novelId !== novelId),
        activeNovelId: prev.activeNovelId === novelId ? null : prev.activeNovelId,
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setFormCoverType('dataUrl');
          setFormCoverVal(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to calculate total words for a novel
  const getNovelWords = (novelId: string) => {
    return state.chapters
      .filter((c) => c.novelId === novelId)
      .reduce((sum, c) => sum + c.wordCount, 0);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Search Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">
            {getTranslation(state.language, 'dashboard')}
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Studio penulisan novel oleh Lunarica. Kelola karya, draf, dan publikasi Anda.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(state.language, 'newNovel')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getTranslation(state.language, 'searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Genre Filter */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">{getTranslation(state.language, 'allGenres')}</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">{getTranslation(state.language, 'allStatus')}</option>
            <option value="draft">{getTranslation(state.language, 'draft')}</option>
            <option value="in_progress">{getTranslation(state.language, 'in_progress')}</option>
            <option value="completed">{getTranslation(state.language, 'completed')}</option>
          </select>

          {/* Pinned Toggle */}
          <button
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              pinnedOnly
                ? 'bg-amber-50 border-amber-200 text-amber-700 font-medium'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${pinnedOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">{getTranslation(state.language, 'pinnedOnly')}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => onUpdateState((p) => ({ ...p, viewMode: 'grid' }))}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                state.viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-gray-500'
              }`}
              title={getTranslation(state.language, 'viewGrid')}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateState((p) => ({ ...p, viewMode: 'list' }))}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                state.viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600 font-semibold' : 'text-gray-500'
              }`}
              title={getTranslation(state.language, 'viewList')}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Novels Cards Display */}
      {filteredNovels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-gray-700">Belum Ada Novel</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Tidak ada novel yang cocok dengan kriteria pencarian atau belum ada novel yang dibuat.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-sm hover:bg-indigo-700 transition-colors"
          >
            {getTranslation(state.language, 'newNovel')}
          </button>
        </div>
      ) : state.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNovels.map((novel) => {
            const words = getNovelWords(novel.id);
            const isSelected = state.activeNovelId === novel.id;

            return (
              <div
                key={novel.id}
                onClick={() => onSelectNovel(novel.id)}
                className={`group bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-gray-200/80 hover:border-gray-300'
                }`}
              >
                {/* Cover Header */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={novel.cover.value}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold px-2.5 py-1 bg-white/90 backdrop-blur-md text-gray-900 rounded-full shadow-xs">
                      {novel.genre}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleTogglePin(novel.id, e)}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                          novel.isPinned
                            ? 'bg-amber-500 text-white'
                            : 'bg-black/30 text-white/80 hover:bg-black/50'
                        }`}
                        title={getTranslation(state.language, novel.isPinned ? 'unpinned' : 'pinned')}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={(e) => handleOpenEditModal(novel, e)}
                        className="p-1.5 rounded-full bg-black/30 text-white/80 hover:bg-black/50 backdrop-blur-md transition-colors"
                        title={getTranslation(state.language, 'edit')}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteNovel(novel.id, e)}
                        className="p-1.5 rounded-full bg-black/30 text-white/80 hover:bg-red-600 backdrop-blur-md transition-colors"
                        title={getTranslation(state.language, 'delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Cover Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-serif font-bold text-lg leading-snug truncate drop-shadow-sm">
                      {novel.title}
                    </h3>
                    <p className="text-xs text-white/80 truncate font-sans">By {novel.author}</p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {novel.shortSynopsis || 'Belum ada sinopsis singkat.'}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div>
                      <span className="font-semibold text-gray-900">{words.toLocaleString()}</span>{' '}
                      {getTranslation(state.language, 'wordCount')}
                    </div>
                    <span className="capitalize text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {getTranslation(state.language, novel.status)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-xs">
          {filteredNovels.map((novel) => {
            const words = getNovelWords(novel.id);
            return (
              <div
                key={novel.id}
                onClick={() => onSelectNovel(novel.id)}
                className="p-4 hover:bg-gray-50/80 transition-colors cursor-pointer flex items-center gap-4"
              >
                <img
                  src={novel.cover.value}
                  alt={novel.title}
                  className="w-12 h-16 object-cover rounded-lg shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-gray-900 truncate">
                      {novel.title}
                    </h3>
                    {novel.isPinned && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    By {novel.author} • <span className="text-gray-700 font-medium">{novel.genre}</span>
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-1">{novel.shortSynopsis}</p>
                </div>

                <div className="hidden sm:flex flex-col items-end shrink-0 text-xs">
                  <span className="font-semibold text-gray-900">{words.toLocaleString()} kata</span>
                  <span className="text-[10px] text-gray-400 capitalize">{getTranslation(state.language, novel.status)}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleOpenEditModal(novel, e)}
                    className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteNovel(novel.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create / Edit Novel */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h3 className="font-serif font-bold text-xl text-gray-900">
                {editingNovel ? 'Edit Pengaturan Novel' : 'Buat Novel Baru'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNovel} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {getTranslation(state.language, 'novelTitle')} *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Natasha: The Moonlit Chronicles"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle / Vol</label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Contoh: Volume I - Whispers of Aethelgard"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {getTranslation(state.language, 'authorName')}
                  </label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {getTranslation(state.language, 'genre')}
                  </label>
                  <input
                    type="text"
                    value={formGenre}
                    onChange={(e) => setFormGenre(e.target.value)}
                    placeholder="Fantasy, Romance, Mystery..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {getTranslation(state.language, 'shortSynopsis')}
                </label>
                <textarea
                  rows={3}
                  value={formSynopsis}
                  onChange={(e) => setFormSynopsis(e.target.value)}
                  placeholder="Tuliskan ringkasan 2-3 kalimat menarik tentang novel Anda..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Cover Selection */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  {getTranslation(state.language, 'coverUploadTitle')}
                </label>

                <div className="space-y-3">
                  {/* Preset Gallery */}
                  <div>
                    <span className="text-[11px] text-gray-500 block mb-1.5">Pilih Preset Sampul:</span>
                    <div className="grid grid-cols-6 gap-2">
                      {ELEGANT_PRESET_COVERS.map((url, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setFormCoverType('preset');
                            setFormCoverVal(url);
                          }}
                          className={`h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all relative ${
                            formCoverVal === url
                              ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {formCoverVal === url && (
                            <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center text-white">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct URL or File */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <span className="text-[11px] text-gray-500 block mb-1">Atau Gunakan Direct URL:</span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formCoverType === 'url' ? formCoverVal : ''}
                        onChange={(e) => {
                          setFormCoverType('url');
                          setFormCoverVal(e.target.value);
                        }}
                        className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-500 block mb-1">Atau Upload Gambar Galeri:</span>
                      <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-xs text-gray-700">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {getTranslation(state.language, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
                >
                  {getTranslation(state.language, 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

