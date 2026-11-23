import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  Code2,
  Copy,
  HelpCircle,
  Lightbulb,
  Play,
  RotateCcw,
  Save,
  Search,
  Terminal,
  Workflow,
} from 'lucide-react';
import { CATEGORIES, TOPICS, TOPICS_BY_ID } from '../data/topicsIndex';
import { getVisualizersForTopic, topicHasVisualizer } from '../data/visualizersIndex';
import {
  getAllTopicExecutableChallenges,
  getSectionQuestionSummary,
  getTopicCodingChallenges,
  getTopicDebugChallenges,
  getTopicRichQuestions,
  getTopicTotalQuestionCount,
} from '../data/banks/questionBankIndex';
import { buildPlaygroundSrcDoc } from '../lib/sandboxBuilder';
import type {
  CategoryId,
  ConsoleEntry,
  DifficultyTier,
  JsTopic,
  TopicMasteryRecord,
  TopicProgressRecord,
  TopicTrack,
} from '../types/topic';
import type { QuestionCategory } from '../types/practiceBank';
import { CodeEditor } from './CodeEditor';
import { CodingPlaygroundPanel } from './CodingPlaygroundPanel';
import { DryRunVisualizer } from './DryRunVisualizer';
import { RichQuestionCard } from './RichQuestionCard';

export type StudyTab = 'learn' | 'visualize' | 'practice' | 'revise';
type PracticeMode = 'logical' | 'realLife';
type PracticeWorkspaceMode = 'dom' | 'coding' | 'debug' | 'drills';
type EditorFileTab = 'js' | 'html';
type TierFilter = 'All' | DifficultyTier;
type TrackFilter = 'All' | TopicTrack;

interface LearningWorkspaceProps {
  activeTopicId: string;
  requestedTab?: StudyTab;
  requestedTabNonce?: number;
  onSelectTopic: (topicId: string) => void;
  progressMap: Record<string, TopicProgressRecord>;
  masteryMap: Record<string, TopicMasteryRecord>;
  onSaveProgress: (
    challengeId: string,
    updater: (prev: TopicProgressRecord | undefined) => TopicProgressRecord
  ) => Promise<void>;
  onRecordPracticeRun: (topicId: string, mode: 'logical' | 'realLife') => Promise<void>;
  onRecordQuizPerformance: (
    topicId: string,
    answeredIndices: Record<number, number>,
    correctCount: number,
    totalQuestions: number
  ) => Promise<void>;
  onRecordCodingResult: (
    topicId: string,
    challengeId: string,
    kind: 'logical' | 'realLife' | 'debug',
    passed: boolean,
    hintsUsed: number
  ) => Promise<void>;
  onRecordRichQuizAnswer: (
    topicId: string,
    questionId: string,
    category: string,
    isCorrect: boolean
  ) => Promise<void>;
}

export function LearningWorkspace({
  activeTopicId,
  requestedTab,
  requestedTabNonce,
  onSelectTopic,
  progressMap,
  masteryMap,
  onSaveProgress,
  onRecordPracticeRun,
  onRecordQuizPerformance,
  onRecordCodingResult,
  onRecordRichQuizAnswer,
}: LearningWorkspaceProps) {
  const topicIndex = useMemo(() => {
    const idx = TOPICS.findIndex((t) => t.id === activeTopicId);
    return idx >= 0 ? idx : 0;
  }, [activeTopicId]);

  const topic: JsTopic = TOPICS[topicIndex];
  const topicVisualizers = useMemo(() => getVisualizersForTopic(topic.id), [topic.id]);
  const hasVisualizer = topicVisualizers.length > 0;
  const topicCodingChallenges = useMemo(() => getTopicCodingChallenges(topic.id), [topic.id]);
  const topicDebugChallenges = useMemo(() => getTopicDebugChallenges(topic.id), [topic.id]);
  const topicAllExecutable = useMemo(() => getAllTopicExecutableChallenges(topic.id), [topic.id]);
  const topicRichQuestions = useMemo(() => getTopicRichQuestions(topic.id), [topic.id]);
  const sectionBankSummary = useMemo(
    () => getSectionQuestionSummary(topic.categoryId),
    [topic.categoryId]
  );
  const topicTotalQuestions = useMemo(
    () => getTopicTotalQuestionCount(topic.id, topic.categoryId),
    [topic.categoryId, topic.id]
  );

  const savedRecord = progressMap[topic.id];
  const topicMastery = masteryMap[topic.id];
  const isMastered =
    topicMastery?.state === 'mastered' || savedRecord?.status === 'solved';

  const [tierFilter, setTierFilter] = useState<TierFilter>('All');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    CATEGORIES.forEach((c) => {
      init[c.id] = true;
    });
    return init;
  });

  const [studyTab, setStudyTab] = useState<StudyTab>('learn');
  const [practiceWorkspaceMode, setPracticeWorkspaceMode] = useState<PracticeWorkspaceMode>('dom');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('logical');
  const [editorTab, setEditorTab] = useState<EditorFileTab>('js');
  const [openDeeperBlocks, setOpenDeeperBlocks] = useState<Record<number, boolean>>({});
  const [richQuizSelections, setRichQuizSelections] = useState<Record<string, number>>({});
  const [richCategoryFilter, setRichCategoryFilter] = useState<'All' | QuestionCategory>('All');
  const [richPage, setRichPage] = useState(1);

  const activeExercise = topic.practice[practiceMode];
  const sessionDraftsRef = useRef<Record<string, { html: string; js: string }>>({});

  const [htmlCode, setHtmlCode] = useState(() => topic.practice.logical.starterHtml);
  const [jsCode, setJsCode] = useState(() => topic.practice.logical.starterJs);
  const [domHintLevel, setDomHintLevel] = useState<number>(0);
  const [copiedExample, setCopiedExample] = useState(false);

  const [srcDoc, setSrcDoc] = useState('');
  const [runCounter, setRunCounter] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const activeRunIdRef = useRef<string>('');

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>(
    () => topicMastery?.quizState?.answeredIndices ?? {}
  );
  const [noteDraft, setNoteDraft] = useState(() => savedRecord?.studyNote ?? '');
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  const runPreview = useCallback(
    (nextHtml: string, nextJs: string, css: string) => {
      const nextRunId = `${topic.id}-${practiceMode}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      activeRunIdRef.current = nextRunId;
      setConsoleLogs([]);
      setRunCounter((c) => c + 1);
      setSrcDoc(
        buildPlaygroundSrcDoc({
          runId: nextRunId,
          html: nextHtml,
          css,
          js: nextJs,
        })
      );
    },
    [practiceMode, topic.id]
  );

  // Sync local quiz & note state when switching topics
  useEffect(() => {
    const rec = progressMap[topic.id];
    const mast = masteryMap[topic.id];
    setNoteDraft(rec?.studyNote ?? '');
    setNoteSavedToast(false);
    setCopiedExample(false);
    setOpenDeeperBlocks({});
    setQuizAnswers(mast?.quizState?.answeredIndices ?? {});
    setPracticeMode('logical');
    setPracticeWorkspaceMode('dom');
    setRichCategoryFilter('All');
    setRichPage(1);
    if (studyTab === 'visualize' && !topicHasVisualizer(topic.id)) {
      setStudyTab('learn');
    }
    setExpandedCategories((prev) => ({ ...prev, [topic.categoryId]: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  // Honor explicit external deep-link tab requests (e.g. from Mastery Dashboard)
  useEffect(() => {
    if (!requestedTab) return;
    if (requestedTab === 'visualize' && !topicHasVisualizer(topic.id)) {
      setStudyTab('learn');
    } else {
      setStudyTab(requestedTab);
    }
  }, [requestedTab, requestedTabNonce, topic.id]);

  // Load matching problem starter/draft when topic or practiceMode changes
  useEffect(() => {
    const draftKey = `${topic.id}:${practiceMode}`;
    const exercise = topic.practice[practiceMode];
    const draft = sessionDraftsRef.current[draftKey];
    const nextHtml = draft ? draft.html : exercise.starterHtml;
    const nextJs = draft ? draft.js : exercise.starterJs;
    setHtmlCode(nextHtml);
    setJsCode(nextJs);
    setDomHintLevel(0);
    setEditorTab('js');
    runPreview(nextHtml, nextJs, exercise.starterCss);
  }, [practiceMode, runPreview, topic]);

  // Listen for console output messages from the sandbox iframe
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (
        !data ||
        typeof data !== 'object' ||
        data.source !== 'jslab-sandbox' ||
        data.runId !== activeRunIdRef.current ||
        data.type !== 'console'
      ) {
        return;
      }

      const level = (['log', 'warn', 'error', 'info'].includes(data.level)
        ? data.level
        : 'log') as ConsoleEntry['level'];

      setConsoleLogs((prev) => [
        ...prev.slice(-60),
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          level,
          message: String(data.message ?? ''),
          timestamp: new Date().toLocaleTimeString([], {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        },
      ]);
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const persistSnapshot = useCallback(
    async (overrides?: Partial<TopicProgressRecord>) => {
      await onSaveProgress(topic.id, (prev) => ({
        challengeId: topic.id,
        status: overrides?.status ?? (prev?.status === 'solved' ? 'solved' : 'attempted'),
        savedHtml: overrides?.savedHtml ?? htmlCode,
        savedJs: overrides?.savedJs ?? jsCode,
        studyNote: overrides?.studyNote ?? noteDraft,
        hintsUsed: overrides?.hintsUsed ?? (prev?.hintsUsed ?? 0),
        attempts: overrides?.attempts ?? (prev?.attempts ?? 0),
      }));
    },
    [htmlCode, jsCode, noteDraft, onSaveProgress, topic.id]
  );

  const handleJsChange = (nextVal: string) => {
    setJsCode(nextVal);
    sessionDraftsRef.current[`${topic.id}:${practiceMode}`] = {
      html: htmlCode,
      js: nextVal,
    };
  };

  const handleHtmlChange = (nextVal: string) => {
    setHtmlCode(nextVal);
    sessionDraftsRef.current[`${topic.id}:${practiceMode}`] = {
      html: nextVal,
      js: jsCode,
    };
  };

  const handleRunPractice = async () => {
    runPreview(htmlCode, jsCode, activeExercise.starterCss);
    await persistSnapshot({
      attempts: (savedRecord?.attempts ?? 0) + 1,
    });
    await onRecordPracticeRun(topic.id, practiceMode);
  };

  const handleResetPractice = async () => {
    setHtmlCode(activeExercise.starterHtml);
    setJsCode(activeExercise.starterJs);
    sessionDraftsRef.current[`${topic.id}:${practiceMode}`] = {
      html: activeExercise.starterHtml,
      js: activeExercise.starterJs,
    };
    setDomHintLevel(0);
    runPreview(activeExercise.starterHtml, activeExercise.starterJs, activeExercise.starterCss);
    await persistSnapshot({
      savedHtml: activeExercise.starterHtml,
      savedJs: activeExercise.starterJs,
    });
  };

  const handleRevealNextDomHint = async () => {
    const nextLevel = Math.min(4, domHintLevel + 1);
    setDomHintLevel(nextLevel);
    await persistSnapshot({
      hintsUsed: Math.min(10, Math.max(savedRecord?.hintsUsed ?? 0, nextLevel)),
    });
  };

  const handleLoadSolutionToEditor = () => {
    setJsCode(activeExercise.solutionJs);
    sessionDraftsRef.current[`${topic.id}:${practiceMode}`] = {
      html: htmlCode,
      js: activeExercise.solutionJs,
    };
    setEditorTab('js');
    runPreview(htmlCode, activeExercise.solutionJs, activeExercise.starterCss);
  };

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(topic.codeExample);
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted iframes
    }
  };

  const handleSelectQuizOption = async (qIdx: number, optIdx: number) => {
    const nextAnswers = { ...quizAnswers, [qIdx]: optIdx };
    setQuizAnswers(nextAnswers);

    const correctCount = topic.quiz.reduce((acc, q, idx) => {
      return acc + (nextAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);

    await onRecordQuizPerformance(topic.id, nextAnswers, correctCount, topic.quiz.length);
  };

  const handleSaveNote = async () => {
    await persistSnapshot({ studyNote: noteDraft });
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2000);
  };

  const isTopicMastered = useCallback(
    (topicId: string) =>
      masteryMap[topicId]?.state === 'mastered' || progressMap[topicId]?.status === 'solved',
    [masteryMap, progressMap]
  );

  const isTopicInProgress = useCallback(
    (topicId: string) =>
      masteryMap[topicId]?.state === 'in_progress' || progressMap[topicId]?.status === 'attempted',
    [masteryMap, progressMap]
  );

  const practicedCount = topicMastery?.practicedModes?.length ?? 0;
  const bestQuizPct = topicMastery?.quizState?.bestScorePct ?? 0;
  const masteryStepsCompleted =
    (isMastered ? 2 : (practicedCount >= 1 ? 1 : 0) + (bestQuizPct >= 100 ? 1 : 0));

  const masteredCount = useMemo(
    () => TOPICS.filter((t) => isTopicMastered(t.id)).length,
    [isTopicMastered]
  );

  const filteredByCategory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map = new Map<CategoryId, JsTopic[]>();
    CATEGORIES.forEach((cat) => map.set(cat.id, []));

    TOPICS.forEach((t) => {
      const matchesTier = tierFilter === 'All' || t.tier === tierFilter;
      const matchesTrack =
        trackFilter === 'All' || (t.track ?? 'Essential') === trackFilter;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.categoryTitle.toLowerCase().includes(q) ||
        t.webDevUseCase.toLowerCase().includes(q);
      if (matchesTier && matchesTrack && matchesQuery) {
        map.get(t.categoryId)?.push(t);
      }
    });
    return map;
  }, [searchQuery, tierFilter, trackFilter]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const prevTopic = topicIndex > 0 ? TOPICS[topicIndex - 1] : null;
  const nextTopic = topicIndex < TOPICS.length - 1 ? TOPICS[topicIndex + 1] : null;
  const progressPct = Math.round((masteredCount / TOPICS.length) * 100);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
      {/* Left Categorized Syllabus Sidebar */}
      <aside className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col lg:max-h-[calc(100vh-7rem)] lg:sticky lg:top-6 overflow-hidden">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>JS Syllabus (Basic to Advanced)</span>
            <span className="tabular-nums text-sky-800">
              {masteredCount} / {TOPICS.length} Mastered
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics (e.g. map, promise, DOM)..."
              aria-label="Filter JavaScript topics"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-1" role="group" aria-label="Filter by learning path">
            {(['All', 'Essential', 'Deep-dive'] as TrackFilter[]).map((track) => (
              <button
                key={track}
                type="button"
                onClick={() => setTrackFilter(track)}
                className={`py-1 text-[11px] font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                  trackFilter === track
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {track === 'All' ? 'All Paths' : track}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1" role="group" aria-label="Filter by difficulty tier">
            {(['All', 'Basic', 'Intermediate', 'Advanced'] as TierFilter[]).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setTierFilter(tier)}
                className={`py-1 text-[11px] font-medium rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                  tierFilter === tier
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tier === 'Intermediate' ? 'Interm.' : tier}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px] lg:max-h-none">
          {CATEGORIES.map((category) => {
            const list = filteredByCategory.get(category.id) ?? [];
            if (list.length === 0) return null;
            const isOpen = searchQuery.trim().length > 0 || expandedCategories[category.id];
            const catMastered = list.filter((t) => isTopicMastered(t.id)).length;

            return (
              <div key={category.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-800 truncate">
                      {category.title}
                    </div>
                    <div className="text-[10px] text-slate-500 tabular-nums">
                      {category.tierRange} · {catMastered}/{list.length} mastered
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="divide-y divide-slate-100">
                    {list.map((item) => {
                      const solved = isTopicMastered(item.id);
                      const attempted = !solved && isTopicInProgress(item.id);
                      const isActive = item.id === topic.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelectTopic(item.id)}
                          className={`w-full px-3.5 py-2.5 flex items-start gap-2.5 text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-sky-50 text-slate-900'
                              : 'bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {solved ? (
                              <CheckCircle2 size={15} className="text-emerald-600" />
                            ) : attempted ? (
                              <CircleDot size={15} className="text-sky-600" />
                            ) : (
                              <Circle size={15} className="text-slate-300" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div
                              className={`text-xs leading-snug ${
                                isActive ? 'font-semibold text-sky-950' : 'font-medium'
                              }`}
                            >
                              <span className="tabular-nums text-slate-400 mr-1.5">
                                {String(item.number).padStart(2, '0')}.
                              </span>
                              {item.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {item.tier} ·{' '}
                              <span
                                className={
                                  item.track === 'Deep-dive' ? 'text-amber-700' : 'text-sky-800'
                                }
                              >
                                {item.track ?? 'Essential'}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Study, Practice & Revision Area */}
      <main className="flex-1 min-w-0 space-y-5">
        {/* Topic Classification & Overview Card */}
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="text-xs font-semibold text-sky-800 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="tabular-nums">
                  Topic {String(topic.number).padStart(2, '0')} of {TOPICS.length}
                </span>
                <span className="text-slate-300">·</span>
                <span>{topic.categoryTitle}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-700">{topic.tier} Level</span>
                <span className="text-slate-300">·</span>
                <span
                  className={
                    topic.track === 'Deep-dive' ? 'text-amber-800' : 'text-emerald-800'
                  }
                >
                  {topic.track ?? 'Essential'}
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {topic.title}
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Web Dev Use Case: <span className="text-slate-800">{topic.webDevUseCase}</span>
                <span className="text-slate-300 mx-2">·</span>
                <span className="tabular-nums text-slate-600">
                  Topic Bank: {topicTotalQuestions} Qs (Section Total: {sectionBankSummary.totalQuestions} Qs)
                </span>
              </p>

              {topic.prerequisites && topic.prerequisites.length > 0 && (
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
                  <span className="font-semibold text-slate-700">Prerequisites:</span>
                  {topic.prerequisites.map((pid, idx) => {
                    const prereqTopic = TOPICS_BY_ID[pid];
                    if (!prereqTopic) return null;
                    const met = isTopicMastered(pid);
                    return (
                      <span key={pid} className="inline-flex items-center gap-1">
                        {idx > 0 && <span className="text-slate-300 mr-1">·</span>}
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTopic(prereqTopic.id);
                            setStudyTab('learn');
                          }}
                          className={`hover:underline cursor-pointer font-medium ${
                            met ? 'text-emerald-700' : 'text-sky-800'
                          }`}
                        >
                          #{String(prereqTopic.number).padStart(2, '0')} {prereqTopic.title}
                          {met ? ' ✓' : ''}
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <p className="text-sm text-slate-700 leading-relaxed pt-1">{topic.summary}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {prevTopic && (
                <button
                  type="button"
                  onClick={() => onSelectTopic(prevTopic.id)}
                  title={`Previous: ${prevTopic.title}`}
                  className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Prev
                </button>
              )}
              {nextTopic && (
                <button
                  type="button"
                  onClick={() => onSelectTopic(nextTopic.id)}
                  title={`Next: ${nextTopic.title}`}
                  className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              )}
              {isMastered ? (
                <div className="px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                  <CheckCircle2 size={14} />
                  Mastered
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setStudyTab(practicedCount < 1 ? 'practice' : 'revise')}
                  title="Earn mastery by running Practice and passing the Recall Quiz"
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 bg-sky-700 hover:bg-sky-800 text-white whitespace-nowrap cursor-pointer tabular-nums"
                >
                  <CircleDot size={14} />
                  Mastery {masteryStepsCompleted}/2
                </button>
              )}
            </div>
          </div>

          {/* Quick Revision TL;DR */}
          <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2.5">
            <Lightbulb size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-bold mr-1.5">Revision TL;DR:</span>
              {topic.revisionTldr}
            </div>
          </div>

          {/* Study Flow Switcher */}
          <div
            className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Topic study mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={studyTab === 'learn'}
              onClick={() => setStudyTab('learn')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                studyTab === 'learn'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={14} />
              1. Explanation & Code
            </button>
            {hasVisualizer && (
              <button
                type="button"
                role="tab"
                aria-selected={studyTab === 'visualize'}
                onClick={() => setStudyTab('visualize')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                  studyTab === 'visualize'
                    ? 'bg-slate-900 text-white'
                    : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200'
                }`}
              >
                <Workflow size={14} />
                2. Visualize
              </button>
            )}
            <button
              type="button"
              role="tab"
              aria-selected={studyTab === 'practice'}
              onClick={() => setStudyTab('practice')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                studyTab === 'practice'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Code2 size={14} />
              {hasVisualizer ? '3.' : '2.'} Interactive Practice
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={studyTab === 'revise'}
              onClick={() => setStudyTab('revise')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                studyTab === 'revise'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <HelpCircle size={14} />
              {hasVisualizer ? '4.' : '3.'} Recall Quiz & Revision Note
            </button>
          </div>
        </section>

        {/* STEP 1: DEEP EXPLANATION & EXAMPLES */}
        {studyTab === 'learn' && (
          <div className="space-y-5">
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
              {topic.learningObjectives && topic.learningObjectives.length > 0 && (
                <div className="pb-4 border-b border-slate-200">
                  <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    Learning Objectives
                  </h2>
                  <ul className="space-y-1.5">
                    {topic.learningObjectives.map((obj, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed"
                      >
                        <Check size={15} className="text-sky-700 shrink-0 mt-1" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 mb-3">
                  Concept Explanation
                </h2>
                <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  {topic.explanation.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>

              {topic.realWorldAnalogy && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="text-xs font-bold text-slate-800">Real-World Analogy</div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {topic.realWorldAnalogy}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-2.5">
                  Key Rules to Remember
                </h3>
                <ul className="space-y-2">
                  {topic.keyRules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="font-mono text-xs font-bold text-sky-700 mt-0.5 tabular-nums">
                        0{idx + 1}.
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {topic.goDeeper && topic.goDeeper.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-2.5">
                  {topic.goDeeper.map((block, bIdx) => {
                    const isExpanded = Boolean(openDeeperBlocks[bIdx]);
                    return (
                      <div
                        key={bIdx}
                        className="border border-slate-200 rounded-lg bg-slate-50/70 overflow-hidden"
                      >
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() =>
                            setOpenDeeperBlocks((prev) => ({ ...prev, [bIdx]: !prev[bIdx] }))
                          }
                          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-100/80 transition-colors cursor-pointer"
                        >
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-sky-800 mr-2">
                              Go deeper
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {block.title}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown size={15} className="text-slate-500 shrink-0" />
                          ) : (
                            <ChevronRight size={15} className="text-slate-500 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-200 bg-white">
                            {block.paragraphs.map((p, pIdx) => (
                              <p
                                key={pIdx}
                                className="text-xs sm:text-sm text-slate-700 leading-relaxed"
                              >
                                {p}
                              </p>
                            ))}
                            {block.codeExample && (
                              <pre className="p-3.5 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed">
                                <code>{block.codeExample}</code>
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Annotated Code Example */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Annotated Code Example
                </span>
                <button
                  type="button"
                  onClick={handleCopyExample}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedExample ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copiedExample ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-5 bg-slate-950 text-slate-100 font-mono text-[13px] leading-relaxed overflow-x-auto">
                <code>{topic.codeExample}</code>
              </pre>
            </section>

            {/* Common Mistake Comparison */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Common Mistake vs Clean Pattern
              </h3>
              <p className="text-xs text-slate-500 mb-4">{topic.commonMistake.label}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-rose-200 bg-rose-50/40 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 bg-rose-100/70 border-b border-rose-200 text-xs font-bold text-rose-900">
                    Avoid This Pattern
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed">
                    <code>{topic.commonMistake.avoid}</code>
                  </pre>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 bg-emerald-100/70 border-b border-emerald-200 text-xs font-bold text-emerald-900">
                    Prefer This Pattern
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed">
                    <code>{topic.commonMistake.prefer}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
                {hasVisualizer && (
                  <button
                    type="button"
                    onClick={() => setStudyTab('visualize')}
                    className="px-4 py-2 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Workflow size={14} />
                    Dry-Run Visualizer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStudyTab('practice')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  Open Interactive Practice
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* VISUALIZE: INTERACTIVE DRY-RUN EXECUTION */}
        {studyTab === 'visualize' && hasVisualizer && (
          <DryRunVisualizer
            scenarios={topicVisualizers}
            onContinueToPractice={() => setStudyTab('practice')}
          />
        )}

        {/* STEP 2: INTERACTIVE PRACTICE SANDBOX + CODING PLAYGROUND + DEBUG + OUTPUT DRILLS */}
        {studyTab === 'practice' && (
          <div className="space-y-4">
            {/* Practice Sub-Mode Switcher */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Practice workbench mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceWorkspaceMode === 'dom'}
                  onClick={() => setPracticeWorkspaceMode('dom')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    practiceWorkspaceMode === 'dom'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  DOM Sandbox (2)
                </button>
                {topicCodingChallenges.length > 0 && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={practiceWorkspaceMode === 'coding'}
                    onClick={() => setPracticeWorkspaceMode('coding')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      practiceWorkspaceMode === 'coding'
                        ? 'bg-slate-900 text-white'
                        : 'bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-200'
                    }`}
                  >
                    Coding Lab &amp; Tests ({topicCodingChallenges.length})
                  </button>
                )}
                {topicDebugChallenges.length > 0 && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={practiceWorkspaceMode === 'debug'}
                    onClick={() => setPracticeWorkspaceMode('debug')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      practiceWorkspaceMode === 'debug'
                        ? 'bg-slate-900 text-white'
                        : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    Find the Bug! ({topicDebugChallenges.length})
                  </button>
                )}
                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceWorkspaceMode === 'drills'}
                  onClick={() => setPracticeWorkspaceMode('drills')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    practiceWorkspaceMode === 'drills'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Output &amp; Quick Drills (
                  {
                    topicRichQuestions.filter(
                      (q) =>
                        q.category === 'Output-based' ||
                        q.category === 'Logical' ||
                        q.category === 'Debugging'
                    ).length
                  }
                  )
                </button>
              </div>
              <div className="text-[11px] font-medium text-slate-500 tabular-nums">
                {topicAllExecutable.length > 0
                  ? `${(topicMastery?.solvedPracticeIds.length ?? 0) + (topicMastery?.solvedDebugIds.length ?? 0)}/${topicAllExecutable.length} automated coding tests passed`
                  : `${topicTotalQuestions} total questions in this topic`}
              </div>
            </div>

            {practiceWorkspaceMode === 'coding' && topicCodingChallenges.length > 0 && (
              <CodingPlaygroundPanel
                challenges={topicCodingChallenges}
                solvedIds={topicMastery?.solvedPracticeIds ?? []}
                onChallengeCompleted={(challengeId, kind, passed, hintsUsed) =>
                  onRecordCodingResult(topic.id, challengeId, kind, passed, hintsUsed)
                }
              />
            )}

            {practiceWorkspaceMode === 'debug' && topicDebugChallenges.length > 0 && (
              <CodingPlaygroundPanel
                challenges={topicDebugChallenges}
                solvedIds={topicMastery?.solvedDebugIds ?? []}
                onChallengeCompleted={(challengeId, kind, passed, hintsUsed) =>
                  onRecordCodingResult(topic.id, challengeId, kind, passed, hintsUsed)
                }
              />
            )}

            {practiceWorkspaceMode === 'drills' && (
              <div className="space-y-3">
                {topicRichQuestions
                  .filter(
                    (q) =>
                      q.category === 'Output-based' ||
                      q.category === 'Logical' ||
                      q.category === 'Debugging'
                  )
                  .slice(0, 10)
                  .map((q, idx) => (
                    <RichQuestionCard
                      key={q.id}
                      question={q}
                      indexLabel={`Drill #${idx + 1}`}
                      selectedIndex={richQuizSelections[q.id]}
                      onSelectOption={(optIdx) => {
                        setRichQuizSelections((prev) => ({ ...prev, [q.id]: optIdx }));
                        void onRecordRichQuizAnswer(
                          topic.id,
                          q.id,
                          q.category,
                          optIdx === q.correctIndex
                        );
                      }}
                    />
                  ))}
              </div>
            )}

            {practiceWorkspaceMode === 'dom' && (
              <>
            {/* Dual Practice Switcher: Logical (Exam) + Daily Life (Workspace) */}
            <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                role="tablist"
                aria-label="Practice problem type"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceMode === 'logical'}
                  onClick={() => setPracticeMode('logical')}
                  className={`px-4 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    practiceMode === 'logical'
                      ? 'bg-sky-50 border-sky-600 text-sky-950'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                    Problem 1 · Logical / Exam Point of View
                  </div>
                  <div className="text-xs font-semibold mt-0.5 truncate">
                    {topic.practice.logical.title}
                  </div>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceMode === 'realLife'}
                  onClick={() => setPracticeMode('realLife')}
                  className={`px-4 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    practiceMode === 'realLife'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                    Problem 2 · Daily Life / Workspace Scenario
                  </div>
                  <div className="text-xs font-semibold mt-0.5 truncate">
                    {topic.practice.realLife.title}
                  </div>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="text-xs font-semibold text-slate-500">
                    {practiceMode === 'logical'
                      ? 'Exam & Technical Logic Challenge'
                      : 'Real-World Workspace Problem'}{' '}
                    · <span className="text-slate-800">{activeExercise.scenario}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{activeExercise.title}</h2>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {activeExercise.taskPrompt}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {domHintLevel < 4 ? (
                    <button
                      type="button"
                      onClick={handleRevealNextDomHint}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      <Lightbulb size={14} />
                      {domHintLevel === 0
                        ? 'Hint 1 / 4 (Concept)'
                        : domHintLevel === 1
                          ? 'Hint 2 / 4 (Approach)'
                          : domHintLevel === 2
                            ? 'Hint 3 / 4 (Pitfall)'
                            : 'Reveal Solution (4 / 4)'}
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                      All 4 hints unlocked
                    </span>
                  )}
                  {domHintLevel > 0 && (
                    <button
                      type="button"
                      onClick={() => setDomHintLevel(0)}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg whitespace-nowrap cursor-pointer"
                    >
                      Hide
                    </button>
                  )}
                </div>
              </div>
            </section>

            {domHintLevel > 0 && (
              <section className="bg-amber-50/40 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                    <Lightbulb size={14} />
                    Progressive Hint Ladder ({domHintLevel}/4 unlocked)
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Step through hints before unlocking the full reference code.
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-800">
                  {domHintLevel >= 1 && (
                    <div className="bg-white border border-amber-200 rounded-lg p-3">
                      <span className="font-bold text-amber-900">Level 1 · Conceptual Direction: </span>
                      <span>{topic.revisionTldr}</span>
                    </div>
                  )}

                  {domHintLevel >= 2 && (
                    <div className="bg-white border border-amber-200 rounded-lg p-3 space-y-1">
                      <div className="font-bold text-amber-900">Level 2 · Logical Strategy:</div>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                        {topic.keyRules.slice(0, 2).map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {domHintLevel >= 3 && (
                    <div className="bg-white border border-amber-200 rounded-lg p-3 space-y-2">
                      <div className="font-bold text-amber-900">
                        Level 3 · Pitfall Check ({topic.commonMistake.label}):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <div className="text-[11px] font-semibold text-rose-700 mb-1">Avoid</div>
                          <pre className="p-2.5 bg-slate-900 text-rose-300 rounded font-mono text-[11px] overflow-x-auto">
                            <code>{topic.commonMistake.avoid}</code>
                          </pre>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-700 mb-1">Prefer</div>
                          <pre className="p-2.5 bg-slate-900 text-emerald-300 rounded font-mono text-[11px] overflow-x-auto">
                            <code>{topic.commonMistake.prefer}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}

                  {domHintLevel >= 4 && (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-emerald-400">
                          Level 4 · Reference JavaScript Solution (
                          {practiceMode === 'logical' ? 'Logical / Exam' : 'Daily Life / Workspace'})
                        </span>
                        <button
                          type="button"
                          onClick={handleLoadSolutionToEditor}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded cursor-pointer"
                        >
                          Load into Editor & Run
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
                        <code>{activeExercise.solutionJs}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Code Editor Panel */}
              <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[420px]">
                <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditorTab('js')}
                      className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                        editorTab === 'js'
                          ? 'bg-slate-800 text-sky-300 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      script.js
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('html')}
                      className={`px-3 py-1 text-xs font-mono rounded cursor-pointer ${
                        editorTab === 'html'
                          ? 'bg-slate-800 text-sky-300 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      index.html
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetPractice}
                      className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleRunPractice}
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play size={12} />
                      Run Code
                    </button>
                  </div>
                </div>

                {editorTab === 'js' ? (
                  <CodeEditor
                    value={jsCode}
                    onChange={handleJsChange}
                    onRunShortcut={handleRunPractice}
                    ariaLabel="Practice JavaScript code editor"
                  />
                ) : (
                  <CodeEditor
                    value={htmlCode}
                    onChange={handleHtmlChange}
                    onRunShortcut={handleRunPractice}
                    ariaLabel="Practice HTML code editor"
                  />
                )}
              </section>

              {/* Live Preview + Console Panel */}
              <section className="flex flex-col gap-4 min-h-[420px]">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Live Browser Output
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Run #{runCounter}
                    </span>
                  </div>
                  <iframe
                    key={activeRunIdRef.current || topic.id}
                    title={`Preview for ${topic.title}`}
                    srcDoc={srcDoc}
                    sandbox="allow-scripts allow-modals"
                    className="w-full flex-1 min-h-[220px] bg-slate-50 border-0"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-44">
                  <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Terminal size={13} />
                      Console Output
                    </span>
                    <button
                      type="button"
                      onClick={() => setConsoleLogs([])}
                      className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
                    {consoleLogs.length === 0 ? (
                      <div className="text-slate-500">
                        Interact with the preview or add console.log() statements and click Run Code.
                      </div>
                    ) : (
                      consoleLogs.map((entry) => (
                        <div
                          key={entry.id}
                          className={`flex items-start gap-2 ${
                            entry.level === 'error'
                              ? 'text-rose-400'
                              : entry.level === 'warn'
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }`}
                        >
                          <span className="text-slate-500 shrink-0">[{entry.timestamp}]</span>
                          <span className="break-words whitespace-pre-wrap">{entry.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStudyTab('revise')}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                Continue to Quiz &amp; Revision Note
                <ArrowRight size={14} />
              </button>
            </div>
              </>
            )}
          </div>
        )}

        {/* STEP 3: ACTIVE RECALL QUIZ & REVISION NOTE */}
        {studyTab === 'revise' && (
          <div className="space-y-5">
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Active Recall Check
                  </h2>
                  <p className="text-xs text-slate-500">
                    Test your understanding before moving to the next concept.
                  </p>
                </div>
                {Object.keys(quizAnswers).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuizAnswers({})}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer"
                  >
                    Reset Quiz
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {topic.quiz.map((q, qIdx) => {
                  const chosen = quizAnswers[qIdx];
                  const answered = chosen !== undefined;
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {qIdx + 1}. {q.question}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosen === optIdx;
                          const isRightOpt = optIdx === q.correctIndex;
                          let style =
                            'bg-white border-slate-200 text-slate-800 hover:border-sky-400';
                          if (answered) {
                            if (isRightOpt) {
                              style = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold';
                            } else if (isSelected) {
                              style = 'bg-rose-50 border-rose-400 text-rose-950';
                            } else {
                              style = 'bg-white border-slate-200 text-slate-500';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              className={`w-full text-left px-3.5 py-2.5 text-xs border rounded-lg transition-colors cursor-pointer ${style}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <div
                          className={`text-xs p-3 rounded-md border leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-amber-50/70 border-amber-200 text-amber-950'
                          }`}
                        >
                          <span className="font-bold mr-1">
                            {isCorrect ? 'Correct:' : 'Review:'}
                          </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Expanded Weighted Topic Question Bank (Part of 100-130 Section Total) */}
            {(() => {
              const filteredRich =
                richCategoryFilter === 'All'
                  ? topicRichQuestions
                  : topicRichQuestions.filter((q) => q.category === richCategoryFilter);
              const pageSize = 6;
              const totalPages = Math.max(1, Math.ceil(filteredRich.length / pageSize));
              const safePage = Math.min(richPage, totalPages);
              const pageItems = filteredRich.slice((safePage - 1) * pageSize, safePage * pageSize);
              const answeredEntries = Object.entries(topicMastery?.richQuizAnswered ?? {});
              const correctRichCount = answeredEntries.filter(([, ok]) => ok).length;

              return (
                <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        Topic Practice &amp; Recall Bank ({topicRichQuestions.length} Questions)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        Section Total: {sectionBankSummary.totalQuestions} questions across{' '}
                        {Object.keys(sectionBankSummary.perTopicTotals).length} subtopics ·
                        Weighted by importance · Every question explains why each wrong option fails.
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-700 tabular-nums">
                      Answered: {answeredEntries.length}/{topicRichQuestions.length} ({correctRichCount} correct)
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        'All',
                        'Output-based',
                        'Conceptual',
                        'Logical',
                        'Practical',
                        'Debugging',
                        'Scenario',
                      ] as Array<'All' | QuestionCategory>
                    ).map((cat) => {
                      const count =
                        cat === 'All'
                          ? topicRichQuestions.length
                          : topicRichQuestions.filter((q) => q.category === cat).length;
                      if (cat !== 'All' && count === 0) return null;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setRichCategoryFilter(cat);
                            setRichPage(1);
                          }}
                          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer tabular-nums ${
                            richCategoryFilter === cat
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    {pageItems.map((q, idx) => (
                      <RichQuestionCard
                        key={q.id}
                        question={q}
                        indexLabel={`Q${(safePage - 1) * pageSize + idx + 1}`}
                        selectedIndex={richQuizSelections[q.id]}
                        onSelectOption={(optIdx) => {
                          setRichQuizSelections((prev) => ({ ...prev, [q.id]: optIdx }));
                          void onRecordRichQuizAnswer(
                            topic.id,
                            q.id,
                            q.category,
                            optIdx === q.correctIndex
                          );
                        }}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 tabular-nums">
                        Page {safePage} of {totalPages} ({filteredRich.length} questions)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={safePage <= 1}
                          onClick={() => setRichPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={safePage >= totalPages}
                          onClick={() => setRichPage((p) => Math.min(totalPages, p + 1))}
                          className="px-3 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              );
            })()}

            {/* Personal Revision Note */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Your Personal Revision Note
                  </h3>
                  <p className="text-xs text-slate-500">
                    Write a quick reminder in your own words—it will appear in Quick Revise too.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={13} />
                  {noteSavedToast ? 'Saved!' : 'Save Note'}
                </button>
              </div>

              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Summarize the key takeaway or a gotcha you want to remember for interviews..."
                aria-label="Personal revision note"
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
              />

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {isMastered ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span className="text-emerald-800">Topic Mastered</span>
                      </>
                    ) : (
                      <>
                        <CircleDot size={15} className="text-sky-700" />
                        <span>Mastery Requirements ({masteryStepsCompleted}/2 earned)</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={practicedCount >= 1 || isMastered ? 'text-emerald-700 font-medium' : ''}>
                      {practicedCount >= 1 || isMastered ? '✓' : '○'} Run Interactive Practice
                    </span>
                    <span className={bestQuizPct >= 100 || isMastered ? 'text-emerald-700 font-medium' : ''}>
                      {bestQuizPct >= 100 || isMastered ? '✓' : '○'} Pass Recall Quiz (100%)
                    </span>
                  </div>
                </div>

                {nextTopic && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTopic(nextTopic.id);
                      setStudyTab('learn');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    Next Topic: {String(nextTopic.number).padStart(2, '0')}. {nextTopic.title}
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
