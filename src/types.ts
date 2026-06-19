export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  goal?: string; // 'lose_weight' | 'build_muscle' | 'maintain' | 'stamina'
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  workoutPreference?: 'home' | 'gym' | 'no_equipment';
  xp: number;
  level: number;
  badges: string[];
  subscriptionStatus: 'free' | 'premium';
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'home';
  subCategory?: string;
  muscleTargeted: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  sets: number;
  reps: string;
  duration?: string;
  restTime: string;
  completed?: boolean;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  date: string;
  exercises: Exercise[];
  completed: boolean;
  xpEarned?: number;
}

export interface ProgressLog {
  id: string;
  userId: string;
  weight: number;
  measurements: {
    chest?: number;
    waist?: number;
    arms?: number;
  };
  date: string;
}

export interface MealItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: string;
  waterIntake: number;
  waterGoal: number;
  caloriesGoal: number;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'model';
  message: string;
  timestamp: string;
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
  level: number;
  isCurrentUser?: boolean;
  avatar: string;
}
