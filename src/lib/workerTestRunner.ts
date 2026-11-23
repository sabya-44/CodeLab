import type {
  CodeRestriction,
  ExecutableTestCase,
  FeedbackTrack,
  PlaygroundRunResult,
  TestCaseExecutionResult,
} from '../types/practiceBank';

const DEFAULT_TIMEOUT_MS = 2500;

function stripCommentsAndStrings(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

export function checkCodeRestrictions(
  code: string,
  restrictions?: CodeRestriction[]
): string[] {
  if (!restrictions || restrictions.length === 0) return [];
  const cleaned = stripCommentsAndStrings(code);
  const violations: string[] = [];

  for (const rule of restrictions) {
    try {
      const regex = new RegExp(rule.forbiddenPattern, 'm');
      if (regex.test(cleaned)) {
        violations.push(`${rule.label}: ${rule.violationMessage}`);
      }
    } catch {
      // Ignore malformed restriction regex
    }
  }
  return violations;
}

function analyzeReadability(code: string): FeedbackTrack {
  const notes: string[] = [];
  const lines = code.split('\n').filter((l) => l.trim().length > 0);
  const stripped = stripCommentsAndStrings(code);

  if (/\bvar\s+/.test(stripped)) {
    notes.push('Avoid legacy `var` — prefer `const` by default and `let` only when reassigning.');
  }
  if (/[^=!]==[^=]/.test(stripped)) {
    notes.push('Detected loose equality (`==`); prefer strict equality (`===`) to avoid coercion bugs.');
  }

  let maxBraceDepth = 0;
  let depth = 0;
  for (const ch of stripped) {
    if (ch === '{') {
      depth += 1;
      if (depth > maxBraceDepth) maxBraceDepth = depth;
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1);
    }
  }
  if (maxBraceDepth >= 4) {
    notes.push(`Nesting depth reached ${maxBraceDepth} levels — consider early-return guard clauses or helper functions.`);
  }

  const longLines = lines.filter((l) => l.length > 100).length;
  if (longLines > 0) {
    notes.push(`${longLines} line(s) exceed 100 characters — wrapping long expressions improves scanability.`);
  }

  if (notes.length === 0) {
    return {
      status: 'strong',
      summary: 'Clean modern syntax, flat structure, and readable formatting.',
      notes: ['Uses modern `let`/`const` bindings with low nesting depth.'],
    };
  }

  return {
    status: notes.length === 1 ? 'good' : 'needs-work',
    summary: notes.length === 1 ? 'Readable overall with 1 style improvement.' : 'Several readability improvements available.',
    notes,
  };
}

function analyzeEfficiency(code: string, durationMs: number): FeedbackTrack {
  const notes: string[] = [];
  const stripped = stripCommentsAndStrings(code);

  // Detect nested loop or .find/.includes inside .map/.filter/for
  const hasNestedFor =
    /\bfor\s*\([\s\S]*?\{[\s\S]*?\bfor\s*\(/.test(stripped) ||
    /\.(map|filter|forEach)\s*\([\s\S]*?\.(find|includes|indexOf)\s*\(/.test(stripped);

  if (hasNestedFor) {
    notes.push('Nested loop or lookup inside iteration detected (`O(n²)`). For large inputs, pre-index with a `Map` or `Set` for `O(n)`.');
  }

  if (/JSON\.parse\s*\(\s*JSON\.stringify/.test(stripped)) {
    notes.push('`JSON.parse(JSON.stringify(...))` is slow and drops Dates/undefined; prefer `structuredClone()` when deep cloning.');
  }

  if (durationMs > 300) {
    notes.push(`Execution took ${durationMs}ms — check for redundant iterations or heavy work inside loops.`);
  }

  if (notes.length === 0) {
    return {
      status: 'strong',
      summary: `Fast execution (${durationMs}ms) with no obvious quadratic bottlenecks.`,
      notes: ['Linear or constant-time patterns detected.'],
    };
  }

  return {
    status: 'good',
    summary: 'Works within timeout, with optimization opportunities for larger datasets.',
    notes,
  };
}

function buildWorkerSource(learnerCode: string, testCases: ExecutableTestCase[]): string {
  const serializedTests = JSON.stringify(
    testCases.map((tc) => ({
      id: tc.id,
      label: tc.label,
      hidden: Boolean(tc.hidden),
      inputSummary: tc.inputSummary,
      expectedSummary: tc.expectedSummary,
      checkExpression: tc.checkExpression,
    }))
  );

  return `
    'use strict';
    const logs = [];
    function safeStringify(val) {
      if (val === undefined) return 'undefined';
      if (typeof val === 'number' && Number.isNaN(val)) return 'NaN';
      if (typeof val === 'function') return '[Function ' + (val.name || 'anonymous') + ']';
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }

    function deepEqual(a, b) {
      if (Object.is(a, b)) return true;
      if (typeof a !== typeof b || a === null || b === null) return false;
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
      }
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      if (typeof a === 'object') {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        for (const k of keysA) {
          if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
          if (!deepEqual(a[k], b[k])) return false;
        }
        return true;
      }
      return false;
    }

    ['log', 'warn', 'error', 'info'].forEach((level) => {
      console[level] = (...args) => {
        logs.push({
          level,
          message: args.map((a) => (typeof a === 'string' ? a : safeStringify(a))).join(' '),
        });
      };
    });

    const __tests = ${serializedTests};

    (async () => {
      const results = [];
      try {
        // Learner code runs inside isolated Web Worker scope (never main thread)
        ${learnerCode}

        for (const tc of __tests) {
          try {
            const evalResult = await eval('(' + tc.checkExpression + ')');
            const actual = evalResult && 'actual' in evalResult ? evalResult.actual : evalResult;
            const expected = evalResult && 'expected' in evalResult ? evalResult.expected : undefined;
            const passed =
              evalResult && typeof evalResult.pass === 'boolean'
                ? evalResult.pass
                : deepEqual(actual, expected);

            results.push({
              id: tc.id,
              label: tc.label,
              hidden: tc.hidden,
              passed: Boolean(passed),
              inputSummary: tc.inputSummary,
              expectedDisplay: expected !== undefined ? safeStringify(expected) : tc.expectedSummary,
              actualDisplay: safeStringify(actual),
            });
          } catch (testErr) {
            results.push({
              id: tc.id,
              label: tc.label,
              hidden: tc.hidden,
              passed: false,
              inputSummary: tc.inputSummary,
              expectedDisplay: tc.expectedSummary,
              actualDisplay: 'Error thrown',
              error: testErr && testErr.name ? testErr.name + ': ' + testErr.message : String(testErr),
            });
          }
        }

        self.postMessage({ ok: true, logs, results });
      } catch (err) {
        self.postMessage({
          ok: false,
          logs,
          runtimeError: err && err.name ? err.name + ': ' + err.message : String(err),
          results,
        });
      }
    })();
  `;
}

export function runSandboxedTests(params: {
  learnerCode: string;
  testCases: ExecutableTestCase[];
  restrictions?: CodeRestriction[];
  timeoutMs?: number;
}): Promise<PlaygroundRunResult> {
  const { learnerCode, testCases, restrictions, timeoutMs = DEFAULT_TIMEOUT_MS } = params;
  const startedAt = performance.now();
  const restrictionViolations = checkCodeRestrictions(learnerCode, restrictions);

  return new Promise((resolve) => {
    const workerCode = buildWorkerSource(learnerCode, testCases);
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    let finished = false;
    const cleanup = () => {
      if (!finished) {
        finished = true;
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      }
    };

    const timer = window.setTimeout(() => {
      if (finished) return;
      cleanup();
      const durationMs = Math.round(performance.now() - startedAt);
      resolve({
        timedOut: true,
        runtimeError: `Execution timed out after ${timeoutMs}ms. Check for an infinite loop or missing recursion base case.`,
        restrictionViolations,
        consoleLogs: [],
        testResults: testCases.map((tc) => ({
          id: tc.id,
          label: tc.label,
          hidden: Boolean(tc.hidden),
          passed: false,
          inputSummary: tc.inputSummary,
          expectedDisplay: tc.expectedSummary,
          actualDisplay: 'Timed out',
          error: 'Timeout exceeded',
        })),
        passedCount: 0,
        totalCount: testCases.length,
        allPassed: false,
        durationMs,
        feedback: {
          correctness: {
            status: 'needs-work',
            summary: 'Execution stopped by safety timeout (possible infinite loop).',
            notes: ['Check your loop termination condition (`i++`, `< length`) or recursion base case.'],
          },
          readability: analyzeReadability(learnerCode),
          efficiency: {
            status: 'needs-work',
            summary: 'Infinite or overly slow loop exceeded execution budget.',
            notes: ['Ensure every loop strictly moves toward its exit condition.'],
          },
        },
      });
    }, timeoutMs);

    worker.onmessage = (event) => {
      if (finished) return;
      window.clearTimeout(timer);
      cleanup();

      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const data = event.data as {
        ok: boolean;
        logs: Array<{ level: 'log' | 'warn' | 'error' | 'info'; message: string }>;
        runtimeError?: string;
        results: TestCaseExecutionResult[];
      };

      const results: TestCaseExecutionResult[] =
        data.results && data.results.length > 0
          ? data.results
          : testCases.map((tc) => ({
              id: tc.id,
              label: tc.label,
              hidden: Boolean(tc.hidden),
              passed: false,
              inputSummary: tc.inputSummary,
              expectedDisplay: tc.expectedSummary,
              actualDisplay: 'Not run (runtime error)',
              error: data.runtimeError,
            }));

      const passedCount = results.filter((r) => r.passed).length;
      const totalCount = results.length;
      const allPassed =
        !data.runtimeError &&
        restrictionViolations.length === 0 &&
        totalCount > 0 &&
        passedCount === totalCount;

      const hiddenFailed = results.filter((r) => r.hidden && !r.passed).length;
      const visibleFailed = results.filter((r) => !r.hidden && !r.passed).length;

      const correctness: FeedbackTrack = allPassed
        ? {
            status: 'strong',
            summary: `All ${totalCount}/${totalCount} tests passed (including hidden edge cases)!`,
            notes: ['Your logic handles standard cases and boundary/edge inputs accurately.'],
          }
        : {
            status: passedCount > 0 ? 'good' : 'needs-work',
            summary: data.runtimeError
              ? `Code crashed before tests completed: ${data.runtimeError}`
              : restrictionViolations.length > 0
              ? `Tests ran (${passedCount}/${totalCount}), but ${restrictionViolations.length} restriction rule(s) were violated.`
              : `${passedCount}/${totalCount} tests passed (${visibleFailed} visible, ${hiddenFailed} hidden edge case(s) failing).`,
            notes: [
              ...(data.runtimeError ? [`Fix the error first: ${data.runtimeError}`] : []),
              ...restrictionViolations,
              ...(hiddenFailed > 0
                ? ['Check hidden edge cases: empty inputs, zeros, negative numbers, duplicates, or equal values.']
                : []),
            ],
          };

      resolve({
        timedOut: false,
        runtimeError: data.runtimeError,
        restrictionViolations,
        consoleLogs: data.logs ?? [],
        testResults: results,
        passedCount,
        totalCount,
        allPassed,
        durationMs,
        feedback: {
          correctness,
          readability: analyzeReadability(learnerCode),
          efficiency: analyzeEfficiency(learnerCode, durationMs),
        },
      });
    };

    worker.onerror = (err) => {
      if (finished) return;
      window.clearTimeout(timer);
      cleanup();
      const durationMs = Math.max(1, Math.round(performance.now() - startedAt));
      const msg = err.message || 'SyntaxError: Unable to parse JavaScript code.';
      resolve({
        timedOut: false,
        runtimeError: msg,
        restrictionViolations,
        consoleLogs: [],
        testResults: testCases.map((tc) => ({
          id: tc.id,
          label: tc.label,
          hidden: Boolean(tc.hidden),
          passed: false,
          inputSummary: tc.inputSummary,
          expectedDisplay: tc.expectedSummary,
          actualDisplay: 'Syntax error',
          error: msg,
        })),
        passedCount: 0,
        totalCount: testCases.length,
        allPassed: false,
        durationMs,
        feedback: {
          correctness: {
            status: 'needs-work',
            summary: `Syntax error prevented execution: ${msg}`,
            notes: ['Check for missing brackets, parentheses, quotes, or typos.'],
          },
          readability: analyzeReadability(learnerCode),
          efficiency: {
            status: 'needs-work',
            summary: 'Could not evaluate efficiency until syntax error is resolved.',
            notes: [],
          },
        },
      });
    };
  });
}
