import type { CodingChallengeItem } from '../../types/practiceBank';

export const CODING_CHALLENGES_PART_1: CodingChallengeItem[] = [
  // =========================================================================
  // SECTION 1: CORE FOUNDATIONS & LANGUAGE MECHANICS
  // =========================================================================
  {
    id: 'cc-t01-block-accumulator',
    topicId: 't01-variables-hoisting',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Block-Scoped Step Counter (No var)',
    scenario: 'Exam & Fundamentals: Block Scope + const/let discipline',
    taskPrompt:
      'Write `buildStepLog(limit)` that returns an array of functions `() => i` for `i` from `1` to `limit` (inclusive). Calling each function must return its own step number (`1, 2, ..., limit`). If `limit <= 0`, return `[]`.',
    restrictions: [
      {
        id: 'no-var',
        label: 'No var keyword',
        forbiddenPattern: '\\bvar\\b',
        violationMessage: 'Use `let` or `const` instead of `var` so each loop iteration has its own block binding.',
      },
    ],
    starterJs: `function buildStepLog(limit) {
  // Return an array of functions that each return their step number (1..limit)
  const fns = [];
  return fns;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Standard limit = 3',
        inputSummary: 'buildStepLog(3).map(fn => fn())',
        expectedSummary: '[1, 2, 3]',
        checkExpression: `{ actual: buildStepLog(3).map(fn => fn()), expected: [1, 2, 3] }`,
      },
      {
        id: 't2',
        label: 'Single step limit = 1',
        inputSummary: 'buildStepLog(1).map(fn => fn())',
        expectedSummary: '[1]',
        checkExpression: `{ actual: buildStepLog(1).map(fn => fn()), expected: [1] }`,
      },
      {
        id: 't3',
        label: 'Hidden: zero input returns empty array',
        hidden: true,
        inputSummary: 'buildStepLog(0)',
        expectedSummary: '[]',
        checkExpression: `{ actual: buildStepLog(0), expected: [] }`,
      },
      {
        id: 't4',
        label: 'Hidden: negative input returns empty array',
        hidden: true,
        inputSummary: 'buildStepLog(-5)',
        expectedSummary: '[]',
        checkExpression: `{ actual: buildStepLog(-5), expected: [] }`,
      },
    ],
    hints: [
      'Think about how `let` in a `for` loop header creates a fresh lexical binding for every iteration.',
      'Guard against `limit <= 0`, then loop `for (let i = 1; i <= limit; i++)` and push `() => i`.',
      'Pseudocode:\nconst fns = [];\nfor (let i = 1; i <= limit; i++) {\n  fns.push(() => i);\n}\nreturn fns;',
      'Each iteration creates a new `let i` environment record, so each arrow closure remembers its exact `i` rather than sharing one `var`.',
    ],
    solutionJs: `function buildStepLog(limit) {
  const fns = [];
  for (let i = 1; i <= limit; i++) {
    fns.push(() => i);
  }
  return fns;
}`,
    dryRun: 'limit=3 -> i=1 pushes ()=>1, i=2 pushes ()=>2, i=3 pushes ()=>3 -> calling all gives [1, 2, 3].',
    alternatives: [
      'Array.from({ length: Math.max(0, limit) }, (_, idx) => () => idx + 1)',
    ],
  },
  {
    id: 'dbg-t01-tdz-bug',
    topicId: 't01-variables-hoisting',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: TDZ & Shadowed Discount Rate',
    scenario: 'Checkout pricing helper crashes with ReferenceError',
    taskPrompt:
      'Fix `applyMemberDiscount(price, isVip)` so VIP users get 20% off (`price * 0.8`) and regular users get 5% off (`price * 0.95`). Return `0` for non-positive prices.',
    starterJs: `const rate = 0.05;

function applyMemberDiscount(price, isVip) {
  if (price <= 0) return 0;
  let finalRate = rate;
  if (isVip) {
    finalRate = 0.2;
  }
  const rate = 0.1; // <-- Buggy shadowing declaration causes TDZ crash!
  return Number((price * (1 - finalRate)).toFixed(2));
}`,
    bugDiagnosis: {
      question: 'Why does `let finalRate = rate` throw a ReferenceError before line 9 runs?',
      options: [
        '`const rate = 0.1` inside the function hoists to the function block and puts `rate` in the Temporal Dead Zone, shadowing the outer `rate`.',
        'JavaScript forbids reading outer `const` variables inside functions.',
        '`toFixed(2)` cannot be called inside a `Number(...)` constructor.',
      ],
      correctIndex: 0,
      explanation:
        'A local `const rate` shadows the outer `rate` for the ENTIRE function body. Accessing `rate` before its declaration hits the Temporal Dead Zone (TDZ).',
    },
    testCases: [
      {
        id: 't1',
        label: 'Regular user 5% discount',
        inputSummary: 'applyMemberDiscount(100, false)',
        expectedSummary: '95',
        checkExpression: `{ actual: applyMemberDiscount(100, false), expected: 95 }`,
      },
      {
        id: 't2',
        label: 'VIP user 20% discount',
        inputSummary: 'applyMemberDiscount(100, true)',
        expectedSummary: '80',
        checkExpression: `{ actual: applyMemberDiscount(100, true), expected: 80 }`,
      },
      {
        id: 't3',
        label: 'Hidden: zero price returns 0',
        hidden: true,
        inputSummary: 'applyMemberDiscount(0, true)',
        expectedSummary: '0',
        checkExpression: `{ actual: applyMemberDiscount(0, true), expected: 0 }`,
      },
      {
        id: 't4',
        label: 'Hidden: negative price returns 0',
        hidden: true,
        inputSummary: 'applyMemberDiscount(-40, false)',
        expectedSummary: '0',
        checkExpression: `{ actual: applyMemberDiscount(-40, false), expected: 0 }`,
      },
    ],
    hints: [
      'Look for a variable declared inside the function with the exact same name as an outer variable.',
      'Remove the unused shadowed `const rate = 0.1;` line so the function reads the outer `rate = 0.05`.',
      'Compute `const finalRate = isVip ? 0.2 : rate;` and return `Number((price * (1 - finalRate)).toFixed(2))`.',
      'Removing the shadowed `const rate` eliminates the TDZ error and keeps the default 0.05 rate cleanly accessible.',
    ],
    solutionJs: `const rate = 0.05;

function applyMemberDiscount(price, isVip) {
  if (price <= 0) return 0;
  const finalRate = isVip ? 0.2 : rate;
  return Number((price * (1 - finalRate)).toFixed(2));
}`,
    dryRun: 'applyMemberDiscount(100, false) -> finalRate=0.05 -> 95. applyMemberDiscount(100, true) -> finalRate=0.2 -> 80.',
  },
  {
    id: 'cc-t02-safe-number-parser',
    topicId: 't02-data-types-coercion',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'Strict Form Number Parser',
    scenario: 'Workspace: Sanitizing HTML input values without coercion bugs',
    taskPrompt:
      'Write `parseStrictNumber(value)` that converts valid numeric strings or finite numbers to a `number`, and returns `null` for `null`, `undefined`, booleans, empty/whitespace strings, `NaN`, or `Infinity`.',
    starterJs: `function parseStrictNumber(value) {
  // Return finite number or null (reject '', '   ', true, false, null, NaN, Infinity)
  return null;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Numeric string with spaces',
        inputSummary: `parseStrictNumber(' 42.5 ')`,
        expectedSummary: '42.5',
        checkExpression: `{ actual: parseStrictNumber(' 42.5 '), expected: 42.5 }`,
      },
      {
        id: 't2',
        label: 'Rejects empty string and boolean',
        inputSummary: `[parseStrictNumber(''), parseStrictNumber(true)]`,
        expectedSummary: '[null, null]',
        checkExpression: `{ actual: [parseStrictNumber(''), parseStrictNumber(true)], expected: [null, null] }`,
      },
      {
        id: 't3',
        label: 'Hidden: zero and negative numbers work',
        hidden: true,
        inputSummary: `[parseStrictNumber(0), parseStrictNumber('-15')]`,
        expectedSummary: '[0, -15]',
        checkExpression: `{ actual: [parseStrictNumber(0), parseStrictNumber('-15')], expected: [0, -15] }`,
      },
      {
        id: 't4',
        label: 'Hidden: rejects null, Infinity, NaN, whitespace',
        hidden: true,
        inputSummary: `[parseStrictNumber(null), parseStrictNumber(Infinity), parseStrictNumber('   ')]`,
        expectedSummary: '[null, null, null]',
        checkExpression: `{ actual: [parseStrictNumber(null), parseStrictNumber(Infinity), parseStrictNumber('   ')], expected: [null, null, null] }`,
      },
    ],
    hints: [
      'Remember `Number("")`, `Number("   ")`, `Number(null)`, and `Number(false)` all silently coerce to `0`!',
      'Check `typeof value` first: allow only `"number"` or `"string"`. For strings, check `value.trim() !== ""`.',
      'Pseudocode:\nif (typeof value === "number") return Number.isFinite(value) ? value : null;\nif (typeof value === "string" && value.trim() !== "") {\n  const n = Number(value);\n  return Number.isFinite(n) ? n : null;\n}\nreturn null;',
      'Explicitly guarding types before calling `Number()` prevents JavaScript coercion traps on empty strings, `null`, and booleans.',
    ],
    solutionJs: `function parseStrictNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}`,
    dryRun: `' 42.5 '.trim() !== '' -> Number(' 42.5 ') = 42.5 (finite) -> 42.5. '' -> trimmed is '' -> null.`,
  },
  {
    id: 'dbg-t02-string-concat',
    topicId: 't02-data-types-coercion',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Cart Total String Concatenation',
    scenario: 'Invoice sum outputs "01025" instead of 35',
    taskPrompt:
      'Fix `sumCartInputs(prices)` so string inputs like `["10", "25.5"]` are summed numerically and rounded to 2 decimals. Ignore non-numeric entries.',
    starterJs: `function sumCartInputs(prices) {
  let total = 0;
  for (const p of prices) {
    total = total + p; // Bug: '+' concatenates when p is a string!
  }
  return Number(total.toFixed(2));
}`,
    bugDiagnosis: {
      question: 'Why does `total + p` fail when `prices` contains numeric strings?',
      options: [
        'The `+` operator performs string concatenation whenever either operand is a string, turning `0 + "10"` into `"010"`.',
        '`for...of` loops convert numbers into strings automatically.',
        '`toFixed(2)` only works on integers.',
      ],
      correctIndex: 0,
      explanation:
        'In JavaScript, `+` is overloaded: if either side is a string, it converts the other side to a string and concatenates.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Sums numeric strings',
        inputSummary: `sumCartInputs(['10', '25.5'])`,
        expectedSummary: '35.5',
        checkExpression: `{ actual: sumCartInputs(['10', '25.5']), expected: 35.5 }`,
      },
      {
        id: 't2',
        label: 'Ignores invalid strings',
        inputSummary: `sumCartInputs(['12', 'abc', 8])`,
        expectedSummary: '20',
        checkExpression: `{ actual: sumCartInputs(['12', 'abc', 8]), expected: 20 }`,
      },
      {
        id: 't3',
        label: 'Hidden: empty array returns 0',
        hidden: true,
        inputSummary: 'sumCartInputs([])',
        expectedSummary: '0',
        checkExpression: `{ actual: sumCartInputs([]), expected: 0 }`,
      },
      {
        id: 't4',
        label: 'Hidden: negative refund values work',
        hidden: true,
        inputSummary: `sumCartInputs(['50', '-12.25'])`,
        expectedSummary: '37.75',
        checkExpression: `{ actual: sumCartInputs(['50', '-12.25']), expected: 37.75 }`,
      },
    ],
    hints: [
      'Convert each element explicitly with `Number(p)` before adding.',
      'Check `typeof p === "string" && p.trim() === ""` or `Number.isFinite(num)` to skip invalid items.',
      'Inside the loop: `const num = Number(p); if (Number.isFinite(num)) total += num;` (also guard blank strings/null).',
      'Explicit numeric conversion ensures `+` always performs arithmetic addition.',
    ],
    solutionJs: `function sumCartInputs(prices) {
  let total = 0;
  for (const p of prices) {
    if (p === null || p === '' || typeof p === 'boolean') continue;
    const num = Number(p);
    if (Number.isFinite(num)) total += num;
  }
  return Number(total.toFixed(2));
}`,
    dryRun: `['10', '25.5'] -> 0 + 10 + 25.5 = 35.5.`,
  },
  {
    id: 'cc-t03-config-coalesce',
    topicId: 't03-operators-equality',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'Safe Feature Config Defaults (`??`)',
    scenario: 'Workspace: Preserving `0` and `""` while defaulting `null`/`undefined`',
    taskPrompt:
      'Write `resolveSettings(input)` that returns `{ retries, prefix, enabled }` with defaults `retries: 3`, `prefix: "APP"`, `enabled: true` — using nullish coalescing (`??`) so explicit `0`, `""`, and `false` are preserved.',
    starterJs: `function resolveSettings(input = {}) {
  // Preserve 0, '', and false; only fall back on null or undefined
  return {
    retries: 3,
    prefix: 'APP',
    enabled: true,
  };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Preserves falsy zero, empty string, false',
        inputSummary: `resolveSettings({ retries: 0, prefix: '', enabled: false })`,
        expectedSummary: `{ retries: 0, prefix: '', enabled: false }`,
        checkExpression: `{ actual: resolveSettings({ retries: 0, prefix: '', enabled: false }), expected: { retries: 0, prefix: '', enabled: false } }`,
      },
      {
        id: 't2',
        label: 'Applies defaults on null/undefined',
        inputSummary: `resolveSettings({ retries: null, prefix: undefined })`,
        expectedSummary: `{ retries: 3, prefix: 'APP', enabled: true }`,
        checkExpression: `{ actual: resolveSettings({ retries: null, prefix: undefined }), expected: { retries: 3, prefix: 'APP', enabled: true } }`,
      },
      {
        id: 't3',
        label: 'Hidden: called with no argument',
        hidden: true,
        inputSummary: 'resolveSettings()',
        expectedSummary: `{ retries: 3, prefix: 'APP', enabled: true }`,
        checkExpression: `{ actual: resolveSettings(), expected: { retries: 3, prefix: 'APP', enabled: true } }`,
      },
      {
        id: 't4',
        label: 'Hidden: called with null input safely',
        hidden: true,
        inputSummary: 'resolveSettings(null)',
        expectedSummary: `{ retries: 3, prefix: 'APP', enabled: true }`,
        checkExpression: `{ actual: resolveSettings(null), expected: { retries: 3, prefix: 'APP', enabled: true } }`,
      },
    ],
    hints: [
      'Why does `input.retries || 3` fail when `input.retries` is `0`? Because `||` treats ALL falsy values as missing.',
      'Use `??` (nullish coalescing) and `?.` (optional chaining) so `null` input does not crash.',
      'return { retries: input?.retries ?? 3, prefix: input?.prefix ?? "APP", enabled: input?.enabled ?? true };',
      '`??` checks strictly for `null` or `undefined`, preserving valid falsy configurations like `0`, `""`, and `false`.',
    ],
    solutionJs: `function resolveSettings(input) {
  return {
    retries: input?.retries ?? 3,
    prefix: input?.prefix ?? 'APP',
    enabled: input?.enabled ?? true,
  };
}`,
    dryRun: `{ retries: 0, prefix: '', enabled: false } -> none are nullish -> all 3 preserved.`,
  },
  {
    id: 'dbg-t03-or-vs-nullish',
    topicId: 't03-operators-equality',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Volume 0 Resets to 50',
    scenario: 'Audio player cannot be muted because `||` overrides 0',
    taskPrompt:
      'Fix `getAudioVolume(savedVolume)` so `0` returns `0`, valid numbers between `0..100` are clamped, and only `null`/`undefined` default to `50`.',
    starterJs: `function getAudioVolume(savedVolume) {
  const vol = savedVolume || 50; // Bug: 0 is falsy!
  return Math.min(100, Math.max(0, vol));
}`,
    bugDiagnosis: {
      question: 'Why does `getAudioVolume(0)` return `50` instead of `0`?',
      options: [
        'Logical OR (`||`) treats `0` as falsy and falls back to `50`; `??` only falls back for `null` or `undefined`.',
        '`Math.max(0, vol)` converts `0` to `50`.',
        'JavaScript parameters cannot accept the number `0`.',
      ],
      correctIndex: 0,
      explanation: '`0` is falsy for `||`, so `0 || 50` evaluates to `50`. Switching to `??` keeps `0`.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Muted volume 0 stays 0',
        inputSummary: 'getAudioVolume(0)',
        expectedSummary: '0',
        checkExpression: `{ actual: getAudioVolume(0), expected: 0 }`,
      },
      {
        id: 't2',
        label: 'Undefined defaults to 50',
        inputSummary: 'getAudioVolume(undefined)',
        expectedSummary: '50',
        checkExpression: `{ actual: getAudioVolume(undefined), expected: 50 }`,
      },
      {
        id: 't3',
        label: 'Hidden: clamps negative to 0 and >100 to 100',
        hidden: true,
        inputSummary: '[getAudioVolume(-10), getAudioVolume(150)]',
        expectedSummary: '[0, 100]',
        checkExpression: `{ actual: [getAudioVolume(-10), getAudioVolume(150)], expected: [0, 100] }`,
      },
    ],
    hints: [
      'Check which operator is being used for the default value.',
      'Replace `||` with the nullish coalescing operator `??`.',
      'const vol = savedVolume ?? 50; return Math.min(100, Math.max(0, vol));',
      '`0 ?? 50` evaluates to `0`, while `null ?? 50` and `undefined ?? 50` evaluate to `50`.',
    ],
    solutionJs: `function getAudioVolume(savedVolume) {
  const vol = savedVolume ?? 50;
  return Math.min(100, Math.max(0, vol));
}`,
    dryRun: 'savedVolume=0 -> 0 ?? 50 = 0 -> clamped to 0.',
  },
  {
    id: 'cc-t04-second-largest',
    topicId: 't04-control-flow-loops',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Second Largest Unique Number (No Built-in sort)',
    scenario: 'Exam & Algorithms: Single-pass loop tracking state',
    taskPrompt:
      'Write `secondLargest(nums)` without using `.sort()`. Return the second largest UNIQUE number in `nums`, or `null` if fewer than 2 unique numbers exist.',
    restrictions: [
      {
        id: 'no-builtin-sort',
        label: 'No built-in .sort()',
        forbiddenPattern: '\\.sort\\s*\\(',
        violationMessage: 'Solve this in a single O(n) loop without calling `.sort()`.',
      },
    ],
    starterJs: `function secondLargest(nums) {
  // Single pass without .sort()
  return null;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Standard array',
        inputSummary: 'secondLargest([10, 5, 20, 8])',
        expectedSummary: '10',
        checkExpression: `{ actual: secondLargest([10, 5, 20, 8]), expected: 10 }`,
      },
      {
        id: 't2',
        label: 'Duplicate maximum values',
        inputSummary: 'secondLargest([20, 20, 15, 3])',
        expectedSummary: '15',
        checkExpression: `{ actual: secondLargest([20, 20, 15, 3]), expected: 15 }`,
      },
      {
        id: 't3',
        label: 'Hidden: all negative numbers',
        hidden: true,
        inputSummary: 'secondLargest([-10, -2, -5, -2])',
        expectedSummary: '-5',
        checkExpression: `{ actual: secondLargest([-10, -2, -5, -2]), expected: -5 }`,
      },
      {
        id: 't4',
        label: 'Hidden: all equal values or empty returns null',
        hidden: true,
        inputSummary: '[secondLargest([7, 7, 7]), secondLargest([])]',
        expectedSummary: '[null, null]',
        checkExpression: `{ actual: [secondLargest([7, 7, 7]), secondLargest([])], expected: [null, null] }`,
      },
    ],
    hints: [
      'Track two variables: `first = -Infinity` and `second = -Infinity`. Never initialize to `0` because of negative inputs!',
      'When `n > first`: shift `second = first; first = n`. Else if `n > second && n !== first`: set `second = n`.',
      'After the loop, return `second === -Infinity ? null : second`.',
      'Single-pass O(n) scan handles duplicates (`n !== first`) and negative numbers (`-Infinity`) cleanly.',
    ],
    solutionJs: `function secondLargest(nums) {
  let first = -Infinity;
  let second = -Infinity;
  for (const n of nums) {
    if (n > first) {
      second = first;
      first = n;
    } else if (n > second && n !== first) {
      second = n;
    }
  }
  return second === -Infinity ? null : second;
}`,
    dryRun: '[-10, -2, -5, -2]: -10 -> f=-10,s=-Inf; -2 -> f=-2,s=-10; -5 -> f=-2,s=-5; -2 -> skipped -> returns -5.',
  },
  {
    id: 'dbg-t04-off-by-one',
    topicId: 't04-control-flow-loops',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Off-By-One Sum & Missing Break',
    scenario: 'Loop reads past array end producing NaN',
    taskPrompt:
      'Fix `sumUntilNegative(nums)` so it sums numbers from index `0` until it encounters a negative number (stopping immediately without adding the negative number).',
    starterJs: `function sumUntilNegative(nums) {
  let total = 0;
  for (let i = 0; i <= nums.length; i++) {
    if (nums[i] < 0) {
      continue; // Bug 1: should stop loop; Bug 2: <= reads undefined!
    }
    total += nums[i];
  }
  return total;
}`,
    bugDiagnosis: {
      question: 'Which TWO bugs exist in `sumUntilNegative`?',
      options: [
        '`i <= nums.length` reads `nums[nums.length]` (`undefined` -> `NaN`), and `continue` skips instead of stopping with `break`.',
        '`total` must start at `1` and `for` loops cannot use `let`.',
        '`nums[i] < 0` is invalid syntax inside an `if` statement.',
      ],
      correctIndex: 0,
      explanation:
        'Array indices go from `0` to `length - 1`, so `i < nums.length` is required; `break` exits immediately when a negative value appears.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Stops at first negative',
        inputSummary: 'sumUntilNegative([4, 6, -1, 100])',
        expectedSummary: '10',
        checkExpression: `{ actual: sumUntilNegative([4, 6, -1, 100]), expected: 10 }`,
      },
      {
        id: 't2',
        label: 'Sums full array when no negative',
        inputSummary: 'sumUntilNegative([2, 3, 5])',
        expectedSummary: '10',
        checkExpression: `{ actual: sumUntilNegative([2, 3, 5]), expected: 10 }`,
      },
      {
        id: 't3',
        label: 'Hidden: empty array and leading negative',
        hidden: true,
        inputSummary: '[sumUntilNegative([]), sumUntilNegative([-5, 10])]',
        expectedSummary: '[0, 0]',
        checkExpression: `{ actual: [sumUntilNegative([]), sumUntilNegative([-5, 10])], expected: [0, 0] }`,
      },
    ],
    hints: [
      'Check the loop upper bound (`<=` vs `<`).',
      'Replace `continue` with `break` so execution stops immediately on a negative number.',
      'for (let i = 0; i < nums.length; i++) { if (nums[i] < 0) break; total += nums[i]; }',
      'Fixing both the upper bound and loop exit statement removes `NaN` and stops before negative values.',
    ],
    solutionJs: `function sumUntilNegative(nums) {
  let total = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0) break;
    total += nums[i];
  }
  return total;
}`,
    dryRun: '[4, 6, -1, 100]: i=0 (+4=4), i=1 (+6=10), i=2 (-1 < 0 -> break) -> returns 10.',
  },

  // =========================================================================
  // SECTION 2: INBUILT STRING & ARRAY METHODS
  // =========================================================================
  {
    id: 'cc-t05a-vowel-counter',
    topicId: 't05a-string-foundations',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Case-Insensitive Vowel Counter',
    scenario: 'String indexing, immutability & character traversal',
    taskPrompt:
      'Write `countVowels(text)` that returns the count of vowels (`a, e, i, o, u`) regardless of case. Return `0` for empty strings.',
    starterJs: `function countVowels(text) {
  // Iterate characters and count vowels case-insensitively
  return 0;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Mixed case string',
        inputSummary: `countVowels('JavaScript Engine')`,
        expectedSummary: '6',
        checkExpression: `{ actual: countVowels('JavaScript Engine'), expected: 6 }`,
      },
      {
        id: 't2',
        label: 'No vowels',
        inputSummary: `countVowels('rhythm')`,
        expectedSummary: '0',
        checkExpression: `{ actual: countVowels('rhythm'), expected: 0 }`,
      },
      {
        id: 't3',
        label: 'Hidden: empty string and uppercase vowels',
        hidden: true,
        inputSummary: `[countVowels(''), countVowels('AEIOU')]`,
        expectedSummary: '[0, 5]',
        checkExpression: `{ actual: [countVowels(''), countVowels('AEIOU')], expected: [0, 5] }`,
      },
    ],
    hints: [
      'Normalize the string with `.toLowerCase()` or check against `"aeiouAEIOU"`.',
      'Loop through each character using `for (const ch of text.toLowerCase())` and check `vowels.includes(ch)`.',
      'let count = 0; for (const ch of text.toLowerCase()) { if ("aeiou".includes(ch)) count++; } return count;',
      'Strings are iterable with `for...of`, making character counting clean and O(n).',
    ],
    solutionJs: `function countVowels(text) {
  let count = 0;
  for (const ch of text.toLowerCase()) {
    if ('aeiou'.includes(ch)) count++;
  }
  return count;
}`,
    dryRun: `'AEIOU'.toLowerCase() -> 'aeiou' -> all 5 match -> 5.`,
  },
  {
    id: 'dbg-t05a-string-immutable',
    topicId: 't05a-string-foundations',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Mutating String Index Directly',
    scenario: 'Masking sensitive characters fails silently in strict mode or crashes',
    taskPrompt:
      'Fix `capitalizeFirst(word)` so `"javascript"` becomes `"Javascript"` and `""` returns `""`.',
    starterJs: `function capitalizeFirst(word) {
  if (!word) return '';
  word[0] = word[0].toUpperCase(); // Bug: strings are immutable!
  return word;
}`,
    bugDiagnosis: {
      question: 'Why does `word[0] = word[0].toUpperCase()` fail in strict mode?',
      options: [
        'Strings are immutable primitives — assigning to `word[0]` throws a TypeError in strict mode (or fails silently in sloppy mode).',
        '`toUpperCase()` only works on entire sentences.',
        'String indices start at `1`, not `0`.',
      ],
      correctIndex: 0,
      explanation: 'Strings cannot be mutated in place; you must construct and return a new string.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Capitalizes first letter',
        inputSummary: `capitalizeFirst('javascript')`,
        expectedSummary: `'Javascript'`,
        checkExpression: `{ actual: capitalizeFirst('javascript'), expected: 'Javascript' }`,
      },
      {
        id: 't2',
        label: 'Single character',
        inputSummary: `capitalizeFirst('a')`,
        expectedSummary: `'A'`,
        checkExpression: `{ actual: capitalizeFirst('a'), expected: 'A' }`,
      },
      {
        id: 't3',
        label: 'Hidden: empty string',
        hidden: true,
        inputSummary: `capitalizeFirst('')`,
        expectedSummary: `''`,
        checkExpression: `{ actual: capitalizeFirst(''), expected: '' }`,
      },
    ],
    hints: [
      'Build a new string by combining the uppercase first character with the remainder.',
      'Use `word[0].toUpperCase() + word.slice(1)`.',
      'if (!word) return ""; return word[0].toUpperCase() + word.slice(1);',
      'Slicing from index 1 creates a new string without mutating the original primitive.',
    ],
    solutionJs: `function capitalizeFirst(word) {
  if (!word) return '';
  return word[0].toUpperCase() + word.slice(1);
}`,
    dryRun: `'a' -> 'A' + '' = 'A'. 'javascript' -> 'J' + 'avascript' = 'Javascript'.`,
  },
  {
    id: 'cc-t05-url-slug',
    topicId: 't05-string-methods',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'URL Slug Generator (slice / replaceAll / split)',
    scenario: 'Workspace: Generating clean SEO URLs for blog titles',
    taskPrompt:
      'Write `toSlug(title)` that trims whitespace, lowercases the text, collapses any consecutive spaces into a single hyphen `"-"`, and removes leading/trailing hyphens.',
    starterJs: `function toSlug(title) {
  // Example: "  Learn   JS  Strings! " -> "learn-js-strings!"
  return '';
}`,
    testCases: [
      {
        id: 't1',
        label: 'Trims and collapses spaces',
        inputSummary: `toSlug('  Learn   JS  Methods  ')`,
        expectedSummary: `'learn-js-methods'`,
        checkExpression: `{ actual: toSlug('  Learn   JS  Methods  '), expected: 'learn-js-methods' }`,
      },
      {
        id: 't2',
        label: 'Single word',
        inputSummary: `toSlug('React')`,
        expectedSummary: `'react'`,
        checkExpression: `{ actual: toSlug('React'), expected: 'react' }`,
      },
      {
        id: 't3',
        label: 'Hidden: empty or whitespace only',
        hidden: true,
        inputSummary: `toSlug('     ')`,
        expectedSummary: `''`,
        checkExpression: `{ actual: toSlug('     '), expected: '' }`,
      },
    ],
    hints: [
      'Normalize casing and outer spaces first with `.trim().toLowerCase()`.',
      'Split on whitespace (`split(" ").filter(Boolean)`) or replace runs of spaces, then `.join("-")`.',
      'return title.trim().toLowerCase().split(" ").filter(Boolean).join("-");',
      'Splitting and filtering out empty tokens handles multiple consecutive spaces cleanly.',
    ],
    solutionJs: `function toSlug(title) {
  return title
    .trim()
    .toLowerCase()
    .split(/\\s+/)
    .filter(Boolean)
    .join('-');
}`,
    dryRun: `'  Learn   JS  ' -> trim+lower 'learn   js' -> split ['learn','js'] -> 'learn-js'.`,
  },
  {
    id: 'dbg-t05-replace-first-only',
    topicId: 't05-string-methods',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: replace() Only Replaces First Match',
    scenario: 'CSV sanitizer leaves later commas unescaped',
    taskPrompt:
      'Fix `normalizePath(winPath)` so ALL backslashes `"\\\\"` become forward slashes `"/"`.',
    starterJs: `function normalizePath(winPath) {
  return winPath.replace('\\\\', '/'); // Bug: only replaces first backslash
}`,
    bugDiagnosis: {
      question: 'Why does `winPath.replace("\\\\", "/")` leave remaining backslashes unchanged?',
      options: [
        'With a string search argument, `.replace()` only replaces the FIRST occurrence; use `.replaceAll()` or a `/g` regex.',
        'Backslashes cannot be replaced in JavaScript strings.',
        '`.replace()` mutates the string in place and returns `undefined`.',
      ],
      correctIndex: 0,
      explanation: 'String `.replace(str, replacement)` stops after the first match. Use `.replaceAll()` for all matches.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Replaces all backslashes',
        inputSummary: `normalizePath('C:\\\\Users\\\\Dev\\\\app.js')`,
        expectedSummary: `'C:/Users/Dev/app.js'`,
        checkExpression: `{ actual: normalizePath('C:\\\\Users\\\\Dev\\\\app.js'), expected: 'C:/Users/Dev/app.js' }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty string and already normalized',
        hidden: true,
        inputSummary: `[normalizePath(''), normalizePath('a/b/c')]`,
        expectedSummary: `['', 'a/b/c']`,
        checkExpression: `{ actual: [normalizePath(''), normalizePath('a/b/c')], expected: ['', 'a/b/c'] }`,
      },
    ],
    hints: [
      'Check the difference between `.replace()` and `.replaceAll()`.',
      'Swap `.replace` for `.replaceAll`.',
      'return winPath.replaceAll("\\\\", "/");',
      '`.replaceAll()` replaces every matching substring cleanly without regex escaping pitfalls.',
    ],
    solutionJs: `function normalizePath(winPath) {
  return winPath.replaceAll('\\\\', '/');
}`,
    dryRun: `'a\\b\\c' -> 'a/b/c'.`,
  },
  {
    id: 'cc-t06a-reverse-manual',
    topicId: 't06a-array-foundations',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Reverse Array Without Mutating (No .reverse())',
    scenario: 'Exam: Fundamental loop indexing without built-in reverse',
    taskPrompt:
      'Write `reverseCopy(arr)` without calling `.reverse()`. Return a NEW reversed array and leave the original `arr` unmodified.',
    restrictions: [
      {
        id: 'no-reverse',
        label: 'No built-in .reverse()',
        forbiddenPattern: '\\.reverse\\s*\\(',
        violationMessage: 'Build the reversed array manually using a loop instead of `.reverse()`.',
      },
    ],
    starterJs: `function reverseCopy(arr) {
  // Return a new array in reverse order without using .reverse()
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Reverses numbers and keeps original intact',
        inputSummary: 'const a = [1,2,3]; [reverseCopy(a), a]',
        expectedSummary: '[[3,2,1], [1,2,3]]',
        checkExpression: `(() => { const a = [1, 2, 3]; const r = reverseCopy(a); return { actual: [r, a], expected: [[3, 2, 1], [1, 2, 3]] }; })()`,
      },
      {
        id: 't2',
        label: 'Hidden: empty and single-element arrays',
        hidden: true,
        inputSummary: '[reverseCopy([]), reverseCopy([9])]',
        expectedSummary: '[[], [9]]',
        checkExpression: `{ actual: [reverseCopy([]), reverseCopy([9])], expected: [[], [9]] }`,
      },
    ],
    hints: [
      'Loop backwards from `arr.length - 1` down to `0`.',
      'Create a fresh `const out = []` and push `arr[i]` on each iteration.',
      'const out = []; for (let i = arr.length - 1; i >= 0; i--) out.push(arr[i]); return out;',
      'Iterating backwards into a new array runs in O(n) time and preserves immutability.',
    ],
    solutionJs: `function reverseCopy(arr) {
  const out = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    out.push(arr[i]);
  }
  return out;
}`,
    dryRun: '[1,2,3]: i=2 pushes 3, i=1 pushes 2, i=0 pushes 1 -> [3,2,1], original stays [1,2,3].',
  },
  {
    id: 'dbg-t06-sort-numeric',
    topicId: 't06-array-basics-methods',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Lexicographical Array.sort() & Mutation',
    scenario: 'Price filter sorts `[100, 20, 5]` as `[100, 20, 5]` instead of `[5, 20, 100]`',
    taskPrompt:
      'Fix `sortPricesAsc(prices)` so it returns a NEW array sorted numerically ascending without mutating the input array.',
    starterJs: `function sortPricesAsc(prices) {
  return prices.sort(); // Bug 1: sorts as strings! Bug 2: mutates input!
}`,
    bugDiagnosis: {
      question: 'Why does `prices.sort()` put `100` before `20`?',
      options: [
        'Without a comparator `(a, b) => a - b`, `.sort()` converts elements to UTF-16 strings (`"100" < "20"`) and mutates the original array.',
        '`.sort()` always sorts descending by default.',
        'Arrays of numbers cannot be sorted with `.sort()`.',
      ],
      correctIndex: 0,
      explanation: 'Default `.sort()` compares strings lexicographically and sorts in place. Copy first (`[...prices]`) and pass `(a, b) => a - b`.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Sorts numerically ascending and preserves input',
        inputSummary: 'const p = [100, 20, 5]; [sortPricesAsc(p), p]',
        expectedSummary: '[[5, 20, 100], [100, 20, 5]]',
        checkExpression: `(() => { const p = [100, 20, 5]; const s = sortPricesAsc(p); return { actual: [s, p], expected: [[5, 20, 100], [100, 20, 5]] }; })()`,
      },
      {
        id: 't2',
        label: 'Hidden: handles negatives, duplicates, empty',
        hidden: true,
        inputSummary: '[sortPricesAsc([-5, 10, -20, 10]), sortPricesAsc([])]',
        expectedSummary: '[[-20, -5, 10, 10], []]',
        checkExpression: `{ actual: [sortPricesAsc([-5, 10, -20, 10]), sortPricesAsc([])], expected: [[-20, -5, 10, 10], []] }`,
      },
    ],
    hints: [
      'Copy the array first with `[...prices]` or `prices.slice()` so the input is not mutated.',
      'Pass a numeric comparator `(a, b) => a - b` to `.sort(...)`.',
      'return [...prices].sort((a, b) => a - b);',
      'If `a - b < 0`, `a` comes first; copying avoids mutating caller state.',
    ],
    solutionJs: `function sortPricesAsc(prices) {
  return [...prices].sort((a, b) => a - b);
}`,
    dryRun: '[100, 20, 5] copied -> comparator places 5, 20, 100 -> input stays [100, 20, 5].',
  },
  {
    id: 'cc-t07-map-format-users',
    topicId: 't07-foreach-map',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'Transform API Users with map()',
    scenario: 'Workspace: Formatting raw API rows for a React table',
    taskPrompt:
      'Write `formatUserLabels(users)` using `.map()` to turn `[{ first: "Ada", last: "Lovelace", role: "admin" }]` into `["Ada Lovelace (ADMIN)"]`.',
    starterJs: `function formatUserLabels(users) {
  // Use .map() to return formatted strings
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Formats multiple users',
        inputSummary: `formatUserLabels([{ first: 'Ada', last: 'Lovelace', role: 'admin' }])`,
        expectedSummary: `['Ada Lovelace (ADMIN)']`,
        checkExpression: `{ actual: formatUserLabels([{ first: 'Ada', last: 'Lovelace', role: 'admin' }, { first: 'Alan', last: 'Turing', role: 'dev' }]), expected: ['Ada Lovelace (ADMIN)', 'Alan Turing (DEV)'] }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty array returns empty array',
        hidden: true,
        inputSummary: 'formatUserLabels([])',
        expectedSummary: '[]',
        checkExpression: `{ actual: formatUserLabels([]), expected: [] }`,
      },
    ],
    hints: [
      '`.map()` transforms each item 1-to-1 and returns a brand new array of the same length.',
      'Use template literals: `` `${u.first} ${u.last} (${u.role.toUpperCase()})` ``.',
      'return users.map((u) => `${u.first} ${u.last} (${u.role.toUpperCase()})`);',
      'Never use `.forEach()` when your goal is returning a transformed array — `.forEach()` always returns `undefined`.',
    ],
    solutionJs: `function formatUserLabels(users) {
  return users.map((u) => \`\${u.first} \${u.last} (\${u.role.toUpperCase()})\`);
}`,
    dryRun: 'Each object maps to one formatted string; empty array maps to [].',
  },
  {
    id: 'dbg-t07-foreach-returns-undefined',
    topicId: 't07-foreach-map',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Returning forEach() Instead of map()',
    scenario: 'Tax calculator returns `undefined` instead of taxed prices',
    taskPrompt:
      'Fix `addTax(prices, rate)` so it returns an array of prices increased by `rate` (e.g., `0.1` for 10%) rounded to 2 decimal places.',
    starterJs: `function addTax(prices, rate) {
  return prices.forEach((p) => Number((p * (1 + rate)).toFixed(2))); // Bug!
}`,
    bugDiagnosis: {
      question: 'Why does `addTax([100, 200], 0.1)` return `undefined`?',
      options: [
        '`.forEach()` always returns `undefined` regardless of what its callback returns; use `.map()` to build a new array.',
        'Arrow functions cannot return numbers inside `.forEach()`.',
        '`toFixed(2)` returns `undefined`.',
      ],
      correctIndex: 0,
      explanation: '`.forEach()` is strictly for side effects and always returns `undefined`. `.map()` collects each callback return value.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Applies 10% tax',
        inputSummary: 'addTax([100, 50], 0.1)',
        expectedSummary: '[110, 55]',
        checkExpression: `{ actual: addTax([100, 50], 0.1), expected: [110, 55] }`,
      },
      {
        id: 't2',
        label: 'Hidden: 0% tax and empty array',
        hidden: true,
        inputSummary: '[addTax([19.99], 0), addTax([], 0.2)]',
        expectedSummary: '[[19.99], []]',
        checkExpression: `{ actual: [addTax([19.99], 0), addTax([], 0.2)], expected: [[19.99], []] }`,
      },
    ],
    hints: [
      'Check what `.forEach()` returns.',
      'Replace `.forEach` with `.map`.',
      'return prices.map((p) => Number((p * (1 + rate)).toFixed(2)));',
      '`.map()` returns the new array of taxed numbers.',
    ],
    solutionJs: `function addTax(prices, rate) {
  return prices.map((p) => Number((p * (1 + rate)).toFixed(2)));
}`,
    dryRun: '[100, 50] with 0.1 -> [110, 55].',
  },
  {
    id: 'cc-t08-filter-find-inventory',
    topicId: 't08-filter-find-index',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'In-Stock Filter & SKU Lookup',
    scenario: 'Workspace: E-commerce catalog search',
    taskPrompt:
      'Write `findAvailableBySku(items, sku)` that returns the matching item if `item.sku === sku && item.stock > 0`, otherwise `null`. Also write `getLowStockSkus(items, threshold)` returning an array of SKUs where `item.stock > 0 && item.stock <= threshold`.',
    starterJs: `function findAvailableBySku(items, sku) {
  return null;
}

function getLowStockSkus(items, threshold) {
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Finds available item and rejects out-of-stock',
        inputSummary: 'findAvailableBySku(items, "A1") / "B2"',
        expectedSummary: 'item A1 / null',
        checkExpression: `(() => {
          const items = [{ sku: 'A1', stock: 5 }, { sku: 'B2', stock: 0 }, { sku: 'C3', stock: 2 }];
          return { actual: [findAvailableBySku(items, 'A1'), findAvailableBySku(items, 'B2')], expected: [{ sku: 'A1', stock: 5 }, null] };
        })()`,
      },
      {
        id: 't2',
        label: 'Filters low stock SKUs',
        inputSummary: 'getLowStockSkus(items, 3)',
        expectedSummary: `['C3']`,
        checkExpression: `(() => {
          const items = [{ sku: 'A1', stock: 5 }, { sku: 'B2', stock: 0 }, { sku: 'C3', stock: 2 }];
          return { actual: getLowStockSkus(items, 3), expected: ['C3'] };
        })()`,
      },
      {
        id: 't3',
        label: 'Hidden: empty items array',
        hidden: true,
        inputSummary: '[findAvailableBySku([], "X"), getLowStockSkus([], 5)]',
        expectedSummary: '[null, []]',
        checkExpression: `{ actual: [findAvailableBySku([], 'X'), getLowStockSkus([], 5)], expected: [null, []] }`,
      },
    ],
    hints: [
      '`.find()` returns the first matching element or `undefined` — convert `undefined` to `null` with `?? null`.',
      'Chain `.filter(...)` and `.map(item => item.sku)` for `getLowStockSkus`.',
      'find: `return items.find(i => i.sku === sku && i.stock > 0) ?? null;`',
      'Combining `.find()` for single lookups and `.filter().map()` for subsets keeps data pipelines expressive.',
    ],
    solutionJs: `function findAvailableBySku(items, sku) {
  return items.find((i) => i.sku === sku && i.stock > 0) ?? null;
}

function getLowStockSkus(items, threshold) {
  return items
    .filter((i) => i.stock > 0 && i.stock <= threshold)
    .map((i) => i.sku);
}`,
    dryRun: 'B2 has stock 0 so findAvailableBySku returns null; C3 has stock 2 <= 3 so low stock returns ["C3"].',
  },
  {
    id: 'cc-t09-reduce-group-totals',
    topicId: 't09-some-every-reduce',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Expense Totals by Category with reduce()',
    scenario: 'Workspace: Financial analytics dashboard aggregation',
    taskPrompt:
      'Write `sumByCategory(expenses)` using `.reduce()` to return an object mapping each `category` to its summed `amount`. Example: `[{ category: "food", amount: 12 }, { category: "food", amount: 8 }]` -> `{ food: 20 }`.',
    starterJs: `function sumByCategory(expenses) {
  // Use .reduce() with an initial {} accumulator
  return {};
}`,
    testCases: [
      {
        id: 't1',
        label: 'Groups and sums categories',
        inputSummary: 'sumByCategory([{ category: "food", amount: 12 }, { category: "travel", amount: 30 }, { category: "food", amount: 8 }])',
        expectedSummary: '{ food: 20, travel: 30 }',
        checkExpression: `{ actual: sumByCategory([{ category: 'food', amount: 12 }, { category: 'travel', amount: 30 }, { category: 'food', amount: 8 }]), expected: { food: 20, travel: 30 } }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty array returns {}',
        hidden: true,
        inputSummary: 'sumByCategory([])',
        expectedSummary: '{}',
        checkExpression: `{ actual: sumByCategory([]), expected: {} }`,
      },
      {
        id: 't3',
        label: 'Hidden: handles negative refund amounts',
        hidden: true,
        inputSummary: 'sumByCategory([{ category: "gear", amount: 50 }, { category: "gear", amount: -15 }])',
        expectedSummary: '{ gear: 35 }',
        checkExpression: `{ actual: sumByCategory([{ category: 'gear', amount: 50 }, { category: 'gear', amount: -15 }]), expected: { gear: 35 } }`,
      },
    ],
    hints: [
      'Always pass `{}` as the second argument (initial value) to `.reduce()`.',
      'Inside the callback: `acc[item.category] = (acc[item.category] ?? 0) + item.amount; return acc;`',
      'Don\'t forget `return acc;` at the end of the reducer callback!',
      'Providing `{}` prevents TypeError on empty arrays and initializes the lookup map cleanly.',
    ],
    solutionJs: `function sumByCategory(expenses) {
  return expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.amount;
    return acc;
  }, {});
}`,
    dryRun: 'acc starts {}, adds food: 12, travel: 30, updates food: 20 -> returns { food: 20, travel: 30 }.',
  },
  {
    id: 'dbg-t09-reduce-missing-init',
    topicId: 't09-some-every-reduce',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: reduce() Crashes on Empty Array & Forgets Return',
    scenario: 'Analytics chart crashes when a user has 0 transactions',
    taskPrompt:
      'Fix `totalScore(records)` so it sums `record.score` for any array including `[]` (returning `0`).',
    starterJs: `function totalScore(records) {
  return records.reduce((acc, r) => {
    acc + r.score; // Bug 1: no return! Bug 2: no initial value 0!
  });
}`,
    bugDiagnosis: {
      question: 'Why does `totalScore([{ score: 10 }])` return an object and `totalScore([])` throw a TypeError?',
      options: [
        'Omitting the initial value `0` makes `acc` the first OBJECT instead of a number (and crashes on `[]`), and missing `return` yields `undefined`.',
        '`.reduce()` cannot sum object properties.',
        'Arrow functions inside `.reduce()` automatically return the last expression even with `{}`.',
      ],
      correctIndex: 0,
      explanation: 'Always pass initial value `0` when reducing objects to a number, and return the new accumulator.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Sums scores',
        inputSummary: 'totalScore([{ score: 10 }, { score: 25 }])',
        expectedSummary: '35',
        checkExpression: `{ actual: totalScore([{ score: 10 }, { score: 25 }]), expected: 35 }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty array and single item',
        hidden: true,
        inputSummary: '[totalScore([]), totalScore([{ score: 7 }])]',
        expectedSummary: '[0, 7]',
        checkExpression: `{ actual: [totalScore([]), totalScore([{ score: 7 }])], expected: [0, 7] }`,
      },
    ],
    hints: [
      'Pass `0` as the second argument to `.reduce((acc, r) => ..., 0)`.',
      'Return `acc + r.score` from the callback.',
      'return records.reduce((acc, r) => acc + r.score, 0);',
      'Initial value `0` guarantees empty arrays return `0` and single-item arrays still extract `.score`.',
    ],
    solutionJs: `function totalScore(records) {
  return records.reduce((acc, r) => acc + r.score, 0);
}`,
    dryRun: '[] -> returns initial 0. [{score:7}] -> 0 + 7 = 7.',
  },

  // =========================================================================
  // SECTION 3: FUNCTIONS, CALLBACKS, SCOPE & RECURSION
  // =========================================================================
  {
    id: 'cc-t10-default-params',
    topicId: 't10-functions-defaults',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Paginated Slice Helper with Default Params',
    scenario: 'Workspace: Reusable pagination utility',
    taskPrompt:
      'Write `paginate(items, page = 1, pageSize = 5)` that returns the slice of items for the given 1-based `page`. If `page < 1` or `pageSize <= 0`, return `[]`.',
    starterJs: `function paginate(items, page = 1, pageSize = 5) {
  // Return the items for the requested 1-based page
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Default page 1, size 5',
        inputSummary: 'paginate([1,2,3,4,5,6,7])',
        expectedSummary: '[1,2,3,4,5]',
        checkExpression: `{ actual: paginate([1,2,3,4,5,6,7]), expected: [1,2,3,4,5] }`,
      },
      {
        id: 't2',
        label: 'Page 2 with size 2',
        inputSummary: 'paginate(["a","b","c","d","e"], 2, 2)',
        expectedSummary: '["c","d"]',
        checkExpression: `{ actual: paginate(['a','b','c','d','e'], 2, 2), expected: ['c','d'] }`,
      },
      {
        id: 't3',
        label: 'Hidden: invalid page or empty array',
        hidden: true,
        inputSummary: '[paginate([1,2], 0, 2), paginate([1,2], 1, 0), paginate([], 1, 5)]',
        expectedSummary: '[[], [], []]',
        checkExpression: `{ actual: [paginate([1,2], 0, 2), paginate([1,2], 1, 0), paginate([], 1, 5)], expected: [[], [], []] }`,
      },
    ],
    hints: [
      'Compute `const start = (page - 1) * pageSize;`.',
      'Guard `if (page < 1 || pageSize <= 0) return [];`.',
      'return items.slice(start, start + pageSize);',
      '`.slice()` safely handles out-of-range end indices and never mutates `items`.',
    ],
    solutionJs: `function paginate(items, page = 1, pageSize = 5) {
  if (page < 1 || pageSize <= 0) return [];
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}`,
    dryRun: 'page=2, size=2 -> start=2, end=4 -> ["c","d"].',
  },
  {
    id: 'dbg-t11-arrow-object-return',
    topicId: 't11-arrow-functions',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Arrow Function Returning Undefined Instead of Object',
    scenario: 'Implicit object return parsed as function block',
    taskPrompt:
      'Fix `makeUserRecords(names)` so `["Ada", "Lin"]` maps to `[{ id: 1, name: "Ada" }, { id: 2, name: "Lin" }]`.',
    starterJs: `const makeUserRecords = (names) =>
  names.map((name, idx) => { id: idx + 1, name }); // Bug: {} is a block!`,
    bugDiagnosis: {
      question: 'Why does `({ id: idx + 1, name })` require parentheses in an arrow function?',
      options: [
        'Without parentheses, `{ ... }` after `=>` is parsed as a function block body, not an object literal.',
        'Arrow functions cannot return objects at all.',
        'Object shorthand properties do not work inside `.map()`.',
      ],
      correctIndex: 0,
      explanation: 'Wrap implicit object returns in parentheses: `(name, idx) => ({ id: idx + 1, name })`.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Creates indexed user objects',
        inputSummary: `makeUserRecords(['Ada', 'Lin'])`,
        expectedSummary: `[{ id: 1, name: 'Ada' }, { id: 2, name: 'Lin' }]`,
        checkExpression: `{ actual: makeUserRecords(['Ada', 'Lin']), expected: [{ id: 1, name: 'Ada' }, { id: 2, name: 'Lin' }] }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty array',
        hidden: true,
        inputSummary: 'makeUserRecords([])',
        expectedSummary: '[]',
        checkExpression: `{ actual: makeUserRecords([]), expected: [] }`,
      },
    ],
    hints: [
      'Wrap the returned object literal in parentheses `({ ... })`.',
      'Or use an explicit `return { id: idx + 1, name };` inside the block.',
      'const makeUserRecords = (names) => names.map((name, idx) => ({ id: idx + 1, name }));',
      'Parentheses tell the JS parser to evaluate `{...}` as an expression (object literal).',
    ],
    solutionJs: `const makeUserRecords = (names) =>
  names.map((name, idx) => ({ id: idx + 1, name }));`,
    dryRun: `'Ada' (idx 0) -> { id: 1, name: 'Ada' }.`,
  },
  {
    id: 'cc-t12-custom-filter-hof',
    topicId: 't12-callbacks-hof',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'Implement Higher-Order `myFilter` (No Built-in .filter)',
    scenario: 'Exam & Interview: Understanding how callbacks power array HOFs',
    taskPrompt:
      'Write `myFilter(arr, predicate)` without calling `.filter()`. Invoke `predicate(element, index, arr)` for each item and return a new array of items where `predicate` returns truthy.',
    restrictions: [
      {
        id: 'no-builtin-filter',
        label: 'No built-in .filter()',
        forbiddenPattern: '\\.filter\\s*\\(',
        violationMessage: 'Implement the loop yourself instead of delegating to `Array.prototype.filter`.',
      },
    ],
    starterJs: `function myFilter(arr, predicate) {
  // Call predicate(arr[i], i, arr) and collect truthy matches
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Filters even numbers',
        inputSummary: 'myFilter([1,2,3,4,5,6], n => n % 2 === 0)',
        expectedSummary: '[2, 4, 6]',
        checkExpression: `{ actual: myFilter([1,2,3,4,5,6], n => n % 2 === 0), expected: [2, 4, 6] }`,
      },
      {
        id: 't2',
        label: 'Passes index to predicate',
        inputSummary: 'myFilter(["a","b","c","d"], (_, idx) => idx % 2 === 1)',
        expectedSummary: '["b", "d"]',
        checkExpression: `{ actual: myFilter(['a','b','c','d'], (_, idx) => idx % 2 === 1), expected: ['b', 'd'] }`,
      },
      {
        id: 't3',
        label: 'Hidden: empty array and never matches',
        hidden: true,
        inputSummary: '[myFilter([], () => true), myFilter([1,2], () => false)]',
        expectedSummary: '[[], []]',
        checkExpression: `{ actual: [myFilter([], () => true), myFilter([1,2], () => false)], expected: [[], []] }`,
      },
    ],
    hints: [
      'Create an empty `result = []` array and iterate with a standard `for (let i = 0; i < arr.length; i++)` loop.',
      'Check `if (predicate(arr[i], i, arr)) result.push(arr[i]);`.',
      'Return `result` after the loop finishes.',
      'A higher-order function accepts a callback (`predicate`) to separate iteration from selection logic.',
    ],
    solutionJs: `function myFilter(arr, predicate) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) {
      result.push(arr[i]);
    }
  }
  return result;
}`,
    dryRun: '[1,2,3,4] with n%2===0 -> pushes 2 and 4 -> returns [2, 4].',
  },
  {
    id: 'cc-t13-closure-rate-limiter',
    topicId: 't13-lexical-scope-closures',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Closure-Based Private Counter & Limit Guard',
    scenario: 'Workspace: Encapsulating private state without exposing mutable globals',
    taskPrompt:
      'Write `createLimitedCounter(maxCalls)` that returns `{ increment, getCount, reset }`. `increment()` increases the private count up to `maxCalls` and returns the new count (never exceeding `maxCalls`). `reset()` sets count back to `0`.',
    starterJs: `function createLimitedCounter(maxCalls) {
  // Keep count private inside closure
  return {
    increment() { return 0; },
    getCount() { return 0; },
    reset() {},
  };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Increments up to maxCalls and caps',
        inputSummary: 'c = createLimitedCounter(2); [c.increment(), c.increment(), c.increment()]',
        expectedSummary: '[1, 2, 2]',
        checkExpression: `(() => { const c = createLimitedCounter(2); return { actual: [c.increment(), c.increment(), c.increment()], expected: [1, 2, 2] }; })()`,
      },
      {
        id: 't2',
        label: 'Isolated instances + reset works',
        inputSummary: 'two independent counters + reset',
        expectedSummary: '[1, 0, 1]',
        checkExpression: `(() => { const a = createLimitedCounter(3); const b = createLimitedCounter(3); a.increment(); a.increment(); b.increment(); a.reset(); return { actual: [b.getCount(), a.getCount(), a.increment()], expected: [1, 0, 1] }; })()`,
      },
      {
        id: 't3',
        label: 'Hidden: maxCalls = 0 stays at 0',
        hidden: true,
        inputSummary: 'createLimitedCounter(0).increment()',
        expectedSummary: '0',
        checkExpression: `{ actual: createLimitedCounter(0).increment(), expected: 0 }`,
      },
    ],
    hints: [
      'Declare `let count = 0;` inside `createLimitedCounter` — outside callers cannot touch it directly.',
      'In `increment()`, check `if (count < maxCalls) count += 1; return count;`.',
      'Return `{ increment, getCount: () => count, reset: () => { count = 0; } }`.',
      'Each invocation of `createLimitedCounter` allocates a brand-new Lexical Environment, isolating instances.',
    ],
    solutionJs: `function createLimitedCounter(maxCalls) {
  let count = 0;
  return {
    increment() {
      if (count < maxCalls) count += 1;
      return count;
    },
    getCount() {
      return count;
    },
    reset() {
      count = 0;
    },
  };
}`,
    dryRun: 'maxCalls=2: inc->1, inc->2, inc->2 (capped), reset->0.',
  },
  {
    id: 'dbg-t13-closure-loop-var',
    topicId: 't13-lexical-scope-closures',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Classic Closure-in-Loop Trap',
    scenario: 'All button click handlers log the same last index',
    taskPrompt:
      'Fix `createLabelHandlers(labels)` so each returned function returns its own label string.',
    starterJs: `function createLabelHandlers(labels) {
  const handlers = [];
  for (var i = 0; i < labels.length; i++) {
    handlers.push(() => labels[i]); // Bug: var i is function-scoped!
  }
  return handlers;
}`,
    bugDiagnosis: {
      question: 'Why does every function in `handlers` return `undefined` after the loop finishes?',
      options: [
        '`var i` is shared across all iterations; after the loop finishes `i === labels.length`, so `labels[i]` is `undefined`.',
        'Arrow functions cannot access array elements by index.',
        '`handlers.push` overwrites earlier closures.',
      ],
      correctIndex: 0,
      explanation: 'Changing `var i` to `let i` gives each loop iteration its own block-scoped `i` binding.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Each handler returns its matching label',
        inputSummary: `createLabelHandlers(['Save', 'Edit', 'Delete']).map(f => f())`,
        expectedSummary: `['Save', 'Edit', 'Delete']`,
        checkExpression: `{ actual: createLabelHandlers(['Save', 'Edit', 'Delete']).map(f => f()), expected: ['Save', 'Edit', 'Delete'] }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty labels array',
        hidden: true,
        inputSummary: 'createLabelHandlers([])',
        expectedSummary: '[]',
        checkExpression: `{ actual: createLabelHandlers([]), expected: [] }`,
      },
    ],
    hints: [
      'Check how `i` is declared in the `for` loop.',
      'Replace `var i = 0` with `let i = 0`.',
      'for (let i = 0; i < labels.length; i++) { handlers.push(() => labels[i]); }',
      '`let` binds a fresh `i` per iteration so every closure captures its own index.',
    ],
    solutionJs: `function createLabelHandlers(labels) {
  const handlers = [];
  for (let i = 0; i < labels.length; i++) {
    handlers.push(() => labels[i]);
  }
  return handlers;
}`,
    dryRun: 'i=0 captures "Save", i=1 captures "Edit", i=2 captures "Delete".',
  },
  {
    id: 'cc-t13b-recursive-flatten',
    topicId: 't13b-recursion-call-stack',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'Recursive Deep Flatten (No Built-in .flat)',
    scenario: 'Exam & Interview: Recursion base case + recursive descent',
    taskPrompt:
      'Write a recursive function `deepFlatten(arr)` without calling `.flat()`. Flatten arbitrarily nested arrays into a single 1D array.',
    restrictions: [
      {
        id: 'no-flat',
        label: 'No built-in .flat()',
        forbiddenPattern: '\\.flat(Map)?\\s*\\(',
        violationMessage: 'Use recursion with `Array.isArray()` instead of `.flat()`.',
      },
    ],
    starterJs: `function deepFlatten(arr) {
  // Recursively flatten nested arrays without .flat()
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Nested 3 levels deep',
        inputSummary: 'deepFlatten([1, [2, [3, 4]], 5])',
        expectedSummary: '[1, 2, 3, 4, 5]',
        checkExpression: `{ actual: deepFlatten([1, [2, [3, 4]], 5]), expected: [1, 2, 3, 4, 5] }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty nested arrays and negatives',
        hidden: true,
        inputSummary: 'deepFlatten([[], [-1, [[], 0]], [2]])',
        expectedSummary: '[-1, 0, 2]',
        checkExpression: `{ actual: deepFlatten([[], [-1, [[], 0]], [2]]), expected: [-1, 0, 2] }`,
      },
    ],
    hints: [
      'Loop over each item: if `Array.isArray(item)` recurse on it; otherwise push `item` directly (base case).',
      'Collect results in `const out = []` and push `...deepFlatten(item)` for nested arrays.',
      'for (const item of arr) { if (Array.isArray(item)) out.push(...deepFlatten(item)); else out.push(item); }',
      'Every nested array shrinks nesting depth by 1 until reaching non-array primitives (base case).',
    ],
    solutionJs: `function deepFlatten(arr) {
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      out.push(...deepFlatten(item));
    } else {
      out.push(item);
    }
  }
  return out;
}`,
    dryRun: '[1, [2, [3]]] -> pushes 1 -> recurses [2,[3]] -> pushes 2 -> recurses [3] -> [1,2,3].',
  },
  {
    id: 'dbg-t13b-missing-base-case',
    topicId: 't13b-recursion-call-stack',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Stack Overflow on Negative Factorial',
    scenario: 'Recursion crashes with Maximum call stack size exceeded',
    taskPrompt:
      'Fix `safeFactorial(n)` so `n === 0` or `n === 1` returns `1`, valid positive integers return `n!`, and negative integers return `null` instead of overflowing the stack.',
    starterJs: `function safeFactorial(n) {
  if (n === 1) return 1; // Bug: misses n === 0 and negative n!
  return n * safeFactorial(n - 1);
}`,
    bugDiagnosis: {
      question: 'Why does `safeFactorial(0)` cause a RangeError: Maximum call stack size exceeded?',
      options: [
        'When `n` is `0` (or negative), `n === 1` is never true, so `n - 1` recurses forever (`0 -> -1 -> -2...`).',
        'JavaScript cannot multiply by `0`.',
        'Recursive functions cannot call themselves more than 5 times.',
      ],
      correctIndex: 0,
      explanation: 'Always guard invalid inputs (`n < 0`) and include the `n <= 1` base case before recursing.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Standard factorial 5!',
        inputSummary: 'safeFactorial(5)',
        expectedSummary: '120',
        checkExpression: `{ actual: safeFactorial(5), expected: 120 }`,
      },
      {
        id: 't2',
        label: 'Hidden: 0! is 1 and negative returns null',
        hidden: true,
        inputSummary: '[safeFactorial(0), safeFactorial(-3)]',
        expectedSummary: '[1, null]',
        checkExpression: `{ actual: [safeFactorial(0), safeFactorial(-3)], expected: [1, null] }`,
      },
    ],
    hints: [
      'Add a guard at the top: `if (n < 0) return null;`.',
      'Change the base case from `n === 1` to `n <= 1`.',
      'if (n < 0) return null; if (n <= 1) return 1; return n * safeFactorial(n - 1);',
      'Handling both `n < 0` and `n <= 1` guarantees every call terminates.',
    ],
    solutionJs: `function safeFactorial(n) {
  if (n < 0) return null;
  if (n <= 1) return 1;
  return n * safeFactorial(n - 1);
}`,
    dryRun: 'safeFactorial(0) -> 1; safeFactorial(-3) -> null; safeFactorial(5) -> 120.',
  },

  // =========================================================================
  // SECTION 4: OBJECTS, DESTRUCTURING & MODERN OPERATORS
  // =========================================================================
  {
    id: 'cc-t14-object-invert',
    topicId: 't14-object-notations-methods',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Invert Key-Value Map Using Object.entries()',
    scenario: 'Object manipulation with dynamic computed keys',
    taskPrompt:
      'Write `invertObject(obj)` that swaps keys and values (converting values to strings). Example: `{ a: 1, b: 2 }` -> `{ "1": "a", "2": "b" }`.',
    starterJs: `function invertObject(obj) {
  // Swap keys and values using Object.entries()
  return {};
}`,
    testCases: [
      {
        id: 't1',
        label: 'Inverts key-value pairs',
        inputSummary: `invertObject({ a: '1', b: '2' })`,
        expectedSummary: `{ '1': 'a', '2': 'b' }`,
        checkExpression: `{ actual: invertObject({ a: '1', b: '2' }), expected: { '1': 'a', '2': 'b' } }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty object returns {}',
        hidden: true,
        inputSummary: 'invertObject({})',
        expectedSummary: '{}',
        checkExpression: `{ actual: invertObject({}), expected: {} }`,
      },
    ],
    hints: [
      'Use `Object.entries(obj)` to iterate `[key, value]` tuples.',
      'Assign `inverted[String(value)] = key` on a new object.',
      'const out = {}; for (const [k, v] of Object.entries(obj)) out[String(v)] = k; return out;',
      '`Object.entries()` safely iterates only own enumerable properties.',
    ],
    solutionJs: `function invertObject(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[String(v)] = k;
  }
  return out;
}`,
    dryRun: '{ a: "1", b: "2" } -> out["1"] = "a", out["2"] = "b".',
  },
  {
    id: 'cc-t15-array-of-objects-top',
    topicId: 't15-array-of-objects',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Top Active Customer Summary',
    scenario: 'Workspace: CRM dashboard ranking active accounts',
    taskPrompt:
      'Write `getTopActiveNames(customers, minSpend)` that filters customers with `active === true && spend >= minSpend`, sorts them by `spend` descending (without mutating input), and returns their `name` strings.',
    starterJs: `function getTopActiveNames(customers, minSpend) {
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Filters active and sorts by spend descending',
        inputSummary: 'getTopActiveNames(customers, 100)',
        expectedSummary: `['Maya', 'Ravi']`,
        checkExpression: `(() => {
          const data = [
            { name: 'Ravi', active: true, spend: 150 },
            { name: 'Zoe', active: false, spend: 900 },
            { name: 'Maya', active: true, spend: 400 },
            { name: 'Leo', active: true, spend: 50 },
          ];
          return { actual: getTopActiveNames(data, 100), expected: ['Maya', 'Ravi'] };
        })()`,
      },
      {
        id: 't2',
        label: 'Hidden: empty input or no matches',
        hidden: true,
        inputSummary: 'getTopActiveNames([], 10)',
        expectedSummary: '[]',
        checkExpression: `{ actual: getTopActiveNames([], 10), expected: [] }`,
      },
    ],
    hints: [
      'Chain `.filter(...)`, `.sort((a, b) => b.spend - a.spend)`, and `.map(c => c.name)`.',
      'Because `.filter()` creates a new array, calling `.sort()` on its result does not mutate the original `customers` array.',
      'return customers.filter(c => c.active && c.spend >= minSpend).sort((a, b) => b.spend - a.spend).map(c => c.name);',
      'Declarative pipelines are the core pattern for React lists and Node API responses.',
    ],
    solutionJs: `function getTopActiveNames(customers, minSpend) {
  return customers
    .filter((c) => c.active && c.spend >= minSpend)
    .sort((a, b) => b.spend - a.spend)
    .map((c) => c.name);
}`,
    dryRun: 'Filters Zoe (inactive) and Leo (<100) -> sorts Maya(400), Ravi(150) -> ["Maya", "Ravi"].',
  },
  {
    id: 'cc-t16-safe-nested-extract',
    topicId: 't16-destructuring-optional',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'Safe Nested API Payload Reader',
    scenario: 'Workspace: Reading optional nested fields without TypeError',
    taskPrompt:
      'Write `getUserCity(response)` that safely extracts `response.data.user.address.city`, returning `"Unknown"` whenever any intermediate property is missing or nullish.',
    starterJs: `function getUserCity(response) {
  // Use optional chaining (?.) and nullish coalescing (??)
  return 'Unknown';
}`,
    testCases: [
      {
        id: 't1',
        label: 'Extracts present city',
        inputSummary: `getUserCity({ data: { user: { address: { city: 'Pune' } } } })`,
        expectedSummary: `'Pune'`,
        checkExpression: `{ actual: getUserCity({ data: { user: { address: { city: 'Pune' } } } }), expected: 'Pune' }`,
      },
      {
        id: 't2',
        label: 'Handles missing intermediate objects',
        inputSummary: `[getUserCity({ data: {} }), getUserCity(null)]`,
        expectedSummary: `['Unknown', 'Unknown']`,
        checkExpression: `{ actual: [getUserCity({ data: {} }), getUserCity(null)], expected: ['Unknown', 'Unknown'] }`,
      },
    ],
    hints: [
      'Chain `?.` at every nested property that might be `null` or `undefined`.',
      'Use `?? "Unknown"` at the end to provide the fallback.',
      'return response?.data?.user?.address?.city ?? "Unknown";',
      'Optional chaining short-circuits to `undefined` instead of throwing TypeError.',
    ],
    solutionJs: `function getUserCity(response) {
  return response?.data?.user?.address?.city ?? 'Unknown';
}`,
    dryRun: 'null -> undefined ?? "Unknown" -> "Unknown".',
  },
  {
    id: 'cc-t17-immutable-cart-update',
    topicId: 't17-rest-spread',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Immutable State Patch with Spread & Rest',
    scenario: 'Workspace: React/Redux-style immutable object updates',
    taskPrompt:
      'Write `omitSensitiveFields(user)` using object rest destructuring to return a new object WITHOUT `password` or `token`, and without mutating `user`.',
    starterJs: `function omitSensitiveFields(user) {
  // Use rest destructuring to omit password and token
  return {};
}`,
    testCases: [
      {
        id: 't1',
        label: 'Removes password & token without mutating input',
        inputSummary: `omitSensitiveFields({ id: 1, name: 'Asha', password: '123', token: 'xyz' })`,
        expectedSummary: `{ id: 1, name: 'Asha' }`,
        checkExpression: `(() => {
          const u = { id: 1, name: 'Asha', password: '123', token: 'xyz' };
          const safe = omitSensitiveFields(u);
          return { actual: [safe, 'password' in u], expected: [{ id: 1, name: 'Asha' }, true] };
        })()`,
      },
      {
        id: 't2',
        label: 'Hidden: works when password/token are absent',
        hidden: true,
        inputSummary: `omitSensitiveFields({ id: 2 })`,
        expectedSummary: `{ id: 2 }`,
        checkExpression: `{ actual: omitSensitiveFields({ id: 2 }), expected: { id: 2 } }`,
      },
    ],
    hints: [
      'Destructure the excluded properties and collect the rest with `...safeUser`.',
      'const { password, token, ...safeUser } = user;',
      'Return `safeUser` — it is a fresh shallow copy without those keys.',
      'Rest destructuring removes properties immutably without using `delete user.password`.',
    ],
    solutionJs: `function omitSensitiveFields(user) {
  const { password, token, ...safeUser } = user;
  void password;
  void token;
  return safeUser;
}`,
    dryRun: 'Extracts password & token, returns fresh { id: 1, name: "Asha" } while original keeps password.',
  },
  {
    id: 'dbg-t18-shallow-copy-mutation',
    topicId: 't18-reference-deep-clone',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Shallow Spread Mutates Nested Settings',
    scenario: 'Editing draft user preferences accidentally overwrites saved state',
    taskPrompt:
      'Fix `updateThemeImmutably(profile, nextTheme)` so it returns a new profile with `profile.prefs.theme = nextTheme` WITHOUT mutating the original `profile` or `profile.prefs`.',
    starterJs: `function updateThemeImmutably(profile, nextTheme) {
  const copy = { ...profile };
  copy.prefs.theme = nextTheme; // Bug: copy.prefs points to same heap object!
  return copy;
}`,
    bugDiagnosis: {
      question: 'Why did `copy.prefs.theme = nextTheme` mutate `profile.prefs.theme` even though `{ ...profile }` created a copy?',
      options: [
        'Object spread (`{ ...profile }`) only performs a SHALLOW copy — `copy.prefs` still references the exact same nested object in the heap.',
        'Spread does not copy properties whose names are 5 letters long.',
        '`nextTheme` forces pass-by-reference in JavaScript.',
      ],
      correctIndex: 0,
      explanation: 'Clone each nested level being modified (`prefs: { ...profile.prefs, theme: nextTheme }`) or use `structuredClone()`.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Updates nested theme without mutating original',
        inputSummary: `updateThemeImmutably({ name: 'Sam', prefs: { theme: 'light', lang: 'en' } }, 'dark')`,
        expectedSummary: 'new theme is dark, original stays light',
        checkExpression: `(() => {
          const orig = { name: 'Sam', prefs: { theme: 'light', lang: 'en' } };
          const updated = updateThemeImmutably(orig, 'dark');
          return { actual: [updated.prefs.theme, orig.prefs.theme, updated.prefs.lang], expected: ['dark', 'light', 'en'] };
        })()`,
      },
    ],
    hints: [
      'Spread BOTH the top-level object AND the nested `prefs` object.',
      'return { ...profile, prefs: { ...profile.prefs, theme: nextTheme } };',
      'Alternatively: `const copy = structuredClone(profile); copy.prefs.theme = nextTheme; return copy;`.',
      'Cloning the nested reference breaks the shared heap pointer.',
    ],
    solutionJs: `function updateThemeImmutably(profile, nextTheme) {
  return {
    ...profile,
    prefs: {
      ...profile.prefs,
      theme: nextTheme,
    },
  };
}`,
    dryRun: 'Original prefs remains { theme: "light", lang: "en" }, returned copy has { theme: "dark", lang: "en" }.',
  },
];
