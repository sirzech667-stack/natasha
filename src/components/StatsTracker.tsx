import React from 'react';
import { BarChart3, Target, Flame, BookOpen, Clock, Calendar, Trophy } from 'lucide-react';
import { AppState } from '../types';
import { getTranslation } from '../i18n/translations';

interface StatsTrackerProps {
  state: AppState;
}

export const StatsTracker: React.FC<StatsTrackerProps> = ({ state }) => {
  const activeNovel = state.novels.find((n) => n.id === state.activeNovelId);
  const novelChapters = state.chapters.filter((c) => c.novelId === state.activeNovelId);

  const totalWords = state.chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const totalChapters = state.chapters.length;

  const dailyGoal = activeNovel?.dailyGoalWords || 1000;
  const todayWords = state.stats.todayWordCount || 242;
  const goalPercent = Math.min(100, Math.round((todayWords / dailyGoal) * 100));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          {getTranslation(state.language, 'stats')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Lacak produktivitas penulisan harian dan analisis pencapaian target kata Anda.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Kata</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-gray-900">{totalWords.toLocaleString()}</div>
          <p className="text-[11px] text-gray-400">Seluruh karya novel</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Hari Ini</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-gray-900">{todayWords} / {dailyGoal}</div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Streak Penulisan</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif font-bold text-2xl text-gray-900">{state.stats.streakDays} Hari</div>
          <p className="text-[11px] text-amber-600 font-medium">Konsistensi hebat!</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bab</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-serif font-bold text-2xl text-gray-900">{totalChapters} Bab</div>
          <p className="text-[11px] text-gray-400">Dalam database studio</p>
        </div>
      </div>

      {/* Chapter Word Breakdown */}
      {activeNovel && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-lg text-gray-900">
            Rincian Jumlah Kata per Bab — {activeNovel.title}
          </h3>

          <div className="space-y-3">
            {novelChapters.map((chap) => {
              const maxWordsInChapters = Math.max(...novelChapters.map((c) => c.wordCount), 1);
              const barWidth = Math.min(100, Math.round((chap.wordCount / maxWordsInChapters) * 100));

              return (
                <div key={chap.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-700">
                    <span className="font-medium truncate">{chap.title}</span>
                    <span className="font-mono text-gray-500">{chap.wordCount} kata</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
