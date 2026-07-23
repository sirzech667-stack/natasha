import { AppState, Chapter, CharacterProfile, IdeaNote, Novel, Volume, WorldbuildingEntry, WritingStats } from '../types';

const STORAGE_KEY = 'natasha_novel_studio_v1';

export const ELEGANT_PRESET_COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', // Classic Leather Book
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80', // Open Book Magic
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80', // Dark Fantasy Library
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80', // Minimalist Quill & Ink
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80', // Abstract Artistic Lines
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80', // Moody Castle Fog
];

export const INITIAL_NOVEL: Novel = {
  id: 'novel-natasha-01',
  title: 'Natasha: The Moonlit Chronicles',
  subtitle: 'Volume I - Whispers of Aethelgard',
  author: 'Lunarica',
  genre: 'Fantasy Romance',
  shortSynopsis: 'Di bawah cahaya bulan perak, Natasha menemukan rahasia kuno yang menghubungkan takdirnya dengan takdir kerajaan Lunarica.',
  longSynopsis: 'Ketika gerhana purnama merah tiba, Natasha, seorang pemeta bintang muda di kota perak Lunarica, menemukan manuskrip rahasia yang terkunci selama lima ratus tahun. Di dalamnya tersembunyi ramalan tentang kehancuran dan kebangkitan kembali klan bulan perak. Bersama Kaelen, seorang pengawal bayangan yang bersumpah melindunginya, Natasha harus bertualang melintasi Benua Aethelgard sebelum kegelapan abadi menguasai segalanya.',
  status: 'in_progress',
  isPinned: true,
  cover: {
    type: 'preset',
    value: ELEGANT_PRESET_COVERS[0],
    accentColor: '#4F46E5',
  },
  dailyGoalWords: 1000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['Magic', 'Moonlight', 'Destiny', 'Lunarica'],
};

export const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap-1',
    novelId: 'novel-natasha-01',
    title: 'Bab 1: Bisikan di Pemetaan Bintang',
    content: `Malam di menara pemetaan bintang Lunarica selalu terasa lebih dingin dari biasanya. Natasha membetulkan jubah sutra peraknya, menatap teleskop kuno yang terarah langsung ke rasi bintang Selene.

"Bintang ketujuh bersinar redup malam ini," bisiknya pelan pada keheningan ruangan bertingkat tiga itu.

Di meja kayunya, lembaran-lembaran perkamen kuno berserakan. Sebuah piringan perunggu berukir glyph Kuno mendadak bergetar halus. Karbon dari lilin aromatik membubung ke udara, membentuk pola spiral yang tidak biasa.

Natasha mendekati piringan itu. Ketika jarinya menyentuh permukaan dingin berukir bintang, sebuah gelombang cahaya biru zamrud terpancar meledak lembut, memenuhi seluruh ruangan. Suara bisikan halus—bukan bahasa manusia biasa—bergema di sudut kepalanya.

"Langkah pertama telah dimulai, Sang Pemeta..."

Pintu kayu oak menara mendadak terbuka lebar. Sosok tinggi berbalut zirah hitam malam berdiri di ambang pintu, pedangnya terhunus setengah. Itu adalah Kaelen, Pengawal Bayangan Kerajaan.`,
    order: 1,
    wordCount: 128,
    characterCount: 842,
    status: 'final',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [
      {
        id: 'ver-1-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        content: `Draf pertama bab 1: Natasha melihat bintang perak bergerak misterius di atas menara Lunarica.`,
        wordCount: 15,
        note: 'Initial outline draft',
      }
    ],
  },
  {
    id: 'chap-2',
    novelId: 'novel-natasha-01',
    title: 'Bab 2: Ksatria di Ambang Pintu',
    content: `Kaelen menyarungkan kembali pedangnya begitu mengenali sosok di balik meja astronomi. Tatapan matanya yang tajam sehitam obsidian melunakkan sedikit kewaspadaannya.

"Kau melanggar jam malam akademi, Natasha," kata Kaelen dengan suara berat yang tertahan. "Penjaga istana luar sedang berpatroli. Jika Lord Vane menemukanmu di sini..."

"Lihat ini, Kaelen," sela Natasha, tidak mengindahkan peringatan sang ksatria. Tangannya menunjuk pada piringan perunggu yang kini berpendar emas hangat. "Piringan Selene bereaksi. Ini tidak pernah terjadi sejak era Perang Purnama."

Kaelen melangkah mendekat. Langkah kakinya yang mantap terdengar bergaung di lantai marmer. Ketika ia menatap piringan tersebut, ekspresi wajahnya berubah tegang. Rahangnya mengatup rapat.

"Ini bukan pertanda baik," ujar Kaelen pelan. "Segel di Lembah Aethelgard... telah retak."`,
    order: 2,
    wordCount: 114,
    characterCount: 760,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [],
  },
];

export const INITIAL_CHARACTERS: CharacterProfile[] = [
  {
    id: 'char-1',
    novelId: 'novel-natasha-01',
    name: 'Natasha Lunarica',
    role: 'protagonist',
    age: '20 tahun',
    appearance: 'Rambut perak sepanjang pinggang, mata kebiruan berbinar seperti komet, selalu mengenakan jubah astronomi bersulam benang perak.',
    personality: 'Cerdas, serba ingin tahu, tekun, memiliki ketenangan alami saat menghadapi situasi berbahaya.',
    goal: 'Membuka rahasia manuskrip Selene dan menyelamatkan kerajaan dari kegelapan abadi.',
    backstory: 'Anak tunggal dari mantan pemeta bintang istana yang hilang secara misterius saat gerhana 10 tahun lalu.',
  },
  {
    id: 'char-2',
    novelId: 'novel-natasha-01',
    name: 'Kaelen Shadowveil',
    role: 'protagonist',
    age: '24 tahun',
    appearance: 'Postur tinggi tegap, rambut hitam pekat bergelombang, mata obsidian, memiliki bekas luka tipis di alis kirinya.',
    personality: 'Setia, pendiam, protektif, menyembunyikan kehangatan di balik wujud penampakan luarnya yang dingin.',
    goal: 'Melindungi Natasha dengan taruhan nyawanya dan menebus kesalahan masa lalu keluarganya.',
  },
];

export const INITIAL_WORLDBUILDING: WorldbuildingEntry[] = [
  {
    id: 'wb-1',
    novelId: 'novel-natasha-01',
    title: 'Kerajaan Lunarica',
    category: 'location',
    description: 'Kerajaan megah berarsitektur marmer putih dan perak yang dibangun di atas dataran tinggi Aethelgard. Terkenal dengan Menara Astrologi dan Menara Bulan.',
  },
  {
    id: 'wb-2',
    novelId: 'novel-natasha-01',
    title: 'Kristal Selene',
    category: 'item',
    description: 'Kristal langka bermuatan sihir bulan. Digunakan untuk memberi tenaga pada piringan ramalan dan senjata pusaka para pengawal bayangan.',
  },
];

export const INITIAL_IDEAS: IdeaNote[] = [
  {
    id: 'idea-1',
    novelId: 'novel-natasha-01',
    title: 'Plot Twist Climax Bab 12',
    content: 'Ternyata Kaelen menyimpan pecahan Kristal Selene yang kedua di dalam liontin peninggalan ayahnya.',
    tags: ['Plot Twist', 'Climax', 'Kaelen'],
    color: '#FEF3C7',
    createdAt: new Date().toISOString(),
    isPinned: true,
  },
  {
    id: 'idea-2',
    novelId: 'novel-natasha-01',
    title: 'Aroma & Suasana Lembah Aethelgard',
    content: 'Gunakan deskripsi pinus basah, embun perak, dan suara lonceng angin di perbatasan istana.',
    tags: ['Atmosphere', 'Worldbuilding'],
    color: '#E0E7FF',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_STATS: WritingStats = {
  dailyGoal: 1000,
  todayWordCount: 242,
  streakDays: 4,
  lastWrittenDate: new Date().toISOString().split('T')[0],
  totalWordsWritten: 242,
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.novels) && parsed.novels.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to parse LocalStorage state, loading initial defaults", err);
  }

  return {
    novels: [INITIAL_NOVEL],
    volumes: [],
    chapters: INITIAL_CHAPTERS,
    characters: INITIAL_CHARACTERS,
    worldEntries: INITIAL_WORLDBUILDING,
    ideas: INITIAL_IDEAS,
    stats: INITIAL_STATS,
    activeNovelId: INITIAL_NOVEL.id,
    activeChapterId: INITIAL_CHAPTERS[0].id,
    language: 'id',
    zenMode: false,
    viewMode: 'grid',
  };
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save state to LocalStorage:", err);
  }
}

