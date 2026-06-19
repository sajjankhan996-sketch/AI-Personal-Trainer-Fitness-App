import React from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Trophy, Zap, Flame, Scale, TrendingUp, Sparkles } from 'lucide-react';
import { User, WorkoutPlan } from '../types.js';

interface DashboardTabProps {
  user: User;
  todayWorkout: WorkoutPlan | null;
  onNavigate: (tab: string) => void;
}

export default function DashboardTab({ user, todayWorkout, onNavigate }: DashboardTabProps) {
  // Calculate level progress (e.g. 1000 XP per level)
  const currentLvlXp = user.xp % 1000;
  const xpNeededForNext = 1000;
  const progressPercent = Math.min(100, (currentLvlXp / xpNeededForNext) * 100);

  // Quick statistics calculation
  const totalCompletedWorkouts = user.xp / 200; // estimated helper
  const caloriesBurnedEstimate = Math.round(user.xp * 0.8) + (todayWorkout?.completed ? 450 : 0);
  const streakDays = user.badges.includes('7 Day Streak') ? 7 : user.badges.includes('30 Day Challenge') ? 14 : 3;

  // Render badge icons dynamically
  const getBadgeIcon = (badgeName: string) => {
    if (badgeName === 'First Workout') return '🎖️';
    if (badgeName === '7 Day Streak') return '🔥';
    if (badgeName === '30 Day Challenge') return '🏆';
    if (badgeName === 'Fitness Enthusiast') return '⭐';
    if (badgeName === 'Fitness Beast') return '👹';
    return '⚡';
  };

  const getGoalLabel = (goalStr?: string) => {
    if (goalStr === 'lose_weight') return 'Fat Loss / Shred';
    if (goalStr === 'build_muscle') return 'Hypertrophy / Bulk';
    if (goalStr === 'maintain_fitness') return 'Maintain Fitness';
    if (goalStr === 'improve_stamina') return 'Endurance HIIT';
    return 'General Core';
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between bg-[#141414] p-5 rounded-2xl border border-white/5 shadow-xl"
      >
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-[#D4FF3F] tracking-widest uppercase font-bold">WELCOME BACK</p>
          <h2 className="text-xl font-bold uppercase italic tracking-tight text-white flex items-center gap-1.5">
            {user.name} <span className="animate-pulse">👋</span>
          </h2>
          <p className="text-xs text-white/50">
            Goal: <span className="text-[#D4FF3F] font-bold">{getGoalLabel(user.goal)}</span> • {user.workoutPreference === 'gym' ? 'Gym Focus' : 'Home-Bodyweight'}
          </p>
        </div>

        {/* Level Emblem */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-1 bg-[#D4FF3F]/10 rounded-xl blur-sm opacity-50 group-hover:opacity-80 transition" />
          <div className="relative bg-[#0A0A0A] px-4 py-2.5 rounded-xl border border-white/5 flex flex-col items-center justify-center min-w-16">
            <span className="text-[9px] font-mono text-white/40 tracking-wider font-bold">LVL</span>
            <span className="text-2xl font-black text-[#D4FF3F] italic">
              {user.level}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Gamification Progress Bar */}
      <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 space-y-2.5">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-white/40 tracking-wider">XP PROGRESS ({currentLvlXp} / {xpNeededForNext} XP)</span>
          <span className="text-[#00F0FF] font-bold tracking-wider">Level {user.level + 1} unlocks soon</span>
        </div>
        <div className="w-full h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden border border-white/5 flex">
          <div 
            className="h-full bg-[#D4FF3F] rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[9px] text-white/40 font-mono text-right tracking-tight">Earn +50 XP per exercise & +150 XP per routine completed!</p>
      </div>

      {/* Today's Workout Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => onNavigate('workout')}
        className="relative group overflow-hidden bg-[#141414] rounded-2xl p-5 border border-white/5 hover:border-[#D4FF3F]/30 cursor-pointer shadow-xl transition-all"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4FF3F]/5 rounded-full blur-2xl group-hover:bg-[#D4FF3F]/10 transition-all pointer-events-none" />
        
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-[#D4FF3F] font-mono tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-[#D4FF3F] animate-pulse" />
              <span className="uppercase text-[9px] tracking-widest">TODAY'S WORKOUT PROTOCOL</span>
            </div>
            
            {todayWorkout ? (
              <div className="space-y-1 mt-2.5">
                <h3 className="text-base font-bold text-white group-hover:text-[#D4FF3F] transition-colors uppercase italic tracking-tight">
                  {todayWorkout.completed ? '🎉 Session Completed!' : '⚡ Active Routine'}
                </h3>
                <p className="text-xs text-white/50">
                  {todayWorkout.exercises.filter(e => e.completed).length} of {todayWorkout.exercises.length} exercises cleared
                </p>
              </div>
            ) : (
              <div className="space-y-1 mt-2.5">
                <h3 className="text-base font-bold text-white group-hover:text-[#D4FF3F] transition-colors uppercase italic tracking-tight">No scheduled routine</h3>
                <p className="text-xs text-white/50">Tap to generate an elite session with AI</p>
              </div>
            )}
          </div>

          <div className="w-11 h-11 rounded-xl bg-[#D4FF3F]/10 text-[#D4FF3F] flex items-center justify-center border border-[#D4FF3F]/10 group-hover:scale-105 transition-all">
            <Dumbbell className="w-5 h-5" />
          </div>
        </div>

        {todayWorkout && (
          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
            <span className="text-white/40">
              {todayWorkout.completed ? 'Perfect streak preserved!' : 'Clear today\'s lists to level up!'}
            </span>
            <span className="text-[#D4FF3F] hover:underline font-bold flex items-center gap-1">
              {todayWorkout.completed ? 'Review exercises' : 'Start now'} &rarr;
            </span>
          </div>
        )}
      </motion.div>

      {/* Subscription banner if Free */}
      {user.subscriptionStatus === 'free' && (
        <div 
          onClick={() => onNavigate('profile')}
          className="bg-[#D4FF3F]/5 border border-[#D4FF3F]/10 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-[#D4FF3F]/20 transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className="text-black bg-[#D4FF3F] w-8 h-8 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-tight">Unlock Premium Coach Mode</p>
              <p className="text-[10px] text-white/50 font-medium">Gain unlimited Gemini custom workouts and dietary analytics</p>
            </div>
          </div>
          <p className="text-[9px] font-mono font-black text-black px-2 py-1 bg-[#D4FF3F] rounded-md uppercase tracking-wider">PRO</p>
        </div>
      )}

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Calories Card */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">ENERGY BURN</span>
            <div className="text-[#D4FF3F]"><Flame className="w-4 h-4" /></div>
          </div>
          <div>
            <p className="text-2xl font-bold uppercase italic tracking-tight text-white">
              {caloriesBurnedEstimate} <span className="text-xs text-white/40 font-normal">kcal</span>
            </p>
            <p className="text-[9px] text-white/40 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="text-[#D4FF3F] w-3 h-3" /> Metabolic load active
            </p>
          </div>
        </div>

        {/* Workout Streak */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">STREAK</span>
            <div className="text-[#D4FF3F]"><Zap className="w-4 h-4" /></div>
          </div>
          <div>
            <p className="text-2xl font-bold uppercase italic tracking-tight text-white">
              {streakDays} <span className="text-xs text-white/40 font-normal">days</span>
            </p>
            <p className="text-[9px] text-[#D4FF3F] flex items-center gap-0.5 mt-0.5 font-bold">
              🔥 Keep active streak alive!
            </p>
          </div>
        </div>

        {/* Current Weight */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">WEIGHT LOG</span>
            <div className="text-[#00F0FF]"><Scale className="w-4 h-4" /></div>
          </div>
          <div>
            <p className="text-2xl font-bold uppercase italic tracking-tight text-white">
              {user.weight ?? '--'} <span className="text-xs text-white/40 font-normal">kg</span>
            </p>
            <p className="text-[9px] text-white/40 flex items-center gap-0.5 mt-0.5">
              🎯 Target: Body recomposition
            </p>
          </div>
        </div>

        {/* Experience Points */}
        <div className="bg-[#141414] rounded-2xl p-4 border border-white/5 flex flex-col justify-between h-28 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">RATING</span>
            <div className="text-white/80"><Trophy className="w-4 h-4" /></div>
          </div>
          <div>
            <p className="text-2xl font-bold uppercase italic tracking-tight text-white">
              {user.xp} <span className="text-xs text-white/40 font-normal">XP</span>
            </p>
            <p className="text-[9px] text-white/40 flex items-center gap-0.5 mt-0.5">
              🏆 Rank: Elite Trainee
            </p>
          </div>
        </div>

      </div>

      {/* GAMIFICATION ACHIEVEMENTS / BADGES */}
      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#D4FF3F]" /> Unlocked Badges ({user.badges.length})
          </h3>
          <span className="text-[9px] font-mono text-white/40 font-bold uppercase">Auto-calculated</span>
        </div>

        {user.badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {user.badges.map((badge, index) => (
              <motion.div
                key={badge}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#0A0A0A] border border-white/5 p-2.5 rounded-xl flex items-center space-x-2.5"
              >
                <span className="text-xl bg-[#141414] p-1.5 rounded-lg border border-white/5">
                  {getBadgeIcon(badge)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{badge}</p>
                  <p className="text-[9px] text-white/40">Logged item achievement</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-[#0A0A0A] rounded-xl border border-dashed border-white/5">
            <span className="text-2xl">⚡</span>
            <p className="text-xs text-white/60 mt-1 font-medium">No achievements unlocked yet</p>
            <p className="text-[10px] text-white/40">Mark exercises completed under 'Workout' to trigger badges!</p>
          </div>
        )}
      </div>

    </div>
  );
}
