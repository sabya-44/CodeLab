import { useEffect, useMemo, useState } from 'react';
import {
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Timer,
} from 'lucide-react';
import { ALL_RICH_QUESTIONS } from '../data/banks/questionBankIndex';
import { CATEGORIES, TOPICS, TOPICS_BY_ID } from '../data/topicsIndex';
import type { QuestionCategory, RichQuizQuestion } from '../types/practiceBank';
import type { CategoryId, DifficultyTier, MockInterviewResult } from '../types/topic';
import { RichQuestionCard } from './RichQuestionCard';

interface InterviewPrepViewProps {
  interviewHistory: MockInterviewResult[];
  onRecordMockInterview: (result: MockInterviewResult) => void;
  onRecordRichQuizAnswer: (
    topicId: string,
    questionId: string,
    category: string,
    isCorrect: boolean
  ) => Promise<void>;
  onOpenTopic: (topicId: string) => void;
}

const ALL_CATEGORIES: QuestionCategory[] = [
  'Conceptual',
  'Output-based',
  'Logical',
  'Practical',
  'Debugging',
  'Scenario',
];

type MockPresetId = 'balanced-10' | 'fullstack-15' | 'output-debug-10';

const MOCK_PRESETS: Array<{
  id: MockPresetId;
  label: string;
  count: number;
  durationSec: number;
  description: string;
}> = [
  {
    id: 'balanced-10',
    label: 'Core JS & Async Mix (10 Qs · 8 min)',
    count: 10,
    durationSec: 480,
    description: 'Balanced mix across all 6 interview categories.',
  },
  {
    id: 'output-debug-10',
    label: 'Output-Prediction & Debugging Sprint (10 Qs · 8 min)',
    count: 10,
    durationSec: 480,
    description: 'Hoisting, closures, event loop, promises, and bug hunting.',
  },
  {
    id: 'fullstack-15',
    label: 'Full-Stack Senior Assessment (15 Qs · 12 min)',
    count: 15,
    durationSec: 720,
    description: 'Comprehensive timed mock covering intermediate & advanced topics.',
  },
];

function formatClock(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function sampleQuestions(preset: MockPresetId): RichQuizQuestion[] {
  const pool =
    preset === 'output-debug-10'
      ? ALL_RICH_QUESTIONS.filter(
          (q) => q.category === 'Output-based' || q.category === 'Debugging'
        )
      : preset === 'fullstack-15'
      ? ALL_RICH_QUESTIONS.filter((q) => q.difficulty !== 'Basic')
      : ALL_RICH_QUESTIONS;

  const targetCount = MOCK_PRESETS.find((p) => p.id === preset)?.count ?? 10;
  const copy = [...pool];
  // Fisher-Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, targetCount);
}

export function InterviewPrepView({
  interviewHistory,
  onRecordMockInterview,
  onRecordRichQuizAnswer,
  onOpenTopic,
}: InterviewPrepViewProps) {
  const [mode, setMode] = useState<'bank' | 'mock'>('bank');

  // Practice Bank Filters
  const [sectionFilter, setSectionFilter] = useState<'All' | CategoryId>('All');
  const [topicFilter, setTopicFilter] = useState<'All' | string>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | QuestionCategory>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | DifficultyTier>('All');
  const [page, setPage] = useState(1);
  const [bankSelections, setBankSelections] = useState<Record<string, number>>({});

  // Timed Mock Interview State
  const [selectedPreset, setSelectedPreset] = useState<MockPresetId>('balanced-10');
  const [mockPhase, setMockPhase] = useState<'setup' | 'running' | 'report'>('setup');
  const [mockQuestions, setMockQuestions] = useState<RichQuizQuestion[]>([]);
  const [mockAnswers, setMockAnswers] = useState<Record<string, number>>({});
  const [mockCurrentIdx, setMockCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(480);
  const [mockTotalDuration, setMockTotalDuration] = useState(480);
  const [latestReport, setLatestReport] = useState<MockInterviewResult | null>(null);

  const sectionTopics = useMemo(
    () =>
      sectionFilter === 'All'
        ? TOPICS
        : TOPICS.filter((t) => t.categoryId === sectionFilter),
    [sectionFilter]
  );

  const filteredQuestions = useMemo(() => {
    return ALL_RICH_QUESTIONS.filter((q) => {
      const t = TOPICS_BY_ID[q.topicId];
      if (!t) return false;
      if (sectionFilter !== 'All' && t.categoryId !== sectionFilter) return false;
      if (topicFilter !== 'All' && q.topicId !== topicFilter) return false;
      if (categoryFilter !== 'All' && q.category !== categoryFilter) return false;
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [categoryFilter, difficultyFilter, sectionFilter, topicFilter]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleQuestions = filteredQuestions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const finishMockInterview = () => {
    const breakdown: Record<string, { correct: number; total: number }> = {};
    const weakTopics = new Set<string>();
    let correctCount = 0;

    for (const q of mockQuestions) {
      const cat = breakdown[q.category] ?? { correct: 0, total: 0 };
      cat.total += 1;
      const isRight = mockAnswers[q.id] === q.correctIndex;
      if (isRight) {
        cat.correct += 1;
        correctCount += 1;
      } else {
        weakTopics.add(q.topicId);
      }
      breakdown[q.category] = cat;
      if (mockAnswers[q.id] !== undefined) {
        void onRecordRichQuizAnswer(q.topicId, q.id, q.category, isRight);
      }
    }

    const totalQuestions = mockQuestions.length;
    const scorePct =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const presetLabel =
      MOCK_PRESETS.find((p) => p.id === selectedPreset)?.label ?? 'Mock Interview';

    const report: MockInterviewResult = {
      id: `mock-${Date.now()}`,
      completedAt: new Date().toISOString(),
      preset: presetLabel,
      totalQuestions,
      correctCount,
      scorePct,
      durationSec: Math.max(1, mockTotalDuration - secondsLeft),
      categoryBreakdown: breakdown,
      weakTopicIds: Array.from(weakTopics),
    };

    setLatestReport(report);
    setMockPhase('report');
    onRecordMockInterview(report);
  };

  useEffect(() => {
    if (mockPhase !== 'running') return;
    if (secondsLeft <= 0) {
      finishMockInterview();
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockPhase, secondsLeft]);

  const startMockInterview = () => {
    const presetObj = MOCK_PRESETS.find((p) => p.id === selectedPreset) ?? MOCK_PRESETS[0];
    const picked = sampleQuestions(presetObj.id);
    setMockQuestions(picked);
    setMockAnswers({});
    setMockCurrentIdx(0);
    setMockTotalDuration(presetObj.durationSec);
    setSecondsLeft(presetObj.durationSec);
    setLatestReport(null);
    setMockPhase('running');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header & Mode Switch */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-800 flex items-center gap-1.5">
            <Briefcase size={14} />
            JavaScript Interview Preparation Mode
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Interview Question Bank &amp; Timed Mock Assessments
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Practice across all 6 interview categories with full explanations of why the right option
            works AND why every wrong option fails, or test yourself under realistic timed conditions.
          </p>
        </div>

        <div className="flex items-center gap-2" role="tablist" aria-label="Interview mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'bank'}
            onClick={() => setMode('bank')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              mode === 'bank'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Practice Bank ({ALL_RICH_QUESTIONS.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'mock'}
            onClick={() => setMode('mock')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              mode === 'mock'
                ? 'bg-slate-900 text-white'
                : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <Timer size={14} />
            Timed Mock Interview
          </button>
        </div>
      </section>

      {/* PRACTICE BANK MODE */}
      {mode === 'bank' && (
        <div className="space-y-4">
          <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="space-y-1 text-xs">
                <span className="font-semibold text-slate-700">Section</span>
                <select
                  value={sectionFilter}
                  onChange={(e) => {
                    setSectionFilter(e.target.value as 'All' | CategoryId);
                    setTopicFilter('All');
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="All">All 8 Sections</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs">
                <span className="font-semibold text-slate-700">Topic</span>
                <select
                  value={topicFilter}
                  onChange={(e) => {
                    setTopicFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="All">All Topics ({sectionTopics.length})</option>
                  {sectionTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{String(t.number).padStart(2, '0')} {t.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs">
                <span className="font-semibold text-slate-700">Category</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value as 'All' | QuestionCategory);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="All">All 6 Categories</option>
                  {ALL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-xs">
                <span className="font-semibold text-slate-700">Difficulty</span>
                <select
                  value={difficultyFilter}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value as 'All' | DifficultyTier);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 tabular-nums">
              <span>Showing {filteredQuestions.length} matching interview questions</span>
              <span>
                Page {safePage} of {totalPages}
              </span>
            </div>
          </section>

          <div className="space-y-3">
            {visibleQuestions.map((q, idx) => {
              const t = TOPICS_BY_ID[q.topicId];
              return (
                <RichQuestionCard
                  key={q.id}
                  question={q}
                  indexLabel={`#${(safePage - 1) * pageSize + idx + 1}`}
                  topicLabel={t ? `Topic ${String(t.number).padStart(2, '0')}: ${t.title}` : undefined}
                  selectedIndex={bankSelections[q.id]}
                  onSelectOption={(optIdx) => {
                    setBankSelections((prev) => ({ ...prev, [q.id]: optIdx }));
                    void onRecordRichQuizAnswer(
                      q.topicId,
                      q.id,
                      q.category,
                      optIdx === q.correctIndex
                    );
                  }}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs">
              <span className="text-slate-500 tabular-nums">
                Page {safePage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TIMED MOCK INTERVIEW MODE */}
      {mode === 'mock' && (
        <div className="space-y-5">
          {mockPhase === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Choose a Timed Mock Interview Format
                </h2>
                <div className="space-y-2.5">
                  {MOCK_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPreset(p.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                        selectedPreset === p.id
                          ? 'bg-sky-50 border-sky-600 text-sky-950'
                          : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-sm font-bold">{p.label}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{p.description}</div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={startMockInterview}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg inline-flex items-center gap-2 cursor-pointer"
                >
                  <Play size={14} />
                  Start Timed Mock Interview
                </button>
              </section>

              <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                  <Award size={14} className="text-emerald-600" />
                  Recent Mock Scores ({interviewHistory.length})
                </h3>
                {interviewHistory.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Complete a timed mock to track your score history and weak areas.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {interviewHistory.slice(0, 8).map((h) => (
                      <div
                        key={h.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="truncate">{h.preset}</span>
                          <span
                            className={`tabular-nums ${
                              h.scorePct >= 80
                                ? 'text-emerald-700'
                                : h.scorePct >= 60
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {h.scorePct}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                          {h.correctCount}/{h.totalQuestions} correct · {formatClock(h.durationSec)} ·{' '}
                          {new Date(h.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {mockPhase === 'running' && mockQuestions[mockCurrentIdx] && (
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div className="text-xs font-semibold text-slate-700 tabular-nums">
                  Question {mockCurrentIdx + 1} of {mockQuestions.length} · Answered{' '}
                  {Object.keys(mockAnswers).length}/{mockQuestions.length}
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold tabular-nums flex items-center gap-1.5 ${
                      secondsLeft <= 60
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-slate-100 border-slate-200 text-slate-900'
                    }`}
                  >
                    <Clock size={14} />
                    {formatClock(secondsLeft)}
                  </div>
                  <button
                    type="button"
                    onClick={finishMockInterview}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg cursor-pointer"
                  >
                    Submit Interview
                  </button>
                </div>
              </div>

              {/* Question Navigator */}
              <div className="flex flex-wrap gap-1.5">
                {mockQuestions.map((q, idx) => {
                  const answered = mockAnswers[q.id] !== undefined;
                  const active = idx === mockCurrentIdx;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setMockCurrentIdx(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold tabular-nums border cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : answered
                          ? 'bg-sky-50 text-sky-900 border-sky-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active Mock Question (hides explanations until submission!) */}
              {(() => {
                const q = mockQuestions[mockCurrentIdx];
                const chosen = mockAnswers[q.id];
                return (
                  <div className="space-y-4">
                    <div className="text-xs font-semibold text-slate-500">
                      {q.category} · {q.difficulty}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{q.question}</h3>
                    {q.codeSnippet && (
                      <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed">
                        <code>{q.codeSnippet}</code>
                      </pre>
                    )}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setMockAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className={`w-full text-left px-4 py-3 text-xs border rounded-lg transition-colors cursor-pointer flex items-start gap-2.5 ${
                            chosen === optIdx
                              ? 'bg-sky-50 border-sky-600 text-sky-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-sky-400'
                          }`}
                        >
                          <span className="font-mono font-bold text-slate-400">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={mockCurrentIdx === 0}
                        onClick={() => setMockCurrentIdx((i) => Math.max(0, i - 1))}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
                      >
                        Previous
                      </button>
                      {mockCurrentIdx < mockQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setMockCurrentIdx((i) => i + 1)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg cursor-pointer"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={finishMockInterview}
                          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg cursor-pointer"
                        >
                          Finish &amp; Score
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          {mockPhase === 'report' && latestReport && (
            <div className="space-y-5">
              <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Mock Interview Completed
                    </div>
                    <h2 className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                      Score: {latestReport.scorePct}% ({latestReport.correctCount}/
                      {latestReport.totalQuestions})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      {latestReport.preset} · Finished in {formatClock(latestReport.durationSec)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMockPhase('setup')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={13} /> New Mock Session
                  </button>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
                  {Object.entries(latestReport.categoryBreakdown).map(([cat, stats]) => (
                    <div
                      key={cat}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="font-semibold text-slate-700 truncate">{cat}</div>
                      <div className="text-base font-bold text-slate-900 tabular-nums mt-0.5">
                        {stats.correct}/{stats.total}
                      </div>
                    </div>
                  ))}
                </div>

                {latestReport.weakTopicIds.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                    <div className="text-xs font-bold text-amber-950">
                      Recommended Topics to Revise from This Session:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {latestReport.weakTopicIds.map((tid) => {
                        const t = TOPICS_BY_ID[tid];
                        if (!t) return null;
                        return (
                          <button
                            key={tid}
                            type="button"
                            onClick={() => onOpenTopic(tid)}
                            className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg cursor-pointer"
                          >
                            #{String(t.number).padStart(2, '0')} {t.title} →
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* Full Answer Breakdown (Why right + Why every wrong option fails) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Detailed Solution Review (Every Option Explained)
                </h3>
                {mockQuestions.map((q, idx) => (
                  <RichQuestionCard
                    key={q.id}
                    question={q}
                    indexLabel={`Q${idx + 1}`}
                    selectedIndex={mockAnswers[q.id] ?? -1}
                    onSelectOption={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
