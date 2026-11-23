import type { CodingChallengeItem } from '../../types/practiceBank';

/**
 * Completes 100% dual coverage (Coding Lab & Tests + Find the Bug!)
 * across every single one of the 43 curriculum topics.
 */
export const CODING_CHALLENGES_PART_3: CodingChallengeItem[] = [
  // t06a: Missing debug
  {
    id: 'dbg-t06a-last-element',
    topicId: 't06a-array-foundations',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Reading Last Element with arr[arr.length]',
    scenario: 'Breadcrumb helper always returns undefined for last item',
    taskPrompt: 'Fix `getFirstAndLast(arr)` so it returns `[first, last]`, or `null` for an empty array.',
    starterJs: `function getFirstAndLast(arr) {
  if (arr.length === 0) return null;
  return [arr[0], arr[arr.length]]; // Bug: last index is length - 1!
}`,
    bugDiagnosis: {
      question: 'Why is `arr[arr.length]` always `undefined`?',
      options: [
        'Arrays are 0-indexed, so valid indices run from `0` to `arr.length - 1`.',
        '`arr.length` is only valid on strings, not arrays.',
        'JavaScript arrays cannot be indexed with expressions.',
      ],
      correctIndex: 0,
      explanation: 'The last element is at `arr[arr.length - 1]` (or `arr.at(-1)`).',
    },
    testCases: [
      { id: 't1', label: 'Returns first and last', inputSummary: 'getFirstAndLast([10, 20, 30])', expectedSummary: '[10, 30]', checkExpression: `{ actual: getFirstAndLast([10, 20, 30]), expected: [10, 30] }` },
      { id: 't2', label: 'Hidden: single element & empty', hidden: true, inputSummary: '[getFirstAndLast([7]), getFirstAndLast([])]', expectedSummary: '[[7, 7], null]', checkExpression: `{ actual: [getFirstAndLast([7]), getFirstAndLast([])], expected: [[7, 7], null] }` },
    ],
    hints: [
      'Check the index used for the last element.',
      'Subtract 1 from `arr.length`: `arr[arr.length - 1]`.',
      'return [arr[0], arr[arr.length - 1]];',
      'Zero-based indexing means an array of length 3 has indices 0, 1, 2.',
    ],
    solutionJs: `function getFirstAndLast(arr) {
  if (arr.length === 0) return null;
  return [arr[0], arr[arr.length - 1]];
}`,
    dryRun: '[10, 20, 30] -> length 3 -> arr[0]=10, arr[2]=30.',
  },

  // t06: Missing coding
  {
    id: 'cc-t06-csv-insert-splice',
    topicId: 't06-array-basics-methods',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'Immutable Insert & Join Pipeline',
    scenario: 'Workspace: Inserting a featured item at index 1 and joining tags',
    taskPrompt: 'Write `insertAtAndJoin(list, index, value)` that returns a NEW string joined by `" | "` with `value` inserted at `index` (clamped `0..list.length`), without mutating `list`.',
    starterJs: `function insertAtAndJoin(list, index, value) {
  return '';
}`,
    testCases: [
      { id: 't1', label: 'Inserts at index 1 without mutating input', inputSummary: 'insertAtAndJoin(["A","C"], 1, "B")', expectedSummary: '"A | B | C" and input stays ["A","C"]', checkExpression: `(() => { const a = ['A','C']; return { actual: [insertAtAndJoin(a, 1, 'B'), a], expected: ['A | B | C', ['A','C']] }; })()` },
      { id: 't2', label: 'Hidden: empty list and out-of-bounds index', hidden: true, inputSummary: 'insertAtAndJoin([], 5, "Solo")', expectedSummary: '"Solo"', checkExpression: `{ actual: insertAtAndJoin([], 5, 'Solo'), expected: 'Solo' }` },
    ],
    hints: [
      'Copy `list` first (`const copy = [...list]`) before calling `.splice(safeIdx, 0, value)`.',
      'Clamp index: `const safeIdx = Math.max(0, Math.min(list.length, index));`.',
      'Return `copy.join(" | ")`.',
      'Copying before `.splice()` keeps the caller’s array immutable.',
    ],
    solutionJs: `function insertAtAndJoin(list, index, value) {
  const copy = [...list];
  const safeIdx = Math.max(0, Math.min(copy.length, index));
  copy.splice(safeIdx, 0, value);
  return copy.join(' | ');
}`,
    dryRun: '["A","C"] copied -> splice(1,0,"B") -> ["A","B","C"].join(" | ") -> "A | B | C".',
  },

  // t08: Missing debug
  {
    id: 'dbg-t08-findindex-zero',
    topicId: 't08-filter-find-index',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Treating Index 0 as Not Found',
    scenario: 'Updating the first item in a list fails because `if (idx)` treats 0 as falsy',
    taskPrompt: 'Fix `hasUser(users, id)` so it returns `true` even when the matching user is at index `0`.',
    starterJs: `function hasUser(users, id) {
  const idx = users.findIndex((u) => u.id === id);
  return Boolean(idx > 0); // Bug: index 0 is valid!
}`,
    bugDiagnosis: {
      question: 'Why does `hasUser([{ id: 1 }], 1)` return `false`?',
      options: [
        '`findIndex()` returns `0` for the first item and `-1` when missing — checking `idx > 0` wrongly rejects index `0`.',
        '`findIndex()` starts counting at `1`.',
        '`Boolean()` always returns `false` for numbers.',
      ],
      correctIndex: 0,
      explanation: 'Always check `idx !== -1` (or `idx >= 0`) when using `indexOf` or `findIndex`.',
    },
    testCases: [
      { id: 't1', label: 'Finds item at index 0', inputSummary: 'hasUser([{ id: 1 }, { id: 2 }], 1)', expectedSummary: 'true', checkExpression: `{ actual: hasUser([{ id: 1 }, { id: 2 }], 1), expected: true }` },
      { id: 't2', label: 'Hidden: missing id and empty list', hidden: true, inputSummary: '[hasUser([{ id: 1 }], 9), hasUser([], 1)]', expectedSummary: '[false, false]', checkExpression: `{ actual: [hasUser([{ id: 1 }], 9), hasUser([], 1)], expected: [false, false] }` },
    ],
    hints: [
      'What does `findIndex()` return when an item is NOT found?',
      'Change `idx > 0` to `idx !== -1`.',
      'return users.findIndex((u) => u.id === id) !== -1;',
      'Index `0` is a valid first match; only `-1` means not found.',
    ],
    solutionJs: `function hasUser(users, id) {
  return users.findIndex((u) => u.id === id) !== -1;
}`,
    dryRun: 'id=1 -> idx=0 !== -1 -> true; id=9 -> idx=-1 -> false.',
  },

  // t10: Missing debug
  {
    id: 'dbg-t10-default-null',
    topicId: 't10-functions-defaults',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Default Parameter Bypassed by null',
    scenario: 'API passes `taxRate: null` and multiplies price by null (0)',
    taskPrompt: 'Fix `applyTax(price, taxRate = 0.1)` so passing `undefined` OR `null` for `taxRate` uses `0.1`, while explicit `0` uses `0`.',
    starterJs: `function applyTax(price, taxRate = 0.1) {
  return Number((price * (1 + taxRate)).toFixed(2)); // Bug: null skips default!
}`,
    bugDiagnosis: {
      question: 'Why does `applyTax(100, null)` return `100` instead of `110`?',
      options: [
        'ES6 default parameters ONLY trigger for `undefined`, NOT `null` — `1 + null` coerces to `1 + 0 = 1`.',
        '`taxRate = 0.1` is invalid syntax in JavaScript.',
        '`toFixed(2)` strips the tax rate.',
      ],
      correctIndex: 0,
      explanation: 'Combine default params with `const rate = taxRate ?? 0.1;` to handle both `undefined` and `null` safely.',
    },
    testCases: [
      { id: 't1', label: 'Handles null and undefined', inputSummary: '[applyTax(100, null), applyTax(100)]', expectedSummary: '[110, 110]', checkExpression: `{ actual: [applyTax(100, null), applyTax(100)], expected: [110, 110] }` },
      { id: 't2', label: 'Hidden: preserves explicit 0% tax', hidden: true, inputSummary: 'applyTax(100, 0)', expectedSummary: '100', checkExpression: `{ actual: applyTax(100, 0), expected: 100 }` },
    ],
    hints: [
      'Normalize `taxRate` inside the function using `??`.',
      'const rate = taxRate ?? 0.1;',
      'return Number((price * (1 + rate)).toFixed(2));',
      '`??` handles both `null` and `undefined` while preserving `0`.',
    ],
    solutionJs: `function applyTax(price, taxRate = 0.1) {
  const rate = taxRate ?? 0.1;
  return Number((price * (1 + rate)).toFixed(2));
}`,
    dryRun: 'null ?? 0.1 -> 0.1 -> 110; 0 ?? 0.1 -> 0 -> 100.',
  },

  // t11: Missing coding
  {
    id: 'cc-t11-arrow-pipeline',
    topicId: 't11-arrow-functions',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Concise Arrow Function Mapper & Predicate',
    scenario: 'Writing concise, readable arrow callbacks',
    taskPrompt: 'Write an arrow function `squarePositives = (nums) => ...` that filters `n > 0` and squares each surviving number.',
    starterJs: `const squarePositives = (nums) => [];`,
    testCases: [
      { id: 't1', label: 'Filters positives and squares them', inputSummary: 'squarePositives([-3, 0, 2, 4])', expectedSummary: '[4, 16]', checkExpression: `{ actual: squarePositives([-3, 0, 2, 4]), expected: [4, 16] }` },
      { id: 't2', label: 'Hidden: empty or all negative', hidden: true, inputSummary: '[squarePositives([]), squarePositives([-1, -5])]', expectedSummary: '[[], []]', checkExpression: `{ actual: [squarePositives([]), squarePositives([-1, -5])], expected: [[], []] }` },
    ],
    hints: [
      'Chain `.filter((n) => n > 0)` and `.map((n) => n * n)`.',
      'No curly braces or `return` keyword needed for concise expressions.',
      'const squarePositives = (nums) => nums.filter((n) => n > 0).map((n) => n * n);',
      'Concise arrow callbacks shine in declarative array pipelines.',
    ],
    solutionJs: `const squarePositives = (nums) => nums.filter((n) => n > 0).map((n) => n * n);`,
    dryRun: '[-3, 0, 2, 4] -> filter [2, 4] -> map [4, 16].',
  },

  // t12: Missing debug
  {
    id: 'dbg-t12-invoking-callback-too-early',
    topicId: 't12-callbacks-hof',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Invoking Callback Immediately Instead of Passing It',
    scenario: 'Higher-order runner throws "fn is not a function"',
    taskPrompt: 'Fix `runTwice(value, transform)` so it calls `transform` twice sequentially (`transform(transform(value))`), and fix `doubleTwice(n)` so it passes `double` as a callback reference.',
    starterJs: `function double(x) { return x * 2; }
function runTwice(value, transform) {
  return transform(transform(value));
}
function doubleTwice(n) {
  return runTwice(n, double(n)); // Bug: calling double(n) passes a number, not a function!
}`,
    bugDiagnosis: {
      question: 'Why does `runTwice(n, double(n))` throw `TypeError: transform is not a function`?',
      options: [
        'Writing `double(n)` invokes `double` immediately and passes its numeric return value instead of the function reference `double`.',
        'Functions cannot be passed as arguments in JavaScript.',
        '`runTwice` cannot call `transform` twice.',
      ],
      correctIndex: 0,
      explanation: 'Pass the function identifier `double` without `()` so the higher-order function invokes it when needed.',
    },
    testCases: [
      { id: 't1', label: 'Doubles twice (3 -> 6 -> 12)', inputSummary: 'doubleTwice(3)', expectedSummary: '12', checkExpression: `{ actual: doubleTwice(3), expected: 12 }` },
      { id: 't2', label: 'Hidden: zero and negative', hidden: true, inputSummary: '[doubleTwice(0), doubleTwice(-5)]', expectedSummary: '[0, -20]', checkExpression: `{ actual: [doubleTwice(0), doubleTwice(-5)], expected: [0, -20] }` },
    ],
    hints: [
      'Look at the second argument passed to `runTwice(...)`.',
      'Remove `(n)` so you pass `double` itself.',
      'return runTwice(n, double);',
      'Passing `fn` vs `fn()` is the #1 callback mistake in DOM events and React `onClick`.',
    ],
    solutionJs: `function double(x) { return x * 2; }
function runTwice(value, transform) {
  return transform(transform(value));
}
function doubleTwice(n) {
  return runTwice(n, double);
}`,
    dryRun: 'doubleTwice(3) -> runTwice(3, double) -> double(double(3)) -> double(6) -> 12.',
  },

  // t14: Missing debug
  {
    id: 'dbg-t14-dot-vs-bracket',
    topicId: 't14-object-notations-methods',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Dot Notation Used for Dynamic Key',
    scenario: 'Dynamic lookup always reads literal property named "key"',
    taskPrompt: 'Fix `readProp(obj, key, fallback)` so it reads the dynamic property `key` from `obj` and returns `fallback` if missing/undefined.',
    starterJs: `function readProp(obj, key, fallback = null) {
  return obj.key ?? fallback; // Bug: looks for literal "key"!
}`,
    bugDiagnosis: {
      question: 'Why does `readProp({ role: "admin" }, "role")` return `null`?',
      options: [
        'Dot notation `obj.key` looks up the literal property `"key"`, whereas bracket notation `obj[key]` evaluates the variable `key`.',
        'Objects cannot store string keys.',
        '`??` does not work on objects.',
      ],
      correctIndex: 0,
      explanation: 'Always use bracket notation `obj?.[key]` when the property name comes from a variable.',
    },
    testCases: [
      { id: 't1', label: 'Reads dynamic key', inputSummary: 'readProp({ role: "admin" }, "role")', expectedSummary: '"admin"', checkExpression: `{ actual: readProp({ role: 'admin' }, 'role'), expected: 'admin' }` },
      { id: 't2', label: 'Hidden: null object and missing key', hidden: true, inputSummary: '[readProp(null, "a", "x"), readProp({ a: 0 }, "a", 9)]', expectedSummary: '["x", 0]', checkExpression: `{ actual: [readProp(null, 'a', 'x'), readProp({ a: 0 }, 'a', 9)], expected: ['x', 0] }` },
    ],
    hints: [
      'Replace `obj.key` with bracket notation.',
      'Use `obj?.[key] ?? fallback`.',
      'return obj?.[key] ?? fallback;',
      'Bracket notation evaluates the variable inside `[...]`, and `?.` guards null objects.',
    ],
    solutionJs: `function readProp(obj, key, fallback = null) {
  return obj?.[key] ?? fallback;
}`,
    dryRun: 'readProp({ role: "admin" }, "role") -> obj?.["role"] -> "admin".',
  },

  // t15: Missing debug
  {
    id: 'dbg-t15-mutate-in-map',
    topicId: 't15-array-of-objects',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Mutating Objects Inside .map()',
    scenario: 'Applying a preview discount mutates the original catalog items',
    taskPrompt: 'Fix `previewDiscount(products, pct)` so it returns new objects with discounted `price` while keeping the original `products` prices untouched.',
    starterJs: `function previewDiscount(products, pct) {
  return products.map((p) => {
    p.price = Number((p.price * (1 - pct)).toFixed(2)); // Bug: mutates original object!
    return p;
  });
}`,
    bugDiagnosis: {
      question: 'Why did the original `products` array change even though `.map()` returns a new array?',
      options: [
        'Each `p` inside `.map()` is a reference to the original object in Heap — assigning `p.price = ...` mutates it directly.',
        '`.map()` modifies arrays in place.',
        '`toFixed(2)` mutates objects globally.',
      ],
      correctIndex: 0,
      explanation: 'Return a shallow copy `{ ...p, price: ... }` inside `.map()` to keep original records immutable.',
    },
    testCases: [
      { id: 't1', label: 'Discounts copy without mutating original', inputSummary: 'previewDiscount([{ name: "Bag", price: 100 }], 0.2)', expectedSummary: '[80, 100]', checkExpression: `(() => { const items = [{ name: 'Bag', price: 100 }]; const next = previewDiscount(items, 0.2); return { actual: [next[0].price, items[0].price], expected: [80, 100] }; })()` },
    ],
    hints: [
      'Create a fresh object with spread `{ ...p, price: ... }`.',
      'Do not assign to `p.price`.',
      'return products.map((p) => ({ ...p, price: Number((p.price * (1 - pct)).toFixed(2)) }));',
      'Immutable object updates prevent side-effect bugs in React and shared stores.',
    ],
    solutionJs: `function previewDiscount(products, pct) {
  return products.map((p) => ({
    ...p,
    price: Number((p.price * (1 - pct)).toFixed(2)),
  }));
}`,
    dryRun: 'Original stays 100, mapped copy has price 80.',
  },

  // t16: Missing debug
  {
    id: 'dbg-t16-destructure-undefined',
    topicId: 't16-destructuring-optional',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Destructuring Missing Argument Throws TypeError',
    scenario: 'Calling `formatBadge()` with no argument crashes app',
    taskPrompt: 'Fix `formatBadge({ name = "Guest", tier = "Free" })` so calling `formatBadge()` with no arguments returns `"Guest (Free)"`.',
    starterJs: `function formatBadge({ name = 'Guest', tier = 'Free' }) {
  return name + ' (' + tier + ')'; // Bug: crashes when called with no args!
}`,
    bugDiagnosis: {
      question: 'Why does `formatBadge()` throw `TypeError: Cannot destructure property "name" of "undefined"`?',
      options: [
        'Without `= {}` on the parameter object itself, JS tries to destructure `undefined` when no argument is passed.',
        'Default values inside `{ ... }` are not allowed in parameters.',
        'String concatenation fails when `name` is `"Guest"`.',
      ],
      correctIndex: 0,
      explanation: 'Add `= {}` after the destructured parameter pattern: `function formatBadge({ name = "Guest", tier = "Free" } = {})`.',
    },
    testCases: [
      { id: 't1', label: 'Works with no argument and partial object', inputSummary: '[formatBadge(), formatBadge({ name: "Mia" })]', expectedSummary: '["Guest (Free)", "Mia (Free)"]', checkExpression: `{ actual: [formatBadge(), formatBadge({ name: 'Mia' })], expected: ['Guest (Free)', 'Mia (Free)'] }` },
    ],
    hints: [
      'Provide a default empty object `{}` for the entire parameter.',
      'Write `function formatBadge({ name = "Guest", tier = "Free" } = {})`.',
      'That way omitting the argument falls back to `{}`, which then applies inner property defaults.',
      'Essential pattern for reusable JS utilities and React/Node config objects.',
    ],
    solutionJs: `function formatBadge({ name = 'Guest', tier = 'Free' } = {}) {
  return name + ' (' + tier + ')';
}`,
    dryRun: 'formatBadge() -> {} -> name="Guest", tier="Free" -> "Guest (Free)".',
  },

  // t17: Missing debug
  {
    id: 'dbg-t17-spread-override-order',
    topicId: 't17-rest-spread',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Spread Order Overwrites New Patch',
    scenario: 'Updating user status keeps reverting back to old status',
    taskPrompt: 'Fix `mergeDefaults(defaults, overrides)` so keys in `overrides` always win over `defaults`, without mutating either input.',
    starterJs: `function mergeDefaults(defaults, overrides) {
  return { ...overrides, ...defaults }; // Bug: defaults comes last and overwrites overrides!
}`,
    bugDiagnosis: {
      question: 'Why did `overrides` lose to `defaults`?',
      options: [
        'In object literals, later properties overwrite earlier ones — `...defaults` must come FIRST and `...overrides` LAST.',
        'Spread only copies the first object.',
        'Object keys are merged alphabetically.',
      ],
      correctIndex: 0,
      explanation: 'Place base defaults first and specific overrides after: `{ ...defaults, ...overrides }`.',
    },
    testCases: [
      { id: 't1', label: 'Overrides win over defaults', inputSummary: 'mergeDefaults({ retries: 3, theme: "light" }, { theme: "dark" })', expectedSummary: '{ retries: 3, theme: "dark" }', checkExpression: `{ actual: mergeDefaults({ retries: 3, theme: 'light' }, { theme: 'dark' }), expected: { retries: 3, theme: 'dark' } }` },
    ],
    hints: [
      'Swap the order of the two spreads.',
      'return { ...defaults, ...overrides };',
      'Later keys win in JS object spread.',
      'Neither input object is mutated.',
    ],
    solutionJs: `function mergeDefaults(defaults, overrides) {
  return { ...defaults, ...overrides };
}`,
    dryRun: 'defaults copied first, overrides overwrites matching keys cleanly.',
  },

  // t18: Missing coding
  {
    id: 'cc-t18-deep-clone-nested',
    topicId: 't18-reference-deep-clone',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'Deep Clone & Modify Nested Cart Item',
    scenario: 'Cloning nested structures cleanly with structuredClone()',
    taskPrompt: 'Write `addTagToDraft(doc, tag)` that deep-clones `doc` (which has `meta.tags` array), pushes `tag` onto the clone’s `meta.tags`, and leaves `doc.meta.tags` completely unchanged.',
    starterJs: `function addTagToDraft(doc, tag) {
  return doc;
}`,
    testCases: [
      { id: 't1', label: 'Adds tag without mutating original nested array', inputSummary: 'addTagToDraft({ meta: { tags: ["js"] } }, "web")', expectedSummary: 'clone has ["js","web"], orig has ["js"]', checkExpression: `(() => { const d = { meta: { tags: ['js'] } }; const c = addTagToDraft(d, 'web'); return { actual: [c.meta.tags, d.meta.tags], expected: [['js', 'web'], ['js']] }; })()` },
    ],
    hints: [
      'Use `const clone = structuredClone(doc);` (or spread every level).',
      'Push `tag` into `clone.meta.tags` and return `clone`.',
      'const clone = structuredClone(doc); clone.meta.tags.push(tag); return clone;',
      '`structuredClone()` deep-copies nested objects and arrays safely.',
    ],
    solutionJs: `function addTagToDraft(doc, tag) {
  const clone = structuredClone(doc);
  clone.meta.tags.push(tag);
  return clone;
}`,
    dryRun: 'clone.meta.tags is a brand-new heap array -> original doc.meta.tags stays ["js"].',
  },

  // t19: Missing coding
  {
    id: 'cc-t19-call-apply-format',
    topicId: 't19-this-call-apply-bind',
    kind: 'logical',
    difficulty: 'Intermediate',
    title: 'Explicit Context Borrowing with .call() and .apply()',
    scenario: 'Invoking a shared formatter function with explicit `this` receiver',
    taskPrompt: 'Write `formatWithContext(fn, ctx, argsArray)` that invokes `fn` with `this = ctx` and passes `argsArray` as positional arguments using `.apply()`.',
    starterJs: `function formatWithContext(fn, ctx, argsArray) {
  return null;
}`,
    testCases: [
      { id: 't1', label: 'Applies context and arguments', inputSummary: 'formatWithContext(fn, { prefix: "ID" }, [42, "OK"])', expectedSummary: '"ID-42-OK"', checkExpression: `(() => { function fmt(a, b) { return this.prefix + '-' + a + '-' + b; } return { actual: formatWithContext(fmt, { prefix: 'ID' }, [42, 'OK']), expected: 'ID-42-OK' }; })()` },
    ],
    hints: [
      'Remember: `.call(ctx, a, b)` takes comma-separated args; `.apply(ctx, [a, b])` takes an array.',
      'Return `fn.apply(ctx, argsArray)`.',
      'Or `fn.call(ctx, ...argsArray)` also works equivalently.',
      'Explicit binding gives total control over `this`.',
    ],
    solutionJs: `function formatWithContext(fn, ctx, argsArray) {
  return fn.apply(ctx, argsArray);
}`,
    dryRun: 'fn runs with this={prefix:"ID"}, a=42, b="OK" -> "ID-42-OK".',
  },

  // t20: Missing debug
  {
    id: 'dbg-t20-shared-proto-array',
    topicId: 't20-prototypes-chain',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Shared Mutable Array on Prototype',
    scenario: 'Pushing to one user’s permissions leaks into ALL users',
    taskPrompt: 'Fix `createUser(name)` so each created user has its OWN independent `roles` array while still inheriting `describe()` from `userProto`.',
    starterJs: `const userProto = {
  roles: [], // Bug: shared mutable array on prototype!
  describe() { return this.name + ':' + this.roles.join(','); },
};
function createUser(name) {
  const u = Object.create(userProto);
  u.name = name;
  return u;
}`,
    bugDiagnosis: {
      question: 'Why does `u1.roles.push("admin")` also add `"admin"` to `u2.roles`?',
      options: [
        '`roles` lives on `userProto`, so `u1.roles.push(...)` mutates the SINGLE shared array on the prototype instead of an own array per instance.',
        '`Object.create()` copies all methods into global scope.',
        'Arrays cannot be stored on objects created with `Object.create()`.',
      ],
      correctIndex: 0,
      explanation: 'Keep methods on the prototype, and initialize mutable data like `u.roles = []` as an OWN property per instance.',
    },
    testCases: [
      { id: 't1', label: 'Isolates roles between users while keeping describe()', inputSummary: 'u1.roles.push("admin"); [u1.describe(), u2.describe()]', expectedSummary: '["Ada:admin", "Lin:"]', checkExpression: `(() => { const a = createUser('Ada'); const b = createUser('Lin'); a.roles.push('admin'); return { actual: [a.describe(), b.describe()], expected: ['Ada:admin', 'Lin:'] }; })()` },
    ],
    hints: [
      'Assign `u.roles = [];` inside `createUser(name)`.',
      'Remove the shared `roles: []` from `userProto`.',
      'Each instance now owns its own `roles` array while sharing `describe()` via prototype.',
      'Never store mutable arrays or objects directly on a shared prototype.',
    ],
    solutionJs: `const userProto = {
  describe() { return this.name + ':' + this.roles.join(','); },
};
function createUser(name) {
  const u = Object.create(userProto);
  u.name = name;
  u.roles = [];
  return u;
}`,
    dryRun: 'a.roles is ["admin"], b.roles remains [].',
  },

  // t21: Missing debug
  {
    id: 'dbg-t21-missing-super',
    topicId: 't21-es6-classes-super',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Using `this` Before Calling `super()`',
    scenario: 'Subclass constructor crashes with ReferenceError',
    taskPrompt: 'Fix `AdminUser` so `new AdminUser("Nia", 3)` properly initializes `this.name = "Nia"` and `this.level = 3`.',
    starterJs: `class BaseUser {
  constructor(name) { this.name = name; }
}
class AdminUser extends BaseUser {
  constructor(name, level) {
    this.level = level; // Bug: accessing this before super()!
    super(name);
  }
}`,
    bugDiagnosis: {
      question: 'Why does `new AdminUser("Nia", 3)` throw a `ReferenceError`?',
      options: [
        'In a derived class (`extends`), `this` is uninitialized until `super(...)` executes.',
        'ES6 classes cannot have two constructor parameters.',
        '`level` is a reserved keyword in classes.',
      ],
      correctIndex: 0,
      explanation: 'Always call `super(...)` BEFORE reading or assigning `this` inside a subclass constructor.',
    },
    testCases: [
      { id: 't1', label: 'Constructs AdminUser cleanly', inputSummary: 'new AdminUser("Nia", 3)', expectedSummary: '["Nia", 3, true]', checkExpression: `(() => { const a = new AdminUser('Nia', 3); return { actual: [a.name, a.level, a instanceof BaseUser], expected: ['Nia', 3, true] }; })()` },
    ],
    hints: [
      'Move `super(name);` above `this.level = level;`.',
      'super(name); this.level = level;',
      'Parent constructor allocates `this` before the subclass adds fields.',
      'Simple ordering fix eliminates the ReferenceError.',
    ],
    solutionJs: `class BaseUser {
  constructor(name) { this.name = name; }
}
class AdminUser extends BaseUser {
  constructor(name, level) {
    super(name);
    this.level = level;
  }
}`,
    dryRun: 'super("Nia") initializes this.name -> this.level = 3.',
  },

  // t22: Missing debug
  {
    id: 'dbg-t22-map-bracket-bug',
    topicId: 't22-set-map-iterators',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Using Bracket Syntax on a Map',
    scenario: '`map[key] = val` leaves `map.size === 0`',
    taskPrompt: 'Fix `buildPriceMap(entries)` so `[["apple", 2], ["pear", 3]]` populates a `Map` with `.size === 2` and `.get("pear") === 3`.',
    starterJs: `function buildPriceMap(entries) {
  const m = new Map();
  for (const [k, v] of entries) {
    m[k] = v; // Bug: sets plain object property instead of Map entry!
  }
  return m;
}`,
    bugDiagnosis: {
      question: 'Why is `m.size` still `0` after running `m[k] = v`?',
      options: [
        '`m[k] = v` attaches ordinary JS object properties instead of calling `m.set(k, v)`, so `Map` methods (`size`, `get`, `has`) ignore them.',
        '`for...of` cannot iterate nested arrays.',
        '`Map` keys cannot be strings.',
      ],
      correctIndex: 0,
      explanation: 'Always use `m.set(k, v)` and `m.get(k)` (never `m[k]`) when working with `Map`.',
    },
    testCases: [
      { id: 't1', label: 'Populates Map via .set()', inputSummary: 'buildPriceMap([["apple", 2], ["pear", 3]])', expectedSummary: '[2, 3]', checkExpression: `(() => { const m = buildPriceMap([['apple', 2], ['pear', 3]]); return { actual: [m.size, m.get('pear')], expected: [2, 3] }; })()` },
    ],
    hints: [
      'Replace `m[k] = v` with `m.set(k, v)`.',
      'Or simply `return new Map(entries);`.',
      'm.set(k, v);',
      'Map stores entries internally via `.set`/`.get`/`.has`/`.delete`.',
    ],
    solutionJs: `function buildPriceMap(entries) {
  const m = new Map();
  for (const [k, v] of entries) {
    m.set(k, v);
  }
  return m;
}`,
    dryRun: 'm.set("apple", 2), m.set("pear", 3) -> size 2, get("pear") = 3.',
  },

  // t23: Missing debug
  {
    id: 'dbg-t23-xss-missing-amp',
    topicId: 't23-dom-selection-xss',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Escaper Leaves Closing `>` Unescaped',
    scenario: 'Partial HTML sanitizer allows tag injection',
    taskPrompt: 'Fix `sanitizeSnippet(text)` so BOTH `<` and `>` are escaped into `&lt;` and `&gt;`.',
    starterJs: `function sanitizeSnippet(text) {
  return String(text).replace('<', '&lt;'); // Bug: only replaces first '<' and misses '>'!
}`,
    bugDiagnosis: {
      question: 'Why does `sanitizeSnippet("<b>hi</b>")` still leave `>` and the second `<` unescaped?',
      options: [
        '`.replace("<", ...)` only replaces the first `<` and never escapes `>`.',
        'Strings cannot contain `&lt;`.',
        '`String(text)` strips angle brackets.',
      ],
      correctIndex: 0,
      explanation: 'Use `.replaceAll("<", "&lt;").replaceAll(">", "&gt;")` (or a regex map) so every `<` and `>` is neutralized.',
    },
    testCases: [
      { id: 't1', label: 'Escapes all < and >', inputSummary: 'sanitizeSnippet("<b>hi</b>")', expectedSummary: '"&lt;b&gt;hi&lt;/b&gt;"', checkExpression: `{ actual: sanitizeSnippet('<b>hi</b>'), expected: '&lt;b&gt;hi&lt;/b&gt;' }` },
    ],
    hints: [
      'Use `.replaceAll()` for both `<` and `>`.',
      'return String(text).replaceAll("<", "&lt;").replaceAll(">", "&gt;");',
      'Escaping all angle brackets neutralizes HTML tag injection.',
      'In DOM code, prefer `el.textContent = text` directly.',
    ],
    solutionJs: `function sanitizeSnippet(text) {
  return String(text).replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}`,
    dryRun: '"<b>hi</b>" -> "&lt;b&gt;hi&lt;/b&gt;".',
  },

  // t24: Missing debug
  {
    id: 'dbg-t24-whitespace-submit',
    topicId: 't24-events-forms-prevent',
    kind: 'debug',
    difficulty: 'Basic',
    title: 'Find the Bug: Whitespace-Only Form Passes Validation',
    scenario: 'Users submit blank comments by pressing Spacebar',
    taskPrompt: 'Fix `isValidComment(text)` so empty or whitespace-only strings return `false` and non-empty comments up to 140 trimmed chars return `true`.',
    starterJs: `function isValidComment(text) {
  return text.length > 0 && text.length <= 140; // Bug: "   " has length 3!
}`,
    bugDiagnosis: {
      question: 'Why does `isValidComment("     ")` pass validation?',
      options: [
        'Spaces count toward `.length` — you must `.trim()` input before checking length.',
        '`<= 140` is always true for strings.',
        '`text.length` ignores spaces.',
      ],
      correctIndex: 0,
      explanation: 'Always trim user text (`const clean = String(text ?? "").trim()`) before validating non-emptiness.',
    },
    testCases: [
      { id: 't1', label: 'Rejects spaces and accepts valid comment', inputSummary: '[isValidComment("   "), isValidComment("  Great! ")]', expectedSummary: '[false, true]', checkExpression: `{ actual: [isValidComment('   '), isValidComment('  Great! ')], expected: [false, true] }` },
    ],
    hints: [
      'Trim `text` first: `const clean = String(text ?? "").trim();`.',
      'Return `clean.length > 0 && clean.length <= 140;`.',
      'Handling `null`/`undefined` via `?? ""` also prevents crashes.',
      'Trimming form fields is a universal validation rule.',
    ],
    solutionJs: `function isValidComment(text) {
  const clean = String(text ?? '').trim();
  return clean.length > 0 && clean.length <= 140;
}`,
    dryRun: '"   " -> "" (len 0 -> false); "  Great! " -> "Great!" (len 6 -> true).',
  },

  // t25: Missing debug
  {
    id: 'dbg-t25-delegation-target-bug',
    topicId: 't25-event-bubbling-delegation',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Checking Only Direct Target Breaks Nested Icon Clicks',
    scenario: 'Clicking the `<span>` icon inside a delete button does nothing',
    taskPrompt: 'Fix `resolveButtonId(target)` so it checks `target` AND walks `.parent` until finding a node with `tag === "BUTTON"`, returning its `id` or `null`.',
    starterJs: `function resolveButtonId(target) {
  if (target && target.tag === 'BUTTON') return target.id; // Bug: misses nested <span> clicks!
  return null;
}`,
    bugDiagnosis: {
      question: 'Why does clicking an icon `<span>` inside `<button>` fail when you only check `target.tag === "BUTTON"`?',
      options: [
        '`event.target` is the deepest clicked child (`<span>`), so you must walk up parent elements (like `e.target.closest("button")`).',
        '`<button>` elements do not fire click events.',
        'Icons stop events from reaching `document`.',
      ],
      correctIndex: 0,
      explanation: 'Walking up the parent chain (just like `.closest("button")`) catches clicks on any nested icon or label.',
    },
    testCases: [
      { id: 't1', label: 'Finds button from nested icon', inputSummary: 'icon -> button(id:"del-7")', expectedSummary: '"del-7"', checkExpression: `{ actual: resolveButtonId({ tag: 'SPAN', parent: { tag: 'BUTTON', id: 'del-7', parent: null } }), expected: 'del-7' }` },
      { id: 't2', label: 'Hidden: returns null when outside button', hidden: true, inputSummary: 'div -> null', expectedSummary: 'null', checkExpression: `{ actual: resolveButtonId({ tag: 'DIV', parent: null }), expected: null }` },
    ],
    hints: [
      'Loop `let cur = target; while (cur) { ... cur = cur.parent; }`.',
      'Return `cur.id` as soon as `cur.tag === "BUTTON"`.',
      'Return `null` if the loop ends without finding a button.',
      'Mirrors `event.target.closest("button")` in real DOM event delegation.',
    ],
    solutionJs: `function resolveButtonId(target) {
  let cur = target;
  while (cur) {
    if (cur.tag === 'BUTTON') return cur.id;
    cur = cur.parent ?? null;
  }
  return null;
}`,
    dryRun: 'SPAN -> parent BUTTON -> returns "del-7".',
  },

  // t26: Missing debug
  {
    id: 'dbg-t26-regex-global-state',
    topicId: 't26-regex-validation',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Stateful `/g` Regex Fails Every Other `.test()` Call',
    scenario: 'Validator alternates true, false, true, false on identical valid codes',
    taskPrompt: 'Fix `isHexColor(code)` so calling it repeatedly on `"#ff00aa"` ALWAYS returns `true` and invalid strings return `false`.',
    starterJs: `const HEX_RE = /^#[0-9a-f]{6}$/gi; // Bug: /g flag advances lastIndex on .test()!
function isHexColor(code) {
  return HEX_RE.test(code);
}`,
    bugDiagnosis: {
      question: 'Why does `HEX_RE.test("#ff00aa")` return `true` first and `false` on the second call?',
      options: [
        'A `/g` regex remembers `lastIndex` across `.test()` calls, so the second call starts searching at index 7 (end of string) and fails.',
        'The `/i` flag only works once per string.',
        'Hex colors require 8 characters.',
      ],
      correctIndex: 0,
      explanation: 'Never add the `/g` flag to a validation regex used with `.test()` — remove `g` so `HEX_RE` is stateless.',
    },
    testCases: [
      { id: 't1', label: 'Repeated calls stay true', inputSummary: '[isHexColor("#ff00aa"), isHexColor("#ff00aa"), isHexColor("123")]', expectedSummary: '[true, true, false]', checkExpression: `{ actual: [isHexColor('#ff00aa'), isHexColor('#ff00aa'), isHexColor('123')], expected: [true, true, false] }` },
    ],
    hints: [
      'Check the flags at the end of `HEX_RE`.',
      'Remove the `g` flag so it is `/^#[0-9a-f]{6}$/i`.',
      'Without `g`, `.test()` never mutates `lastIndex`.',
      'Classic JS regex bug caught easily by calling `.test()` twice in unit tests.',
    ],
    solutionJs: `const HEX_RE = /^#[0-9a-f]{6}$/i;
function isHexColor(code) {
  return HEX_RE.test(code);
}`,
    dryRun: 'Every call tests from index 0 cleanly -> [true, true, false].',
  },

  // t27: Missing coding
  {
    id: 'cc-t27-json-storage-helper',
    topicId: 't27-json-web-storage',
    kind: 'realLife',
    difficulty: 'Basic',
    title: 'Safe JSON Round-Trip Serializer (Stripping Undefined)',
    scenario: 'Workspace: Predicting what survives `JSON.stringify` / `JSON.parse`',
    taskPrompt: 'Write `serializePayload(obj)` that returns a JSON string containing ONLY keys whose values are NOT `undefined` and NOT functions (standard `JSON.stringify`), or `"{}"` if `obj` is nullish.',
    starterJs: `function serializePayload(obj) {
  return '{}';
}`,
    testCases: [
      { id: 't1', label: 'Serializes clean JSON and guards null', inputSummary: '[serializePayload({ a: 1, b: undefined, fn: () => {} }), serializePayload(null)]', expectedSummary: `['{"a":1}', '{}']`, checkExpression: `{ actual: [serializePayload({ a: 1, b: undefined, fn: () => {} }), serializePayload(null)], expected: ['{"a":1}', '{}'] }` },
    ],
    hints: [
      'Guard `if (!obj || typeof obj !== "object") return "{}";`.',
      'Call `JSON.stringify(obj)` — it automatically omits `undefined` and function properties.',
      'return JSON.stringify(obj);',
      'Knowing that `JSON.stringify` drops `undefined` and functions avoids subtle API bugs.',
    ],
    solutionJs: `function serializePayload(obj) {
  if (!obj || typeof obj !== 'object') return '{}';
  return JSON.stringify(obj);
}`,
    dryRun: '{ a: 1, b: undefined } -> \'{"a":1}\'; null -> \'{}\'.',
  },

  // t27b: Missing coding
  {
    id: 'cc-t27b-error-classifier',
    topicId: 't27b-debugging-devtools',
    kind: 'logical',
    difficulty: 'Basic',
    title: 'Error Type Inspector Utility',
    scenario: 'Debugging: Classifying JS runtime errors by error.name',
    taskPrompt: 'Write `inspectExecution(fn)` that runs `fn()` inside `try/catch` and returns `{ ok: true, result }` or `{ ok: false, errorType: err.name }`.',
    starterJs: `function inspectExecution(fn) {
  return { ok: false, errorType: '' };
}`,
    testCases: [
      { id: 't1', label: 'Identifies TypeError and SyntaxError', inputSummary: 'JSON.parse("{") & null.x', expectedSummary: '["SyntaxError", "TypeError", 9]', checkExpression: `{ actual: [inspectExecution(() => JSON.parse('{')).errorType, inspectExecution(() => (null).x).errorType, inspectExecution(() => 9).result], expected: ['SyntaxError', 'TypeError', 9] }` },
    ],
    hints: [
      'Wrap `fn()` in `try { return { ok: true, result: fn() }; } catch (err) { ... }`.',
      'Return `{ ok: false, errorType: err.name }`.',
      'Distinguishing `TypeError`, `ReferenceError`, `SyntaxError`, and `RangeError` speeds up debugging.',
      'DevTools stack traces always open with `err.name: err.message`.',
    ],
    solutionJs: `function inspectExecution(fn) {
  try {
    return { ok: true, result: fn() };
  } catch (err) {
    return { ok: false, errorType: err.name };
  }
}`,
    dryRun: 'JSON.parse("{") throws SyntaxError -> { ok: false, errorType: "SyntaxError" }.',
  },

  // t28: Missing debug
  {
    id: 'dbg-t28-swallowed-error',
    topicId: 't28-try-catch-finally',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Division by Zero Silently Returns Infinity',
    scenario: 'Invoice unit-price helper leaks `Infinity` into database',
    taskPrompt: 'Fix `safeDivide(a, b)` so `b === 0` throws `new Error("Division by zero")` instead of returning `Infinity`, and normal divisions return `a / b`.',
    starterJs: `function safeDivide(a, b) {
  return a / b; // Bug: JS returns Infinity instead of throwing!
}`,
    bugDiagnosis: {
      question: 'Why does `10 / 0` NOT enter a `catch` block automatically in JavaScript?',
      options: [
        'IEEE-754 floating-point division by zero evaluates to `Infinity` (or `NaN` for `0/0`) without throwing — you must explicitly `throw new Error(...)`.',
        '`try/catch` only catches network errors.',
        'JavaScript rounds `10 / 0` to `0`.',
      ],
      correctIndex: 0,
      explanation: 'Guard invalid domain inputs explicitly with `if (b === 0) throw new Error("Division by zero")`.',
    },
    testCases: [
      { id: 't1', label: 'Divides cleanly and throws on 0', inputSummary: 'safeDivide(10, 2) & safeDivide(10, 0)', expectedSummary: '[5, true]', checkExpression: `(() => { let threw = false; try { safeDivide(10, 0); } catch (e) { threw = e instanceof Error; } return { actual: [safeDivide(10, 2), threw], expected: [5, true] }; })()` },
    ],
    hints: [
      'Check `if (b === 0) throw new Error("Division by zero");`.',
      'Otherwise return `a / b`.',
      'Always throw `Error` objects (not raw strings) so stack traces are preserved.',
      'Explicit domain guards prevent `Infinity`/`NaN` corruption.',
    ],
    solutionJs: `function safeDivide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}`,
    dryRun: 'safeDivide(10, 2) -> 5; safeDivide(10, 0) -> throws Error.',
  },

  // t29: Missing debug
  {
    id: 'dbg-t29-sync-vs-microtask',
    topicId: 't29-event-loop',
    kind: 'debug',
    difficulty: 'Advanced',
    title: 'Find the Bug: Reading Async Result Synchronously',
    scenario: 'Function returns empty value before Promise microtask runs',
    taskPrompt: 'Fix `fetchGreeting()` so it returns a Promise resolving to `"ready"` instead of returning `""` before `.then()` executes.',
    starterJs: `function fetchGreeting() {
  let msg = '';
  Promise.resolve('ready').then((v) => { msg = v; });
  return msg; // Bug: returns '' synchronously before microtask runs!
}`,
    bugDiagnosis: {
      question: 'Why does `fetchGreeting()` return `""` even though `Promise.resolve("ready")` is already resolved?',
      options: [
        '`.then()` callbacks ALWAYS run asynchronously in the Microtask Queue AFTER the synchronous `return msg` completes.',
        '`Promise.resolve()` takes 1 full second to resolve.',
        '`let msg` cannot be reassigned inside `.then()`.',
      ],
      correctIndex: 0,
      explanation: 'Return the Promise chain itself (`return Promise.resolve("ready").then(...)`) or use `async/await`.',
    },
    testCases: [
      { id: 't1', label: 'Resolves to "ready"', inputSummary: 'await fetchGreeting()', expectedSummary: '"ready"', checkExpression: `(async () => ({ actual: await fetchGreeting(), expected: 'ready' }))()` },
    ],
    hints: [
      'You cannot synchronously return an asynchronously resolved value — return the Promise.',
      'return Promise.resolve("ready"); (or `async function fetchGreeting() { return await Promise.resolve("ready"); }`).',
      'Returning the Promise lets callers `await` the settled value.',
      'Microtasks never preempt currently running synchronous code.',
    ],
    solutionJs: `async function fetchGreeting() {
  return await Promise.resolve('ready');
}`,
    dryRun: 'await fetchGreeting() waits for microtask -> returns "ready".',
  },

  // t30: Missing coding
  {
    id: 'cc-t30-promise-delay',
    topicId: 't30-promises-chaining',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Promisified Value Pipeline with Fallback Recovery',
    scenario: 'Workspace: Chaining `.then()` and recovering gracefully with `.catch()`',
    taskPrompt: 'Write `parseAsyncJson(raw)` that returns a Promise resolving to the parsed JSON object, or `{ fallback: true }` if `raw` is invalid JSON (using `.then` and `.catch`).',
    starterJs: `function parseAsyncJson(raw) {
  return Promise.resolve(raw);
}`,
    testCases: [
      { id: 't1', label: 'Parses valid JSON and recovers on invalid JSON', inputSummary: 'valid & invalid JSON', expectedSummary: '[{ ok: 1 }, { fallback: true }]', checkExpression: `(async () => ({ actual: [await parseAsyncJson('{"ok":1}'), await parseAsyncJson('{bad')], expected: [{ ok: 1 }, { fallback: true }] }))()` },
    ],
    hints: [
      'Chain `.then((str) => JSON.parse(str))` onto `Promise.resolve(raw)`.',
      'Attach `.catch(() => ({ fallback: true }))` to recover from thrown `SyntaxError`.',
      'return Promise.resolve(raw).then((s) => JSON.parse(s)).catch(() => ({ fallback: true }));',
      'Any synchronous throw inside `.then()` automatically rejects the Promise into `.catch()`.',
    ],
    solutionJs: `function parseAsyncJson(raw) {
  return Promise.resolve(raw)
    .then((str) => JSON.parse(str))
    .catch(() => ({ fallback: true }));
}`,
    dryRun: '"{bad" throws inside .then -> caught by .catch -> resolves to { fallback: true }.',
  },

  // t31: Missing coding
  {
    id: 'cc-t31-async-retry',
    topicId: 't31-async-await-fetch',
    kind: 'realLife',
    difficulty: 'Intermediate',
    title: 'Async Fetch Retry Helper with `async/await`',
    scenario: 'Workspace: Retrying flaky network calls up to `maxAttempts`',
    taskPrompt: 'Write `async function retryAsync(fn, maxAttempts = 3)` that awaits `fn()`. If it rejects, retry until `maxAttempts` is exhausted, then re-throw the last error.',
    starterJs: `async function retryAsync(fn, maxAttempts = 3) {
  return await fn();
}`,
    testCases: [
      { id: 't1', label: 'Succeeds on 3rd attempt', inputSummary: 'fails twice, succeeds 3rd time', expectedSummary: '"ok"', checkExpression: `(async () => { let tries = 0; const res = await retryAsync(async () => { tries++; if (tries < 3) throw new Error('temp'); return 'ok'; }, 3); return { actual: res, expected: 'ok' }; })()` },
      { id: 't2', label: 'Hidden: throws after maxAttempts exhausted', hidden: true, inputSummary: 'always rejects with 2 attempts', expectedSummary: 'throws "down"', checkExpression: `(async () => { try { await retryAsync(async () => { throw new Error('down'); }, 2); return { actual: 'no-throw', expected: 'down' }; } catch (e) { return { actual: e.message, expected: 'down' }; } })()` },
    ],
    hints: [
      'Loop `for (let attempt = 1; attempt <= maxAttempts; attempt++)` with `try { return await fn(); } catch (err) { ... }`.',
      'If `attempt === maxAttempts`, `throw err;`.',
      'Returning inside `try` exits immediately on first success.',
      'Essential resilience pattern for real-world REST/MERN API clients.',
    ],
    solutionJs: `async function retryAsync(fn, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}`,
    dryRun: 'Attempt 1 throws -> attempt 2 throws -> attempt 3 returns "ok".',
  },

  // t32: Missing debug
  {
    id: 'dbg-t32-sequential-waterfall',
    topicId: 't32-async-concurrency',
    kind: 'debug',
    difficulty: 'Advanced',
    title: 'Find the Bug: Unhandled Promise.all Failure Crashes Dashboard',
    scenario: 'One failing optional widget blanks out all other widgets',
    taskPrompt: 'Fix `loadWidgets(fetchers)` so it uses `Promise.allSettled` and returns an array of ONLY the fulfilled widget values (ignoring rejected ones).',
    starterJs: `async function loadWidgets(fetchers) {
  return await Promise.all(fetchers.map((fn) => fn())); // Bug: 1 rejection rejects all!
}`,
    bugDiagnosis: {
      question: 'Why does `Promise.all()` discard the successful widgets when 1 widget fails?',
      options: [
        '`Promise.all()` is fail-fast: a single rejection immediately rejects the entire batch; use `Promise.allSettled()` for partial tolerance.',
        '`Promise.all()` runs promises sequentially.',
        '`.map()` cannot return promises.',
      ],
      correctIndex: 0,
      explanation: '`Promise.allSettled()` waits for every promise to settle and lets you filter `status === "fulfilled"`.',
    },
    testCases: [
      { id: 't1', label: 'Keeps successful widgets despite 1 failure', inputSummary: '2 ok, 1 fail', expectedSummary: '["sales", "users"]', checkExpression: `(async () => ({ actual: await loadWidgets([async () => 'sales', async () => { throw new Error('500'); }, async () => 'users']), expected: ['sales', 'users'] }))()` },
    ],
    hints: [
      'Swap `Promise.all` for `Promise.allSettled`.',
      'Filter `r.status === "fulfilled"` and map `r.value`.',
      'return settled.filter((r) => r.status === "fulfilled").map((r) => r.value);',
      'Graceful degradation keeps dashboards resilient.',
    ],
    solutionJs: `async function loadWidgets(fetchers) {
  const settled = await Promise.allSettled(fetchers.map((fn) => fn()));
  return settled
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}`,
    dryRun: 'settled has 2 fulfilled + 1 rejected -> returns ["sales", "users"].',
  },

  // t33: Missing debug
  {
    id: 'dbg-t33-mutating-shared-config',
    topicId: 't33-es-modules',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Shared Exported Config Object Mutated Across Callers',
    scenario: 'Module A modifies default headers and breaks Module B',
    taskPrompt: 'Fix `getDefaultHeaders()` so every caller receives a FRESH copy of `{ Accept: "application/json" }` rather than mutating shared module state.',
    starterJs: `const DEFAULT_HEADERS = { Accept: 'application/json' };
function getDefaultHeaders() {
  return DEFAULT_HEADERS; // Bug: callers share & mutate same object!
}`,
    bugDiagnosis: {
      question: 'Why does `const h = getDefaultHeaders(); h.Auth = "x";` leak `Auth` into other modules?',
      options: [
        'Returning the same object reference shares one mutable Heap object across every module that imports it.',
        '`const` objects are always copied on return.',
        'ES Modules automatically sync all variables across tabs.',
      ],
      correctIndex: 0,
      explanation: 'Return a fresh copy `{ ...DEFAULT_HEADERS }` (or freeze shared constants with `Object.freeze`).',
    },
    testCases: [
      { id: 't1', label: 'Isolates header objects across callers', inputSummary: 'mutate h1, inspect h2', expectedSummary: '[true, false]', checkExpression: `(() => { const h1 = getDefaultHeaders(); h1.Auth = 'secret'; const h2 = getDefaultHeaders(); return { actual: [h1.Auth === 'secret', 'Auth' in h2], expected: [true, false] }; })()` },
    ],
    hints: [
      'Return `{ ...DEFAULT_HEADERS }` so each caller owns its own copy.',
      'return { ...DEFAULT_HEADERS };',
      'Prevents cross-module state pollution.',
      'Good module design keeps internal state encapsulated.',
    ],
    solutionJs: `const DEFAULT_HEADERS = Object.freeze({ Accept: 'application/json' });
function getDefaultHeaders() {
  return { ...DEFAULT_HEADERS };
}`,
    dryRun: 'h1 !== h2 -> mutating h1 never leaks to h2.',
  },

  // t34: Missing debug
  {
    id: 'dbg-t34-debounce-missing-clear',
    topicId: 't34-web-timers-observers',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Broken Debounce Fires Every Single Call',
    scenario: 'Search bar still fires 3 API calls instead of 1',
    taskPrompt: 'Fix `makeDebounced(fn, ms)` so rapid calls cancel previous pending timers and invoke `fn` only once with the latest argument.',
    starterJs: `function makeDebounced(fn, ms) {
  let id;
  return (...args) => {
    // Bug: forgot clearTimeout(id)!
    id = setTimeout(() => fn(...args), ms);
  };
}`,
    bugDiagnosis: {
      question: 'Why does `makeDebounced` fire `fn` three times when called three times rapidly?',
      options: [
        'Without `clearTimeout(id)` before scheduling the new timer, every previous timer remains active and fires after `ms`.',
        '`setTimeout` cancels previous timers automatically.',
        'Rest parameters `...args` disable debouncing.',
      ],
      correctIndex: 0,
      explanation: 'Call `clearTimeout(id)` at the start of the debounced wrapper so only the last timer survives.',
    },
    testCases: [
      { id: 't1', label: 'Fires once with final value', inputSummary: 'rapid 1, 2, 3 -> [3]', expectedSummary: '[3]', checkExpression: `(async () => { const seen = []; const d = makeDebounced((x) => seen.push(x), 25); d(1); d(2); d(3); await new Promise((r) => setTimeout(r, 60)); return { actual: seen, expected: [3] }; })()` },
    ],
    hints: [
      'Call `clearTimeout(id);` right before `id = setTimeout(...)`.',
      'That cancels any earlier pending timer.',
      'clearTimeout(id); id = setTimeout(() => fn(...args), ms);',
      'Essential for responsive search inputs and scroll/resize handlers.',
    ],
    solutionJs: `function makeDebounced(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}`,
    dryRun: 'd(1) scheduled -> d(2) cancels 1 -> d(3) cancels 2 -> only 3 fires.',
  },

  // t35: Missing debug
  {
    id: 'dbg-t35-impure-push',
    topicId: 't35-immutability-pure-functions',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Impure Reducer Mutates Input Array',
    scenario: 'React component refuses to re-render when new item is added',
    taskPrompt: 'Fix `appendItemPure(items, newItem)` so it returns a NEW array containing `newItem` without mutating `items`.',
    starterJs: `function appendItemPure(items, newItem) {
  items.push(newItem); // Bug: mutates original array & returns same reference!
  return items;
}`,
    bugDiagnosis: {
      question: 'Why does React ignore state updates when you call `items.push(x); setItems(items)`?',
      options: [
        '`.push()` mutates in place and returns the SAME array reference, so React’s `Object.is(prev, next)` check thinks nothing changed.',
        'React arrays have a maximum length of 10.',
        '`.push()` deletes existing items.',
      ],
      correctIndex: 0,
      explanation: 'Return `[...items, newItem]` so React receives a brand-new array reference.',
    },
    testCases: [
      { id: 't1', label: 'Returns new array without mutating input', inputSummary: 'appendItemPure([1,2], 3)', expectedSummary: '[[1,2,3], [1,2], true]', checkExpression: `(() => { const a = [1, 2]; const b = appendItemPure(a, 3); return { actual: [b, a, a !== b], expected: [[1, 2, 3], [1, 2], true] }; })()` },
    ],
    hints: [
      'Use array spread `[...items, newItem]`.',
      'return [...items, newItem];',
      'Creates a fresh array reference in O(n).',
      'Core rule for React `useState` and Redux reducers.',
    ],
    solutionJs: `function appendItemPure(items, newItem) {
  return [...items, newItem];
}`,
    dryRun: 'a stays [1,2], b is new array [1,2,3], a !== b is true.',
  },

  // t36: Missing debug
  {
    id: 'dbg-t36-memo-falsy-miss',
    topicId: 't36-memory-performance',
    kind: 'debug',
    difficulty: 'Advanced',
    title: 'Find the Bug: Cache Miss on Falsy Result `0`',
    scenario: 'Memoized calculator recomputes every time result is `0`',
    taskPrompt: 'Fix `memoOnce(fn)` so cached results of `0` or `false` are served from cache without calling `fn` again.',
    starterJs: `function memoOnce(fn) {
  const cache = new Map();
  return (x) => {
    if (cache.get(x)) return cache.get(x); // Bug: 0 is falsy -> cache miss!
    const val = fn(x);
    cache.set(x, val);
    return val;
  };
}`,
    bugDiagnosis: {
      question: 'Why does `if (cache.get(x))` recompute `fn(0)` every time when `fn(0)` returns `0`?',
      options: [
        '`0` is falsy, so `if (cache.get(x))` evaluates to `false` even though key `x` IS in the Map; use `cache.has(x)`.',
        '`Map` cannot store the number `0`.',
        '`cache.set()` overwrites keys with `undefined`.',
      ],
      correctIndex: 0,
      explanation: 'Always check key presence with `cache.has(x)`, never truthiness of `cache.get(x)`.',
    },
    testCases: [
      { id: 't1', label: 'Caches falsy 0 result accurately', inputSummary: 'called twice with 0 -> fn runs once', expectedSummary: '[0, 0, 1]', checkExpression: `(() => { let n = 0; const f = memoOnce((x) => { n++; return x * 0; }); return { actual: [f(0), f(0), n], expected: [0, 0, 1] }; })()` },
    ],
    hints: [
      'Replace `if (cache.get(x))` with `if (cache.has(x))`.',
      'if (cache.has(x)) return cache.get(x);',
      'Works cleanly for `0`, `false`, `""`, `null`, and `undefined`.',
      'Presence check !== truthiness check.',
    ],
    solutionJs: `function memoOnce(fn) {
  const cache = new Map();
  return (x) => {
    if (cache.has(x)) return cache.get(x);
    const val = fn(x);
    cache.set(x, val);
    return val;
  };
}`,
    dryRun: 'f(0) stores 0=>0; second f(0) sees cache.has(0)===true -> returns 0 with calls=1.',
  },

  // t36b: Missing debug
  {
    id: 'dbg-t36b-reference-assert-bug',
    topicId: 't36b-testing-fundamentals',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Using `===` to Compare Two Arrays in Tests',
    scenario: 'Unit test fails even though both arrays contain `[1, 2, 3]`',
    taskPrompt: 'Fix `arraysEqual(a, b)` so it compares array lengths and elements by value (like Vitest `toEqual`), returning `true` for `[1,2]` and `[1,2]`.',
    starterJs: `function arraysEqual(a, b) {
  return a === b; // Bug: compares heap references, not elements!
}`,
    bugDiagnosis: {
      question: 'Why does `[1, 2] === [1, 2]` return `false` in JavaScript tests?',
      options: [
        '`===` compares object references in memory, not array contents — two separate array literals have different references.',
        'JavaScript cannot compare numbers inside arrays.',
        'Arrays must be sorted before comparing.',
      ],
      correctIndex: 0,
      explanation: 'In Vitest/Jest use `toEqual()` for deep value equality (`toBe()` is reference equality `Object.is`).',
    },
    testCases: [
      { id: 't1', label: 'Compares equal and unequal arrays by value', inputSummary: 'arraysEqual([1,2], [1,2]) & [1,2] vs [1,3]', expectedSummary: '[true, false, false]', checkExpression: `{ actual: [arraysEqual([1, 2], [1, 2]), arraysEqual([1, 2], [1, 3]), arraysEqual([1], [1, 2])], expected: [true, false, false] }` },
    ],
    hints: [
      'Check `Array.isArray(a) && Array.isArray(b) && a.length === b.length`.',
      'Then verify `a.every((v, i) => Object.is(v, b[i]))`.',
      'Handles empty arrays and different lengths cleanly.',
      'Deep equality is why test frameworks separate `toBe` from `toEqual`.',
    ],
    solutionJs: `function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((v, i) => Object.is(v, b[i]));
}`,
    dryRun: '[1,2] vs [1,2] -> same length and elements -> true.',
  },

  // t36c: Missing debug
  {
    id: 'dbg-t36c-magic-number-bug',
    topicId: 't36c-clean-code-organization',
    kind: 'debug',
    difficulty: 'Intermediate',
    title: 'Find the Bug: Misordered Guard Clauses Mask Invalid Input',
    scenario: 'Negative order total accidentally gets free VIP shipping instead of validation error',
    taskPrompt: 'Fix `validateAndQuote(order)` so invalid orders (`!order || order.total < 0`) ALWAYS return `null` BEFORE checking VIP free shipping.',
    starterJs: `function validateAndQuote(order) {
  if (order?.isVip) return 0; // Bug: checked BEFORE invalid negative total guard!
  if (!order || order.total < 0) return null;
  return 10;
}`,
    bugDiagnosis: {
      question: 'Why did `validateAndQuote({ isVip: true, total: -50 })` return `0` instead of `null`?',
      options: [
        'The VIP early return ran BEFORE the invalid-input guard clause, letting malformed negative totals bypass validation.',
        'Optional chaining `?.` converts `-50` to `0`.',
        'Functions cannot have more than two `if` statements.',
      ],
      correctIndex: 0,
      explanation: 'Always place input validation guards FIRST at the top of a function before business-rule branches.',
    },
    testCases: [
      { id: 't1', label: 'Rejects negative total even for VIP', inputSummary: '[validateAndQuote({ isVip: true, total: -50 }), validateAndQuote({ isVip: true, total: 20 })]', expectedSummary: '[null, 0]', checkExpression: `{ actual: [validateAndQuote({ isVip: true, total: -50 }), validateAndQuote({ isVip: true, total: 20 })], expected: [null, 0] }` },
    ],
    hints: [
      'Move `if (!order || order.total < 0) return null;` to line 1 of the function.',
      'Then check `if (order.isVip) return 0;`, else `return 10;`.',
      'Validation guards always come first.',
      'Clean guard ordering makes invalid states unrepresentable.',
    ],
    solutionJs: `function validateAndQuote(order) {
  if (!order || order.total < 0) return null;
  if (order.isVip) return 0;
  return 10;
}`,
    dryRun: '{ isVip: true, total: -50 } hits line 1 guard -> returns null.',
  },

  // t36d: Missing debug
  {
    id: 'dbg-t36d-quadratic-filter',
    topicId: 't36d-performance-security-basics',
    kind: 'debug',
    difficulty: 'Advanced',
    title: 'Find the Bug: O(n²) Ban Filter & Self-Pair Bug',
    scenario: 'Refactoring slow nested `.includes()` into O(n) `Set.has()`',
    taskPrompt: 'Fix `filterAllowedUsers(users, bannedIds)` so it uses a `Set` (no `.includes()` inside `.filter()`) and returns users whose `id` is NOT in `bannedIds`.',
    restrictions: [
      {
        id: 'no-includes-in-filter',
        label: 'No O(n²) .includes() lookup',
        forbiddenPattern: '\\.includes\\s*\\(',
        violationMessage: 'Pre-index `bannedIds` into `new Set(bannedIds)` and use `.has()` for O(1) lookups.',
      },
    ],
    starterJs: `function filterAllowedUsers(users, bannedIds) {
  return users.filter((u) => !bannedIds.includes(u.id)); // Bug: O(n*m) slow!
}`,
    bugDiagnosis: {
      question: 'Why does `users.filter(u => !bannedIds.includes(u.id))` freeze large dashboards?',
      options: [
        '`Array.includes` scans `bannedIds` linearly for EVERY user (`O(n * m)`), whereas `Set.has` is `O(1)` (`O(n + m)` total).',
        '`.filter()` cannot return objects.',
        'Negating with `!` disables V8 JIT.',
      ],
      correctIndex: 0,
      explanation: 'Create `const bannedSet = new Set(bannedIds)` once before filtering and check `!bannedSet.has(u.id)`.',
    },
    testCases: [
      { id: 't1', label: 'Filters banned users in O(n)', inputSummary: 'filterAllowedUsers([{id:1},{id:2},{id:3}], [2])', expectedSummary: '[{id:1},{id:3}]', checkExpression: `{ actual: filterAllowedUsers([{ id: 1 }, { id: 2 }, { id: 3 }], [2]), expected: [{ id: 1 }, { id: 3 }] }` },
      { id: 't2', label: 'Hidden: empty banned list', hidden: true, inputSummary: 'filterAllowedUsers([{id:1}], [])', expectedSummary: '[{id:1}]', checkExpression: `{ actual: filterAllowedUsers([{ id: 1 }], []), expected: [{ id: 1 }] }` },
    ],
    hints: [
      'Convert `bannedIds` to a `Set`: `const banned = new Set(bannedIds);`.',
      'Return `users.filter((u) => !banned.has(u.id));`.',
      'Drops complexity from O(n²) to O(n).',
      'One of the highest-impact real-world JS performance patterns.',
    ],
    solutionJs: `function filterAllowedUsers(users, bannedIds) {
  const banned = new Set(bannedIds);
  return users.filter((u) => !banned.has(u.id));
}`,
    dryRun: 'banned = Set{2} -> keeps {id:1} and {id:3} in linear time.',
  },
];
