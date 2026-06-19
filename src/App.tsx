import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dumbbell, Home, MessageSquare, Apple, LineChart, User as UserIcon, LogOut, Trophy } from 'lucide-react';

import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import DashboardTab from './components/DashboardTab';
import WorkoutTab from './components/WorkoutTab';
import AICoachTab from './components/AICoachTab';
import NutritionTab from './components/NutritionTab';
import ProgressTab from './components/ProgressTab';
import ProfileTab from './components/ProfileTab';
import LeaderboardModal from './components/LeaderboardModal';

import { User, WorkoutPlan } from './types';
import { api, getStoredToken } from './services/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutPlan | null>(null);

  // Validate session on mount
  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          
          // Lazy load scheduled workout
          const schedule = await api.getTodayWorkout();
          setTodayWorkout(schedule);
        } catch (err) {
          console.error("Session verification failed:", err);
          // Purge stale session
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  // Handle successful login or sign up
  const handleAuthSuccess = (authenticatedUser: User, sessionToken: string) => {
    setUser(authenticatedUser);
    setToken(sessionToken);
    
    // Auto load current workout
    api.getTodayWorkout().then(setTodayWorkout).catch(console.error);
  };

  // Complete onboarding flow details
  const handleOnboardingComplete = async (onboardingData: Partial<User>) => {
    setLoading(true);
    try {
      const res = await api.updateProfile(onboardingData);
      setUser(res.user);
      
      // Auto compile initial program
      const schedule = await api.getTodayWorkout();
      setTodayWorkout(schedule);
      
      // Navigate to dashboard
      setActiveTab('home');
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign-out requested
  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setToken(null);
    setTodayWorkout(null);
    setActiveTab('home');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] text-white">
        <Dumbbell className="w-12 h-12 text-[#D4FF3F] animate-bounce mb-3" />
        <p className="text-sm font-display font-medium tracking-tight text-white uppercase italic">
          FitAI Coach
        </p>
        <p className="text-[10px] font-mono text-white/40 mt-1 uppercase tracking-widest">Warming up engines...</p>
      </div>
    );
  }

  // Not logged in -> Show visual Auth screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-8 flex flex-col justify-center">
        <Auth onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Logged in but has NO goal / fitnessLevel -> Force Onboarding flow first
  const needsOnboarding = !user.goal || !user.fitnessLevel;
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] py-8 flex flex-col justify-center">
        <Onboarding user={user} onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Helper function to update today's workout state from child components
  const handleWorkoutUpdate = (updatedPlan: WorkoutPlan | null) => {
    setTodayWorkout(updatedPlan);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      
      {/* CENTEERED CONTAINER WITH DESKTOP RESPONSIVE LIMITS */}
      <div className="w-full max-w-lg mx-auto bg-[#0A0A0A] min-h-screen flex flex-col relative border-x border-white/5 shadow-2xl">
        
        {/* PREMIUM TOP HEADER NAVBAR */}
        <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#D4FF3F] text-black flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight uppercase italic text-white flex items-center gap-1">FitAI Coach</h1>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">PRO METRIC MODULE</p>
            </div>
          </div>

          {/* Controls toolbar */}
          <div className="flex items-center space-x-2">
            {/* Lead board button */}
            <button 
              onClick={() => setShowLeaderboard(true)}
              className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-white/70 hover:text-[#D4FF3F] hover:border-[#D4FF3F]/30 transition flex items-center justify-center cursor-pointer"
              title="View Leaderboard"
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Logout anchor */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-zinc-900 border border-white/5 text-white/50 hover:text-red-400 hover:border-red-500/20 transition flex items-center justify-center cursor-pointer"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* INNER CONTENT TAB PORTS WITH SCROLL */}
        <main className="flex-1 p-5 pb-24 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'home' && (
                <DashboardTab 
                  user={user} 
                  todayWorkout={todayWorkout} 
                  onNavigate={setActiveTab} 
                />
              )}

              {activeTab === 'workout' && (
                <WorkoutTab
                  user={user}
                  onUserUpdate={setUser as any}
                  workout={todayWorkout}
                  onWorkoutUpdate={handleWorkoutUpdate}
                />
              )}

              {activeTab === 'ai-coach' && (
                <AICoachTab user={user} />
              )}

              {activeTab === 'nutrition' && (
                <NutritionTab user={user} />
              )}

              {activeTab === 'progress' && (
                <ProgressTab 
                  user={user} 
                  onUserUpdate={setUser as any} 
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab 
                  user={user} 
                  onUserUpdate={setUser as any} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* BOTTOM FLOATING TAB NAVIGATION FOOTER */}
        <nav className="fixed bottom-0 inset-x-0 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/5 py-3 z-40 max-w-lg mx-auto border-x">
          <div className="grid grid-cols-5 text-center">
            
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center space-y-1.5 bg-transparent border-none outline-none cursor-pointer group ${
                activeTab === 'home' ? 'text-[#D4FF3F]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Home className="w-4.5 h-4.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Home</span>
            </button>

            {/* Workout */}
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex flex-col items-center space-y-1.5 bg-transparent border-none outline-none cursor-pointer group ${
                activeTab === 'workout' ? 'text-[#D4FF3F]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Dumbbell className="w-4.5 h-4.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Workout</span>
            </button>

            {/* AI Coach */}
            <button
              onClick={() => setActiveTab('ai-coach')}
              className={`flex flex-col items-center space-y-1.5 bg-transparent border-none outline-none cursor-pointer group ${
                activeTab === 'ai-coach' ? 'text-[#D4FF3F]' : 'text-white/40 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4.5 h-4.5 animate-pulse" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Coach</span>
            </button>

            {/* Nutrition */}
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex flex-col items-center space-y-1.5 bg-transparent border-none outline-none cursor-pointer group ${
                activeTab === 'nutrition' ? 'text-[#D4FF3F]' : 'text-white/40 hover:text-white'
              }`}
            >
              <Apple className="w-4.5 h-4.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Diet</span>
            </button>

            {/* Progress */}
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex flex-col items-center space-y-1.5 bg-transparent border-none outline-none cursor-pointer group ${
                activeTab === 'progress' ? 'text-[#D4FF3F]' : 'text-white/40 hover:text-white'
              }`}
            >
              <LineChart className="w-4.5 h-4.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Stats</span>
            </button>

          </div>
        </nav>

        {/* MODAL VIEWPORTS */}
        <AnimatePresence>
          {showLeaderboard && (
            <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
