import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronLeft, ChevronRight, Quote, Loader2 } from 'lucide-react';

interface Verse {
  text: string;
  ref: string;
}

const BIBLE_METADATA = [
  { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 }, { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 }, { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 }, { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 }, { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 }, { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 }, { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 }, { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 }, { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 }, { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 }, { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 }, { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 }, { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 }, { name: 'Malachi', chapters: 4 },
  { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 }, { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 }, { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 }, { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 }, { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 }, { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 }, { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 }, { name: 'Revelation', chapters: 22 }
];

export const VerseCarousel = () => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatch();
  }, []);

  const fetchBatch = async () => {
    setLoading(true);
    try {
      // Pick 8 random books from the whole bible
      const selected = [...BIBLE_METADATA].sort(() => Math.random() - 0.5).slice(0, 8);
      
      const results = await Promise.all(
        selected.map(async (book) => {
          try {
            // Pick a random chapter
            const chapter = Math.floor(Math.random() * book.chapters) + 1;
            const res = await fetch(`https://bible-api.com/${book.name}+${chapter}`);
            const data = await res.json();
            
            // Pick a random verse from that chapter
            const randomVerseIndex = Math.floor(Math.random() * data.verses.length);
            const verseData = data.verses[randomVerseIndex];
            
            return {
              text: verseData.text.trim(),
              ref: `${book.name} ${chapter}:${verseData.verse}`
            };
          } catch {
            return null;
          }
        })
      );
      
      const validVerses = results.filter((v): v is Verse => v !== null);
      if (validVerses.length > 0) {
        setVerses(validVerses);
      }
    } catch (err) {
      console.error("Failed to fetch scriptures", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verses.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % verses.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [verses]);

  const next = () => setIndex((prev) => (prev + 1) % verses.length);
  const prev = () => setIndex((prev) => (prev - 1 + verses.length) % verses.length);

  if (loading && verses.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-widest">Gathering Heavenly Wisdom...</p>
      </div>
    );
  }

  const verse = verses[index] || { text: "Search the scriptures, for in them ye think ye have eternal life.", ref: "John 5:39" };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Quote size={120} className="text-emerald-500" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto min-h-[180px] justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={verses.length > 0 ? `${verses[index]?.ref}-${index}` : 'loading'}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <p className="text-xl md:text-2xl font-serif italic text-slate-100 leading-relaxed drop-shadow-sm">
               "{verse.text}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-6 bg-emerald-500/30"></div>
              <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                {verse.ref}
              </p>
              <div className="h-px w-6 bg-emerald-500/30"></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 opacity-30 group-hover:opacity-70 transition-opacity">
        {verses.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-6 bg-emerald-500' : 'w-1 bg-slate-700 hover:bg-slate-500'}`}
          />
        ))}
      </div>

      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
