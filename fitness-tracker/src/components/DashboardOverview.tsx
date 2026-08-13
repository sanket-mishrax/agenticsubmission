import { motion } from 'framer-motion';
import { Flame, Target, TrendingUp, Droplets, Footprints } from 'lucide-react';
import { useCurrentStats } from '../store/fitnessStore';

function AnimatedRing({ progress, size = 140 }: { progress: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#calorieGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flame className="w-5 h-5 text-accent-amber mb-1" />
        <motion.span
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold"
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-card-hover p-4 flex items-center gap-3"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-lg font-bold">{value}</p>
        {sub && <p className="text-xs text-white/40">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function DashboardOverview() {
  const { log, totalCalories, remaining, progress } = useCurrentStats();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 lg:col-span-1 flex flex-col items-center justify-center"
      >
        <h2 className="section-title mb-4 self-start">
          <Target className="w-5 h-5 text-accent-emerald" />
          Calorie Goal
        </h2>
        <AnimatedRing progress={progress} />
        <div className="mt-4 text-center">
          <p className="text-3xl font-bold">
            {totalCalories}
            <span className="text-lg text-white/50 font-normal"> / {log.calorieGoal} kcal</span>
          </p>
          <p className={`text-sm mt-1 ${remaining >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {remaining >= 0 ? `${remaining} kcal remaining` : `${Math.abs(remaining)} kcal over`}
          </p>
        </div>
      </motion.div>

      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Meals Logged"
          value={String(log.meals.length)}
          sub="Today"
          color="#10b981"
          delay={0.1}
        />
        <StatCard
          icon={Droplets}
          label="Water"
          value={`${log.hydration.waterLiters.toFixed(1)}L`}
          sub={`Goal: 2.5L`}
          color="#06b6d4"
          delay={0.15}
        />
        <StatCard
          icon={Footprints}
          label="Steps"
          value={log.wellness.stepCount.toLocaleString()}
          sub="Goal: 10,000"
          color="#f59e0b"
          delay={0.2}
        />
        <StatCard
          icon={Flame}
          label="Sleep"
          value={`${log.sleep.durationHours}h`}
          sub={`Quality ${log.sleep.quality}/10`}
          color="#8b5cf6"
          delay={0.25}
        />
      </div>
    </section>
  );
}
