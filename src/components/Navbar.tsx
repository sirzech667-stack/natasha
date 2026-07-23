import React from 'react';
import { BookOpen, Sparkles, Feather, Maximize2, Menu, Globe, ChevronDown, Check } from 'lucide-react';
import { AppState, LanguageCode } from '../types';
import { LANGUAGES, getTranslation } from '../i18n/translations';

interface NavbarProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ state, onUpdateState, onToggleMobileMenu }) => {
  const [langDropdownOpen, setLangDropdownOpen] = React.useState(false);
  const activeNovel = state.novels.find((n) => n.id === state.activeNovelId);
  const currentLang = LANGUAGES.find((l) => l.code === state.language) || LANGUAGES[0];

  const handleSelectLanguage = (code: LanguageCode) => {
    onUpdateState((prev) => ({ ...prev, language: code }));
    setLangDropdownOpen(false);
  };

  const toggleZenMode = () => {
    onUpdateState((prev) => ({ ...prev, zenMode: !prev.zenMode }));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-900 via-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-gray-900">
                  Natasha
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 uppercase tracking-wider">
                  {getTranslation(state.language, 'byLunarica')}
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block -mt-1 font-sans">
                {getTranslation(state.language, 'appSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Active novel indicator (Desktop) */}
        {activeNovel && (
          <div className="hidden lg:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-700 max-w-xs truncate">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-medium truncate">{activeNovel.title}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <span className="text-base leading-none">{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.nativeName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {langDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setLangDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200/80 py-1.5 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Select Language / Bahasa
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleSelectLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-indigo-50/70 transition-colors ${
                          state.language === lang.code
                            ? 'bg-indigo-50/90 text-indigo-900 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.nativeName}</span>
                        </div>
                        {state.language === lang.code && (
                          <Check className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Zen Mode Button */}
          <button
            onClick={toggleZenMode}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all"
            title={getTranslation(state.language, 'zenMode')}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {getTranslation(state.language, 'zenMode')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
