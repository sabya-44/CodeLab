import React, { useRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  readOnly?: boolean;
  onRunShortcut?: () => void;
  ariaLabel: string;
}

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  onRunShortcut,
  ariaLabel,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const lineCount = Math.max(1, value.split('\n').length);

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRunShortcut?.();
      return;
    }

    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = value.slice(0, start) + '  ' + value.slice(end);
      onChange(updated);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      });
    }
  };

  return (
    <div className="relative flex flex-1 min-h-[280px] bg-slate-900 text-slate-100 overflow-hidden font-mono text-[13px] leading-[1.6]">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="w-11 shrink-0 py-3 pr-2.5 text-right select-none bg-slate-950/60 text-slate-500 border-r border-slate-800 overflow-hidden tabular-nums"
      >
        {Array.from({ length: lineCount }, (_, idx) => (
          <div key={idx}>{idx + 1}</div>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        aria-label={ariaLabel}
        className={`code-editor flex-1 w-full h-full py-3 px-3.5 bg-transparent text-slate-100 resize-none focus:outline-none overflow-auto whitespace-pre ${
          readOnly ? 'text-slate-400 cursor-default' : ''
        }`}
      />
    </div>
  );
}
