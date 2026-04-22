import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { UserRole, Profile } from './types';
import { 
  Users, 
  Calendar, 
  Heart, 
  MessageCircle, 
  LayoutDashboard, 
  BookOpen, 
  HandCoins, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  Book,
  Home,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardPastor } from './components/DashboardPastor';
import { DashboardMember } from './components/DashboardMember';
import { AuthForm } from './components/AuthForm';
import { LandingPage } from './components/LandingPage';
import { BibleReader } from './components/BibleReader';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('landing');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        setActiveTab('dashboard');
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        setActiveTab('dashboard');
      } else {
        setProfile(null);
        setLoading(false);
        setActiveTab('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();
    
    if (data) setProfile(data);
    setLoading(false);
  }

  const handleSignOut = () => supabase.auth.signOut();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-emerald-600 font-bold text-2xl"
        >
          IFC CHURCH
        </motion.div>
      </div>
    );
  }

  const role = profile?.role || 'member';

  const menuItems = role === 'pastor' ? [
    { id: 'landing', label: 'View Landing Page', icon: Home },
    { id: 'manage_landing', label: 'Manage Landing', icon: Megaphone },
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'finances', label: 'Giving (M-Pesa)', icon: HandCoins },
    { id: 'requests', label: 'Prayer Wall', icon: Heart },
    { id: 'sermons', label: 'Sermons', icon: BookOpen },
    { id: 'bible', label: 'Holy Bible', icon: Book },
  ] : [
    { id: 'landing', label: 'Landing Page', icon: Home },
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'counseling', label: 'AI Counsel', icon: MessageCircle },
    { id: 'give', label: 'Give via M-Pesa', icon: HandCoins },
    { id: 'attendance', label: 'My Record', icon: Calendar },
    { id: 'requests', label: 'Prayer Requests', icon: Heart },
    { id: 'bible', label: 'Holy Bible', icon: Book },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab('landing');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Only shown when logged in */}
      <AnimatePresence mode="wait">
        {session && sidebarOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 z-20"
          >
            <div className="p-6 border-bottom border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-white uppercase shadow-sm">I</div>
                <span className="text-xl font-bold tracking-tight">IFC CHURCH</span>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === item.id ? 'text-emerald-400' : ''}`} />
                  {item.label}
                  {item.id === 'counseling' && (
                     <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">4</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold uppercase ring-2 ring-slate-700/50">
                  {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Member'}</p>
                  <p className="text-slate-400 uppercase tracking-widest text-[9px] font-medium">{role}</p>
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full mt-4 flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header - Different for Guests vs Members */}
        {session ? (
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-slate-800 capitalize">
                {activeTab === 'landing' ? 'Public Website View' : activeTab.replace(/([A-Z]|_)/g, ' $1').trim()}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search resources..." 
                  className="bg-slate-100 border-none rounded-full px-10 py-1.5 text-sm w-64 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
              </div>
            </div>
          </header>
        ) : (
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 md:px-12 z-20 sticky top-0 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-600/20">I</div>
              <span className="text-xl font-black tracking-tighter text-slate-900">IFC CHURCH</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
               <button onClick={() => setActiveTab('landing')} className="hover:text-emerald-600 transition-colors cursor-pointer">Home</button>
               <button onClick={() => scrollToSection('vision')} className="hover:text-emerald-600 transition-colors cursor-pointer">Vision</button>
               <button onClick={() => scrollToSection('announcements')} className="hover:text-emerald-600 transition-colors cursor-pointer">Announcements</button>
               <button onClick={() => scrollToSection('connect')} className="hover:text-emerald-600 transition-colors cursor-pointer">Contact</button>
            </div>
            <button 
              onClick={() => setShowAuth(true)}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
            >
              Sign In / Join
            </button>
          </header>
        )}

        {/* Content Area */}
        <div className={`flex-1 overflow-y-auto ${session ? 'p-6' : 'p-0'}`}>
          <div className={`${session ? 'max-w-7xl mx-auto h-full' : 'w-full'}`}>
            {showAuth && !session ? (
              <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-md">
                   <button 
                    onClick={() => setShowAuth(false)} 
                    className="absolute -top-12 right-0 text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  >
                    Close <X size={20} />
                  </button>
                   <AuthForm onBack={() => setShowAuth(false)} />
                </div>
              </div>
            ) : null}

            {activeTab === 'landing' ? (
              <LandingPage />
            ) : activeTab === 'bible' ? (
              <BibleReader />
            ) : !session ? (
              <LandingPage />
            ) : role === 'pastor' ? (
              <DashboardPastor activeTab={activeTab} />
            ) : (
              <DashboardMember activeTab={activeTab} profile={profile} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
