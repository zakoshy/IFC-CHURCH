import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, Church, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { sanitizeText, isBot } from '../lib/security';
import { handleSupabaseError, getFriendlyMessage } from '../lib/errors';

interface AuthFormProps {
  onBack?: () => void;
}

export function AuthForm({ onBack }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot field
  const [role, setRole] = useState<'member' | 'pastor'>('member');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DDoS/Bot Mitigation: Honeypot check
    if (isBot(honeypot)) {
      console.warn('Bot detected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanEmail = sanitizeText(email.trim());
      const cleanName = sanitizeText(fullName.trim());
      
      const isPastorEmail = cleanEmail.toLowerCase() === 'zakayooshome254@gmail.com' || cleanEmail.toLowerCase() === 'edwindezak@gmail.com';
      const finalRole = isPastorEmail ? 'pastor' : role;

      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        if (loginError) throw loginError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password,
          options: {
            data: { full_name: cleanName, role: finalRole }
          }
        });
        if (signUpError) throw signUpError;
        
        setSuccess(true);
      }
    } catch (err: any) {
      const appError = handleSupabaseError(err);
      setError(getFriendlyMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`w-full flex justify-center font-sans overflow-y-auto ${onBack ? 'bg-transparent py-4' : 'min-h-screen bg-slate-50 p-8'}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 my-auto text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Mail size={40} className="animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Activation Link Sent!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            We've sent a secure verification link to <span className="font-semibold text-slate-900">{email}</span>. 
            <br /><br />
            <span className="text-amber-600 font-bold">Important:</span> You must click the link in that email to activate your account before you can log in. If you don't see it, check your spam folder.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => {
                setSuccess(false);
                setIsLogin(true);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-100"
            >
              Back to Login
            </button>
            {onBack && (
              <button 
                onClick={onBack}
                className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors w-full"
              >
                <ArrowLeft size={14} />
                Return to Main Site
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center font-sans overflow-y-auto ${onBack ? 'bg-transparent py-4' : 'min-h-screen bg-slate-50 p-8'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 my-auto"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Church size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Imani Church Manager</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Sign in to your account' : 'Create your church account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field - Hidden from users, filled by bots */}
          <div className="hidden" aria-hidden="true">
            <input 
              type="text" 
              name="website" 
              tabIndex={-1} 
              autoComplete="off" 
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4 flex items-start gap-3">
              <Mail className="text-blue-500 shrink-0" size={16} />
              <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                <span className="font-bold">Security Notice:</span> For your protection, every new account requires email verification. You'll receive a link to activate your account immediately after signing up.
              </p>
            </div>
          )}

          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">
              Email Address 
              {(email.toLowerCase() === 'zakayooshome254@gmail.com' || email.toLowerCase() === 'edwindezak@gmail.com') && !isLogin && (
                <span className="ml-2 text-emerald-600 normal-case font-bold animate-pulse"> (Pastor Account Detected)</span>
              )}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 mt-4 h-12 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6 flex flex-col gap-3">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
          
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors mt-2"
            >
              <ArrowLeft size={14} />
              Return to Main Site
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
