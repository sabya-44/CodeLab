import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Code2,
  Eye,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  ShieldAlert,
  Terminal,
  XCircle,
} from 'lucide-react';
import { runSandboxedTests } from '../lib/workerTestRunner';
import type { CodingChallengeItem, PlaygroundRunResult } from '../types/practiceBank';
import { CodeEditor } from './CodeEditor';

interface CodingPlaygroundPanelProps {
  challenges: CodingChallengeItem[];
  solvedIds: string[];
  onChallengeCompleted: (
    challengeId: string,
    kind: 'logical' | 'realLife' | 'debug',
    passed: boolean,
    hintsUsed: number
  ) => Promise<void> | void;
}

const HINT_LEVEL_LABELS = [
  'Level 1 · Conceptual Direction',
  'Level 2 · Logical Approach',
  'Level 3 · Pseudocode / Partial Code',
  'Level 4 · Full Solution, Dry Run & Alternatives',
] as const;

export function CodingPlaygroundPanel({
  challenges,
  solvedIds,
  onChallengeCompleted,
}: CodingPlaygroundPanelProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const challenge = challenges[selectedIdx] ?? challenges[0];

  const [code, setCode] = useState(() => challenge?.starterJs ?? '');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PlaygroundRunResult | null>(null);
  const [revealedHintLevel, setRevealedHintLevel] = useState(0); // 0 = none, 1..4 sequential
  const [diagnosisChoice, setDiagnosisChoice] = useState<number | null>(null);

  useEffect(() => {
    setSelectedIdx(0);
  }, [challenges]);

  useEffect(() => {
    if (!challenge) return;
    setCode(challenge.starterJs);
    setResult(null);
    setRevealedHintLevel(0);
    setDiagnosisChoice(null);
  }, [challenge]);

  if (!challenge) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
        No coding test challenges in this filter yet.
      </div>
    );
  }

  const isSolved = solvedIds.includes(challenge.id);
  const isDebug = challenge.kind === 'debug';
  const diagnosisCorrect =
    challenge.bugDiagnosis !== undefined &&
    diagnosisChoice === challenge.bugDiagnosis.correctIndex;

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const runResult = await runSandboxedTests({
        learnerCode: code,
        testCases: challenge.testCases,
        restrictions: challenge.restrictions,
        timeoutMs: 2500,
      });
      setResult(runResult);
      await onChallengeCompleted(
        challenge.id,
        challenge.kind,
        runResult.allPassed,
        revealedHintLevel
      );
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setCode(challenge.starterJs);
    setResult(null);
  };

  const handleRevealNextHint = () => {
    setRevealedHintLevel((prev) => Math.min(4, prev + 1));
  };

  const handleLoadSolution = () => {
    setCode(challenge.solutionJs);
    setResult(null);
  };

  const statusTone = (status: 'strong' | 'good' | 'needs-work') =>
    status === 'strong'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
      : status === 'good'
      ? 'bg-amber-50 border-amber-200 text-amber-950'
      : 'bg-rose-50 border-rose-200 text-rose-950';

  return (
    <div className="space-y-4">
      {/* Challenge selector when topic has multiple coding/debug tasks */}
      {challenges.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {challenges.map((item, idx) => {
            const done = solvedIds.includes(item.id);
            const active = idx === selectedIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-3.5 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  active
                    ? 'bg-sky-50 border-sky-600 text-sky-950'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide">
                  <span className={item.kind === 'debug' ? 'text-rose-700' : 'text-sky-800'}>
                    {item.kind === 'debug'
                      ? 'Find the Bug!'
                      : item.kind === 'logical'
                      ? 'Logical / Exam Test'
                      : 'Workspace Test'}
                  </span>
                  <span className={done ? 'text-emerald-700' : 'text-slate-400'}>
                    {done ? 'Passed ✓' : item.difficulty}
                  </span>
                </div>
                <div className="text-xs font-semibold mt-0.5 truncate">{item.title}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Prompt & Restrictions Card */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className={isDebug ? 'text-rose-700' : 'text-sky-800'}>
                {isDebug
                  ? 'Find the Bug! Challenge'
                  : challenge.kind === 'logical'
                  ? 'Logical / Exam Coding Test'
                  : 'Daily-Life / Workspace Coding Test'}
              </span>
              <span>·</span>
              <span>{challenge.difficulty}</span>
              <span>·</span>
              <span className="text-slate-700">{challenge.scenario}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {isDebug ? (
                <Bug size={16} className="text-rose-600 shrink-0" />
              ) : (
                <Code2 size={16} className="text-sky-700 shrink-0" />
              )}
              <span>{challenge.title}</span>
            </h3>
          </div>

          {isSolved && (
            <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
              <CheckCircle2 size={14} />
              All Tests Passed
            </div>
          )}
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{challenge.taskPrompt}</p>

        {challenge.restrictions && challenge.restrictions.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-amber-700" />
              Active Challenge Restrictions
            </div>
            <ul className="text-xs text-amber-900 space-y-0.5 list-disc list-inside">
              {challenge.restrictions.map((r) => (
                <li key={r.id}>
                  <span className="font-semibold">{r.label}:</span> {r.violationMessage}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step 1 Diagnosis for "Find the Bug!" */}
        {isDebug && challenge.bugDiagnosis && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
            <div className="text-xs font-bold text-slate-900">
              Step 1 · Diagnose Why the Bug Happens
            </div>
            <p className="text-xs text-slate-700">{challenge.bugDiagnosis.question}</p>
            <div className="space-y-1.5">
              {challenge.bugDiagnosis.options.map((opt, idx) => {
                const selected = diagnosisChoice === idx;
                const isRight = idx === challenge.bugDiagnosis!.correctIndex;
                let style = 'bg-white border-slate-200 text-slate-800 hover:border-sky-400';
                if (diagnosisChoice !== null) {
                  if (isRight) style = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-medium';
                  else if (selected) style = 'bg-rose-50 border-rose-400 text-rose-950';
                  else style = 'bg-white border-slate-200 text-slate-500';
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDiagnosisChoice(idx)}
                    className={`w-full text-left px-3 py-2 text-xs border rounded-lg transition-colors cursor-pointer ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {diagnosisChoice !== null && (
              <div
                className={`text-xs p-2.5 rounded-md border ${
                  diagnosisCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <span className="font-bold mr-1">
                  {diagnosisCorrect ? 'Spot on!' : 'Review:'}
                </span>
                {challenge.bugDiagnosis.explanation} Now fix the code below and run the test suite.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Editor + Sandboxed Test Results */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[380px]">
          <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-sky-300 font-semibold">
              solution.js (Sandboxed Web Worker · 2.5s timeout)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                Reset
              </button>
              <button
                type="button"
                onClick={handleRunTests}
                disabled={running}
                className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Play size={12} />
                {running ? 'Running...' : 'Run Tests'}
              </button>
            </div>
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            onRunShortcut={handleRunTests}
            ariaLabel="Coding challenge JavaScript editor"
          />
        </section>

        {/* Results, Expected-vs-Actual & Console */}
        <section className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800">
                Automated Test Suite ({challenge.testCases.length} tests ·{' '}
                {challenge.testCases.filter((t) => t.hidden).length} hidden edge cases)
              </span>
              {result && (
                <span
                  className={`text-xs font-bold tabular-nums ${
                    result.allPassed ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {result.passedCount}/{result.totalCount} Passed · {result.durationMs}ms
                </span>
              )}
            </div>

            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[340px]">
              {!result && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600">
                    Click <span className="font-semibold text-slate-900">Run Tests</span> to execute
                    your solution in an isolated Web Worker against visible tests and hidden edge
                    cases.
                  </p>
                  <div className="space-y-1.5">
                    {challenge.testCases.map((tc) => (
                      <div
                        key={tc.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="font-semibold text-slate-800 flex items-center justify-between gap-2">
                          <span>{tc.hidden ? 'Hidden Edge-Case Test' : tc.label}</span>
                          {tc.hidden && <Lock size={12} className="text-slate-400" />}
                        </div>
                        {!tc.hidden && (
                          <div className="mt-1 font-mono text-[11px] text-slate-600">
                            <div>Input: {tc.inputSummary}</div>
                            <div>Expected: {tc.expectedSummary}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result && result.runtimeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 flex items-start gap-2">
                  <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      {result.timedOut ? 'Safety Timeout Triggered' : 'Runtime / Syntax Error'}
                    </div>
                    <div className="font-mono mt-0.5 break-words">{result.runtimeError}</div>
                  </div>
                </div>
              )}

              {result && result.restrictionViolations.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-950 space-y-1">
                  <div className="font-bold">Restriction Violated</div>
                  {result.restrictionViolations.map((v, i) => (
                    <div key={i}>{v}</div>
                  ))}
                </div>
              )}

              {result && (
                <div className="space-y-2">
                  {result.testResults.map((tr) => (
                    <div
                      key={tr.id}
                      className={`p-3 rounded-lg border text-xs ${
                        tr.passed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-semibold">
                        <span className="flex items-center gap-1.5">
                          {tr.passed ? (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-rose-600 shrink-0" />
                          )}
                          <span>
                            {tr.hidden ? `${tr.label} (Hidden Edge Case)` : tr.label}
                          </span>
                        </span>
                        <span className="text-[11px] font-bold">
                          {tr.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      {!tr.hidden ? (
                        <div className="mt-1.5 font-mono text-[11px] space-y-0.5 text-slate-800">
                          <div>Input: {tr.inputSummary}</div>
                          <div>Expected: {tr.expectedDisplay}</div>
                          <div>Actual: {tr.actualDisplay}</div>
                          {tr.error && <div className="text-rose-700">Error: {tr.error}</div>}
                        </div>
                      ) : (
                        !tr.passed && (
                          <div className="mt-1 text-[11px] text-rose-800">
                            Failed hidden boundary/edge case (check empty inputs, 0, negatives,
                            duplicates, or immutability).
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Output Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-36">
            <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Terminal size={13} />
              Worker Console Output
            </div>
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
              {!result || result.consoleLogs.length === 0 ? (
                <div className="text-slate-500">
                  Add `console.log(...)` statements in your function to inspect values during test runs.
                </div>
              ) : (
                result.consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={
                      log.level === 'error'
                        ? 'text-rose-400'
                        : log.level === 'warn'
                        ? 'text-amber-300'
                        : 'text-emerald-300'
                    }
                  >
                    &gt; {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 3-Track Separate Feedback: Correctness, Readability, Efficiency */}
      {result && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            [
              ['Correctness', result.feedback.correctness],
              ['Readability', result.feedback.readability],
              ['Efficiency', result.feedback.efficiency],
            ] as const
          ).map(([title, track]) => (
            <div
              key={title}
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${statusTone(track.status)}`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{title}</span>
                <span className="uppercase text-[10px]">
                  {track.status === 'strong'
                    ? 'Strong'
                    : track.status === 'good'
                    ? 'Good'
                    : 'Needs Work'}
                </span>
              </div>
              <p className="leading-relaxed">{track.summary}</p>
              {track.notes.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] opacity-90">
                  {track.notes.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* 4-Level Progressive Hint Ladder (Never reveals full solution first!) */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-amber-600" />
              4-Level Progressive Hint Ladder
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Unlock one hint at a time — conceptual direction first, full solution + dry run only at Level 4.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {revealedHintLevel < 4 ? (
              <button
                type="button"
                onClick={handleRevealNextHint}
                className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={13} />
                Reveal Hint Level {revealedHintLevel + 1} / 4
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLoadSolution}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg cursor-pointer"
              >
                Load Solution into Editor
              </button>
            )}
          </div>
        </div>

        {revealedHintLevel > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {Array.from({ length: revealedHintLevel }, (_, i) => i).map((lvl) => (
              <div
                key={lvl}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
              >
                <div className="text-[11px] font-bold text-sky-900">
                  {HINT_LEVEL_LABELS[lvl]}
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {challenge.hints[lvl]}
                </p>

                {lvl === 3 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <pre className="p-3 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed">
                      <code>{challenge.solutionJs}</code>
                    </pre>
                    <div className="text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Dry Run: </span>
                      {challenge.dryRun}
                    </div>
                    {challenge.alternatives && challenge.alternatives.length > 0 && (
                      <div className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Alternative Approach: </span>
                        <code className="font-mono text-[11px] bg-slate-200 px-1.5 py-0.5 rounded">
                          {challenge.alternatives.join(' | ')}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
