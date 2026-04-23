import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Book, Search, Bookmark, Scroll, ChevronRight, Share2, Sparkles, ChevronLeft, Loader2 } from 'lucide-react';

interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

const swahiliBooks: Record<string, string> = {
  'Genesis': 'Mwanzo', 'Exodus': 'Kutoka', 'Leviticus': 'Mambo ya Walawi', 'Numbers': 'Hesabu', 'Deuteronomy': 'Kumbukumbu la Torati',
  'Joshua': 'Yoshua', 'Judges': 'Waamuzi', 'Ruth': 'Ruthu', '1 Samuel': '1 Samweli', '2 Samuel': '2 Samweli',
  '1 Kings': '1 Wafalme', '2 Kings': '2 Wafalme', '1 Chronicles': '1 Mambo ya Nyakati', '2 Chronicles': '2 Mambo ya Nyakati',
  'Ezra': 'Ezra', 'Nehemiah': 'Nehemia', 'Esther': 'Esta', 'Job': 'Ayubu', 'Psalms': 'Zaburi', 'Proverbs': 'Methali',
  'Ecclesiastes': 'Mhubiri', 'Song of Solomon': 'Wimbo Ulio Bora', 'Isaiah': 'Isaya', 'Jeremiah': 'Yeremia',
  'Lamentations': 'Maombolezo', 'Ezekiel': 'Ezekieli', 'Daniel': 'Danieli', 'Hosea': 'Hosea', 'Joel': 'Yoeli',
  'Amos': 'Amosi', 'Obadiah': 'Obadia', 'Jonah': 'Yona', 'Micah': 'Mika', 'Nahum': 'Nahumu', 'Habakkuk': 'Habakuki',
  'Zephaniah': 'Sefania', 'Haggai': 'Hagai', 'Zechariah': 'Zekaria', 'Malachi': 'Malaki',
  'Matthew': 'Mathayo', 'Mark': 'Marko', 'Luke': 'Luka', 'John': 'Yohana', 'Acts': 'Matendo ya Mitume', 'Romans': 'Warumi',
  '1 Corinthians': '1 Wakorintho', '2 Corinthians': '2 Wakorintho', 'Galatians': 'Wagalatia', 'Ephesians': 'Waefeso',
  'Philippians': 'Wafilipi', 'Colossians': 'Wakolosai', '1 Thessalonians': '1 Wathesalonike', '2 Thessalonians': '2 Wathesalonike',
  '1 Timothy': '1 Timotheo', '2 Timothy': '2 Timotheo', 'Titus': 'Tito', 'Philemon': 'Filemoni', 'Hebrews': 'Waebrania',
  'James': 'Yakobo', '1 Peter': '1 Petro', '2 Peter': '2 Petro', '1 John': '1 Yohana', '2 John': '2 Yohana',
  '3 John': '3 Yohana', 'Jude': 'Yuda', 'Revelation': 'Ufunuo wa Yohana'
};

const CHAPTER_COUNTS: Record<string, number> = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
  'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
  'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1,
  'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
  'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28, 'Romans': 16,
  '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
  'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3,
  '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13,
  'James': 5, '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
  'Jude': 1, 'Revelation': 22
};

export const BibleReader = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [chapterVerses, setChapterVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  
  const books = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', 
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
    'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
    '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John',
    '3 John', 'Jude', 'Revelation'
  ];

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      // Validate chapter bounds to prevent 404 errors
      const maxChapters = CHAPTER_COUNTS[selectedBook] || 25;
      if (selectedChapter > maxChapters) {
        setChapterVerses([]);
        setError(language === 'sw' ? `Kitabu hiki kina milango ${maxChapters} pekee.` : `This book only has ${maxChapters} chapters.`);
        return;
      }
      fetchChapter(selectedBook, selectedChapter, language);
    }
  }, [selectedBook, selectedChapter, language]);

  const fetchChapter = async (bookName: string, chapter: number, lang: 'en' | 'sw') => {
    setLoading(true);
    setError(null);
    try {
      if (lang === 'sw') {
        const bookIndex = books.indexOf(bookName) + 1;
        const res = await fetch(`https://bolls.life/get-chapter/SUV/${bookIndex}/${chapter}/`);
        if (!res.ok) {
           if (res.status === 404) throw new Error(language === 'sw' ? 'Mlango haukupatikana.' : 'Chapter not found.');
           throw new Error('Could not fetch Swahili scripture');
        }
        const data = await res.json();
        
        const standardizedVerses = data.map((v: any) => ({
          verse: v.verse || v.pk, 
          text: v.text,
          book_name: bookName,
          chapter: chapter
        }));
        setChapterVerses(standardizedVerses);
      } else {
        const formattedBook = bookName.replace(/ /g, '+');
        const res = await fetch(`https://bible-api.com/${formattedBook}+${chapter}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error(language === 'sw' ? 'Mlango haukupatikana.' : 'Chapter not found.');
          throw new Error('Could not fetch scripture');
        }
        const data = await res.json();
        setChapterVerses(data.verses || []);
      }
    } catch (err: any) {
      console.error('Bible Fetch Error:', err);
      setError(err.message || 'An error occurred while loading scripture');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(b => b.toLowerCase().includes(searchTerm.toLowerCase()));

  const featuredPassages = language === 'sw' ? [
    { ref: "Zaburi 23", book: "Psalms", chapter: 23, title: "Zaburi ya Mchungaji", excerpt: "Bwana ndiye mchungaji wangu, sitapungukiwa na kitu..." },
    { ref: "Yohana 3", book: "John", chapter: 3, title: "Upendo Mkuu", excerpt: "Kwa maana jinsi hii Mungu aliupenda ulimwengu, hata akamtoa Mwanawe pekee..." },
    { ref: "1 Wakorintho 13", book: "1 Corinthians", chapter: 13, title: "Njia ya Upendo", excerpt: "Nijaposema kwa lugha za wanadamu na za malaika, kama sina upendo..." },
  ] : [
    { ref: "Psalm 23", book: "Psalms", chapter: 23, title: "The Shepherd Psalm", excerpt: "The Lord is my shepherd; I shall not want..." },
    { ref: "John 3", book: "John", chapter: 3, title: "The Great Love", excerpt: "For God so loved the world, that he gave his only begotten Son..." },
    { ref: "1 Corinthians 13", book: "1 Corinthians", chapter: 13, title: "The Way of Love", excerpt: "If I speak in the tongues of men and of angels, but have not love..." },
  ];

  const renderContent = () => {
    if (!selectedBook) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
             <Scroll size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Open the Living Word</h3>
          <p className="text-slate-400 text-sm max-w-sm">
            Search or select a book from the sidebar to begin your journey through the scriptures.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {featuredPassages.map((p, i) => (
              <div 
                key={i} 
                onClick={() => {setSelectedBook(p.book); setSelectedChapter(p.chapter)}}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left hover:bg-white hover:shadow-md transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase tracking-widest">{p.ref}</span>
                <p className="text-xs text-slate-600 italic line-clamp-2">"{p.excerpt}"</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedBook && !selectedChapter) {
      const chapterCount = CHAPTER_COUNTS[selectedBook] || 25;

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{language === 'sw' ? swahiliBooks[selectedBook] || selectedBook : selectedBook}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                {language === 'sw' ? 'Chagua Mlango' : 'Select a Chapter'}
              </p>
            </div>
            <button onClick={() => setSelectedBook(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
              {language === 'sw' ? 'Rejea kwenye Vitabu' : 'Back to Books'}
            </button>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
             {Array.from({ length: chapterCount }).map((_, i) => (
               <button 
                key={i}
                onClick={() => setSelectedChapter(i + 1)}
                className="aspect-square flex items-center justify-center bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm"
               >
                 {i + 1}
               </button>
             ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => {setSelectedChapter(null); setSelectedVerse(null)}} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {language === 'sw' ? swahiliBooks[selectedBook!] || selectedBook : selectedBook} {selectedChapter}
              </h3>
              <div className="flex items-center gap-4 mt-1">
                <button 
                  disabled={selectedChapter === 1}
                  onClick={() => {setSelectedChapter(prev => prev! - 1); setSelectedVerse(null)}}
                  className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest disabled:opacity-30"
                >
                  {language === 'sw' ? 'Mlango Uliopita' : 'Prev Chapter'}
                </button>
                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                <button 
                  onClick={() => {setSelectedChapter(prev => prev! + 1); setSelectedVerse(null)}}
                  className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest"
                >
                  {language === 'sw' ? 'Mlango Ujao' : 'Next Chapter'}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white rounded-full text-slate-400 hover:text-emerald-500 shadow-sm border border-slate-100 transition-all"><Share2 size={16} /></button>
            <button className="p-2 bg-white rounded-full text-slate-400 hover:text-emerald-500 shadow-sm border border-slate-100 transition-all"><Bookmark size={16} /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
               <Loader2 size={32} className="animate-spin mb-4" />
               <p className="text-xs font-bold uppercase tracking-widest">Lifting the veil of the Word...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-300">
               <Sparkles size={32} className="mb-2" />
               <p className="text-sm font-bold">{error}</p>
               <button onClick={() => fetchChapter(selectedBook!, selectedChapter!, language)} className="mt-4 text-xs underline">Retry</button>
            </div>
          ) : (
            <div className="space-y-6">
              {chapterVerses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Scroll size={32} className="mb-2 opacity-20" />
                  <p className="text-sm italic">No scripture found for this selection.</p>
                </div>
              ) : (
                <>
                  {/* Verse Navigation Grid */}
                  <div className="flex flex-wrap gap-1.5 pb-6 border-b border-slate-50">
                    {chapterVerses.map((v, idx) => (
                      <button
                        key={v.verse || idx}
                        onClick={() => {
                          setSelectedVerse(v.verse);
                          document.getElementById(`verse-${v.verse}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`min-w-[28px] h-7 flex items-center justify-center rounded text-[10px] font-bold transition-all border ${
                          selectedVerse === v.verse 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' 
                          : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                      >
                        {v.verse}
                      </button>
                    ))}
                  </div>

                  {/* Chapter Content */}
                  <div className="prose prose-slate max-w-none">
                    {chapterVerses.map((v, idx) => (
                      <div 
                        key={v.verse || idx} 
                        id={`verse-${v.verse}`}
                        className={`inline group transition-colors duration-500 rounded px-1 -mx-1 py-0.5 ${
                          selectedVerse === v.verse ? 'bg-emerald-50 text-slate-900 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <sup className={`text-[10px] font-bold mr-1 select-none transition-colors ${
                          selectedVerse === v.verse ? 'text-emerald-600' : 'text-slate-300 group-hover:text-emerald-400'
                        }`}>
                          {v.verse}
                        </sup>
                        <span className="text-lg leading-relaxed">{v.text}</span>
                        <span className="inline-block w-2"></span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="py-20 text-center opacity-10">
                <Scroll size={48} className="mx-auto" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-0 overflow-hidden">
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 opacity-10 -rotate-12 translate-x-12 -translate-y-12">
           <Scroll size={300} className="text-emerald-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                 <Book className="text-emerald-500" />
                 IFC Bible Portal
              </h2>
              <p className="text-slate-400 text-sm max-w-md">
                 Explore the living word of God. Search for books, select chapters, and delve into verses.
              </p>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        <div className="lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col shrink-0 overflow-hidden">
           {/* Language Selection Header */}
           <div className="p-4 bg-slate-50 border-b border-slate-200">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Language / Lugha</h3>
             <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${language === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('sw')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${language === 'sw' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Kiswahili
                </button>
             </div>
           </div>

           <div className="p-4 border-b border-slate-100 bg-white space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest ml-1">
                {language === 'sw' ? 'Tafuta Maandiko' : 'Search Scripture'}
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder={language === 'sw' ? "Tafuta kitabu..." : "Find a book..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredBooks.map(book => (
                <button 
                  key={book} 
                  onClick={() => {setSelectedBook(book); setSelectedChapter(null); setSelectedVerse(null)}}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-between group ${
                    selectedBook === book 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                >
                   {language === 'sw' ? swahiliBooks[book] || book : book}
                   <ChevronRight size={12} className={selectedBook === book ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} />
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
           {renderContent()}
        </div>
      </div>
    </div>
  );
};
