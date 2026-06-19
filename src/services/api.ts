import { User, WorkoutPlan, ProgressLog, NutritionLog, ChatMessage, LeaderboardEntry, Exercise } from '../types.js';

const TOKEN_KEY = 'fitai_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Low-level request fetch wrapper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errResponse = await response.json();
      errorMessage = errResponse.error || errorMessage;
    } catch (_) {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // --- AUTH ---
  async register(data: any): Promise<{ token: string; user: User; message: string }> {
    const res = await apiRequest<{ token: string; user: User; message: string }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setStoredToken(res.token);
    return res;
  },

  async login(data: any): Promise<{ token: string; user: User; message: string }> {
    const res = await apiRequest<{ token: string; user: User; message: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setStoredToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/api/logout', { method: 'POST' });
    } catch (e) {
      // ignore, clean client-side session anyway
    }
    clearStoredToken();
  },

  // --- PROFILE ---
  async getProfile(): Promise<User> {
    return apiRequest<User>('/api/profile');
  },

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // --- WORKOUTS ---
  async getTodayWorkout(date?: string): Promise<WorkoutPlan | null> {
    const query = date ? `?date=${date}` : '';
    return apiRequest<WorkoutPlan | null>(`/api/workouts${query}`);
  },

  async getWorkoutHistory(): Promise<WorkoutPlan[]> {
    return apiRequest<WorkoutPlan[]>('/api/workouts?all=true');
  },

  async generateAIWorkout(focusArea: string, date?: string): Promise<{ message: string; workout: WorkoutPlan }> {
    return apiRequest<{ message: string; workout: WorkoutPlan }>('/api/generate-workout', {
      method: 'POST',
      body: JSON.stringify({ focusArea, date })
    });
  },

  async completeExercise(exerciseId: string, date?: string): Promise<{ message: string; workout: WorkoutPlan; user: any }> {
    return apiRequest<{ message: string; workout: WorkoutPlan; user: any }>('/api/workouts/complete-exercise', {
      method: 'POST',
      body: JSON.stringify({ exerciseId, date })
    });
  },

  async completeWorkout(date?: string): Promise<{ message: string; workout: WorkoutPlan; user: any }> {
    return apiRequest<{ message: string; workout: WorkoutPlan; user: any }>('/api/workouts/complete', {
      method: 'POST',
      body: JSON.stringify({ date })
    });
  },

  // --- PROGRESS ---
  async logProgress(data: { weight: number; chest?: number; waist?: number; arms?: number; date?: string }): Promise<{ message: string; entry: ProgressLog; user: any }> {
    return apiRequest<{ message: string; entry: ProgressLog; user: any }>('/api/progress', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getProgressHistory(): Promise<ProgressLog[]> {
    return apiRequest<ProgressLog[]>('/api/progress-history');
  },

  // --- NUTRITION ---
  async getNutritionData(date?: string): Promise<NutritionLog> {
    const query = date ? `?date=${date}` : '';
    return apiRequest<NutritionLog>(`/api/nutrition-data${query}`);
  },

  async logMeal(data: { mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks'; name: string; calories: number; protein?: number; carbs?: number; fat?: number; date?: string }): Promise<{ message: string; log: NutritionLog; user: any }> {
    return apiRequest<{ message: string; log: NutritionLog; user: any }>('/api/nutrition', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async logWater(amountMl: number, date?: string): Promise<{ message: string; log: NutritionLog; user: any }> {
    return apiRequest<{ message: string; log: NutritionLog; user: any }>('/api/nutrition/water', {
      method: 'POST',
      body: JSON.stringify({ amountMl, date })
    });
  },

  // --- INSIGHTS / CHAT ---
  async getChatHistory(): Promise<ChatMessage[]> {
    return apiRequest<ChatMessage[]>('/api/ai-chat/history');
  },

  async sendChatMessage(message: string): Promise<{ message: ChatMessage }> {
    return apiRequest<{ message: ChatMessage }>('/api/ai-chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  // --- GAMIFICATION & MISCELLANEOUS ---
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return apiRequest<LeaderboardEntry[]>('/api/leaderboard');
  },

  async getExercises(): Promise<Exercise[]> {
    return apiRequest<Exercise[]>('/api/exercises');
  }
};
