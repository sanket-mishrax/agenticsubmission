import type { DailyLog, AgentInsight } from '../types';
import { getTotalCalories, getCaloriesByMeal } from '../types';

export interface Agent {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  analyze: (log: DailyLog) => AgentInsight;
}

function scoreToStatus(score: number): AgentInsight['status'] {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
}

export const nutritionAgent: Agent = {
  id: 'nutrition',
  name: 'Nutrition Agent',
  icon: '🥗',
  color: '#10b981',
  description: 'Analyzes meal distribution and calorie balance',
  analyze: (log) => {
    const total = getTotalCalories(log);
    const byMeal = getCaloriesByMeal(log);
    const goal = log.calorieGoal;
    const ratio = total / goal;

    let score = 70;
    const recommendations: string[] = [];

    if (ratio >= 0.85 && ratio <= 1.05) {
      score += 20;
    } else if (ratio > 1.15) {
      score -= 25;
      recommendations.push('Calorie intake exceeds goal — consider lighter dinner options');
    } else if (ratio < 0.6) {
      score -= 15;
      recommendations.push('You are significantly under your calorie goal');
    }

    const mealsLogged = Object.values(byMeal).filter((c) => c > 0).length;
    if (mealsLogged >= 3) score += 10;
    else recommendations.push(`Only ${mealsLogged} meals logged — aim for 4 meals`);

    if (byMeal.breakfast === 0) recommendations.push('Add breakfast to kickstart metabolism');
    if (byMeal.eveningSnack > 300) recommendations.push('Evening snack is high — swap for fruit or nuts');

    const message =
      ratio > 1.1
        ? `Over budget by ${total - goal} kcal today`
        : ratio < 0.7
          ? `${goal - total} kcal remaining — room for a balanced meal`
          : `Well-balanced intake at ${total} / ${goal} kcal`;

    return {
      agentId: 'nutrition',
      agentName: 'Nutrition Agent',
      icon: '🥗',
      color: '#10b981',
      score: Math.max(0, Math.min(100, score)),
      status: scoreToStatus(score),
      message,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  },
};

export const hydrationAgent: Agent = {
  id: 'hydration',
  name: 'Hydration Agent',
  icon: '💧',
  color: '#06b6d4',
  description: 'Tracks water, coffee, and tea intake patterns',
  analyze: (log) => {
    const { waterLiters, coffeeCups, teaCups } = log.hydration;
    const goal = 2.5;
    let score = 50;
    const recommendations: string[] = [];

    const waterScore = Math.min(waterLiters / goal, 1) * 40;
    score += waterScore;

    if (waterLiters >= goal) score += 15;
    else recommendations.push(`Drink ${(goal - waterLiters).toFixed(1)}L more water today`);

    const caffeine = coffeeCups * 95 + teaCups * 47;
    if (caffeine <= 200) score += 15;
    else if (caffeine <= 400) {
      score += 5;
      recommendations.push('Moderate caffeine — consider switching to herbal tea');
    } else {
      score -= 20;
      recommendations.push('High caffeine intake may affect sleep quality');
    }

    if (coffeeCups + teaCups === 0) recommendations.push('No warm beverages logged yet');

    const message =
      waterLiters >= goal
        ? `Hydration goal met: ${waterLiters.toFixed(1)}L water + ${coffeeCups + teaCups} warm drinks`
        : `${waterLiters.toFixed(1)}L / ${goal}L water · ${coffeeCups} coffee · ${teaCups} tea`;

    return {
      agentId: 'hydration',
      agentName: 'Hydration Agent',
      icon: '💧',
      color: '#06b6d4',
      score: Math.max(0, Math.min(100, score)),
      status: scoreToStatus(score),
      message,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  },
};

export const sleepAgent: Agent = {
  id: 'sleep',
  name: 'Sleep Agent',
  icon: '😴',
  color: '#8b5cf6',
  description: 'Evaluates sleep duration, timing, and quality',
  analyze: (log) => {
    const { durationHours, quality, bedTime, wakeTime } = log.sleep;
    let score = 40;
    const recommendations: string[] = [];

    if (durationHours >= 7 && durationHours <= 9) score += 30;
    else if (durationHours < 6) {
      score -= 10;
      recommendations.push('Aim for at least 7 hours of sleep');
    } else if (durationHours > 9) {
      recommendations.push('Long sleep detected — check for fatigue or illness');
    }

    score += (quality / 10) * 25;

    const bedHour = parseInt(bedTime.split(':')[0], 10);
    if (bedHour >= 22 && bedHour <= 23) score += 10;
    else if (bedHour > 23) recommendations.push('Late bedtime may reduce sleep quality');

    const message = `${durationHours}h sleep (${bedTime} → ${wakeTime}) · Quality ${quality}/10`;

    return {
      agentId: 'sleep',
      agentName: 'Sleep Agent',
      icon: '😴',
      color: '#8b5cf6',
      score: Math.max(0, Math.min(100, score)),
      status: scoreToStatus(score),
      message,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  },
};

export const activityAgent: Agent = {
  id: 'activity',
  name: 'Activity Agent',
  icon: '🏃',
  color: '#f59e0b',
  description: 'Monitors steps and heart rate trends',
  analyze: (log) => {
    const { stepCount, heartRateAvg, stressLevel } = log.wellness;
    const stepGoal = 10000;
    let score = 30;
    const recommendations: string[] = [];

    const stepRatio = stepCount / stepGoal;
    score += Math.min(stepRatio, 1) * 40;

    if (stepCount >= stepGoal) score += 15;
    else recommendations.push(`${(stepGoal - stepCount).toLocaleString()} steps to reach 10k goal`);

    if (heartRateAvg >= 60 && heartRateAvg <= 80) score += 15;
    else if (heartRateAvg > 90) {
      score -= 10;
      recommendations.push('Elevated resting heart rate — prioritize recovery');
    }

    if (stressLevel <= 4) score += 10;
    else if (stressLevel >= 7) {
      score -= 15;
      recommendations.push('High stress detected — try breathing exercises or a walk');
    }

    const message = `${stepCount.toLocaleString()} steps · ${heartRateAvg} bpm avg · Stress ${stressLevel}/10`;

    return {
      agentId: 'activity',
      agentName: 'Activity Agent',
      icon: '🏃',
      color: '#f59e0b',
      score: Math.max(0, Math.min(100, score)),
      status: scoreToStatus(score),
      message,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  },
};

export const wellnessCoordinator: Agent = {
  id: 'coordinator',
  name: 'Wellness Coordinator',
  icon: '🧠',
  color: '#f43f5e',
  description: 'Orchestrates all agents and synthesizes holistic insights',
  analyze: (log) => {
    const agents = [nutritionAgent, hydrationAgent, sleepAgent, activityAgent];
    const insights = agents.map((a) => a.analyze(log));
    const avgScore = insights.reduce((s, i) => s + i.score, 0) / insights.length;

    const critical = insights.filter((i) => i.status === 'critical' || i.status === 'warning');
    const recommendations: string[] = [];

    if (critical.length > 0) {
      recommendations.push(`Priority: address ${critical[0].agentName.replace(' Agent', '').toLowerCase()} first`);
    }
    recommendations.push('Review individual agent panels for detailed recommendations');

    const weakest = insights.reduce((min, i) => (i.score < min.score ? i : min), insights[0]);
    if (weakest.score < 70) {
      recommendations.unshift(`Focus area: ${weakest.agentName} (score ${weakest.score})`);
    }

    const message =
      avgScore >= 80
        ? 'Excellent holistic wellness today — keep it up!'
        : avgScore >= 65
          ? 'Good progress — a few areas need attention'
          : 'Several wellness metrics need improvement today';

    return {
      agentId: 'coordinator',
      agentName: 'Wellness Coordinator',
      icon: '🧠',
      color: '#f43f5e',
      score: Math.round(avgScore),
      status: scoreToStatus(avgScore),
      message,
      recommendations,
      timestamp: new Date().toISOString(),
    };
  },
};

export const ALL_AGENTS: Agent[] = [
  nutritionAgent,
  hydrationAgent,
  sleepAgent,
  activityAgent,
  wellnessCoordinator,
];
