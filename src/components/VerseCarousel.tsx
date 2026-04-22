import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", ref: "Jeremiah 29:11" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I can do all things through him who strengthens me.", ref: "Philippians 4:13" },
  { text: "Trust in the Lord with all your heart, and do not lean on your own understanding.", ref: "Proverbs 3:5" },
  { text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.", ref: "Isaiah 40:31" },
  { text: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you.", ref: "John 14:27" },
  { text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you.", ref: "Joshua 1:9" },
  { text: "He gives power to the faint, and to him who has no might he increases strength.", ref: "Isaiah 40:29" },
  { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" }
];

export const VerseCarousel = () => {
  const [shuffledVerses, setShuffledVerses] = useState(VERSES);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setShuffledVerses([...VERSES].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % shuffledVerses.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [shuffledVerses]);

  const next = () => setIndex((prev) => (prev + 1) % shuffledVerses.length);
  const prev = () => setIndex((prev) => (prev - 1 + shuffledVerses.length) % shuffledVerses.length);

  const verse = shuffledVerses[index] || shuffledVerses[0] || { text: "Loading...", ref: "IFC" };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Quote size={120} className="text-emerald-500" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto min-h-[160px] justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-xl md:text-2xl font-serif italic text-slate-100 leading-relaxed">
               "{verse.text}"
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-emerald-500/50"></div>
              <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
                {verse.ref}
              </p>
              <div className="h-px w-8 bg-emerald-500/50"></div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {shuffledVerses.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all ${i === index ? 'w-4 bg-emerald-500' : 'w-1 bg-slate-700'}`}
          />
        ))}
      </div>

      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};
