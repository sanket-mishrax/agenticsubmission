import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';
import { getCaloriesByMeal, MEAL_LABELS, type MealType } from '../types';

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: '#f59e0b',
  lunch: '#10b981',
  eveningSnack: '#8b5cf6',
  dinner: '#06b6d4',
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-sm border border-white/20">
      <p className="text-white/70">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export function ChartsPanel() {
  const log = useFitnessStore((s) => s.getCurrentLog());
  const [activeChart, setActiveChart] = useState<'meals' | 'macros' | 'radar' | 'timeline'>('meals');

  const byMeal = getCaloriesByMeal(log);
  const mealData = (Object.keys(byMeal) as MealType[]).map((key) => ({
    name: MEAL_LABELS[key].split(' ')[0],
    calories: byMeal[key],
    fill: MEAL_COLORS[key],
  }));

  const allFoods = log.meals.flatMap((m) => m.foods);
  const macros = {
    protein: allFoods.reduce((s, f) => s + (f.protein ?? 0), 0),
    carbs: allFoods.reduce((s, f) => s + (f.carbs ?? 0), 0),
    fat: allFoods.reduce((s, f) => s + (f.fat ?? 0), 0),
  };
  const macroData = [
    { name: 'Protein', value: macros.protein, fill: '#10b981' },
    { name: 'Carbs', value: macros.carbs, fill: '#06b6d4' },
    { name: 'Fat', value: macros.fat, fill: '#f59e0b' },
  ];

  const radarData = [
    { metric: 'Calories', value: Math.min((log.meals.reduce((s, m) => s + m.foods.reduce((a, f) => a + f.calories, 0), 0) / log.calorieGoal) * 100, 100), fullMark: 100 },
    { metric: 'Hydration', value: Math.min((log.hydration.waterLiters / 2.5) * 100, 100), fullMark: 100 },
    { metric: 'Sleep', value: (log.sleep.durationHours / 8) * 100, fullMark: 100 },
    { metric: 'Steps', value: Math.min((log.wellness.stepCount / 10000) * 100, 100), fullMark: 100 },
    { metric: 'Low Stress', value: ((10 - log.wellness.stressLevel) / 10) * 100, fullMark: 100 },
    { metric: 'Heart', value: log.wellness.heartRateAvg >= 60 && log.wellness.heartRateAvg <= 80 ? 90 : 60, fullMark: 100 },
  ];

  const timelineData = [
    { time: '6am', energy: 40, hydration: log.hydration.waterLiters > 0 ? 30 : 10 },
    { time: '9am', energy: 70, hydration: 40 },
    { time: '12pm', energy: 85, hydration: 55 },
    { time: '3pm', energy: 65, hydration: 70 },
    { time: '6pm', energy: 75, hydration: 80 },
    { time: '9pm', energy: 50, hydration: Math.min(log.hydration.waterLiters / 2.5 * 100, 100) },
  ];

  const charts = [
    { id: 'meals' as const, label: 'Meals' },
    { id: 'macros' as const, label: 'Macros' },
    { id: 'radar' as const, label: 'Wellness' },
    { id: 'timeline' as const, label: 'Timeline' },
  ];

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="section-title">
          <BarChart3 className="w-5 h-5 text-accent-violet" />
          Interactive Visualizations
        </h2>
        <div className="flex gap-2 flex-wrap">
          {charts.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveChart(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChart === c.id
                  ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/40'
                  : 'bg-surface-700/50 text-white/50 hover:text-white border border-transparent'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeChart}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="h-72"
      >
        {activeChart === 'meals' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mealData} barCategoryGap="20%">
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calories" radius={[8, 8, 0, 0]} animationDuration={1200}>
                {mealData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'macros' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {macroData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'radar' && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.2)" fontSize={10} />
              <Radar
                name="Wellness"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                animationDuration={1200}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hydraGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="energy" stroke="#f59e0b" fill="url(#energyGrad)" animationDuration={1200} />
              <Area type="monotone" dataKey="hydration" stroke="#06b6d4" fill="url(#hydraGrad)" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {activeChart === 'macros' && (
        <div className="flex justify-center gap-6 mt-2">
          {macroData.map((m) => (
            <div key={m.name} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.fill }} />
              <span className="text-white/70">{m.name}: {m.value}g</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
