import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';
import {
  MEAL_LABELS,
  MEAL_ICONS,
  FOOD_DATABASE,
  getMealCalories,
  type MealType,
} from '../types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'eveningSnack', 'dinner'];

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: '#f59e0b',
  lunch: '#10b981',
  eveningSnack: '#8b5cf6',
  dinner: '#06b6d4',
};

export function MealTracker() {
  const log = useFitnessStore((s) => s.getCurrentLog());
  const addMeal = useFitnessStore((s) => s.addMeal);
  const removeMeal = useFitnessStore((s) => s.removeMeal);
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<number[]>([]);
  const [notes, setNotes] = useState('');

  const toggleFood = (index: number) => {
    setSelectedFoods((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleAdd = () => {
    if (!activeMeal || selectedFoods.length === 0) return;
    const foods = selectedFoods.map((i) => FOOD_DATABASE[i]);
    addMeal(activeMeal, foods, notes || undefined);
    setSelectedFoods([]);
    setNotes('');
    setActiveMeal(null);
  };

  const selectedCalories = selectedFoods.reduce((s, i) => s + FOOD_DATABASE[i].calories, 0);

  return (
    <section className="glass-card p-6">
      <h2 className="section-title mb-6">
        <UtensilsCrossed className="w-5 h-5 text-accent-emerald" />
        Meal Tracker
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {MEAL_TYPES.map((type, i) => {
          const meals = log.meals.filter((m) => m.mealType === type);
          const cals = meals.reduce((s, m) => s + getMealCalories(m), 0);
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveMeal(activeMeal === type ? null : type);
                setSelectedFoods([]);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeMeal === type
                  ? 'border-accent-emerald bg-accent-emerald/10'
                  : 'border-white/10 bg-surface-700/50 hover:border-white/20'
              }`}
            >
              <span className="text-2xl">{MEAL_ICONS[type]}</span>
              <p className="font-semibold text-sm mt-2">{MEAL_LABELS[type]}</p>
              <p className="text-xs text-white/50">{cals} kcal · {meals.length} entries</p>
              <div
                className="h-1 rounded-full mt-2 overflow-hidden bg-white/10"
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: MEAL_COLORS[type] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((cals / 600) * 100, 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {activeMeal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-white/10 rounded-xl p-4 bg-surface-700/30 mb-4">
              <p className="text-sm font-medium mb-3">
                Add to {MEAL_LABELS[activeMeal]} — select foods:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {FOOD_DATABASE.map((food, i) => (
                  <button
                    key={food.name}
                    onClick={() => toggleFood(i)}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedFoods.includes(i)
                        ? 'bg-accent-emerald/20 border border-accent-emerald/50'
                        : 'bg-surface-700/50 border border-transparent hover:border-white/10'
                    }`}
                  >
                    <span>{food.name}</span>
                    <span className="text-white/50">{food.calories} kcal</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field mt-3 text-sm"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-white/50">
                  Selected: {selectedCalories} kcal
                </span>
                <button onClick={handleAdd} disabled={selectedFoods.length === 0} className="btn-primary flex items-center gap-2 disabled:opacity-40">
                  <Plus className="w-4 h-4" /> Log Meal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {log.meals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-white/50 mb-2">Today's meals</p>
          {log.meals.map((meal, i) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-700/40 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span>{MEAL_ICONS[meal.mealType]}</span>
                <div>
                  <p className="text-sm font-medium">{MEAL_LABELS[meal.mealType]}</p>
                  <p className="text-xs text-white/50">
                    {meal.foods.map((f) => f.name).join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-accent-emerald">{getMealCalories(meal)} kcal</span>
                <button
                  onClick={() => removeMeal(meal.id)}
                  className="p-1.5 rounded-lg hover:bg-accent-rose/20 text-white/40 hover:text-accent-rose transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
