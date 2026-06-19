import express from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environmental parameters
dotenv.config();

import {
  getUserByEmail,
  getUserById,
  insertUser,
  updateUser,
  getWorkoutsByUserId,
  getWorkoutByDate,
  insertWorkoutPlan,
  completeExercise,
  completeWorkoutPlan,
  generateInitialSchedule,
  getProgressHistory,
  addProgressEntry,
  getNutritionByDate,
  addMealItem,
  logWaterIntake,
  getChatHistory,
  addChatMessage,
  getLeaderboard,
  getExerciseLibrary
} from './src/server/db.js';

import {
  generateWorkoutPlanWithAI,
  chatWithAICoach
} from './src/server/ai.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fitai_coach_secret_999bb!@#';

// Middlewares
app.use(cors());
app.use(express.json());

// JWT Verification Middleware
interface AuthenticatedRequest extends express.Request {
  userId?: string;
}

function authenticateToken(req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ error: 'Access token required. Please sign in.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Session expired or token invalid. Please log in again.' });
      return;
    }
    req.userId = (decoded as any).userId;
    next();
  });
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight, goal, fitnessLevel, workoutPreference } = req.body;

    if (!name || !email || !password) {
       res.status(400).json({ error: 'Please fill out all required fields: name, email, password' });
       return;
    }

    const existingUser = getUserByEmail(email);
    if (existingUser) {
       res.status(400).json({ error: 'An account with this email address already exists' });
       return;
    }

    // Hashpassword
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user in store
    const userObj = insertUser({
      id: `u_${Date.now()}`,
      name,
      email,
      passwordHash,
      age: age ? Number(age) : undefined,
      gender,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      goal,
      fitnessLevel,
      workoutPreference
    });

    // Spawn an initial workout plan for today automatically
    generateInitialSchedule(userObj.id, {
      fitnessLevel: userObj.fitnessLevel,
      goal: userObj.goal,
      workoutPreference: userObj.workoutPreference
    });

    // Sign JWT
    const token = jwt.sign({ userId: userObj.id }, JWT_SECRET, { expiresIn: '7d' });

    // Respond with sanitized user structure
    const { passwordHash: _, ...sanitizedUser } = userObj;
    res.status(201).json({
      message: 'Account successfully created!',
      token,
      user: sanitizedUser
    });
  } catch (err: any) {
    console.error('Registration processing mismatch:', err);
    res.status(500).json({ error: 'Internal system error during registration.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
       res.status(400).json({ error: 'Please enter both your email and password' });
       return;
    }

    const userObj = getUserByEmail(email);
    if (!userObj) {
       res.status(401).json({ error: 'Invalid email or password' });
       return;
    }

    // Compare lock
    const isMatched = await bcrypt.compare(password, userObj.passwordHash);
    if (!isMatched) {
       res.status(401).json({ error: 'Invalid email or password' });
       return;
    }

    // Sign token
    const token = jwt.sign({ userId: userObj.id }, JWT_SECRET, { expiresIn: '7d' });

    // Scrub hashed credential
    const { passwordHash: _, ...sanitizedUser } = userObj;
    res.status(200).json({
      message: 'Log in successful!',
      token,
      user: sanitizedUser
    });
  } catch (err) {
    console.error('Login mismatch error:', err);
    res.status(500).json({ error: 'Internal system server error during login.' });
  }
});

// Logout (Handled client-side by purging Token, but API route provided for compliance)
app.post('/api/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
});

// ==========================================
// USER PROFILE ENDPOINTS
// ==========================================

// Get Profile
app.get('/api/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User profile not found' });
    return;
  }
  const { passwordHash: _, ...sanitizedUser } = user;
  res.status(200).json(sanitizedUser);
});

// Put Profile (Update)
app.put('/api/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { age, gender, height, weight, goal, fitnessLevel, workoutPreference, subscriptionStatus } = req.body;
  
  const updated = updateUser(req.userId!, {
    age: age ? Number(age) : undefined,
    gender,
    height: height ? Number(height) : undefined,
    weight: weight ? Number(weight) : undefined,
    goal,
    fitnessLevel,
    workoutPreference,
    subscriptionStatus // handles upgrade triggers perfectly!
  });

  if (!updated) {
    res.status(404).json({ error: 'User profile not found' });
    return;
  }

  const { passwordHash: _, ...sanitizedUser } = updated;
  res.status(200).json({
    message: 'Profile details saved successfully!',
    user: sanitizedUser
  });
});

// ==========================================
// WORKOUT SYSTEM ENDPOINTS
// ==========================================

// Get Scheduled Outlay for Today or all histories
app.get('/api/workouts', authenticateToken, (req: AuthenticatedRequest, res) => {
  const date = req.query.date as string || new Date().toISOString().split('T')[0];
  const allHistory = req.query.all === 'true';

  if (allHistory) {
    const workouts = getWorkoutsByUserId(req.userId!);
    res.status(200).json(workouts);
  } else {
    let plan = getWorkoutByDate(req.userId!, date);
    if (!plan && date === new Date().toISOString().split('T')[0]) {
      // Lazy pre-seed standard workout if logging in first time on a new day
      const user = getUserById(req.userId!);
      if (user) {
        plan = generateInitialSchedule(req.userId!, {
          fitnessLevel: user.fitnessLevel,
          goal: user.goal,
          workoutPreference: user.workoutPreference
        });
      }
    }
    res.status(200).json(plan || null);
  }
});

// AI Generate Workout routine
app.post('/api/generate-workout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const user = getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User profile not found' });
    return;
  }

  const { date, focusArea } = req.body;
  const dateStr = date || new Date().toISOString().split('T')[0];

  try {
    const customExercises = await generateWorkoutPlanWithAI(user, focusArea);
    
    // Save to DB
    const customPlan = {
      id: `plan_${Date.now()}`,
      userId: user.id,
      date: dateStr,
      exercises: customExercises,
      completed: false
    };

    insertWorkoutPlan(customPlan);
    res.status(200).json({
      message: 'AI coach successfully tailored a new routine for you!',
      workout: customPlan
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to negotiate structured plan with AI core.' });
  }
});

// Complete individual Exercise in routine
app.post('/api/workouts/complete-exercise', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { date, exerciseId } = req.body;
  
  if (!exerciseId) {
    res.status(400).json({ error: 'Missing exercise ID' });
    return;
  }

  const dateStr = date || new Date().toISOString().split('T')[0];
  const updatedPlan = completeExercise(req.userId!, dateStr, exerciseId);

  if (!updatedPlan) {
    res.status(404).json({ error: 'No workout routine active for specified date' });
    return;
  }

  const user = getUserById(req.userId!);
  res.status(200).json({
    message: 'Set completed! Keep pushing!',
    workout: updatedPlan,
    user: user ? { xp: user.xp, level: user.level, badges: user.badges } : null
  });
});

// Complete Full Workout
app.post('/api/workouts/complete', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { date } = req.body;
  const dateStr = date || new Date().toISOString().split('T')[0];

  const updatedPlan = completeWorkoutPlan(req.userId!, dateStr);

  if (!updatedPlan) {
    res.status(404).json({ error: 'Workout plan not found for today' });
    return;
  }

  const user = getUserById(req.userId!);
  res.status(200).json({
    message: 'Sensational workout finished! Level multiplier active!',
    workout: updatedPlan,
    user: user ? { xp: user.xp, level: user.level, badges: user.badges } : null
  });
});

// ==========================================
// PROGRESS LOG ENDPOINTS
// ==========================================

// Log weight & custom coordinates
app.post('/api/progress', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { weight, chest, waist, arms, date } = req.body;
  const dateStr = date || new Date().toISOString().split('T')[0];

  if (!weight) {
    res.status(400).json({ error: 'Weight in kilograms is required to calculate progress.' });
    return;
  }

  const progressObj = addProgressEntry(req.userId!, Number(weight), {
    chest: chest ? Number(chest) : undefined,
    waist: waist ? Number(waist) : undefined,
    arms: arms ? Number(arms) : undefined
  }, dateStr);

  const user = getUserById(req.userId!);
  res.status(201).json({
    message: 'Measurement data logged correctly! 100 XP gained!',
    entry: progressObj,
    user: user ? { xp: user.xp, level: user.level, badges: user.badges, weight: user.weight } : null
  });
});

// Fetch progress history
app.get('/api/progress-history', authenticateToken, (req: AuthenticatedRequest, res) => {
  const history = getProgressHistory(req.userId!);
  res.status(200).json(history);
});

// ==========================================
// NUTRITION ROUTER
// ==========================================

// Retrieve daily logs
app.get('/api/nutrition-data', authenticateToken, (req: AuthenticatedRequest, res) => {
  const dateStr = req.query.date as string || new Date().toISOString().split('T')[0];
  const log = getNutritionByDate(req.userId!, dateStr);
  res.status(200).json(log);
});

// Log Meal item (breakfast, lunch, dinner, snacks)
app.post('/api/nutrition', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { mealType, name, calories, protein, carbs, fat, date } = req.body;
  const dateStr = date || new Date().toISOString().split('T')[0];

  if (!mealType || !name || !calories) {
    res.status(400).json({ error: 'Meal classification, item name, and calorie counts are compulsory' });
    return;
  }

  if (!['breakfast', 'lunch', 'dinner', 'snacks'].includes(mealType)) {
    res.status(400).json({ error: 'Invalid meal classification: must be breakfast, lunch, dinner, or snacks' });
    return;
  }

  const updatedLog = addMealItem(req.userId!, dateStr, mealType, {
    name,
    calories: Number(calories),
    protein: protein ? Number(protein) : 0,
    carbs: carbs ? Number(carbs) : 0,
    fat: fat ? Number(fat) : 0
  });

  const user = getUserById(req.userId!);
  res.status(200).json({
    message: 'Meal intake logged successfully. Keep hitting those macros!',
    log: updatedLog,
    user: user ? { xp: user.xp, level: user.level } : null
  });
});

// Water logging
app.post('/api/nutrition/water', authenticateToken, (req: AuthenticatedRequest, res) => {
  const { amountMl, date } = req.body;
  const dateStr = date || new Date().toISOString().split('T')[0];

  if (!amountMl || Number(amountMl) === 0) {
    res.status(400).json({ error: 'Specify standard volume in milliliters.' });
    return;
  }

  const updatedLog = logWaterIntake(req.userId!, dateStr, Number(amountMl));
  const user = getUserById(req.userId!);

  res.status(200).json({
    message: 'Hydration logged.',
    log: updatedLog,
    user: user ? { xp: user.xp, level: user.level } : null
  });
});

// ==========================================
// AI CHATBOT ROUTER
// ==========================================

// Chat history
app.get('/api/ai-chat/history', authenticateToken, (req: AuthenticatedRequest, res) => {
  const list = getChatHistory(req.userId!);
  res.status(200).json(list);
});

// Prompt coach
app.post('/api/ai-chat', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: 'Please enter a message for Coach FitAI' });
    return;
  }

  const user = getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Fetch contextual logs to send to Gemini
  const chatHistory = getChatHistory(user.id);
  
  // Log request to database
  addChatMessage(user.id, 'user', message);

  try {
    // Negotiate message with Gemini
    const botText = await chatWithAICoach(
      chatHistory.map(m => ({ role: m.role, message: m.message })),
      message,
      user
    );

    // Save coach response
    const coachMessage = addChatMessage(user.id, 'model', botText);

    res.status(200).json({
      message: coachMessage
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Coach terminal experienced a streaming fail.' });
  }
});

// ==========================================
// GAMIFICATION AND ENGINES
// ==========================================

// Leaderboard
app.get('/api/leaderboard', authenticateToken, (req: AuthenticatedRequest, res) => {
  const leaderboard = getLeaderboard(req.userId!);
  res.status(200).json(leaderboard);
});

// Exercise Library
app.get('/api/exercises', (req, res) => {
  const library = getExerciseLibrary();
  res.status(200).json(library);
});


// ==========================================
// VITE AND BUNDLE MIDDLEWARES
// ==========================================

async function initializeApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FitAI Coach core running on http://localhost:${PORT}`);
  });
}

initializeApp().catch(err => {
  console.error("Express initialization failed", err);
});
