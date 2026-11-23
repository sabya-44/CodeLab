import type { JsTopic } from '../types/topic';

const BASE_CSS = `body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; color: #0f172a; }
.box { background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; max-width: 520px; }
h1 { font-size: 16px; margin: 0 0 10px; }
.row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
button { background: #0369a1; color: #fff; border: 0; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }
button:hover { background: #075985; }
input, select { padding: 7px 10px; border: 1px solid #94a3b8; border-radius: 6px; font-size: 13px; }
.out { margin-top: 10px; padding: 10px; background: #f1f5f9; border-radius: 6px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }`;

export const TOPICS_PHASE1_GAPS: JsTopic[] = [
  {
    id: 't13b-recursion-call-stack',
    number: 16,
    categoryId: 'cat-3-functions-scope',
    categoryTitle: '3. Functions, Callbacks & Scope',
    tier: 'Intermediate',
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t10-functions-defaults', 't13-lexical-scope-closures'],
    title: 'Recursion, Base Cases & The Call Stack',
    webDevUseCase: 'Nested Menus, Comment Threads, Folder Trees & Deep JSON Traversal',
    summary:
      'Solve self-similar problems by having a function call itself with a smaller input until a clear base case stops the call stack from overflowing.',
    revisionTldr:
      'Every recursive function needs TWO parts: (1) a Base Case that stops recursion, and (2) a Recursive Step that moves strictly closer to the base case. Missing the base case throws `RangeError: Maximum call stack size exceeded`.',
    learningObjectives: [
      'Identify the base case and recursive step in any recursive function.',
      'Trace how function frames push onto and unwind off the JavaScript Call Stack.',
      'Write recursive functions for nested arrays and tree-shaped web data (menus, folders, comments).',
    ],
    realWorldAnalogy:
      'Like opening nested Russian dolls (Matryoshka): you open one doll at a time (pushing onto the stack) until you hit the smallest solid doll (base case), then reassemble them back out in reverse order (unwinding).',
    explanation: [
      'Recursion occurs when a function calls itself to break a complex or arbitrarily nested problem into smaller identical sub-problems. Each call pushes a fresh **stack frame** (holding its own parameters and local variables) onto the JavaScript **Call Stack**.',
      'Without a reachable **Base Case** (stopping condition), frames pile up infinitely until the JS engine halts execution with `RangeError: Maximum call stack size exceeded` (a stack overflow).',
      'In real web development, loops work great for flat arrays, but recursion shines whenever nesting depth is unknown ahead of time—such as multi-level sidebar menus, nested Reddit-style comment replies, or folder/file explorers.',
    ],
    keyRules: [
      'Always write and test the Base Case FIRST at the top of the recursive function.',
      'Each recursive call MUST shrink the input toward the base case (e.g., `n - 1` or child nodes).',
      'Remember to `return` the recursive result—forgetting `return` causes `undefined` to bubble up.',
      'For very deep linear loops (10,000+ steps), prefer an iterative `for`/`while` loop to avoid hitting the browser call stack limit.',
    ],
    codeExample: `// 1. Classic Call-Stack Trace: Factorial
function factorial(n) {
  if (n <= 1) return 1;        // Base case stops recursion
  return n * factorial(n - 1); // Recursive step shrinks n
}
console.log('5! =', factorial(5)); // 5 * 4 * 3 * 2 * 1 = 120

// 2. Real Web Dev: Count all nested comments
const thread = {
  text: 'Great article!',
  replies: [
    { text: 'Agreed!', replies: [{ text: '+1', replies: [] }] },
    { text: 'Thanks!', replies: [] },
  ],
};

function countComments(node) {
  let total = 1; // Count current comment
  for (const reply of node.replies) {
    total += countComments(reply); // Recurse into arbitrary depth
  }
  return total;
}
console.log('Total comments:', countComments(thread)); // 4`,
    commonMistake: {
      label: 'Missing a base case or forgetting to return the recursive call',
      avoid: `function sumTo(n) {
  // BUG: No base case -> RangeError: Maximum call stack size exceeded!
  return n + sumTo(n - 1);
}`,
      prefer: `function sumTo(n) {
  if (n <= 0) return 0; // Base case stops negative/zero recursion
  return n + sumTo(n - 1);
}`,
    },
    goDeeper: [
      {
        title: 'Call Stack Memory & Iterative Alternatives',
        paragraphs: [
          'Browsers cap the JS call stack around ~10,000–15,000 frames (depending on V8/SpiderMonkey/JavaScriptCore). Recursive algorithms that branch (like naive Fibonacci `fib(n-1) + fib(n-2)`) explode to O(2^n) calls unless combined with memoization (see Topic: Pure Functions & Memoization).',
          'Any recursive traversal over trees can also be written iteratively with an explicit array stack (`const stack = [root]; while (stack.length) ...`) when depth might exceed thousands of levels.',
        ],
        codeExample: `// Explicit stack avoids stack overflow on ultra-deep trees
function countIterative(root) {
  const stack = [root];
  let total = 0;
  while (stack.length > 0) {
    const node = stack.pop();
    total += 1;
    for (const child of node.replies) stack.push(child);
  }
  return total;
}`,
      },
    ],
    practice: {
      logical: {
        title: 'Fix Infinite Recursion & Deep-Sum a Nested Array',
        scenario: 'Exam Question · Base Case Guard & Recursive Array Flattening',
        taskPrompt:
          'Fix `deepSum(items)` so it handles nested number arrays of arbitrary depth (e.g., `[1, [2, [3, 4]], 5] -> 15`). Right now it recurses endlessly when encountering a non-array and forgets to add plain numbers!',
        starterHtml: `<div class="box">
  <h1>Recursive Deep Array Sum</h1>
  <button id="btn-run" type="button">Compute Deep Sum</button>
  <div id="out" class="out">Click to run recursive sum</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function deepSum(items) {
  let total = 0;
  for (const item of items) {
    if (Array.isArray(item)) {
      // Recursive step: sum the nested array
      total += deepSum(item);
    } else {
      // BUG: Calling deepSum([item]) loops forever instead of adding the number!
      total += deepSum([item]);
    }
  }
  return total;
}

document.getElementById('btn-run').addEventListener('click', () => {
  const sample = [1, [2, [3, 4]], 5, []];
  const result = deepSum(sample);
  document.getElementById('out').textContent =
    'Input: ' + JSON.stringify(sample) + '\\nDeep Sum (expected 15): ' + result;
});`,
        solutionJs: `function deepSum(items) {
  let total = 0;
  for (const item of items) {
    if (Array.isArray(item)) {
      total += deepSum(item);
    } else {
      total += item;
    }
  }
  return total;
}

document.getElementById('btn-run').addEventListener('click', () => {
  const sample = [1, [2, [3, 4]], 5, []];
  const result = deepSum(sample);
  document.getElementById('out').textContent =
    'Input: ' + JSON.stringify(sample) + '\\nDeep Sum (expected 15): ' + result;
});`,
      },
      realLife: {
        title: 'Cloud Drive Folder Size Calculator (Tree Traversal)',
        scenario: 'Daily Life · Calculating Total MB Across Nested Project Folders',
        taskPrompt:
          'Complete `getFolderSizeMB(node)` so clicking Calculate sums every file inside `workspace` no matter how deeply nested the subfolders are (expected total: `145 MB`).',
        starterHtml: `<div class="box">
  <h1>Cloud Drive Folder Size</h1>
  <button id="btn-calc" type="button">Calculate Total Storage</button>
  <div id="out" class="out">Click to inspect nested folders</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const workspace = {
  name: 'portfolio-app',
  type: 'folder',
  children: [
    { name: 'index.html', type: 'file', sizeMB: 5 },
    {
      name: 'assets',
      type: 'folder',
      children: [
        { name: 'hero.png', type: 'file', sizeMB: 40 },
        {
          name: 'videos',
          type: 'folder',
          children: [{ name: 'demo.mp4', type: 'file', sizeMB: 85 }],
        },
      ],
    },
    { name: 'bundle.js', type: 'file', sizeMB: 15 },
  ],
};

function getFolderSizeMB(node) {
  // Base case: if node.type === 'file', return node.sizeMB
  if (node.type === 'file') {
    return node.sizeMB;
  }
  // BUG: Only checks top-level files and ignores nested subfolders!
  let total = 0;
  for (const child of node.children) {
    if (child.type === 'file') {
      total += child.sizeMB;
    }
  }
  return total;
}

document.getElementById('btn-calc').addEventListener('click', () => {
  const totalMB = getFolderSizeMB(workspace);
  document.getElementById('out').textContent =
    'Folder: ' + workspace.name + '\\nTotal Size (expected 145 MB): ' + totalMB + ' MB';
});`,
        solutionJs: `const workspace = {
  name: 'portfolio-app',
  type: 'folder',
  children: [
    { name: 'index.html', type: 'file', sizeMB: 5 },
    {
      name: 'assets',
      type: 'folder',
      children: [
        { name: 'hero.png', type: 'file', sizeMB: 40 },
        {
          name: 'videos',
          type: 'folder',
          children: [{ name: 'demo.mp4', type: 'file', sizeMB: 85 }],
        },
      ],
    },
    { name: 'bundle.js', type: 'file', sizeMB: 15 },
  ],
};

function getFolderSizeMB(node) {
  if (node.type === 'file') {
    return node.sizeMB;
  }
  let total = 0;
  for (const child of node.children) {
    total += getFolderSizeMB(child);
  }
  return total;
}

document.getElementById('btn-calc').addEventListener('click', () => {
  const totalMB = getFolderSizeMB(workspace);
  document.getElementById('out').textContent =
    'Folder: ' + workspace.name + '\\nTotal Size (expected 145 MB): ' + totalMB + ' MB';
});`,
      },
    },
    quiz: [
      {
        question: 'What happens if a recursive function lacks a reachable base case?',
        options: [
          'JavaScript automatically converts it into a `for` loop',
          'It throws `RangeError: Maximum call stack size exceeded`',
          'It returns `null` after 10 iterations',
        ],
        correctIndex: 1,
        explanation:
          'Each recursive invocation allocates a stack frame; without a base case, the call stack fills up and throws a `RangeError`.',
      },
      {
        question: 'Which web development problem is the most natural fit for recursion?',
        options: [
          'Adding 18% GST to a flat array of 10 prices',
          'Traversing a nested comment thread or folder tree of unknown depth',
          'Checking if a single string starts with "https://"',
        ],
        correctIndex: 1,
        explanation:
          'Recursion handles arbitrarily nested tree structures cleanly, whereas flat arrays are simpler with `map()` or a `for` loop.',
      },
    ],
  },
  {
    id: 't27b-debugging-devtools',
    number: 30,
    categoryId: 'cat-7-async-js',
    categoryTitle: '7. Error Handling & Asynchronous JavaScript',
    tier: 'Basic',
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t04-control-flow-loops', 't10-functions-defaults'],
    title: 'Debugging with DevTools, Console Methods & Reading Stack Traces',
    webDevUseCase: 'Hunting Production Bugs, Inspecting Runtime State & Decoding Error Messages',
    summary:
      'Stop guessing why code fails: use browser breakpoints, the `debugger` keyword, structured `console` methods, and stack-trace reading to isolate bugs in seconds.',
    revisionTldr:
      'Read error messages top-to-bottom: Error Type (`TypeError`, `ReferenceError`) -> exact message -> top stack frame (`file:line`). Use `debugger;`, `console.table()`, `console.group()`, and `console.trace()` to inspect state systematically.',
    learningObjectives: [
      'Distinguish `SyntaxError`, `ReferenceError`, `TypeError`, and `RangeError` at a glance.',
      'Use `debugger;`, breakpoints, and Step Over/Into/Out in browser DevTools.',
      'Inspect objects, timings, and call paths with `console.table()`, `console.group()`, `console.time()`, and `console.trace()`.',
    ],
    realWorldAnalogy:
      'Debugging without DevTools is like fixing a car engine in the dark by guessing; breakpoints and stack traces turn on a spotlight and let you freeze the engine frame-by-frame.',
    explanation: [
      'Every JavaScript developer spends as much time reading errors as writing code. An error message gives you three critical clues: the **Error Type** (`ReferenceError` = undeclared variable, `TypeError` = wrong type like reading `.name` on `undefined`, `SyntaxError` = invalid code grammar, `RangeError` = invalid numeric range or stack overflow), the **reason**, and the **Stack Trace** listing the exact function call chain that crashed.',
      'While `console.log()` is useful, power debugging uses **`console.table(arrayOfObjects)`** to view tabular records, **`console.group()`** to organize noisy loops, **`console.time()` / `console.timeEnd()`** to measure slow code, and **`console.trace()`** to see which function called the current one.',
      'For tricky state bugs, place a **breakpoint** in browser DevTools Sources panel (or type the `debugger;` statement in code). When DevTools is open, execution freezes on that line so you can inspect live scope variables and step line-by-line.',
    ],
    keyRules: [
      'Always read the FIRST error in the console first—later errors are often cascading side effects.',
      '`TypeError: Cannot read properties of undefined (reading "x")` means the expression BEFORE `.x` evaluated to `undefined`.',
      'Use `console.log({ price, tax, total })` (shorthand object) so labels print automatically alongside values.',
      'Remove leftover `debugger;` statements before committing code to production.',
    ],
    codeExample: `const orders = [
  { id: 101, item: 'Keyboard', total: 2400 },
  { id: 102, item: 'Mouse', total: 900 },
];

console.group('Checkout Diagnostics');
console.table(orders); // Neat tabular grid in DevTools
console.time('sum');
const revenue = orders.reduce((acc, o) => acc + o.total, 0);
console.timeEnd('sum');
console.log({ count: orders.length, revenue });
console.groupEnd();

// Pause execution right here whenever DevTools is open:
// debugger;`,
    commonMistake: {
      label: 'Logging raw unlabelled values or panicking instead of reading the error type',
      avoid: `console.log(a);
console.log(b);
// Console shows: undefined, 42 — which variable was which?`,
      prefer: `console.log({ userInput: a, parsedPrice: b });
// Prints clearly: { userInput: undefined, parsedPrice: 42 }`,
    },
    goDeeper: [
      {
        title: 'Conditional Breakpoints & Watch Expressions in DevTools',
        paragraphs: [
          'When debugging a loop of 500 items where only item #347 breaks, right-click the line number in Chrome/Firefox DevTools and choose "Add conditional breakpoint" with `i === 347` or `item.price < 0`. Execution skips the first 346 iterations automatically.',
          'Use "Pause on caught/uncaught exceptions" in the DevTools Sources panel to freeze execution at the exact moment an error is thrown—before the stack unwinds.',
        ],
      },
    ],
    practice: {
      logical: {
        title: 'Diagnose & Fix a 3-Error Chain (Reference, Type & Logic Bug)',
        scenario: 'Exam Question · Reading JS Error Types & Stack Traces',
        taskPrompt:
          'This snippet has three classic bugs: a `ReferenceError` (typo in variable name), a `TypeError` (reading `.toUpperCase()` on missing optional property), and an off-by-one loop (`<=` reads `undefined`). Use the console error output to fix all three so it prints `"ALICE, BOB, CHARLIE"`.',
        starterHtml: `<div class="box">
  <h1>3-Error Stack Trace Hunt</h1>
  <button id="btn-run" type="button">Run Diagnostic</button>
  <div id="out" class="out">Click Run and inspect Console Output</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const learners = [
  { name: 'alice' },
  { name: 'bob' },
  { name: 'charlie' },
];

function formatRoster(list) {
  const formatted = [];
  // BUG 1: i <= list.length reads list[3] (undefined -> TypeError!)
  for (let i = 0; i <= list.length; i++) {
    const person = list[i];
    // BUG 2: ReferenceError typo ('persn' instead of 'person')
    formatted.push(persn.name.toUpperCase());
  }
  return formatted.join(', ');
}

document.getElementById('btn-run').addEventListener('click', () => {
  const output = formatRoster(learners);
  console.log({ output });
  document.getElementById('out').textContent = 'Roster: ' + output;
});`,
        solutionJs: `const learners = [
  { name: 'alice' },
  { name: 'bob' },
  { name: 'charlie' },
];

function formatRoster(list) {
  const formatted = [];
  for (let i = 0; i < list.length; i++) {
    const person = list[i];
    formatted.push(person.name.toUpperCase());
  }
  return formatted.join(', ');
}

document.getElementById('btn-run').addEventListener('click', () => {
  const output = formatRoster(learners);
  console.log({ output });
  document.getElementById('out').textContent = 'Roster: ' + output;
});`,
      },
      realLife: {
        title: 'Debug a Broken E-Commerce Discount Calculator',
        scenario: 'Daily Life · Tracing Silent String-Concatenation & Discount Bugs',
        taskPrompt:
          'A customer with a ₹1000 cart and 10% coupon is being charged `"1000100"` or `NaN`! Add `console.log({ subtotal, discount, finalTotal })` to trace the bug and fix the string/number parsing and formula so 10% off ₹1000 outputs `₹900`.',
        starterHtml: `<div class="box">
  <h1>Checkout Debugger</h1>
  <div class="row">
    <input id="subtotal" type="text" value="1000" />
    <input id="percent" type="text" value="10" />
    <button id="btn-calc" type="button">Calculate</button>
  </div>
  <div id="out" class="out">Click Calculate to reproduce the bug</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `document.getElementById('btn-calc').addEventListener('click', () => {
  // BUG 1: Input .value is a string, not a number!
  const subtotal = document.getElementById('subtotal').value;
  const percent = document.getElementById('percent').value;

  const discount = (subtotal * percent) / 100;
  // BUG 2: Adding instead of subtracting (and string + number concatenates!)
  const finalTotal = subtotal + discount;

  console.log({ subtotal, percent, discount, finalTotal });
  document.getElementById('out').textContent =
    'Payable (expected ₹900): ₹' + finalTotal;
});`,
        solutionJs: `document.getElementById('btn-calc').addEventListener('click', () => {
  const subtotal = Number(document.getElementById('subtotal').value);
  const percent = Number(document.getElementById('percent').value);

  const discount = (subtotal * percent) / 100;
  const finalTotal = subtotal - discount;

  console.log({ subtotal, percent, discount, finalTotal });
  document.getElementById('out').textContent =
    'Payable: ₹' + finalTotal;
});`,
      },
    },
    quiz: [
      {
        question: 'You see `TypeError: Cannot read properties of undefined (reading "price")`. What caused it?',
        options: [
          'The variable `price` was never declared with `let` or `const`',
          'You tried to access `.price` on an object/value that evaluated to `undefined`',
          'There is a missing closing curly brace `}` in the file',
        ],
        correctIndex: 1,
        explanation:
          'A `TypeError` on property access means the receiver before `.price` was `undefined` (or `null`), whereas undeclared identifiers throw `ReferenceError` and bad syntax throws `SyntaxError`.',
      },
      {
        question: 'Which console method prints an array of user objects as a clean sortable grid in DevTools?',
        options: ['console.table(users)', 'console.grid(users)', 'console.trace(users)'],
        correctIndex: 0,
        explanation:
          '`console.table()` formats arrays and objects as an easy-to-scan table in browser DevTools.',
      },
    ],
  },
  {
    id: 't36b-testing-fundamentals',
    number: 41,
    categoryId: 'cat-8-modern-architecture',
    categoryTitle: '8. Modern Web Architecture & Browser APIs',
    tier: 'Intermediate',
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t10-functions-defaults', 't28-try-catch-finally', 't35-immutability-pure-functions'],
    title: 'Testing Fundamentals: Unit Tests, Edge Cases & Vitest/Jest Basics',
    webDevUseCase: 'Automated Regression Checks, CI Pipelines & Confident Refactoring',
    summary:
      'Write automated unit tests using the Arrange-Act-Assert pattern, design edge-case inputs (empty, negative, duplicates, boundaries), and understand Vitest/Jest test syntax.',
    revisionTldr:
      'A unit test calls one pure function with controlled input and asserts exact expected output (Arrange -> Act -> Assert). Always test happy paths PLUS edge cases: empty inputs, `0`, negative numbers, duplicates, and boundary values.',
    learningObjectives: [
      'Structure tests cleanly using the Arrange-Act-Assert (AAA) pattern.',
      'Design edge-case test cases (empty, zero, negative, duplicate, invalid inputs).',
      'Read and write standard Vitest / Jest `describe()`, `test()`, and `expect()` assertions.',
    ],
    realWorldAnalogy:
      'Unit tests are like an automated pre-flight checklist on an airplane: instead of manually tapping every gauge by hand before every flight, automated sensors verify every critical rule in milliseconds.',
    explanation: [
      'Clicking through your app manually after every code change is slow and misses edge cases. **Unit Testing** isolates small, pure functions (like tax calculators, form validators, or cart totals) and verifies them automatically in milliseconds.',
      'Modern JavaScript teams use **Vitest** or **Jest**, where tests follow the **Arrange-Act-Assert (AAA)** structure: **Arrange** sample inputs, **Act** by calling the function under test, and **Assert** that the actual return value matches the expected value (`expect(actual).toBe(expected)` or `.toEqual(...)` for objects/arrays).',
      'Strong engineers test more than the "happy path": they deliberately try to break their own code with **edge cases**—empty arrays `[]`, `0`, negative numbers, duplicate items, `null`/`undefined`, and boundary limits.',
    ],
    keyRules: [
      'Use `toBe()` for primitive equality (`===`) and `toEqual()` for deep object/array comparison in Vitest/Jest.',
      'Test behavior (inputs -> outputs), NOT private internal implementation details.',
      'Keep business logic in pure functions separate from DOM/API calls so it is effortless to unit test.',
      'Every bug found in production should get a regression test before you fix it so it never returns.',
    ],
    codeExample: `// Standard Vitest / Jest syntax (concept example)
// import { describe, test, expect } from 'vitest';

function calculateDiscount(price, percent) {
  if (price < 0 || percent < 0 || percent > 100) {
    throw new RangeError('Invalid price or discount percent');
  }
  return Math.round(price * (1 - percent / 100));
}

// Mini assertion runner (works directly in any browser console!)
function assertEqual(label, actual, expected) {
  const pass = actual === expected;
  console.log((pass ? 'PASS: ' : 'FAIL: ') + label, { actual, expected });
}

assertEqual('Happy path: 20% off 500', calculateDiscount(500, 20), 400);
assertEqual('Edge case: 0% discount', calculateDiscount(500, 0), 500);
assertEqual('Edge case: 100% discount', calculateDiscount(500, 100), 0);`,
    commonMistake: {
      label: 'Only testing one happy path and missing empty/boundary inputs',
      avoid: `function average(nums) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
// Looks fine for [10, 20] -> 15, but average([]) returns NaN!`,
      prefer: `function average(nums) {
  if (!Array.isArray(nums) || nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}`,
    },
    goDeeper: [
      {
        title: 'Unit vs Integration vs End-to-End (E2E) Tests',
        paragraphs: [
          'Unit tests verify a single function in isolation (fastest, run hundreds in <1s). Integration tests verify multiple modules working together (e.g., an Express route + database query or a React component + form submit). End-to-End tests (Playwright/Cypress) launch a real browser and verify complete user journeys like sign-in -> checkout.',
          'Follow the Testing Trophy: rely heavily on pure unit tests for complex logic, integration tests for UI/API boundaries, and a focused set of E2E tests for critical revenue paths.',
        ],
      },
    ],
    practice: {
      logical: {
        title: 'Catch Edge-Case Bugs in average() with Unit Tests',
        scenario: 'Exam Question · Boundary & Empty-Input Test Suite',
        taskPrompt:
          'Run the mini test suite below—2 edge-case tests FAIL (`[]` returns `NaN` and duplicate/negative inputs fail rounding). Fix `safeAverage(nums)` so all 4 tests pass (empty array returns `0`, rounds to 2 decimals).',
        starterHtml: `<div class="box">
  <h1>Mini Unit Test Runner</h1>
  <button id="btn-test" type="button">Run All Unit Tests</button>
  <div id="out" class="out">Click to run test suite</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function safeAverage(nums) {
  // BUG: Missing empty-array guard and rounding to 2 decimals!
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return sum / nums.length;
}

function runSuite() {
  const cases = [
    { name: 'Positive numbers', input: [10, 20, 30], expected: 20 },
    { name: 'Empty array edge case', input: [], expected: 0 },
    { name: 'Negative & zero values', input: [-5, 0, 5], expected: 0 },
    { name: 'Repeating decimal rounded', input: [1, 2], expected: 1.5 },
  ];
  return cases.map((tc) => {
    const actual = safeAverage(tc.input);
    const ok = Object.is(actual, tc.expected);
    return (ok ? 'PASS' : 'FAIL') + ' | ' + tc.name + ' (got ' + actual + ', expected ' + tc.expected + ')';
  });
}

document.getElementById('btn-test').addEventListener('click', () => {
  document.getElementById('out').textContent = runSuite().join('\\n');
});`,
        solutionJs: `function safeAverage(nums) {
  if (!Array.isArray(nums) || nums.length === 0) return 0;
  const sum = nums.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / nums.length) * 100) / 100;
}

function runSuite() {
  const cases = [
    { name: 'Positive numbers', input: [10, 20, 30], expected: 20 },
    { name: 'Empty array edge case', input: [], expected: 0 },
    { name: 'Negative & zero values', input: [-5, 0, 5], expected: 0 },
    { name: 'Repeating decimal rounded', input: [1, 2], expected: 1.5 },
  ];
  return cases.map((tc) => {
    const actual = safeAverage(tc.input);
    const ok = Object.is(actual, tc.expected);
    return (ok ? 'PASS' : 'FAIL') + ' | ' + tc.name + ' (got ' + actual + ', expected ' + tc.expected + ')';
  });
}

document.getElementById('btn-test').addEventListener('click', () => {
  document.getElementById('out').textContent = runSuite().join('\\n');
});`,
      },
      realLife: {
        title: 'Test & Fix a Promo Coupon Validator',
        scenario: 'Daily Life · Checkout Coupon Rules & Boundary Testing',
        taskPrompt:
          'Fix `applyCoupon(cartTotal, code)` so all 4 automated workspace tests pass: trim & uppercase the code (`" save10 "` works), require `cartTotal >= 500` (boundary inclusive!), and return the original total for unknown coupons.',
        starterHtml: `<div class="box">
  <h1>Coupon Validator Test Suite</h1>
  <button id="btn-test" type="button">Run Coupon Tests</button>
  <div id="out" class="out">Click to run tests</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function applyCoupon(cartTotal, code) {
  // BUG 1: Doesn't trim/uppercase code
  // BUG 2: Uses > 500 instead of >= 500 boundary!
  if (code === 'SAVE10' && cartTotal > 500) {
    return cartTotal - cartTotal * 0.1;
  }
  return cartTotal;
}

document.getElementById('btn-test').addEventListener('click', () => {
  const tests = [
    { label: 'Normal eligible order (1000, SAVE10)', actual: applyCoupon(1000, 'SAVE10'), expected: 900 },
    { label: 'Boundary exact ₹500', actual: applyCoupon(500, 'SAVE10'), expected: 450 },
    { label: 'Whitespace & lowercase (" save10 ")', actual: applyCoupon(800, ' save10 '), expected: 720 },
    { label: 'Below minimum (499)', actual: applyCoupon(499, 'SAVE10'), expected: 499 },
  ];
  document.getElementById('out').textContent = tests
    .map((t) => (t.actual === t.expected ? 'PASS' : 'FAIL') + ' · ' + t.label + ' -> ' + t.actual)
    .join('\\n');
});`,
        solutionJs: `function applyCoupon(cartTotal, code) {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (normalized === 'SAVE10' && cartTotal >= 500) {
    return cartTotal - cartTotal * 0.1;
  }
  return cartTotal;
}

document.getElementById('btn-test').addEventListener('click', () => {
  const tests = [
    { label: 'Normal eligible order (1000, SAVE10)', actual: applyCoupon(1000, 'SAVE10'), expected: 900 },
    { label: 'Boundary exact ₹500', actual: applyCoupon(500, 'SAVE10'), expected: 450 },
    { label: 'Whitespace & lowercase (" save10 ")', actual: applyCoupon(800, ' save10 '), expected: 720 },
    { label: 'Below minimum (499)', actual: applyCoupon(499, 'SAVE10'), expected: 499 },
  ];
  document.getElementById('out').textContent = tests
    .map((t) => (t.actual === t.expected ? 'PASS' : 'FAIL') + ' · ' + t.label + ' -> ' + t.actual)
    .join('\\n');
});`,
      },
    },
    quiz: [
      {
        question: 'In Vitest or Jest, why should you use `expect(arr).toEqual([1, 2])` instead of `toBe([1, 2])`?',
        options: [
          '`toBe()` compares object/array references (`===`), while `toEqual()` compares values deeply',
          '`toEqual()` is faster for numbers',
          '`toBe()` only works on strings',
        ],
        correctIndex: 0,
        explanation:
          'Two separate array literals `[1, 2]` live at different heap addresses, so `toBe` fails while `toEqual` checks deep structural equality.',
      },
      {
        question: 'What does the "AAA" pattern stand for in unit testing?',
        options: [
          'Async, Await, Abort',
          'Arrange, Act, Assert',
          'Analyze, Apply, Archive',
        ],
        correctIndex: 1,
        explanation:
          'Arrange sets up inputs, Act executes the unit under test, and Assert checks the expected outcome.',
      },
    ],
  },
  {
    id: 't36c-clean-code-organization',
    number: 42,
    categoryId: 'cat-8-modern-architecture',
    categoryTitle: '8. Modern Web Architecture & Browser APIs',
    tier: 'Intermediate',
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t12-callbacks-hof', 't16-destructuring-optional', 't33-es-modules'],
    title: 'Clean Code, Naming, Guard Clauses & Separation of Concerns',
    webDevUseCase: 'Maintainable Team Codebases, Code Reviews & Scalable Front-End Architecture',
    summary:
      'Write JavaScript that teammates can read effortlessly: use intent-revealing names, flatten deeply nested `if/else` blocks with guard clauses, and separate pure business logic from DOM code.',
    revisionTldr:
      'Code is read 10x more than it is written. Use descriptive names (`isEligibleForDiscount`, not `d`), extract magic numbers into named constants, return early with guard clauses, and keep DOM manipulation separate from calculations.',
    learningObjectives: [
      'Replace cryptic names and magic numbers with self-documenting identifiers.',
      'Flatten deeply nested conditionals using early-return guard clauses.',
      'Separate pure domain logic (calculations/validation) from DOM rendering and event wiring.',
    ],
    realWorldAnalogy:
      'Like a restaurant kitchen vs dining room: the chef cooks the dish (pure logic) while the waiter plates and serves it (DOM rendering)—mixing them together creates chaos.',
    explanation: [
      'Working code is only half the job—in real engineering teams, **readable, maintainable code** prevents bugs when features change months later. Start with **intent-revealing names**: booleans start with `is`/`has`/`can` (`hasActivePlan`), functions start with verbs (`calculateShippingFee`), and unexplained numbers (`0.18`, `86400000`) become named constants (`GST_RATE`, `MS_PER_DAY`).',
      'Deeply nested `if (...) { if (...) { if (...) { ... } } }` structures ("pyramids of doom") overload working memory. Flip invalid checks into **Guard Clauses** that `return` early at the top of the function, leaving the main happy path flat and crystal clear.',
      '**Separation of Concerns (SoC)** means a single function should not read DOM inputs, validate rules, compute totals, call `fetch()`, AND mutate HTML all in one 80-line block. Split pure computation helpers from UI rendering so you can test and reuse logic anywhere (including in React or Node.js).',
    ],
    keyRules: [
      'One function = one clear job (Single Responsibility Principle).',
      'Use early-return guard clauses to keep indentation depth at 1–2 levels.',
      'Never scatter magic numbers (`if (age >= 18 && qty > 5)`); give them descriptive `UPPER_SNAKE_CASE` constants.',
      'Separate data calculation (`computeCartSummary(items)`) from DOM rendering (`renderCart(summary)`).',
    ],
    codeExample: `const FREE_SHIPPING_MIN = 500;
const STANDARD_SHIPPING = 49;

// Pure business logic (zero DOM dependencies -> easy to test & reuse)
function getCheckoutSummary(user, cartItems) {
  if (!user) return { ok: false, error: 'Please sign in first' };
  if (!cartItems.length) return { ok: false, error: 'Your cart is empty' };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING;
  return { ok: true, subtotal, shipping, total: subtotal + shipping };
}

console.log(getCheckoutSummary({ name: 'Asha' }, [{ price: 300, qty: 2 }]));`,
    commonMistake: {
      label: 'Deeply nested pyramids of doom with cryptic single-letter variables',
      avoid: `function chk(u, c) {
  if (u) {
    if (u.a) {
      if (c > 500) {
        return c * 0.9;
      } else { return c; }
    } else { return 0; }
  } else { return 0; }
}`,
      prefer: `const MIN_DISCOUNT_ORDER = 500;
const MEMBER_DISCOUNT_MULTIPLIER = 0.9;

function computeMemberTotal(user, cartTotal) {
  if (!user || !user.isActive) return 0;
  if (cartTotal <= MIN_DISCOUNT_ORDER) return cartTotal;
  return cartTotal * MEMBER_DISCOUNT_MULTIPLIER;
}`,
    },
    goDeeper: [
      {
        title: 'When NOT to Over-Abstract (Rule of Three)',
        paragraphs: [
          'Clean code is NOT about splitting every 2 lines into 15 tiny files. Premature abstraction makes code harder to trace than simple duplication.',
          'Follow the "Rule of Three": tolerate small repetition twice; extract a shared reusable helper once you see the same pattern a third time and understand the real common interface.',
        ],
      },
    ],
    practice: {
      logical: {
        title: 'Flatten a 4-Level Pyramid of Doom with Guard Clauses',
        scenario: 'Exam Question · Refactoring Nested Conditionals Cleanly',
        taskPrompt:
          'Refactor `canPublishPost(user, post)` using flat early-return guard clauses (and fix the bug where banned users with verified emails were still allowed to publish!). All 4 test checks must show PASS.',
        starterHtml: `<div class="box">
  <h1>Guard Clause Refactoring</h1>
  <button id="btn-check" type="button">Verify Refactored Rules</button>
  <div id="out" class="out">Click to test publishing rules</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function canPublishPost(user, post) {
  // Refactor to flat guard clauses AND fix the banned-user bug!
  if (user) {
    if (user.isVerified) {
      if (post) {
        if (post.title && post.title.trim().length >= 5) {
          return { allowed: true, reason: 'Ready to publish' };
        }
      }
    }
  }
  return { allowed: false, reason: 'Invalid submission' };
}

document.getElementById('btn-check').addEventListener('click', () => {
  const checks = [
    ['Valid verified author', canPublishPost({ isVerified: true, isBanned: false }, { title: 'Clean JS' }).allowed === true],
    ['Banned user blocked', canPublishPost({ isVerified: true, isBanned: true }, { title: 'Clean JS' }).allowed === false],
    ['Short title rejected', canPublishPost({ isVerified: true, isBanned: false }, { title: 'Hi' }).allowed === false],
    ['Missing user rejected', canPublishPost(null, { title: 'Clean JS' }).allowed === false],
  ];
  document.getElementById('out').textContent = checks
    .map(([label, ok]) => (ok ? 'PASS' : 'FAIL') + ' · ' + label)
    .join('\\n');
});`,
        solutionJs: `const MIN_TITLE_LENGTH = 5;

function canPublishPost(user, post) {
  if (!user) return { allowed: false, reason: 'Sign in required' };
  if (user.isBanned) return { allowed: false, reason: 'Account suspended' };
  if (!user.isVerified) return { allowed: false, reason: 'Verify email first' };
  if (!post || !post.title || post.title.trim().length < MIN_TITLE_LENGTH) {
    return { allowed: false, reason: 'Title must be at least 5 characters' };
  }
  return { allowed: true, reason: 'Ready to publish' };
}

document.getElementById('btn-check').addEventListener('click', () => {
  const checks = [
    ['Valid verified author', canPublishPost({ isVerified: true, isBanned: false }, { title: 'Clean JS' }).allowed === true],
    ['Banned user blocked', canPublishPost({ isVerified: true, isBanned: true }, { title: 'Clean JS' }).allowed === false],
    ['Short title rejected', canPublishPost({ isVerified: true, isBanned: false }, { title: 'Hi' }).allowed === false],
    ['Missing user rejected', canPublishPost(null, { title: 'Clean JS' }).allowed === false],
  ];
  document.getElementById('out').textContent = checks
    .map(([label, ok]) => (ok ? 'PASS' : 'FAIL') + ' · ' + label)
    .join('\\n');
});`,
      },
      realLife: {
        title: 'Separate Pure Pricing Logic from DOM Rendering',
        scenario: 'Daily Life · Clean Architecture for a Subscription Calculator',
        taskPrompt:
          'Extract pure `calculatePlanBill(seats, isAnnual)` with named constants (`PRICE_PER_SEAT = 299`, `ANNUAL_DISCOUNT = 0.2`) so the UI handler simply reads inputs, calls the pure helper, and updates `#out`.',
        starterHtml: `<div class="box">
  <h1>Team Plan Calculator</h1>
  <div class="row">
    <input id="seats" type="number" value="4" min="1" />
    <label style="display:flex;align-items:center;gap:4px;font-size:13px;">
      <input id="annual" type="checkbox" checked /> Annual (20% off)
    </label>
    <button id="btn-calc" type="button">Update Bill</button>
  </div>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `// TODO: Define PRICE_PER_SEAT = 299, ANNUAL_DISCOUNT = 0.2
// and write a pure function calculatePlanBill(seats, isAnnual)
function calculatePlanBill(seats, isAnnual) {
  // Fix: currently ignores annual discount and returns 0!
  return 0;
}

function renderBill() {
  const seats = Math.max(1, Number(document.getElementById('seats').value) || 1);
  const isAnnual = document.getElementById('annual').checked;
  const bill = calculatePlanBill(seats, isAnnual);
  document.getElementById('out').textContent =
    seats + ' seat(s) · ' + (isAnnual ? 'Annual' : 'Monthly') + ' -> ₹' + bill + '/mo';
}

document.getElementById('btn-calc').addEventListener('click', renderBill);
renderBill();`,
        solutionJs: `const PRICE_PER_SEAT = 299;
const ANNUAL_DISCOUNT = 0.2;

function calculatePlanBill(seats, isAnnual) {
  const baseMonthly = seats * PRICE_PER_SEAT;
  if (!isAnnual) return baseMonthly;
  return Math.round(baseMonthly * (1 - ANNUAL_DISCOUNT));
}

function renderBill() {
  const seats = Math.max(1, Number(document.getElementById('seats').value) || 1);
  const isAnnual = document.getElementById('annual').checked;
  const bill = calculatePlanBill(seats, isAnnual);
  document.getElementById('out').textContent =
    seats + ' seat(s) · ' + (isAnnual ? 'Annual' : 'Monthly') + ' -> ₹' + bill + '/mo';
}

document.getElementById('btn-calc').addEventListener('click', renderBill);
renderBill();`,
      },
    },
    quiz: [
      {
        question: 'What is the main benefit of using Guard Clauses (early returns) at the top of a function?',
        options: [
          'They make JavaScript skip garbage collection',
          'They eliminate deeply nested `if/else` pyramids so invalid cases exit immediately and the main logic stays flat',
          'They convert asynchronous functions into synchronous ones',
        ],
        correctIndex: 1,
        explanation:
          'Guard clauses handle edge/invalid states up front and return early, reducing nesting and making the happy path effortless to read.',
      },
      {
        question: 'Why should calculation logic be separated from DOM `document.getElementById` calls?',
        options: [
          'Pure logic functions can be unit-tested, reused in React/Node, and refactored without touching UI markup',
          'Because browsers forbid arithmetic inside event listeners',
          'Because DOM elements cannot store strings',
        ],
        correctIndex: 0,
        explanation:
          'Separating pure domain logic from DOM presentation keeps code modular, reusable across frameworks, and easy to test.',
      },
    ],
  },
  {
    id: 't36d-performance-security-basics',
    number: 43,
    categoryId: 'cat-8-modern-architecture',
    categoryTitle: '8. Modern Web Architecture & Browser APIs',
    tier: 'Advanced',
    track: 'Deep-dive',
    importanceWeight: 2,
    prerequisites: [
      't13-lexical-scope-closures',
      't22-set-map-iterators',
      't23-dom-selection-xss',
      't26-regex-validation',
      't36-memory-performance',
    ],
    title: 'Performance (Big-O Intuition, Throttling) & Web Security Basics',
    webDevUseCase: 'Fast Large Lists, Smooth Scroll Listeners & Defending Against Untrusted Input',
    summary:
      'Build intuition for Big-O lookup speed (`O(1)` Map/Set vs `O(n²)` nested loops), implement `throttle()` vs `debounce()`, and apply client/server security boundaries beyond basic `textContent` escaping.',
    revisionTldr:
      'Avoid `O(n²)` nested `.find()` inside `.map()`—index once into a `Map` or `Set` for `O(1)` lookup! Use `throttle()` for continuous scroll/resize events (runs at fixed intervals) vs `debounce()` for typing. Never trust client-side validation alone.',
    learningObjectives: [
      'Recognize `O(1)`, `O(n)`, and `O(n²)` bottlenecks in everyday JavaScript array/object code.',
      'Explain and implement `throttle()` vs `debounce()` for high-frequency browser events.',
      'Apply defense-in-depth web security: output escaping, URL protocol allowlists, and server-side validation.',
    ],
    realWorldAnalogy:
      'Big-O lookup is the difference between flipping every page of a 1,000-page dictionary (`O(n)`) vs jumping straight to the tabbed index letter (`O(1)`).',
    explanation: [
      'Big-O notation describes how work grows as your dataset scales. Looking up a key in a `Map` or `Set` is **`O(1)`** (instant even at 100,000 items), scanning an array once is **`O(n)`**, and running `.find()` or `.includes()` inside a loop over another array is **`O(n²)`**—10,000 items × 10,000 items = 100,000,000 operations that freeze the browser tab!',
      'While **debounce** (Topic 15) waits until activity *stops* (ideal for search inputs), **throttle** guarantees a handler runs at most *once every N milliseconds* while activity continues (ideal for scroll progress bars, infinite scroll, and window resize).',
      'Security requires defense in depth: beyond avoiding `innerHTML` for XSS (Topic 25) and validating formats with RegExp (Topic 28), always validate URLs (`https:` / `http:` allowlist so `javascript:alert(1)` cannot slip into `<a href>`), never store secrets in frontend JS, and remember **client-side validation is for UX—real security enforcement MUST happen on the server**.',
    ],
    keyRules: [
      'Replace nested `.find()` / `.includes()` loops (`O(n²)`) with a pre-built `Map` or `Set` (`O(n)` total).',
      'Use `throttle(fn, 100)` for scroll/pointer tracking; use `debounce(fn, 300)` for search boxes.',
      'Sanitize dynamic `<a href>` URLs by checking `url.protocol === "https:" || url.protocol === "http:"` (blocks `javascript:` XSS!).',
      'Never trust client-only checks for prices, roles, or auth—attackers can edit any browser JS in DevTools.',
    ],
    codeExample: `// 1. O(n) Map Join instead of O(n^2) nested .find()
const users = [{ id: 1, name: 'Ananya' }, { id: 2, name: 'Rohan' }];
const orders = [{ id: 'A1', userId: 2 }, { id: 'A2', userId: 1 }];

const userById = new Map(users.map((u) => [u.id, u.name])); // O(n) once
const enriched = orders.map((o) => ({ ...o, buyer: userById.get(o.userId) })); // O(1) each!

// 2. Throttle: runs at most once per limitMs
function throttle(fn, limitMs) {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= limitMs) {
      lastRun = now;
      fn(...args);
    }
  };
}

// 3. Safe URL Protocol Allowlist (blocks "javascript:alert(1)")
function isSafeHttpUrl(raw) {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
console.log(enriched, isSafeHttpUrl('javascript:alert(1)'));`,
    commonMistake: {
      label: 'Running Array.find() inside Array.map() or trusting raw user URLs in href',
      avoid: `// O(n * m) slow join + XSS via javascript: URL!
const links = orders.map(o => users.find(u => u.id === o.userId));
anchor.href = userSubmittedWebsite; // "javascript:stealCookies()" runs!`,
      prefer: `const userMap = new Map(users.map(u => [u.id, u]));
const links = orders.map(o => userMap.get(o.userId));
if (isSafeHttpUrl(userSubmittedWebsite)) anchor.href = userSubmittedWebsite;`,
    },
    goDeeper: [
      {
        title: 'Batching DOM Writes with DocumentFragment & Avoiding Layout Thrashing',
        paragraphs: [
          'Reading layout metrics (`el.offsetHeight`) and writing styles (`el.style.width = ...`) alternately inside a loop forces the browser to recalculate page geometry on every iteration ("layout thrashing").',
          'Batch all DOM reads first, compute values in JS, and append multiple newly created nodes via a `DocumentFragment` so the browser triggers only one reflow.',
        ],
      },
    ],
    practice: {
      logical: {
        title: 'Optimize an O(n²) Lookup to O(n) Using a Map',
        scenario: 'Exam Question · Big-O Lookup Optimization & Operation Counter',
        taskPrompt:
          'The slow nested loop performs `2,500` comparisons for 50 orders × 50 products. Replace the inner search with a `Map` index so total lookups drop from `2500` to `<= 100` while returning the exact same matched list!',
        starterHtml: `<div class="box">
  <h1>Big-O Lookup Optimizer</h1>
  <button id="btn-bench" type="button">Run Lookup Benchmark</button>
  <div id="out" class="out">Click to compare O(n^2) vs O(n)</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const products = Array.from({ length: 50 }, (_, i) => ({
  sku: 'SKU-' + (i + 1),
  price: (i + 1) * 100,
}));
const orders = Array.from({ length: 50 }, (_, i) => ({
  orderId: 'ORD-' + (i + 1),
  sku: 'SKU-' + (50 - i),
}));

function matchOrdersFast(orderList, productList) {
  let ops = 0;
  // TODO: Replace this O(n^2) nested loop with a Map built in O(n)
  const matched = orderList.map((order) => {
    let found = null;
    for (const prod of productList) {
      ops += 1;
      if (prod.sku === order.sku) {
        found = prod;
        break;
      }
    }
    return { orderId: order.orderId, price: found ? found.price : 0 };
  });
  return { matched, ops };
}

document.getElementById('btn-bench').addEventListener('click', () => {
  const { matched, ops } = matchOrdersFast(orders, products);
  document.getElementById('out').textContent =
    'Matched orders: ' + matched.length +
    '\\nFirst order price (expected 5000): ₹' + matched[0].price +
    '\\nTotal operations (target <= 100): ' + ops;
});`,
        solutionJs: `const products = Array.from({ length: 50 }, (_, i) => ({
  sku: 'SKU-' + (i + 1),
  price: (i + 1) * 100,
}));
const orders = Array.from({ length: 50 }, (_, i) => ({
  orderId: 'ORD-' + (i + 1),
  sku: 'SKU-' + (50 - i),
}));

function matchOrdersFast(orderList, productList) {
  let ops = 0;
  const productMap = new Map();
  for (const prod of productList) {
    ops += 1;
    productMap.set(prod.sku, prod);
  }
  const matched = orderList.map((order) => {
    ops += 1;
    const found = productMap.get(order.sku);
    return { orderId: order.orderId, price: found ? found.price : 0 };
  });
  return { matched, ops };
}

document.getElementById('btn-bench').addEventListener('click', () => {
  const { matched, ops } = matchOrdersFast(orders, products);
  document.getElementById('out').textContent =
    'Matched orders: ' + matched.length +
    '\\nFirst order price (expected 5000): ₹' + matched[0].price +
    '\\nTotal operations (target <= 100): ' + ops;
});`,
      },
      realLife: {
        title: 'Throttled Event Tracker & Safe Profile URL Sanitizer',
        scenario: 'Daily Life · Rate-Limiting Click Spams & Blocking javascript: XSS URLs',
        taskPrompt:
          'Fix two production safeguards: (1) implement `throttle(fn, 500)` so rapid button clicks fire at most once every 500ms, and (2) fix `isSafeWebsite(url)` so `javascript:alert(1)` is BLOCKED while `https://example.com` is ALLOWED.',
        starterHtml: `<div class="box">
  <h1>Throttle + Safe URL Guard</h1>
  <div class="row">
    <button id="btn-ping" type="button">Rapid Click (Throttled 500ms)</button>
  </div>
  <div class="row">
    <input id="url-in" type="text" value="javascript:alert(1)" style="flex:1" />
    <button id="btn-url" type="button">Check URL</button>
  </div>
  <div id="out" class="out">Click either button to test</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function throttle(fn, limitMs) {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    // BUG 1: Missing time check -> runs on EVERY click!
    fn(...args);
  };
}

function isSafeWebsite(rawUrl) {
  // BUG 2: Accepts javascript: protocol! Parse with new URL() and allow only http:/https:
  return Boolean(rawUrl && rawUrl.trim().length > 0);
}

let rawClicks = 0;
let executed = 0;
const onThrottledPing = throttle(() => {
  executed += 1;
  document.getElementById('out').textContent =
    'Raw clicks: ' + rawClicks + ' | Throttled executions: ' + executed;
}, 500);

document.getElementById('btn-ping').addEventListener('click', () => {
  rawClicks += 1;
  onThrottledPing();
});

document.getElementById('btn-url').addEventListener('click', () => {
  const val = document.getElementById('url-in').value;
  document.getElementById('out').textContent =
    val + ' -> ' + (isSafeWebsite(val) ? 'ALLOWED (Safe HTTP/HTTPS)' : 'BLOCKED (Unsafe Protocol)');
});`,
        solutionJs: `function throttle(fn, limitMs) {
  let lastRun = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastRun >= limitMs) {
      lastRun = now;
      fn(...args);
    }
  };
}

function isSafeWebsite(rawUrl) {
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

let rawClicks = 0;
let executed = 0;
const onThrottledPing = throttle(() => {
  executed += 1;
  document.getElementById('out').textContent =
    'Raw clicks: ' + rawClicks + ' | Throttled executions: ' + executed;
}, 500);

document.getElementById('btn-ping').addEventListener('click', () => {
  rawClicks += 1;
  onThrottledPing();
});

document.getElementById('btn-url').addEventListener('click', () => {
  const val = document.getElementById('url-in').value;
  document.getElementById('out').textContent =
    val + ' -> ' + (isSafeWebsite(val) ? 'ALLOWED (Safe HTTP/HTTPS)' : 'BLOCKED (Unsafe Protocol)');
});`,
      },
    },
    quiz: [
      {
        question: 'When should you prefer `throttle()` over `debounce()`?',
        options: [
          'When tracking continuous scroll/resize progress where periodic updates are needed while the user keeps moving',
          'When waiting until a user finishes typing in a search bar before calling an API',
          'When parsing a JSON string once on page load',
        ],
        correctIndex: 0,
        explanation:
          '`throttle` guarantees regular execution at fixed intervals during continuous events; `debounce` delays execution until events pause.',
      },
      {
        question: 'Why is validating an `<a href>` with `new URL(str).protocol` important even if you avoid `innerHTML`?',
        options: [
          'Because `javascript:alert(1)` in an `href` attribute executes arbitrary JavaScript when clicked',
          'Because `https:` links do not work without `new URL()`',
          'Because `URL` compresses the string size',
        ],
        correctIndex: 0,
        explanation:
          'Allowlisting `http:` and `https:` prevents `javascript:` pseudo-protocol XSS attacks in user-supplied links.',
      },
    ],
  },
];
