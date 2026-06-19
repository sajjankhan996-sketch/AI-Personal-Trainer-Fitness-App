import { GoogleGenAI, Type } from "@google/genai";
import { User, Exercise } from "./db.js"; // Use relative imports, since inside TypeScript, Node expects standard .js or resolution

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize client if API KEY is present
const ai = apiKey 
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })
  : null;

/**
 * Uses Gemini to generate a personalized workout plan as structured JSON.
 * Falls back gracefully to standard presets if API key is not configured.
 */
export async function generateWorkoutPlanWithAI(user: User, requestNotes: string = 'General fitness selection'): Promise<Exercise[]> {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not defined. Using dummy workout generation.");
    return mockGenWorkout(user);
  }

  const prompt = `
    You are FitAI Coach, an elite personal trainer. Generate a highly personalized workout plan for the following user:
    - Name: ${user.name}
    - Age: ${user.age || 'Not specified'}
    - Gender: ${user.gender || 'Not specified'}
    - Height: ${user.height || 'Not specified'} cm
    - Weight: ${user.weight || 'Not specified'} kg
    - Fitness Goal: ${user.goal || 'lose_weight'} (Options are e.g. lose_weight, build_muscle, maintain_fitness, improve_stamina)
    - Fitness Level: ${user.fitnessLevel || 'beginner'} (beginner, intermediate, advanced)
    - Workout Preference: ${user.workoutPreference || 'no_equipment'} (home, gym, no_equipment)
    
    Specific user request/focus: "${requestNotes}"

    Generate exactly 4 exercises that fit this user's profile and goal perfectly. Return standard numbers of sets, reps, instructions, and target muscles.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the ultimate digital fitness trainer. You only respond with JSON matching the specified, required schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            exercises: {
              type: Type.ARRAY,
              description: "A list of 4 highly targeted exercises for the user's workout today",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the exercise" },
                  category: { type: Type.STRING, description: "Must be one of: 'strength', 'cardio', 'home'" },
                  subCategory: { type: Type.STRING, description: "Muscle group or workout sub-type e.g. chest, legs, arms, HIIT, fullbody" },
                  muscleTargeted: { type: Type.STRING, description: "The specific muscles targeted in this exercise" },
                  difficulty: { type: Type.STRING, description: "Must be matching user level: 'beginner', 'intermediate', 'advanced'" },
                  instructions: { type: Type.STRING, description: "Clear step-by-step instructions on form execution" },
                  sets: { type: Type.INTEGER, description: "Recommended sets" },
                  reps: { type: Type.STRING, description: "Recommended reps, e.g. '10-12 reps' or '30s hold'" },
                  duration: { type: Type.STRING, description: "Optional workout duration e.g. '5 mins' or '30 seconds'" },
                  restTime: { type: Type.STRING, description: "Rest time between sets, e.g. '60s' or '45s'" }
                },
                required: ["name", "category", "muscleTargeted", "difficulty", "instructions", "sets", "reps", "restTime"]
              }
            }
          },
          required: ["exercises"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
      return parsed.exercises.map((ex: any, index: number) => ({
        ...ex,
        id: `ai_${Date.now()}_${index}`,
        completed: false
      }));
    }
    
    throw new Error("Empty or invalid exercises array in JSON response");
  } catch (error) {
    console.error("Failed to generate AI workout plan, using local builder instead:", error);
    return mockGenWorkout(user);
  }
}

/**
 * Handles conversational coaching with Gemini.
 */
export async function chatWithAICoach(
  chatHistory: { role: 'user' | 'model'; message: string }[],
  newMessage: string,
  user: User
): Promise<string> {
  if (!ai) {
    return `Hey ${user.name}! I would love to guide you on your journey! To enable real-time fitness insights powered by Gemini, please check that your GEMINI_API_KEY is configured in Settings > Secrets. In the meantime, try doing a set of 15 pushups! Solid effort builds legends!`;
  }

  const profileContext = `
    User Profile:
    - Name: ${user.name}
    - Age: ${user.age || 'Not specified'} years
    - Goals: ${user.goal || 'General fitness'}
    - Current Weight: ${user.weight || 'Not specified'} kg
    - Fitness Level: ${user.fitnessLevel || 'beginner'}
    - XP: ${user.xp} (Level ${user.level})
    - Badges Earned: ${user.badges.join(', ') || 'None yet'}
    - Subscription status: ${user.subscriptionStatus} ("premium" unlocks full deep nutrition audits, "free" is basic)
  `;

  // Standardize the chat array for the SDK format: { role: "user" | "model", parts: [{ text: "..." }] }
  const sdkHistory = chatHistory.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.message }]
  }));

  try {
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are Coach FitAI, a friendly, ultra-motivating, experienced personal trainer. 
        Use the user's detailed profile below to tailor your coaching answers perfectly. 
        Keep your advice realistic, safety-oriented, and highly encouraging. 
        Keep replies relatively prompt, scannable, and formatted cleanly using bullets or lists. Avoid over-complicated scientific jargon unless asked.
        ${profileContext}`,
      },
      history: sdkHistory
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "I appreciate your drive. Let's keep setting records. Tell me, what is our focus today?";
  } catch (error) {
    console.error("Error communicating with AI coach:", error);
    return `Coach FitAI experienced a small server-bound hitch but is fully ready to keep checking goals. Your raw drive is what matters! What exercise can we smash today?`;
  }
}

// Fallback algorithm if key is unset
function mockGenWorkout(user: User): Exercise[] {
  const isGym = user.workoutPreference === 'gym';
  const prefix = isGym ? 'Gym' : 'Home';
  
  return [
    {
      id: `fallback_1_${Date.now()}`,
      name: isGym ? 'Incline Barbell Bench Press' : 'Pushups (Strict Form)',
      category: isGym ? 'strength' : 'home',
      muscleTargeted: 'Chest, Triceps',
      difficulty: user.fitnessLevel || 'beginner',
      instructions: 'Keep your core locked, back straight. Lower your upper body with elbows tucked in, then press upward.',
      sets: 3,
      reps: '12-15 reps',
      restTime: '60s',
      completed: false
    },
    {
      id: `fallback_2_${Date.now()}`,
      name: isGym ? 'Bent-Over Dumbbell Row' : 'Towel Sliding Back Squeezes',
      category: isGym ? 'strength' : 'home',
      muscleTargeted: 'Lats, Rhomboids, Biceps',
      difficulty: user.fitnessLevel || 'beginner',
      instructions: 'Hinge at the hips, keeping a perfectly flat lower spine. Pull back in a rowing motion, focusing on squeezing your shoulder blades together.',
      sets: 3,
      reps: '12 reps',
      restTime: '60s',
      completed: false
    },
    {
      id: `fallback_3_${Date.now()}`,
      name: isGym ? 'Goblet Dumbbell Squats' : 'Speed Air Squats',
      category: isGym ? 'strength' : 'home',
      muscleTargeted: 'Quads, Glutes, Hamstrings',
      difficulty: user.fitnessLevel || 'beginner',
      instructions: 'Keep weight down, back upright. Break at the knee joint and drop parallel prior to driving upward.',
      sets: 4,
      reps: '15-20 reps',
      restTime: '60s',
      completed: false
    },
    {
      id: `fallback_4_${Date.now()}`,
      name: 'Burpees HIIT Blast',
      category: 'home',
      muscleTargeted: 'Full Body, Cardiovascular',
      difficulty: user.fitnessLevel || 'beginner',
      instructions: 'Drop to flat pushup stance, perform pushup, bring toes forward, leap high with hands up. Perfect for fat burning!',
      sets: 3,
      reps: '10 reps',
      restTime: '45s',
      completed: false
    }
  ];
}
