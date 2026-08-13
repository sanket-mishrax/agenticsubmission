import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Play, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useFitnessStore } from '../store/fitnessStore';
import type { AgentInsight } from '../types';

const STATUS_COLORS: Record<AgentInsight['status'], string> = {
  excellent: '#10b981',
  good: '#06b6d4',
  warning: '#f59e0b',
  critical: '#f43f5e',
};

function AgentCard({ insight, index }: { insight: AgentInsight; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isCoordinator = insight.agentId === 'coordinator';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card-hover overflow-hidden ${isCoordinator ? 'border-accent-rose/30' : ''}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <motion.span
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: index * 0.5 }}
          className="text-2xl"
        >
          {insight.icon}
        </motion.span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{insight.agentName}</p>
            {isCoordinator && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-rose/20 text-accent-rose font-medium">
                ORCHESTRATOR
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 truncate">{insight.message}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold" style={{ color: STATUS_COLORS[insight.status] }}>
              {insight.score}
            </p>
            <p className="text-[10px] text-white/40 uppercase">{insight.status}</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              <div className="h-1.5 rounded-full bg-white/10 mb-3 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: insight.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${insight.score}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              {insight.recommendations.length > 0 && (
                <ul className="space-y-1.5">
                  {insight.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="text-accent-emerald mt-0.5">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OrchestrationFlow({ isRunning, activeAgents }: { isRunning: boolean; activeAgents: string[] }) {
  const agents = [
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { id: 'hydration', label: 'Hydration', icon: '💧' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
    { id: 'activity', label: 'Activity', icon: '🏃' },
    { id: 'coordinator', label: 'Coordinator', icon: '🧠' },
  ];

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap py-4">
      {agents.map((agent, i) => {
        const isActive = isRunning && activeAgents.includes(agent.id);
        const isDone = !isRunning && activeAgents.includes(agent.id);

        return (
          <div key={agent.id} className="flex items-center">
            <motion.div
              animate={
                isActive
                  ? { scale: [1, 1.1, 1], boxShadow: ['0 0 0 rgba(16,185,129,0)', '0 0 20px rgba(16,185,129,0.4)', '0 0 0 rgba(16,185,129,0)'] }
                  : {}
              }
              transition={{ repeat: isActive ? Infinity : 0, duration: 1 }}
              className={`flex flex-col items-center p-2 rounded-xl min-w-[60px] ${
                isActive
                  ? 'bg-accent-emerald/20 border border-accent-emerald/40'
                  : isDone
                    ? 'bg-surface-700/60 border border-white/10'
                    : 'bg-surface-700/30 border border-white/5 opacity-50'
              }`}
            >
              <span className="text-lg">{agent.icon}</span>
              <span className="text-[10px] text-white/50 mt-0.5">{agent.label}</span>
            </motion.div>
            {i < agents.length - 1 && (
              <motion.div
                className="w-4 h-0.5 mx-0.5"
                animate={{
                  backgroundColor: isActive ? '#10b981' : 'rgba(255,255,255,0.1)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AgentOrchestrationPanel() {
  const orchestration = useFitnessStore((s) => s.orchestration);
  const isOrchestrating = useFitnessStore((s) => s.isOrchestrating);
  const runOrchestration = useFitnessStore((s) => s.runOrchestration);

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="section-title">
            <Bot className="w-5 h-5 text-accent-rose" />
            Multi-Agent Orchestration
          </h2>
          <p className="text-xs text-white/40 mt-1">
            4 specialist agents analyze your data → Wellness Coordinator synthesizes insights
          </p>
        </div>
        <button
          onClick={() => runOrchestration()}
          disabled={isOrchestrating}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {isOrchestrating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Orchestrating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Run Analysis
            </>
          )}
        </button>
      </div>

      <OrchestrationFlow
        isRunning={isOrchestrating}
        activeAgents={orchestration?.activeAgents ?? ['nutrition', 'hydration', 'sleep', 'activity', 'coordinator']}
      />

      {orchestration && !isOrchestrating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 rounded-xl bg-gradient-to-r from-accent-emerald/10 to-accent-cyan/10 border border-accent-emerald/20"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{orchestration.summary}</p>
            <div className="text-2xl font-bold text-accent-emerald ml-4 shrink-0">
              {orchestration.overallScore}/100
            </div>
          </div>
        </motion.div>
      )}

      {orchestration && !isOrchestrating && (
        <div className="space-y-3">
          {orchestration.insights.map((insight, i) => (
            <AgentCard key={insight.agentId} insight={insight} index={i} />
          ))}
        </div>
      )}

      {!orchestration && !isOrchestrating && (
        <div className="text-center py-8 text-white/40">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Log your meals and wellness data, then run the multi-agent analysis</p>
        </div>
      )}
    </section>
  );
}
