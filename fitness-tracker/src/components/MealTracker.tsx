import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, UtensilsCrossed, Search, Minus, Calculator } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';
import {
  MEAL_LABELS,
  MEAL_ICONS,
  FOOD_CATALOG,
  searchFoods,
  catalogToFoodItem,
  calcFoodCalories,
  formatFoodQty,
  getMealCalories,
  estimateCaloriesFromName,
  type MealType,
  type FoodCatalogItem,
  type FoodItem,
  type FoodUnit,
} from '../types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'eveningSnack', 'dinner'];

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: '#f59e0b',
  lunch: '#10b981',
  eveningSnack: '#8b5cf6',
  dinner: '#06b6d4',
};

interface PendingFood {
  catalogId: string;
  quantity: number;
}

function pluralLabel(unit: string, qty: number): string {
  if (qty === 1) {
    if (unit.endsWith('s') && unit !== 'g' && unit !== 'ml' && unit !== 'tbsp' && unit !== 'tsp') {
      return unit.slice(0, -1);
    }
    return unit;
  }
  const map: Record<string, string> = {
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

export function MealTracker() {
  const log = useFitnessStore((s) => s.getCurrentLog());
  const addMeal = useFitnessStore((s) => s.addMeal);
  const removeMeal = useFitnessStore((s) => s.removeMeal);

  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState<PendingFood[]>([]);
  const [notes, setNotes] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customUnit, setCustomUnit] = useState<FoodUnit>('serving');
  const [autofillHint, setAutofillHint] = useState<string | null>(null);
  const [calsManual, setCalsManual] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const results = useMemo(() => searchFoods(query), [query]);

  const pendingItems = useMemo(() => {
    return pending
      .map((p) => {
        const catalog = FOOD_CATALOG.find((c) => c.id === p.catalogId);
        if (!catalog) return null;
        return { catalog, quantity: p.quantity };
      })
      .filter(Boolean) as { catalog: FoodCatalogItem; quantity: number }[];
  }, [pending]);

  const selectedCalories = pendingItems.reduce(
    (sum, item) => sum + calcFoodCalories(item.catalog.caloriesPerUnit, item.quantity),
    0
  );

  const getPendingQty = (catalogId: string) =>
    pending.find((p) => p.catalogId === catalogId)?.quantity;

  const addOrSelect = (catalog: FoodCatalogItem) => {
    setPending((prev) => {
      const existing = prev.find((p) => p.catalogId === catalog.id);
      if (existing) return prev;
      return [...prev, { catalogId: catalog.id, quantity: catalog.defaultQty }];
    });
  };

  const setQty = (catalogId: string, quantity: number) => {
    const qty = Math.max(0.5, Math.round(quantity * 2) / 2);
    setPending((prev) =>
      prev.map((p) => (p.catalogId === catalogId ? { ...p, quantity: qty } : p))
    );
  };

  const removePending = (catalogId: string) => {
    setPending((prev) => prev.filter((p) => p.catalogId !== catalogId));
  };

  const handleCustomNameChange = (value: string) => {
    setCustomName(value);

    // Detect leading quantity like "6 paneer" or "6 paneer pieces"
    const qtyMatch = value.trim().match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
    const qtyFromName = qtyMatch ? Number(qtyMatch[1]) : null;
    const nameForMatch = qtyMatch ? qtyMatch[2] : value;

    const estimate = estimateCaloriesFromName(nameForMatch);

    if (estimate && !calsManual) {
      setCustomCals(String(estimate.caloriesPerUnit));
      setCustomUnit(estimate.unit);
      if (qtyFromName && qtyFromName > 0) {
        setCustomQty(String(qtyFromName));
      } else {
        setCustomQty(String(estimate.defaultQty));
      }
      const qty = qtyFromName && qtyFromName > 0 ? qtyFromName : estimate.defaultQty;
      const total = calcFoodCalories(estimate.caloriesPerUnit, qty);
      setAutofillHint(
        `Autofilled: ${estimate.caloriesPerUnit} kcal / ${estimate.unit} × ${qty} = ${total} kcal (matched “${estimate.matchedAs}”)`
      );
    } else if (estimate && calsManual) {
      if (qtyFromName && qtyFromName > 0) setCustomQty(String(qtyFromName));
      setAutofillHint('Calories edited manually — name match available if you clear kcal');
    } else if (value.trim().length >= 2) {
      setAutofillHint('No match found — enter calories manually');
      if (!calsManual) setCustomCals('');
    } else {
      setAutofillHint(null);
      if (!calsManual) setCustomCals('');
    }
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    const perUnit = Number(customCals);
    const qty = Number(customQty);
    if (!name || !perUnit || perUnit <= 0 || !qty || qty <= 0 || !activeMeal) return;

    const food: Omit<FoodItem, 'id'> = {
      name,
      quantity: qty,
      unit: customUnit,
      caloriesPerUnit: perUnit,
      calories: calcFoodCalories(perUnit, qty),
    };
    addMeal(activeMeal, [food], notes || undefined);
    setCustomName('');
    setCustomCals('');
    setCustomQty('1');
    setCustomUnit('serving');
    setAutofillHint(null);
    setCalsManual(false);
    setShowCustom(false);
    setNotes('');
    setActiveMeal(null);
    setPending([]);
    setQuery('');
  };

  const handleAdd = () => {
    if (!activeMeal || pendingItems.length === 0) return;
    const foods = pendingItems.map(({ catalog, quantity }) => {
      const item = catalogToFoodItem(catalog, quantity, 'temp');
      const { id: _id, ...rest } = item;
      return rest;
    });
    addMeal(activeMeal, foods, notes || undefined);
    setPending([]);
    setNotes('');
    setQuery('');
    setActiveMeal(null);
  };

  const openMeal = (type: MealType) => {
    setActiveMeal(activeMeal === type ? null : type);
    setPending([]);
    setQuery('');
    setShowCustom(false);
  };

  return (
    <section className="glass-card p-6">
      <h2 className="section-title mb-2">
        <UtensilsCrossed className="w-5 h-5 text-accent-emerald" />
        Meal Tracker
      </h2>
      <p className="text-xs text-white/40 mb-6">
        Log breakfast, lunch, evening snack & dinner. Set quantity (e.g. 6 paneer pieces) — calories calculate automatically.
      </p>

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
              onClick={() => openMeal(type)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeMeal === type
                  ? 'border-accent-emerald bg-accent-emerald/10'
                  : 'border-white/10 bg-surface-700/50 hover:border-white/20'
              }`}
            >
              <span className="text-2xl">{MEAL_ICONS[type]}</span>
              <p className="font-semibold text-sm mt-2">{MEAL_LABELS[type]}</p>
              <p className="text-xs text-white/50">
                {cals} kcal · {meals.length} entries
              </p>
              <div className="h-1 rounded-full mt-2 overflow-hidden bg-white/10">
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
            <div className="border border-white/10 rounded-xl p-4 bg-surface-700/30 mb-4 space-y-4">
              <p className="text-sm font-medium">
                Add to {MEAL_LABELS[activeMeal]}
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search foods… e.g. paneer, roti, egg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-10 text-sm"
                />
              </div>

              {/* Food list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                {results.map((food) => {
                  const qty = getPendingQty(food.id);
                  const selected = qty != null;
                  const liveCals = selected
                    ? calcFoodCalories(food.caloriesPerUnit, qty)
                    : food.caloriesPerUnit;

                  return (
                    <div
                      key={food.id}
                      className={`rounded-lg border text-sm transition-all ${
                        selected
                          ? 'bg-accent-emerald/15 border-accent-emerald/50'
                          : 'bg-surface-700/50 border-transparent hover:border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => (selected ? removePending(food.id) : addOrSelect(food))}
                        className="w-full flex justify-between items-center px-3 py-2 text-left"
                      >
                        <div>
                          <span className="font-medium">{food.name}</span>
                          <p className="text-[11px] text-white/40">
                            {food.caloriesPerUnit} kcal / {pluralLabel(food.unit, 1)}
                          </p>
                        </div>
                        <span className="text-white/60 text-xs shrink-0 ml-2">
                          {selected ? `${liveCals} kcal` : `+ add`}
                        </span>
                      </button>

                      {selected && (
                        <div className="flex items-center justify-between px-3 pb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setQty(food.id, qty - 1)}
                              className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center hover:bg-surface-600"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={0.5}
                              step={0.5}
                              value={qty}
                              onChange={(e) => setQty(food.id, Number(e.target.value) || 0.5)}
                              className="w-14 text-center input-field py-1 text-sm"
                            />
                            <button
                              onClick={() => setQty(food.id, qty + 1)}
                              className="w-7 h-7 rounded-lg bg-surface-700 flex items-center justify-center hover:bg-surface-600"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-white/50">
                              {pluralLabel(food.unit, qty)}
                            </span>
                          </div>
                          <motion.span
                            key={liveCals}
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            className="text-accent-emerald font-semibold text-sm flex items-center gap-1"
                          >
                            <Calculator className="w-3 h-3" />
                            {liveCals} kcal
                          </motion.span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {results.length === 0 && (
                  <p className="text-sm text-white/40 col-span-2 py-4 text-center">
                    No foods found. Try a custom entry below.
                  </p>
                )}
              </div>

              {/* Custom food */}
              <div>
                <button
                  onClick={() => setShowCustom(!showCustom)}
                  className="text-xs text-accent-cyan hover:underline"
                >
                  {showCustom ? 'Hide custom food' : '+ Add custom food (calories autofill from name)'}
                </button>
                <AnimatePresence>
                  {showCustom && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          placeholder="Food name (e.g. 6 paneer pieces)"
                          value={customName}
                          onChange={(e) => handleCustomNameChange(e.target.value)}
                          className="input-field text-sm sm:col-span-2"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="kcal / unit"
                            value={customCals}
                            onChange={(e) => {
                              setCustomCals(e.target.value);
                              setCalsManual(true);
                              setAutofillHint('Calories edited manually');
                            }}
                            className="input-field text-sm pr-12"
                          />
                          {customCals && !calsManual && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-accent-emerald font-medium">
                              auto
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={customQty}
                            onChange={(e) => setCustomQty(e.target.value)}
                            className="input-field text-sm flex-1"
                          />
                          <span className="text-xs text-white/40 self-center shrink-0 w-14 truncate">
                            {customUnit}
                          </span>
                        </div>
                      </div>
                      {autofillHint && (
                        <p
                          className={`text-xs ${
                            autofillHint.startsWith('Autofilled')
                              ? 'text-accent-emerald'
                              : autofillHint.includes('manual')
                                ? 'text-accent-amber'
                                : 'text-white/40'
                          }`}
                        >
                          {autofillHint}
                          {customCals && customQty
                            ? ` · Total ${calcFoodCalories(Number(customCals) || 0, Number(customQty) || 0)} kcal`
                            : ''}
                        </p>
                      )}
                      <button
                        onClick={handleAddCustom}
                        disabled={!customName.trim() || !customCals}
                        className="btn-secondary text-xs w-full disabled:opacity-40"
                      >
                        Log custom food
                        {customCals && customQty
                          ? ` (${calcFoodCalories(Number(customCals) || 0, Number(customQty) || 0)} kcal)`
                          : ''}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <input
                type="text"
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field text-sm"
              />

              {/* Pending summary */}
              {pendingItems.length > 0 && (
                <div className="rounded-xl bg-surface-800/60 border border-white/5 p-3 space-y-1">
                  <p className="text-xs text-white/40 mb-2">Ready to log:</p>
                  {pendingItems.map(({ catalog, quantity }) => (
                    <div key={catalog.id} className="flex justify-between text-sm">
                      <span>
                        {quantity} {pluralLabel(catalog.unit, quantity)} {catalog.name}
                      </span>
                      <span className="text-accent-emerald font-medium">
                        {calcFoodCalories(catalog.caloriesPerUnit, quantity)} kcal
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">
                  Selected total:{' '}
                  <strong className="text-white">{selectedCalories} kcal</strong>
                </span>
                <button
                  onClick={handleAdd}
                  disabled={pendingItems.length === 0}
                  className="btn-primary flex items-center gap-2 disabled:opacity-40"
                >
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
              <div className="flex items-center gap-3 min-w-0">
                <span>{MEAL_ICONS[meal.mealType]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{MEAL_LABELS[meal.mealType]}</p>
                  <p className="text-xs text-white/50 truncate">
                    {meal.foods
                      .map((f) =>
                        f.quantity != null && f.unit
                          ? `${formatFoodQty(f)} ${f.name} (${f.calories} kcal)`
                          : `${f.name} (${f.calories} kcal)`
                      )
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-accent-emerald">
                  {getMealCalories(meal)} kcal
                </span>
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
