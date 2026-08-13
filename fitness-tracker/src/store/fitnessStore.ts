import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DailyLog,
  FoodItem,
  MealEntry,
  MealType,
  HydrationData,
  SleepData,
  WellnessMetrics,
  OrchestrationResult,
} from '../types';
import {
  createEmptyDailyLog,
  getTodayDate,
  getTotalCalories,
} from '../types';
import { orchestrateAgents } from '../agents/orchestrator';

interface FitnessState {
  logs: Record<string, DailyLog>;
  currentDate: string;
  orchestration: OrchestrationResult | null;
  isOrchestrating: boolean;

  getCurrentLog: () => DailyLog;
  setCurrentDate: (date: string) => void;
  setCalorieGoal: (goal: number) => void;

  addMeal: (mealType: MealType, foods: Omit<FoodItem, 'id'>[], notes?: string) => void;
  removeMeal: (mealId: string) => void;
  updateHydration: (data: Partial<HydrationData>) => void;
  updateSleep: (data: Partial<SleepData>) => void;
  updateWellness: (data: Partial<WellnessMetrics>) => void;

  runOrchestration: () => Promise<void>;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      logs: { [getTodayDate()]: createEmptyDailyLog(getTodayDate()) },
      currentDate: getTodayDate(),
      orchestration: null,
      isOrchestrating: false,

      getCurrentLog: () => {
        const { logs, currentDate } = get();
        if (!logs[currentDate]) {
          const newLog = createEmptyDailyLog(currentDate);
          set({ logs: { ...logs, [currentDate]: newLog } });
          return newLog;
        }
        return logs[currentDate];
      },

      setCurrentDate: (date) => set({ currentDate: date }),

      setCalorieGoal: (goal) => {
        const { logs, currentDate } = get();
        const log = get().getCurrentLog();
        set({
          logs: {
            ...logs,
            [currentDate]: { ...log, calorieGoal: goal },
          },
        });
      },

      addMeal: (mealType, foods, notes) => {
        const { logs, currentDate } = get();
        const log = get().getCurrentLog();
        const entry: MealEntry = {
          id: generateId(),
          mealType,
          foods: foods.map((f) => ({ ...f, id: generateId() })),
          timestamp: new Date().toISOString(),
          notes,
        };
        set({
          logs: {
            ...logs,
            [currentDate]: {
              ...log,
              meals: [...log.meals, entry],
            },
          },
        });
      },

      removeMeal: (mealId) => {
        const { logs, currentDate } = get();
        const log = get().getCurrentLog();
        set({
          logs: {
            ...logs,
            [currentDate]: {
              ...log,
              meals: log.meals.filter((m) => m.id !== mealId),
            },
          },
        });
      },

      updateHydration: (data) => {
        const { logs, currentDate } = get();
        const log = get().getCurrentLog();
        set({
          logs: {
            ...logs,
            [currentDate]: {
              ...log,
              hydration: { ...log.hydration, ...data },
            },
          },
        });
      },

      updateSleep: (data) => {
        const { logs, currentDate } = get();
        const log = get().getCurrentLog();
        set({
          logs: {
            ...logs,
            [currentDate]: {
              ...log,
              sleep: { ...log.sleep, ...data },
            },
          },
        });
      },

      updateWellness: (data) => {
        const { logs, currentDate } = get();
        const log = get().getCurrentLog();
        set({
          logs: {
            ...logs,
            [currentDate]: {
              ...log,
              wellness: { ...log.wellness, ...data },
            },
          },
        });
      },

      runOrchestration: async () => {
        set({ isOrchestrating: true });
        const log = get().getCurrentLog();
        await new Promise((r) => setTimeout(r, 1200));
        const result = orchestrateAgents(log);
        set({ orchestration: result, isOrchestrating: false });
      },
    }),
    {
      name: 'vitalsync-fitness',
      partialize: (state) => ({ logs: state.logs }),
    }
  )
);

export function useCurrentStats() {
  const log = useFitnessStore((s) => s.getCurrentLog());
  const totalCalories = getTotalCalories(log);
  const remaining = log.calorieGoal - totalCalories;
  const progress = Math.min((totalCalories / log.calorieGoal) * 100, 100);

  return { log, totalCalories, remaining, progress };
}
