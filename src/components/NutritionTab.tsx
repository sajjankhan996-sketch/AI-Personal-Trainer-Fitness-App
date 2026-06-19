import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Apple, Plus, Droplet, Check, AlertCircle, Trash2, Calendar } from 'lucide-react';
import { NutritionLog, MealItem, User } from '../types.js';
import { api } from '../services/api.js';

interface NutritionProps {
  user: User;
}

export default function NutritionTab({ user }: NutritionProps) {
  const [log, setLog] = useState<NutritionLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Item States
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks' | null>(null);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('350');
  const [protein, setProtein] = useState('25');
  const [carbs, setCarbs] = useState('40');
  const [fat, setFat] = useState('10');

  useEffect(() => {
    async function loadNutrition() {
      try {
        const data = await api.getNutritionData();
        setLog(data);
      } catch (err: any) {
        setError(err.message || "Failed to load nutrition log.");
      } finally {
        setLoading(false);
      }
    }
    loadNutrition();
  }, []);

  const handleAddWater = async (amount: number) => {
    try {
      const res = await api.logWater(amount);
      setLog(res.log);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMealType || !foodName.trim() || !calories) return;

    try {
      const res = await api.logMeal({
        mealType: activeMealType,
        name: foodName.trim(),
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0
      });
      setLog(res.log);
      
      // Reset form
      setFoodName('');
      setActiveMealType(null);
    } catch (err: any) {
      setError(err.message || "Could not save meal entry.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-white/40 space-y-2">
        <div className="w-8 h-8 border-4 border-[#D4FF3F] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Calibrating calorie budgets...</span>
      </div>
    );
  }

  // Stats compile helpers
  const targetCals = log?.caloriesGoal || 2200;
  
  const sumMealsCals = () => {
    if (!log) return 0;
    const { breakfast, lunch, dinner, snacks } = log.meals;
    const all = [...breakfast, ...lunch, ...dinner, ...snacks];
    return all.reduce((acc, curr) => acc + curr.calories, 0);
  };

  const sumMealsMacros = (macro: 'protein' | 'carbs' | 'fat') => {
    if (!log) return 0;
    const { breakfast, lunch, dinner, snacks } = log.meals;
    const all = [...breakfast, ...lunch, ...dinner, ...snacks];
    return all.reduce((acc, curr) => acc + curr[macro], 0);
  };

  const caloriesConsumed = sumMealsCals();
  const caloriesPct = Math.min(100, (caloriesConsumed / targetCals) * 100);
  
  const targetProtein = user.goal === 'build_muscle' ? 140 : 110;
  const targetCarbs = user.goal === 'build_muscle' ? 240 : 180;
  const targetFat = user.goal === 'build_muscle' ? 70 : 60;

  const totalProtein = sumMealsMacros('protein');
  const totalCarbs = sumMealsMacros('carbs');
  const totalFat = sumMealsMacros('fat');

  return (
    <div className="space-y-6 font-sans text-white">
      
      {/* CALORIES CIRCULAR / PROGRESS INTEGRATION */}
      <div className="bg-[#141414] rounded-2xl p-5 border border-white/5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Macros Dashboard</h3>
          <span className="text-[9px] font-mono bg-[#0A0A0A] px-2.5 py-1 rounded border border-white/5 flex items-center gap-1 uppercase font-bold text-white/60">
            <Calendar className="w-3 h-3 text-[#D4FF3F]" /> Today
          </span>
        </div>

        <div className="flex items-center justify-around py-2">
          {/* Circular Progression */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-[#0A0A0A]"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-[#D4FF3F] transition-all duration-500"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - caloriesPct / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center space-y-0.5 animate-pulse">
              <p className="text-2xl font-bold uppercase italic tracking-tight text-white">{caloriesConsumed}</p>
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider font-bold">of {targetCals}</p>
            </div>
          </div>

          {/* Quick macro numbers column */}
          <div className="space-y-1.5">
            <h4 className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">STATUS REVIEW:</h4>
            {caloriesConsumed > targetCals ? (
              <p className="text-xs text-[#D4FF3F] font-black uppercase italic tracking-tight"> Caloric Surplus active</p>
            ) : (
              <p className="text-xs text-white font-black uppercase italic tracking-tight"> deficit margin healthy</p>
            )}
            <p className="text-[10px] text-white/40 font-medium max-w-[150px]">Formulated using height and weight benchmarks.</p>
          </div>
        </div>

        {/* Macros specific levels bars */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
          
          {/* Protein */}
          <div className="space-y-1.5 bg-[#0A0A0A] p-2.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-[9px] font-mono text-white/40 font-bold uppercase">
              <span>PRO</span>
              <span className="text-[#D4FF3F] font-bold">{totalProtein}/{targetProtein}g</span>
            </div>
            <div className="w-full h-1 bg-[#141414] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#D4FF3F] transition-all duration-300" 
                style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-1.5 bg-[#0A0A0A] p-2.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-[9px] font-mono text-white/40 font-bold uppercase">
              <span>CARBS</span>
              <span className="text-[#00F0FF] font-bold">{totalCarbs}/{targetCarbs}g</span>
            </div>
            <div className="w-full h-1 bg-[#141414] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00F0FF] transition-all duration-300" 
                style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-1.5 bg-[#0A0A0A] p-2.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-[9px] font-mono text-white/40 font-bold uppercase">
              <span>FAT</span>
              <span className="text-white/80 font-bold">{totalFat}/{targetFat}g</span>
            </div>
            <div className="w-full h-1 bg-[#141414] rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300" 
                style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* COMPREHENSIVE MEAL LOGGING SECTION */}
      <div className="space-y-3">
        <h4 className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Meal breakdown</h4>

        {log && (['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => {
          const items = log.meals[mealType];
          const mealCals = items.reduce((acc, curr) => acc + curr.calories, 0);

          return (
            <div key={mealType} className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden shadow-md">
              <div className="p-4 flex items-center justify-between bg-[#0A0A0A]/40 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <Apple className="w-4 h-4 text-[#D4FF3F]" />
                  <span className="text-xs font-bold uppercase tracking-wider capitalize text-white">
                    {mealType}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-white/50">{mealCals} kcal</span>
                  <button
                    onClick={() => setActiveMealType(mealType)}
                    className="p-1 rounded-lg bg-[#D4FF3F]/10 text-[#D4FF3F] hover:bg-[#D4FF3F]/20 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Items List inside card */}
              <div className="p-3.5 divide-y divide-white/5">
                {items.length > 0 ? (
                  items.map((item, id) => (
                    <div key={id} className="flex justify-between py-2.5 first:pt-0 last:pb-0 text-xs text-white/80">
                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-white/40 font-mono">
                          P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                        </p>
                      </div>
                      <span className="font-mono font-bold text-white text-right">{item.calories} kcal</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-2 text-[10px] text-white/30 font-semibold uppercase tracking-wider">No food items added.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLUID LOG WATER SYSTEM */}
      {log && (
        <div className="bg-[#141414] p-5 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Droplet className="w-5 h-5 text-[#00F0FF]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Hydration tracker</h3>
            </div>
            <span className="text-[9px] font-mono text-white/40 font-bold uppercase tracking-wider">Goal: 2500 ML</span>
          </div>

          <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-mono text-[#00F0FF] font-black italic">{log.waterIntake} <span className="text-xs text-white/40 font-normal">ml</span></p>
              <p className="text-[10px] text-white/40 font-medium mt-0.5">Hydration prevents muscle fatigue.</p>
            </div>
            <span className="text-3xl">☕</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[250, 500, 750].map((ml) => (
              <button
                key={ml}
                onClick={() => handleAddWater(ml)}
                className="bg-[#0A0A0A] border border-white/5 py-2.5 rounded-xl text-center text-xs text-[#00F0FF] hover:bg-[#00F0FF]/10 active:scale-95 transition flex items-center justify-center space-x-1 cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+{ml}ml</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MEAL INPUT FORM MODAL OVERLAY */}
      <AnimatePresence>
        {activeMealType && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#141414] rounded-2xl border border-white/5 p-6 space-y-4"
            >
              <h3 className="text-base font-bold uppercase italic tracking-tight text-white">
                Log food to {activeMealType}
              </h3>

              <form onSubmit={handleAddMeal} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">FOOD NAME</label>
                  <input
                    type="text"
                    required
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Eggs and Avocado"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 outline-none focus:border-[#D4FF3F] text-white placeholder-white/20 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">CALORIES (KCAL)</label>
                    <input
                      type="number"
                      required
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">PROTEIN (G)</label>
                    <input
                      type="number"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">CARBS (G)</label>
                    <input
                      type="number"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold tracking-wider text-white/40 mb-1">FAT (G)</label>
                    <input
                      type="number"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 outline-none focus:border-[#D4FF3F] text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMealType(null)}
                    className="flex-1 bg-[#0A0A0A] border border-white/5 py-2.5 rounded-xl text-center text-white/50 hover:text-white transition font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4FF3F] text-black font-extrabold uppercase py-2.5 rounded-xl text-center hover:bg-[#c2eb32] transition border-none outline-none"
                  >
                    Add Food Item
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
