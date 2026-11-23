import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  CircleDot,
  Code2,
  Copy,
  Eye,
  EyeOff,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Save,
  Server,
  Terminal,
} from 'lucide-react';
import { AI_LESSONS, AI_STAGES } from '../data/aiTopicsIndex';
import { buildPlaygroundSrcDoc } from '../lib/sandboxBuilder';
import type { AiLesson } from '../types/aiTutorial';
import type { ConsoleEntry, TopicProgressRecord } from '../types/topic';
import { CodeEditor } from './CodeEditor';

interface AiTutorialViewProps {
  progressMap: Record<string, TopicProgressRecord>;
  onSaveProgress: (
    challengeId: string,
    updater: (prev: TopicProgressRecord | undefined) => TopicProgressRecord
  ) => Promise<void>;
}

type LessonTab = 'learn' | 'practice' | 'revise';
type EditorFileTab = 'js' | 'html';

export function AiTutorialView({ progressMap, onSaveProgress }: AiTutorialViewProps) {
  const [activeLessonId, setActiveLessonId] = useState<string>(AI_LESSONS[0].id);

  const lessonIndex = useMemo(() => {
    const idx = AI_LESSONS.findIndex((l) => l.id === activeLessonId);
    return idx >= 0 ? idx : 0;
  }, [activeLessonId]);

  const lesson: AiLesson = AI_LESSONS[lessonIndex];
  const savedRecord = progressMap[lesson.id];
  const isMastered = savedRecord?.status === 'solved';

  const [lessonTab, setLessonTab] = useState<LessonTab>('learn');
  const [editorTab, setEditorTab] = useState<EditorFileTab>('js');
  const [htmlCode, setHtmlCode] = useState(
    () => savedRecord?.savedHtml || lesson.practice.starterHtml
  );
  const [jsCode, setJsCode] = useState(
    () => savedRecord?.savedJs || lesson.practice.starterJs
  );
  const [showSolution, setShowSolution] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<'backend' | 'frontend' | null>(null);

  const [srcDoc, setSrcDoc] = useState('');
  const [runCounter, setRunCounter] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const activeRunIdRef = useRef<string>('');

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [noteDraft, setNoteDraft] = useState(() => savedRecord?.studyNote ?? '');
  const [noteSavedToast, setNoteSavedToast] = useState(false);

  const runPreview = useCallback(
    (nextHtml: string, nextJs: string) => {
      const nextRunId = `${lesson.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      activeRunIdRef.current = nextRunId;
      setConsoleLogs([]);
      setRunCounter((c) => c + 1);
      setSrcDoc(
        buildPlaygroundSrcDoc({
          runId: nextRunId,
          html: nextHtml,
          css: lesson.practice.starterCss,
          js: nextJs,
        })
      );
    },
    [lesson.id, lesson.practice.starterCss]
  );

  useEffect(() => {
    const rec = progressMap[lesson.id];
    const initialHtml = rec?.savedHtml || lesson.practice.starterHtml;
    const initialJs = rec?.savedJs || lesson.practice.starterJs;
    setHtmlCode(initialHtml);
    setJsCode(initialJs);
    setNoteDraft(rec?.studyNote ?? '');
    setNoteSavedToast(false);
    setShowSolution(false);
    setCopiedTarget(null);
    setQuizAnswers({});
    setEditorTab('js');
    runPreview(initialHtml, initialJs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

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
      await onSaveProgress(lesson.id, (prev) => ({
        challengeId: lesson.id,
        status: overrides?.status ?? (prev?.status === 'solved' ? 'solved' : 'attempted'),
        savedHtml: overrides?.savedHtml ?? htmlCode,
        savedJs: overrides?.savedJs ?? jsCode,
        studyNote: overrides?.studyNote ?? noteDraft,
        hintsUsed: overrides?.hintsUsed ?? (prev?.hintsUsed ?? 0),
        attempts: overrides?.attempts ?? (prev?.attempts ?? 0),
      }));
    },
    [htmlCode, jsCode, lesson.id, noteDraft, onSaveProgress]
  );

  const handleRunPractice = async () => {
    runPreview(htmlCode, jsCode);
    await persistSnapshot({
      attempts: (savedRecord?.attempts ?? 0) + 1,
    });
  };

  const handleResetPractice = async () => {
    setHtmlCode(lesson.practice.starterHtml);
    setJsCode(lesson.practice.starterJs);
    setShowSolution(false);
    runPreview(lesson.practice.starterHtml, lesson.practice.starterJs);
    await persistSnapshot({
      savedHtml: lesson.practice.starterHtml,
      savedJs: lesson.practice.starterJs,
    });
  };

  const handleToggleSolution = async () => {
    const next = !showSolution;
    setShowSolution(next);
    if (next && (savedRecord?.hintsUsed ?? 0) < 1) {
      await persistSnapshot({
        hintsUsed: Math.max(savedRecord?.hintsUsed ?? 0, 1),
      });
    }
  };

  const handleLoadSolutionToEditor = () => {
    setJsCode(lesson.practice.solutionJs);
    setEditorTab('js');
    runPreview(htmlCode, lesson.practice.solutionJs);
  };

  const handleCopyCode = async (target: 'backend' | 'frontend', code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedTarget(target);
      setTimeout(() => setCopiedTarget(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleMarkMastered = async () => {
    await persistSnapshot({ status: 'solved' });
  };

  const handleSaveNote = async () => {
    await persistSnapshot({ studyNote: noteDraft });
    setNoteSavedToast(true);
    setTimeout(() => setNoteSavedToast(false), 2000);
  };

  const masteredCount = useMemo(
    () => AI_LESSONS.filter((l) => progressMap[l.id]?.status === 'solved').length,
    [progressMap]
  );

  const prevLesson = lessonIndex > 0 ? AI_LESSONS[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < AI_LESSONS.length - 1 ? AI_LESSONS[lessonIndex + 1] : null;
  const progressPct = Math.round((masteredCount / AI_LESSONS.length) * 100);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
      {/* Left 3-Stage AI Curriculum Sidebar */}
      <aside className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col lg:max-h-[calc(100vh-7rem)] lg:sticky lg:top-6 overflow-hidden">
        <div className="p-4 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span>AI + Full-Stack Track</span>
            <span className="tabular-nums text-sky-800">
              {masteredCount} / {AI_LESSONS.length} Mastered
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Step-by-step guide to connecting AI models safely into Full-Stack JavaScript web apps.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px] lg:max-h-none">
          {AI_STAGES.map((stage) => {
            const stageLessons = AI_LESSONS.filter((l) => l.stageId === stage.id);
            const stageMastered = stageLessons.filter(
              (l) => progressMap[l.id]?.status === 'solved'
            ).length;

            return (
              <div key={stage.id}>
                <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100">
                  <div className="text-[11px] font-bold text-slate-800">{stage.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {stage.subtitle} · {stageMastered}/{stageLessons.length} mastered
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {stageLessons.map((item) => {
                    const rec = progressMap[item.id];
                    const solved = rec?.status === 'solved';
                    const attempted = rec?.status === 'attempted';
                    const isActive = item.id === lesson.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveLessonId(item.id)}
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
                            {item.levelLabel}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Lesson Content */}
      <main className="flex-1 min-w-0 space-y-5">
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="text-xs font-semibold text-sky-800 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>
                  AI Module {String(lesson.number).padStart(2, '0')} of {AI_LESSONS.length}
                </span>
                <span className="text-slate-300">·</span>
                <span>{lesson.stageTitle}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-700">{lesson.levelLabel}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {lesson.title}
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Full-Stack Job Role Focus:{' '}
                <span className="text-slate-800">{lesson.jobRoleFocus}</span>
              </p>

              <p className="text-sm text-slate-700 leading-relaxed pt-1">{lesson.summary}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {prevLesson && (
                <button
                  type="button"
                  onClick={() => setActiveLessonId(prevLesson.id)}
                  className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Prev
                </button>
              )}
              {nextLesson && (
                <button
                  type="button"
                  onClick={() => setActiveLessonId(nextLesson.id)}
                  className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={handleMarkMastered}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isMastered
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-sky-700 hover:bg-sky-800 text-white'
                }`}
              >
                <CheckCircle2 size={14} />
                {isMastered ? 'Mastered' : 'Mark Mastered'}
              </button>
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2.5">
            <Lightbulb size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-bold mr-1.5">Key Teacher Takeaway:</span>
              {lesson.keyTakeaway}
            </div>
          </div>

          <div
            className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="AI tutorial lesson sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={lessonTab === 'learn'}
              onClick={() => setLessonTab('learn')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                lessonTab === 'learn'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen size={14} />
              1. Plain-English Guide & Architecture
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={lessonTab === 'practice'}
              onClick={() => setLessonTab('practice')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                lessonTab === 'practice'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Code2 size={14} />
              2. Hands-On Simulation Lab
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={lessonTab === 'revise'}
              onClick={() => setLessonTab('revise')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                lessonTab === 'revise'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <HelpCircle size={14} />
              3. Check Quiz & Study Note
            </button>
          </div>
        </section>

        {/* STEP 1: BEGINNER EXPLANATION + ARCHITECTURE + FULL-STACK BLUEPRINTS */}
        {lessonTab === 'learn' && (
          <div className="space-y-5">
            {/* Step-by-Step Request Flow */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">
                <Layers size={16} className="text-sky-700" />
                How Data Flows in Full-Stack Web Development
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {lesson.architectureSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1"
                  >
                    <div className="text-xs font-bold text-sky-800">{step.actor}</div>
                    <p className="text-xs text-slate-700 leading-relaxed">{step.action}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Plain-English Teacher Explanation */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Teacher Explanation (Step-by-Step)
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                {lesson.explanation.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>

            {/* Dual Full-Stack Code Blueprints (Backend + Frontend) */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5 truncate">
                    <Server size={13} />
                    {lesson.codeBlueprint.backendLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCode('backend', lesson.codeBlueprint.backendCode)
                    }
                    className="px-2 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 rounded flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedTarget === 'backend' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedTarget === 'backend' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed flex-1">
                  <code>{lesson.codeBlueprint.backendCode}</code>
                </pre>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 truncate">
                    <Code2 size={13} />
                    {lesson.codeBlueprint.frontendLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCode('frontend', lesson.codeBlueprint.frontendCode)
                    }
                    className="px-2 py-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 rounded flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedTarget === 'frontend' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                    {copiedTarget === 'frontend' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed flex-1">
                  <code>{lesson.codeBlueprint.frontendCode}</code>
                </pre>
              </div>
            </section>

            {/* Common Beginner Pitfall */}
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Common Beginner Mistake vs Production Pattern
              </h3>
              <p className="text-xs text-slate-500 mb-4">{lesson.commonMistake.label}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-rose-200 bg-rose-50/40 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 bg-rose-100/70 border-b border-rose-200 text-xs font-bold text-rose-900">
                    Avoid This Pattern
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed">
                    <code>{lesson.commonMistake.avoid}</code>
                  </pre>
                </div>

                <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 bg-emerald-100/70 border-b border-emerald-200 text-xs font-bold text-emerald-900">
                    Prefer This Pattern
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-slate-800 overflow-x-auto leading-relaxed">
                    <code>{lesson.commonMistake.prefer}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setLessonTab('practice')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  Open Hands-On Simulation Lab
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* STEP 2: INTERACTIVE SIMULATION LAB */}
        {lessonTab === 'practice' && (
          <div className="space-y-4">
            <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-sky-800">
                  Interactive Full-Stack AI Lab (Runs Safely in Browser)
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  {lesson.practice.taskPrompt}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleSolution}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {showSolution ? <EyeOff size={14} /> : <Eye size={14} />}
                {showSolution ? 'Hide Reference Solution' : 'View Reference Solution'}
              </button>
            </section>

            {showSolution && (
              <section className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-emerald-400">
                    Reference JavaScript Solution
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
                  <code>{lesson.practice.solutionJs}</code>
                </pre>
              </section>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
                    onChange={setJsCode}
                    onRunShortcut={handleRunPractice}
                    ariaLabel="AI lab JavaScript editor"
                  />
                ) : (
                  <CodeEditor
                    value={htmlCode}
                    onChange={setHtmlCode}
                    onRunShortcut={handleRunPractice}
                    ariaLabel="AI lab HTML editor"
                  />
                )}
              </section>

              <section className="flex flex-col gap-4 min-h-[420px]">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col">
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">
                      Live Simulation Preview
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Run #{runCounter}
                    </span>
                  </div>
                  <iframe
                    key={activeRunIdRef.current || lesson.id}
                    title={`Simulation for ${lesson.title}`}
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
                        Click buttons inside the simulation or add console.log() and press Run Code.
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
                onClick={() => setLessonTab('revise')}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                Continue to Quiz & Study Note
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: QUIZ & NOTE */}
        {lessonTab === 'revise' && (
          <div className="space-y-5">
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Concept Check Quiz
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verify your grasp of full-stack AI concepts before moving on.
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
                {lesson.quiz.map((q, qIdx) => {
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
                              style =
                                'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold';
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
                              onClick={() =>
                                setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                              }
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

            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Personal AI Study Note</h3>
                  <p className="text-xs text-slate-500">
                    Jot down how you would apply this pattern in your next MERN/Full-Stack project.
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
                placeholder="Write a takeaway or architecture reminder..."
                aria-label="Personal AI tutorial note"
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
              />

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer ${
                    isMastered
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  {isMastered ? 'Module Mastered' : 'Mark Module Mastered'}
                </button>

                {nextLesson && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLessonId(nextLesson.id);
                      setLessonTab('learn');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    Next Module: {String(nextLesson.number).padStart(2, '0')}. {nextLesson.title}
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
