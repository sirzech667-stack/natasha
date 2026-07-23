import React, { useState, useEffect } from 'react';
import { AppState } from './types';
import { loadAppState, saveAppState } from './lib/storage';
import { LANGUAGES } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Bookshelf } from './components/Bookshelf';
import { Editor } from './components/Editor';
import { StoryBible } from './components/StoryBible';
import { Codex } from './components/Codex';
import { ExportStudio } from './components/ExportStudio';
import { StatsTracker } from './components/StatsTracker';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('bookshelf');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Save state on update
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Set html dir for RTL support (Arabic)
  useEffect(() => {
    const langObj = LANGUAGES.find((l) => l.code === state.language);
    const dir = langObj?.dir || 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = state.language;
  }, [state.language]);

  const handleUpdateState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  };

  const handleSelectNovelFromBookshelf = (novelId: string) => {
    setState((prev) => {
      const firstChapterOfNovel = prev.chapters.find((c) => c.novelId === novelId);
      return {
        ...prev,
        activeNovelId: novelId,
        activeChapterId: firstChapterOfNovel ? firstChapterOfNovel.id : null,
      };
    });
    setActiveTab('editor');
  };

  return (
    <div className="min-h-screen bg-gray-50/60 text-gray-900 font-sans flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        state={state}
        onUpdateState={handleUpdateState}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Body Multi-panel Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Nav Sidebar */}
        <Sidebar
          state={state}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onUpdateState={handleUpdateState}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Workspace Canvas Area */}
        <main className="flex-1 min-w-0 pb-16 md:pb-8">
          {activeTab === 'bookshelf' && (
            <Bookshelf
              state={state}
              onUpdateState={handleUpdateState}
              onSelectNovel={handleSelectNovelFromBookshelf}
            />
          )}

          {activeTab === 'editor' && (
            <Editor state={state} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'storyBible' && (
            <StoryBible state={state} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'codex' && (
            <Codex state={state} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'export' && (
            <ExportStudio state={state} onUpdateState={handleUpdateState} />
          )}

          {activeTab === 'stats' && <StatsTracker state={state} />}
        </main>
      </div>
    </div>
  );
}
