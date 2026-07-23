import React from 'react';
import {
  Library,
  FileEdit,
  BookMarked,
  Users,
  Download,
  BarChart3,
  Plus,
  ChevronRight,
  BookOpen,
  Layers,
  X
} from 'lucide-react';
import { AppState, Chapter } from '../types';
import { getTranslation } from '../i18n/translations';

export type ActiveTab = 'bookshelf' | 'editor' | 'storyBible' | 'codex' | 'export' | 'stats';

interface SidebarProps {
  state: AppState;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  state,
  activeTab,
  onSelectTab,
  onUpdateState,
  isMobileOpen,
  onCloseMobile,
}) => {
  const activeNovel = state.novels.find((n) => n.id === state.activeNovelId);
  const novelChapters = state.chapters.filter((c) => c.novelId === state.activeNovelId);

  const navItems = [
    { id: 'bookshelf', labelKey: 'dashboard', icon: Library },
    { id: 'editor', labelKey: 'editor', icon: FileEdit },
    { id: 'storyBible', labelKey: 'storyBible', icon: BookMarked },
    { id: 'codex', labelKey: 'codex', icon: Users },
    { id: 'export', labelKey: 'export', icon: Download },
    { id: 'stats', labelKey: 'stats', icon: BarChart3 },
  ];

  const handleSelectChapter = (chapId: string) => {
    onUpdateState((prev) => ({ ...prev, activeChapterId: chapId }));
    onSelectTab('editor');
    if (isMobileOpen) onCloseMobile();
  };

  const handleCreateNewChapter = () => {
    if (!state.activeNovelId) return;
    const newOrder = novelChapters.length + 1;
    const newChap: Chapter = {
      id: `chap-${Date.now()}`,
      novelId: state.activeNovelId,
      title: `Bab ${newOrder}: Judul Baru`,
      content: '',
      order: newOrder,
      wordCount: 0,
      characterCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [],
    };

    onUpdateState((prev) => ({
      ...prev,
      chapters: [...prev.chapters, newChap],
      activeChapterId: newChap.id,
    }));
    onSelectTab('editor');
    if (isMobileOpen) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 text-gray-800">
      {/* Mobile drawer header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between md:hidden">
        <div className="font-serif font-bold text-lg text-gray-900">
          Natasha Studio
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Nav Links */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id as ActiveTab);
                if (isMobileOpen) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span className="truncate">{getTranslation(state.language, item.labelKey)}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-3 my-2 border-t border-gray-100" />

      {/* Active Novel Chapters Quick Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeNovel ? (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="truncate">{activeNovel.title}</span>
              </div>
              <button
                onClick={handleCreateNewChapter}
                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title={getTranslation(state.language, 'addChapter')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {novelChapters.length === 0 ? (
                <p className="text-xs text-gray-400 italic px-2 py-1">
                  Belum ada bab.
                </p>
              ) : (
                novelChapters.map((chap) => {
                  const isChapActive = state.activeChapterId === chap.id && activeTab === 'editor';
                  return (
                    <button
                      key={chap.id}
                      onClick={() => handleSelectChapter(chap.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between group transition-colors ${
                        isChapActive
                          ? 'bg-indigo-50 text-indigo-900 font-semibold border-l-2 border-indigo-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate pr-2">{chap.title}</span>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {chap.wordCount}w
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            {getTranslation(state.language, 'noNovelSelected')}
          </div>
        )}
      </div>

      {/* Footer Branding Credit */}
      <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50">
        <p className="text-[11px] text-gray-400 font-serif">
          Natasha by <span className="font-semibold text-gray-700">Lunarica</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
