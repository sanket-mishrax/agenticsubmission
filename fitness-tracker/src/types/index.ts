export type MealType = 'breakfast' | 'lunch' | 'eveningSnack' | 'dinner';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealEntry {
  id: string;
  mealType: MealType;
  foods: FoodItem[];
  timestamp: string;
  notes?: string;
}

export interface SleepData {
  bedTime: string;
  wakeTime: string;
  durationHours: number;
  quality: number; // 1-10
}

export interface WellnessMetrics {
  stressLevel: number; // 1-10
  heartRateAvg: number; // bpm
  stepCount: number;
}

export interface HydrationData {
  waterLiters: number;
  coffeeCups: number;
  teaCups: number;
}

export interface DailyLog {
  date: string;
  meals: MealEntry[];
  sleep: SleepData;
  wellness: WellnessMetrics;
  hydration: HydrationData;
  calorieGoal: number;
}

export interface AgentInsight {
  agentId: string;
  agentName: string;
  icon: string;
  color: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  message: string;
  recommendations: string[];
  timestamp: string;
}

export interface OrchestrationResult {
  overallScore: number;
  insights: AgentInsight[];
  summary: string;
  activeAgents: string[];
}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  eveningSnack: 'Evening Snack',
  dinner: 'Dinner',
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  eveningSnack: '🍪',
  dinner: '🌙',
};

export const FOOD_DATABASE: Omit<FoodItem, 'id'>[] = [
  { name: 'Oatmeal with berries', calories: 280, protein: 8, carbs: 45, fat: 6 },
  { name: 'Scrambled eggs (2)', calories: 180, protein: 12, carbs: 2, fat: 14 },
  { name: 'Whole wheat toast', calories: 80, protein: 4, carbs: 15, fat: 1 },
  { name: 'Greek yogurt', calories: 150, protein: 15, carbs: 8, fat: 4 },
  { name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'Chicken salad', calories: 350, protein: 30, carbs: 12, fat: 18 },
  { name: 'Grilled chicken breast', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'Brown rice (1 cup)', calories: 216, protein: 5, carbs: 45, fat: 2 },
  { name: 'Mixed vegetables', calories: 80, protein: 3, carbs: 15, fat: 0 },
  { name: 'Protein shake', calories: 200, protein: 25, carbs: 10, fat: 3 },
  { name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0 },
  { name: 'Almonds (handful)', calories: 160, protein: 6, carbs: 6, fat: 14 },
  { name: 'Trail mix', calories: 140, protein: 4, carbs: 14, fat: 8 },
  { name: 'Salmon fillet', calories: 280, protein: 34, carbs: 0, fat: 14 },
  { name: 'Quinoa bowl', calories: 320, protein: 12, carbs: 52, fat: 8 },
  { name: 'Steamed broccoli', calories: 55, protein: 4, carbs: 11, fat: 0 },
  { name: 'Avocado toast', calories: 250, protein: 6, carbs: 24, fat: 16 },
  { name: 'Smoothie bowl', calories: 310, protein: 8, carbs: 48, fat: 10 },
  { name: 'Pasta marinara', calories: 380, protein: 12, carbs: 62, fat: 8 },
  { name: 'Vegetable soup', calories: 120, protein: 4, carbs: 18, fat: 3 },
];

export function createEmptyDailyLog(date: string): DailyLog {
  return {
    date,
    meals: [],
    sleep: {
      bedTime: '23:00',
      wakeTime: '07:00',
      durationHours: 8,
      quality: 7,
    },
    wellness: {
      stressLevel: 5,
      heartRateAvg: 72,
      stepCount: 0,
    },
    hydration: {
      waterLiters: 0,
      coffeeCups: 0,
      teaCups: 0,
    },
    calorieGoal: 2000,
  };
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMealCalories(meal: MealEntry): number {
  return meal.foods.reduce((sum, f) => sum + f.calories, 0);
}

export function getTotalCalories(log: DailyLog): number {
  return log.meals.reduce((sum, meal) => sum + getMealCalories(meal), 0);
}

export function getCaloriesByMeal(log: DailyLog): Record<MealType, number> {
  const result: Record<MealType, number> = {
    breakfast: 0,
    lunch: 0,
    eveningSnack: 0,
    dinner: 0,
  };
  for (const meal of log.meals) {
    result[meal.mealType] += getMealCalories(meal);
  }
  return result;
}
