import React, { useState } from 'react';
import {
  Users,
  Globe2,
  Plus,
  Shield,
  Crown,
  Sparkles,
  MapPin,
  Package,
  BookOpen,
  Trash2,
  Edit,
  X,
  UserCheck
} from 'lucide-react';
import { AppState, CharacterProfile, WorldbuildingEntry } from '../types';
import { getTranslation } from '../i18n/translations';

interface CodexProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export const Codex: React.FC<CodexProps> = ({ state, onUpdateState }) => {
  const activeNovel = state.novels.find((n) => n.id === state.activeNovelId);

  const [activeTab, setActiveTab] = useState<'characters' | 'world'>('characters');

  // Character Form state
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<CharacterProfile | null>(null);
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState<'protagonist' | 'antagonist' | 'supporting' | 'minor'>('protagonist');
  const [charAge, setCharAge] = useState('');
  const [charAppearance, setCharAppearance] = useState('');
  const [charPersonality, setCharPersonality] = useState('');
  const [charGoal, setCharGoal] = useState('');
  const [charBackstory, setCharBackstory] = useState('');

  // Worldbuilding Form state
  const [isWorldModalOpen, setIsWorldModalOpen] = useState(false);
  const [editingWorld, setEditingWorld] = useState<WorldbuildingEntry | null>(null);
  const [worldTitle, setWorldTitle] = useState('');
  const [worldCategory, setWorldCategory] = useState<'location' | 'faction' | 'item' | 'magic' | 'lore' | 'other'>('location');
  const [worldDesc, setWorldDesc] = useState('');

  if (!activeNovel) {
    return (
      <div className="p-12 text-center text-gray-400 font-serif">
        <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-base font-semibold text-gray-700">Belum Ada Novel Terpilih</p>
        <p className="text-xs text-gray-400 mt-1">Pilih novel dari Rak Buku untuk membuka Codex.</p>
      </div>
    );
  }

  const novelChars = state.characters.filter((c) => c.novelId === activeNovel.id);
  const novelWorld = state.worldEntries.filter((w) => w.novelId === activeNovel.id);

  // Handle Character Save
  const handleSaveChar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charName.trim()) return;

    if (editingChar) {
      onUpdateState((prev) => ({
        ...prev,
        characters: prev.characters.map((c) =>
          c.id === editingChar.id
            ? {
                ...c,
                name: charName,
                role: charRole,
                age: charAge,
                appearance: charAppearance,
                personality: charPersonality,
                goal: charGoal,
                backstory: charBackstory,
              }
            : c
        ),
      }));
    } else {
      const newChar: CharacterProfile = {
        id: `char-${Date.now()}`,
        novelId: activeNovel.id,
        name: charName,
        role: charRole,
        age: charAge,
        appearance: charAppearance,
        personality: charPersonality,
        goal: charGoal,
        backstory: charBackstory,
      };

      onUpdateState((prev) => ({
        ...prev,
        characters: [...prev.characters, newChar],
      }));
    }

    setIsCharModalOpen(false);
  };

  const handleOpenEditChar = (char: CharacterProfile) => {
    setEditingChar(char);
    setCharName(char.name);
    setCharRole(char.role);
    setCharAge(char.age || '');
    setCharAppearance(char.appearance || '');
    setCharPersonality(char.personality || '');
    setCharGoal(char.goal || '');
    setCharBackstory(char.backstory || '');
    setIsCharModalOpen(true);
  };

  const handleDeleteChar = (charId: string) => {
    if (confirm('Hapus profil karakter ini?')) {
      onUpdateState((prev) => ({
        ...prev,
        characters: prev.characters.filter((c) => c.id !== charId),
      }));
    }
  };

  // Handle World Save
  const handleSaveWorld = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldTitle.trim()) return;

    if (editingWorld) {
      onUpdateState((prev) => ({
        ...prev,
        worldEntries: prev.worldEntries.map((w) =>
          w.id === editingWorld.id
            ? {
                ...w,
                title: worldTitle,
                category: worldCategory,
                description: worldDesc,
              }
            : w
        ),
      }));
    } else {
      const newEntry: WorldbuildingEntry = {
        id: `wb-${Date.now()}`,
        novelId: activeNovel.id,
        title: worldTitle,
        category: worldCategory,
        description: worldDesc,
      };

      onUpdateState((prev) => ({
        ...prev,
        worldEntries: [...prev.worldEntries, newEntry],
      }));
    }

    setIsWorldModalOpen(false);
  };

  const handleOpenEditWorld = (entry: WorldbuildingEntry) => {
    setEditingWorld(entry);
    setWorldTitle(entry.title);
    setWorldCategory(entry.category);
    setWorldDesc(entry.description);
    setIsWorldModalOpen(true);
  };

  const handleDeleteWorld = (entryId: string) => {
    if (confirm('Hapus entri dunia ini?')) {
      onUpdateState((prev) => ({
        ...prev,
        worldEntries: prev.worldEntries.filter((w) => w.id !== entryId),
      }));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            {getTranslation(state.language, 'codex')}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Database karakter dan worldbuilding untuk{' '}
            <span className="font-semibold text-gray-800">{activeNovel.title}</span>.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-medium border border-gray-200">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'characters'
                ? 'bg-white shadow-xs text-indigo-900 font-semibold'
                : 'text-gray-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Karakter ({novelChars.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('world')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'world' ? 'bg-white shadow-xs text-indigo-900 font-semibold' : 'text-gray-600'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>Worldbuilding ({novelWorld.length})</span>
          </button>
        </div>
      </div>

      {/* CHARACTERS TAB */}
      {activeTab === 'characters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-gray-900">Daftar Tokoh Novel</h3>
            <button
              onClick={() => {
                setEditingChar(null);
                setCharName('');
                setCharRole('protagonist');
                setCharAge('');
                setCharAppearance('');
                setCharPersonality('');
                setCharGoal('');
                setCharBackstory('');
                setIsCharModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{getTranslation(state.language, 'addCharacter')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {novelChars.map((char) => (
              <div
                key={char.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-serif font-bold text-lg text-gray-900">{char.name}</h4>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                      {char.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditChar(char)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChar(char.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 font-sans">
                  {char.appearance && (
                    <p>
                      <strong className="text-gray-800">Penampilan:</strong> {char.appearance}
                    </p>
                  )}
                  {char.personality && (
                    <p>
                      <strong className="text-gray-800">Kepribadian:</strong> {char.personality}
                    </p>
                  )}
                  {char.goal && (
                    <p>
                      <strong className="text-gray-800">Tujuan / Goal:</strong> {char.goal}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORLDBUILDING TAB */}
      {activeTab === 'world' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-gray-900">Entri Dunia & Lore</h3>
            <button
              onClick={() => {
                setEditingWorld(null);
                setWorldTitle('');
                setWorldCategory('location');
                setWorldDesc('');
                setIsWorldModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{getTranslation(state.language, 'addWorldEntry')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {novelWorld.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-base text-gray-900">{entry.title}</h4>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {entry.category}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{entry.description}</p>
                <div className="pt-2 flex justify-end gap-1">
                  <button
                    onClick={() => handleOpenEditWorld(entry)}
                    className="p-1 text-gray-400 hover:text-gray-700"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorld(entry.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Character Modal */}
      {isCharModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingChar ? 'Edit Karakter' : 'Tambah Karakter Baru'}
              </h3>
              <button
                onClick={() => setIsCharModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChar} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Karakter *</label>
                <input
                  type="text"
                  required
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Peran / Role</label>
                  <select
                    value={charRole}
                    onChange={(e) => setCharRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="protagonist">Protagonist</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="supporting">Supporting</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Usia / Umur</label>
                  <input
                    type="text"
                    value={charAge}
                    onChange={(e) => setCharAge(e.target.value)}
                    placeholder="20 tahun..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Penampilan Fisik</label>
                <textarea
                  rows={2}
                  value={charAppearance}
                  onChange={(e) => setCharAppearance(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sifat & Kepribadian</label>
                <textarea
                  rows={2}
                  value={charPersonality}
                  onChange={(e) => setCharPersonality(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tujuan / Goal Utamanya</label>
                <textarea
                  rows={2}
                  value={charGoal}
                  onChange={(e) => setCharGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCharModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl shadow-xs"
                >
                  Simpan Karakter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* World Modal */}
      {isWorldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-gray-900">
                {editingWorld ? 'Edit Entri Dunia' : 'Tambah Entri Dunia Baru'}
              </h3>
              <button
                onClick={() => setIsWorldModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorld} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Judul Entri *</label>
                <input
                  type="text"
                  required
                  value={worldTitle}
                  onChange={(e) => setWorldTitle(e.target.value)}
                  placeholder="Contoh: Kerajaan Lunarica, Kristal Selene..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kategori</label>
                <select
                  value={worldCategory}
                  onChange={(e) => setWorldCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="location">Lokasi / Wilayah</option>
                  <option value="faction">Klan / Faksi / Kerajaan</option>
                  <option value="item">Item / Senjata Pusaka</option>
                  <option value="magic">Sihir / Teknologi</option>
                  <option value="lore">Sejarah / Lore</option>
                  <option value="other">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deskripsi Lengkap</label>
                <textarea
                  rows={5}
                  value={worldDesc}
                  onChange={(e) => setWorldDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWorldModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-xl shadow-xs"
                >
                  Simpan Entri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
