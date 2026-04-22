import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ai } from '../lib/gemini';
import { 
  Users, 
  TrendingUp, 
  HandCoins, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  UserPlus,
  Megaphone,
  Trash2,
  History,
  BookOpen,
  Sparkles,
  Send,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { CounselingChat } from './CounselingChat';
import { Profile } from '../types';
import { checkLimit, incrementUsage } from '../lib/usage';

interface Props {
  activeTab: string;
  profile: Profile | null;
  onTabChange: (tab: string) => void;
}

export function DashboardPastor({ activeTab, profile, onTabChange }: Props) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    attendanceToday: 0,
    newVisitors: 0,
    tithesThisMonth: 0
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);
  const [sermons, setSermons] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [sermonTopic, setSermonTopic] = useState('');
  const [sermonPreview, setSermonPreview] = useState<string | null>(null);
  const [generatingSermon, setGeneratingSermon] = useState(false);
  const [sermonLimitReached, setSermonLimitReached] = useState(false);
  const [sermonsRemaining, setSermonsRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const attendanceData = [
    { name: 'Feb 2', count: 450 },
    { name: 'Feb 9', count: 520 },
    { name: 'Feb 16', count: 480 },
    { name: 'Feb 23', count: 610 },
    { name: 'Mar 2', count: 590 },
    { name: 'Mar 9', count: 630 },
  ];

  useEffect(() => {
    fetchStats();
    fetchAnnouncements();
    if (activeTab === 'requests') fetchPrayerRequests();
    if (activeTab === 'sermons') fetchSermons();
    if (profile?.id) {
       checkLimit(profile.id, 'sermon').then(res => {
         setSermonsRemaining(res.remaining);
         setSermonLimitReached(!res.allowed);
       });
    }
  }, [activeTab, profile]);

  async function fetchAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  }

  async function fetchPrayerRequests() {
    const { data } = await supabase.from('prayer_requests')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    if (data) setPrayerRequests(data);
  }

  async function fetchSermons() {
    const { data } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
    if (data) setSermons(data);
  }

  const handleGenerateSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermonTopic.trim() || generatingSermon || sermonLimitReached || !profile) return;
    
    // Double check limit
    const { allowed } = await checkLimit(profile.id, 'sermon');
    if (!allowed) {
      setSermonLimitReached(true);
      return;
    }

    setGeneratingSermon(true);
    setSermonPreview(null);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          role: 'user',
          parts: [{ text: `Generate a complete Christian sermon for a Kenyan audience based on this topic: ${sermonTopic}. 
          The sermon should have:
          1. A bold Title
          2. Multiple Bible references
          3. An Introduction, 3 main points with scriptural support, and a Conclusion with an altar call.
          4. Use a tone of authority and love.
          Format the output as clear Markdown text.` }]
        }]
      });

      setSermonPreview(response.text);
      await incrementUsage(profile.id, 'sermon');
      const updated = await checkLimit(profile.id, 'sermon');
      setSermonsRemaining(updated.remaining);
      setSermonLimitReached(!updated.allowed);
    } catch (err) {
      console.error('Error generating sermon:', err);
    } finally {
      setGeneratingSermon(false);
    }
  };

  const saveSermon = async (publish: boolean) => {
    if (!sermonPreview) return;
    
    try {
      const { error } = await supabase.from('sermons').insert([{
        title: sermonTopic,
        content: sermonPreview,
        speaker: 'Admin/Pastor',
        is_published: publish
      }]);

      if (!error) {
        setSermonTopic('');
        setSermonPreview(null);
        fetchSermons();
      }
    } catch (err) {
      console.error('Error saving sermon:', err);
    }
  };

  const deleteSermon = async (id: string) => {
    await supabase.from('sermons').delete().eq('id', id);
    fetchSermons();
  };

  const toggleSermonPublish = async (id: string, currentStatus: boolean) => {
    await supabase.from('sermons').update({ is_published: !currentStatus }).eq('id', id);
    fetchSermons();
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    const { error } = await supabase.from('announcements').insert([newAnnouncement]);
    if (!error) {
       setNewAnnouncement({ title: '', content: '' });
       fetchAnnouncements();
    }
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    fetchAnnouncements();
  };

  const updatePrayerStatus = async (id: string, status: string) => {
    await supabase.from('prayer_requests').update({ status }).eq('id', id);
    fetchPrayerRequests();
  };

  async function fetchStats() {
    setLoading(true);
    // In a real app, these would be separate count queries
    setStats({
      totalMembers: 842,
      attendanceToday: 612,
      newVisitors: 12,
      tithesThisMonth: 124500
    });
    
    setNotifications([
      { id: 1, type: 'absence', message: 'Omondi Onyango has been absent for 3 weeks.', time: '2h ago' },
      { id: 2, type: 'counseling', message: 'New flagged counseling session: Serious emotional distress detected.', time: '5h ago' },
      { id: 3, type: 'visitor', message: 'New visitor registration: Sarah Wambui.', time: '1d ago' },
      { id: 4, type: 'prayer', message: 'Urgent prayer request from Mary N.', time: '1d ago' },
    ]);
    setLoading(false);
  }

  if (activeTab === 'manage_landing') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Church Notifications & Updates</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system notifications and public announcements for IFC CHURCH.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
              <Megaphone size={14} className="text-emerald-500" />
              New Announcement
            </h3>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
               <div>
                 <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Title</label>
                 <input 
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="e.g. Next Combined Service"
                 />
               </div>
               <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 ml-1">Content</label>
                  <textarea 
                    value={newAnnouncement.content}
                    onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="Details about the announcement..."
                  />
               </div>
               <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-all shadow-lg shadow-slate-200">
                 Publish Announcement
               </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 uppercase text-[10px] tracking-widest">
              <History size={14} className="text-emerald-500" />
              Recent Feed
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[440px] pr-2">
               <AnimatePresence>
                 {announcements.map(ann => (
                   <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={ann.id} 
                    className="p-4 bg-slate-50 border border-slate-100 rounded-lg group"
                   >
                     <div className="flex justify-between items-start">
                       <div className="max-w-[85%]">
                         <h4 className="font-bold text-slate-900 text-sm leading-tight">{ann.title}</h4>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                            {ann.created_at ? format(new Date(ann.created_at), 'MMM d, yyyy') : 'Recent'}
                         </p>
                       </div>
                       <button 
                        onClick={() => deleteAnnouncement(ann.id)} 
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                       >
                          <Trash2 size={14} />
                       </button>
                     </div>
                     <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                        {ann.content}
                     </p>
                   </motion.div>
                 ))}
               </AnimatePresence>
               {announcements.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-20 text-slate-300 opacity-50">
                    <Megaphone size={40} className="mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No active announcements</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'requests') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prayer Wall Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review and pray for the requests submitted by the congregation.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {prayerRequests.map((req) => (
              <motion.div 
                key={req.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    req.status === 'active' ? 'bg-amber-100 text-amber-700' : 
                    req.status === 'prayed_for' ? 'bg-indigo-100 text-indigo-700' : 
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {req.created_at ? format(new Date(req.created_at), 'MMM d') : ''}
                  </span>
                </div>
                <p className="text-sm text-slate-700 italic font-serif leading-relaxed line-clamp-4">"{req.request_text}"</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                      {req.profiles?.full_name?.[0] || 'A'}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[100px]">
                      {req.is_private ? 'Anonymous' : req.profiles?.full_name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {req.status === 'active' && (
                      <button 
                        onClick={() => updatePrayerStatus(req.id, 'prayed_for')}
                        className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded"
                      >
                        MARK PRAYED
                      </button>
                    )}
                    {req.status !== 'resolved' && (
                      <button 
                         onClick={() => updatePrayerStatus(req.id, 'resolved')}
                         className="text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded"
                      >
                        RESOLVE
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {prayerRequests.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 opacity-50">
              <History size={48} className="mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">No prayer requests at the moment</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'counseling') {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scripture Counselor</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">Personal Guidance & Oversight</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                System Active
             </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 pb-2">
          {/* Main Counseling Area */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden order-2 lg:order-1 min-h-[500px]">
             <CounselingChat userId={profile?.id} isPastor={true} />
          </div>

          {/* Oversight Sidebar */}
          <div className="lg:w-80 flex flex-col gap-6 order-1 lg:order-2 shrink-0">
            {/* Pastoral Support Notice */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-slate-200">
               <div className="relative z-10">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                     <Heart size={20} className="text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-1 tracking-tight">Pastoral Support</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400 mb-4">
                    Pastor, this chat is private. Use it for your own spiritual strength and to find wisdom for the challenges you face in ministry.
                  </p>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] text-emerald-400 font-medium italic">
                    "Cast all your anxiety on him because he cares for you." — 1 Pet 5:7
                  </div>
               </div>
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
            </div>

            {/* Member Monitoring */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Crisis Alerts</h3>
                <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">2</span>
              </div>
              <div className="p-3 space-y-3 overflow-y-auto">
                {[
                  { id: '1', user: 'Anon #4210', distress: 'High', preview: 'I feel overwhelmed...' },
                  { id: '2', user: 'Anon #4192', distress: 'Med', preview: 'Seeking scripture...' },
                ].map(session => (
                  <button key={session.id} className="w-full text-left p-3 rounded-xl border border-slate-50 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-slate-900">{session.user}</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${session.distress === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        {session.distress}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate italic">"{session.preview}"</p>
                  </button>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-[10px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">View All Flags</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'sermons') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-[32px]">Sermon Preparation & Library</h1>
            <p className="text-sm text-slate-500 mt-1">Generate AI-powered sermons, share them with the congregation, and manage your teaching history.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Generator Sidebar */}
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200">
                 <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                    <Sparkles size={24} />
                 </div>
                 <h3 className="text-xl font-bold mb-2">AI Sermon Generator</h3>
                 <p className="text-slate-400 text-xs mb-6 leading-relaxed">Describe the topic, theme, or Bible verse you want to preach about. Our AI will craft a deep, scriptural outline for you.</p>
                                 <form onSubmit={handleGenerateSermon} className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1">Preaching Topic</label>
                       <input 
                         type="text" 
                         value={sermonTopic}
                         onChange={e => setSermonTopic(e.target.value)}
                         placeholder="e.g. The Power of Forgiveness"
                         disabled={sermonLimitReached}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600 transition-all font-medium"
                       />
                    </div>
                    <button 
                      type="submit" 
                      disabled={generatingSermon || !sermonTopic.trim() || sermonLimitReached}
                      className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                        sermonLimitReached 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                      }`}
                    >
                      {generatingSermon ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Generating Word...
                        </>
                      ) : sermonLimitReached ? (
                        'Daily Limit Reached'
                      ) : (
                        <>
                          <Send size={18} />
                          Generate Sermon
                        </>
                      )}
                    </button>
                    {sermonsRemaining !== null && !sermonLimitReached && (
                      <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-2 bg-white/5 py-1 rounded">
                        {sermonsRemaining} generations remaining today
                      </p>
                    )}
                 </form>
              </div>

              <AnimatePresence>
                {sermonPreview && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-6 shadow-xl"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-emerald-600" size={20} />
                      <h4 className="text-sm font-bold text-slate-900">Sermon Preview</h4>
                    </div>
                    <div className="bg-white rounded-xl p-4 mb-6 max-h-60 overflow-y-auto border border-emerald-100 prose prose-xs">
                      <ReactMarkdown>{sermonPreview}</ReactMarkdown>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => saveSermon(false)}
                        className="bg-white border border-emerald-200 text-emerald-700 font-bold py-2.5 rounded-xl text-xs hover:bg-emerald-50 transition-all"
                      >
                        Keep Draft
                      </button>
                      <button 
                        onClick={() => saveSermon(true)}
                        className="bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                      >
                        <Share2 size={14} />
                        Share Now
                      </button>
                    </div>
                    <button 
                      onClick={() => setSermonPreview(null)}
                      className="w-full mt-3 text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest py-1"
                    >
                      Discard Draft
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pastoral Wisdom</h4>
                 <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-emerald-500 pl-4 py-1">
                   "He who speaks should do it as one speaking the very words of God." — 1 Peter 4:11
                 </p>
              </div>
           </div>

           {/* Library Area */}
           <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                 <BookOpen size={14} />
                 Generated Sermons
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                   {sermons.map((s) => (
                     <motion.div 
                        key={s.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group"
                     >
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex-1">
                              <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{s.title}</h4>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {format(new Date(s.created_at), 'MMMM d, yyyy')} • {s.speaker}
                              </p>
                           </div>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => toggleSermonPublish(s.id, s.is_published)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                                  s.is_published 
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                                  : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                                }`}
                              >
                                {s.is_published ? 'Published' : 'Share to Church'}
                              </button>
                              <button 
                                onClick={() => deleteSermon(s.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-slate-600 line-clamp-3 overflow-hidden">
                           <ReactMarkdown>{s.content}</ReactMarkdown>
                        </div>
                        <button className="mt-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Read Full Sermon</button>
                     </motion.div>
                   ))}
                </AnimatePresence>
                {sermons.length === 0 && !generatingSermon && (
                  <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                     <BookOpen size={48} className="mb-4 opacity-20" />
                     <p className="text-xs font-black uppercase tracking-widest">Library is empty. Generate your first sermon.</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pastor's Dashboard</h1>
          <p className="text-slate-500">Overview of church health and engagement</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <Clock size={16} />
            History
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus size={16} />
            Add Member
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Members', value: '1,482', icon: Users, trend: '+12 this month', color: 'text-emerald-600' },
          { label: 'Monthly Tithing (KES)', value: `KES 642,500`, icon: HandCoins, trend: '88% of target', color: 'text-emerald-600' },
          { label: 'New Visitors (7d)', value: '24', icon: AlertCircle, trend: '8 Pending Follow-up', color: 'text-amber-500' },
          { label: 'Attendance Average', value: `82%`, icon: TrendingUp, trend: 'Based on past 4 Sundays', color: 'text-slate-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            <div className={`flex items-center gap-1 mt-2 ${stat.color} text-xs font-semibold`}>
              <span>{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart & Transactions */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full">
          {/* M-Pesa Transaction Stream */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">M-Pesa Transaction Stream</h2>
              <span className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">View All</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { time: '14:22:05', name: 'David Mwangi', type: 'TITHE', amount: 'KES 5,000', typeColor: 'bg-blue-50 text-blue-600' },
                    { time: '14:15:30', name: 'Sarah Kamau', type: 'OFFERING', amount: 'KES 1,200', typeColor: 'bg-emerald-50 text-emerald-600' },
                    { time: '13:58:12', name: 'Mercy Wambui', type: 'DONATION', amount: 'KES 15,000', typeColor: 'bg-purple-50 text-purple-600' },
                    { time: '13:42:00', name: 'John Otieno', type: 'TITHE', amount: 'KES 2,500', typeColor: 'bg-blue-50 text-blue-600' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{row.time}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{row.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 ${row.typeColor} rounded-full text-[10px] font-bold tracking-tight`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Urgent Follow-Up */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Urgent Follow-Up Required</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-bold text-red-900 leading-none">Samuel Njuguna</p>
                    <p className="text-[11px] text-red-700 mt-1">Absent 3 consecutive weeks</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-white border border-red-200 text-red-600 text-[10px] font-bold rounded shadow-sm hover:bg-red-50 transition-colors">REACH OUT</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-bold text-amber-900 leading-none">Grace Njeri (Visitor)</p>
                    <p className="text-[11px] text-amber-700 mt-1">First-time guest last Sunday</p>
                  </div>
                </div>
                <button className="px-3 py-1 bg-white border border-amber-200 text-amber-600 text-[10px] font-bold rounded shadow-sm hover:bg-amber-50 transition-colors">WELCOME</button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Counselor Flags */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg shadow-slate-200">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle size={20} />
            </div>
            <h3 className="font-bold text-lg mb-2">Scripture Counseling</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Access your private pastoral AI assistant for scripture study, counseling preparation, or personal spiritual support.
            </p>
            <button 
              onClick={() => onTabChange('counseling')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20"
            >
              Start Consultation
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-1">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">AI Counselor Flags</h2>
              <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-widest"> Pastoral attention required</p>
            </div>
            <div className="p-4 space-y-4">
              {[
                { type: 'DISTRESS', color: 'red', text: '"I feel overwhelmed and lost, I\'m not sure if God hears me anymore..."', meta: '10m ago', id: 'Anon #4210' },
                { type: 'GRIEF', color: 'amber', text: '"Seeking scripture for comfort after sudden family loss..."', meta: '1h ago', id: 'Anon #4192' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-100 space-y-2 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-2 py-0.5 bg-${item.color}-100 text-${item.color}-700 rounded uppercase`}>{item.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.meta}</span>
                  </div>
                  <p className="text-xs italic text-slate-600 leading-relaxed font-serif">{item.text}</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                    <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                    <span className="text-[10px] font-semibold text-slate-700">{item.id}</span>
                    <button className="ml-auto text-emerald-600 text-[10px] font-bold hover:underline">VIEW LOG</button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => onTabChange('counseling')}
                className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors"
              >
                Review All Flagged Chats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
