export type LanguageCode = 'id' | 'en' | 'ja' | 'es' | 'ko' | 'zh' | 'ar' | 'tl';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export type NovelStatus = 'draft' | 'in_progress' | 'completed';

export interface NovelCover {
  type: 'preset' | 'url' | 'dataUrl';
  value: string;
  accentColor?: string;
}

export interface ChapterVersion {
  id: string;
  timestamp: string;
  content: string;
  wordCount: number;
  note?: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  volumeId?: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  characterCount: number;
  status: 'draft' | 'review' | 'final';
  createdAt: string;
  updatedAt: string;
  versions: ChapterVersion[];
}

export interface Volume {
  id: string;
  novelId: string;
  title: string;
  description?: string;
  order: number;
}

export interface CharacterProfile {
  id: string;
  novelId: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: string;
  gender?: string;
  appearance?: string;
  personality?: string;
  goal?: string;
  backstory?: string;
  relationships?: string;
  avatarUrl?: string;
}

export interface WorldbuildingEntry {
  id: string;
  novelId: string;
  title: string;
  category: 'location' | 'faction' | 'item' | 'magic' | 'lore' | 'other';
  description: string;
  imageUrl?: string;
}

export interface IdeaNote {
  id: string;
  novelId?: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface Novel {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  genre: string;
  shortSynopsis: string;
  longSynopsis: string;
  status: NovelStatus;
  isPinned: boolean;
  cover: NovelCover;
  dailyGoalWords: number;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  tags: string[];
}

export interface WritingStats {
  dailyGoal: number;
  todayWordCount: number;
  streakDays: number;
  lastWrittenDate: string;
  totalWordsWritten: number;
}

export interface AppState {
  novels: Novel[];
  volumes: Volume[];
  chapters: Chapter[];
  characters: CharacterProfile[];
  worldEntries: WorldbuildingEntry[];
  ideas: IdeaNote[];
  stats: WritingStats;
  activeNovelId: string | null;
  activeChapterId: string | null;
  language: LanguageCode;
  zenMode: boolean;
  viewMode: 'grid' | 'list';
}

