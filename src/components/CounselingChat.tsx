import React, { useState, useRef, useEffect } from 'react';
import { ai, SCRIPTURE_SYSTEM_PROMPT } from '../lib/gemini';
import { CounselingResponse } from '../types';
import { Send, Bot, User, Sparkles, MessageCircle, AlertTriangle, Book, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export function CounselingChat() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string; verses?: string[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: SCRIPTURE_SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text) as CounselingResponse;
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.response,
        verses: data.bible_verses
      }]);

      // If category is serious, we could show a notice to the user
      if (data.category === 'serious_emotional_distress') {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: "I notice you are going through a very difficult time. Please remember that you are not alone. Beyond our conversation here, you can reach out directly to Pastor James at 0722-XXX-XXX or call the national helpline at 116 for immediate support." 
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I encountered an error. Let's pray together instead." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionStarted) {
    return (
      <div className="max-w-2xl mx-auto h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
          <MessageCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Scripture Counseling</h2>
        <p className="text-slate-500 mb-8 max-w-md">Seek spiritual guidance, find peace in the Word, and share what's on your heart in a private, compassionate space.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
          <div className="p-4 bg-white border border-slate-100 rounded-2xl text-left shadow-sm">
            <Book size={18} className="text-indigo-600 mb-2" />
            <p className="text-sm font-bold text-slate-800">Bible Wisdom</p>
            <p className="text-xs text-slate-500">Every response is rooted in Holy Scripture.</p>
          </div>
          <div className="p-4 bg-white border border-slate-100 rounded-2xl text-left shadow-sm">
            <AlertTriangle size={18} className="text-indigo-600 mb-2" />
            <p className="text-sm font-bold text-slate-800">Private & Safe</p>
            <p className="text-xs text-slate-500">Confidential guidance, flagged only for extreme distress.</p>
          </div>
        </div>

        <button 
          onClick={() => setSessionStarted(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all transform hover:scale-105"
        >
          Start New Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-emerald-500 shadow-lg shadow-slate-900/10">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Scripture Counselor</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">System Secure</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setSessionStarted(false)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
          title="End Session"
        >
          <History size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <Sparkles size={32} className="text-slate-400 mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest">Awaiting interaction</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm ${
              msg.role === 'user' ? 'bg-white border border-slate-100 text-slate-600' : 'bg-slate-900 text-emerald-400'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                msg.role === 'user' ? 'bg-white border border-slate-100 text-slate-800 rounded-tr-none' : 'bg-slate-900 text-slate-100 rounded-tl-none'
              }`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              
              {msg.verses && msg.verses.length > 0 && (
                <div className={`flex flex-wrap gap-2 mt-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.verses.map((v, idx) => (
                    <span key={idx} className="bg-white text-slate-600 text-[9px] font-bold px-2 py-1 rounded border border-slate-200 flex items-center gap-1 uppercase tracking-tighter">
                      <Book size={9} /> {v}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Search scripture or share your heart..." 
            className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-full text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all disabled:opacity-50 placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors disabled:bg-slate-300 shadow-lg"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
