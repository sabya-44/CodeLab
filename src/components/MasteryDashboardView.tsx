import { useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  CircleDot,
  Compass,
  Lock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CATEGORIES, TOPICS, TOPICS_BY_ID } from '../data/topicsIndex';
import { getTopicRichQuestions, SECTION_BANK_SUMMARIES } from '../data/banks/questionBankIndex';
import { buildRecommendations, daysUntilReview, isRevisionDue } from '../lib/spacedRevision';
import type { TopicMasteryRecord, TopicProgressRecord } from '../types/topic';
import type { StudyTab } from './LearningWorkspace';
import { RichQuestionCard } from './RichQuestionCard';

interface MasteryDashboardViewProps {
  progressMap: Record<string, TopicProgressRecord>;
  masteryMap: Record<string, TopicMasteryRecord>;
  onOpenTopicTab: (topicId: string, tab: StudyTab) => void;
  onRecordSpacedReview: (topicId: string, scorePct: number) => void;
  onRecordRichQuizAnswer: (
    topicId: string,
    questionId: string,
    category: string,
    isCorrect: boolean
  ) => Promise<void>;
}

type StatusFilter = 'All' | 'mastered' | 'in_progress' | 'not_started' | 'locked';

const DIMENSION_LABELS: Array<{
  key: keyof TopicMasteryRecord['dimensions'];
  label: string;
}> = [
  { key: 'conceptUnderstanding', label: 'Concept Understanding' },
  { key: 'codingAbility', label: 'Coding Ability' },
  { key: 'problemSolving', label: 'Problem-Solving' },
  { key: 'debugging', label: 'Debugging' },
  { key: 'quizPerformance', label: 'Quiz Performance' },
  { key: 'practicalApplication', label: 'Practical Application' },
];

export function MasteryDashboardView({
  progressMap,
  masteryMap,
  onOpenTopicTab,
  onRecordSpacedReview,
  onRecordRichQuizAnswer,
}: MasteryDashboardViewProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [reviewTopicId, setReviewTopicId] = useState<string | null>(null);
  const [reviewSelections, setReviewSelections] = useState<Record<string, number>>({});
  const [reviewSubmitted, setReviewSubmitted] = useState<{
    topicId: string;
    scorePct: number;
  } | null>(null);

  const getState = (topicId: string): 'mastered' | 'in_progress' | 'not_started' => {
    if (masteryMap[topicId]?.state === 'mastered' || progressMap[topicId]?.status === 'solved') {
      return 'mastered';
    }
    if (masteryMap[topicId]?.state === 'in_progress' || progressMap[topicId]?.status === 'attempted') {
      return 'in_progress';
    }
    return 'not_started';
  };

  const stats = useMemo(() => {
    let mastered = 0;
    let inProgress = 0;
    let notStarted = 0;
    const dimTotals = {
      conceptUnderstanding: 0,
      codingAbility: 0,
      problemSolving: 0,
      debugging: 0,
      quizPerformance: 0,
      practicalApplication: 0,
    };

    for (const t of TOPICS) {
      const st = getState(t.id);
      if (st === 'mastered') mastered++;
      else if (st === 'in_progress') inProgress++;
      else notStarted++;

      const dims = masteryMap[t.id]?.dimensions;
      if (dims) {
        dimTotals.conceptUnderstanding += dims.conceptUnderstanding;
        dimTotals.codingAbility += dims.codingAbility;
        dimTotals.problemSolving += dims.problemSolving;
        dimTotals.debugging += dims.debugging;
        dimTotals.quizPerformance += dims.quizPerformance;
        dimTotals.practicalApplication += dims.practicalApplication;
      }
    }

    const activeCount = Math.max(1, mastered + inProgress);
    const dimAverages = {
      conceptUnderstanding: Math.round(dimTotals.conceptUnderstanding / activeCount),
      codingAbility: Math.round(dimTotals.codingAbility / activeCount),
      problemSolving: Math.round(dimTotals.problemSolving / activeCount),
      debugging: Math.round(dimTotals.debugging / activeCount),
      quizPerformance: Math.round(dimTotals.quizPerformance / activeCount),
      practicalApplication: Math.round(dimTotals.practicalApplication / activeCount),
    };

    const totalBankQuestions = CATEGORIES.reduce(
      (sum, c) => sum + (SECTION_BANK_SUMMARIES[c.id]?.totalQuestions ?? 0),
      0
    );

    return { mastered, inProgress, notStarted, dimAverages, totalBankQuestions };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masteryMap, progressMap]);

  const recommendations = useMemo(
    () => buildRecommendations(TOPICS, masteryMap),
    [masteryMap]
  );

  const spacedQueue = useMemo(() => {
    return TOPICS.filter((t) => masteryMap[t.id]?.spacedRevision)
      .map((t) => {
        const sr = masteryMap[t.id].spacedRevision!;
        return {
          topic: t,
          sr,
          due: isRevisionDue(sr),
          daysLeft: daysUntilReview(sr) ?? 0,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [masteryMap]);

  const reviewQuestions = useMemo(() => {
    if (!reviewTopicId) return [];
    return getTopicRichQuestions(reviewTopicId).slice(0, 3);
  }, [reviewTopicId]);

  const startSpacedReview = (topicId: string) => {
    setReviewTopicId(topicId);
    setReviewSelections({});
    setReviewSubmitted(null);
  };

  const completeSpacedReview = () => {
    if (!reviewTopicId || reviewQuestions.length === 0) return;
    const correct = reviewQuestions.filter(
      (q) => reviewSelections[q.id] === q.correctIndex
    ).length;
    const pct = Math.round((correct / reviewQuestions.length) * 100);
    onRecordSpacedReview(reviewTopicId, pct);
    setReviewSubmitted({ topicId: reviewTopicId, scorePct: pct });
  };

  const filteredTopics = useMemo(() => {
    return TOPICS.filter((t) => {
      const st = getState(t.id);
      const missingPrereqs = (t.prerequisites ?? []).filter((pid) => getState(pid) !== 'mastered');
      if (statusFilter === 'All') return true;
      if (statusFilter === 'locked') return st !== 'mastered' && missingPrereqs.length > 0;
      return st === statusFilter;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masteryMap, progressMap, statusFilter]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* KPI Header */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500">Topics Mastered</div>
          <div className="font-display text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {stats.mastered} / {TOPICS.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Earned via quiz + coding tests
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500">In Progress</div>
          <div className="font-display text-2xl font-bold text-sky-700 tabular-nums mt-1">
            {stats.inProgress}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            {stats.notStarted} not started yet
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500">Spaced Revisions</div>
          <div className="font-display text-2xl font-bold text-amber-700 tabular-nums mt-1">
            {spacedQueue.filter((s) => s.due).length} Due
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
            {spacedQueue.length} scheduled (1 / 3 / 7 / 14d)
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-500">Total Question Bank</div>
          <div className="font-display text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {stats.totalBankQuestions} Qs
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            100–130 weighted Qs per section
          </div>
        </div>
      </section>

      {/* 6-Dimension Mastery + Recommended Next */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={17} className="text-sky-700" />
              6-Dimension Mastery Breakdown
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracked separately across your active topics — never inflated by merely opening lessons.
            </p>
          </div>

          <div className="space-y-3">
            {DIMENSION_LABELS.map(({ key, label }) => {
              const val = stats.dimAverages[key];
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{label}</span>
                    <span className="font-bold tabular-nums text-slate-700">{val}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        val >= 80
                          ? 'bg-emerald-600'
                          : val >= 50
                          ? 'bg-sky-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass size={17} className="text-emerald-700" />
              Recommended Next Actions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritizes overdue spaced revisions, weak dimensions, and unlocked Essential topics.
            </p>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec) => (
              <div
                key={rec.topicId}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{rec.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{rec.detail}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenTopicTab(rec.topicId, rec.targetTab)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg inline-flex items-center gap-1 shrink-0 cursor-pointer whitespace-nowrap"
                >
                  {rec.actionLabel}
                  <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Spaced Revision Schedule (1, 3, 7, 14 Days) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock size={17} className="text-amber-700" />
              Spaced Revision Queue (1 → 3 → 7 → 14 Days)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mastered topics automatically resurface for short recall checks. Score ≥80% to extend
              the interval; below 60% resets to 1 day for reinforcement.
            </p>
          </div>
        </div>

        {spacedQueue.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            Master any topic (complete coding/practice + pass Recall Quiz) to automatically enroll it
            into your 1/3/7/14-day spaced revision schedule.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {spacedQueue.map(({ topic, sr, due, daysLeft }) => (
              <div
                key={topic.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                  due ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="truncate">
                    #{String(topic.number).padStart(2, '0')} {topic.title}
                  </span>
                  <span
                    className={`tabular-nums shrink-0 ml-2 ${
                      due ? 'text-amber-800' : 'text-slate-500'
                    }`}
                  >
                    {due ? 'Due Now' : `In ${daysLeft}d`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 tabular-nums">
                  Current Interval: {sr.intervalDays}-day cycle · Strong reviews:{' '}
                  {sr.consecutiveStrongReviews}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => startSpacedReview(topic.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Quick 3-Q Review
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTopicTab(topic.id, 'revise')}
                    className="px-2.5 py-1.5 text-xs font-medium text-sky-800 hover:underline cursor-pointer"
                  >
                    Open Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline Spaced Review Session */}
        {reviewTopicId && reviewQuestions.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles size={15} className="text-amber-600" />
                Spaced Review: {TOPICS_BY_ID[reviewTopicId]?.title}
              </div>
              <button
                type="button"
                onClick={() => setReviewTopicId(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close Review
              </button>
            </div>

            {reviewSubmitted && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 font-semibold">
                Review recorded ({reviewSubmitted.scorePct}%) — your next spaced interval has been
                updated to {masteryMap[reviewTopicId]?.spacedRevision?.intervalDays ?? 1} day(s).
              </div>
            )}

            <div className="space-y-3">
              {reviewQuestions.map((q, idx) => (
                <RichQuestionCard
                  key={q.id}
                  question={q}
                  indexLabel={`Review ${idx + 1}/3`}
                  selectedIndex={reviewSelections[q.id]}
                  onSelectOption={(optIdx) => {
                    setReviewSelections((prev) => ({ ...prev, [q.id]: optIdx }));
                    void onRecordRichQuizAnswer(
                      q.topicId,
                      q.id,
                      q.category,
                      optIdx === q.correctIndex
                    );
                  }}
                />
              ))}
            </div>

            {!reviewSubmitted && (
              <button
                type="button"
                disabled={Object.keys(reviewSelections).length < reviewQuestions.length}
                onClick={completeSpacedReview}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg cursor-pointer disabled:opacity-40"
              >
                Complete Review &amp; Update Schedule
              </button>
            )}
          </div>
        )}
      </section>

      {/* Full 43-Topic Mastery Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Curriculum Mastery Matrix ({filteredTopics.length} Topics)
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ['All', 'All'],
                ['mastered', 'Mastered'],
                ['in_progress', 'In Progress'],
                ['not_started', 'Not Started'],
                ['locked', 'Prereqs Needed'],
              ] as Array<[StatusFilter, string]>
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatusFilter(val)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg border cursor-pointer ${
                  statusFilter === val
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3 font-semibold">Topic</th>
                <th className="py-2 px-3 font-semibold">Status</th>
                <th className="py-2 px-3 font-semibold">Mastery</th>
                <th className="py-2 px-3 font-semibold">Prerequisites</th>
                <th className="py-2 pl-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTopics.map((t) => {
                const st = getState(t.id);
                const score = masteryMap[t.id]?.overallScore ?? (st === 'mastered' ? 100 : 0);
                const missingPrereqs = (t.prerequisites ?? []).filter(
                  (pid) => getState(pid) !== 'mastered'
                );

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold text-slate-900">
                        <span className="tabular-nums text-slate-400 mr-1.5">
                          {String(t.number).padStart(2, '0')}.
                        </span>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {t.categoryTitle} · {t.tier} · {t.track ?? 'Essential'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {st === 'mastered' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 size={13} /> Mastered
                        </span>
                      ) : st === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                          <CircleDot size={13} /> In Progress
                        </span>
                      ) : missingPrereqs.length > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <Lock size={12} /> Prereqs Needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <Circle size={12} /> Not Started
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 tabular-nums font-bold text-slate-800">{score}%</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {missingPrereqs.length === 0 ? (
                        <span className="text-emerald-700">Ready</span>
                      ) : (
                        <span>
                          Missing{' '}
                          {missingPrereqs
                            .map((pid) => `#${TOPICS_BY_ID[pid]?.number ?? ''}`)
                            .join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenTopicTab(
                            t.id,
                            st === 'in_progress' ? 'practice' : 'learn'
                          )
                        }
                        className="text-sky-800 hover:underline font-semibold cursor-pointer"
                      >
                        {st === 'mastered' ? 'Revise' : st === 'in_progress' ? 'Continue' : 'Open'} →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
