import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Dumbbell, User, Award, Apple } from 'lucide-react';
import { ChatMessage, User as UserType } from '../types.js';
import { api } from '../services/api.js';

interface AICoachProps {
  user: UserType;
}

export default function AICoachTab({ user }: AICoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts
  const suggestions = [
    { label: "Give me protein advice", icon: <Apple className="w-3.5 h-3.5 text-[#D4FF3F]" /> },
    { label: "Draft a leg day routine", icon: <Dumbbell className="w-3.5 h-3.5 text-[#00F0FF]" /> },
    { label: "Check cardio stamina", icon: <Award className="w-3.5 h-3.5 text-[#D4FF3F]" /> }
  ];

  // Fetch chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const chats = await api.getChatHistory();
        if (chats.length > 0) {
          setMessages(chats);
        } else {
          // Pre-seed greeting if history is totally empty
          setMessages([
            {
              id: 'greeting_0',
              userId: user.id,
              role: 'model',
              message: `Hey ${user.name}! I am Coach FitAI, your personal elite digital fitness trainer. I've examined your goal of **${user.goal === 'lose_weight' ? 'Shredding Fat' : 'Building Muscle'}** and am fully primed to answer your physical regime queries!\n\nWhat are we looking to optimize today? You can ask about particular nutrition breakdowns, form reviews, or let me formulate specific training schedules for you!`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    }
    loadHistory();
  }, [user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    setError(null);
    const userText = text.trim();
    setInputValue('');

    // Pre-insert user message locally
    const tempUserMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      userId: user.id,
      role: 'user',
      message: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userText);
      setMessages(prev => [...prev, res.message]);
    } catch (err: any) {
      setError("I was unable to establish connection with AI core. Please confirm your GEMINI_API_KEY.");
      // Render fallback local help
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          userId: user.id,
          role: 'model',
          message: `Notice from FitAI Server: I could not contact Google's Gemini API because the system token is missing or unauthorized. Please head to Settings > Secrets and configure your GEMINI_API_KEY. Once established, I will provide full high-tier personal coaching answers!`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[74vh] font-sans text-white">
      
      {/* Header Info */}
      <div className="bg-[#141414] rounded-t-2xl border-t border-x border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4FF3F]/10 text-[#D4FF3F] border border-[#D4FF3F]/15 flex items-center justify-center font-display font-bold">
            🏋️
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-tight">Coach FitAI</h3>
            <p className="text-[9px] text-[#D4FF3F] font-mono tracking-widest flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF3F] animate-pulse" />
              ONLINE • PERSONAL AI COACH
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-wider">Gemini 2.5 Pro</span>
      </div>

      {/* Message space */}
      <div className="flex-1 bg-[#0A0A0A] border-x border-white/5 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
              m.role === 'user'
                ? 'bg-[#D4FF3F] text-black font-extrabold rounded-tr-none'
                : 'bg-[#141414] border border-white/5 text-white/90 rounded-tl-none space-y-2'
            }`}>
              <div className="flex items-center justify-between opacity-60 text-[9px] font-mono mb-1">
                <span className={`flex items-center gap-1 font-bold lowercase ${m.role === 'user' ? 'text-black' : 'text-[#D4FF3F]'}`}>
                  {m.role === 'user' ? <User className="w-3 h-3 text-black" /> : <Sparkles className="w-3 h-3 text-[#D4FF3F]" />}
                  {m.role === 'user' ? 'You' : 'Coach FitAI'}
                </span>
                <span className={m.role === 'user' ? 'text-black' : 'text-white/40'}>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <div className="whitespace-pre-wrap font-sans">
                {m.message}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#141414] border border-white/5 max-w-[80%] rounded-2xl p-4 rounded-tl-none space-y-2">
              <div className="flex space-x-1.5 py-1">
                <div className="w-2 h-2 bg-[#D4FF3F] rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-bounce delay-200" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300" />
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-black">Coach is compiling metabolic reviews...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompting anchors */}
      {messages.length < 3 && (
        <div className="bg-[#141414]/40 border-x border-white/5 px-4 py-2 flex flex-wrap gap-2.5">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSendMessage(s.label)}
              className="bg-[#0A0A0A] hover:bg-[#141414] p-2 rounded-xl text-[10px] text-white/70 border border-white/5 flex items-center space-x-1.5 active:scale-95 transition cursor-pointer font-bold tracking-tight"
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input controls box */}
      <div className="bg-[#141414] p-4 rounded-b-2xl border-b border-x border-white/5 flex items-center space-x-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage(inputValue);
          }}
          placeholder="Ask anything about protein, calories, exercises..."
          className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#D4FF3F] text-white placeholder-white/20 font-bold"
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          className="p-3 rounded-xl bg-[#D4FF3F] text-black hover:bg-[#c2eb32] active:scale-95 transition-all shadow-md cursor-pointer border-none outline-none font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
