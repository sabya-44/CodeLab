import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Lightbulb,
  Lock,
  Play,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { MINI_PROJECTS, type MiniProject } from '../data/miniProjects';
import { TOPICS_BY_ID } from '../data/topicsIndex';
import type { ProjectProgressRecord, TopicMasteryRecord, TopicProgressRecord } from '../types/topic';
import { CodeEditor } from './CodeEditor';

interface ProjectsViewProps {
  progressMap: Record<string, TopicProgressRecord>;
  masteryMap: Record<string, TopicMasteryRecord>;
  projectProgressMap: Record<string, ProjectProgressRecord>;
  onSaveProjectProgress: (
    projectId: string,
    updater: (prev: ProjectProgressRecord | undefined) => ProjectProgressRecord
  ) => void;
  onOpenTopic: (topicId: string) => void;
}

interface ProjectTestResult {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

function buildProjectSrcDoc(params: {
  runId: string;
  html: string;
  css: string;
  js: string;
  preludeJs?: string;
  runTests?: MiniProject['testCases'];
}): string {
  const safeTests = JSON.stringify(params.runTests ?? []);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>* { box-sizing: border-box; } ${params.css}</style>
</head>
<body>
${params.html}
<script>
(function(){
  const runId = ${JSON.stringify(params.runId)};
  window.addEventListener('error', (ev) => {
    parent.postMessage({ source: 'jslab-project', runId, type: 'error', message: ev.message || 'Runtime Error' }, '*');
  });
})();
</script>
<script>
${params.preludeJs ?? ''}
</script>
<script>
try {
${params.js}
} catch (err) {
  parent.postMessage({ source: 'jslab-project', runId: ${JSON.stringify(params.runId)}, type: 'error', message: err.name + ': ' + err.message }, '*');
}
</script>
${
  params.runTests && params.runTests.length > 0
    ? `<script>
(async function(){
  const runId = ${JSON.stringify(params.runId)};
  const tests = ${safeTests};
  const results = [];
  for (const t of tests) {
    try {
      const out = await eval(t.script);
      results.push({ id: t.id, label: t.label, pass: Boolean(out && out.pass), detail: String(out?.detail ?? '') });
    } catch (e) {
      results.push({ id: t.id, label: t.label, pass: false, detail: e.name + ': ' + e.message });
    }
  }
  parent.postMessage({ source: 'jslab-project', runId, type: 'test-results', results }, '*');
})();
</script>`
    : ''
}
</body>
</html>`;
}

export function ProjectsView({
  progressMap,
  masteryMap,
  projectProgressMap,
  onSaveProjectProgress,
  onOpenTopic,
}: ProjectsViewProps) {
  const [activeProjectId, setActiveProjectId] = useState<string>(MINI_PROJECTS[0].id);
  const project = useMemo(
    () => MINI_PROJECTS.find((p) => p.id === activeProjectId) ?? MINI_PROJECTS[0],
    [activeProjectId]
  );

  const saved = projectProgressMap[project.id];
  const [editorTab, setEditorTab] = useState<'js' | 'html' | 'css'>('js');
  const [htmlCode, setHtmlCode] = useState(() => saved?.savedHtml || project.starterHtml);
  const [cssCode, setCssCode] = useState(() => saved?.savedCss || project.starterCss);
  const [jsCode, setJsCode] = useState(() => saved?.savedJs || project.starterJs);
  const [srcDoc, setSrcDoc] = useState('');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<ProjectTestResult[]>([]);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [revealedHints, setRevealedHints] = useState(() => saved?.hintsRevealed ?? 0);
  const activeRunIdRef = useRef('');

  const isTopicMastered = useCallback(
    (topicId: string) =>
      masteryMap[topicId]?.state === 'mastered' || progressMap[topicId]?.status === 'solved',
    [masteryMap, progressMap]
  );

  const launchPreview = useCallback(
    (html: string, css: string, js: string, withTests = false) => {
      const runId = `${project.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      activeRunIdRef.current = runId;
      setRuntimeError(null);
      if (withTests) setTestResults([]);
      setSrcDoc(
        buildProjectSrcDoc({
          runId,
          html,
          css,
          js,
          preludeJs: project.sandboxPreludeJs,
          runTests: withTests ? project.testCases : undefined,
        })
      );
    },
    [project.id, project.sandboxPreludeJs, project.testCases]
  );

  useEffect(() => {
    const rec = projectProgressMap[project.id];
    const nextHtml = rec?.savedHtml || project.starterHtml;
    const nextCss = rec?.savedCss || project.starterCss;
    const nextJs = rec?.savedJs || project.starterJs;
    setHtmlCode(nextHtml);
    setCssCode(nextCss);
    setJsCode(nextJs);
    setRevealedHints(rec?.hintsRevealed ?? 0);
    setHintsOpen(false);
    setTestResults([]);
    setEditorTab('js');
    launchPreview(nextHtml, nextCss, nextJs, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || data.source !== 'jslab-project' || data.runId !== activeRunIdRef.current) {
        return;
      }
      if (data.type === 'error') {
        setRuntimeError(String(data.message));
      } else if (data.type === 'test-results' && Array.isArray(data.results)) {
        const list = data.results as ProjectTestResult[];
        setTestResults(list);
        const passedIds = list.filter((r) => r.pass).map((r) => r.id);
        onSaveProjectProgress(project.id, (prev) => ({
          projectId: project.id,
          savedHtml: htmlCode,
          savedCss: cssCode,
          savedJs: jsCode,
          completedMilestones: prev?.completedMilestones ?? [],
          checkedChecklistIds: prev?.checkedChecklistIds ?? [],
          passedTestIds: Array.from(new Set([...(prev?.passedTestIds ?? []), ...passedIds])),
          hintsRevealed: prev?.hintsRevealed ?? revealedHints,
          completedAt:
            passedIds.length === project.testCases.length
              ? prev?.completedAt ?? new Date().toISOString()
              : prev?.completedAt,
          updatedAt: new Date().toISOString(),
        }));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [cssCode, htmlCode, jsCode, onSaveProjectProgress, project.id, project.testCases.length, revealedHints]);

  const persistCode = (nextHtml = htmlCode, nextCss = cssCode, nextJs = jsCode) => {
    onSaveProjectProgress(project.id, (prev) => ({
      projectId: project.id,
      savedHtml: nextHtml,
      savedCss: nextCss,
      savedJs: nextJs,
      completedMilestones: prev?.completedMilestones ?? [],
      checkedChecklistIds: prev?.checkedChecklistIds ?? [],
      passedTestIds: prev?.passedTestIds ?? [],
      hintsRevealed: prev?.hintsRevealed ?? revealedHints,
      completedAt: prev?.completedAt,
      updatedAt: new Date().toISOString(),
    }));
  };

  const toggleMilestone = (milestoneId: string) => {
    onSaveProjectProgress(project.id, (prev) => {
      const existing = prev?.completedMilestones ?? [];
      const next = existing.includes(milestoneId)
        ? existing.filter((id) => id !== milestoneId)
        : [...existing, milestoneId];
      return {
        projectId: project.id,
        savedHtml: htmlCode,
        savedCss: cssCode,
        savedJs: jsCode,
        completedMilestones: next,
        checkedChecklistIds: prev?.checkedChecklistIds ?? [],
        passedTestIds: prev?.passedTestIds ?? [],
        hintsRevealed: prev?.hintsRevealed ?? revealedHints,
        completedAt: prev?.completedAt,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const toggleChecklist = (checkId: string) => {
    onSaveProjectProgress(project.id, (prev) => {
      const existing = prev?.checkedChecklistIds ?? [];
      const next = existing.includes(checkId)
        ? existing.filter((id) => id !== checkId)
        : [...existing, checkId];
      return {
        projectId: project.id,
        savedHtml: htmlCode,
        savedCss: cssCode,
        savedJs: jsCode,
        completedMilestones: prev?.completedMilestones ?? [],
        checkedChecklistIds: next,
        passedTestIds: prev?.passedTestIds ?? [],
        hintsRevealed: prev?.hintsRevealed ?? revealedHints,
        completedAt: prev?.completedAt,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const missingPrereqs = project.unlockTopicIds.filter((id) => !isTopicMastered(id));
  const completedMilestones = saved?.completedMilestones ?? [];
  const checkedChecklistIds = saved?.checkedChecklistIds ?? [];
  const passedTestIds = saved?.passedTestIds ?? [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
      {/* Left Project Selector */}
      <aside className="w-full lg:w-72 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden lg:sticky lg:top-6 lg:self-start">
        <div className="p-4 border-b border-slate-200">
          <h1 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban size={17} className="text-sky-700" />
            Guided Mini Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build 5 real-world apps milestone by milestone — no copy-paste code up front.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {MINI_PROJECTS.map((proj) => {
            const missing = proj.unlockTopicIds.filter((id) => !isTopicMastered(id)).length;
            const rec = projectProgressMap[proj.id];
            const passed = rec?.passedTestIds?.length ?? 0;
            const allPassed = passed >= proj.testCases.length;
            const active = proj.id === project.id;

            return (
              <button
                key={proj.id}
                type="button"
                onClick={() => setActiveProjectId(proj.id)}
                className={`w-full px-4 py-3 text-left transition-colors cursor-pointer ${
                  active ? 'bg-sky-50 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                  <span className="text-sky-800">Project 0{proj.number} · {proj.tier}</span>
                  {allPassed ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : missing > 0 ? (
                    <span className="text-amber-700 flex items-center gap-1 tabular-nums">
                      <Lock size={11} /> {missing} prereq
                    </span>
                  ) : (
                    <span className="text-emerald-700">Unlocked</span>
                  )}
                </div>
                <div className="text-xs font-bold mt-0.5">{proj.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  {passed}/{proj.testCases.length} tests verified
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Guided Project Workspace */}
      <main className="flex-1 min-w-0 space-y-5">
        <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-sky-800">
                Project 0{project.number} · {project.tier} · {project.unlockGroupLabel}
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900">{project.title}</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{project.summary}</p>
            </div>
            <div className="text-xs font-semibold text-slate-700 tabular-nums shrink-0">
              {passedTestIds.length}/{project.testCases.length} Functional Tests Passed
            </div>
          </div>

          {/* Prerequisite Readiness Notice (guided, never dead-ends the learner) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
            <div className="font-bold text-slate-800">
              {missingPrereqs.length === 0
                ? 'All recommended prerequisite topics mastered — ready to build!'
                : `Recommended prerequisites (${project.unlockTopicIds.length - missingPrereqs.length}/${project.unlockTopicIds.length} mastered — you can still prototype below):`}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {project.unlockTopicIds.map((pid) => {
                const t = TOPICS_BY_ID[pid];
                if (!t) return null;
                const met = isTopicMastered(pid);
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => onOpenTopic(pid)}
                    className={`hover:underline cursor-pointer font-medium ${
                      met ? 'text-emerald-700' : 'text-sky-800'
                    }`}
                  >
                    #{String(t.number).padStart(2, '0')} {t.title} {met ? '✓' : '→'}
                  </button>
                );
              })}
            </div>
            <div className="text-slate-600 pt-1">
              <span className="font-semibold text-slate-800">Concepts practiced: </span>
              {project.requiredConcepts.join(' · ')}
            </div>
          </div>

          {/* Requirements & Step-by-Step Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Functional Requirements
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside leading-relaxed">
                {project.functionalRequirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Step-by-Step Milestones
              </h3>
              <div className="space-y-2">
                {project.milestones.map((m) => {
                  const checked = completedMilestones.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMilestone(m.id)}
                        className="mt-0.5 rounded border-slate-300 text-sky-700"
                      />
                      <span className={checked ? 'line-through text-slate-400' : ''}>
                        <strong className="text-slate-900">Step {m.step}: {m.title}</strong> — {m.task}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Live Sandboxed Code Workspace & Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[440px]">
            <div className="px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['js', 'html', 'css'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditorTab(tab)}
                    className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer ${
                      editorTab === tab
                        ? 'bg-slate-800 text-sky-300 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab === 'js' ? 'script.js' : tab === 'html' ? 'index.html' : 'styles.css'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHtmlCode(project.starterHtml);
                    setCssCode(project.starterCss);
                    setJsCode(project.starterJs);
                    persistCode(project.starterHtml, project.starterCss, project.starterJs);
                    launchPreview(project.starterHtml, project.starterCss, project.starterJs, false);
                  }}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    persistCode();
                    launchPreview(htmlCode, cssCode, jsCode, false);
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded flex items-center gap-1 cursor-pointer"
                >
                  <Play size={12} /> Run Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    persistCode();
                    launchPreview(htmlCode, cssCode, jsCode, true);
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck size={12} /> Run Tests
                </button>
              </div>
            </div>

            {editorTab === 'js' && (
              <CodeEditor
                value={jsCode}
                onChange={setJsCode}
                onRunShortcut={() => {
                  persistCode();
                  launchPreview(htmlCode, cssCode, jsCode, false);
                }}
                ariaLabel="Project JavaScript editor"
              />
            )}
            {editorTab === 'html' && (
              <CodeEditor value={htmlCode} onChange={setHtmlCode} ariaLabel="Project HTML editor" />
            )}
            {editorTab === 'css' && (
              <CodeEditor value={cssCode} onChange={setCssCode} ariaLabel="Project CSS editor" />
            )}
          </section>

          <section className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Live Project Sandbox</span>
                {runtimeError && (
                  <span className="text-rose-700 font-mono truncate max-w-[260px]">
                    {runtimeError}
                  </span>
                )}
              </div>
              <iframe
                key={activeRunIdRef.current || project.id}
                title={`Live preview for ${project.title}`}
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-modals"
                className="w-full flex-1 min-h-[290px] bg-white border-0"
              />
            </div>

            {/* Automated Project Functional Test Results */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Functional Test Cases ({project.testCases.length})</span>
                {testResults.length > 0 && (
                  <span className="tabular-nums text-sky-800">
                    {testResults.filter((r) => r.pass).length}/{testResults.length} Passed
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {project.testCases.map((tc) => {
                  const res = testResults.find((r) => r.id === tc.id);
                  return (
                    <div
                      key={tc.id}
                      className={`p-2.5 rounded-lg border text-xs ${
                        !res
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : res.pass
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1.5">
                        {res ? (
                          res.pass ? (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-rose-600 shrink-0" />
                          )
                        ) : null}
                        <span>{tc.label}</span>
                      </div>
                      {res && res.detail && (
                        <div className="text-[11px] font-mono mt-0.5 opacity-85">{res.detail}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Common Mistakes, Optional Collapsed Hints & Final Evaluation Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-rose-800">
              Common Mistakes to Avoid
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside leading-relaxed">
              {project.commonMistakes.map((m, idx) => (
                <li key={idx}>{m}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
            <button
              type="button"
              onClick={() => setHintsOpen((o) => !o)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wide text-amber-900 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Lightbulb size={14} className="text-amber-600" />
                Optional Guided Hints ({revealedHints}/3)
              </span>
              {hintsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {hintsOpen && (
              <div className="space-y-2 pt-1">
                {project.hints.slice(0, revealedHints).map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950"
                  >
                    <strong>Hint {i + 1}:</strong> {h}
                  </div>
                ))}
                {revealedHints < 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = revealedHints + 1;
                      setRevealedHints(next);
                      onSaveProjectProgress(project.id, (prev) => ({
                        projectId: project.id,
                        savedHtml: htmlCode,
                        savedCss: cssCode,
                        savedJs: jsCode,
                        completedMilestones: prev?.completedMilestones ?? [],
                        checkedChecklistIds: prev?.checkedChecklistIds ?? [],
                        passedTestIds: prev?.passedTestIds ?? [],
                        hintsRevealed: next,
                        completedAt: prev?.completedAt,
                        updatedAt: new Date().toISOString(),
                      }));
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-lg cursor-pointer"
                  >
                    Reveal Hint {revealedHints + 1} of 3
                  </button>
                )}
              </div>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              Final Evaluation Checklist ({checkedChecklistIds.length}/{project.evaluationChecklist.length})
            </h3>
            <div className="space-y-1.5">
              {project.evaluationChecklist.map((c) => {
                const checked = checkedChecklistIds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChecklist(c.id)}
                      className="mt-0.5 rounded border-slate-300 text-emerald-700"
                    />
                    <span className={checked ? 'text-emerald-900 font-medium' : ''}>{c.label}</span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
