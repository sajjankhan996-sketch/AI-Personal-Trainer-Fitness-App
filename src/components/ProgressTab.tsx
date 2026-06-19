import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Ruler, Plus, Calendar, Check, AlertCircle, Sparkles, TrendingDown, ArrowDownRight } from 'lucide-react';
import { ProgressLog, User } from '../types.js';
import { api } from '../services/api.js';

interface ProgressProps {
  user: User;
  onUserUpdate: (updater: (prev: User) => User) => void;
}

export default function ProgressTab({ user, onUserUpdate }: ProgressProps) {
  const [history, setHistory] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Log form fields
  const [showLogModal, setShowLogModal] = useState(false);
  const [weight, setWeight] = useState(user.weight?.toString() || '70');
  const [chest, setChest] = useState('95');
  const [waist, setWaist] = useState('80');
  const [arms, setArms] = useState('35');

  const loadHistory = async () => {
    try {
      const data = await api.getProgressHistory();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || "Failed to load progress logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    try {
      const res = await api.logProgress({
        weight: Number(weight),
        chest: Number(chest) || undefined,
        waist: Number(waist) || undefined,
        arms: Number(arms) || undefined
      });
      
      setHistory(prev => [...prev, res.entry].sort((a,b) => a.date.localeCompare(b.date)));
      setShowLogModal(false);

      if (res.user) {
        onUserUpdate(prev => ({
          ...prev,
          xp: res.user.xp,
          level: res.user.level,
          badges: res.user.badges,
          weight: res.user.weight
        }));
      }
    } catch (err: any) {
      setError(err.message || "Failed to log metrics.");
    }
  };

  // Compile premium SVG coordinates
  const renderSvgChart = () => {
    if (history.length === 0) return null;
    
    const chartHeight = 120;
    const chartWidth = 320;
    const padding = 20;

    const weights = history.map(h => h.weight);
    const minWeight = Math.min(...weights) - 2;
    const maxWeight = Math.max(...weights) + 2;
    const weightRange = maxWeight - minWeight || 4;

    const points = history.map((h, index) => {
      const x = padding + (index * (chartWidth - 2 * padding)) / (history.length - 1 || 1);
      const y = chartHeight - padding - ((h.weight - minWeight) * (chartHeight - 2 * padding)) / weightRange;
      return { x, y, value: h.weight, date: h.date };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

    return (
      <div className="relative w-full overflow-x-auto select-none">
        <svg className="w-full min-w-[325px] h-36" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D4FF3F" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#D4FF3F" stopOpacity="0.0"/>
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3 3" />
          <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3 3" />
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255, 255, 255, 0.08)" />

          {/* Glowing Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Plot Path */}
          <path d={pathD} fill="none" stroke="#D4FF3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots & Labels */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="3.5" fill="#0A0A0A" stroke="#D4FF3F" strokeWidth="1.5" />
              <text x={p.x} y={p.y - 8} fontSize="8" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {p.value}kg
              </text>
              <text x={p.x} y={chartHeight - 4} fontSize="6" fill="rgba(255, 255, 255, 0.4)" textAnchor="middle" fontFamily="monospace">
                {p.date.substring(5)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-white/40 space-y-2">
        <div className="w-8 h-8 border-4 border-[#D4FF3F] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Loading body weights...</span>
      </div>
    );
  }

  const latestLog = history[history.length - 1];

  return (
    <div className="space-y-6 font-sans text-white">

      {/* GRAPH CARD */}
      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#D4FF3F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Weight profile trend</h3>
          </div>
          
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center space-x-1 py-1.5 px-3 rounded-xl bg-[#D4FF3F]/10 text-[#D4FF3F] hover:bg-[#D4FF3F]/20 text-[9px] font-black uppercase tracking-widest active:scale-95 transition cursor-pointer border border-[#D4FF3F]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add log</span>
          </button>
        </div>

        {history.length > 1 ? (
          <div className="space-y-4">
            {renderSvgChart()}
            <p className="text-[9px] text-white/40 font-mono text-center uppercase tracking-tight">📈 Horizontal line tracks chronological weigh-in events.</p>
          </div>
        ) : (
          <div className="text-center py-8 bg-[#0A0A0A] p-4 rounded-xl border border-white/5">
            <TrendingDown className="w-8 h-8 text-white/20 mx-auto animate-pulse mb-2" />
            <p className="text-xs text-white-300 font-medium font-bold uppercase tracking-wide">Insufficient data points</p>
            <p className="text-[10px] text-white/40 mt-1 max-w-[200px] mx-auto leading-relaxed">Please add at least 2 progressive weigh-in logs to calculate path graphs.</p>
          </div>
        )}
      </div>

      {/* CURRENT MEASUREMENTS STATS CARD */}
      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Ruler className="w-5 h-5 text-[#00F0FF]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Body Dimensions</h3>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Waist */}
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 text-center">
            <p className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-wider">CHEST</p>
            <p className="text-base font-black text-white italic mt-1">
              {latestLog?.measurements?.chest ? `${latestLog.measurements.chest} cm` : '--'}
            </p>
          </div>

          {/* Waist */}
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 text-center">
            <p className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-wider">WAIST</p>
            <p className="text-base font-black text-white italic mt-1">
              {latestLog?.measurements?.waist ? `${latestLog.measurements.waist} cm` : '--'}
            </p>
          </div>

          {/* Arms */}
          <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 text-center">
            <p className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-wider">ARMS</p>
            <p className="text-base font-black text-white italic mt-1">
              {latestLog?.measurements?.arms ? `${latestLog.measurements.arms} cm` : '--'}
            </p>
          </div>
        </div>

        <p className="text-[9px] text-white/40 font-mono text-right uppercase tracking-wider font-bold">Last logged: {latestLog ? new Date(latestLog.date).toLocaleDateString([], {month: 'short', day: 'numeric'}) : 'Never'}</p>
      </div>

      {/* TRACKING HISTORY LOGS */}
      <div className="space-y-2.5">
        <h4 className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Historical records</h4>

        {history.length > 0 ? (
          <div className="space-y-2">
            {[...history].reverse().map((logItem) => (
              <div
                key={logItem.id}
                className="bg-[#141414] p-3.5 rounded-xl border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-white/5 flex items-center justify-center font-mono font-bold text-[#D4FF3F]">
                    ⚖
                  </div>
                  <div>
                    <p className="font-bold text-white">{logItem.weight} KG logged</p>
                    <p className="text-[10px] text-white/40">
                      C: {logItem.measurements.chest || '--'}cm • W: {logItem.measurements.waist || '--'}cm • A: {logItem.measurements.arms || '--'}cm
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-1.5 text-white/40 text-[10px] font-mono font-bold">
                  <Calendar className="w-3.5 h-3.5 text-[#D4FF3F]" />
                  <span>{logItem.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 bg-[#0A0A0A] text-white/30 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-white/5">No progressive records saved yet.</p>
        )}
      </div>

      {/* LOG MODAL OVERLAY */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4"
            >
              <h3 className="text-base font-bold uppercase italic tracking-tight text-white">Log Today's Dimensions</h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">WEIGHT (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">CHEST (CM)</label>
                    <input
                      type="number"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-[#00F0FF] text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">WAIST (CM)</label>
                    <input
                      type="number"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-[#00F0FF] text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">ARMS (CM)</label>
                    <input
                      type="number"
                      value={arms}
                      onChange={(e) => setArms(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-[#00F0FF] text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 bg-[#0A0A0A] border border-white/5 py-2.5 rounded-xl text-center text-white/50 hover:text-white transition font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4FF3F] text-black font-extrabold uppercase py-2.5 rounded-xl text-center hover:bg-[#c2eb32] transition cursor-pointer border-none outline-none"
                  >
                    Save Log Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
