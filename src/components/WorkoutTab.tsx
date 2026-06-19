import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Check, Dumbbell, Sparkles, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { WorkoutPlan, Exercise, User } from '../types.js';
import { api } from '../services/api.js';

interface WorkoutTabProps {
  user: User;
  onUserUpdate: (updater: (prev: User) => User) => void;
  workout: WorkoutPlan | null;
  onWorkoutUpdate: (workout: WorkoutPlan | null) => void;
}

export default function WorkoutTab({ user, onUserUpdate, workout, onWorkoutUpdate }: WorkoutTabProps) {
  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Focus Area request state
  const [focusArea, setFocusArea] = useState('Full Body Blast');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active exercise selected for display
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  // Stopwatch effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate customized AI workout
  const handleGenerateAIWorkout = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.generateAIWorkout(focusArea);
      onWorkoutUpdate(res.workout);
      setSuccessMsg(res.message);
      setActiveExerciseIndex(0);
      
      // Auto upgrade user level/xp dynamically if backend returned level adjustments
      if (res.workout.xpEarned) {
         // updated with latest profile trigger
      }
    } catch (err: any) {
      setError(err.message || 'We could not generate the plan right now.');
    } finally {
      setLoading(false);
    }
  };

  // Mark specific exercise as finalized
  const handleCompleteExercise = async (exId: string) => {
    if (!workout) return;
    try {
      const res = await api.completeExercise(exId);
      onWorkoutUpdate(res.workout);
      
      if (res.user) {
        onUserUpdate(prev => ({
          ...prev,
          xp: res.user.xp,
          level: res.user.level,
          badges: res.user.badges
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Mark full workout finished
  const handleCompleteFullWorkout = async () => {
    if (!workout) return;
    setLoading(true);
    try {
      const res = await api.completeWorkout();
      onWorkoutUpdate(res.workout);
      setSuccessMsg("Incredible effort! Full session completed successfully!");
      if (res.user) {
        onUserUpdate(prev => ({
          ...prev,
          xp: res.user.xp,
          level: res.user.level,
          badges: res.user.badges
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Error saving workout compilation.');
    } finally {
      setLoading(false);
    }
  };

  const getExerciseAccent = (category: string) => {
    if (category === 'home') return 'border-[#D4FF3F]/30 bg-[#D4FF3F]/10 text-[#D4FF3F]';
    if (category === 'strength') return 'border-[#00F0FF]/30 bg-[#00F0FF]/10 text-[#00F0FF]';
    return 'border-white/15 bg-white/5 text-white/80';
  };

  const currentExercise = workout?.exercises[activeExerciseIndex];

  return (
    <div className="space-y-6 font-sans text-white">
      
      {/* AI PLAN TUNER / GENERATOR */}
      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#D4FF3F]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Workout Coach</h3>
          </div>
          <span className="text-[9px] font-mono bg-[#D4FF3F]/10 text-[#D4FF3F] px-2 py-0.5 rounded border border-[#D4FF3F]/20 uppercase tracking-widest font-black">POWERED BY GEMINI</span>
        </div>

        <p className="text-xs text-white/60 leading-relaxed font-medium">
          Need a personalized program? Specify your objective below, and Coach FitAI will construct a 4-exercise metabolic routine for you in real-time.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <input 
              type="text" 
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              placeholder="e.g. Killer Leg Day / Chest Pump / 20 Min Calisthenics"
              className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/25 transition-all font-medium"
            />
          </div>

          <button
            onClick={handleGenerateAIWorkout}
            disabled={loading}
            className="w-full bg-[#D4FF3F] text-black font-extrabold uppercase py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#c2eb32] active:scale-[0.98] transition cursor-pointer tracking-wider text-xs border-none outline-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Tailor My Strategy Now</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center space-x-2 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-[#D4FF3F]/10 border border-[#D4FF3F]/25 text-[#D4FF3F] p-3 rounded-xl flex items-center space-x-2 text-xs font-bold">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* STOPWATCH TIMER SECTION */}
      <div className="bg-[#141414] rounded-xl border border-white/5 p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">INTERVAL STOPWATCH</p>
          <p className="text-2xl font-mono text-[#D4FF3F] font-black italic">{formatTime(timerSeconds)}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleToggleTimer}
            className="p-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-[#D4FF3F] hover:bg-[#D4FF3F]/10 active:scale-95 transition cursor-pointer"
          >
            {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={handleResetTimer}
            className="p-2.5 rounded-xl bg-[#0A0A0A] border border-white/5 text-white/50 hover:bg-white/5 hover:text-white active:scale-95 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WORKOUT ACTIVE PANEL */}
      {workout ? (
        <div className="space-y-6">
          
          {/* Active exercise Detail card */}
          {currentExercise ? (
            <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              {/* Media placeholder */}
              <div className="relative h-44 bg-[#0A0A0A] flex items-center justify-center p-4 border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none" />
                
                {/* Modern vector layout motif */}
                <span className="absolute bottom-3 left-4 text-[9px] font-mono text-white/30 tracking-widest uppercase font-bold">EXERCISE DETAILS</span>
                <span className={`absolute top-3 right-4 text-[9px] uppercase tracking-wider font-mono border px-2 py-0.5 rounded-full ${getExerciseAccent(currentExercise.category)}`}>
                  {currentExercise.category}
                </span>

                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <Dumbbell className="w-12 h-12 text-[#D4FF3F]/20 animate-pulse" />
                  <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase font-bold">Visual instructions synced</span>
                </div>
              </div>

              {/* Text metadata */}
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold uppercase italic tracking-tight text-white">{currentExercise.name}</h4>
                  <p className="text-xs text-white/50">Targeting: <span className="text-[#D4FF3F] font-bold">{currentExercise.muscleTargeted}</span></p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/5 text-center font-mono">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-white/40 font-bold uppercase">SETS</p>
                    <p className="text-base font-black text-white italic">{currentExercise.sets}</p>
                  </div>
                  <div className="space-y-0.5 border-x border-white/5">
                    <p className="text-[9px] text-white/40 font-bold uppercase">REPS</p>
                    <p className="text-base font-black text-white italic">{currentExercise.reps}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-white/40 font-bold uppercase">REST</p>
                    <p className="text-base font-black text-[#00F0FF] italic">{currentExercise.restTime}</p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-white/80 flex items-center gap-1">
                     <Info className="w-3.5 h-3.5 text-[#00F0FF]" /> Form Guidelines:
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed bg-[#0A0A0A] p-3 rounded-xl border border-white/5">{currentExercise.instructions}</p>
                </div>

                {/* Confirm final execution */}
                <button
                  onClick={() => handleCompleteExercise(currentExercise.id)}
                  disabled={currentExercise.completed}
                  className={`w-full py-3.5 rounded-xl font-extrabold uppercase text-xs tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                    currentExercise.completed
                      ? 'bg-[#D4FF3F]/10 text-[#D4FF3F] border border-[#D4FF3F]/20'
                      : 'bg-[#D4FF3F] text-black hover:bg-[#c2eb32] active:scale-98 border-none outline-none'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{currentExercise.completed ? 'Exercise completed!' : 'Mark this Exercise as Clear'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-white/40 text-xs font-semibold uppercase tracking-wider">No active exercise item selected.</div>
          )}

          {/* Exercise navigation list */}
          <div className="space-y-2.5">
            <h4 className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Exercise List</h4>
            
            <div className="grid grid-cols-1 gap-2">
              {workout.exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  onClick={() => setActiveExerciseIndex(idx)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                    idx === activeExerciseIndex
                      ? 'bg-[#0A0A0A] border-[#D4FF3F]/40'
                      : 'bg-[#141414] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border font-mono text-xs font-bold ${
                      ex.completed 
                        ? 'bg-[#D4FF3F]/20 border-[#D4FF3F]/30 text-[#D4FF3F]' 
                        : 'bg-[#0A0A0A] border-white/5 text-white/40'
                    }`}>
                      {ex.completed ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${ex.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                        {ex.name}
                      </p>
                      <p className="text-[9px] text-white/40 font-mono">
                        {ex.sets} sets • {ex.reps} • {ex.muscleTargeted.split(',')[0]}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 ${idx === activeExerciseIndex ? 'text-[#00F0FF]' : 'text-white/20'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Full Workout Complete button */}
          {!workout.completed && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="pt-4"
            >
              <button
                onClick={handleCompleteFullWorkout}
                disabled={loading}
                className="w-full bg-[#D4FF3F] text-black font-extrabold uppercase py-4 rounded-xl shadow-xl hover:bg-[#c2eb32] active:scale-98 cursor-pointer tracking-wider text-xs border-none outline-none"
              >
                {loading ? 'Completing...' : '🏆 FINALise AND SUBMIT SESSION WORKOUT'}
              </button>
            </motion.div>
          )}

        </div>
      ) : (
        /* Empty default screen */
        <div className="text-center py-10 bg-[#141414] border border-white/5 border-dashed rounded-2xl space-y-4">
          <div className="flex justify-center">
            <Dumbbell className="w-12 h-12 text-white/20" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">No active schedule for today</h4>
            <p className="text-xs text-white/40 max-w-xs mx-auto mt-1 leading-relaxed font-semibold">Specify your preference above and tap "Generate" to spawn your fitness regime with AI!</p>
          </div>
        </div>
      )}

    </div>
  );
}
