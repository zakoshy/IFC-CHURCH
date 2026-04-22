import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

interface Props {
  activeTab: string;
}

export function DashboardPastor({ activeTab }: Props) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    attendanceToday: 0,
    newVisitors: 0,
    tithesThisMonth: 0
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
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
  }, [activeTab]);

  async function fetchAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  }

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Public Ministry Management</h1>
          <p className="text-sm text-slate-500 mt-1">Update church announcements and landing page content for IFC CHURCH.</p>
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

  if (activeTab !== 'dashboard') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Clock size={48} className="mb-4 opacity-20" />
        <p className="text-lg">Feature {activeTab} is being implemented...</p>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">AI Counselor Flags</h2>
            <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-widest"> Pastoral attention required</p>
          </div>
          <div className="p-4 flex-1 space-y-4">
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
            <button className="w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
              Review All Flagged Chats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
