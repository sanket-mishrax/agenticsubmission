import { motion } from 'framer-motion';
import { Moon, Heart, Footprints, Brain, Clock } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';

function SliderField({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
  icon: React.ElementType;
  color: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="glass-card-hover p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <motion.span
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold"
          style={{ color }}
        >
          {value}{unit}
        </motion.span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-xs text-white/30 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-white/50 flex items-center gap-1">
        <Clock className="w-3 h-3" /> {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field text-sm"
      />
    </div>
  );
}

function HeartPulse({ bpm }: { bpm: number }) {
  return (
    <div className="flex items-center justify-center py-4">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 60 / bpm, ease: 'easeInOut' }}
        className="relative"
      >
        <Heart className="w-12 h-12 text-accent-rose fill-accent-rose/30" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-accent-rose/30"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ repeat: Infinity, duration: 60 / bpm, ease: 'easeOut' }}
        />
      </motion.div>
      <div className="ml-4">
        <p className="text-3xl font-bold text-accent-rose">{bpm}</p>
        <p className="text-xs text-white/50">avg bpm</p>
      </div>
    </div>
  );
}

export function SleepWellnessPanel() {
  const log = useFitnessStore((s) => s.getCurrentLog());
  const updateSleep = useFitnessStore((s) => s.updateSleep);
  const updateWellness = useFitnessStore((s) => s.updateWellness);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-6">
        <h2 className="section-title mb-6">
          <Moon className="w-5 h-5 text-accent-violet" />
          Sleep Data
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <TimeField
            label="Bedtime"
            value={log.sleep.bedTime}
            onChange={(v) => updateSleep({ bedTime: v })}
          />
          <TimeField
            label="Wake time"
            value={log.sleep.wakeTime}
            onChange={(v) => updateSleep({ wakeTime: v })}
          />
        </div>

        <SliderField
          label="Sleep Duration"
          value={log.sleep.durationHours}
          min={4}
          max={12}
          unit="h"
          onChange={(v) => updateSleep({ durationHours: v })}
          icon={Moon}
          color="#8b5cf6"
        />

        <div className="mt-4">
          <SliderField
            label="Sleep Quality"
            value={log.sleep.quality}
            min={1}
            max={10}
            unit="/10"
            onChange={(v) => updateSleep({ quality: v })}
            icon={Moon}
            color="#a78bfa"
          />
        </div>

        <div className="mt-4 p-3 rounded-xl bg-surface-700/40 text-sm text-white/60">
          <p>💤 Placeholder: Connect wearable or manual entry for automatic sleep tracking</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="section-title mb-6">
          <Brain className="w-5 h-5 text-accent-rose" />
          Wellness Metrics
        </h2>

        <HeartPulse bpm={log.wellness.heartRateAvg} />

        <div className="space-y-4 mt-4">
          <SliderField
            label="Heart Rate (avg)"
            value={log.wellness.heartRateAvg}
            min={50}
            max={120}
            unit=" bpm"
            onChange={(v) => updateWellness({ heartRateAvg: v })}
            icon={Heart}
            color="#f43f5e"
          />
          <SliderField
            label="Stress Level"
            value={log.wellness.stressLevel}
            min={1}
            max={10}
            unit="/10"
            onChange={(v) => updateWellness({ stressLevel: v })}
            icon={Brain}
            color="#f59e0b"
          />
          <SliderField
            label="Step Count"
            value={log.wellness.stepCount}
            min={0}
            max={20000}
            unit=""
            onChange={(v) => updateWellness({ stepCount: v })}
            icon={Footprints}
            color="#10b981"
          />
        </div>

        <div className="mt-4 p-3 rounded-xl bg-surface-700/40 text-sm text-white/60">
          <p>⌚ Placeholder: Sync Apple Health, Google Fit, or Fitbit for live data</p>
        </div>
      </div>
    </section>
  );
}
