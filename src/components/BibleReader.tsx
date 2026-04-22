import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Book, Search, Bookmark, Scroll, ChevronRight, Share2, Sparkles } from 'lucide-react';

export const BibleReader = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const featuredPassages = [
    { ref: "Psalm 23", title: "The Shepherd Psalm", excerpt: "The Lord is my shepherd; I shall not want..." },
    { ref: "John 3:16", title: "The Great Love", excerpt: "For God so loved the world, that he gave his only begotten Son..." },
    { ref: "1 Corinthians 13", title: "The Way of Love", excerpt: "If I speak in the tongues of men and of angels, but have not love..." },
    { ref: "Matthew 5", title: "The Beatitudes", excerpt: "Blessed are the poor in spirit, for theirs is the kingdom of heaven..." },
  ];

  return (
    <div className="flex flex-col gap-6 max-h-[calc(100vh-10rem)] h-full">
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
                 Explore the living word of God. Search for verses, browse chapters, and store your favorite scriptures.
              </p>
           </div>
           
           <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search Revelation, Hope, Love..." 
                className="w-full bg-white/10 border border-white/20 rounded-full pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-500"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden min-h-0">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
           <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">Chapters</h3>
              <Bookmark size={14} className="text-slate-400" />
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes'].map(book => (
                <button key={book} className="w-full text-left px-3 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors flex items-center justify-between group">
                   {book}
                   <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
              {featuredPassages.map((p, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                     <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{p.ref}</span>
                     <Share2 size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{p.title}</h4>
                  <p className="text-slate-500 text-xs italic line-clamp-2 leading-relaxed">"{p.excerpt}"</p>
                </motion.div>
              ))}
           </div>

           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex-1 min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                 <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Select a book to begin reading</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Digital Bible access is being integrated. You'll soon be able to read, highlight, and share every chapter of the Word.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
