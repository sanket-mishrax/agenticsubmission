import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { MealTracker } from './components/MealTracker';
import { HydrationTracker } from './components/HydrationTracker';
import { SleepWellnessPanel } from './components/SleepWellnessPanel';
import { ChartsPanel } from './components/ChartsPanel';
import { AgentOrchestrationPanel } from './components/AgentOrchestrationPanel';

const sections = [
  { id: 'overview', component: DashboardOverview },
  { id: 'meals', component: MealTracker },
  { id: 'hydration', component: HydrationTracker },
  { id: 'sleep', component: SleepWellnessPanel },
  { id: 'charts', component: ChartsPanel },
  { id: 'agents', component: AgentOrchestrationPanel },
];

export default function App() {
  return (
    <div className="min-h-screen bg-surface-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-emerald/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent-violet/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
      </div>

      <Header />

      <main className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {sections.map(({ id, component: Component }, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
          >
            <Component />
          </motion.div>
        ))}
      </main>

      <footer className="relative text-center py-8 text-xs text-white/30">
        VitalSync Fitness Tracker · Built for Netlify deployment · Data stored locally in your browser
      </footer>
    </div>
  );
}
