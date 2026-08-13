import type { DailyLog, OrchestrationResult } from '../types';
import {
  nutritionAgent,
  hydrationAgent,
  sleepAgent,
  activityAgent,
  wellnessCoordinator,
} from './index';

const WORKER_AGENTS = [nutritionAgent, hydrationAgent, sleepAgent, activityAgent];

/**
 * Multi-agent orchestration pipeline:
 * 1. Dispatch parallel analysis to specialist agents
 * 2. Aggregate worker insights
 * 3. Coordinator synthesizes holistic wellness score
 */
export function orchestrateAgents(log: DailyLog): OrchestrationResult {
  const workerInsights = WORKER_AGENTS.map((agent) => agent.analyze(log));
  const coordinatorInsight = wellnessCoordinator.analyze(log);

  const allInsights = [...workerInsights, coordinatorInsight];
  const overallScore = coordinatorInsight.score;

  const summary = buildSummary(overallScore, workerInsights);

  return {
    overallScore,
    insights: allInsights,
    summary,
    activeAgents: WORKER_AGENTS.map((a) => a.id).concat('coordinator'),
  };
}

function buildSummary(
  score: number,
  insights: ReturnType<typeof nutritionAgent.analyze>[]
): string {
  const labels = insights.map((i) => `${i.agentName}: ${i.score}/100`);
  const headline =
    score >= 85
      ? '🌟 Outstanding wellness day'
      : score >= 70
        ? '✅ Solid wellness foundation'
        : score >= 50
          ? '⚠️ Room for improvement'
          : '🔴 Action needed across multiple areas';

  return `${headline} · Overall ${score}/100 · ${labels.join(' · ')}`;
}

export async function orchestrateAgentsAsync(log: DailyLog): Promise<OrchestrationResult> {
  const phases = [
    { agent: nutritionAgent, delay: 300 },
    { agent: hydrationAgent, delay: 500 },
    { agent: sleepAgent, delay: 700 },
    { agent: activityAgent, delay: 900 },
  ];

  const workerInsights = [];
  for (const { agent, delay } of phases) {
    await new Promise((r) => setTimeout(r, delay));
    workerInsights.push(agent.analyze(log));
  }

  await new Promise((r) => setTimeout(r, 200));
  const coordinatorInsight = wellnessCoordinator.analyze(log);

  return {
    overallScore: coordinatorInsight.score,
    insights: [...workerInsights, coordinatorInsight],
    summary: buildSummary(coordinatorInsight.score, workerInsights),
    activeAgents: phases.map((p) => p.agent.id).concat('coordinator'),
  };
}
