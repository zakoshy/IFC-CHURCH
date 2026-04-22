import React from 'react';
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
}

export function DashboardMember({ activeTab, profile }: Props) {
  
  if (activeTab === 'counseling') {
    return <CounselingChat />;
  }

  if (activeTab === 'give') {
    return <MpesaPayment />;
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
            <h3 className="text-lg font-bold mb-1 tracking-tight">Need Guidance?</h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">Chat privately with our AI Scripture Counselor for encouragement.</p>
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
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
            <Clock size={16} className="text-emerald-500" />
            My Recent Records
          </h3>
          <div className="space-y-5">
            <div className="flex gap-4 items-start group">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0 group-hover:scale-150 transition-transform"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Attended Sunday Service</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">2 days ago • Main Sanctuary</p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-2 shrink-0 group-hover:bg-emerald-400 transition-colors"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">Sent Tithe (KES 2,000)</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium uppercase tracking-tight">5 days ago • RCX44A1</p>
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
