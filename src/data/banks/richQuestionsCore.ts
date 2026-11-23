import type { RichQuizQuestion } from '../../types/practiceBank';

/**
 * Hand-authored flagship questions across all 6 interview categories
 * (Conceptual, Output-based, Logical, Practical, Debugging, Scenario),
 * ensuring dedicated Output-Prediction coverage on EVERY hoisting, closure,
 * scope, reference, `this`, event loop, promise, and async/await topic,
 * with explicit `whyCorrect` + `wrongOptionReasons` for every distractor.
 */
export const RICH_QUESTIONS_CORE: RichQuizQuestion[] = [
  // ---- HOISTING & TDZ (t01) ----
  {
    id: 'rq-t01-out-1',
    topicId: 't01-variables-hoisting',
    category: 'Output-based',
    difficulty: 'Basic',
    question: 'What will this code print?',
    codeSnippet: `console.log(a);\nvar a = 10;\nconsole.log(b);\nlet b = 20;`,
    options: [
      'undefined, then ReferenceError',
      '10, then 20',
      'ReferenceError on line 1',
      'undefined, then undefined',
    ],
    correctIndex: 0,
    whyCorrect:
      '`var a` is hoisted and initialized to `undefined`, so line 1 prints `undefined`. `let b` is hoisted into the Temporal Dead Zone (TDZ) and uninitialized, so reading it before line 4 throws a `ReferenceError`.',
    wrongOptionReasons: {
      1: 'Neither `var` nor `let` hoists the assignment (`= 10` / `= 20`), only the declaration.',
      2: 'Line 1 accesses `var a`, which is initialized to `undefined` rather than throwing.',
      3: '`let` variables are NOT initialized to `undefined` before their declaration line; they stay in the TDZ.',
    },
  },
  {
    id: 'rq-t01-out-2',
    topicId: 't01-variables-hoisting',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What will this hoisting snippet print?',
    codeSnippet: `var x = 1;\nfunction test() {\n  console.log(x);\n  var x = 2;\n}\ntest();`,
    options: ['undefined', '1', '2', 'ReferenceError'],
    correctIndex: 0,
    whyCorrect:
      'Inside `test()`, the local `var x` is hoisted to the top of `test` and initialized to `undefined`, shadowing the global `x = 1`.',
    wrongOptionReasons: {
      1: 'The local `var x` shadows the outer `x = 1` for the entire body of `test()`.',
      2: 'The assignment `x = 2` executes AFTER `console.log(x)`.',
      3: '`var` does not enter a Temporal Dead Zone, so it logs `undefined` instead of throwing.',
    },
  },
  {
    id: 'rq-t01-scen-1',
    topicId: 't01-variables-hoisting',
    category: 'Scenario',
    difficulty: 'Basic',
    question:
      'A teammate declares `const config = { timeout: 3000 }` and later executes `config.timeout = 5000`. What happens?',
    options: [
      'It succeeds because `const` locks the variable binding, not the object properties.',
      'It throws a TypeError because `const` deeply freezes objects.',
      'It silently fails without changing `timeout`.',
      'It creates a new copy of `config` automatically.',
    ],
    correctIndex: 0,
    whyCorrect:
      '`const` prevents reassigning the identifier (`config = ...`), while object properties remain mutable unless frozen with `Object.freeze()`.',
    wrongOptionReasons: {
      1: '`const` does not freeze objects; only reassignment of the reference itself throws TypeError.',
      2: 'Mutating an unfrozen object property updates it immediately.',
      3: 'JavaScript never implicitly clones objects on property assignment.',
    },
  },

  // ---- DATA TYPES & COERCION (t02) ----
  {
    id: 'rq-t02-out-1',
    topicId: 't02-data-types-coercion',
    category: 'Output-based',
    difficulty: 'Basic',
    question: 'What will this print?',
    codeSnippet: `console.log(typeof null, Number(''), Boolean('0'));`,
    options: [
      '"object" 0 true',
      '"null" NaN false',
      '"object" NaN false',
      '"undefined" 0 true',
    ],
    correctIndex: 0,
    whyCorrect:
      '`typeof null` is famously `"object"` (historical JS quirk), `Number("")` coerces to `0`, and any non-empty string including `"0"` is truthy (`true`).',
    wrongOptionReasons: {
      1: '`typeof null` never returns `"null"`, `Number("")` is `0`, and `"0"` is a non-empty truthy string.',
      2: '`Number("")` yields `0`, not `NaN`, and `Boolean("0")` is `true`.',
      3: '`typeof null` is `"object"`, not `"undefined"`.',
    },
  },
  {
    id: 'rq-t02-out-2',
    topicId: 't02-data-types-coercion',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What does this expression evaluate to?',
    codeSnippet: `console.log('5' + 3, '5' - 3, NaN === NaN);`,
    options: ['"53" 2 false', '8 2 false', '"53" "2" true', '8 2 true'],
    correctIndex: 0,
    whyCorrect:
      '`+` concatenates when either operand is a string (`"53"`), `-` always converts to numbers (`2`), and `NaN` is never strictly equal to itself (`false`).',
    wrongOptionReasons: {
      1: '`"5" + 3` performs string concatenation, not numeric addition.',
      2: '`"5" - 3` returns the number `2` (not string `"2"`), and `NaN === NaN` is always `false`.',
      3: 'Both `"5" + 3` (`"53"`) and `NaN === NaN` (`false`) behave differently.',
    },
  },

  // ---- OPERATORS & EQUALITY (t03) ----
  {
    id: 'rq-t03-out-1',
    topicId: 't03-operators-equality',
    category: 'Output-based',
    difficulty: 'Basic',
    question: 'What will this print?',
    codeSnippet: `const a = 0 || 10;\nconst b = 0 ?? 10;\nconst c = '' ?? 'fallback';\nconsole.log(a, b, c);`,
    options: ['10 0 ""', '0 0 ""', '10 10 "fallback"', '0 10 "fallback"'],
    correctIndex: 0,
    whyCorrect:
      '`||` falls back on any falsy value (so `0 || 10` is `10`), while `??` only falls back on `null` or `undefined` (preserving `0` and `""`).',
    wrongOptionReasons: {
      1: '`0 || 10` evaluates to `10` because `0` is falsy.',
      2: '`??` does NOT fall back for `0` or `""`.',
      3: 'This reverses the behavior of `||` and `??`.',
    },
  },

  // ---- CLOSURES & LEXICAL SCOPE (t13) ----
  {
    id: 'rq-t13-out-1',
    topicId: 't13-lexical-scope-closures',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What will this closure loop print?',
    codeSnippet: `for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}`,
    options: ['3, 3, 3', '0, 1, 2', '0, 0, 0', 'undefined, undefined, undefined'],
    correctIndex: 0,
    whyCorrect:
      '`var i` creates ONE function-scoped variable shared by all 3 timeout callbacks. By the time the timers run, the loop has finished and `i` is `3`.',
    wrongOptionReasons: {
      1: '`0, 1, 2` only happens when `let i` is used (creating a fresh block binding per iteration).',
      2: '`i` increments to `3` before any `setTimeout` callback executes.',
      3: '`i` is initialized to `0` and incremented to `3`, never `undefined`.',
    },
  },
  {
    id: 'rq-t13-out-2',
    topicId: 't13-lexical-scope-closures',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What will this closure factory print?',
    codeSnippet: `function makeAdder(x) {\n  return (y) => {\n    x += 1;\n    return x + y;\n  };\n}\nconst add = makeAdder(5);\nconsole.log(add(2), add(2));`,
    options: ['8 9', '7 7', '8 8', '7 8'],
    correctIndex: 0,
    whyCorrect:
      'The closure captures the live mutable binding `x`. First call increments `x` to `6` and returns `6 + 2 = 8`. Second call increments `x` to `7` and returns `7 + 2 = 9`.',
    wrongOptionReasons: {
      1: '`x` is incremented before adding `y`, and the mutation persists across calls.',
      2: 'Closures capture references to variables, not frozen snapshots, so `x` stays `6` after the first call.',
      3: 'First call already increments `x` from `5` to `6`, giving `8` first.',
    },
  },
  {
    id: 'rq-t13-out-3',
    topicId: 't13-lexical-scope-closures',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What does this lexical scope snippet print?',
    codeSnippet: `const msg = 'global';\nfunction printMsg() {\n  console.log(msg);\n}\nfunction wrapper() {\n  const msg = 'local';\n  printMsg();\n}\nwrapper();`,
    options: ['"global"', '"local"', 'undefined', 'ReferenceError'],
    correctIndex: 0,
    whyCorrect:
      'JavaScript uses LEXICAL (static) scoping: `printMsg` resolves `msg` where it was DEFINED (global scope), not where it was CALLED (`wrapper`).',
    wrongOptionReasons: {
      1: 'That would be dynamic scoping; JS scopes functions by definition location, not call site.',
      2: '`msg` is initialized to `"global"` before `wrapper()` runs.',
      3: '`printMsg` has full access to the outer `const msg = "global"`.',
    },
  },

  // ---- RECURSION (t13b) ----
  {
    id: 'rq-t13b-out-1',
    topicId: 't13b-recursion-call-stack',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What order will this recursive function print?',
    codeSnippet: `function trace(n) {\n  if (n === 0) return;\n  console.log('in', n);\n  trace(n - 1);\n  console.log('out', n);\n}\ntrace(2);`,
    options: [
      'in 2, in 1, out 1, out 2',
      'in 2, out 2, in 1, out 1',
      'in 1, in 2, out 2, out 1',
      'in 2, in 1, out 2, out 1',
    ],
    correctIndex: 0,
    whyCorrect:
      'The Call Stack is LIFO (Last-In, First-Out): `trace(2)` logs `in 2`, pauses to run `trace(1)` (`in 1` -> `trace(0)` returns -> `out 1`), then resumes to log `out 2`.',
    wrongOptionReasons: {
      1: '`out 2` cannot execute until the inner `trace(1)` call returns.',
      2: 'Execution begins with `n = 2`, not `n = 1`.',
      3: 'Stack frames unwind in reverse order (`out 1` finishes before `out 2`).',
    },
  },

  // ---- REFERENCES & DEEP CLONE (t18) ----
  {
    id: 'rq-t18-out-1',
    topicId: 't18-reference-deep-clone',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What will this print?',
    codeSnippet: `const a = { user: { name: 'Mia' } };\nconst b = { ...a };\nb.user.name = 'Noah';\nconsole.log(a.user.name, a === b, a.user === b.user);`,
    options: [
      '"Noah" false true',
      '"Mia" false false',
      '"Noah" true true',
      '"Mia" false true',
    ],
    correctIndex: 0,
    whyCorrect:
      '`{ ...a }` creates a new outer object (`a === b` is `false`) but copies the nested `user` reference (`a.user === b.user` is `true`), so mutating `b.user.name` updates `a.user.name`.',
    wrongOptionReasons: {
      1: 'Spread is shallow, so `a.user` and `b.user` share the same nested object.',
      2: '`{ ...a }` allocates a distinct outer wrapper object, so `a === b` is `false`.',
      3: 'If `a.user === b.user` is `true`, changing `b.user.name` must also change `a.user.name`.',
    },
  },

  // ---- THIS, CALL, APPLY, BIND (t19) ----
  {
    id: 'rq-t19-out-1',
    topicId: 't19-this-call-apply-bind',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What will this print in strict mode?',
    codeSnippet: `const bot = {\n  tag: 'v2',\n  regular() { return this.tag; },\n  arrow: () => this?.tag,\n};\nconsole.log(bot.regular(), bot.arrow());`,
    options: [
      '"v2" undefined',
      '"v2" "v2"',
      'undefined undefined',
      'undefined "v2"',
    ],
    correctIndex: 0,
    whyCorrect:
      '`bot.regular()` sets `this` to `bot` (`"v2"`). Arrow functions do NOT bind their own `this`; `bot.arrow` inherits outer/module `this`, where `tag` is `undefined`.',
    wrongOptionReasons: {
      1: 'Arrow functions ignore call-site receivers (`bot.arrow()`).',
      2: 'Regular method calls (`bot.regular()`) bind `this` to the receiver `bot`.',
      3: 'This swaps regular method and arrow function behavior.',
    },
  },
  {
    id: 'rq-t19-out-2',
    topicId: 't19-this-call-apply-bind',
    category: 'Output-based',
    difficulty: 'Advanced',
    question: 'What does chaining `.bind()` twice print?',
    codeSnippet: `function show() { return this.id; }\nconst bound1 = show.bind({ id: 1 });\nconst bound2 = bound1.bind({ id: 2 });\nconsole.log(bound2());`,
    options: ['1', '2', 'undefined', 'TypeError'],
    correctIndex: 0,
    whyCorrect:
      'Once a function is bound with `.bind()`, its `this` is permanently locked — subsequent `.bind()`, `.call()`, or `.apply()` calls cannot override it.',
    wrongOptionReasons: {
      1: '`.bind()` cannot re-bind an already-bound function.',
      2: '`bound1` permanently bound `this` to `{ id: 1 }`.',
      3: 'Calling `.bind()` on a bound function is valid JS; it just preserves the first binding.',
    },
  },

  // ---- EVENT LOOP (t29) ----
  {
    id: 'rq-t29-out-1',
    topicId: 't29-event-loop',
    category: 'Output-based',
    difficulty: 'Advanced',
    question: 'What is the EXACT console output order?',
    codeSnippet: `console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');`,
    options: ['1, 4, 3, 2', '1, 2, 3, 4', '1, 4, 2, 3', '1, 3, 4, 2'],
    correctIndex: 0,
    whyCorrect:
      'Synchronous code runs first (`1`, `4`), then the Microtask Queue drains (`3` from `Promise.then`), and only then does the Event Loop run the next Macrotask (`2` from `setTimeout`).',
    wrongOptionReasons: {
      1: '`setTimeout(..., 0)` is a macrotask and waits behind both sync code and microtasks.',
      2: 'Microtasks (`Promise.then`) always have higher priority than macrotasks (`setTimeout`).',
      3: 'All synchronous lines (`1` and `4`) must clear the Call Stack before microtasks begin.',
    },
  },
  {
    id: 'rq-t29-out-2',
    topicId: 't29-event-loop',
    category: 'Output-based',
    difficulty: 'Advanced',
    question: 'What prints when a Promise constructor has synchronous code inside?',
    codeSnippet: `console.log('A');\nnew Promise((resolve) => {\n  console.log('B');\n  resolve('C');\n}).then((v) => console.log(v));\nconsole.log('D');`,
    options: ['A, B, D, C', 'A, D, B, C', 'A, B, C, D', 'B, A, D, C'],
    correctIndex: 0,
    whyCorrect:
      'The Promise executor callback runs SYNCHRONOUSLY (`B`), while `.then(...)` schedules a microtask (`C`) that runs after `D`.',
    wrongOptionReasons: {
      1: 'The executor function passed to `new Promise(...)` executes immediately, not asynchronously.',
      2: '`.then()` callbacks ALWAYS execute asynchronously in the microtask queue, even when `resolve` was called synchronously.',
      3: '`console.log("A")` runs before `new Promise(...)` is invoked.',
    },
  },

  // ---- PROMISES & CHAINING (t30) ----
  {
    id: 'rq-t30-out-1',
    topicId: 't30-promises-chaining',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What does this Promise recovery chain print?',
    codeSnippet: `Promise.reject('fail')\n  .catch((e) => 'recovered:' + e)\n  .then((v) => console.log(v));`,
    options: [
      '"recovered:fail"',
      'Uncaught rejection: fail',
      'Nothing prints because the chain rejected',
      'undefined',
    ],
    correctIndex: 0,
    whyCorrect:
      '`.catch()` handles the rejection and returns a normal value `"recovered:fail"`, which resolves the chain and passes `"recovered:fail"` into the next `.then()`.',
    wrongOptionReasons: {
      1: '`.catch()` handled the rejection so it is no longer uncaught.',
      2: 'Returning a non-throwing value inside `.catch()` resumes normal `.then()` execution.',
      3: 'The concise arrow function explicitly returns `"recovered:" + e`.',
    },
  },

  // ---- ASYNC / AWAIT & FETCH (t31) ----
  {
    id: 'rq-t31-out-1',
    topicId: 't31-async-await-fetch',
    category: 'Output-based',
    difficulty: 'Intermediate',
    question: 'What is the exact output order of this `async/await` function?',
    codeSnippet: `async function run() {\n  console.log('1');\n  await Promise.resolve();\n  console.log('2');\n}\nconsole.log('0');\nrun();\nconsole.log('3');`,
    options: ['0, 1, 3, 2', '0, 1, 2, 3', '0, 3, 1, 2', '1, 0, 3, 2'],
    correctIndex: 0,
    whyCorrect:
      '`run()` runs synchronously up to `await` (logging `1`), suspends and returns control to the caller (logging `3`), then resumes in the microtask queue to log `2`.',
    wrongOptionReasons: {
      1: '`await` always yields control to the caller and schedules the continuation as a microtask.',
      2: 'Code BEFORE the first `await` inside an `async` function runs synchronously immediately on call.',
      3: '`console.log("0")` executes before `run()` is called.',
    },
  },
  {
    id: 'rq-t31-scen-1',
    topicId: 't31-async-await-fetch',
    category: 'Scenario',
    difficulty: 'Intermediate',
    question:
      'Your search input fires a `fetch()` on every keystroke. Typing "react" quickly causes an older slow response for "re" to overwrite the newer response for "react". How do you fix this race condition?',
    options: [
      'Abort the previous in-flight request with `AbortController` (or ignore stale request IDs) before starting the next fetch.',
      'Replace `async/await` with `.then()` callbacks.',
      'Wrap `fetch()` inside `setTimeout(..., 0)`.',
      'Call `JSON.stringify()` twice on the response.',
    ],
    correctIndex: 0,
    whyCorrect:
      '`AbortController.abort()` cancels superseded requests (and tracking a monotonically increasing request ID discards out-of-order responses), preventing stale UI overwrites.',
    wrongOptionReasons: {
      1: '`.then()` and `async/await` both suffer from identical network arrival race conditions.',
      2: '`setTimeout(..., 0)` does not guarantee earlier network responses finish before later ones.',
      3: 'Serialization has nothing to do with network response ordering.',
    },
  },

  // ---- ASYNC CONCURRENCY (t32) ----
  {
    id: 'rq-t32-out-1',
    topicId: 't32-async-concurrency',
    category: 'Output-based',
    difficulty: 'Advanced',
    question: 'What happens if one promise rejects inside `Promise.all([p1, p2, p3])`?',
    codeSnippet: `Promise.all([\n  Promise.resolve('A'),\n  Promise.reject('B failed'),\n  Promise.resolve('C'),\n]).then(console.log).catch((e) => console.log('ERR:', e));`,
    options: [
      'ERR: B failed',
      '["A", "B failed", "C"]',
      '["A", "C"]',
      'Nothing logs until all 3 reject',
    ],
    correctIndex: 0,
    whyCorrect:
      '`Promise.all()` is fail-fast: as soon as ANY input promise rejects, the combined promise immediately rejects with that first rejection reason.',
    wrongOptionReasons: {
      1: '`Promise.all()` rejects instead of placing errors into the result array (use `Promise.allSettled()` for per-item status).',
      2: '`Promise.all()` does not silently skip rejected promises.',
      3: 'Only `Promise.any()` waits for all promises to reject before throwing an `AggregateError`.',
    },
  },

  // ---- PRODUCTION SCENARIOS ACROSS SECTIONS ----
  {
    id: 'rq-t25-scen-1',
    topicId: 't25-event-bubbling-delegation',
    category: 'Scenario',
    difficulty: 'Intermediate',
    question:
      'A table renders 500 dynamic rows with Delete buttons, and new rows are appended via API. What is the cleanest, most memory-efficient way to handle clicks?',
    options: [
      'Attach ONE click listener to the parent `<tbody>` and check `event.target.closest("[data-delete-id]")`.',
      'Attach 500 individual click listeners and re-attach them on every update.',
      'Add inline `onclick="deleteRow()"` HTML strings to every row.',
      'Poll the DOM every 100ms with `setInterval`.',
    ],
    correctIndex: 0,
    whyCorrect:
      'Event delegation uses a single listener on a stable ancestor, automatically works for dynamically added rows, and handles clicks on nested icons via `.closest()`.',
    wrongOptionReasons: {
      1: 'Hundreds of individual listeners waste memory and require manual re-binding on dynamic inserts.',
      2: 'Inline HTML handlers mix markup with global functions and invite XSS risks.',
      3: 'Polling the DOM cannot detect click events and wastes CPU.',
    },
  },
  {
    id: 'rq-t36d-scen-1',
    topicId: 't36d-performance-security-basics',
    category: 'Scenario',
    difficulty: 'Advanced',
    question:
      'A dashboard filters 20,000 orders against a list of 5,000 banned user IDs using `orders.filter(o => bannedIds.includes(o.userId))` and freezes the tab. What is the best optimization?',
    options: [
      'Convert `bannedIds` into a `new Set(bannedIds)` once and check `bannedSet.has(o.userId)`, reducing O(n*m) to O(n+m).',
      'Replace `.filter()` with `.forEach()` while keeping `.includes()`.',
      'Sort `orders` alphabetically before calling `.includes()`.',
      'Wrap the filter inside `Promise.resolve()`.',
    ],
    correctIndex: 0,
    whyCorrect:
      '`Array.includes` is O(m) per order (~100M checks). Converting `bannedIds` to a `Set` makes lookups O(1), dropping total work to ~25,000 operations.',
    wrongOptionReasons: {
      1: '`.forEach()` with `.includes()` is still O(n*m) quadratic time.',
      2: 'Sorting `orders` does not speed up linear scans of `bannedIds`.',
      3: '`Promise.resolve()` still executes synchronously on the same main thread in the microtask queue.',
    },
  },
  {
    id: 'rq-t36b-scen-1',
    topicId: 't36b-testing-fundamentals',
    category: 'Scenario',
    difficulty: 'Intermediate',
    question:
      'Your unit test for `calculateDiscount(price, coupon)` passes for `(100, "SAVE10")` but a bug slips into production when `price` is `0` or coupon is `null`. What testing principle was missed?',
    options: [
      'Testing boundary and edge cases (zero, negatives, empty/null inputs, and upper bounds) alongside the happy path.',
      'Writing assertions with `console.log()` instead of `expect()`.',
      'Testing internal private variable names.',
      'Running tests only after deploying to production.',
    ],
    correctIndex: 0,
    whyCorrect:
      'Strong unit tests always cover happy paths AND boundary/edge inputs (0, negatives, null/undefined, duplicates, max limits).',
    wrongOptionReasons: {
      1: '`console.log()` is manual inspection, not an automated assertion.',
      2: 'Testing private implementation details makes tests brittle without catching input edge cases.',
      3: 'Tests should run locally and in CI before deployment.',
    },
  },
];
