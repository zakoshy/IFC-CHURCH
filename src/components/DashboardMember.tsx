import React from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { 
  Users, 
  Calendar, 
  HandCoins, 
  MessageCircle,
  Heart,
  BookOpen,
  ArrowRight,
  Clock,
  PlayCircle,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';
import { CounselingChat } from './CounselingChat';
import { MpesaPayment } from './MpesaPayment';
import { Profile } from '../types';

interface Props {
  activeTab: string;
  profile: Profile | null;
  onTabChange: (tab: string) => void;
}

export function DashboardMember({ activeTab, profile, onTabChange }: Props) {
  
  const [sermons, setSermons] = React.useState<any[]>([]);
  const [prayerRequests, setPrayerRequests] = React.useState<any[]>([]);
  const [newRequest, setNewRequest] = React.useState('');
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === 'sermons') fetchPublishedSermons();
    if (activeTab === 'requests') fetchPrayerRequests();
  }, [activeTab]);

  async function fetchPublishedSermons() {
    const { data } = await supabase.from('sermons').select('*').eq('is_published', true).order('created_at', { ascending: false });
    if (data) setSermons(data);
  }

  async function fetchPrayerRequests() {
    const { data } = await supabase.from('prayer_requests')
      .select('*, profiles(full_name)')
      .eq('is_private', false)
      .order('created_at', { ascending: false });
    if (data) setPrayerRequests(data);
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.trim() || !profile) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('prayer_requests').insert([{
        user_id: profile.id,
        request_text: newRequest,
        is_private: isPrivate
      }]);

      if (!error) {
        setNewRequest('');
        setIsPrivate(false);
        fetchPrayerRequests();
        alert('Your prayer request has been submitted to the ministerial team.');
      }
    } catch (err) {
      console.error('Error submitting prayer request:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (activeTab === 'counseling') {
    return <CounselingChat userId={profile?.id} />;
  }

  if (activeTab === 'give') {
    return <MpesaPayment />;
  }

  if (activeTab === 'requests') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prayer Wall</h1>
          <p className="text-sm text-slate-500 mt-1">"The prayer of a righteous person is powerful and effective." — James 5:16</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                <Heart size={16} className="text-emerald-500" />
                Submit Request
              </h3>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <textarea 
                  required
                  value={newRequest}
                  onChange={e => setNewRequest(e.target.value)}
                  placeholder="How can we pray for you today?"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all min-h-[150px] resize-none"
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="private"
                    checked={isPrivate}
                    onChange={e => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="private" className="text-xs text-slate-500 font-medium cursor-pointer uppercase tracking-widest">
                    Submit as Anonymous
                  </label>
                </div>
                <button 
                  type="submit"
                  disabled={submitting || !newRequest.trim()}
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Post to Wall'}
                </button>
              </form>
            </div>
          </div>

          {/* Public Wall */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Prayer Stream</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prayerRequests.map((req) => (
                <div key={req.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:border-emerald-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600 border border-emerald-100">
                        {req.profiles?.full_name?.[0] || 'A'}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {req.is_private ? 'Anonymous' : req.profiles?.full_name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono">
                      {req.created_at ? format(new Date(req.created_at), 'MMM d') : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 italic font-serif leading-relaxed line-clamp-4">"{req.request_text}"</p>
                  <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      req.status === 'active' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {req.status === 'active' ? 'Ministerial Team Reviewing' : 'Agreement in Prayer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {prayerRequests.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                <Heart size={48} className="mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest text-[10px]">The prayer wall is empty. Be the first to share.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'sermons') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Church Sermons</h1>
          <p className="text-sm text-slate-500 mt-1">Nourish your soul with recent teachings and words of encouragement.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sermons.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Teaching</span>
                 <span className="text-[10px] font-bold text-slate-400">{format(new Date(s.created_at), 'MMM d, yyyy')}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-slate-500 text-[13px] line-clamp-3 mb-4 leading-relaxed italic">
                {s.content.substring(0, 200)}...
              </p>
              <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                Read Full Message <ArrowRight size={14} />
              </button>
            </div>
          ))}
          {sermons.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">No published sermons yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab !== 'dashboard') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Clock size={48} className="mb-4 opacity-20" />
        <p className="text-lg">Section {activeTab} coming soon...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="text-slate-500">"Your word is a lamp for my feet, a light on my path." — Psalm 119:105</p>
      </header>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Counselor Promo */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden group border border-slate-800 shadow-lg shadow-slate-200/50"
        >
          <div className="relative z-10">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-lg font-bold mb-1 tracking-tight">Scripture Counselor</h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">Seek spiritual guidance and encouragement rooted in the Word of God.</p>
            <button className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
              Talk Now <ArrowRight size={14} />
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
        </motion.div>

        {/* Giving Promo */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col"
        >
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4">
            <HandCoins size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Tithe & Offerings</h3>
          <p className="text-slate-500 text-xs mb-4 leading-relaxed">Support the church mission through secure M-Pesa payments.</p>
          <div className="mt-auto">
            <button className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all">
              Give M-Pesa <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Latest Sermon */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col"
        >
          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-4">
            <PlayCircle size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Latest Sermon</h3>
          <p className="text-slate-500 text-xs mb-1 font-medium italic">"Walking on Water"</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-4">Pastor James • April 20</p>
          <div className="mt-auto">
            <button className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all">
              Watch Now <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Bible Portal */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 shadow-sm flex flex-col"
        >
          <div className="w-10 h-10 bg-white text-emerald-600 rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <BookOpen size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Bible Portal</h3>
          <p className="text-slate-500 text-xs mb-4 leading-relaxed">Search and study scriptures within our dedicated IFC Bible Portal.</p>
          <div className="mt-auto">
            <button className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:gap-3 transition-all">
              Study the Word <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
            <Heart size={16} className="text-emerald-500" />
            Spiritual Journey
          </h3>
          <div className="space-y-5">
            <div className="flex gap-4 items-start group">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Account Active</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">You are part of the IFC Family</p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-2 shrink-0 group-hover:bg-emerald-400 transition-colors"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Member Status: Verified</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">Full access to church resources</p>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
            <Bell size={16} className="text-emerald-500" />
            Important Updates
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[9px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Urgent</span>
              <h4 className="font-bold text-slate-900 mt-2 text-sm leading-tight">Family Sunday Celebration</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Special dedicated time for families this Sunday. Refreshments at the church hall.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
