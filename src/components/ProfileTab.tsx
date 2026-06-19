import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, CreditCard, Sparkles, Check, Save, Settings, UserCheck, Bell, Moon } from 'lucide-react';
import { User as UserType } from '../types.js';
import { api } from '../services/api.js';

interface ProfileProps {
  user: UserType;
  onUserUpdate: (updater: (prev: UserType) => UserType) => void;
}

export default function ProfileTab({ user, onUserUpdate }: ProfileProps) {
  // Profile settings state
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age?.toString() || '25');
  const [gender, setGender] = useState(user.gender || 'male');
  const [height, setHeight] = useState(user.height?.toString() || '175');
  const [weight, setWeight] = useState(user.weight?.toString() || '70');
  const [goal, setGoal] = useState(user.goal || 'lose_weight');
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(user.fitnessLevel || 'intermediate');
  const [workoutPreference, setWorkoutPreference] = useState<'home' | 'gym' | 'no_equipment'>(user.workoutPreference || 'gym');

  // App preference configurations
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  // General loader feedback states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle updates profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const res = await api.updateProfile({
        name,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        goal,
        fitnessLevel,
        workoutPreference
      });

      onUserUpdate(() => res.user);
      setSuccess(res.message);
    } catch (err: any) {
      setSuccess("Error: Could not save parameters correctly.");
    } finally {
      setLoading(false);
    }
  };

  // Handle premium upgrade trigger
  const handleUpgradeSubscription = async () => {
    setLoading(true);
    setSuccess(null);
    try {
      const res = await api.updateProfile({
        subscriptionStatus: 'premium'
      });

      onUserUpdate(() => res.user);
      setSuccess("Congratulations! Infinite Pro AI Coaching features are now active!");
    } catch (err: any) {
      setSuccess("Upgrade failed. Please verify API pathways.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-white">

      {/* MEMBERSHIP AND SUBSCRIPTION STATUS */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 shadow-xl transition-all">
        {user.subscriptionStatus === 'premium' ? (
          /* Premium active status view */
          <div className="bg-[#D4FF3F] p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-black/60 uppercase font-mono font-black tracking-wider">
                  <Shield className="w-4 h-4 fill-black/10 text-black" />
                  <span>Pro Coach Membership</span>
                </div>
                <h3 className="text-xl font-bold uppercase italic tracking-tight text-black">FitAI Premium Coach</h3>
                <p className="text-xs text-black/80 font-bold leading-normal">
                  🥇 Elite credentials fully unlocked. Advanced nutrition models, unlimited workouts generation, and exclusive Gemini AI training insights are active.
                </p>
              </div>
              <span className="text-[10px] font-mono font-black text-white bg-black px-2.5 py-1 rounded inline-block uppercase select-none tracking-widest">ACTIVE</span>
            </div>
          </div>
        ) : (
          /* Subscription pricing promo flow */
          <div className="bg-[#141414] p-5 border border-white/5 space-y-4 relative">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#D4FF3F]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-[#D4FF3F] tracking-widest font-black uppercase">LIMITED TIME UPGRADE PROMO</span>
                <h3 className="text-lg font-bold uppercase italic tracking-tight text-white">Unleash Ultimate Fitness</h3>
              </div>
              <Sparkles className="w-5 h-5 text-[#D4FF3F]" />
            </div>

            {/* Features check columns */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-white/50 font-mono uppercase tracking-tight font-bold">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D4FF3F]" /> Unrestricted Gemini chat
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D4FF3F]" /> Custom diets & macros
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D4FF3F]" /> Advanced progress charts
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D4FF3F]" /> Core badging rewards
              </div>
            </div>

            {/* Pricing card row */}
            <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-mono text-white/40 line-through tracking-wider font-bold">$14.99/MO</p>
                <p className="text-lg font-black text-[#D4FF3F] italic">$9.99 <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-tight">/ month</span></p>
              </div>
              <button
                onClick={handleUpgradeSubscription}
                className="bg-[#D4FF3F] hover:bg-[#c2eb32] text-black font-extrabold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow-lg active:scale-95 transition cursor-pointer uppercase font-sans tracking-wider"
              >
                <CreditCard className="w-3.5 h-3.5 text-black" />
                <span>Go Pro</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED PROFILE EDIT FORM */}
      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
        <h3 className="text-xs font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
          <Settings className="w-4 h-4 text-[#D4FF3F]" /> Physical Profile Metrics
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1.5">DISPLAY USERNAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1.5">AGE (YEARS)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1.5">BIOLOGICAL GENDER</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-bold"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1.5">HEIGHT (CM)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1.5">WEIGHT (KG)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-2">FITNESS EXPECTATION PROTOCOL</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-bold"
            >
              <option value="lose_weight">Lose Weight / Fat-loss Burn</option>
              <option value="build_muscle">Build Muscle / Hypertrophy Growth</option>
              <option value="maintain_fitness">Maintain Fitness & Definition</option>
              <option value="improve_stamina">Improve Stamina / HIIT Endurance</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1.5">EXPERIENCE</label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value as any)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-2 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-bold"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1.5">TRIAL SPACE</label>
              <select
                value={workoutPreference}
                onChange={(e) => setWorkoutPreference(e.target.value as any)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-2 py-2.5 outline-none focus:border-[#D4FF3F] text-white font-bold"
              >
                <option value="gym">Commercial Gym</option>
                <option value="home">Home Setup</option>
                <option value="no_equipment">Calisthenics</option>
              </select>
            </div>
          </div>

          {success && (
            <div className="bg-[#D4FF3F]/10 border border-[#D4FF3F]/20 text-[#D4FF3F] p-3 rounded-xl text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5">
              <span>🎉</span> {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4FF3F] hover:bg-[#c2eb32] text-black font-extrabold py-3.5 px-4 rounded-xl shadow-md active:scale-98 transition flex items-center justify-center space-x-1.5 cursor-pointer uppercase tracking-wider font-sans border-none outline-none"
          >
            <Save className="w-4 h-4 text-black" />
            <span>{loading ? 'Saving Metrics...' : 'Save Profile Details'}</span>
          </button>
        </form>
      </div>

      {/* SYSTEM AND CONFIG PERMISSIONS */}
      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
        <h3 className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Device Customisation</h3>

        <div className="space-y-3.5 text-xs">
          
          {/* Notifications config */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-white flex items-center gap-1.5 uppercase text-xs">
                <Bell className="w-3.5 h-3.5 text-[#00F0FF]" /> Daily Workout Alerts
              </p>
              <p className="text-[10px] text-white/40 font-medium">Remind me to complete core training schedules</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-6 rounded-full p-1 transition-all flex items-center cursor-pointer border-none outline-none ${notifications ? 'bg-[#D4FF3F]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 bg-black rounded-full transition-transform ${notifications ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Dark Mode presets */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="space-y-0.5">
              <p className="font-bold text-white flex items-center gap-1.5 uppercase text-xs">
                <Moon className="w-3.5 h-3.5 text-white/80" /> Ultra Dark Theme
              </p>
              <p className="text-[10px] text-white/40 font-medium">Optimizes screen contrast during weight cycles</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-6 rounded-full p-1 transition-all flex items-center cursor-pointer border-none outline-none ${darkMode ? 'bg-[#00F0FF]' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 bg-black rounded-full transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
