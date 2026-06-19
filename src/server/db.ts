import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  age?: number;
  gender?: string;
  height?: number; // in cm
  weight?: number; // in kg
  goal?: string; // 'lose_weight' | 'build_muscle' | 'maintain' | 'stamina'
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  workoutPreference?: 'home' | 'gym' | 'no_equipment';
  xp: number;
  level: number;
  badges: string[]; // e.g. ['First Workout', '7 Day Streak', '30 Day Challenge']
  subscriptionStatus: 'free' | 'premium';
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'home';
  subCategory?: string; // e.g. 'chest', 'back', 'legs', 'arms', 'HIIT'
  muscleTargeted: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  sets: number;
  reps: string; // or number (reps or duration representation)
  duration?: string; // e.g. '30s', '15 mins'
  restTime: string; // e.g. '60s'
  completed?: boolean;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  exercises: Exercise[];
  completed: boolean;
  xpEarned?: number;
}

export interface MeasurementHistory {
  chest?: number;
  waist?: number;
  arms?: number;
}

export interface ProgressLog {
  id: string;
  userId: string;
  weight: number;
  measurements: MeasurementHistory;
  date: string; // YYYY-MM-DD
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  waterIntake: number; // ml
  waterGoal: number; // ml
  caloriesGoal: number;
  meals: {
    breakfast: { name: string; calories: number; protein: number; carbs: number; fat: number }[];
    lunch: { name: string; calories: number; protein: number; carbs: number; fat: number }[];
    dinner: { name: string; calories: number; protein: number; carbs: number; fat: number }[];
    snacks: { name: string; calories: number; protein: number; carbs: number; fat: number }[];
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

export interface DatabaseSchema {
  users: User[];
  workouts: WorkoutPlan[];
  progress: ProgressLog[];
  nutrition: NutritionLog[];
  chats: ChatMessage[];
  leaderboardBase: LeaderboardEntry[];
}

const PRE_SEEDED_EXERCISES: Exercise[] = [
  // Chest
  { id: '1', name: 'Barbell Bench Press', category: 'strength', subCategory: 'chest', muscleTargeted: 'Pectorals, Triceps', difficulty: 'intermediate', instructions: 'Lie on a flat bench. Grip the barbell with hands slightly wider than shoulder-width. Lower the bar slowly to your chest, then push the bar back up explosively.', sets: 4, reps: '8-12', restTime: '90s' },
  { id: '2', name: 'Incline Dumbbell Flyes', category: 'strength', subCategory: 'chest', muscleTargeted: 'Pectorals', difficulty: 'intermediate', instructions: 'Set bench to 30-45 degree incline. Start with dumbbells above chest, arms slightly bent. Lower the dumbbells in a wide arc until chest stretch is felt, then squeeze back to top.', sets: 3, reps: '12', restTime: '60s' },
  // Back
  { id: '3', name: 'Deadlift', category: 'strength', subCategory: 'back', muscleTargeted: 'Latissimus Dorsi, Glutes, Hamstrings', difficulty: 'advanced', instructions: 'Stand with feet hip-width apart. Bend at hips and knees, grab bar with shoulder-width grip. Keeping chest up and back flat, drive legs straight and stand tall with the bar.', sets: 4, reps: '6-8', restTime: '120s' },
  { id: '4', name: 'Lat Pulldown', category: 'strength', subCategory: 'back', muscleTargeted: 'Latissimus Dorsi, Biceps', difficulty: 'beginner', instructions: 'Sit at pulldown station. Grab wide bar. Pull the bar down smoothly to your upper chest while squeezing your shoulder blades together. Slowly return to start.', sets: 3, reps: '10-12', restTime: '60s' },
  // Legs
  { id: '5', name: 'Barbell Back Squat', category: 'strength', subCategory: 'legs', muscleTargeted: 'Quadriceps, Glutes, Hamstrings', difficulty: 'intermediate', instructions: 'Saddle bar across upper back. Keep feet shoulder-width apart. Squat down by pushing hips back and bending knees until thighs are parallel to ground, then drive back up.', sets: 4, reps: '8-12', restTime: '90s' },
  { id: '6', name: 'Leg Extensions', category: 'strength', subCategory: 'legs', muscleTargeted: 'Quadriceps', difficulty: 'beginner', instructions: 'Sit on extension machine. Position shins under rollers. Extend legs completely, squeezing quadriceps at peak extension, then return under control.', sets: 3, reps: '15', restTime: '60s' },
  // Arms
  { id: '7', name: 'Dumbbell Bicep Curl', category: 'strength', subCategory: 'arms', muscleTargeted: 'Biceps Brachii', difficulty: 'beginner', instructions: 'Hold dumbbells at sides, palms facing forward. Curl the weights upward towards shoulders, rotating forearms, keeping elbows tight to body.', sets: 3, reps: '12', restTime: '60s' },
  { id: '8', name: 'Tricep Rope Overhead Press', category: 'strength', subCategory: 'arms', muscleTargeted: 'Triceps', difficulty: 'beginner', instructions: 'Attach rope to cable pulley. Turn away from gym stack. Lift rope overhead with elbows bent. Press rope forward and upward until elbow locks out.', sets: 3, reps: '12', restTime: '60s' },
  // Cardio
  { id: '9', name: 'HIIT Treadmill Sprints', category: 'cardio', subCategory: 'HIIT', muscleTargeted: 'Cardiovascular System', difficulty: 'intermediate', instructions: 'Warm up 3 mins. Sprint at maximum intensity for 30 seconds, rest/walk for 60 seconds. Repeat 8 times.', sets: 8, reps: '30s sprint', duration: '12 mins', restTime: '60s' },
  { id: '10', name: 'Stationary Cycling Hills', category: 'cardio', subCategory: 'cardio', muscleTargeted: 'Legs, Heart Rate', difficulty: 'beginner', instructions: 'Ride 2 mins at medium speed. Increase resistance significantly to simulate a hill for 2 mins. Return to flat for 2 mins. Repeat 3 times.', sets: 3, reps: '4 mins hill combo', duration: '15 mins', restTime: '60s' },
  // Home Bodyweight Workouts
  { id: '11', name: 'Diamond Pushups', category: 'home', subCategory: 'chest', muscleTargeted: 'Triceps, Inner Chest', difficulty: 'intermediate', instructions: 'Get in high plank position. Form a diamond shape with your thumbs and pointer fingers. Lower your chest to your hands and drive up.', sets: 3, reps: '12-15', restTime: '45s' },
  { id: '12', name: 'Bodyweight Air Squats', category: 'home', subCategory: 'legs', muscleTargeted: 'Quadriceps, Glutes', difficulty: 'beginner', instructions: 'Stand with feet shoulder-width apart. Squat down as if sitting on an invisible chair, keeping weight in heels. Return to upright position.', sets: 4, reps: '20', restTime: '45s' },
  { id: '13', name: 'Forearm Plank Holding', category: 'home', subCategory: 'HIIT', muscleTargeted: 'Core abdominals', difficulty: 'beginner', instructions: 'Rest on forearms and toes. Keep your neck and back perfectly straight, core braced tightly. Hold for maximum duration.', sets: 3, reps: '60s hold', duration: '3 mins', restTime: '45s' },
  { id: '14', name: 'Burpees Blast', category: 'home', subCategory: 'HIIT', muscleTargeted: 'Full Body, Cardiovascular', difficulty: 'intermediate', instructions: 'From standing, drop into squat, kick feet back to pushup stance, perform pushup, snap feet back to squat, then leap into air hands up.', sets: 3, reps: '10-12', restTime: '60s' }
];

const PRE_SEEDED_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'David Goggins', xp: 5200, level: 12, avatar: '🔥' },
  { name: 'Sarah "The Machine"', xp: 3850, level: 9, avatar: '⚡' },
  { name: 'Coach Alex', xp: 3100, level: 7, avatar: '🏋️' },
  { name: 'MuscleMike', xp: 2450, level: 6, avatar: '💪' },
  { name: 'Emma Cardio Queen', xp: 1950, level: 5, avatar: '🏃‍♀' },
  { name: 'Zen Yogi Liam', xp: 1400, level: 4, avatar: '🧘‍♂' }
];

function initDb(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error loading database file. Re-initializing...', e);
    }
  }

  const defaultDb: DatabaseSchema = {
    users: [],
    workouts: [],
    progress: [],
    nutrition: [],
    chats: [],
    leaderboardBase: PRE_SEEDED_LEADERBOARD
  };
  
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  return defaultDb;
}

const dbState = initDb();

function saveToDisk() {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
}

export function getUserByEmail(email: string): User | undefined {
  return dbState.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return dbState.users.find(u => u.id === id);
}

export function insertUser(user: Omit<User, 'xp' | 'level' | 'badges' | 'subscriptionStatus' | 'createdAt'> & { xp?: number, level?: number, badges?: string[], subscriptionStatus?: 'free' | 'premium' }): User {
  const newUser: User = {
    ...user,
    xp: user.xp ?? 0,
    level: user.level ?? 1,
    badges: user.badges ?? [],
    subscriptionStatus: user.subscriptionStatus ?? 'free',
    createdAt: new Date().toISOString()
  };
  dbState.users.push(newUser);
  saveToDisk();
  return newUser;
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'email' | 'passwordHash' | 'createdAt'>>): User | undefined {
  const user = getUserById(id);
  if (!user) return undefined;
  
  Object.assign(user, updates);
  
  // Recalculate level based on XP (e.g. 1000 XP per level)
  const calculatedLevel = Math.max(1, Math.floor(user.xp / 1000) + 1);
  if (calculatedLevel > user.level) {
    user.level = calculatedLevel;
    // Award badges based on milestones
    if (user.level >= 2 && !user.badges.includes('Fitness Enthusiast')) {
      user.badges.push('Fitness Enthusiast');
    }
    if (user.level >= 5 && !user.badges.includes('Fitness Beast')) {
      user.badges.push('Fitness Beast');
    }
  }

  saveToDisk();
  return user;
}

export function addXp(id: string, amount: number): { user?: User; levelUp: boolean } {
  const user = getUserById(id);
  if (!user) return { levelUp: false };

  const oldLevel = user.level;
  user.xp += amount;
  const calculatedLevel = Math.max(1, Math.floor(user.xp / 1000) + 1);
  const levelUp = calculatedLevel > oldLevel;
  if (levelUp) {
    user.level = calculatedLevel;
    if (!user.badges.includes(`Level ${calculatedLevel} Gym Goer`)) {
      user.badges.push(`Level ${calculatedLevel} Gym Goer`);
    }
  }
  
  saveToDisk();
  return { user, levelUp };
}

export function getWorkoutsByUserId(userId: string): WorkoutPlan[] {
  return dbState.workouts.filter(w => w.userId === userId);
}

export function getWorkoutByDate(userId: string, date: string): WorkoutPlan | undefined {
  return dbState.workouts.find(w => w.userId === userId && w.date === date);
}

export function insertWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  // Overwrite if same date exists, or push
  const idx = dbState.workouts.findIndex(w => w.userId === plan.userId && w.date === plan.date);
  if (idx !== -1) {
    dbState.workouts[idx] = plan;
  } else {
    dbState.workouts.push(plan);
  }
  saveToDisk();
  return plan;
}

export function completeExercise(userId: string, date: string, exerciseId: string): WorkoutPlan | undefined {
  const plan = getWorkoutByDate(userId, date);
  if (!plan) return undefined;

  const ex = plan.exercises.find(e => e.id === exerciseId);
  if (ex) {
    ex.completed = true;
    
    // Add XP to user (e.g., 50 XP per completed exercise)
    addXp(userId, 50);
  }

  // Check if all exercises are completed
  const allComplete = plan.exercises.every(e => e.completed);
  if (allComplete && !plan.completed) {
    plan.completed = true;
    plan.xpEarned = (plan.xpEarned ?? 0) + 150; // Bonus XP for full workout completion
    addXp(userId, 150);
    
    // Award "First Workout" badge
    const user = getUserById(userId);
    if (user && !user.badges.includes('First Workout')) {
      user.badges.push('First Workout');
      saveToDisk();
    }
  }

  saveToDisk();
  return plan;
}

export function completeWorkoutPlan(userId: string, date: string): WorkoutPlan | undefined {
  const plan = getWorkoutByDate(userId, date);
  if (!plan) return undefined;
  
  plan.exercises.forEach(e => { e.completed = true; });
  if (!plan.completed) {
    plan.completed = true;
    plan.xpEarned = (plan.xpEarned ?? 0) + 200; // Complete workout bonus
    addXp(userId, 200);

    const user = getUserById(userId);
    if (user && !user.badges.includes('First Workout')) {
      user.badges.push('First Workout');
    }
    
    // Check workout count for streak milestone badges
    const userPlans = getWorkoutsByUserId(userId).filter(p => p.completed);
    if (userPlans.length >= 3 && user && !user.badges.includes('7 Day Streak')) {
      user.badges.push('7 Day Streak');
    }
    if (userPlans.length >= 10 && user && !user.badges.includes('30 Day Challenge')) {
      user.badges.push('30 Day Challenge');
    }
  }

  saveToDisk();
  return plan;
}

export function generateInitialSchedule(userId: string, userDetails: { fitnessLevel?: string, goal?: string, workoutPreference?: string }) {
  const dateStr = new Date().toISOString().split('T')[0];
  
  // Choose exercises depending on pref
  const pref = userDetails.workoutPreference || 'no_equipment';
  const fitnessLvl = userDetails.fitnessLevel || 'beginner';
  
  let pool = PRE_SEEDED_EXERCISES;
  if (pref === 'no_equipment') {
    pool = PRE_SEEDED_EXERCISES.filter(e => e.category === 'home');
  } else if (pref === 'gym_workout' || pref === 'gym') {
    pool = PRE_SEEDED_EXERCISES.filter(e => e.category === 'strength' || e.category === 'cardio');
  }

  // Filter or scale intensity
  const selected = pool.slice(0, 4).map((ex, index) => ({
    ...ex,
    id: `${ex.id}_${index}`,
    completed: false,
    difficulty: fitnessLvl as 'beginner' | 'intermediate' | 'advanced',
    sets: fitnessLvl === 'advanced' ? ex.sets + 1 : fitnessLvl === 'beginner' ? Math.max(2, ex.sets - 1) : ex.sets
  }));

  const initialPlan: WorkoutPlan = {
    id: `plan_${Date.now()}`,
    userId,
    date: dateStr,
    exercises: selected,
    completed: false
  };

  insertWorkoutPlan(initialPlan);
  return initialPlan;
}

export function getProgressHistory(userId: string): ProgressLog[] {
  return dbState.progress.filter(p => p.userId === userId).sort((a, b) => a.date.localeCompare(b.date));
}

export function addProgressEntry(userId: string, weight: number, measurements: MeasurementHistory, date: string): ProgressLog {
  const id = `progress_${Date.now()}`;
  const newEntry: ProgressLog = {
    id,
    userId,
    weight,
    measurements,
    date
  };

  // Check if same date progress exists, override or push
  const idx = dbState.progress.findIndex(p => p.userId === userId && p.date === date);
  if (idx !== -1) {
    dbState.progress[idx] = newEntry;
  } else {
    dbState.progress.push(newEntry);
  }

  // Update current weight in user profile
  updateUser(userId, { weight });
  
  // Award 100 XP for tracking progress
  addXp(userId, 100);

  saveToDisk();
  return newEntry;
}

export function getNutritionByDate(userId: string, date: string): NutritionLog {
  let log = dbState.nutrition.find(n => n.userId === userId && n.date === date);
  if (!log) {
    const user = getUserById(userId);
    let targetCal = 2200; // standard baseline
    if (user?.goal === 'lose_weight') targetCal = 1800;
    if (user?.goal === 'build_muscle') targetCal = 2800;

    log = {
      id: `nut_${Date.now()}`,
      userId,
      date,
      waterIntake: 0,
      waterGoal: 2500, // ml
      caloriesGoal: targetCal,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      }
    };
    dbState.nutrition.push(log);
    saveToDisk();
  }
  return log;
}

export function addMealItem(
  userId: string, 
  date: string, 
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks', 
  meal: { name: string; calories: number; protein: number; carbs: number; fat: number }
): NutritionLog {
  const log = getNutritionByDate(userId, date);
  log.meals[mealType].push(meal);
  
  // Award 30 XP for tracking nutrition
  addXp(userId, 30);

  saveToDisk();
  return log;
}

export function logWaterIntake(userId: string, date: string, amountMl: number): NutritionLog {
  const log = getNutritionByDate(userId, date);
  log.waterIntake = Math.max(0, log.waterIntake + amountMl);
  
  // Award 10 XP per tracking water
  addXp(userId, 10);

  saveToDisk();
  return log;
}

export function getChatHistory(userId: string): ChatMessage[] {
  return dbState.chats.filter(c => c.userId === userId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function addChatMessage(userId: string, role: 'user' | 'model', message: string): ChatMessage {
  const newMessage: ChatMessage = {
    id: `chat_${Date.now()}`,
    userId,
    role,
    message,
    timestamp: new Date().toISOString()
  };
  dbState.chats.push(newMessage);
  saveToDisk();
  return newMessage;
}

export function getLeaderboard(userId: string): LeaderboardEntry[] {
  const user = getUserById(userId);
  const currentList = [...dbState.leaderboardBase];
  
  if (user) {
    const existingIdx = currentList.findIndex(e => e.name === user.name);
    if (existingIdx !== -1) {
      currentList[existingIdx] = {
        name: user.name,
        xp: user.xp,
        level: user.level,
        isCurrentUser: true,
        avatar: user.gender === 'female' ? '🏃‍♀' : '🏃'
      };
    } else {
      currentList.push({
        name: user.name,
        xp: user.xp,
        level: user.level,
        isCurrentUser: true,
        avatar: user.gender === 'female' ? '🏃‍♀' : '🏃'
      });
    }
  }

  return currentList.sort((a, b) => b.xp - a.xp);
}

export function getExerciseLibrary(): Exercise[] {
  return PRE_SEEDED_EXERCISES;
}

export function seedAdminUserIfEmpty() {
  if (dbState.users.length === 0) {
    // Seed standard test profiles if empty
    console.log('Seeding initial user table with admin placeholder');
  }
}
