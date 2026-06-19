import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Dumbbell, Trophy, ArrowRight, User, Gauge } from 'lucide-react';
import { User as UserType } from '../types.js';

interface OnboardingProps {
  onComplete: (data: Partial<UserType>) => void;
  user: UserType;
}

export default function Onboarding({ onComplete, user }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [goal, setGoal] = useState('lose_weight');
  const [workoutPreference, setWorkoutPreference] = useState<'home' | 'gym' | 'no_equipment'>('gym');

  const goals = [
    { id: 'lose_weight', label: 'Lose Weight', desc: 'Burn fat and get leaner with calorie-deficit guidance.', icon: '🔥' },
    { id: 'build_muscle', label: 'Build Muscle', desc: 'Gain mass and lift heavier with hypertrophic training.', icon: '💪' },
    { id: 'maintain_fitness', label: 'Maintain Fitness', desc: 'Keep highly active, tone up, and feel energetic.', icon: '✨' },
    { id: 'improve_stamina', label: 'Improve Stamina', desc: 'Boost respiratory thresholds with high-pace HIIT.', icon: '🏃' }
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        fitnessLevel,
        goal,
        workoutPreference
      });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 font-sans text-white">
      <div className="w-full max-w-sm bg-[#141414] rounded-2xl border border-white/5 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4FF3F]/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00F0FF]/5 rounded-full blur-3xl transform -translate-x-10 translate-y-10" />

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-8 flex overflow-hidden">
          <div 
            className="h-full bg-[#D4FF3F] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Header indicator */}
        <div className="flex items-center justify-between text-xs text-white/40 font-mono mb-4">
          <span className="uppercase tracking-widest text-[9px]">FitAI Coach Setup</span>
          <span>Step {step} of 4</span>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#D4FF3F]/10 text-[#D4FF3F] rounded-2xl flex items-center justify-center border border-[#D4FF3F]/20">
                <Dumbbell className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold uppercase italic tracking-tight text-white">
                Welcome, {user.name}!
              </h1>
              <p className="text-xs text-white/60 leading-relaxed">
                Let's tailor your personalized AI training protocols. Tell us about yourself so we can dial in your core metrics.
              </p>
            </div>

            <div className="bg-[#0A0A0A] rounded-xl p-4 border border-white/5 space-y-3">
              <div className="flex items-start space-x-3 text-xs">
                <Trophy className="w-4 h-4 text-[#D4FF3F] flex-shrink-0 mt-0.5" />
                <span className="text-white/70">Customized workouts generated directly using Google's elite Gemini AI model.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <Gauge className="w-4 h-4 text-[#00F0FF] flex-shrink-0 mt-0.5" />
                <span className="text-white/70">Advanced gamification. Level up, earn badges, and dominate the leaderboard!</span>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            <h2 className="text-xl font-bold uppercase italic tracking-tight text-white mb-2 flex items-center gap-2">
              <User className="text-[#D4FF3F] w-5 h-5" /> About You
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">AGE</label>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">GENDER</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/20 transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">HEIGHT (CM)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">WEIGHT (KG)</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4FF3F] focus:ring-1 focus:ring-[#D4FF3F]/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-2">FITNESS EXPERIENCE LEVEL</label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFitnessLevel(lvl)}
                    className={`py-2.5 px-1 text-center capitalize rounded-xl text-xs border transition-all cursor-pointer ${
                      fitnessLevel === lvl
                        ? 'bg-[#D4FF3F] border-[#D4FF3F] text-black font-extrabold'
                        : 'bg-[#0A0A0A] border-white/5 text-white/50 hover:text-white hover:border-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold uppercase italic tracking-tight text-white mb-1">What is your fitness goal?</h2>
            <p className="text-xs text-white/50 mb-3">AI algorithm uses objectives to customize sets and macros.</p>

            <div className="space-y-2.5">
              {goals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full flex items-center space-x-3 p-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                    goal === g.id
                      ? 'bg-[#D4FF3F]/10 border-[#D4FF3F] shadow-lg'
                      : 'bg-[#0A0A0A] border-white/5 text-white/70 hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl">{g.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${goal === g.id ? 'text-[#D4FF3F]' : 'text-white'}`}>
                      {g.label}
                    </p>
                    <p className="text-xs text-white/40 line-clamp-1">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold uppercase italic tracking-tight text-white">Workout Environment</h2>
            <p className="text-xs text-white/50 -mt-4">Where do you plan to train most of the time?</p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'gym', label: 'Gym Workout', desc: 'Commercial equipment: barbells, cables, dumbbells.', icon: '🏢' },
                { id: 'home', label: 'Home Gym setup', desc: 'Minimal bodyweight exercises or small resistance.', icon: '🏠' },
                { id: 'no_equipment', label: 'Equipment-Free', desc: 'Strict bodyweight and cardio calisthenics.', icon: '🤸' }
              ].map((pref) => (
                <button
                  key={pref.id}
                  type="button"
                  onClick={() => setWorkoutPreference(pref.id as any)}
                  className={`w-full flex items-center space-x-3 p-4 text-left rounded-xl border transition-all cursor-pointer ${
                    workoutPreference === pref.id
                      ? 'bg-[#00F0FF]/10 border-[#00F0FF]'
                      : 'bg-[#0A0A0A] border-white/5 text-white/70 hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl">{pref.icon}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${workoutPreference === pref.id ? 'text-[#00F0FF]' : 'text-white'}`}>
                      {pref.label}
                    </p>
                    <p className="text-xs text-white/40">{pref.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[#D4FF3F]/10 border border-[#D4FF3F]/20 rounded-xl p-3 text-xs text-[#D4FF3F] flex items-center gap-2">
              <span>🚀</span> Ready to unlock FitAI customized routines for today.
            </div>
          </motion.div>
        )}

        {/* Buttons Controls */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center space-x-1 text-white/50 hover:text-white transition-colors text-xs font-semibold py-2 px-3 rounded-xl hover:bg-white/5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-2 bg-[#D4FF3F] text-black font-extrabold uppercase text-xs tracking-wider border-none outline-none hover:bg-[#c2eb32] active:scale-95 transition-all py-2.5 px-5 rounded-xl cursor-pointer"
          >
            <span>{step === 4 ? 'Generate Coach Plan' : 'Continue'}</span>
            {step === 4 ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
