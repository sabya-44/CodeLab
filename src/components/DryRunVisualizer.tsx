import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Server,
  Terminal,
} from 'lucide-react';
import type { FetchStageId, VisualizerScenario } from '../types/visualizer';

interface DryRunVisualizerProps {
  scenarios: VisualizerScenario[];
  onContinueToPractice?: () => void;
}

const FETCH_STAGES: Array<{ id: FetchStageId; stepNum: string; label: string }> = [
  { id: 'call', stepNum: '1', label: 'JS fetch()' },
  { id: 'request', stepNum: '2', label: 'HTTP Request' },
  { id: 'server', stepNum: '3', label: 'Server' },
  { id: 'response', stepNum: '4', label: 'HTTP Response' },
  { id: 'parse', stepNum: '5', label: 'JSON Parse' },
  { id: 'ui', stepNum: '6', label: 'UI Update' },
];

export function DryRunVisualizer({
  scenarios,
  onContinueToPractice,
}: DryRunVisualizerProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario = scenarios[scenarioIdx] ?? scenarios[0];

  // Reset when topic/scenarios change
  useEffect(() => {
    setScenarioIdx(0);
    setStepIdx(0);
    setIsPlaying(false);
  }, [scenarios]);

  // Reset step when scenario tab changes
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [scenarioIdx]);

  // Auto-play timer with safe cleanup
  useEffect(() => {
    if (!isPlaying || !scenario) return;
    if (stepIdx >= scenario.steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIdx((prev) => Math.min(scenario.steps.length - 1, prev + 1));
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [isPlaying, scenario, stepIdx]);

  if (!scenario) return null;

  const totalSteps = scenario.steps.length;
  const step = scenario.steps[stepIdx] ?? scenario.steps[0];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === totalSteps - 1;

  const handlePrev = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setStepIdx((prev) => Math.min(totalSteps - 1, prev + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIdx(0);
  };

  const handleTogglePlay = () => {
    if (isLast) {
      setStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const fetchStageOrder = (stage: FetchStageId) =>
    FETCH_STAGES.findIndex((s) => s.id === stage);

  return (
    <div className="space-y-4">
      {/* Header & Step Controls */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
        {scenarios.length > 1 && (
          <div
            className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200"
            role="tablist"
            aria-label="Visualizer scenario selector"
          >
            {scenarios.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                role="tab"
                aria-selected={scenarioIdx === idx}
                onClick={() => setScenarioIdx(idx)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  scenarioIdx === idx
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Scenario {idx + 1}: {sc.title}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-sky-800">
              Interactive Dry-Run Execution Visualizer
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">{scenario.title}</h2>
            <p className="text-xs text-slate-600">{scenario.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              type="button"
              onClick={handleTogglePlay}
              className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {isPlaying ? 'Pause' : isLast ? 'Replay' : 'Auto-Play'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLast}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </div>

        {/* Interactive Step Timeline */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">{step.phaseLabel}</span>
            <span className="font-mono text-slate-500 tabular-nums">
              Step {stepIdx + 1} / {totalSteps}
            </span>
          </div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
            {scenario.steps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(idx);
                }}
                aria-label={`Jump to step ${idx + 1}: ${s.phaseLabel}`}
                title={`Step ${idx + 1}: ${s.phaseLabel}`}
                className={`h-2 rounded-sm transition-colors cursor-pointer ${
                  idx === stepIdx
                    ? 'bg-sky-700'
                    : idx < stepIdx
                    ? 'bg-sky-300 hover:bg-sky-400'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Two-Zone Interactive Dry-Run Stage */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Zone: Line-Highlighted Code + Step Explanation + Console */}
        <div className="xl:col-span-5 space-y-4">
          <section className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Execution Trace Code</span>
              <span className="text-[11px] font-mono text-sky-300 tabular-nums">
                Active Line {step.activeLine}
              </span>
            </div>
            <div className="py-2 font-mono text-xs leading-6 overflow-x-auto">
              {scenario.codeLines.map((line, i) => {
                const lineNum = i + 1;
                const isActive = lineNum === step.activeLine;
                return (
                  <div
                    key={lineNum}
                    className={`px-3 py-0.5 flex items-start gap-3 transition-colors ${
                      isActive ? 'bg-sky-500/20 text-white' : 'text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 text-right shrink-0 select-none tabular-nums ${
                        isActive ? 'text-sky-300 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {lineNum}
                    </span>
                    <span className="w-3 shrink-0 text-sky-400 font-bold select-none">
                      {isActive ? '>' : ''}
                    </span>
                    <code className="whitespace-pre">{line}</code>
                  </div>
                );
              })}
            </div>
          </section>

          {/* What Happened on This Step */}
          <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-bold text-sky-800">{step.phaseLabel}</div>
            <p className="text-sm text-slate-700 leading-relaxed">{step.explanation}</p>
          </section>

          {/* Console Output */}
          {step.consoleOutput && (
            <section className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Terminal size={13} />
                Console Output
              </div>
              <div className="p-3 font-mono text-xs space-y-1 min-h-[56px]">
                {step.consoleOutput.length === 0 ? (
                  <div className="text-slate-500">(No console output yet)</div>
                ) : (
                  step.consoleOutput.map((entry, idx) => (
                    <div key={idx} className="text-emerald-300 flex items-start gap-2">
                      <span className="text-slate-500 tabular-nums">{idx + 1}.</span>
                      <span>{entry}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Zone: Dynamic Runtime Visual Panels */}
        <div className="xl:col-span-7 space-y-4">
          {/* A. Variables Watch Panel */}
          {step.variables && step.variables.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900">Variables in Scope</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {step.variables.map((v, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between gap-2 ${
                      v.changed
                        ? 'bg-sky-50 border-sky-300 text-sky-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold">{v.name}</span>
                      {v.type && (
                        <span className="text-[11px] text-slate-500 ml-1.5">({v.type})</span>
                      )}
                    </div>
                    <span className="font-semibold text-right break-all tabular-nums">
                      {v.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* B. Loop / Array Iteration Trace Table */}
          {scenario.tableColumns && step.tableRows && (
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Dry-Run Trace Table</h3>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {step.tableRows.length} row{step.tableRows.length === 1 ? '' : 's'} recorded
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600">
                      {scenario.tableColumns.map((col, idx) => (
                        <th key={idx} className="px-3.5 py-2 font-semibold whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {step.tableRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={scenario.tableColumns.length}
                          className="px-3.5 py-4 text-center text-slate-400 font-sans"
                        >
                          Click Next to step into the first iteration.
                        </td>
                      </tr>
                    ) : (
                      step.tableRows.map((row, rIdx) => {
                        const isLatest = rIdx === step.tableRows!.length - 1;
                        return (
                          <tr
                            key={rIdx}
                            className={isLatest ? 'bg-sky-50/80 text-sky-950 font-semibold' : 'text-slate-700'}
                          >
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* C. Call Stack Panel */}
          {step.callStack && step.callStack.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers size={14} className="text-sky-700" />
                  Call Stack (Top = Active Frame)
                </h3>
                <span className="text-[11px] text-slate-500 tabular-nums">
                  Depth: {step.callStack.length}
                </span>
              </div>
              <div className="flex flex-col-reverse gap-2">
                {step.callStack.map((item, idx) => {
                  const isTop = idx === step.callStack!.length - 1;
                  const statusTone =
                    item.status === 'returning'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : item.status === 'paused'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : isTop
                      ? 'bg-sky-50 border-sky-400 text-sky-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700';

                  return (
                    <div
                      key={idx}
                      className={`px-3.5 py-2.5 rounded-lg border font-mono text-xs flex flex-wrap items-center justify-between gap-2 ${statusTone}`}
                    >
                      <span className="font-bold">{item.frame}</span>
                      <span className="text-[11px] opacity-80">
                        {item.detail ? item.detail : isTop ? 'active' : 'waiting'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* D. Lexical Scopes & Retained Closure Environments */}
          {step.scopes && step.scopes.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900">
                Scope &amp; Closure Environments
              </h3>
              <div className="space-y-3">
                {step.scopes.map((scope, sIdx) => (
                  <div
                    key={sIdx}
                    className={`rounded-lg border p-3.5 space-y-2 ${
                      scope.kind === 'closure'
                        ? 'bg-emerald-50/50 border-emerald-300'
                        : scope.kind === 'block'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-slate-900">{scope.name}</span>
                      <span className="text-[11px] font-medium text-slate-600">
                        {scope.retained ? 'Heap-Retained Closure' : `${scope.kind} scope`}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {scope.bindings.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className={`px-2.5 py-1.5 rounded border font-mono text-xs flex items-center justify-between gap-2 ${
                            b.changed
                              ? 'bg-white border-sky-400 text-sky-950 font-semibold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{b.key}</span>
                          <span className="text-right break-all">{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* E. Stack vs Heap Memory Diagram */}
          {step.memory && (
            <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900">
                Stack (Variable Pointers) vs. Heap (Objects in Memory)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Stack Column */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700">
                    Stack Memory (Fixed Bindings)
                  </div>
                  {step.memory.stack.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-2 rounded-md border font-mono text-xs flex items-center justify-between gap-2 ${
                        entry.changed
                          ? 'bg-sky-50 border-sky-400 text-sky-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <span>{entry.name}</span>
                      <span className="text-sky-800">{entry.value}</span>
                    </div>
                  ))}
                </div>

                {/* Heap Column */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-700">
                    Heap Memory (Reference Objects)
                  </div>
                  {step.memory.heap.map((obj) => (
                    <div
                      key={obj.id}
                      className="bg-white border border-slate-300 rounded-md p-2.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-sky-800">{obj.id}</span>
                        <span className="text-slate-500">{obj.label}</span>
                      </div>
                      <div className="space-y-1">
                        {obj.entries.map((prop, pIdx) => (
                          <div
                            key={pIdx}
                            className={`px-2 py-1 rounded text-xs font-mono flex items-center justify-between gap-2 ${
                              prop.changed
                                ? 'bg-amber-50 text-amber-950 font-semibold'
                                : 'bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span>{prop.key}:</span>
                            <span className="text-right break-all">{prop.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* F. Event Loop Architecture Stage */}
          {step.eventLoop && (
            <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Event Loop &amp; Task Queues
                </h3>
                <span className="text-xs font-semibold text-sky-800">
                  Priority: Sync Stack -&gt; Microtasks -&gt; Macrotasks
                </span>
              </div>

              <div
                className={`p-3 rounded-lg border text-xs font-medium ${
                  step.eventLoop.activePhase === 'microtask'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : step.eventLoop.activePhase === 'macrotask'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-sky-50 border-sky-200 text-sky-950'
                }`}
              >
                Event Loop Status: {step.eventLoop.loopStatus}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-[11px] font-bold text-slate-700">Browser Web APIs</div>
                  {step.eventLoop.webApis.length === 0 ? (
                    <div className="text-xs text-slate-400">Empty</div>
                  ) : (
                    step.eventLoop.webApis.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800"
                      >
                        {item}
                      </div>
                    ))
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg border space-y-2 ${
                    step.eventLoop.activePhase === 'microtask'
                      ? 'bg-emerald-50/70 border-emerald-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold text-emerald-900">
                    Microtask Queue (High Priority)
                  </div>
                  {step.eventLoop.microtasks.length === 0 ? (
                    <div className="text-xs text-slate-400">Empty</div>
                  ) : (
                    step.eventLoop.microtasks.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white border border-emerald-300 rounded font-mono text-[11px] text-emerald-950"
                      >
                        {item}
                      </div>
                    ))
                  )}
                </div>

                <div
                  className={`p-3 rounded-lg border space-y-2 ${
                    step.eventLoop.activePhase === 'macrotask'
                      ? 'bg-amber-50/70 border-amber-400'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold text-amber-900">
                    Macrotask Queue (Timers / I/O)
                  </div>
                  {step.eventLoop.macrotasks.length === 0 ? (
                    <div className="text-xs text-slate-400">Empty</div>
                  ) : (
                    step.eventLoop.macrotasks.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white border border-amber-300 rounded font-mono text-[11px] text-amber-950"
                      >
                        {item}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          )}

          {/* G. Full Fetch HTTP Lifecycle Stage */}
          {step.fetchFlow && (
            <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Server size={14} className="text-sky-700" />
                  Fetch HTTP Request &amp; Response Pipeline
                </h3>
                <span className="font-mono text-xs text-sky-800 font-semibold">
                  {step.fetchFlow.method} {step.fetchFlow.url}
                </span>
              </div>

              {/* 6-Stage Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {FETCH_STAGES.map((stage) => {
                  const currentOrder = fetchStageOrder(step.fetchFlow!.activeStage);
                  const thisOrder = fetchStageOrder(stage.id);
                  const isCurrent = thisOrder === currentOrder;
                  const isDone = thisOrder < currentOrder;
                  return (
                    <div
                      key={stage.id}
                      className={`p-2.5 rounded-lg border text-center space-y-0.5 ${
                        isCurrent
                          ? 'bg-sky-700 border-sky-700 text-white'
                          : isDone
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="text-[10px] font-mono tabular-nums opacity-80">
                        Stage {stage.stepNum}
                      </div>
                      <div className="text-[11px] font-semibold leading-tight">{stage.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Request & Response Payloads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="font-bold text-slate-800">HTTP Request</div>
                  <div className="font-mono text-[11px] text-slate-700 space-y-1">
                    <div>
                      <span className="text-slate-500">Method:</span> {step.fetchFlow.method}
                    </div>
                    <div className="break-all">
                      <span className="text-slate-500">URL:</span> {step.fetchFlow.url}
                    </div>
                    <div>
                      <span className="text-slate-500">Headers:</span>{' '}
                      {JSON.stringify(step.fetchFlow.requestHeaders)}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="font-bold text-slate-800">HTTP Response &amp; Parsing</div>
                  {step.fetchFlow.status ? (
                    <div className="font-mono text-[11px] text-slate-700 space-y-1">
                      <div className="text-emerald-800 font-semibold">
                        Status: {step.fetchFlow.status} (res.ok = {String(step.fetchFlow.ok)})
                      </div>
                      {step.fetchFlow.rawJson && (
                        <div className="break-all">
                          <span className="text-slate-500">Raw JSON:</span> {step.fetchFlow.rawJson}
                        </div>
                      )}
                      {step.fetchFlow.parsedObject && (
                        <div className="text-sky-900 font-semibold break-all">
                          Parsed JS Object: {step.fetchFlow.parsedObject}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs">Waiting for HTTP response...</div>
                  )}
                </div>
              </div>

              {/* Simulated UI Output */}
              {step.fetchFlow.uiPreview && (
                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-lg flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Browser DOM (#temp)
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-300">
                    {step.fetchFlow.uiPreview}
                  </span>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {onContinueToPractice && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onContinueToPractice}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            Continue to Interactive Practice
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
