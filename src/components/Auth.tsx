import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Lock, Mail, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { User as UserType } from '../types.js';

interface AuthProps {
  onSuccess: (user: UserType, token: string) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError("Please fill out all mandatory credentials.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        onSuccess(res.user, res.token);
      } else {
        const res = await api.register({ name, email, password });
        onSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please confirm your entries.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4 text-white font-sans">
      <div className="w-full max-w-sm bg-[#141414] rounded-2xl border border-white/5 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Subtle decorative glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF3F]/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00F0FF]/5 rounded-full blur-3xl transform -translate-x-10 translate-y-10" />

        {/* Brand Banner */}
        <div className="text-center space-y-2 relative">
          <div className="mx-auto w-12 h-12 bg-[#D4FF3F]/10 text-[#D4FF3F] rounded-xl flex items-center justify-center border border-[#D4FF3F]/20 mb-2">
            <Dumbbell className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold uppercase italic tracking-tight text-white">
            FitAI Coach
          </h1>
          <p className="text-xs text-white/50">
            {isLogin ? 'Welcome back! Sign in to match schedules.' : 'Construct your biometric record to start.'}
          </p>
        </div>

        {/* Error panel */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center space-x-2 text-xs relative">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs relative">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-white/40 font-mono text-[9px] uppercase tracking-wider">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/25 text-white text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-white/40 font-mono text-[9px] uppercase tracking-wider">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                required
                placeholder="e.g. user@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/25 text-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-white/40 font-mono text-[9px] uppercase tracking-wider">PASSCODE</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/25 text-white text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4FF3F] text-black font-extrabold uppercase py-3.5 rounded-xl text-center hover:bg-[#c2eb32] active:scale-98 transition flex items-center justify-center cursor-pointer tracking-wider text-xs"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isLogin ? 'Access Coach Terminal' : 'Register Account'}</span>
            )}
          </button>
        </form>

        {/* Footer toggles */}
        <div className="text-center pt-2 text-xs text-white/50 relative">
          <p>
            {isLogin ? "New to FitAI Coach?" : "Already holding credentials?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#D4FF3F] font-bold ml-1.5 hover:underline bg-transparent border-none cursor-pointer"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
