import { motion } from 'framer-motion';
import { Droplets, Coffee, CupSoda, Minus, Plus } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';

function Counter({
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="glass-card-hover p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}
          className="w-9 h-9 rounded-xl bg-surface-700 flex items-center justify-center hover:bg-surface-600 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="text-center">
          <motion.span
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold"
          >
            {value}
          </motion.span>
          <p className="text-xs text-white/40">{unit}</p>
        </div>
        <button
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}
          className="w-9 h-9 rounded-xl bg-surface-700 flex items-center justify-center hover:bg-surface-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function WaterWave({ level }: { level: number }) {
  const pct = Math.min(level / 2.5, 1) * 100;
  return (
    <div className="relative h-32 rounded-xl overflow-hidden bg-surface-700/50 border border-white/10">
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent-cyan/60 to-accent-cyan/20"
        initial={{ height: 0 }}
        animate={{ height: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-4 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10">
          <Droplets className="w-6 h-6 mx-auto text-accent-cyan mb-1" />
          <p className="text-lg font-bold">{level.toFixed(1)}L</p>
          <p className="text-xs text-white/50">of 2.5L goal</p>
        </div>
      </div>
    </div>
  );
}

export function HydrationTracker() {
  const log = useFitnessStore((s) => s.getCurrentLog());
  const updateHydration = useFitnessStore((s) => s.updateHydration);
  const { waterLiters, coffeeCups, teaCups } = log.hydration;

  return (
    <section className="glass-card p-6">
      <h2 className="section-title mb-6">
        <Droplets className="w-5 h-5 text-accent-cyan" />
        Hydration & Beverages
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WaterWave level={waterLiters} />

        <div className="grid grid-cols-1 gap-3">
          <Counter
            label="Water"
            value={waterLiters}
            unit="liters"
            step={0.25}
            min={0}
            max={5}
            onChange={(v) => updateHydration({ waterLiters: v })}
            icon={Droplets}
            color="#06b6d4"
          />
          <Counter
            label="Coffee"
            value={coffeeCups}
            unit="cups"
            step={1}
            min={0}
            max={10}
            onChange={(v) => updateHydration({ coffeeCups: v })}
            icon={Coffee}
            color="#f59e0b"
          />
          <Counter
            label="Tea"
            value={teaCups}
            unit="cups"
            step={1}
            min={0}
            max={10}
            onChange={(v) => updateHydration({ teaCups: v })}
            icon={CupSoda}
            color="#10b981"
          />
        </div>
      </div>
    </section>
  );
}
