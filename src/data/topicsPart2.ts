import type { JsTopic } from '../types/topic';

const BASE_CSS = `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 18px; color: #0f172a; }
.box { max-width: 440px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; }
h1 { font-size: 16px; margin: 0 0 10px; }
p, li { font-size: 13px; line-height: 1.5; }
input, select { width: 100%; padding: 7px 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
button { padding: 7px 12px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
.out { background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-top: 10px; white-space: pre-wrap; }`;

export const TOPICS_PART_2: JsTopic[] = [
  {
    id: 't10-functions-defaults',
    number: 12,
    categoryId: 'cat-3-functions-scope',
    categoryTitle: '3. Functions, Callbacks & Scope',
    tier: 'Basic',
    title: 'Function Declarations, Expressions & Default Parameters',
    webDevUseCase: 'Building Reusable Helpers with Safe Optional Arguments',
    summary:
      'Compare hoisted function declarations against expressions, use early-return guard clauses, and provide clean default parameter fallbacks.',
    revisionTldr:
      'Declarations hoist; expressions obey `const` TDZ. Default params (`rate = 18`) activate on omitted or `undefined` args. Functions without `return` yield `undefined`.',
    explanation: [
      'A function declaration (`function calc() {}`) can be called above its definition, while a function expression (`const calc = function () {}`) stays in the Temporal Dead Zone until evaluated.',
      'Parameters define the named placeholders in a function signature; arguments are the actual values passed at call time.',
      'ES6 default parameters (`function formatPrice(amt = 0, curr = "₹")`) apply whenever an argument is omitted or explicitly `undefined` (not `null` or `0`).',
    ],
    keyRules: [
      'Return early on invalid inputs (`if (!Number.isFinite(amt)) return 0;`) to avoid deep nested `if` blocks.',
      'Never forget `return` in calculation helpers.',
      'Default parameters can even reference earlier parameters: `(a, b = a * 2)`.',
    ],
    codeExample: `function calcTax(amount = 0, taxPct = 18) {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Number((amount * (1 + taxPct / 100)).toFixed(2));
}

console.log(calcTax(1000));      // 1180 (uses default 18%)
console.log(calcTax(1000, 5));   // 1050`,
    commonMistake: {
      label: 'Forgetting return or defaulting 0 with || inside the function',
      avoid: `function greet(count) {
  const n = count || 1; // count=0 wrongly turns into 1!
}`,
      prefer: `function greet(count = 1) {
  return 'Count: ' + count; // count=0 stays 0!
}`,
    },
    practice: {
      logical: {
        title: 'Default Parameters: undefined vs null vs 0 Trap',
        scenario: 'Exam Question · How ES6 Default Parameters Trigger',
        taskPrompt:
          'In `calculateBonus(points = 50)`, passing `0` points currently gets overwritten to `50` because of `points || 50`, and `null` suppresses the default! Fix `calculateBonus` using a proper ES6 default parameter so `0` stays `0`, `undefined` becomes `50`, and `null` stays `null`.',
        starterHtml: `<div class="box">
  <h1>Default Parameters Exam Check</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `// BUG: Using || inside the body overwrites 0 and null!
function calculateBonus(points) {
  const actual = points || 50;
  return actual;
}

document.getElementById('out').textContent = [
  'calculateBonus(undefined) -> ' + calculateBonus(undefined) + ' (expected 50)',
  'calculateBonus() -> ' + calculateBonus() + ' (expected 50)',
  'calculateBonus(0) -> ' + calculateBonus(0) + ' (expected 0!)',
  'calculateBonus(null) -> ' + String(calculateBonus(null)) + ' (expected null)',
].join('\\n');`,
        solutionJs: `function calculateBonus(points = 50) {
  return points;
}

document.getElementById('out').textContent = [
  'calculateBonus(undefined) -> ' + calculateBonus(undefined) + ' (PASS)',
  'calculateBonus() -> ' + calculateBonus() + ' (PASS)',
  'calculateBonus(0) -> ' + calculateBonus(0) + ' (PASS)',
  'calculateBonus(null) -> ' + String(calculateBonus(null)) + ' (PASS)',
].join('\\n');`,
      },
      realLife: {
        title: 'Freelance Invoice Generator with Optional GST & Discount',
        scenario: 'Daily Life · Reusable Billing Function with Safe Fallbacks',
        taskPrompt:
          'Build `calcInvoice(amount = 0, gstPct = 18, discount = 0)` with early-return validation for negative numbers. When GST is left blank, default cleanly to `18%`, while allowing `0%` GST for tax-exempt services!',
        starterHtml: `<div class="box">
  <h1>Freelance Invoice Calculator</h1>
  <input id="amt" type="text" value="5000" placeholder="Base fee (₹)" />
  <input id="gst" type="text" value="" placeholder="GST % (blank = 18%, 0 = exempt)" />
  <button id="btn-gen" type="button">Generate Invoice</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function calcInvoice(amount = 0, gstPct = 18) {
  // TODO: Guard invalid or negative amount (return 0)
  const tax = amount * (gstPct / 100);
  return { base: amount, gstPct, tax, grandTotal: amount + tax };
}

function render() {
  const amt = Number(document.getElementById('amt').value);
  const rawGst = document.getElementById('gst').value.trim();
  const gstArg = rawGst === '' ? undefined : Number(rawGst);

  const inv = calcInvoice(amt, gstArg);
  document.getElementById('out').textContent =
    'Base: ₹' + inv.base + '\\nGST (' + inv.gstPct + '%): ₹' + inv.tax.toFixed(2) +
    '\\nGrand Total: ₹' + inv.grandTotal.toFixed(2);
}

document.getElementById('btn-gen').addEventListener('click', render);
render();`,
        solutionJs: `function calcInvoice(amount = 0, gstPct = 18) {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(gstPct) || gstPct < 0) {
    return { base: 0, gstPct: 0, tax: 0, grandTotal: 0 };
  }
  const tax = amount * (gstPct / 100);
  return { base: amount, gstPct, tax, grandTotal: amount + tax };
}

function render() {
  const amt = Number(document.getElementById('amt').value);
  const rawGst = document.getElementById('gst').value.trim();
  const gstArg = rawGst === '' ? undefined : Number(rawGst);

  const inv = calcInvoice(amt, gstArg);
  document.getElementById('out').textContent =
    'Base: ₹' + inv.base + '\\nGST (' + inv.gstPct + '%): ₹' + inv.tax.toFixed(2) +
    '\\nGrand Total: ₹' + inv.grandTotal.toFixed(2);
}

document.getElementById('btn-gen').addEventListener('click', render);
render();`,
      },
    },
    quiz: [
      {
        question: 'When does a default parameter (`function f(x = 5)`) use `5`?',
        options: [
          'Whenever `x` is `0`, `""`, or `null`',
          'Only when `x` is omitted or `undefined`',
          'Whenever `x` is any falsy value',
        ],
        correctIndex: 1,
        explanation: 'ES6 default parameters only activate for `undefined` (including omitted arguments), never for `0` or `null`.',
      },
      {
        question: 'What does a JavaScript function return if there is no `return` statement?',
        options: ['null', 'false', 'undefined'],
        correctIndex: 2,
        explanation: 'Every JavaScript function implicitly returns `undefined` if no `return` statement runs.',
      },
    ],
  },
  {
    id: 't11-arrow-functions',
    number: 13,
    categoryId: 'cat-3-functions-scope',
    categoryTitle: '3. Functions, Callbacks & Scope',
    tier: 'Basic',
    title: 'Arrow Functions (=>), Implicit Returns & Object Literals ({})',
    webDevUseCase: 'Clean Inline Array Callbacks & Lexical `this` Preservation',
    summary:
      'Write concise arrow functions, distinguish implicit expressions from `{}` block returns, and wrap returned object literals in parentheses `({})`.',
    revisionTldr:
      'No `{}` = implicit return (`x => x * 2`). With `{}` = explicit `return` required. Object literal return = `x => ({ val: x })`. Arrow functions do NOT have their own `this` or `arguments`.',
    explanation: [
      'Arrow functions (`const fn = (a, b) => a + b`) provide a shorter syntax for inline callbacks and inherit `this` from their surrounding lexical scope rather than rebinding it dynamically.',
      'Without curly braces, the single expression after `=>` is returned automatically. Once you open curly braces `{ ... }`, JavaScript expects statements and returns `undefined` unless you write `return`.',
      'Because `{` starts a block body, implicitly returning an object literal requires parentheses around the object: `id => ({ id, active: true })`.',
    ],
    keyRules: [
      'Wrap object literals in parentheses when returning implicitly: `x => ({ x })`.',
      'Never use arrow functions as object methods or constructors (`new`) when you need dynamic `this`.',
      'Arrow functions are great inside `setTimeout` and `.map()` because they keep the outer `this`.',
    ],
    codeExample: `const double = (n) => n * 2;

const buildUser = (name) => ({
  name,
  role: 'Student',
});

const withSteps = (n) => {
  const sq = n * n;
  return sq + 1;
};

console.log(double(4), buildUser('Asha'), withSteps(4));`,
    commonMistake: {
      label: 'Missing parentheses on implicit object return or missing return in {}',
      avoid: `const list = ids.map((id) => { id: id }); // Returns [undefined, ...]`,
      prefer: `const list = ids.map((id) => ({ id }));`,
    },
    practice: {
      logical: {
        title: 'Arrow Function Object Literal ({}) Return Bug',
        scenario: 'Exam Question · Implicit Block {} vs Object Expression ({})',
        taskPrompt:
          'Why does `makePair` return `undefined` when mapping `[10, 20, 30]`? Because `{ n, sq: n * n }` is parsed as a block label instead of an object! Fix `makePair` using `({})` parentheses.',
        starterHtml: `<div class="box">
  <h1>Arrow Implicit Object Return Fix</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const nums = [10, 20, 30];

// BUG: Arrow thinks { ... } is a function body block, returning undefined!
const makePair = (n) => {
  n: n,
  sq: n * n
};

// Fix makePair above using ({ ... }) so output shows [{ n: 10, sq: 100 }, ...]
document.getElementById('out').textContent = JSON.stringify(nums.map(makePair), null, 2);`,
        solutionJs: `const nums = [10, 20, 30];
const makePair = (n) => ({
  n,
  sq: n * n,
});

document.getElementById('out').textContent = JSON.stringify(nums.map(makePair), null, 2);`,
      },
      realLife: {
        title: 'Product Catalog Card Transformer',
        scenario: 'Daily Life · Shaping Raw Inventory Prices into Storefront Badges',
        taskPrompt:
          'Convert raw warehouse items into storefront card objects `{ name, finalPrice, tag }` using an arrow function with `({})` implicit return, tagging items under ₹500 as `"Budget Pick"`.',
        starterHtml: `<div class="box">
  <h1>Storefront Product Card Mapper</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const warehouse = [
  { name: 'USB Lamp', price: 299 },
  { name: 'Laptop Sleeve', price: 799 },
  { name: 'Screen Wipes', price: 199 },
];

// TODO: Return { name: p.name, finalPrice: p.price, tag: ... } cleanly via arrow ({})
const toStoreCard = (p) => ({
  name: p.name,
  finalPrice: p.price,
  tag: 'Regular',
});

document.getElementById('out').textContent = JSON.stringify(warehouse.map(toStoreCard), null, 2);`,
        solutionJs: `const warehouse = [
  { name: 'USB Lamp', price: 299 },
  { name: 'Laptop Sleeve', price: 799 },
  { name: 'Screen Wipes', price: 199 },
];

const toStoreCard = (p) => ({
  name: p.name,
  finalPrice: p.price,
  tag: p.price < 500 ? 'Budget Pick' : 'Standard',
});

document.getElementById('out').textContent = JSON.stringify(warehouse.map(toStoreCard), null, 2);`,
      },
    },
    quiz: [
      {
        question: 'Why does `const make = (x) => { value: x }` fail to return `{ value: x }`?',
        options: [
          'Arrow functions cannot return objects',
          'Curly braces start a function body block, so it needs `({ value: x })`',
          'The parameter `x` is not in scope',
        ],
        correctIndex: 1,
        explanation: 'Wrap the object literal in parentheses `({ value: x })` so JS parses it as an expression rather than a block.',
      },
      {
        question: 'How do arrow functions resolve `this`?',
        options: [
          'Dynamically from whatever object called them',
          'Lexically from the surrounding outer scope',
          'Always bound to document.body',
        ],
        correctIndex: 1,
        explanation: 'Arrow functions have no own `this`; they capture `this` lexically from their enclosing scope.',
      },
    ],
  },
  {
    id: 't12-callbacks-hof',
    number: 14,
    categoryId: 'cat-3-functions-scope',
    categoryTitle: '3. Functions, Callbacks & Scope',
    tier: 'Intermediate',
    title: 'Callback Concept & Higher-Order Functions',
    webDevUseCase: 'Customizing Behavior in Event Handlers, Timers & API Pipelines',
    summary:
      'Pass functions as arguments into Higher-Order Functions (HOFs), distinguish passing a reference (`fn`) from invoking (`fn()`), and compose flexible callbacks.',
    revisionTldr:
      'Functions are first-class values. An HOF takes or returns a function. Pass `fn` (reference), not `fn()` (runs immediately!).',
    explanation: [
      'In JavaScript, functions are first-class objects—they can be assigned to variables, stored in arrays, passed as arguments (**callbacks**), and returned from other functions.',
      'A **Higher-Order Function (HOF)** either accepts a callback function (`addEventListener`, `setTimeout`, `.map`, `.filter`) or returns a customized function (factories / curried middleware).',
      'Always pass the function reference (`runTask(onDone)`), NOT `runTask(onDone())` which executes `onDone` prematurely and passes `undefined`.',
    ],
    keyRules: [
      'Pass `handler` (no parentheses) or wrap arguments in an arrow `() => handler(id)`.',
      'Separate `onSuccess` and `onError` callbacks cleanly for async or validation flows.',
      'Higher-order factories (`const multiplyBy = n => x => x * n`) enable clean configuration reuse.',
    ],
    codeExample: `function validateAndRun(value, onValid, onInvalid) {
  if (!value.trim()) {
    onInvalid('Value cannot be empty');
    return;
  }
  onValid(value.trim().toUpperCase());
}

validateAndRun(
  ' javascript ',
  (res) => console.log('Success:', res),
  (err) => console.warn('Error:', err)
);`,
    commonMistake: {
      label: 'Calling a callback immediately instead of passing its reference',
      avoid: `btn.addEventListener('click', saveForm()); // Runs on page load!`,
      prefer: `btn.addEventListener('click', saveForm);`,
    },
    practice: {
      logical: {
        title: 'Fix Premature Callback Execution fn() vs fn & Build customFilter',
        scenario: 'Exam Question · Implementing Higher-Order Filter from Scratch',
        taskPrompt:
          'Complete `customFilter(arr, predicateFn)` using a `for...of` loop (returning items where `predicateFn(item)` is truthy), AND fix the button click listener that currently invokes `runChecks()` immediately on page load!',
        starterHtml: `<div class="box">
  <h1>Higher-Order Function Exam Lab</h1>
  <button id="btn-run" type="button">Run Filter Test</button>
  <div id="out" class="out">Waiting for click...</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function customFilter(arr, predicateFn) {
  const result = [];
  // TODO: Loop through arr with for...of and push item if predicateFn(item) is true
  return result;
}

function runChecks() {
  const evens = customFilter([1, 2, 3, 4, 5, 6], (n) => n % 2 === 0);
  document.getElementById('out').textContent = 'Evens (expected [2,4,6]): ' + JSON.stringify(evens);
}

// BUG: Adding () invokes runChecks immediately instead of on click!
document.getElementById('btn-run').addEventListener('click', runChecks());`,
        solutionJs: `function customFilter(arr, predicateFn) {
  const result = [];
  for (const item of arr) {
    if (predicateFn(item)) result.push(item);
  }
  return result;
}

function runChecks() {
  const evens = customFilter([1, 2, 3, 4, 5, 6], (n) => n % 2 === 0);
  document.getElementById('out').textContent = 'Evens: ' + JSON.stringify(evens);
}

document.getElementById('btn-run').addEventListener('click', runChecks);`,
      },
      realLife: {
        title: 'Payment Gateway Callback Dispatcher',
        scenario: 'Daily Life · Routing Success & Error UI Notifications via Callbacks',
        taskPrompt:
          'Complete `processPayment(amount, onSuccess, onFailure)`: if `amount <= 0` or `amount > 50000`, invoke `onFailure(reason)`; otherwise invoke `onSuccess("Paid ₹" + amount)`. Wire both UI buttons cleanly.',
        starterHtml: `<div class="box">
  <h1>UPI Payment Callback Dispatcher</h1>
  <input id="amt" type="text" value="1250" />
  <button id="btn-pay" type="button">Pay Now</button>
  <div id="out" class="out">Enter amount (valid: 1 to 50,000)</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function processPayment(amount, onSuccess, onFailure) {
  // TODO: Validate amount (must be finite, > 0, and <= 50000)
  // Call onSuccess('Paid ₹' + amount + ' via UPI') or onFailure('Limit/amount invalid')
  onFailure('TODO: implement validation callbacks');
}

const showSuccess = (msg) => {
  document.getElementById('out').textContent = 'SUCCESS: ' + msg;
  console.log(msg);
};
const showError = (err) => {
  document.getElementById('out').textContent = 'DECLINED: ' + err;
  console.warn(err);
};

document.getElementById('btn-pay').addEventListener('click', () => {
  const val = Number(document.getElementById('amt').value);
  processPayment(val, showSuccess, showError);
});`,
        solutionJs: `function processPayment(amount, onSuccess, onFailure) {
  if (!Number.isFinite(amount) || amount <= 0) {
    onFailure('Enter an amount greater than ₹0.');
    return;
  }
  if (amount > 50000) {
    onFailure('Exceeds daily UPI limit of ₹50,000.');
    return;
  }
  onSuccess('Paid ₹' + amount + ' via UPI');
}

const showSuccess = (msg) => {
  document.getElementById('out').textContent = 'SUCCESS: ' + msg;
  console.log(msg);
};
const showError = (err) => {
  document.getElementById('out').textContent = 'DECLINED: ' + err;
  console.warn(err);
};

document.getElementById('btn-pay').addEventListener('click', () => {
  const val = Number(document.getElementById('amt').value);
  processPayment(val, showSuccess, showError);
});`,
      },
    },
    quiz: [
      {
        question: 'What makes a function a Higher-Order Function (HOF)?',
        options: [
          'It uses `async` and `await`',
          'It takes one or more functions as arguments OR returns a function',
          'It is declared at the top of the file',
        ],
        correctIndex: 1,
        explanation: 'An HOF accepts callbacks as parameters and/or returns a new function.',
      },
      {
        question: 'Why does `setTimeout(notify(), 1000)` fail to wait 1 second?',
        options: [
          '`notify()` executes immediately during argument evaluation and passes `undefined` to `setTimeout`',
          '`setTimeout` only accepts arrow functions',
          '1000 is too small',
        ],
        correctIndex: 0,
        explanation: 'Adding `()` invokes `notify` right away instead of passing the function reference `notify`.',
      },
    ],
  },
  {
    id: 't13-lexical-scope-closures',
    number: 15,
    categoryId: 'cat-3-functions-scope',
    categoryTitle: '3. Functions, Callbacks & Scope',
    tier: 'Intermediate',
    title: 'Scope, Lexical Environment, Closures & Private State',
    webDevUseCase: 'Private Variables, Closure Factories, Loop Callbacks & Debounced Search',
    summary:
      'Understand lexical environments, how inner functions retain live references to outer variables after the outer function returns, private state encapsulation, closures in loops, and debouncing.',
    revisionTldr:
      'Closure = Function + its remembered outer lexical environment. Use closures to create truly private variables (`createWallet()`), keep `let timerId` outside `debounce()`\'s inner function, and use `let` in `for` loops.',
    explanation: [
      'Lexical scope means a function’s accessible variables are determined by where it is WRITTEN in source code, not where it is called. When an inner function outlives its outer function, it carries a live reference to its outer **Lexical Environment**—forming a **Closure**.',
      'Closures power **private variables** in JavaScript: variables declared inside a factory function (like `let balance = 0` inside `createWallet()`) cannot be tampered with from outside; external code can only interact through the returned methods.',
      'In browser loops (`for (let i = 0; i < 3; i++)`), `let` creates a fresh lexical binding per iteration so every callback remembers its own index (whereas `var i` shares one binding that ends at `3`). Closures also power **Debouncing**: holding `let timerId` outside the returned wrapper lets keystroke handlers cancel previous timers.',
    ],
    keyRules: [
      'A closure captures live variable bindings (references), NOT frozen snapshots of values at creation time.',
      'Factory closures create private state that external scripts cannot accidentally overwrite (`balance`, `timerId`).',
      'Always use `let` (never `var`) in `for` loops containing async callbacks, event listeners, or timers.',
      'Use `debounce(fn, 300)` for search boxes so rapid keystrokes collapse into one delayed call.',
    ],
    codeExample: `// 1. Private state via Closure Factory
function createWallet(initialBalance) {
  let balance = initialBalance; // Private — unreachable outside createWallet
  return {
    deposit(amount) {
      if (amount > 0) balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}
const wallet = createWallet(500);
wallet.deposit(250); // 750 (wallet.balance is undefined!)

// 2. Practical UI Closure: Debounce
function debounce(fn, delayMs) {
  let timerId = null; // Closed over and shared across keystrokes
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delayMs);
  };
}
const search = debounce((q) => console.log('Fetching:', q), 300);`,
    commonMistake: {
      label: 'Declaring timerId inside the returned wrapper or using var in loops',
      avoid: `for (var i = 1; i <= 3; i++) {
  btns[i-1].onclick = () => console.log(i); // Always logs 4!
}`,
      prefer: `for (let i = 1; i <= 3; i++) {
  btns[i-1].onclick = () => console.log(i); // Logs 1, 2, 3!
}`,
    },
    practice: {
      logical: {
        title: 'Classic var-in-Loop Closure Trap (Fix 4, 4, 4 -> 1, 2, 3)',
        scenario: 'Exam Question · Most Famous JS Closure Interview Question',
        taskPrompt:
          'Running this loop prints `4, 4, 4` because `var i` shares a single variable across all async callbacks! Fix the loop with `let` and verify `results` outputs `[1, 2, 3]`.',
        starterHtml: `<div class="box">
  <h1>var vs let Closure Trap</h1>
  <button id="btn-test" type="button">Run Loop Callbacks</button>
  <div id="out" class="out">Click to run async loop callbacks</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `document.getElementById('btn-test').addEventListener('click', () => {
  const captured = [];

  // BUG: Change 'var' to 'let' so each iteration gets its own lexical binding!
  for (var i = 1; i <= 3; i++) {
    setTimeout(() => {
      captured.push(i);
      if (captured.length === 3) {
        document.getElementById('out').textContent =
          'Captured values (expected [1,2,3]): ' + JSON.stringify(captured);
      }
    }, i * 30);
  }
});`,
        solutionJs: `document.getElementById('btn-test').addEventListener('click', () => {
  const captured = [];

  for (let i = 1; i <= 3; i++) {
    setTimeout(() => {
      captured.push(i);
      if (captured.length === 3) {
        document.getElementById('out').textContent =
          'Captured values: ' + JSON.stringify(captured);
      }
    }, i * 30);
  }
});`,
      },
      realLife: {
        title: 'Debounced Live Search Input (Reducing API Calls)',
        scenario: 'Daily Life · E-Commerce Search Box Closure Optimization',
        taskPrompt:
          'In real workspaces, firing a backend search on every keystroke wastes server money! Fix `debounce()` by moving `let timerId = null` OUTSIDE the returned function so the closure cancels stale timers properly.',
        starterHtml: `<div class="box">
  <h1>Debounced Workspace Search</h1>
  <input id="q" type="text" placeholder="Type fast (e.g. laptop)..." />
  <div id="out" class="out">Keystrokes: 0 | API Searches Sent: 0</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function debounce(fn, delay) {
  // BUG: Declaring timerId INSIDE the returned function resets it to null on every keystroke!
  // Move 'let timerId = null;' above 'return (...args) =>'
  return (...args) => {
    let timerId = null;
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

let keys = 0;
let apiCalls = 0;

const runSearch = debounce((query) => {
  apiCalls += 1;
  document.getElementById('out').textContent =
    'Keystrokes: ' + keys + ' | API Searches Sent: ' + apiCalls + ' (Query: "' + query + '")';
}, 400);

document.getElementById('q').addEventListener('input', (e) => {
  keys += 1;
  document.getElementById('out').textContent =
    'Keystrokes: ' + keys + ' | API Searches Sent: ' + apiCalls + ' (typing...)';
  runSearch(e.target.value);
});`,
        solutionJs: `function debounce(fn, delay) {
  let timerId = null;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

let keys = 0;
let apiCalls = 0;

const runSearch = debounce((query) => {
  apiCalls += 1;
  document.getElementById('out').textContent =
    'Keystrokes: ' + keys + ' | API Searches Sent: ' + apiCalls + ' (Query: "' + query + '")';
}, 400);

document.getElementById('q').addEventListener('input', (e) => {
  keys += 1;
  document.getElementById('out').textContent =
    'Keystrokes: ' + keys + ' | API Searches Sent: ' + apiCalls + ' (typing...)';
  runSearch(e.target.value);
});`,
      },
    },
    quiz: [
      {
        question: 'Why does `debounce` declare `let timerId = null` BEFORE `return function(...)`?',
        options: [
          'So `timerId` persists between consecutive calls via closure instead of resetting each time',
          'Because `let` is forbidden inside returned functions',
          'To make `timerId` a global variable on `window`',
        ],
        correctIndex: 0,
        explanation: 'The returned inner function closes over `timerId`, preserving the previous timer ID so `clearTimeout` can cancel it.',
      },
      {
        question: 'What does `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0)` print?',
        options: ['0, 1, 2', '3, 3, 3', 'undefined'],
        correctIndex: 1,
        explanation: '`var` is function-scoped, so all 3 callbacks share the same `i` which equals `3` after the loop finishes.',
      },
    ],
  },
  {
    id: 't14-object-notations-methods',
    number: 16,
    categoryId: 'cat-4-objects-operators',
    categoryTitle: '4. Objects, Operators & Memory Model',
    tier: 'Intermediate',
    title: 'Object Notations, Nested Objects & Anonymous Functions in Objects',
    webDevUseCase: 'Modeling Entities, Nested Profiles & Built-in Object Methods',
    summary:
      'Create object notations with nested sub-objects, read dynamic property keys via `obj[key]`, and attach anonymous or shorthand methods that access `this`.',
    revisionTldr:
      'Use dot (`obj.key`) for known keys and brackets (`obj[varKey]`) for dynamic keys. Use `method: function () {}` or `method() {}` (NOT arrows!) when methods read `this`.',
    explanation: [
      'Object literals (`{ key: value }`) organize structured web data. Nested objects (`user.profile.address.city`) model rich JSON entities naturally.',
      'Use bracket notation (`obj[field]`) when the property name is stored in a variable or contains spaces/hyphens.',
      'Anonymous functions (`getSummary: function () { return this.name; }`) or shorthand methods (`getSummary() { ... }`) bind `this` to the object before the dot. Never use an arrow function as an object method if it needs `this`!',
    ],
    keyRules: [
      'Use `Object.keys(obj)`, `Object.values(obj)`, and `Object.entries(obj)` to inspect keys/values.',
      'Avoid `summary: () => this.name` on objects (`this` points to outer scope, not the object!).',
      'Always check intermediate nested objects or use `?.` when properties might be optional.',
    ],
    codeExample: `const course = {
  title: 'JavaScript Pro',
  meta: { level: 'Intermediate', lessons: 36 },
  describe: function () {
    return this.title + ' (' + this.meta.level + ' · ' + this.meta.lessons + ' topics)';
  },
};

const key = 'title';
console.log(course[key], '|', course.describe());`,
    commonMistake: {
      label: 'Using arrow functions for object methods or dot notation for dynamic keys',
      avoid: `const key = 'role';
console.log(user.key); // Looks for literal "key", returns undefined!
const obj = { name: 'Ana', hi: () => this.name }; // undefined!`,
      prefer: `console.log(user[key]);
const obj = { name: 'Ana', hi: function () { return this.name; } };`,
    },
    practice: {
      logical: {
        title: 'Object Dynamic Key [key] vs .key & Arrow Method this Bug',
        scenario: 'Exam Question · Property Lookup & Anonymous Method Context',
        taskPrompt:
          'Fix two bugs: (1) `readField` uses `obj.fieldName` (reading literal `"fieldName"` instead of the variable) and (2) `user.greet` is an arrow function where `this.name` is `undefined`. Convert `greet` to an anonymous `function ()` method and use `obj[fieldName]`.',
        starterHtml: `<div class="box">
  <h1>Object Notation Exam Bug Hunt</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const user = {
  name: 'Riya',
  role: 'Backend Intern',
  // BUG 1: Arrow method loses 'this'! Change to anonymous function () { ... }
  greet: () => 'Hi, I am ' + this.name,
};

function readField(obj, fieldName) {
  // BUG 2: Dot notation reads literal 'fieldName' instead of parameter value!
  return obj.fieldName;
}

document.getElementById('out').textContent =
  'greet() (expected "Hi, I am Riya"): ' + user.greet() +
  '\\nreadField(user, "role") (expected "Backend Intern"): ' + readField(user, 'role');`,
        solutionJs: `const user = {
  name: 'Riya',
  role: 'Backend Intern',
  greet: function () {
    return 'Hi, I am ' + this.name;
  },
};

function readField(obj, fieldName) {
  return obj[fieldName];
}

document.getElementById('out').textContent =
  'greet(): ' + user.greet() +
  '\\nreadField(user, "role"): ' + readField(user, 'role');`,
      },
      realLife: {
        title: 'Digital Employee / Student ID Card Inspector',
        scenario: 'Daily Life · Nested Campus Profile & Dynamic Field Lookup',
        taskPrompt:
          'Select any field (`email`, `city`, `course`) from the dropdown to inspect a nested student object dynamically, and display `getIdCard()` using an anonymous function inside the object notation.',
        starterHtml: `<div class="box">
  <h1>Student Digital ID Card</h1>
  <select id="field">
    <option value="course">Course</option>
    <option value="year">Batch Year</option>
  </select>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const student = {
  name: 'Kabir Mehta',
  course: 'BCA Final Year',
  year: 2026,
  campus: { city: 'Bengaluru', block: 'Tech Wing B' },
  getIdCard: function () {
    return this.name + ' · ' + this.campus.city + ' (' + this.campus.block + ')';
  },
};

function render() {
  const chosenKey = document.getElementById('field').value;
  // TODO: Read student[chosenKey] dynamically using bracket notation
  const fieldValue = student.chosenKey;
  document.getElementById('out').textContent =
    student.getIdCard() + '\\nSelected [' + chosenKey + ']: ' + fieldValue;
}

document.getElementById('field').addEventListener('change', render);
render();`,
        solutionJs: `const student = {
  name: 'Kabir Mehta',
  course: 'BCA Final Year',
  year: 2026,
  campus: { city: 'Bengaluru', block: 'Tech Wing B' },
  getIdCard: function () {
    return this.name + ' · ' + this.campus.city + ' (' + this.campus.block + ')';
  },
};

function render() {
  const chosenKey = document.getElementById('field').value;
  const fieldValue = student[chosenKey];
  document.getElementById('out').textContent =
    student.getIdCard() + '\\nSelected [' + chosenKey + ']: ' + fieldValue;
}

document.getElementById('field').addEventListener('change', render);
render();`,
      },
    },
    quiz: [
      {
        question: 'If `const prop = "city"`, what does `user.prop` look up?',
        options: [
          'The value of `user["city"]`',
          'A literal property named `"prop"` on `user`',
          'The first key inside `user`',
        ],
        correctIndex: 1,
        explanation: 'Dot notation looks up the literal identifier `"prop"`; use `user[prop]` to evaluate the variable.',
      },
      {
        question: 'Why should an object method needing `this` use `function () {}` instead of `() => {}`?',
        options: [
          'Arrow functions do not bind their own `this` to the object',
          'Arrow functions cannot return strings',
          'Anonymous functions run twice as fast',
        ],
        correctIndex: 0,
        explanation: 'Arrow functions inherit `this` from the enclosing scope rather than the object before the dot.',
      },
    ],
  },
  {
    id: 't15-array-of-objects',
    number: 17,
    categoryId: 'cat-4-objects-operators',
    categoryTitle: '4. Objects, Operators & Memory Model',
    tier: 'Intermediate',
    title: 'Arrays of Object Notations & Transforming Nested Records',
    webDevUseCase: 'Working with API Collections, Tables & Product Catalogs',
    summary:
      'Combine Arrays of Object Notations with chained `.filter()`, `.map()`, `.reduce()`, and `forEach()` pipelines to transform and render structured datasets.',
    revisionTldr:
      'API responses arrive as `[ { id, ... }, { id, ... } ]`. Chain `.filter()` -> `.map()` -> `.forEach()` (or `.reduce()`) immutably without mutating source objects.',
    explanation: [
      'Nearly every real web dataset—products, users, blog posts, notifications—is modeled as an **Array of Object Notations**: `[{ id: 1, ... }, { id: 2, ... }]`.',
      'Updating an item inside an array of objects cleanly means returning a new array via `.map()` and creating a shallow copy of only the matched object (`item.id === targetId ? { ...item, done: true } : item`).',
      'Chaining `.filter().map()` builds clean, readable data pipelines from raw JSON straight to rendered HTML.',
    ],
    keyRules: [
      'Update one record immutably via `items.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x)`.',
      'Never mutate objects inside `.map()` directly (`x.qty += 1`) unless intentionally working on a deep clone.',
      'Sort an array of objects by property cleanly: `[...items].sort((a, b) => a.price - b.price)`.',
    ],
    codeExample: `const orders = [
  { id: 1, customer: 'Amit', total: 1200, paid: true },
  { id: 2, customer: 'Sara', total: 450, paid: false },
  { id: 3, customer: 'Kabir', total: 800, paid: true },
];

const paidSummary = orders
  .filter((o) => o.paid)
  .map((o) => o.customer + ': ₹' + o.total);

console.log(paidSummary);`,
    commonMistake: {
      label: 'Mutating objects inside map() or sorting the original array in place',
      avoid: `const updated = users.map((u) => {
  u.active = true; // Mutates original users array!
  return u;
});`,
      prefer: `const updated = users.map((u) => ({ ...u, active: true }));`,
    },
    practice: {
      logical: {
        title: 'Immutable Update Inside Array of Objects',
        scenario: 'Exam Question · Avoid Mutating Source Objects Inside .map()',
        taskPrompt:
          'Right now `promoteUser()` mutates `u.role = "Admin"` directly inside `originalUsers`, corrupting the source array! Fix `promoteUser` so it returns `{ ...u, role: "Admin" }` while `originalUsers[0].role` stays `"Member"`.',
        starterHtml: `<div class="box">
  <h1>Immutable Array-of-Objects Update</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const originalUsers = [
  { id: 1, name: 'Amit', role: 'Member' },
  { id: 2, name: 'Sara', role: 'Member' },
];

// BUG: Directly assigning u.role mutates originalUsers[0]!
const nextUsers = originalUsers.map((u) => {
  if (u.id === 1) {
    u.role = 'Admin';
  }
  return u;
});

document.getElementById('out').textContent =
  'Original Amit role (expected Member): ' + originalUsers[0].role +
  '\\nUpdated Amit role (expected Admin): ' + nextUsers[0].role;`,
        solutionJs: `const originalUsers = [
  { id: 1, name: 'Amit', role: 'Member' },
  { id: 2, name: 'Sara', role: 'Member' },
];

const nextUsers = originalUsers.map((u) =>
  u.id === 1 ? { ...u, role: 'Admin' } : u
);

document.getElementById('out').textContent =
  'Original Amit role: ' + originalUsers[0].role +
  '\\nUpdated Amit role: ' + nextUsers[0].role;`,
      },
      realLife: {
        title: 'Cafe Order Board (Filter Paid + Sort by Highest Bill)',
        scenario: 'Daily Life · Reporting Paid Table Orders in Real Time',
        taskPrompt:
          'Given an array of cafe order objects, filter only `paid: true` orders, sort a copy `[...orders]` from highest `total` to lowest, and format each line as `"Table # -> ₹total"`.',
        starterHtml: `<div class="box">
  <h1>Cafe Paid Orders Leaderboard</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const orders = [
  { table: 4, customer: 'Amit', total: 420, paid: true },
  { table: 2, customer: 'Sara', total: 980, paid: false },
  { table: 7, customer: 'Kabir', total: 1150, paid: true },
  { table: 1, customer: 'Neha', total: 640, paid: true },
];

// TODO: Chain .filter(paid), .sort(descending by total), and .map()
const report = orders.map((o) => 'Table ' + o.table + ' (' + o.customer + ') -> ₹' + o.total);

document.getElementById('out').textContent = 'Paid Orders (Highest First):\\n' + report.join('\\n');`,
        solutionJs: `const orders = [
  { table: 4, customer: 'Amit', total: 420, paid: true },
  { table: 2, customer: 'Sara', total: 980, paid: false },
  { table: 7, customer: 'Kabir', total: 1150, paid: true },
  { table: 1, customer: 'Neha', total: 640, paid: true },
];

const report = [...orders]
  .filter((o) => o.paid)
  .sort((a, b) => b.total - a.total)
  .map((o) => 'Table ' + o.table + ' (' + o.customer + ') -> ₹' + o.total);

document.getElementById('out').textContent = 'Paid Orders (Highest First):\\n' + report.join('\\n');`,
      },
    },
    quiz: [
      {
        question: 'How do you immutably toggle `done` on item `id === 2` inside an array of objects?',
        options: [
          'items.map(x => x.id === 2 ? { ...x, done: !x.done } : x)',
          'items.forEach(x => { if (x.id === 2) x.done = !x.done; })',
          'items.filter(x => x.id === 2)',
        ],
        correctIndex: 0,
        explanation: '`.map()` produces a new array and `{ ...x, done: !x.done }` creates a new object only for the matching record.',
      },
      {
        question: 'Which order of operations avoids unnecessary work on large arrays of objects?',
        options: [
          'Sort all items, then filter',
          'Filter first to shrink the dataset, then map/sort',
          'Mutate all items with forEach, then sort',
        ],
        correctIndex: 1,
        explanation: 'Filtering first reduces the number of items that subsequent `.map()` or `.sort()` steps must process.',
      },
    ],
  },
  {
    id: 't16-destructuring-optional',
    number: 18,
    categoryId: 'cat-4-objects-operators',
    categoryTitle: '4. Objects, Operators & Memory Model',
    tier: 'Intermediate',
    title: 'Destructuring (Object & Array) & Optional Chaining (?.)',
    webDevUseCase: 'Extracting API Payloads Safely Without Undefined Crashes',
    summary:
      'Unpack properties cleanly with destructuring, rename/default missing keys, and prevent `Cannot read properties of undefined` crashes with `?.`.',
    revisionTldr:
      '`const { name: userName = "Guest" } = user;` unpacks with rename + default. `user?.address?.city ?? "N/A"` safely short-circuits on `null`/`undefined`.',
    explanation: [
      'Object destructuring (`const { title, price = 0 } = item`) extracts properties by name, while array destructuring (`const [first, second] = coords`) extracts by position.',
      'Optional chaining (`?.`) checks whether the left-hand expression is `null` or `undefined` before reading `.prop`, `?.[0]`, or calling `?.()`. If nullish, it returns `undefined` instead of throwing a TypeError.',
      'Combine `?.` with `??` (`order.customer?.address?.city ?? "Digital"`) when reading nested JSON where sub-objects may be absent.',
    ],
    keyRules: [
      'Never deep-destructure nullable paths (`const { a: { b } } = obj`) without a fallback (`= {}`).',
      'Use `onSave?.(data)` to invoke optional callback props safely.',
      'Pair `?.` with `??` so optional strings/numbers have crisp UI fallbacks.',
    ],
    codeExample: `const order = { id: 'ORD-9', customer: { name: 'Vikram' } };
const { id, customer } = order;
const city = customer?.address?.city ?? 'Digital Delivery';
const [primary, secondary = 'CSS'] = ['HTML'];
console.log({ id, city, primary, secondary });`,
    commonMistake: {
      label: 'Deep destructuring an optional nested property',
      avoid: `const { customer: { address: { city } } } = digitalOrder;
// Crashes with TypeError if address is undefined!`,
      prefer: `const city = digitalOrder?.customer?.address?.city ?? 'Digital Delivery';`,
    },
    practice: {
      logical: {
        title: 'Prevent Nested Destructuring TypeError with ?. & ??',
        scenario: 'Exam Question · Safe Unpacking of Nullable API Payloads',
        taskPrompt:
          'Reading `const { profile: { city } } = apiUser` crashes with a `TypeError` when `apiUser.profile` is `undefined`! Fix `extractCity(user)` using optional chaining `?.` and `?? "Unknown"` so both users resolve safely.',
        starterHtml: `<div class="box">
  <h1>Optional Chaining Crash Fix</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function extractCity(apiUser) {
  try {
    // BUG: Crashes when apiUser.profile is missing!
    const { profile: { city } } = apiUser;
    return city;
  } catch (err) {
    return 'CRASHED: ' + err.message;
  }
}

const u1 = { name: 'Asha', profile: { city: 'Mumbai' } };
const u2 = { name: 'Dev' }; // No profile property!

document.getElementById('out').textContent =
  'u1 city: ' + extractCity(u1) + '\\nu2 city (expected Unknown): ' + extractCity(u2);`,
        solutionJs: `function extractCity(apiUser) {
  return apiUser?.profile?.city ?? 'Unknown';
}

const u1 = { name: 'Asha', profile: { city: 'Mumbai' } };
const u2 = { name: 'Dev' };

document.getElementById('out').textContent =
  'u1 city: ' + extractCity(u1) + '\\nu2 city: ' + extractCity(u2);`,
      },
      realLife: {
        title: 'Digital vs Physical Delivery Checkout Reader',
        scenario: 'Daily Life · Handling Optional Shipping Addresses in E-Commerce',
        taskPrompt:
          'Switch between Order #1 (physical book with `address.city` & `address.pincode`) and Order #2 (digital e-book without `address`), extracting fields cleanly with destructuring + `?.` + `?? "Digital Delivery"`.',
        starterHtml: `<div class="box">
  <h1>Order Delivery Details</h1>
  <select id="idx">
    <option value="0">Order #1 (Physical Book)</option>
    <option value="1">Order #2 (Digital PDF - No Address)</option>
  </select>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const orders = [
  { id: 'ORD-101', customer: { name: 'Ananya', address: { city: 'Pune', pincode: '411001' } } },
  { id: 'ORD-102', customer: { name: 'Vikram' } },
];

function showOrder() {
  const idx = Number(document.getElementById('idx').value);
  const { id, customer } = orders[idx];
  const city = customer?.address?.city ?? 'Digital Delivery';
  const pin = customer?.address?.pincode ?? 'N/A';

  document.getElementById('out').textContent =
    id + ' · ' + customer.name + '\\nCity: ' + city + '\\nPincode: ' + pin;
}

document.getElementById('idx').addEventListener('change', showOrder);
showOrder();`,
        solutionJs: `const orders = [
  { id: 'ORD-101', customer: { name: 'Ananya', address: { city: 'Pune', pincode: '411001' } } },
  { id: 'ORD-102', customer: { name: 'Vikram' } },
];

function showOrder() {
  const idx = Number(document.getElementById('idx').value);
  const { id, customer } = orders[idx];
  const { city = 'Digital Delivery', pincode = 'N/A' } = customer?.address ?? {};

  document.getElementById('out').textContent =
    id + ' · ' + customer.name + '\\nCity: ' + city + '\\nPincode: ' + pincode;
}

document.getElementById('idx').addEventListener('change', showOrder);
showOrder();`,
      },
    },
    quiz: [
      {
        question: 'What does `user?.profile?.avatar ?? "/default.png"` return when `user.profile` is `undefined`?',
        options: ['Throws a TypeError', '"/default.png"', 'undefined'],
        correctIndex: 1,
        explanation: '`?.` short-circuits to `undefined`, and `??` replaces `undefined` with `"/default.png"`.',
      },
      {
        question: 'How do you destructure `name` into a variable called `fullName` with default `"Anonymous"`?',
        options: [
          'const { name: fullName = "Anonymous" } = user;',
          'const { fullName = name : "Anonymous" } = user;',
          'const [name: fullName] = user;',
        ],
        correctIndex: 0,
        explanation: 'Syntax is `{ sourceKey: localAlias = defaultValue }`.',
      },
    ],
  },
  {
    id: 't17-rest-spread',
    number: 19,
    categoryId: 'cat-4-objects-operators',
    categoryTitle: '4. Objects, Operators & Memory Model',
    tier: 'Intermediate',
    title: 'Rest (...args) & Spread (...) Operators',
    webDevUseCase: 'Merging Config Objects, Copying Arrays & Variadic Functions',
    summary:
      'Use Rest (`...args`) to collect remaining arguments or keys into a bundle, and Spread (`...`) to unpack arrays/objects cleanly when merging state.',
    revisionTldr:
      'Rest PACKS remaining items (`(first, ...rest)` or `const { id, ...others } = obj`). Spread UNPACKS items (`[...a, ...b]` or `{ ...defaults, ...overrides }`).',
    explanation: [
      'Both operators share the `...` syntax, determined by position: **Rest** sits on the receiving side (function parameter or destructuring left-hand side) and collects remaining items.',
      '**Spread** sits on the value side (`[...arr1, 4]`, `{ ...base, theme: "dark" }`, `Math.max(...nums)`) and expands elements.',
      'In object spread, later keys overwrite earlier keys—making `{ ...defaults, ...userOptions }` the standard pattern for configurable web components.',
    ],
    keyRules: [
      'Rest parameters must always be the LAST parameter in a function.',
      'Object rest (`const { password, ...safeUser } = user`) is great for stripping sensitive keys.',
      'Remember spread creates a SHALLOW copy (only 1 level deep).',
    ],
    codeExample: `const baseCfg = { theme: 'light', retries: 3 };
const finalCfg = { ...baseCfg, theme: 'dark' };

function sumAll(label, ...numbers) {
  return label + ': ' + numbers.reduce((a, b) => a + b, 0);
}
console.log(finalCfg, sumAll('Total', 10, 20, 30));`,
    commonMistake: {
      label: 'Placing default config AFTER user overrides in object spread',
      avoid: `const cfg = { ...userOptions, ...DEFAULT_OPTIONS }; // Overwrites user choices!`,
      prefer: `const cfg = { ...DEFAULT_OPTIONS, ...userOptions };`,
    },
    practice: {
      logical: {
        title: 'Spread Override Order & Rest Parameters (...nums)',
        scenario: 'Exam Question · Precedence in Object Spread + Variadic Sum',
        taskPrompt:
          'Fix two bugs: (1) `{ ...userOpts, ...DEFAULTS }` puts `DEFAULTS` second so it overwrites the user’s dark theme! Swap the spread order, and (2) complete `maxNumber(...nums)` using `Math.max(...nums)` with a Rest parameter.',
        starterHtml: `<div class="box">
  <h1>Rest & Spread Exam Challenge</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const DEFAULTS = { theme: 'light', fontSize: 14 };
const userOpts = { theme: 'dark' };

// BUG 1: DEFAULTS overwrites userOpts! Place DEFAULTS first
const config = { ...userOpts, ...DEFAULTS };

// TODO 2: Collect all arguments using Rest (...nums) and return Math.max(...nums)
function maxNumber() {
  return 0;
}

document.getElementById('out').textContent =
  'config.theme (expected dark): ' + config.theme +
  '\\nmaxNumber(12, 89, 34, 67) (expected 89): ' + maxNumber(12, 89, 34, 67);`,
        solutionJs: `const DEFAULTS = { theme: 'light', fontSize: 14 };
const userOpts = { theme: 'dark' };

const config = { ...DEFAULTS, ...userOpts };

function maxNumber(...nums) {
  return nums.length ? Math.max(...nums) : 0;
}

document.getElementById('out').textContent =
  'config.theme: ' + config.theme +
  '\\nmaxNumber(12, 89, 34, 67): ' + maxNumber(12, 89, 34, 67);`,
      },
      realLife: {
        title: 'Sanitizing API User Record & Merging App Settings',
        scenario: 'Daily Life · Stripping passwordHash Before Sending JSON to UI',
        taskPrompt:
          'In backend/frontend apps, never expose secret fields like `passwordHash`! Use Object Rest `const { passwordHash, ...safeUser } = dbUser` to strip secrets cleanly, and merge user theme overrides with defaults.',
        starterHtml: `<div class="box">
  <h1>Safe User Profile & Settings Merger</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const dbUser = { id: 7, name: 'Kiran', email: 'kiran@dev.in', passwordHash: '$2b$secret123' };
const DEFAULT_PREFS = { theme: 'light', sidebar: 'open', currency: 'INR' };
const userOverrides = { theme: 'slate' };

// TODO: Strip passwordHash using Object Rest so safeUser has NO passwordHash!
const safeUser = { ...dbUser };
const activePrefs = { ...DEFAULT_PREFS, ...userOverrides };

document.getElementById('out').textContent =
  'Public User (no secret!):\\n' + JSON.stringify(safeUser, null, 2) +
  '\\nActive Prefs:\\n' + JSON.stringify(activePrefs, null, 2);`,
        solutionJs: `const dbUser = { id: 7, name: 'Kiran', email: 'kiran@dev.in', passwordHash: '$2b$secret123' };
const DEFAULT_PREFS = { theme: 'light', sidebar: 'open', currency: 'INR' };
const userOverrides = { theme: 'slate' };

const { passwordHash, ...safeUser } = dbUser;
void passwordHash;
const activePrefs = { ...DEFAULT_PREFS, ...userOverrides };

document.getElementById('out').textContent =
  'Public User (no secret!):\\n' + JSON.stringify(safeUser, null, 2) +
  '\\nActive Prefs:\\n' + JSON.stringify(activePrefs, null, 2);`,
      },
    },
    quiz: [
      {
        question: 'What does `const { a, ...rest } = { a: 1, b: 2, c: 3 }` store in `rest`?',
        options: ['[2, 3]', '{ b: 2, c: 3 }', '{ a: 1 }'],
        correctIndex: 1,
        explanation: 'Object rest collects all remaining enumerable own keys into a new object `{ b: 2, c: 3 }`.',
      },
      {
        question: 'In `{ ...objA, ...objB }`, what happens if both objects share the key `theme`?',
        options: [
          'objA.theme wins',
          'objB.theme overwrites objA.theme',
          'JavaScript throws a duplicate key error',
        ],
        correctIndex: 1,
        explanation: 'Later properties in an object literal spread override earlier properties with the same key.',
      },
    ],
  },
  {
    id: 't18-reference-deep-clone',
    number: 20,
    categoryId: 'cat-4-objects-operators',
    categoryTitle: '4. Objects, Operators & Memory Model',
    tier: 'Intermediate',
    title: 'Stack vs. Heap References, Shallow Copy & Deep Cloning (structuredClone)',
    webDevUseCase: 'Protecting Nested State Presets & Form Reset Drafts',
    summary:
      'Understand why assigning an object copies only its memory address (reference), why `{ ...obj }` is shallow, and how `structuredClone()` creates an isolated deep copy.',
    revisionTldr:
      'Primitives copy by VALUE; Objects/Arrays copy by REFERENCE. `{...obj}` / `[...arr]` are SHALLOW (nested objects still linked!). Use `structuredClone(obj)` for true deep cloning.',
    explanation: [
      'Primitives (`number`, `string`, `boolean`) live on the stack and copy independently (`let b = a`). Objects and arrays live on the heap—`const b = a` copies only the pointer, so editing `b.name` mutates `a.name` too!',
      'Spread (`{ ...obj }`) and `Object.assign()` only copy the top level. Any nested object or array inside remains shared between original and copy.',
      'Modern browsers provide `structuredClone(obj)` natively to deep-clone nested objects, arrays, Dates, Sets, and Maps cleanly (note: it cannot clone functions).',
    ],
    keyRules: [
      'Always use `structuredClone()` before editing nested form drafts or resetting presets.',
      'Avoid the legacy `JSON.parse(JSON.stringify(x))` hack when `Date`, `Set`, `Map`, or `undefined` exist—use `structuredClone(x)`.',
      'Two separate objects with identical contents are still `!==` (`{} === {}` is `false`).',
    ],
    codeExample: `const preset = { name: 'Default', flags: { dark: false } };

const shallow = { ...preset };
shallow.flags.dark = true; // Mutates preset.flags.dark too!

const deep = structuredClone(preset);
deep.flags.dark = false; // Completely isolated copy`,
    commonMistake: {
      label: 'Assuming { ...obj } isolates nested objects',
      avoid: `const draft = { ...initialState };
draft.filters.active = false; // Corrupts initialState.filters!`,
      prefer: `const draft = structuredClone(initialState);
draft.filters.active = false; // initialState remains intact`,
    },
    practice: {
      logical: {
        title: 'Shallow Copy Nested Mutation Trap vs structuredClone()',
        scenario: 'Exam Question · Reference Sharing in Nested Objects',
        taskPrompt:
          'Right now `{ ...preset }` only clones top-level keys, so changing `draft.flags.beta = true` accidentally mutates `preset.flags.beta`! Switch to `structuredClone(preset)` so `preset.flags.beta` stays `false`.',
        starterHtml: `<div class="box">
  <h1>Shallow vs Deep Clone Exam Fix</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const preset = { plan: 'Free', flags: { beta: false } };

// BUG: Object spread is SHALLOW—nested 'flags' is still shared on the heap!
const draft = { ...preset };
draft.flags.beta = true;

document.getElementById('out').textContent =
  'preset.flags.beta (expected false): ' + preset.flags.beta +
  '\\ndraft.flags.beta (expected true): ' + draft.flags.beta;`,
        solutionJs: `const preset = { plan: 'Free', flags: { beta: false } };

const draft = structuredClone(preset);
draft.flags.beta = true;

document.getElementById('out').textContent =
  'preset.flags.beta: ' + preset.flags.beta +
  '\\ndraft.flags.beta: ' + draft.flags.beta;`,
      },
      realLife: {
        title: 'Account Settings Form Draft with Safe "Discard Changes"',
        scenario: 'Daily Life · Editing Nested Notification Toggles Without Corrupting Saved State',
        taskPrompt:
          'When a user toggles Email Alerts in a settings modal and clicks "Discard Draft", the saved profile must remain untouched! Use `structuredClone(savedProfile)` for the working draft and restore cleanly on Discard.',
        starterHtml: `<div class="box">
  <h1>Profile Notification Draft</h1>
  <button id="btn-toggle" type="button">Toggle Draft Email Alerts</button>
  <button id="btn-discard" type="button">Discard Draft</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const savedProfile = {
  user: 'Asha',
  notifications: { email: true, sms: false },
};

// BUG: Assigning directly shares the heap reference! Use structuredClone(savedProfile)
let draft = savedProfile;

function render() {
  document.getElementById('out').textContent =
    'Saved Email Alerts: ' + savedProfile.notifications.email +
    '\\nDraft Email Alerts: ' + draft.notifications.email;
}

document.getElementById('btn-toggle').addEventListener('click', () => {
  draft.notifications.email = !draft.notifications.email;
  render();
});

document.getElementById('btn-discard').addEventListener('click', () => {
  draft = structuredClone(savedProfile);
  render();
});

render();`,
        solutionJs: `const savedProfile = {
  user: 'Asha',
  notifications: { email: true, sms: false },
};

let draft = structuredClone(savedProfile);

function render() {
  document.getElementById('out').textContent =
    'Saved Email Alerts: ' + savedProfile.notifications.email +
    '\\nDraft Email Alerts: ' + draft.notifications.email;
}

document.getElementById('btn-toggle').addEventListener('click', () => {
  draft.notifications.email = !draft.notifications.email;
  render();
});

document.getElementById('btn-discard').addEventListener('click', () => {
  draft = structuredClone(savedProfile);
  render();
});

render();`,
      },
    },
    quiz: [
      {
        question: 'What is `({ a: 1 }) === ({ a: 1 })` in JavaScript?',
        options: ['true', 'false', 'undefined'],
        correctIndex: 1,
        explanation: 'Objects are compared by heap reference, not structural value; two separate `{}` literals have different addresses.',
      },
      {
        question: 'Which built-in API safely deep-clones nested objects, arrays, Dates, Maps, and Sets?',
        options: ['Object.assign({}, obj)', '{ ...obj }', 'structuredClone(obj)'],
        correctIndex: 2,
        explanation: '`structuredClone()` performs a native deep copy across nested structures.',
      },
    ],
  },
];
