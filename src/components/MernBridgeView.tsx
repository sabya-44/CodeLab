import { useState } from 'react';
import { ArrowRight, Layers, BookOpen } from 'lucide-react';
import { MERN_BRIDGE_LESSONS, MERN_CONCEPT_MATRIX } from '../data/mernBridge';
import { TOPICS_BY_ID } from '../data/topicsIndex';
import { RichQuestionCard } from './RichQuestionCard';

interface MernBridgeViewProps {
  onOpenTopic: (topicId: string) => void;
  onRecordRichQuizAnswer: (
    topicId: string,
    questionId: string,
    category: string,
    isCorrect: boolean
  ) => Promise<void>;
}

export function MernBridgeView({
  onOpenTopic,
  onRecordRichQuizAnswer,
}: MernBridgeViewProps) {
  const [subTab, setSubTab] = useState<'matrix' | 'lessons'>('matrix');
  const [selectedMappingId, setSelectedMappingId] = useState(MERN_CONCEPT_MATRIX[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState(MERN_BRIDGE_LESSONS[0].id);
  const [quizSelections, setQuizSelections] = useState<Record<string, number>>({});

  const activeMapping =
    MERN_CONCEPT_MATRIX.find((m) => m.id === selectedMappingId) ?? MERN_CONCEPT_MATRIX[0];
  const activeLesson =
    MERN_BRIDGE_LESSONS.find((l) => l.id === selectedLessonId) ?? MERN_BRIDGE_LESSONS[0];

  const linkedTopic = TOPICS_BY_ID[activeMapping.topicId];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-5">
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-sky-800 flex items-center gap-1.5">
            <Layers size={14} />
            JavaScript-to-MERN Career Bridge
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            How Core JavaScript Directly Powers React, Express &amp; MongoDB
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Stop memorizing frameworks in isolation. Trace every JavaScript concept directly to its
            real-world MERN production counterpart.
          </p>
        </div>

        <div className="flex items-center gap-2" role="tablist" aria-label="MERN Bridge sections">
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'matrix'}
            onClick={() => setSubTab('matrix')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              subTab === 'matrix'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            JS → MERN Mapping Matrix (9)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'lessons'}
            onClick={() => setSubTab('lessons')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
              subTab === 'lessons'
                ? 'bg-slate-900 text-white'
                : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <BookOpen size={14} />5 Deep Bridge Lessons
          </button>
        </div>
      </section>

      {subTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Interactive Mapping Table */}
          <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800">
              Select a JS Concept to Compare Side-by-Side
            </div>
            <div className="divide-y divide-slate-100">
              {MERN_CONCEPT_MATRIX.map((row) => {
                const active = row.id === activeMapping.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedMappingId(row.id)}
                    className={`w-full px-4 py-3 text-left transition-colors cursor-pointer ${
                      active ? 'bg-sky-50 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                      <span className="text-sky-800">{row.jsConcept}</span>
                      <span className="text-slate-500">{row.mernLayer}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{row.mernUsage}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Side-by-Side Code Comparison */}
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 self-start">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-sky-800">
                  {activeMapping.jsConcept} → {activeMapping.mernLayer}
                </div>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  {activeMapping.mernUsage}
                </h2>
              </div>
              {linkedTopic && (
                <button
                  type="button"
                  onClick={() => onOpenTopic(linkedTopic.id)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  Revise JS Topic #{String(linkedTopic.number).padStart(2, '0')}
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-3.5 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Core JavaScript
                </div>
                <pre className="p-3.5 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>{activeMapping.vanillaJsCode}</code>
                </pre>
              </div>

              <div className="border border-sky-200 rounded-lg overflow-hidden">
                <div className="px-3.5 py-2 bg-sky-50 border-b border-sky-200 text-xs font-bold text-sky-950">
                  MERN Production Pattern ({activeMapping.mernLayer})
                </div>
                <pre className="p-3.5 bg-slate-950 text-sky-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  <code>{activeMapping.mernCode}</code>
                </pre>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 leading-relaxed">
              <strong className="mr-1">Key Engineering Takeaway:</strong>
              {activeMapping.keyTakeaway}
            </div>
          </section>
        </div>
      )}

      {subTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden self-start">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800">
              MERN Bridge Modules (5 Lessons)
            </div>
            <div className="divide-y divide-slate-100">
              {MERN_BRIDGE_LESSONS.map((lesson) => {
                const active = lesson.id === activeLesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`w-full px-4 py-3 text-left transition-colors cursor-pointer ${
                      active ? 'bg-sky-50 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px] font-semibold text-sky-800">
                      Module 0{lesson.number} · {lesson.mernFocus}
                    </div>
                    <div className="text-xs font-bold mt-0.5">{lesson.title}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-5">
            <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div>
                <div className="text-xs font-semibold text-sky-800">
                  Bridge Module 0{activeLesson.number} · {activeLesson.mernFocus}
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900 mt-0.5">
                  {activeLesson.title}
                </h2>
                <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
                  {activeLesson.summary}
                </p>
              </div>

              <div className="space-y-2.5 text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-100">
                {activeLesson.explanation.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-800">
                    {activeLesson.jsVsMern.leftLabel}
                  </div>
                  <pre className="p-3.5 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                    <code>{activeLesson.jsVsMern.leftCode}</code>
                  </pre>
                </div>
                <div className="border border-sky-200 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 bg-sky-50 border-b border-sky-200 text-xs font-bold text-sky-950">
                    {activeLesson.jsVsMern.rightLabel}
                  </div>
                  <pre className="p-3.5 bg-slate-950 text-sky-100 font-mono text-xs overflow-x-auto leading-relaxed">
                    <code>{activeLesson.jsVsMern.rightCode}</code>
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-900">
                  Production Pitfall: {activeLesson.commonPitfall.label}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <pre className="p-3 bg-rose-50 border border-rose-200 rounded-lg font-mono text-xs text-rose-950 overflow-x-auto">
                    <code>{activeLesson.commonPitfall.avoid}</code>
                  </pre>
                  <pre className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg font-mono text-xs text-emerald-950 overflow-x-auto">
                    <code>{activeLesson.commonPitfall.prefer}</code>
                  </pre>
                </div>
              </div>
            </section>

            {/* Recall Check */}
            <div className="space-y-3">
              {activeLesson.quiz.map((q) => (
                <RichQuestionCard
                  key={q.id}
                  question={q}
                  indexLabel="MERN Check"
                  selectedIndex={quizSelections[q.id]}
                  onSelectOption={(optIdx) => {
                    setQuizSelections((prev) => ({ ...prev, [q.id]: optIdx }));
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
          </main>
        </div>
      )}
    </div>
  );
}
