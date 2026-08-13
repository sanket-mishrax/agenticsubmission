export type MealType = 'breakfast' | 'lunch' | 'eveningSnack' | 'dinner';

export type FoodUnit =
  | 'piece'
  | 'pieces'
  | 'cup'
  | 'cups'
  | 'bowl'
  | 'bowls'
  | 'slice'
  | 'slices'
  | 'serving'
  | 'servings'
  | 'roti'
  | 'rotis'
  | 'tbsp'
  | 'tsp'
  | 'glass'
  | 'glasses'
  | 'plate'
  | 'plates'
  | 'g'
  | 'ml';

export interface FoodCatalogItem {
  id: string;
  name: string;
  /** Calories for one unit (e.g. 1 paneer piece) */
  caloriesPerUnit: number;
  unit: FoodUnit;
  /** Typical default quantity when selecting this food */
  defaultQty: number;
  proteinPerUnit?: number;
  carbsPerUnit?: number;
  fatPerUnit?: number;
  category: 'protein' | 'carb' | 'veggie' | 'dairy' | 'fruit' | 'snack' | 'beverage' | 'meal';
  aliases?: string[];
}

export interface FoodItem {
  id: string;
  name: string;
  /** Total calories for the logged quantity */
  calories: number;
  quantity: number;
  unit: FoodUnit;
  caloriesPerUnit: number;
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
  quality: number;
}

export interface WellnessMetrics {
  stressLevel: number;
  heartRateAvg: number;
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

/** Expanded food catalog with per-unit calories for quantity-based logging */
export const FOOD_CATALOG: FoodCatalogItem[] = [
  // Paneer & dairy
  { id: 'paneer-piece', name: 'Paneer piece', caloriesPerUnit: 45, unit: 'piece', defaultQty: 6, proteinPerUnit: 3.2, carbsPerUnit: 0.6, fatPerUnit: 3.4, category: 'protein', aliases: ['paneer', 'cottage cheese', 'paneer cubes'] },
  { id: 'paneer-tikka', name: 'Paneer tikka piece', caloriesPerUnit: 55, unit: 'piece', defaultQty: 6, proteinPerUnit: 3.5, carbsPerUnit: 1, fatPerUnit: 4, category: 'protein', aliases: ['paneer tikka'] },
  { id: 'paneer-bhurji', name: 'Paneer bhurji', caloriesPerUnit: 220, unit: 'serving', defaultQty: 1, proteinPerUnit: 14, carbsPerUnit: 6, fatPerUnit: 16, category: 'protein' },
  { id: 'greek-yogurt', name: 'Greek yogurt', caloriesPerUnit: 100, unit: 'cup', defaultQty: 1, proteinPerUnit: 17, carbsPerUnit: 6, fatPerUnit: 0.7, category: 'dairy' },
  { id: 'curd', name: 'Curd / Dahi', caloriesPerUnit: 60, unit: 'cup', defaultQty: 1, proteinPerUnit: 3.5, carbsPerUnit: 4.5, fatPerUnit: 3.2, category: 'dairy', aliases: ['dahi', 'yogurt'] },
  { id: 'milk', name: 'Milk (full cream)', caloriesPerUnit: 150, unit: 'glass', defaultQty: 1, proteinPerUnit: 8, carbsPerUnit: 12, fatPerUnit: 8, category: 'dairy' },
  { id: 'cheese-slice', name: 'Cheese slice', caloriesPerUnit: 70, unit: 'slice', defaultQty: 1, proteinPerUnit: 4, carbsPerUnit: 1, fatPerUnit: 5.5, category: 'dairy' },

  // Eggs & protein
  { id: 'egg-boiled', name: 'Boiled egg', caloriesPerUnit: 78, unit: 'piece', defaultQty: 2, proteinPerUnit: 6.3, carbsPerUnit: 0.6, fatPerUnit: 5.3, category: 'protein', aliases: ['egg', 'eggs'] },
  { id: 'egg-omelette', name: 'Egg omelette', caloriesPerUnit: 95, unit: 'piece', defaultQty: 2, proteinPerUnit: 7, carbsPerUnit: 1, fatPerUnit: 7, category: 'protein', aliases: ['omelette'] },
  { id: 'chicken-piece', name: 'Chicken piece (tandoori)', caloriesPerUnit: 85, unit: 'piece', defaultQty: 4, proteinPerUnit: 12, carbsPerUnit: 0, fatPerUnit: 4, category: 'protein', aliases: ['chicken', 'tandoori chicken'] },
  { id: 'chicken-breast', name: 'Grilled chicken breast', caloriesPerUnit: 165, unit: 'serving', defaultQty: 1, proteinPerUnit: 31, carbsPerUnit: 0, fatPerUnit: 3.6, category: 'protein' },
  { id: 'fish-fry', name: 'Fish fry piece', caloriesPerUnit: 90, unit: 'piece', defaultQty: 2, proteinPerUnit: 10, carbsPerUnit: 2, fatPerUnit: 5, category: 'protein', aliases: ['fish'] },
  { id: 'dal', name: 'Dal (cooked)', caloriesPerUnit: 180, unit: 'bowl', defaultQty: 1, proteinPerUnit: 12, carbsPerUnit: 28, fatPerUnit: 3, category: 'protein', aliases: ['lentils', 'daal'] },

  // Indian staples
  { id: 'roti', name: 'Roti / Chapati', caloriesPerUnit: 120, unit: 'roti', defaultQty: 2, proteinPerUnit: 3.5, carbsPerUnit: 22, fatPerUnit: 2.5, category: 'carb', aliases: ['chapati', 'phulka'] },
  { id: 'paratha', name: 'Paratha', caloriesPerUnit: 210, unit: 'piece', defaultQty: 1, proteinPerUnit: 5, carbsPerUnit: 28, fatPerUnit: 9, category: 'carb' },
  { id: 'naan', name: 'Naan', caloriesPerUnit: 260, unit: 'piece', defaultQty: 1, proteinPerUnit: 8, carbsPerUnit: 45, fatPerUnit: 5, category: 'carb' },
  { id: 'rice-cooked', name: 'Cooked rice', caloriesPerUnit: 200, unit: 'cup', defaultQty: 1, proteinPerUnit: 4, carbsPerUnit: 44, fatPerUnit: 0.4, category: 'carb', aliases: ['rice', 'chawal'] },
  { id: 'brown-rice', name: 'Brown rice', caloriesPerUnit: 216, unit: 'cup', defaultQty: 1, proteinPerUnit: 5, carbsPerUnit: 45, fatPerUnit: 1.8, category: 'carb' },
  { id: 'idli', name: 'Idli', caloriesPerUnit: 58, unit: 'piece', defaultQty: 3, proteinPerUnit: 2, carbsPerUnit: 12, fatPerUnit: 0.2, category: 'carb' },
  { id: 'dosa', name: 'Dosa (plain)', caloriesPerUnit: 120, unit: 'piece', defaultQty: 1, proteinPerUnit: 3, carbsPerUnit: 22, fatPerUnit: 2.5, category: 'carb' },
  { id: 'masala-dosa', name: 'Masala dosa', caloriesPerUnit: 250, unit: 'piece', defaultQty: 1, proteinPerUnit: 5, carbsPerUnit: 38, fatPerUnit: 9, category: 'meal' },
  { id: 'poha', name: 'Poha', caloriesPerUnit: 180, unit: 'plate', defaultQty: 1, proteinPerUnit: 4, carbsPerUnit: 32, fatPerUnit: 4, category: 'meal' },
  { id: 'upma', name: 'Upma', caloriesPerUnit: 200, unit: 'bowl', defaultQty: 1, proteinPerUnit: 5, carbsPerUnit: 30, fatPerUnit: 7, category: 'meal' },
  { id: 'samosa', name: 'Samosa', caloriesPerUnit: 260, unit: 'piece', defaultQty: 1, proteinPerUnit: 4, carbsPerUnit: 28, fatPerUnit: 15, category: 'snack' },
  { id: 'pakora', name: 'Pakora / Bhajiya', caloriesPerUnit: 35, unit: 'piece', defaultQty: 4, proteinPerUnit: 1, carbsPerUnit: 3, fatPerUnit: 2.2, category: 'snack', aliases: ['bhajiya', 'fritters'] },

  // Curries / meals
  { id: 'veg-curry', name: 'Vegetable curry', caloriesPerUnit: 150, unit: 'bowl', defaultQty: 1, proteinPerUnit: 4, carbsPerUnit: 18, fatPerUnit: 7, category: 'veggie' },
  { id: 'palak-paneer', name: 'Palak paneer', caloriesPerUnit: 280, unit: 'bowl', defaultQty: 1, proteinPerUnit: 14, carbsPerUnit: 10, fatPerUnit: 20, category: 'meal' },
  { id: 'chicken-curry', name: 'Chicken curry', caloriesPerUnit: 300, unit: 'bowl', defaultQty: 1, proteinPerUnit: 25, carbsPerUnit: 8, fatPerUnit: 18, category: 'meal' },
  { id: 'rajma', name: 'Rajma', caloriesPerUnit: 210, unit: 'bowl', defaultQty: 1, proteinPerUnit: 13, carbsPerUnit: 32, fatPerUnit: 3, category: 'meal' },
  { id: 'chole', name: 'Chole / Chickpea curry', caloriesPerUnit: 220, unit: 'bowl', defaultQty: 1, proteinPerUnit: 12, carbsPerUnit: 30, fatPerUnit: 6, category: 'meal', aliases: ['chana', 'chickpeas'] },

  // Fruits & veggies
  { id: 'banana', name: 'Banana', caloriesPerUnit: 105, unit: 'piece', defaultQty: 1, proteinPerUnit: 1.3, carbsPerUnit: 27, fatPerUnit: 0.4, category: 'fruit' },
  { id: 'apple', name: 'Apple', caloriesPerUnit: 95, unit: 'piece', defaultQty: 1, proteinPerUnit: 0.5, carbsPerUnit: 25, fatPerUnit: 0.3, category: 'fruit' },
  { id: 'orange', name: 'Orange', caloriesPerUnit: 62, unit: 'piece', defaultQty: 1, proteinPerUnit: 1.2, carbsPerUnit: 15, fatPerUnit: 0.2, category: 'fruit' },
  { id: 'mango', name: 'Mango', caloriesPerUnit: 100, unit: 'piece', defaultQty: 1, proteinPerUnit: 1, carbsPerUnit: 25, fatPerUnit: 0.5, category: 'fruit' },
  { id: 'salad', name: 'Green salad', caloriesPerUnit: 50, unit: 'bowl', defaultQty: 1, proteinPerUnit: 2, carbsPerUnit: 8, fatPerUnit: 1, category: 'veggie' },
  { id: 'broccoli', name: 'Steamed broccoli', caloriesPerUnit: 55, unit: 'cup', defaultQty: 1, proteinPerUnit: 4, carbsPerUnit: 11, fatPerUnit: 0.5, category: 'veggie' },

  // Snacks & nuts
  { id: 'almonds', name: 'Almonds', caloriesPerUnit: 7, unit: 'piece', defaultQty: 10, proteinPerUnit: 0.3, carbsPerUnit: 0.2, fatPerUnit: 0.6, category: 'snack', aliases: ['badam'] },
  { id: 'cashews', name: 'Cashews', caloriesPerUnit: 9, unit: 'piece', defaultQty: 8, proteinPerUnit: 0.3, carbsPerUnit: 0.5, fatPerUnit: 0.7, category: 'snack', aliases: ['kaju'] },
  { id: 'biscuits', name: 'Biscuit', caloriesPerUnit: 40, unit: 'piece', defaultQty: 2, proteinPerUnit: 0.6, carbsPerUnit: 6, fatPerUnit: 1.5, category: 'snack', aliases: ['cookie'] },
  { id: 'toast', name: 'Bread toast', caloriesPerUnit: 80, unit: 'slice', defaultQty: 2, proteinPerUnit: 3, carbsPerUnit: 14, fatPerUnit: 1.2, category: 'carb', aliases: ['bread', 'toast'] },
  { id: 'oatmeal', name: 'Oatmeal', caloriesPerUnit: 150, unit: 'bowl', defaultQty: 1, proteinPerUnit: 5, carbsPerUnit: 27, fatPerUnit: 3, category: 'carb', aliases: ['oats'] },
  { id: 'protein-shake', name: 'Protein shake', caloriesPerUnit: 120, unit: 'serving', defaultQty: 1, proteinPerUnit: 24, carbsPerUnit: 3, fatPerUnit: 1.5, category: 'beverage' },
];

export function calcFoodCalories(caloriesPerUnit: number, quantity: number): number {
  return Math.round(caloriesPerUnit * quantity);
}

export function catalogToFoodItem(
  catalog: FoodCatalogItem,
  quantity: number,
  id: string
): FoodItem {
  const qty = Math.max(0.1, quantity);
  return {
    id,
    name: catalog.name,
    quantity: qty,
    unit: catalog.unit,
    caloriesPerUnit: catalog.caloriesPerUnit,
    calories: calcFoodCalories(catalog.caloriesPerUnit, qty),
    protein: catalog.proteinPerUnit != null ? Math.round(catalog.proteinPerUnit * qty * 10) / 10 : undefined,
    carbs: catalog.carbsPerUnit != null ? Math.round(catalog.carbsPerUnit * qty * 10) / 10 : undefined,
    fat: catalog.fatPerUnit != null ? Math.round(catalog.fatPerUnit * qty * 10) / 10 : undefined,
  };
}

export function searchFoods(query: string): FoodCatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_CATALOG;
  return FOOD_CATALOG.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.aliases?.some((a) => a.toLowerCase().includes(q)) ||
      f.category.includes(q)
  );
}

export function formatFoodQty(food: FoodItem): string {
  const displayUnit =
    food.quantity === 1 ? singularUnit(food.unit) : pluralUnit(food.unit);
  return `${food.quantity} ${displayUnit}`;
}

function singularUnit(unit: FoodUnit): string {
  const map: Partial<Record<FoodUnit, string>> = {
    pieces: 'piece',
    cups: 'cup',
    bowls: 'bowl',
    slices: 'slice',
    servings: 'serving',
    rotis: 'roti',
    glasses: 'glass',
    plates: 'plate',
  };
  return map[unit] ?? unit;
}

function pluralUnit(unit: FoodUnit): string {
  const map: Partial<Record<FoodUnit, string>> = {
    piece: 'pieces',
    cup: 'cups',
    bowl: 'bowls',
    slice: 'slices',
    serving: 'servings',
    roti: 'rotis',
    glass: 'glasses',
    plate: 'plates',
  };
  return map[unit] ?? unit;
}

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
