import type { CodingChallengeItem } from '../../types/practiceBank';

export const CODING_CHALLENGES_PART_2: CodingChallengeItem[] = [
  // =========================================================================
  // SECTION 5: EXECUTION CONTEXT (this), PROTOTYPES & OOP
  // =========================================================================
  {
    id: 'dbg-t19-lost-this-bind',
    topicId: 't19-this-call-apply-bind',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Detached Method Loses `this`',
    scenario: 'Callback passed to scheduler prints undefined instead of user name',
    taskPrompt:
      'Fix `createGreeterCallback(user)` so calling the returned function standalone (`fn()`) returns `"Hello, <user.name>"` instead of crashing.',
    starterJs: `function createGreeterCallback(user) {
  const greeter = {
    name: user.name,
    greet() {
      return 'Hello, ' + this.name;
    },
  };
  return greeter.greet; // Bug: detached function loses 'this'!
}`,
    bugDiagnosis: {
      question: 'Why does calling `const fn = createGreeterCallback({ name: "Priya" }); fn()` throw a TypeError in strict mode?',
      options: [
        'Detaching `greeter.greet` loses its receiver object, so `this` becomes `undefined` in strict mode when invoked as `fn()`.',
        'Methods inside object literals cannot read `this.name`.',
        'Returning a function automatically deletes all properties on `greeter`.',
      ],
      correctIndex: 0,
      explanation: 'Bind the method explicitly with `greeter.greet.bind(greeter)` (or wrap in an arrow function).',
    },
    testCases: [
      {
        id: 't1',
        label: 'Detached callback preserves this',
        inputSummary: `createGreeterCallback({ name: 'Priya' })()`,
        expectedSummary: `'Hello, Priya'`,
        checkExpression: `{ actual: createGreeterCallback({ name: 'Priya' })(), expected: 'Hello, Priya' }`,
      },
      {
        id: 't2',
        label: 'Hidden: works for multiple distinct users',
        hidden: true,
        inputSummary: `two detached callbacks`,
        expectedSummary: `['Hello, A', 'Hello, B']`,
        checkExpression: `(() => { const a = createGreeterCallback({ name: 'A' }); const b = createGreeterCallback({ name: 'B' }); return { actual: [a(), b()], expected: ['Hello, A', 'Hello, B'] }; })()`,
      },
    ],
    hints: [
      'A standalone function call in strict mode sets `this` to `undefined`.',
      'Use `.bind(greeter)` before returning the method.',
      'return greeter.greet.bind(greeter);',
      '`.bind()` creates a new function permanently bound to `greeter`.',
    ],
    solutionJs: `function createGreeterCallback(user) {
  const greeter = {
    name: user.name,
    greet() {
      return 'Hello, ' + this.name;
    },
  };
  return greeter.greet.bind(greeter);
}`,
    dryRun: 'fn() invokes bound greet with this === greeter -> "Hello, Priya".',
  },
  {
    id: 'cc-t20-prototype-chain-check',
    topicId: 't20-prototypes-chain',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'Prototype Inheritance & Own vs Inherited Keys',
    scenario: 'Exam: Object.create() delegation & Object.hasOwn()',
    taskPrompt:
      'Write `classifyProperties(proto, ownProps)` that creates an object delegating to `proto` via `Object.create(proto)`, copies `ownProps` onto it, and returns `{ own: [...], inherited: [...] }` listing own enumerable keys and inherited enumerable keys separately (sorted alphabetically).',
    starterJs: `function classifyProperties(proto, ownProps) {
  // Create object with Object.create(proto) and classify keys
  return { own: [], inherited: [] };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Separates own vs prototype keys',
        inputSummary: `classifyProperties({ role: 'user', active: true }, { name: 'Kai' })`,
        expectedSummary: `{ own: ['name'], inherited: ['active', 'role'] }`,
        checkExpression: `{ actual: classifyProperties({ role: 'user', active: true }, { name: 'Kai' }), expected: { own: ['name'], inherited: ['active', 'role'] } }`,
      },
      {
        id: 't2',
        label: 'Hidden: shadowed own property is only in own',
        hidden: true,
        inputSummary: `classifyProperties({ role: 'user' }, { role: 'admin' })`,
        expectedSummary: `{ own: ['role'], inherited: [] }`,
        checkExpression: `{ actual: classifyProperties({ role: 'user' }, { role: 'admin' }), expected: { own: ['role'], inherited: [] } }`,
      },
    ],
    hints: [
      'Create `const obj = Object.assign(Object.create(proto), ownProps);`.',
      'Loop with `for (const key in obj)` and check `Object.prototype.hasOwnProperty.call(obj, key)`.',
      'Sort both `own` and `inherited` arrays with `.sort()`.',
      '`for...in` walks the prototype chain, while `hasOwnProperty` / `Object.hasOwn` identifies direct own properties.',
    ],
    solutionJs: `function classifyProperties(proto, ownProps) {
  const obj = Object.assign(Object.create(proto), ownProps);
  const own = [];
  const inherited = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      own.push(key);
    } else {
      inherited.push(key);
    }
  }
  return { own: own.sort(), inherited: inherited.sort() };
}`,
    dryRun: 'Shadowed "role" is an own property on obj -> pushed to own only.',
  },
  {
    id: 'cc-t21-bank-account-class',
    topicId: 't21-es6-classes-super',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'ES6 BankAccount & SavingsAccount with super()',
    scenario: 'Workspace: Domain modeling with class inheritance',
    taskPrompt:
      'Create class `BankAccount(balance = 0)` with `deposit(amount)` (ignores `<= 0`) and `withdraw(amount)` (returns `false` if insufficient funds or `<= 0`, else subtracts and returns `true`). Create subclass `SavingsAccount(balance, rate)` using `super(balance)` with `applyInterest()` that adds `balance * rate` rounded to 2 decimals.',
    starterJs: `class BankAccount {
  constructor(balance = 0) {
    this.balance = balance;
  }
  deposit(amount) {}
  withdraw(amount) { return false; }
}

class SavingsAccount extends BankAccount {
  constructor(balance = 0, rate = 0.05) {
    super(balance);
    this.rate = rate;
  }
  applyInterest() {}
}`,
    testCases: [
      {
        id: 't1',
        label: 'Deposit, withdraw, and interest',
        inputSummary: 'SavingsAccount(100, 0.1) -> deposit 50 -> interest -> withdraw 200',
        expectedSummary: '[165, false, true, 115]',
        checkExpression: `(() => {
          const s = new SavingsAccount(100, 0.1);
          s.deposit(50);
          s.applyInterest();
          const failW = s.withdraw(200);
          const okW = s.withdraw(50);
          return { actual: [s.balance, failW, okW, s instanceof BankAccount], expected: [115, false, true, true] };
        })()`,
      },
      {
        id: 't2',
        label: 'Hidden: negative deposit/withdraw ignored',
        hidden: true,
        inputSummary: 'deposit(-50), withdraw(-10)',
        expectedSummary: '[100, false]',
        checkExpression: `(() => {
          const a = new BankAccount(100);
          a.deposit(-50);
          const r = a.withdraw(-10);
          return { actual: [a.balance, r], expected: [100, false] };
        })()`,
      },
    ],
    hints: [
      'In `deposit(amount)`: `if (amount > 0) this.balance += amount;`.',
      'In `withdraw(amount)`: `if (amount <= 0 || amount > this.balance) return false; this.balance -= amount; return true;`.',
      'In `applyInterest()`: `this.balance = Number((this.balance * (1 + this.rate)).toFixed(2));`.',
      'Calling `super(balance)` initializes `this` in the parent class before setting subclass fields.',
    ],
    solutionJs: `class BankAccount {
  constructor(balance = 0) {
    this.balance = balance;
  }
  deposit(amount) {
    if (amount > 0) this.balance += amount;
  }
  withdraw(amount) {
    if (amount <= 0 || amount > this.balance) return false;
    this.balance -= amount;
    return true;
  }
}

class SavingsAccount extends BankAccount {
  constructor(balance = 0, rate = 0.05) {
    super(balance);
    this.rate = rate;
  }
  applyInterest() {
    this.balance = Number((this.balance * (1 + this.rate)).toFixed(2));
  }
}`,
    dryRun: '100 + 50 = 150 -> *1.1 = 165 -> withdraw 200 false -> withdraw 50 true -> 115.',
  },
  {
    id: 'cc-t22-set-map-frequency',
    topicId: 't22-set-map-iterators',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'O(n) Unique Deduplication & Word Frequency Map',
    scenario: 'Exam & Performance: Using Set and Map instead of O(n²) loops',
    taskPrompt:
      'Write `uniqueValues(arr)` returning unique values in insertion order using `Set`, and `wordFrequency(words)` returning a `Map` of lowercase word -> count.',
    starterJs: `function uniqueValues(arr) {
  return [];
}

function wordFrequency(words) {
  return new Map();
}`,
    testCases: [
      {
        id: 't1',
        label: 'Deduplicates preserving order',
        inputSummary: 'uniqueValues([3, 1, 3, 2, 1])',
        expectedSummary: '[3, 1, 2]',
        checkExpression: `{ actual: uniqueValues([3, 1, 3, 2, 1]), expected: [3, 1, 2] }`,
      },
      {
        id: 't2',
        label: 'Counts case-insensitive frequencies in Map',
        inputSummary: `wordFrequency(['JS', 'js', 'Map'])`,
        expectedSummary: `[['js', 2], ['map', 1]]`,
        checkExpression: `{ actual: [...wordFrequency(['JS', 'js', 'Map']).entries()], expected: [['js', 2], ['map', 1]] }`,
      },
      {
        id: 't3',
        label: 'Hidden: empty arrays',
        hidden: true,
        inputSummary: 'uniqueValues([]) / wordFrequency([])',
        expectedSummary: '[[], 0]',
        checkExpression: `{ actual: [uniqueValues([]), wordFrequency([]).size], expected: [[], 0] }`,
      },
    ],
    hints: [
      '`[...new Set(arr)]` deduplicates in O(n) while preserving insertion order.',
      'For `Map`: normalize `const key = w.toLowerCase()`, then `map.set(key, (map.get(key) ?? 0) + 1)`.',
      'Return the `Map` instance directly.',
      '`Set` and `Map` give O(1) average lookup without prototype-key collisions.',
    ],
    solutionJs: `function uniqueValues(arr) {
  return [...new Set(arr)];
}

function wordFrequency(words) {
  const counts = new Map();
  for (const w of words) {
    const key = w.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}`,
    dryRun: '["JS", "js", "Map"] -> Map { "js" => 2, "map" => 1 }.',
  },

  // =========================================================================
  // SECTION 6: BROWSER DOM, EVENTS, FORMS & STORAGE (Pure-JS Logic + Validation)
  // =========================================================================
  {
    id: 'cc-t23-xss-escape',
    topicId: 't23-dom-selection-xss',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'HTML Escaper Against XSS Injection',
    scenario: 'Security: Sanitizing untrusted user text before rendering',
    taskPrompt:
      'Write `escapeHtml(raw)` that escapes `&`, `<`, `>`, `"`, and `\'` into their HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`).',
    starterJs: `function escapeHtml(raw) {
  return String(raw);
}`,
    testCases: [
      {
        id: 't1',
        label: 'Neutralizes script tag',
        inputSummary: `escapeHtml('<script>alert("x")</script>')`,
        expectedSummary: `'&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'`,
        checkExpression: `{ actual: escapeHtml('<script>alert("x")</script>'), expected: '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;' }`,
      },
      {
        id: 't2',
        label: 'Hidden: escapes ampersand first without double-escaping',
        hidden: true,
        inputSummary: `escapeHtml("A & B's <tag>")`,
        expectedSummary: `'A &amp; B&#39;s &lt;tag&gt;'`,
        checkExpression: `{ actual: escapeHtml("A & B's <tag>"), expected: 'A &amp; B&#39;s &lt;tag&gt;' }`,
      },
    ],
    hints: [
      'Always replace `&` FIRST, or map all 5 characters in a single pass with a lookup object.',
      'const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", \'"\': "&quot;", "\'": "&#39;" };',
      'return String(raw).replace(/[&<>"\']/g, (ch) => map[ch]);',
      'Single-pass regex replacement guarantees no double-escaping of `&`.',
    ],
    solutionJs: `function escapeHtml(raw) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(raw).replace(/[&<>"']/g, (ch) => map[ch]);
}`,
    dryRun: '"<script>" -> "&lt;script&gt;" so browsers render literal text instead of executing JS.',
  },
  {
    id: 'cc-t24-form-validator',
    topicId: 't24-events-forms-prevent',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'Signup Form Payload Validator',
    scenario: 'Workspace: Client-side form submit handler validation',
    taskPrompt:
      'Write `validateSignup({ email, password })` returning `{ valid: boolean, errors: string[] }`. Require `email` to contain `@` and `.` after `@`, and `password` to be at least 8 characters long.',
    starterJs: `function validateSignup({ email = '', password = '' } = {}) {
  const errors = [];
  return { valid: errors.length === 0, errors };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Accepts valid credentials',
        inputSummary: `validateSignup({ email: 'dev@site.com', password: 'strongpass' })`,
        expectedSummary: `{ valid: true, errors: [] }`,
        checkExpression: `{ actual: validateSignup({ email: 'dev@site.com', password: 'strongpass' }), expected: { valid: true, errors: [] } }`,
      },
      {
        id: 't2',
        label: 'Rejects invalid email and short password',
        inputSummary: `validateSignup({ email: 'bad@com', password: '123' }).valid / errors.length`,
        expectedSummary: '[false, 2]',
        checkExpression: `(() => { const r = validateSignup({ email: 'bad@com', password: '123' }); return { actual: [r.valid, r.errors.length], expected: [false, 2] }; })()`,
      },
    ],
    hints: [
      'Trim email and check `atIdx > 0` and `email.indexOf(".", atIdx) > atIdx + 1`.',
      'Check `password.length < 8`.',
      'Push descriptive error strings into `errors`, then return `{ valid: errors.length === 0, errors }`.',
      'Returning structured `{ valid, errors }` makes displaying form errors in UI clean and testable.',
    ],
    solutionJs: `function validateSignup({ email = '', password = '' } = {}) {
  const errors = [];
  const trimmed = String(email).trim();
  const atIdx = trimmed.indexOf('@');
  const dotAfterAt = atIdx > 0 ? trimmed.indexOf('.', atIdx + 2) : -1;
  if (atIdx <= 0 || dotAfterAt === -1 || dotAfterAt === trimmed.length - 1) {
    errors.push('Enter a valid email address.');
  }
  if (String(password).length < 8) {
    errors.push('Password must be at least 8 characters.');
  }
  return { valid: errors.length === 0, errors };
}`,
    dryRun: 'bad@com has no dot after @ -> 1 error; "123" < 8 -> 2 errors -> valid: false.',
  },
  {
    id: 'cc-t25-delegation-matcher',
    topicId: 't25-event-bubbling-delegation',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'Event Delegation Bubble Walker',
    scenario: 'Simulating `event.target.closest("[data-action]")` along parent chain',
    taskPrompt:
      'Write `findDelegatedAction(node)` that walks up `node -> node.parent` until it finds a node with a non-empty `action` string (stopping if `node` is null). Return `{ action, id }` or `null`.',
    starterJs: `function findDelegatedAction(node) {
  // Walk up parent pointers to find the nearest ancestor with an action
  return null;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Bubbles from icon span to parent button',
        inputSummary: 'icon -> button(action:"delete", id:"42") -> li',
        expectedSummary: `{ action: 'delete', id: '42' }`,
        checkExpression: `(() => {
          const li = { id: 'row', parent: null };
          const btn = { id: '42', action: 'delete', parent: li };
          const icon = { id: 'svg', parent: btn };
          return { actual: findDelegatedAction(icon), expected: { action: 'delete', id: '42' } };
        })()`,
      },
      {
        id: 't2',
        label: 'Hidden: returns null when no ancestor matches',
        hidden: true,
        inputSummary: 'findDelegatedAction({ id: "x", parent: null })',
        expectedSummary: 'null',
        checkExpression: `{ actual: findDelegatedAction({ id: 'x', parent: null }), expected: null }`,
      },
    ],
    hints: [
      'Use a `let current = node;` loop: `while (current) { ... current = current.parent; }`.',
      'If `current.action`, immediately return `{ action: current.action, id: current.id }`.',
      'If the loop finishes without a match, return `null`.',
      'This mirrors exactly how `event.target.closest("[data-action]")` traverses the DOM upward.',
    ],
    solutionJs: `function findDelegatedAction(node) {
  let current = node;
  while (current) {
    if (current.action) {
      return { action: current.action, id: current.id };
    }
    current = current.parent ?? null;
  }
  return null;
}`,
    dryRun: 'icon (no action) -> btn (action="delete") -> returns { action: "delete", id: "42" }.',
  },
  {
    id: 'cc-t26-regex-extract-hashtags',
    topicId: 't26-regex-validation',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Extract Normalized Hashtags with RegExp',
    scenario: 'Workspace: Social post parser',
    taskPrompt:
      'Write `extractHashtags(post)` that extracts all unique lowercase hashtags matching `/#[a-z0-9_]+/gi` (without duplicates, preserving first-seen order). Return `[]` if none.',
    starterJs: `function extractHashtags(post) {
  return [];
}`,
    testCases: [
      {
        id: 't1',
        label: 'Extracts and deduplicates hashtags',
        inputSummary: `extractHashtags('Learning #JavaScript and #WebDev with #javascript!')`,
        expectedSummary: `['#javascript', '#webdev']`,
        checkExpression: `{ actual: extractHashtags('Learning #JavaScript and #WebDev with #javascript!'), expected: ['#javascript', '#webdev'] }`,
      },
      {
        id: 't2',
        label: 'Hidden: no hashtags returns []',
        hidden: true,
        inputSummary: `extractHashtags('Plain text without tags')`,
        expectedSummary: '[]',
        checkExpression: `{ actual: extractHashtags('Plain text without tags'), expected: [] }`,
      },
    ],
    hints: [
      'Use `post.match(/#[a-z0-9_]+/gi) ?? []`.',
      'Lowercase each match and deduplicate with `new Set(...)`.',
      'return [...new Set((post.match(/#[a-z0-9_]+/gi) ?? []).map(t => t.toLowerCase()))];',
      'Handling `null` from `.match()` via `?? []` avoids TypeError when no matches exist.',
    ],
    solutionJs: `function extractHashtags(post) {
  const matches = post.match(/#[a-z0-9_]+/gi) ?? [];
  return [...new Set(matches.map((tag) => tag.toLowerCase()))];
}`,
    dryRun: 'Matches ["#JavaScript", "#WebDev", "#javascript"] -> lowercase -> Set -> ["#javascript", "#webdev"].',
  },
  {
    id: 'dbg-t27-json-parse-crash',
    topicId: 't27-json-web-storage',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Corrupted localStorage JSON Crashes App Boot',
    scenario: 'App white-screens when saved JSON string is malformed',
    taskPrompt:
      'Fix `safeReadJson(rawString, fallback)` so valid JSON parses normally, while `null`, `""`, or corrupted JSON returns `fallback` without throwing.',
    starterJs: `function safeReadJson(rawString, fallback) {
  return JSON.parse(rawString); // Bug: throws SyntaxError on bad JSON!
}`,
    bugDiagnosis: {
      question: 'Why must `JSON.parse()` always be guarded when reading from `localStorage` or network responses?',
      options: [
        'Malformed strings or `"undefined"` make `JSON.parse()` throw a synchronous `SyntaxError`, crashing the app unless caught in `try/catch`.',
        '`JSON.parse()` is asynchronous and returns a Promise.',
        '`JSON.parse()` returns `false` on invalid strings.',
      ],
      correctIndex: 0,
      explanation: 'Wrap `JSON.parse()` in `try/catch` and return `fallback` if input is empty or throws.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Parses valid JSON',
        inputSummary: `safeReadJson('{"theme":"dark"}', {})`,
        expectedSummary: `{ theme: 'dark' }`,
        checkExpression: `{ actual: safeReadJson('{"theme":"dark"}', {}), expected: { theme: 'dark' } }`,
      },
      {
        id: 't2',
        label: 'Returns fallback on corrupted JSON or null',
        inputSummary: `[safeReadJson('{bad json', []), safeReadJson(null, { ok: false })]`,
        expectedSummary: `[[], { ok: false }]`,
        checkExpression: `{ actual: [safeReadJson('{bad json', []), safeReadJson(null, { ok: false })], expected: [[], { ok: false }] }`,
      },
    ],
    hints: [
      'Guard `if (typeof rawString !== "string" || !rawString.trim()) return fallback;`.',
      'Wrap `JSON.parse(rawString)` inside `try { ... } catch { return fallback; }`.',
      'Also handle `JSON.parse("null")` if needed — returning `parsed ?? fallback`.',
      'Safe JSON deserialization protects startup flows from corrupted browser storage.',
    ],
    solutionJs: `function safeReadJson(rawString, fallback) {
  if (typeof rawString !== 'string' || !rawString.trim()) return fallback;
  try {
    return JSON.parse(rawString);
  } catch {
    return fallback;
  }
}`,
    dryRun: '"{bad json" throws SyntaxError -> caught -> returns [].',
  },

  // =========================================================================
  // SECTION 7: DEBUGGING, ERROR HANDLING & ASYNCHRONOUS JAVASCRIPT
  // =========================================================================
  {
    id: 'dbg-t27b-error-diagnosis',
    topicId: 't27b-debugging-devtools',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: TypeError on Optional Nested Array',
    scenario: 'Dashboard crashes with "Cannot read properties of undefined (reading length)"',
    taskPrompt:
      'Fix `summarizeOrder(order)` so it returns `{ itemCount, total }` safely even if `order` or `order.items` is missing.',
    starterJs: `function summarizeOrder(order) {
  const itemCount = order.items.length; // Bug: crashes when order or items is undefined
  const total = order.items.reduce((sum, i) => sum + i.price, 0);
  return { itemCount, total };
}`,
    bugDiagnosis: {
      question: 'What does `TypeError: Cannot read properties of undefined (reading "length")` tell you?',
      options: [
        'The value immediately before `.length` (`order.items`) evaluated to `undefined` at runtime.',
        'The array has more than 100 items.',
        '`length` is a reserved keyword in JavaScript.',
      ],
      correctIndex: 0,
      explanation: 'Always read the exact property name in the error message and inspect the expression immediately to its left.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Valid order summary',
        inputSummary: `summarizeOrder({ items: [{ price: 15 }, { price: 25 }] })`,
        expectedSummary: '{ itemCount: 2, total: 40 }',
        checkExpression: `{ actual: summarizeOrder({ items: [{ price: 15 }, { price: 25 }] }), expected: { itemCount: 2, total: 40 } }`,
      },
      {
        id: 't2',
        label: 'Hidden: missing items or null order',
        hidden: true,
        inputSummary: '[summarizeOrder({}), summarizeOrder(null)]',
        expectedSummary: '[{ itemCount: 0, total: 0 }, { itemCount: 0, total: 0 }]',
        checkExpression: `{ actual: [summarizeOrder({}), summarizeOrder(null)], expected: [{ itemCount: 0, total: 0 }, { itemCount: 0, total: 0 }] }`,
      },
    ],
    hints: [
      'Normalize `const items = Array.isArray(order?.items) ? order.items : [];`.',
      'Compute `itemCount` and `total` from the guaranteed `items` array.',
      'const items = Array.isArray(order?.items) ? order.items : [];',
      'Defensive normalization prevents runtime TypeErrors at API boundaries.',
    ],
    solutionJs: `function summarizeOrder(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const total = items.reduce((sum, i) => sum + (Number(i?.price) || 0), 0);
  return { itemCount: items.length, total };
}`,
    dryRun: 'null -> items=[] -> { itemCount: 0, total: 0 }.',
  },
  {
    id: 'cc-t28-safe-divide-error',
    topicId: 't28-try-catch-finally',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Structured Result Wrapper with try / catch / finally',
    scenario: 'Workspace: Ensuring cleanup runs whether operation succeeds or throws',
    taskPrompt:
      'Write `runWithCleanup(taskFn, onCleanup)` that runs `taskFn()`, ALWAYS calls `onCleanup()` in `finally`, and returns `{ ok: true, value }` on success or `{ ok: false, error: err.message }` on failure.',
    starterJs: `function runWithCleanup(taskFn, onCleanup) {
  // Always invoke onCleanup() in finally
  return { ok: false, error: '' };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Success path runs cleanup',
        inputSummary: 'runWithCleanup(() => 42, cleanup)',
        expectedSummary: '[{ ok: true, value: 42 }, true]',
        checkExpression: `(() => {
          let cleaned = false;
          const res = runWithCleanup(() => 42, () => { cleaned = true; });
          return { actual: [res, cleaned], expected: [{ ok: true, value: 42 }, true] };
        })()`,
      },
      {
        id: 't2',
        label: 'Error path catches error and still runs cleanup',
        inputSummary: 'runWithCleanup(() => { throw new Error("Boom"); }, cleanup)',
        expectedSummary: '[{ ok: false, error: "Boom" }, true]',
        checkExpression: `(() => {
          let cleaned = false;
          const res = runWithCleanup(() => { throw new Error('Boom'); }, () => { cleaned = true; });
          return { actual: [res, cleaned], expected: [{ ok: false, error: 'Boom' }, true] };
        })()`,
      },
    ],
    hints: [
      'Use `try { return { ok: true, value: taskFn() }; } catch (err) { ... } finally { onCleanup(); }`.',
      'Remember `finally` executes even after a `return` statement inside `try` or `catch`!',
      'Safely extract error text with `err instanceof Error ? err.message : String(err)`.',
      'This pattern prevents stuck loading spinners and leaked locks/connections.',
    ],
    solutionJs: `function runWithCleanup(taskFn, onCleanup) {
  try {
    return { ok: true, value: taskFn() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    onCleanup();
  }
}`,
    dryRun: 'Throws "Boom" -> catch builds { ok: false, error: "Boom" } -> finally sets cleaned=true -> returns.',
  },
  {
    id: 'cc-t29-event-loop-order',
    topicId: 't29-event-loop',
    kind: 'logical',
    difficulty: 'Advanced',
    title: 'Event Loop Priority Scheduler',
    scenario: 'Exam & Async Mastery: Sync -> Microtask -> Macrotask ordering',
    taskPrompt:
      'Write an async function `collectExecutionOrder()` that schedules: (1) synchronous push `"sync"`, (2) `Promise.resolve().then(...)` pushing `"micro"`, and (3) `setTimeout(..., 0)` pushing `"macro"`, then awaits the macrotask and returns the log array `["sync", "micro", "macro"]`.',
    starterJs: `async function collectExecutionOrder() {
  const order = [];
  // Schedule macro, micro, and sync in any order so result is ['sync', 'micro', 'macro']
  return order;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Produces exact Event Loop order',
        inputSummary: 'await collectExecutionOrder()',
        expectedSummary: `['sync', 'micro', 'macro']`,
        checkExpression: `(async () => ({ actual: await collectExecutionOrder(), expected: ['sync', 'micro', 'macro'] }))()`,
      },
    ],
    hints: [
      'Wrap the `setTimeout` inside `new Promise((resolve) => setTimeout(() => { order.push("macro"); resolve(); }, 0))`.',
      'Schedule `Promise.resolve().then(() => order.push("micro"))` and synchronous `order.push("sync")` BEFORE awaiting the macro promise.',
      'Even if `setTimeout` is registered first, `"sync"` runs first, `"micro"` runs second, and `"macro"` runs last.',
      'The Event Loop always drains the entire Microtask Queue before picking the next Macrotask.',
    ],
    solutionJs: `async function collectExecutionOrder() {
  const order = [];
  const macroDone = new Promise((resolve) => {
    setTimeout(() => {
      order.push('macro');
      resolve();
    }, 0);
  });
  Promise.resolve().then(() => {
    order.push('micro');
  });
  order.push('sync');
  await macroDone;
  return order;
}`,
    dryRun: 'Sync pushes "sync" -> microtask drains "micro" -> timer macrotask pushes "macro" and resolves.',
  },
  {
    id: 'dbg-t30-promise-chain-no-return',
    topicId: 't30-promises-chaining',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Broken Promise Chain (Missing return)',
    scenario: 'Next `.then()` receives `undefined` instead of doubled value',
    taskPrompt:
      'Fix `processOrderPrice(basePrice)` so it adds 10% tax in step 1 and subtracts a $5 coupon in step 2 (minimum 0), returning a Promise of the final number.',
    starterJs: `function processOrderPrice(basePrice) {
  return Promise.resolve(basePrice)
    .then((p) => {
      const withTax = p * 1.1; // Bug: forgot to return withTax!
    })
    .then((p) => Math.max(0, Number((p - 5).toFixed(2))));
}`,
    bugDiagnosis: {
      question: 'Why does the second `.then()` receive `undefined` (causing `NaN`)?',
      options: [
        'A `.then()` block with `{ ... }` that omits `return` resolves to `undefined` for the next link in the chain.',
        '`Promise.resolve()` cannot chain more than one `.then()`.',
        '`toFixed(2)` is asynchronous.',
      ],
      correctIndex: 0,
      explanation: 'Always `return` a value or Promise from every `.then()` callback so the next `.then()` receives it.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Computes tax then subtracts coupon',
        inputSummary: 'await processOrderPrice(100)',
        expectedSummary: '105',
        checkExpression: `(async () => ({ actual: await processOrderPrice(100), expected: 105 }))()`,
      },
      {
        id: 't2',
        label: 'Hidden: clamps floor to 0 on small orders',
        hidden: true,
        inputSummary: 'await processOrderPrice(2)',
        expectedSummary: '0',
        checkExpression: `(async () => ({ actual: await processOrderPrice(2), expected: 0 }))()`,
      },
    ],
    hints: [
      'Check the first `.then((p) => { ... })` block.',
      'Add `return withTax;` inside the first `.then()`.',
      'Or use concise arrow syntax: `.then((p) => p * 1.1)`.',
      'Returning values passes them seamlessly down the Promise chain.',
    ],
    solutionJs: `function processOrderPrice(basePrice) {
  return Promise.resolve(basePrice)
    .then((p) => p * 1.1)
    .then((p) => Math.max(0, Number((p - 5).toFixed(2))));
}`,
    dryRun: '100 -> 110 -> 105. 2 -> 2.2 -> max(0, -2.8) -> 0.',
  },
  {
    id: 'dbg-t31-fetch-ok-check',
    topicId: 't31-async-await-fetch',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: fetch() Does Not Reject on HTTP 404/500',
    scenario: 'API client treats a 404 Not Found response as a successful load',
    taskPrompt:
      'Fix `fetchUserSafe(mockFetch, url)` so if `!res.ok`, it returns `{ ok: false, status: res.status }` instead of parsing error JSON as user data. If `mockFetch` rejects, return `{ ok: false, status: 0 }`.',
    starterJs: `async function fetchUserSafe(mockFetch, url) {
  try {
    const res = await mockFetch(url);
    const data = await res.json(); // Bug: doesn't check res.ok!
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0 };
  }
}`,
    bugDiagnosis: {
      question: 'Why does `fetch()` enter the `try` happy path even when the server returns HTTP 404 or 500?',
      options: [
        '`fetch()` only rejects on network failures; HTTP 4xx/5xx responses still resolve, so you MUST check `if (!res.ok)`.',
        '`await` suppresses all HTTP errors automatically.',
        '`res.json()` always rejects on 404.',
      ],
      correctIndex: 0,
      explanation: 'Always check `if (!res.ok)` immediately after `await fetch(...)` before parsing the response body.',
    },
    testCases: [
      {
        id: 't1',
        label: 'Handles HTTP 404 properly',
        inputSummary: 'fetchUserSafe(mock404, "/api/u/9")',
        expectedSummary: '{ ok: false, status: 404 }',
        checkExpression: `(async () => {
          const mock404 = async () => ({ ok: false, status: 404, json: async () => ({ err: 'nope' }) });
          return { actual: await fetchUserSafe(mock404, '/api/u/9'), expected: { ok: false, status: 404 } };
        })()`,
      },
      {
        id: 't2',
        label: 'Handles HTTP 200 and network failure',
        inputSummary: '200 OK & network throw',
        expectedSummary: '[{ ok: true, data: { id: 1 } }, { ok: false, status: 0 }]',
        checkExpression: `(async () => {
          const mock200 = async () => ({ ok: true, status: 200, json: async () => ({ id: 1 }) });
          const mockFail = async () => { throw new Error('offline'); };
          return {
            actual: [await fetchUserSafe(mock200, '/u/1'), await fetchUserSafe(mockFail, '/u/1')],
            expected: [{ ok: true, data: { id: 1 } }, { ok: false, status: 0 }],
          };
        })()`,
      },
    ],
    hints: [
      'Check `res.ok` right after `const res = await mockFetch(url);`.',
      'If `!res.ok`, return `{ ok: false, status: res.status }`.',
      'Only call `await res.json()` when `res.ok` is true.',
      'This is one of the most common production bugs in frontend API layers.',
    ],
    solutionJs: `async function fetchUserSafe(mockFetch, url) {
  try {
    const res = await mockFetch(url);
    if (!res.ok) {
      return { ok: false, status: res.status };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0 };
  }
}`,
    dryRun: '404 -> res.ok is false -> returns { ok: false, status: 404 } cleanly.',
  },
  {
    id: 'cc-t32-allsettled-report',
    topicId: 't32-async-concurrency',
    kind: 'realLife',
    difficulty: 'Advanced',
    title: 'Fault-Tolerant Batch Loader with Promise.allSettled()',
    scenario: 'Workspace: Loading dashboard widgets when one service is down',
    taskPrompt:
      'Write `async function collectSettled(promises)` using `Promise.allSettled()` that returns `{ fulfilled: [...values], failedCount: number }`.',
    starterJs: `async function collectSettled(promises) {
  return { fulfilled: [], failedCount: 0 };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Separates fulfilled values and rejected count',
        inputSummary: 'collectSettled([Promise.resolve("A"), Promise.reject("err"), Promise.resolve("B")])',
        expectedSummary: `{ fulfilled: ['A', 'B'], failedCount: 1 }`,
        checkExpression: `(async () => ({
          actual: await collectSettled([Promise.resolve('A'), Promise.reject(new Error('err')), Promise.resolve('B')]),
          expected: { fulfilled: ['A', 'B'], failedCount: 1 },
        }))()`,
      },
      {
        id: 't2',
        label: 'Hidden: empty promises array',
        hidden: true,
        inputSummary: 'collectSettled([])',
        expectedSummary: '{ fulfilled: [], failedCount: 0 }',
        checkExpression: `(async () => ({ actual: await collectSettled([]), expected: { fulfilled: [], failedCount: 0 } }))()`,
      },
    ],
    hints: [
      'Await `const settled = await Promise.allSettled(promises);`.',
      'Each entry has `status: "fulfilled"` (with `.value`) or `status: "rejected"` (with `.reason`).',
      'Collect `fulfilled` values and count `rejected` entries.',
      'Unlike `Promise.all()`, `Promise.allSettled()` never short-circuits on a single failure.',
    ],
    solutionJs: `async function collectSettled(promises) {
  const settled = await Promise.allSettled(promises);
  const fulfilled = [];
  let failedCount = 0;
  for (const item of settled) {
    if (item.status === 'fulfilled') {
      fulfilled.push(item.value);
    } else {
      failedCount += 1;
    }
  }
  return { fulfilled, failedCount };
}`,
    dryRun: '[ok A, reject, ok B] -> fulfilled: ["A","B"], failedCount: 1.',
  },

  // =========================================================================
  // SECTION 8: MODERN WEB ARCHITECTURE, TESTING, CLEAN CODE & PERFORMANCE
  // =========================================================================
  {
    id: 'cc-t33-module-barrel-format',
    topicId: 't33-es-modules',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Modular Utility Namespace Composer',
    scenario: 'Workspace: Composing named exports cleanly',
    taskPrompt:
      'Write `createFormatterModule(currency = "USD")` returning an object with pure functions `{ formatPrice(n), formatPercent(ratio) }` where `formatPrice(12.5)` -> `"USD 12.50"` and `formatPercent(0.256)` -> `"25.6%"`.',
    starterJs: `function createFormatterModule(currency = 'USD') {
  return {
    formatPrice(n) { return ''; },
    formatPercent(ratio) { return ''; },
  };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Formats currency and percentage',
        inputSummary: 'm = createFormatterModule("EUR"); [m.formatPrice(9.5), m.formatPercent(0.125)]',
        expectedSummary: `['EUR 9.50', '12.5%']`,
        checkExpression: `(() => { const m = createFormatterModule('EUR'); return { actual: [m.formatPrice(9.5), m.formatPercent(0.125)], expected: ['EUR 9.50', '12.5%'] }; })()`,
      },
      {
        id: 't2',
        label: 'Hidden: default USD and zero values',
        hidden: true,
        inputSummary: 'createFormatterModule() with 0',
        expectedSummary: `['USD 0.00', '0.0%']`,
        checkExpression: `(() => { const m = createFormatterModule(); return { actual: [m.formatPrice(0), m.formatPercent(0)], expected: ['USD 0.00', '0.0%'] }; })()`,
      },
    ],
    hints: [
      'Use `Number(n).toFixed(2)` for price and `(Number(ratio) * 100).toFixed(1)` for percentage.',
      'Template literals keep formatting clear: `` `${currency} ${Number(n).toFixed(2)}` ``.',
      'Return an object exposing both named functions.',
      'Small cohesive modules are easy to import, tree-shake, and unit test.',
    ],
    solutionJs: `function createFormatterModule(currency = 'USD') {
  return {
    formatPrice(n) {
      return \`\${currency} \${Number(n).toFixed(2)}\`;
    },
    formatPercent(ratio) {
      return \`\${(Number(ratio) * 100).toFixed(1)}%\`;
    },
  };
}`,
    dryRun: 'EUR + 9.5 -> "EUR 9.50"; 0.125 -> "12.5%".',
  },
  {
    id: 'cc-t34-debounce-helper',
    topicId: 't34-web-timers-observers',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Implement debounce(fn, delayMs)',
    scenario: 'Workspace: Preventing excessive API calls during live search typing',
    taskPrompt:
      'Write `debounce(fn, delayMs)` returning a debounced function that waits `delayMs` after the LAST call before invoking `fn(...args)`.',
    starterJs: `function debounce(fn, delayMs) {
  // Store timerId in closure, clearTimeout on every call, setTimeout new timer
  return function (...args) {};
}`,
    testCases: [
      {
        id: 't1',
        label: 'Coalesces rapid calls into only the final call',
        inputSummary: 'call("a"), call("ab"), call("abc") rapidly',
        expectedSummary: `['abc']`,
        checkExpression: `(async () => {
          const seen = [];
          const d = debounce((v) => seen.push(v), 30);
          d('a'); d('ab'); d('abc');
          await new Promise((r) => setTimeout(r, 70));
          return { actual: seen, expected: ['abc'] };
        })()`,
      },
    ],
    hints: [
      'Hold `let timerId = null;` in closure scope.',
      'Inside the returned function: `clearTimeout(timerId); timerId = setTimeout(() => fn(...args), delayMs);`.',
      'Pass `...args` through so all parameters reach `fn`.',
      'Debouncing is essential for search bars, window resize handlers, and auto-save forms.',
    ],
    solutionJs: `function debounce(fn, delayMs) {
  let timerId = null;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}`,
    dryRun: 'Rapid a -> ab -> abc cancels first two timers; 30ms after abc, fn("abc") runs once.',
  },
  {
    id: 'cc-t35-pure-toggle-todo',
    topicId: 't35-immutability-pure-functions',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Pure Immutable Todo Toggle',
    scenario: 'Workspace: React state updates without mutating arrays or items',
    taskPrompt:
      'Write pure function `toggleTodoById(todos, id)` that returns a new array where only the matching todo has `done: !todo.done`, without mutating `todos` or any todo object.',
    starterJs: `function toggleTodoById(todos, id) {
  return todos;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Toggles target immutably',
        inputSummary: 'toggleTodoById([{id:1, done:false}, {id:2, done:true}], 1)',
        expectedSummary: 'new array toggled, original untouched',
        checkExpression: `(() => {
          const orig = [{ id: 1, done: false }, { id: 2, done: true }];
          const next = toggleTodoById(orig, 1);
          return { actual: [next[0].done, orig[0].done, next !== orig], expected: [true, false, true] };
        })()`,
      },
    ],
    hints: [
      'Use `.map()` to create a new array.',
      'When `t.id === id`, return `{ ...t, done: !t.done }`; otherwise return `t`.',
      'return todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));',
      'Pure functions produce predictable state transitions and enable React memoization.',
    ],
    solutionJs: `function toggleTodoById(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}`,
    dryRun: 'Item 1 gets a new object { id: 1, done: true }; orig[0].done stays false.',
  },
  {
    id: 'cc-t36-memoize-cache',
    topicId: 't36-memory-performance',
    kind: 'logical',
    difficulty: 'Advanced',
    title: 'Single-Argument Memoizer with Map Cache',
    scenario: 'Performance: Caching expensive pure computations',
    taskPrompt:
      'Write `memoize(fn)` using a `Map` so calling the returned function with the same argument returns the cached result without re-running `fn` (even if the cached value is `0`, `false`, or `undefined`).',
    starterJs: `function memoize(fn) {
  const cache = new Map();
  return function (arg) {
    return fn(arg);
  };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Computes once per unique key (including falsy 0 result)',
        inputSummary: 'memoized fn called twice with 5 and twice with 0',
        expectedSummary: '[10, 10, 0, 0, 2]',
        checkExpression: `(() => {
          let calls = 0;
          const double = memoize((x) => { calls++; return x * 2; });
          return { actual: [double(5), double(5), double(0), double(0), calls], expected: [10, 10, 0, 0, 2] };
        })()`,
      },
    ],
    hints: [
      'Check `cache.has(arg)` — NOT `if (cache.get(arg))` — so falsy return values like `0` are still cached!',
      'If not cached, compute `const val = fn(arg); cache.set(arg, val); return val;`.',
      'if (cache.has(arg)) return cache.get(arg);',
      '`Map.prototype.has` checks key existence accurately even for `0`, `""`, `false`, and `undefined`.',
    ],
    solutionJs: `function memoize(fn) {
  const cache = new Map();
  return function (arg) {
    if (cache.has(arg)) return cache.get(arg);
    const value = fn(arg);
    cache.set(arg, value);
    return value;
  };
}`,
    dryRun: 'double(0) computes 0, stores 0->0; second double(0) hits cache.has(0) -> calls stays 2.',
  },
  {
    id: 'cc-t36b-mini-expect',
    topicId: 't36b-testing-fundamentals',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'Build a Mini Unit Test Runner Assertion',
    scenario: 'Testing Fundamentals: How Vitest/Jest `expect().toBe()` works under the hood',
    taskPrompt:
      'Write `runSuite(cases)` where each case is `{ name, actual, expected }`. Return `{ passed, failed, failures }` where `failures` lists the `name` of any case where `!Object.is(actual, expected)`.',
    starterJs: `function runSuite(cases) {
  return { passed: 0, failed: 0, failures: [] };
}`,
    testCases: [
      {
        id: 't1',
        label: 'Reports passes and failures accurately',
        inputSummary: 'runSuite([pass, fail, NaN===NaN])',
        expectedSummary: `{ passed: 2, failed: 1, failures: ['tax calc'] }`,
        checkExpression: `{ actual: runSuite([{ name: 'add', actual: 4, expected: 4 }, { name: 'tax calc', actual: 10, expected: 11 }, { name: 'nan', actual: NaN, expected: NaN }]), expected: { passed: 2, failed: 1, failures: ['tax calc'] } }`,
      },
      {
        id: 't2',
        label: 'Hidden: empty test suite',
        hidden: true,
        inputSummary: 'runSuite([])',
        expectedSummary: '{ passed: 0, failed: 0, failures: [] }',
        checkExpression: `{ actual: runSuite([]), expected: { passed: 0, failed: 0, failures: [] } }`,
      },
    ],
    hints: [
      'Use `Object.is(c.actual, c.expected)` so `NaN` equals `NaN` just like Jest/Vitest `toBe`.',
      'Increment `passed` when true; otherwise increment `failed` and push `c.name` into `failures`.',
      'Return `{ passed, failed, failures }`.',
      'Automated assertions replace manual console checking with repeatable verification.',
    ],
    solutionJs: `function runSuite(cases) {
  let passed = 0;
  let failed = 0;
  const failures = [];
  for (const c of cases) {
    if (Object.is(c.actual, c.expected)) {
      passed += 1;
    } else {
      failed += 1;
      failures.push(c.name);
    }
  }
  return { passed, failed, failures };
}`,
    dryRun: 'add passes, tax calc fails, NaN passes via Object.is -> { passed: 2, failed: 1, failures: ["tax calc"] }.',
  },
  {
    id: 'cc-t36c-guard-clause-refactor',
    topicId: 't36c-clean-code-organization',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Clean Guard Clauses for Shipping Quote',
    scenario: 'Clean Code: Flattening nested conditionals into readable early returns',
    taskPrompt:
      'Write `getShippingFee(order)` using early returns: return `null` if `!order || order.total < 0`; return `0` if `order.isMember || order.total >= 100`; return `15` if `order.express`; otherwise return `7`.',
    starterJs: `function getShippingFee(order) {
  // Prefer flat early-return guard clauses
  return 0;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Handles member, free threshold, express, standard',
        inputSummary: '4 shipping scenarios',
        expectedSummary: '[0, 0, 15, 7]',
        checkExpression: `{ actual: [getShippingFee({ total: 20, isMember: true }), getShippingFee({ total: 120 }), getShippingFee({ total: 40, express: true }), getShippingFee({ total: 40 })], expected: [0, 0, 15, 7] }`,
      },
      {
        id: 't2',
        label: 'Hidden: null or negative order returns null',
        hidden: true,
        inputSummary: '[getShippingFee(null), getShippingFee({ total: -5 })]',
        expectedSummary: '[null, null]',
        checkExpression: `{ actual: [getShippingFee(null), getShippingFee({ total: -5 })], expected: [null, null] }`,
      },
    ],
    hints: [
      'Check invalid input first (`if (!order || order.total < 0) return null;`).',
      'Then handle free shipping (`if (order.isMember || order.total >= 100) return 0;`).',
      'Finish with `return order.express ? 15 : 7;`.',
      'Guard clauses eliminate deeply nested `if/else` pyramids.',
    ],
    solutionJs: `function getShippingFee(order) {
  if (!order || order.total < 0) return null;
  if (order.isMember || order.total >= 100) return 0;
  return order.express ? 15 : 7;
}`,
    dryRun: 'Every branch exits early with maximum nesting depth 1.',
  },
  {
    id: 'cc-t36d-two-sum-linear',
    topicId: 't36d-performance-security-basics',
    kind: 'logical',
    difficulty: 'Advanced',
    title: 'O(n) Two-Sum Pair Finder (No Nested Loops)',
    scenario: 'Performance & Big-O: Replacing O(n²) with O(n) hash lookup',
    taskPrompt:
      'Write `hasPairWithSum(nums, target)` that returns `true` if two DISTINCT indices in `nums` sum to `target`, else `false`. Avoid nested `for` loops by using a `Set`.',
    restrictions: [
      {
        id: 'no-nested-for',
        label: 'No nested for loops (O(n) required)',
        forbiddenPattern: '\\bfor\\s*\\([\\s\\S]*\\bfor\\s*\\(',
        violationMessage: 'Use a single pass with a `Set` to achieve O(n) time instead of nested O(n²) loops.',
      },
    ],
    starterJs: `function hasPairWithSum(nums, target) {
  // Single pass using a Set of seen numbers
  return false;
}`,
    testCases: [
      {
        id: 't1',
        label: 'Finds valid pair',
        inputSummary: 'hasPairWithSum([2, 7, 11, 15], 9)',
        expectedSummary: 'true',
        checkExpression: `{ actual: hasPairWithSum([2, 7, 11, 15], 9), expected: true }`,
      },
      {
        id: 't2',
        label: 'Does not reuse same single element twice',
        inputSummary: 'hasPairWithSum([5, 1, 2], 10)',
        expectedSummary: 'false',
        checkExpression: `{ actual: hasPairWithSum([5, 1, 2], 10), expected: false }`,
      },
      {
        id: 't3',
        label: 'Hidden: duplicate values and negative numbers',
        hidden: true,
        inputSummary: '[hasPairWithSum([5, 5], 10), hasPairWithSum([-4, 10, 2], 6), hasPairWithSum([], 0)]',
        expectedSummary: '[true, true, false]',
        checkExpression: `{ actual: [hasPairWithSum([5, 5], 10), hasPairWithSum([-4, 10, 2], 6), hasPairWithSum([], 0)], expected: [true, true, false] }`,
      },
    ],
    hints: [
      'For each number `n`, check if its complement `target - n` is already in `seen`.',
      'Check `seen.has(target - n)` BEFORE calling `seen.add(n)` so an element never pairs with itself.',
      'const seen = new Set(); for (const n of nums) { if (seen.has(target - n)) return true; seen.add(n); } return false;',
      'Replacing nested loops with a `Set` reduces 10,000 items from 100,000,000 checks to at most 10,000.',
    ],
    solutionJs: `function hasPairWithSum(nums, target) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(target - n)) return true;
    seen.add(n);
  }
  return false;
}`,
    dryRun: '[5, 1, 2], target=10: checks 5 (not in seen), adds 5; checks 9; checks 8 -> returns false.',
  },
];
