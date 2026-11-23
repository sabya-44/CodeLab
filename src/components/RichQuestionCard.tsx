import { CheckCircle2, XCircle } from 'lucide-react';
import type { RichQuizQuestion } from '../types/practiceBank';

interface RichQuestionCardProps {
  question: RichQuizQuestion;
  indexLabel?: string;
  topicLabel?: string;
  selectedIndex: number | undefined;
  onSelectOption: (optionIndex: number) => void;
}

export function RichQuestionCard({
  question,
  indexLabel,
  topicLabel,
  selectedIndex,
  onSelectOption,
}: RichQuestionCardProps) {
  const answered = selectedIndex !== undefined;
  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {indexLabel && <span className="tabular-nums text-slate-800">{indexLabel}</span>}
          <span
            className={
              question.category === 'Output-based'
                ? 'text-sky-800'
                : question.category === 'Debugging'
                ? 'text-rose-700'
                : question.category === 'Scenario'
                ? 'text-emerald-800'
                : 'text-slate-700'
            }
          >
            {question.category}
          </span>
          <span>·</span>
          <span>{question.difficulty}</span>
          {topicLabel && (
            <>
              <span>·</span>
              <span className="text-slate-600">{topicLabel}</span>
            </>
          )}
        </div>
        {answered && (
          <span
            className={`inline-flex items-center gap-1 font-bold ${
              isCorrect ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {isCorrect ? 'Correct' : 'Incorrect'}
          </span>
        )}
      </div>

      <div className="text-sm font-semibold text-slate-900 leading-snug">{question.question}</div>

      {question.codeSnippet && (
        <pre className="p-3.5 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed">
          <code>{question.codeSnippet}</code>
        </pre>
      )}

      <div className="space-y-2">
        {question.options.map((opt, optIdx) => {
          const isSelected = selectedIndex === optIdx;
          const isRight = optIdx === question.correctIndex;
          let style = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:border-sky-500 hover:bg-white';
          if (answered) {
            if (isRight) {
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
              onClick={() => onSelectOption(optIdx)}
              className={`w-full text-left px-3.5 py-2.5 text-xs border rounded-lg transition-colors cursor-pointer flex items-start gap-2.5 ${style}`}
            >
              <span className="font-mono font-bold text-[11px] text-slate-400 shrink-0 mt-0.5">
                {String.fromCharCode(65 + optIdx)}.
              </span>
              <span className="leading-relaxed">{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="pt-2 space-y-2">
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-950 leading-relaxed">
            <span className="font-bold mr-1">
              Why {String.fromCharCode(65 + question.correctIndex)} is right:
            </span>
            {question.whyCorrect}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-800">Why the other options are wrong:</div>
            <ul className="space-y-1">
              {question.options.map((_, optIdx) => {
                if (optIdx === question.correctIndex) return null;
                const reason =
                  question.wrongOptionReasons[optIdx] ??
                  'This option does not match JavaScript runtime behavior for this case.';
                return (
                  <li key={optIdx} className="leading-relaxed">
                    <span className="font-mono font-bold text-slate-900 mr-1.5">
                      {String.fromCharCode(65 + optIdx)}:
                    </span>
                    <span>{reason}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
