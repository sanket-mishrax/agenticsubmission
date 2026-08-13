import { motion } from 'framer-motion';
import { Activity, Brain } from 'lucide-react';
import { useFitnessStore } from '../store/fitnessStore';

export function Header() {
  const currentDate = useFitnessStore((s) => s.currentDate);
  const setCurrentDate = useFitnessStore((s) => s.setCurrentDate);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass-card border-b border-white/10 rounded-none px-4 py-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-emerald to-accent-cyan flex items-center justify-center"
          >
            <Activity className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              VitalSync
            </h1>
            <p className="text-xs text-white/50 flex items-center gap-1">
              <Brain className="w-3 h-3" /> Multi-Agent Wellness Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-white/50">Date</label>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="input-field w-auto text-sm"
          />
        </div>
      </div>
    </motion.header>
  );
}
