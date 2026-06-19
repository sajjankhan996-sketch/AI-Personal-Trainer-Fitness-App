import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Sparkles, User, Shield } from 'lucide-react';
import { LeaderboardEntry } from '../types.js';
import { api } from '../services/api.js';

interface LeaderboardModalProps {
  onClose: () => void;
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await api.getLeaderboard();
        setEntries(res);
      } catch (err) {
        console.error("Could not fetch leaderboard ranks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans text-white">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="w-full max-w-sm bg-[#141414] rounded-2xl border border-white/5 shadow-2xl overflow-hidden relative animate-in fade-in"
      >
        {/* Absolute banner glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#D4FF3F] to-[#00F0FF]" />
        
        {/* Header toolbar */}
        <div className="p-4 flex justify-between items-center bg-[#0A0A0A]/50 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-[#D4FF3F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Global Standings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-white/50 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          
          <div className="bg-[#0A0A0A] text-[9.5px] text-white/40 font-mono tracking-widest text-center py-1.5 rounded border border-white/5 uppercase font-bold">
            COMPETITION TRACK REGISTER ACTIVE
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2 text-white/40">
              <div className="w-5 h-5 border-2 border-[#D4FF3F] border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-black">Querying rankings...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={entry.name}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      entry.isCurrentUser
                        ? 'bg-[#D4FF3F]/10 border-[#D4FF3F]/30 shadow-md animate-pulse'
                        : 'bg-[#0A0A0A]/50 border-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Rank Indicator Badge */}
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-black ${
                        rank === 1 ? 'bg-[#D4FF3F]/20 text-[#D4FF3F] border border-[#D4FF3F]/20' :
                        rank === 2 ? 'bg-white/10 text-white' :
                        rank === 3 ? 'bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/20' :
                        'text-white/30 font-bold'
                      }`}>
                        {rank}
                      </span>

                      {/* Avatar */}
                      <span className="text-xl select-none">{entry.avatar}</span>

                      {/* Name metadata */}
                      <div>
                        <p className={`text-xs font-bold font-sans flex items-center gap-1.5 ${entry.isCurrentUser ? 'text-[#D4FF3F]' : 'text-white'}`}>
                          {entry.name}
                          {entry.isCurrentUser && <span className="text-[8px] font-mono font-black bg-[#D4FF3F] text-black px-1.5 py-0.5 rounded tracking-widest">YOU</span>}
                        </p>
                        <p className="text-[9px] text-white/40 font-mono tracking-wider font-bold">LEVEL {entry.level}</p>
                      </div>
                    </div>

                    {/* XP Standing */}
                    <div className="text-right">
                      <p className="text-xs font-bold text-white font-mono">{entry.xp} <span className="text-[9px] text-white/40 font-normal">XP</span></p>
                      <p className="text-[8px] text-white/40 font-mono font-bold tracking-wider">MATCH METRIC</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Motivational message */}
        <div className="p-4 bg-[#0A0A0A]/80 border-t border-white/5 text-center text-[10px] text-white/40 leading-relaxed font-mono font-bold uppercase tracking-wide">
          🏋️ CONSISTENCY BUILDS PEAKS. Mark your training list clear under the 'Workout' section to scale ranks!
        </div>
      </motion.div>
    </div>
  );
}
