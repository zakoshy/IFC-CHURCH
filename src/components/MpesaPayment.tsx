import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { HandCoins, Smartphone, Apple, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MpesaPayment() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('tithe');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'finishing'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStep('processing');
    
    // In a real app, this would hit the backend route we created
    // app.post('/api/mpesa/stkpush')
    
    setTimeout(() => {
      setStep('finishing');
      setLoading(false);
    }, 4000);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-sm">
            <HandCoins size={32} />
          </div>
          <h2 className="text-2xl font-bold">Safe Giving</h2>
          <p className="text-emerald-100 text-sm mt-1">Support the ministry via Lipa na M-Pesa</p>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.form 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-3">
                  {['tithe', 'offering', 'donation', 'other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`py-3 rounded-xl border text-sm font-bold capitalize transition-all ${
                        type === t 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Amount (KES)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">KES</span>
                    <input 
                      type="number" 
                      required 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">M-Pesa Phone Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                  <ShieldCheck className="text-amber-600 shrink-0" size={20} />
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                    You will receive an STK Push on your phone to enter your PIN. Please do not close the app until confirmed.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-100 transform active:scale-[0.98]"
                >
                  Give Now
                </button>
              </motion.form>
            )}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                  <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Request Sent</h3>
                  <p className="text-slate-500 max-w-[240px] mx-auto mt-2">Please check your phone for the M-Pesa PIN prompt.</p>
                </div>
              </motion.div>
            )}

            {step === 'finishing' && (
              <motion.div 
                key="finishing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">May God Bless You!</h3>
                  <p className="text-slate-500 mt-2">Your contribution has been received successfully. A receipt has been added to your giving history.</p>
                </div>
                <button 
                  onClick={() => setStep('form')}
                  className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-4 grayscale opacity-50">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
            <Smartphone size={12} /> MPESA
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
             VISA
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
             MASTER
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
        <HelpCircle size={16} />
        <span className="text-xs">Securely processed by Daraja API</span>
      </div>
    </div>
  );
}
