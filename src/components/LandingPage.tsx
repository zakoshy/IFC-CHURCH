import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { VerseCarousel } from './VerseCarousel';
import { 
  BookOpen, 
  Calendar, 
  Heart, 
  MessageCircle, 
  ArrowRight, 
  Bell, 
  Sparkles,
  History,
  Users,
  PlayCircle
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

export const LandingPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (data) setAnnouncements(data);
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 px-8 py-24 md:py-32 text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/30 to-transparent"></div>
           <BookOpen size={600} className="absolute -right-40 -top-40 text-emerald-500" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-8">
              <Sparkles size={16} className="text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">Welcome Home</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-8 leading-[0.9]">
              IFC <span className="text-emerald-500">CHURCH</span>
            </h1>
            
            <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-lg font-medium">
              A community of believers dedicated to kingdom expansion, spiritual growth, and serving our community with love and integrity.
            </p>

            <div className="flex flex-wrap gap-5">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-emerald-600/30 flex items-center gap-3 active:scale-95">
                Join our family <ArrowRight size={18} />
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all backdrop-blur-sm">
                Watch Sermons
              </button>
            </div>
          </motion.div>

          <div className="hidden lg:block relative">
             <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full"></div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4, duration: 1 }}
               className="relative aspect-square bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center justify-center p-12 overflow-hidden"
             >
                <div className="text-center space-y-6">
                   <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                      <Heart size={40} className="text-white" />
                   </div>
                   <h3 className="text-2xl font-display font-black tracking-tight">Sunday Service</h3>
                   <div className="space-y-1">
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Main Sanctuary</p>
                      <p className="text-slate-100 text-xl font-black">10:00 AM - 12:30 PM</p>
                   </div>
                   <div className="pt-8 border-t border-slate-700 w-full">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4 italic">"Come as you are"</p>
                   </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute top-4 left-4 grid grid-cols-3 gap-2 opacity-20">
                   {[...Array(9)].map((_, i) => <div key={i} className="w-1 h-1 bg-white rounded-full"></div>)}
                </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Sections */}
      <section id="vision" className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 group"
        >
          <div className="w-12 h-0.5 bg-emerald-500 group-hover:w-24 transition-all duration-500"></div>
          <h2 className="text-4xl font-display font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-6">Our Vision</h2>
          <p className="text-slate-600 text-lg leading-relaxed font-serif">
            To be a global catalyst for kingdom transformation, raising a generation that manifests the love, power, and wisdom of God in every sphere of influence. We envision a church without walls, where the Word of God is the foundation of every life.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="space-y-6 group"
        >
          <div className="w-12 h-0.5 bg-emerald-500 group-hover:w-24 transition-all duration-500"></div>
          <h2 className="text-4xl font-display font-black tracking-tight text-slate-900 border-l-4 border-emerald-500 pl-6">Our Mission</h2>
          <p className="text-slate-600 text-lg leading-relaxed font-serif">
            Our mission is to equip believers through sound biblical teaching, passionate worship, and intentional discipleship. We are committed to reaching the unreached, restoring the broken, and empowering leaders to advance the Great Commission.
          </p>
        </motion.div>
      </section>

      {/* Verse of Encouragement */}
      <section className="max-w-7xl mx-auto px-8">
        <div className="flex items-center gap-6 mb-10">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">Scriptural Encouragement</h2>
          <div className="h-px w-full bg-slate-200"></div>
        </div>
        <VerseCarousel />
      </section>

      {/* Announcements */}
      <section id="announcements" className="max-w-7xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <h2 className="text-3xl font-display font-black text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Bell className="text-emerald-600" size={24} />
                </div>
                Kingdom Updates
              </h2>
              <button className="text-[11px] font-black text-emerald-600 uppercase tracking-widest hover:underline px-4 py-2 bg-emerald-50 rounded-full transition-colors">See all news</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                [1, 2].map(i => <div key={i} className="h-64 bg-slate-50 rounded-3xl border border-slate-100 animate-pulse"></div>)
              ) : announcements.length > 0 ? (
                announcements.map((ann, idx) => (
                  <motion.div 
                    key={ann.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm group hover:border-emerald-500/30 transition-all hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col"
                  >
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-2.5 py-1 bg-emerald-50 rounded-full">Announcement</span>
                        <div className="h-px w-4 bg-slate-200"></div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                          {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-black text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">{ann.title}</h3>
                      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6 font-medium italic">"{ann.content}"</p>
                      <div className="mt-auto pt-6 border-t border-slate-50">
                        <button className="text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-3 transition-all">
                          Read Details <ArrowRight size={14} className="text-emerald-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full p-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <History size={32} className="text-slate-400" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Upcoming kingdom updates will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Connect Section */}
          <div id="connect" className="space-y-8">
            <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Users size={120} />
              </div>
              <h3 className="text-2xl font-display font-black mb-4 tracking-tighter">Stay Connected</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">Join our Whatsapp groups or follow us on social media for daily encouragement and live service links.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all"><MessageCircle size={20} className="text-emerald-400 group-hover:text-white" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Whatsapp Community</p>
                    <p className="text-sm font-bold text-slate-100">Join Member Hub</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all"><PlayCircle size={20} className="text-blue-400 group-hover:text-white" /></div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-blue-500">Live Broadcast</p>
                    <p className="text-sm font-bold text-slate-100">Watch on Facebook</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100">
               <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                  <Heart size={24} className="text-rose-500" />
               </div>
               <h3 className="font-display font-black text-slate-900 text-xl mb-3 tracking-tighter">Prayer Wall</h3>
               <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                  Submit your prayer requests and our ministerial team will stand in agreement with you before the throne of grace.
               </p>
               <button className="w-full py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200">
                  Submit Request
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-20 px-8 text-center border-t border-slate-800">
         <div className="max-w-xl mx-auto space-y-8">
            <div className="flex items-center justify-center gap-3">
               <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white">I</div>
               <span className="text-lg font-display font-black tracking-tighter text-white">IFC CHURCH</span>
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-bold">Kingdom Expansion • Spiritual Growth • Community Service</p>
            <div className="pt-8 border-t border-slate-800 text-[10px] text-slate-600 uppercase font-bold tracking-widest">
               © 2026 IFC Church. All spiritual rights reserved.
            </div>
         </div>
      </footer>
    </div>
  );
};
