import type { JsTopic, SpacedRevisionState, TopicMasteryRecord } from '../types/topic';

export const SPACED_INTERVALS = [1, 3, 7, 14] as const;

export function addDaysIso(baseIso: string, days: number): string {
  const d = new Date(baseIso);
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

export function createInitialSpacedRevision(nowIso = new Date().toISOString()): SpacedRevisionState {
  return {
    stage: 0,
    intervalDays: 1,
    nextReviewAt: addDaysIso(nowIso, 1),
    lastReviewedAt: nowIso,
    consecutiveStrongReviews: 0,
  };
}

/**
 * Advances or resets a topic's spaced revision schedule based on review performance:
 * - scorePct >= 80: advance stage (1 -> 3 -> 7 -> 14 days)
 * - scorePct 60..79: maintain current stage interval
 * - scorePct < 60: reset to stage 0 (1 day) for reinforcement
 */
export function advanceSpacedRevision(
  current: SpacedRevisionState | undefined,
  scorePct: number,
  nowIso = new Date().toISOString()
): SpacedRevisionState {
  const prevStage = current?.stage ?? 0;

  if (scorePct >= 80) {
    const nextStage = Math.min(3, prevStage + 1) as 0 | 1 | 2 | 3;
    const intervalDays = SPACED_INTERVALS[nextStage];
    return {
      stage: nextStage,
      intervalDays,
      nextReviewAt: addDaysIso(nowIso, intervalDays),
      lastReviewedAt: nowIso,
      consecutiveStrongReviews: (current?.consecutiveStrongReviews ?? 0) + 1,
    };
  }

  if (scorePct >= 60) {
    const intervalDays = SPACED_INTERVALS[prevStage];
    return {
      stage: prevStage,
      intervalDays,
      nextReviewAt: addDaysIso(nowIso, intervalDays),
      lastReviewedAt: nowIso,
      consecutiveStrongReviews: 0,
    };
  }

  return {
    stage: 0,
    intervalDays: 1,
    nextReviewAt: addDaysIso(nowIso, 1),
    lastReviewedAt: nowIso,
    consecutiveStrongReviews: 0,
  };
}

export function isRevisionDue(
  state: SpacedRevisionState | undefined,
  nowMs = Date.now()
): boolean {
  if (!state) return false;
  return new Date(state.nextReviewAt).getTime() <= nowMs;
}

export function daysUntilReview(
  state: SpacedRevisionState | undefined,
  nowMs = Date.now()
): number | null {
  if (!state) return null;
  const diffMs = new Date(state.nextReviewAt).getTime() - nowMs;
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

export interface RecommendedAction {
  topicId: string;
  reasonType: 'due-revision' | 'weak-area' | 'in-progress' | 'next-essential';
  title: string;
  detail: string;
  actionLabel: string;
  targetTab: 'learn' | 'practice' | 'revise';
}

export function buildRecommendations(
  topics: JsTopic[],
  masteryMap: Record<string, TopicMasteryRecord>,
  nowMs = Date.now()
): RecommendedAction[] {
  const recommendations: RecommendedAction[] = [];
  const usedIds = new Set<string>();

  const isMastered = (id: string) => masteryMap[id]?.state === 'mastered';

  // 1. Overdue spaced revisions first
  for (const t of topics) {
    const m = masteryMap[t.id];
    if (m?.spacedRevision && isRevisionDue(m.spacedRevision, nowMs)) {
      recommendations.push({
        topicId: t.id,
        reasonType: 'due-revision',
        title: `#${String(t.number).padStart(2, '0')} ${t.title}`,
        detail: `Spaced review due (${m.spacedRevision.intervalDays}-day interval) — lock in long-term retention.`,
        actionLabel: 'Review Now',
        targetTab: 'revise',
      });
      usedIds.add(t.id);
      if (recommendations.length >= 2) break;
    }
  }

  // 2. Weak areas (in-progress topics with low debugging or coding score)
  const weakCandidates = topics
    .filter((t) => {
      const m = masteryMap[t.id];
      return m && m.state === 'in_progress' && !usedIds.has(t.id);
    })
    .sort((a, b) => (masteryMap[a.id]?.overallScore ?? 0) - (masteryMap[b.id]?.overallScore ?? 0));

  for (const t of weakCandidates.slice(0, 2)) {
    const m = masteryMap[t.id];
    const d = m.dimensions;
    const weakest =
      d.debugging < 50
        ? 'Debugging'
        : d.codingAbility < 60
        ? 'Coding Lab'
        : d.quizPerformance < 80
        ? 'Recall Quiz'
        : 'Practice';
    recommendations.push({
      topicId: t.id,
      reasonType: 'weak-area',
      title: `#${String(t.number).padStart(2, '0')} ${t.title}`,
      detail: `In progress (${m.overallScore}% mastery) — strengthen ${weakest} to reach mastery.`,
      actionLabel: weakest === 'Recall Quiz' ? 'Take Quiz' : 'Continue Practice',
      targetTab: weakest === 'Recall Quiz' ? 'revise' : 'practice',
    });
    usedIds.add(t.id);
  }

  // 3. Next unlocked Essential topic whose prerequisites are met
  for (const t of topics) {
    if (usedIds.has(t.id) || isMastered(t.id)) continue;
    if ((t.track ?? 'Essential') !== 'Essential') continue;
    const prereqs = t.prerequisites ?? [];
    const prereqsMet = prereqs.every((pid) => isMastered(pid));
    if (prereqsMet) {
      recommendations.push({
        topicId: t.id,
        reasonType: 'next-essential',
        title: `#${String(t.number).padStart(2, '0')} ${t.title}`,
        detail:
          prereqs.length > 0
            ? `Prerequisites met — next Essential topic in ${t.categoryTitle}.`
            : `Core foundation topic in ${t.categoryTitle}.`,
        actionLabel: 'Start Lesson',
        targetTab: 'learn',
      });
      usedIds.add(t.id);
      if (recommendations.length >= 5) break;
    }
  }

  return recommendations.slice(0, 5);
}
