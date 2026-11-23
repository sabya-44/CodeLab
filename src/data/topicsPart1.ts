import type { JsTopic } from '../types/topic';

const BASE_CSS = `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 18px; color: #0f172a; }
.box { max-width: 440px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; }
h1 { font-size: 16px; margin: 0 0 10px; }
p, li { font-size: 13px; line-height: 1.5; }
input, select { width: 100%; padding: 7px 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
button { padding: 7px 12px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
.out { background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-top: 10px; white-space: pre-wrap; }`;

export const TOPICS_PART_1: JsTopic[] = [
  {
    id: 't01-variables-hoisting',
    number: 1,
    categoryId: 'cat-1-foundations',
    categoryTitle: '1. Core Foundations & Language Mechanics',
    tier: 'Basic',
    title: 'Variables (var, let, const), Block Scope & Hoisting (TDZ)',
    webDevUseCase: 'Safe Script Initialization & Avoiding Variable Leaks',
    summary:
      'How JavaScript allocates variables in memory before running code, why `let` and `const` stay in the Temporal Dead Zone (TDZ), and how block scope keeps UI handlers predictable.',
    revisionTldr:
      'Use `const` by default and `let` only when reassigning; `function` hoists fully, `var` hoists as `undefined` and leaks blocks, `let`/`const` stay in TDZ until declared.',
    explanation: [
      'Before running line 1 of any script, the JavaScript engine runs a Memory Creation Phase. Function declarations (`function greet() {}`) are hoisted completely with their bodies, so they can be called before their definition line.',
      'Declarations using `var` are hoisted and initialized with `undefined`, and they only respect function scope—meaning a `var` inside an `if` or `for` block leaks outside into the enclosing function or global window.',
      'Modern `let` and `const` declarations are strictly block-scoped (`{ ... }`) and remain uninitialized inside the Temporal Dead Zone (TDZ) until execution reaches their exact line. Reading them early throws a loud `ReferenceError`, catching bugs immediately.',
    ],
    keyRules: [
      'Default to `const` for DOM references, configs, and helper functions; use `let` only for counters or state that changes.',
      'Never use `var` in modern web development because it ignores `{}` blocks and pollutes `window`.',
      'Remember: `const` locks the variable binding (you cannot reassign `arr = []`), NOT the internal properties of an object/array.',
    ],
    codeExample: `// 1. Hoisted function declaration works above its definition
console.log(formatHeading('JavaScript'));

function formatHeading(name) {
  return 'Module: ' + name;
}

// 2. Block-scoped let & const
const MAX_ITEMS = 5;
let count = 0;

if (count < MAX_ITEMS) {
  const blockSecret = 'Only exists inside this if-block';
  count += 1;
  console.log(blockSecret, 'Count:', count);
}`,
    commonMistake: {
      label: 'Using var inside blocks or reading const in the TDZ',
      avoid: `console.log(user); // undefined instead of error!
var user = 'Riya';
if (true) { var leak = 42; }
console.log(leak); // 42 leaked out!`,
      prefer: `const user = 'Riya';
let status = 'Pending';
if (true) {
  const scoped = 'Active';
  status = scoped;
}`,
    },
    practice: {
      logical: {
        title: 'TDZ & var Block-Leak Bug Hunt',
        scenario: 'Exam Question · Predict & Fix Scope Behavior',
        taskPrompt:
          'Fix two classic exam bugs below: (1) `discount` leaks out of the `if` block because it uses `var`, and (2) `rate` is read in its TDZ before `let rate = 10` is declared. Fix the code so `calculateExamScore()` returns `"Rate: 10 | Leaked? false"`.',
        starterHtml: `<div class="box">
  <h1>TDZ & Scope Exam Challenge</h1>
  <button id="btn-test" type="button">Run Scope Check</button>
  <div id="out" class="out">Click Run Scope Check to test your fix</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function calculateExamScore() {
  try {
    // BUG 1: Reading 'rate' in the Temporal Dead Zone throws ReferenceError!
    const currentRate = rate;
    let rate = 10;

    if (true) {
      // BUG 2: var leaks out of the if-block! Change it to block-scoped const/let.
      var blockSecret = 'HIDDEN';
    }

    const leaked = typeof blockSecret !== 'undefined';
    return 'Rate: ' + currentRate + ' | Leaked? ' + leaked;
  } catch (err) {
    return 'ERROR: ' + err.name + ' -> ' + err.message;
  }
}

document.getElementById('btn-test').addEventListener('click', () => {
  const res = calculateExamScore();
  document.getElementById('out').textContent = res;
  console.log(res);
});
document.getElementById('out').textContent = calculateExamScore();`,
        solutionJs: `function calculateExamScore() {
  let rate = 10;
  const currentRate = rate;

  if (true) {
    const blockSecret = 'HIDDEN';
    void blockSecret;
  }

  let leaked = false;
  try {
    leaked = typeof blockSecret !== 'undefined';
  } catch {
    leaked = false;
  }
  return 'Rate: ' + currentRate + ' | Leaked? ' + leaked;
}

document.getElementById('btn-test').addEventListener('click', () => {
  const res = calculateExamScore();
  document.getElementById('out').textContent = res;
  console.log(res);
});
document.getElementById('out').textContent = calculateExamScore();`,
      },
      realLife: {
        title: 'Cinema Ticket Kiosk Seat Counter',
        scenario: 'Daily Life · Live Booking Availability Tracker',
        taskPrompt:
          'Build a safe seat-booking counter: keep `SCREEN_NAME` as `const` and `seatsLeft = 5` as `let`. Complete the click handler so booking a seat decrements `seatsLeft` cleanly and blocks booking when `0` seats remain.',
        starterHtml: `<div class="box">
  <h1>Cinema Ticket Counter</h1>
  <button id="btn-book" type="button">Book 1 Seat</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const SCREEN_NAME = 'Screen 2 (IMAX)';
let seatsLeft = 5;

function renderKiosk(note = '') {
  document.getElementById('out').textContent =
    SCREEN_NAME + '\\nSeats Available: ' + seatsLeft + (note ? '\\n' + note : '');
}

document.getElementById('btn-book').addEventListener('click', () => {
  // TODO: If seatsLeft > 0, decrease seatsLeft by 1 and show 'Ticket booked!'.
  // Otherwise show 'Housefull! No seats remaining.'
  renderKiosk('TODO: implement seat booking logic');
});

renderKiosk();`,
        solutionJs: `const SCREEN_NAME = 'Screen 2 (IMAX)';
let seatsLeft = 5;

function renderKiosk(note = '') {
  document.getElementById('out').textContent =
    SCREEN_NAME + '\\nSeats Available: ' + seatsLeft + (note ? '\\n' + note : '');
}

document.getElementById('btn-book').addEventListener('click', () => {
  if (seatsLeft > 0) {
    seatsLeft -= 1;
    renderKiosk('Ticket booked successfully!');
  } else {
    renderKiosk('Housefull! No seats remaining.');
  }
});

renderKiosk();`,
      },
    },
    quiz: [
      {
        question: 'What happens if you read a `let` variable on the line BEFORE its declaration?',
        options: [
          'It returns undefined silently',
          'It throws a ReferenceError due to the Temporal Dead Zone',
          'It automatically creates a global variable',
        ],
        correctIndex: 1,
        explanation:
          '`let` and `const` are hoisted without initialization into the TDZ, so reading them before their declaration line throws a ReferenceError.',
      },
      {
        question: 'Which declaration prevents variable reassignment AND stays inside `{}` blocks?',
        options: ['var', 'let', 'const'],
        correctIndex: 2,
        explanation: '`const` enforces both block scoping and prevents reassigning the binding.',
      },
    ],
  },
  {
    id: 't02-data-types-coercion',
    number: 2,
    categoryId: 'cat-1-foundations',
    categoryTitle: '1. Core Foundations & Language Mechanics',
    tier: 'Basic',
    title: 'Data Types, Primitives vs. Objects & Type Coercion',
    webDevUseCase: 'Converting HTML Form Strings into Safe Numbers',
    summary:
      'Master JavaScript’s 7 primitive types versus reference objects, check types with `typeof`, and explicitly convert DOM form inputs using `Number()` or `parseFloat()`.',
    revisionTldr:
      '7 primitives (`string`, `number`, `boolean`, `undefined`, `null`, `symbol`, `bigint`) + `object`. Every DOM `.value` is a string; always convert with `Number()` before `+`.',
    explanation: [
      'JavaScript values are either **Primitives** (`string`, `number`, `boolean`, `undefined`, `null`, `symbol`, `bigint`) copied by value, or **Objects** (`{}`, `[]`, functions) passed by reference.',
      'A classic `typeof` quirk: `typeof null` evaluates to `"object"`, and `typeof []` is `"object"`—use `Array.isArray(val)` to check arrays accurately.',
      'In web forms, `document.getElementById("price").value` ALWAYS returns a string. Because `+` concatenates when either operand is a string (`"50" + 10 === "5010"`), convert explicitly with `Number()` and validate with `Number.isFinite()`.',
    ],
    keyRules: [
      'Always parse DOM input values with `Number(input.value)` or `parseFloat()` before arithmetic.',
      'Check `Array.isArray(x)` for arrays and `x === null` for `null` instead of relying on `typeof`.',
      'Watch out for `NaN`: `NaN === NaN` is `false`; check with `Number.isNaN(val)`.',
    ],
    codeExample: `const rawPrice = '299';
const tax = 50;

const numericPrice = Number(rawPrice);
if (Number.isFinite(numericPrice)) {
  console.log('Correct math:', numericPrice + tax); // 349
}
console.log('Array check:', Array.isArray([1, 2]), 'Null quirk:', typeof null);`,
    commonMistake: {
      label: 'Adding DOM .value strings directly with +',
      avoid: `const qty = document.getElementById('qty').value; // "2"
const total = qty + 5; // "25" (string concatenation!)`,
      prefer: `const qty = Number(document.getElementById('qty').value);
const total = Number.isFinite(qty) ? qty + 5 : 0;`,
    },
    practice: {
      logical: {
        title: 'Tricky Coercion & typeof Logic Puzzle',
        scenario: 'Exam Question · Predict JS Type Coercion Rules',
        taskPrompt:
          'Fix `evaluateChecks()` so all 4 type-checking helpers return accurate booleans without falling for `typeof null === "object"` or `"10" + 5 === "105"`.',
        starterHtml: `<div class="box">
  <h1>Coercion & typeof Logic Test</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `// BUG 1: typeof null returns 'object'! Fix isNull(v).
const isNull = (v) => typeof v === 'null';

// BUG 2: typeof [] returns 'object'! Fix isArray(v).
const isArray = (v) => typeof v === 'array';

// BUG 3: NaN === NaN is always false! Fix isRealNaN(v).
const isRealNaN = (v) => v === NaN;

// BUG 4: Converts string inputs safely before adding
const safeAdd = (a, b) => a + b; // Currently concatenates '10' + 5 -> '105'!

const report = [
  'isNull(null) -> ' + isNull(null) + ' (expected true)',
  'isArray([1,2]) -> ' + isArray([1, 2]) + ' (expected true)',
  'isRealNaN(Number("abc")) -> ' + isRealNaN(Number('abc')) + ' (expected true)',
  'safeAdd("10", 5) -> ' + safeAdd('10', 5) + ' (expected 15)',
];
document.getElementById('out').textContent = report.join('\\n');`,
        solutionJs: `const isNull = (v) => v === null;
const isArray = (v) => Array.isArray(v);
const isRealNaN = (v) => Number.isNaN(v);
const safeAdd = (a, b) => Number(a) + Number(b);

const report = [
  'isNull(null) -> ' + isNull(null) + ' (PASS)',
  'isArray([1,2]) -> ' + isArray([1, 2]) + ' (PASS)',
  'isRealNaN(Number("abc")) -> ' + isRealNaN(Number('abc')) + ' (PASS)',
  'safeAdd("10", 5) -> ' + safeAdd('10', 5) + ' (PASS)',
];
document.getElementById('out').textContent = report.join('\\n');`,
      },
      realLife: {
        title: 'Online Grocery Checkout Bill Calculator',
        scenario: 'Daily Life · Parsing HTML Form Strings into Rupee Totals',
        taskPrompt:
          'A customer enters Item Price `"249.50"` and Delivery Fee `"40"` in HTML inputs. Right now `rawPrice + rawFee` outputs `"249.5040"`! Parse both with `Number()`, guard invalid text with `Number.isFinite()`, and display the exact bill.',
        starterHtml: `<div class="box">
  <h1>Grocery Checkout Bill</h1>
  <input id="price" type="text" value="249.50" placeholder="Item price" />
  <input id="fee" type="text" value="40" placeholder="Delivery fee" />
  <button id="btn-calc" type="button">Calculate Total</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function calcBill() {
  const rawPrice = document.getElementById('price').value;
  const rawFee = document.getElementById('fee').value;

  // BUG: String + String concatenates instead of adding numbers!
  const total = rawPrice + rawFee;
  document.getElementById('out').textContent = 'Payable Bill: ₹' + total;
}

document.getElementById('btn-calc').addEventListener('click', calcBill);
calcBill();`,
        solutionJs: `function calcBill() {
  const price = Number(document.getElementById('price').value);
  const fee = Number(document.getElementById('fee').value);

  if (!Number.isFinite(price) || !Number.isFinite(fee) || price < 0 || fee < 0) {
    document.getElementById('out').textContent = 'Please enter valid positive numbers.';
    return;
  }
  const total = price + fee;
  document.getElementById('out').textContent =
    'Items: ₹' + price.toFixed(2) + ' + Fee: ₹' + fee.toFixed(2) + '\\nPayable Bill: ₹' + total.toFixed(2);
}

document.getElementById('btn-calc').addEventListener('click', calcBill);
calcBill();`,
      },
    },
    quiz: [
      {
        question: 'What does `typeof null` return in JavaScript?',
        options: ['"null"', '"undefined"', '"object"'],
        correctIndex: 2,
        explanation:
          'Due to a historical JavaScript quirk from 1995, `typeof null` returns `"object"`. Always test `val === null` directly.',
      },
      {
        question: 'What is the result of `"10" + 5` vs `"10" - 5`?',
        options: ['"105" and 5', '15 and 5', '"105" and NaN'],
        correctIndex: 0,
        explanation: '`+` favors string concatenation when one operand is a string, whereas `-` always converts to numbers.',
      },
    ],
  },
  {
    id: 't03-operators-equality',
    number: 3,
    categoryId: 'cat-1-foundations',
    categoryTitle: '1. Core Foundations & Language Mechanics',
    tier: 'Basic',
    title: 'Operators, Strict Equality (===), Truthy/Falsy & Nullish Coalescing (??)',
    webDevUseCase: 'Reliable Form Checks & Default Config Fallbacks',
    summary:
      'Prevent type-coercion bugs using `===`, learn all 6 falsy values, and understand why `??` protects `0` and `false` while `||` overwrites them.',
    revisionTldr:
      'Always use `===` / `!==`. Only 6 values are falsy (`false`, `0`, `""`, `null`, `undefined`, `NaN`). Use `??` when `0` or `false` are valid settings.',
    explanation: [
      'Loose equality (`==`) converts operands to matching types before comparing (`0 == ""` and `false == "0"` are both `true`!). Strict equality (`===` and `!==`) compares BOTH value and type.',
      'JavaScript has exactly 6 falsy values: `false`, `0` (and `-0`), `""`, `null`, `undefined`, and `NaN`. Everything else—including `"0"`, `[]`, and `{}`—is truthy.',
      'Logical OR (`a || b`) returns `b` whenever `a` is ANY falsy value (overwriting `0`!). Nullish coalescing (`a ?? b`) ONLY returns `b` when `a` is `null` or `undefined`.',
    ],
    keyRules: [
      'Use `===` everywhere for predictable comparisons.',
      'Use `value ?? defaultVal` for numeric counts, prices, and boolean flags where `0` or `false` must survive.',
      'Remember `Boolean([]) === true`; always check `arr.length === 0` for emptiness.',
    ],
    codeExample: `const score = 0;
console.log('Using ||:', score || 50); // 50 (overwrote 0!)
console.log('Using ??:', score ?? 50); // 0 (kept 0!)
console.log('Strict ===:', 0 === '');  // false`,
    commonMistake: {
      label: 'Using == or overwriting 0 with ||',
      avoid: `const page = query.page || 1; // Page 0 becomes 1!
if (count == '') { ... } // Matches 0 too!`,
      prefer: `const page = query.page ?? 1; // Keeps 0 safely
if (count === 0) { ... }`,
    },
    practice: {
      logical: {
        title: 'Strict Equality (===) & Nullish (??) Edge Cases',
        scenario: 'Exam Question · Loose == vs Strict === and || vs ??',
        taskPrompt:
          'Fix two subtle operator bugs: (1) `isZeroValue(val)` currently uses `==` so `""` falsely passes as `0`, and (2) `readRetries()` uses `||` so `0` retries turns into `3`. Switch to `===` and `??`.',
        starterHtml: `<div class="box">
  <h1>Operators Exam Checker</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function isZeroValue(val) {
  return val == 0; // BUG: "" == 0 is true! Should only match numeric 0
}

function readRetries(config) {
  return config.retries || 3; // BUG: 0 retries falls back to 3!
}

const check1 = isZeroValue('') === false;
const check2 = isZeroValue(0) === true;
const check3 = readRetries({ retries: 0 }) === 0;
const check4 = readRetries({}) === 3;

document.getElementById('out').textContent = [
  '"" is not zero: ' + check1,
  '0 is zero: ' + check2,
  'retries: 0 preserved: ' + check3,
  'missing retries defaults to 3: ' + check4,
].join('\\n');`,
        solutionJs: `function isZeroValue(val) {
  return val === 0;
}

function readRetries(config) {
  return config.retries ?? 3;
}

const check1 = isZeroValue('') === false;
const check2 = isZeroValue(0) === true;
const check3 = readRetries({ retries: 0 }) === 0;
const check4 = readRetries({}) === 3;

document.getElementById('out').textContent = [
  '"" is not zero: ' + check1,
  '0 is zero: ' + check2,
  'retries: 0 preserved: ' + check3,
  'missing retries defaults to 3: ' + check4,
].join('\\n');`,
      },
      realLife: {
        title: 'Food Delivery Tip & Promo Fallback',
        scenario: 'Daily Life · Preserving ₹0 Delivery Tip in Checkout Settings',
        taskPrompt:
          'In a food delivery app, when the user selects `₹0` rider tip, `||` wrongly forces a `₹20` tip! Fix `applyTip()` using `??` so `0` stays `₹0`, while `null` (not selected yet) defaults to `₹20`.',
        starterHtml: `<div class="box">
  <h1>Food Delivery Tip Setting</h1>
  <select id="tip-select">
    <option value="none">Not Chosen Yet (null)</option>
    <option value="0" selected>₹0 (No Tip)</option>
    <option value="30">₹30 (Generous)</option>
  </select>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function updateCheckout() {
  const raw = document.getElementById('tip-select').value;
  const userChoice = raw === 'none' ? null : Number(raw);

  // BUG: Using || overwrites ₹0 with default ₹20! Change to ??
  const finalTip = userChoice || 20;
  document.getElementById('out').textContent =
    'User picked: ' + String(userChoice) + '\\nApplied Rider Tip: ₹' + finalTip;
}

document.getElementById('tip-select').addEventListener('change', updateCheckout);
updateCheckout();`,
        solutionJs: `function updateCheckout() {
  const raw = document.getElementById('tip-select').value;
  const userChoice = raw === 'none' ? null : Number(raw);

  const finalTip = userChoice ?? 20;
  document.getElementById('out').textContent =
    'User picked: ' + String(userChoice) + '\\nApplied Rider Tip: ₹' + finalTip;
}

document.getElementById('tip-select').addEventListener('change', updateCheckout);
updateCheckout();`,
      },
    },
    quiz: [
      {
        question: 'What does `0 ?? 25` evaluate to?',
        options: ['25', '0', 'undefined'],
        correctIndex: 1,
        explanation: '`??` only falls back when the left operand is `null` or `undefined`, so `0` is preserved.',
      },
      {
        question: 'Which expression evaluates to `true`?',
        options: ['[] === []', 'Boolean([])', '0 === "0"'],
        correctIndex: 1,
        explanation: 'All objects including empty arrays `[]` are truthy (`Boolean([]) === true`). Comparing two separate arrays with `===` compares references (`false`).',
      },
    ],
  },
  {
    id: 't04-control-flow-loops',
    number: 4,
    categoryId: 'cat-1-foundations',
    categoryTitle: '1. Core Foundations & Language Mechanics',
    tier: 'Basic',
    title: 'Conditionals (if/else, switch, ?:) & Loops (for, while, for...of, for...in)',
    webDevUseCase: 'Branching UI States & Rendering Dynamic Lists',
    summary:
      'Select the clearest conditional statement and pick the right loop: `for...of` for arrays/strings/DOM lists, `for...in` strictly for object keys, and `for`/`while` for counters.',
    revisionTldr:
      '`if/else` for ranges, `switch` (+ `break`) for exact matches, `for...of` for array values (supports `break` & `await`), `for...in` only for object keys.',
    explanation: [
      'Use `if / else if / else` for logical conditions, `switch` with `break;` when matching one value against multiple fixed cases, and `cond ? a : b` for concise conditional values.',
      'For iteration: `for (const item of arr)` loops cleanly over values in any iterable (Arrays, Strings, Sets, Maps, NodeLists) and supports `break`, `continue`, and `await`.',
      'Reserve `for (const key in obj)` for iterating plain object property names. Avoid `for...in` on arrays because keys arrive as strings (`"0"`, `"1"`) and include inherited keys.',
    ],
    keyRules: [
      'Always include `break;` inside `switch` cases unless intentionally falling through.',
      'Use `for...of` for arrays (values) and `Object.entries(obj)` + `for...of` for objects.',
      'Remember `while` checks before running; `do...while` always runs at least once.',
    ],
    codeExample: `const skills = ['HTML', 'CSS', 'JavaScript'];
for (const skill of skills) {
  if (skill === 'CSS') continue; // skip CSS
  console.log('Core skill:', skill);
}

const theme = 'dark';
switch (theme) {
  case 'dark': console.log('#0f172a'); break;
  default: console.log('#f8fafc');
}`,
    commonMistake: {
      label: 'Iterating an Array with for...in or forgetting switch break',
      avoid: `for (const idx in arr) {
  console.log(idx + 1); // "01", "11" because idx is a string!
}`,
      prefer: `for (const [idx, item] of arr.entries()) {
  console.log(idx + 1, item);
}`,
    },
    practice: {
      logical: {
        title: 'FizzBuzz + Switch Break Fall-Through Fix',
        scenario: 'Exam Question · Classic Loop Logic & Switch Control Flow',
        taskPrompt:
          'Complete two exam tasks: (1) Loop `1` to `15` and push `"FizzBuzz"` (divisible by both 3 & 5), `"Fizz"` (/3), `"Buzz"` (/5), or the number; (2) Add missing `break;` statements inside `getGradeLabel(grade)`.',
        starterHtml: `<div class="box">
  <h1>Control Flow Exam Problems</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function getGradeLabel(grade) {
  let msg = '';
  switch (grade) {
    case 'A':
      msg = 'Distinction'; // BUG: missing break! Falls through to 'Fail'!
    case 'B':
      msg = 'First Class';
    default:
      msg = 'Fail';
  }
  return msg;
}

const fizzBuzz = [];
for (let i = 1; i <= 15; i++) {
  // TODO: Check divisible by 15 first -> 'FizzBuzz', else 3 -> 'Fizz', else 5 -> 'Buzz', else i
  fizzBuzz.push(i);
}

document.getElementById('out').textContent =
  'Grade A label: ' + getGradeLabel('A') + ' (expected Distinction)\\n' +
  'FizzBuzz 1..15: ' + fizzBuzz.join(', ');`,
        solutionJs: `function getGradeLabel(grade) {
  let msg = '';
  switch (grade) {
    case 'A':
      msg = 'Distinction';
      break;
    case 'B':
      msg = 'First Class';
      break;
    default:
      msg = 'Fail';
  }
  return msg;
}

const fizzBuzz = [];
for (let i = 1; i <= 15; i++) {
  if (i % 15 === 0) fizzBuzz.push('FizzBuzz');
  else if (i % 3 === 0) fizzBuzz.push('Fizz');
  else if (i % 5 === 0) fizzBuzz.push('Buzz');
  else fizzBuzz.push(i);
}

document.getElementById('out').textContent =
  'Grade A label: ' + getGradeLabel('A') + '\\n' +
  'FizzBuzz 1..15: ' + fizzBuzz.join(', ');`,
      },
      realLife: {
        title: 'Restaurant Kitchen Order Filter & Priority Status',
        scenario: 'Daily Life · Skipping Out-of-Stock Items & Routing Table Orders',
        taskPrompt:
          'In a live cafe POS screen, use `for...of` with `continue` to skip any item containing `"(Sold Out)"`, and use `switch` to display the status banner for `"preparing"`, `"ready"`, or `"served"`.',
        starterHtml: `<div class="box">
  <h1>Cafe Kitchen Order Board</h1>
  <select id="status">
    <option value="preparing" selected>Preparing</option>
    <option value="ready">Ready for Pickup</option>
    <option value="served">Served</option>
  </select>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const orderItems = ['Masala Chai', 'Samosa (Sold Out)', 'Paneer Roll', 'Cold Coffee (Sold Out)'];

function renderBoard() {
  const status = document.getElementById('status').value;
  let banner = '';
  switch (status) {
    case 'preparing': banner = 'Chef is cooking now'; break;
    case 'ready': banner = 'Call Customer #14!'; break;
    default: banner = 'Order completed';
  }

  const activeItems = [];
  for (const dish of orderItems) {
    // TODO: skip items that include '(Sold Out)' using continue
    activeItems.push(dish);
  }

  document.getElementById('out').textContent = banner + '\\nActive Dishes: ' + activeItems.join(', ');
}

document.getElementById('status').addEventListener('change', renderBoard);
renderBoard();`,
        solutionJs: `const orderItems = ['Masala Chai', 'Samosa (Sold Out)', 'Paneer Roll', 'Cold Coffee (Sold Out)'];

function renderBoard() {
  const status = document.getElementById('status').value;
  let banner = '';
  switch (status) {
    case 'preparing': banner = 'Chef is cooking now'; break;
    case 'ready': banner = 'Call Customer #14!'; break;
    default: banner = 'Order completed';
  }

  const activeItems = [];
  for (const dish of orderItems) {
    if (dish.includes('(Sold Out)')) continue;
    activeItems.push(dish);
  }

  document.getElementById('out').textContent = banner + '\\nActive Dishes: ' + activeItems.join(', ');
}

document.getElementById('status').addEventListener('change', renderBoard);
renderBoard();`,
      },
    },
    quiz: [
      {
        question: 'Which loop iterates over the VALUES of an array and supports `break` and `await`?',
        options: ['for...in', 'forEach()', 'for...of'],
        correctIndex: 2,
        explanation: '`for...of` iterates values directly and supports `break`, `continue`, and `await`.',
      },
      {
        question: 'What happens if you omit `break;` at the end of a `switch` case?',
        options: [
          'JavaScript throws a SyntaxError',
          'Execution falls through into the next case automatically',
          'The loop terminates immediately',
        ],
        correctIndex: 1,
        explanation: 'Without `break` or `return`, execution continues straight into the following `case` block.',
      },
    ],
  },
  {
    id: 't05a-string-foundations',
    number: 5,
    categoryId: 'cat-2-strings-arrays',
    categoryTitle: '2. Inbuilt String & Array Methods',
    tier: 'Basic',
    title: 'String Basics: Quotes, Indexing, Length, Immutability & for Loops',
    webDevUseCase: 'Reading Characters, Validating Length & Building Formatted Text',
    summary:
      'Start from scratch with JavaScript strings: single/double quotes vs backtick template literals, `.length`, zero-based character indexing (`str[0]`), why strings cannot be mutated in place, and looping characters with a `for` loop.',
    revisionTldr:
      'Strings count characters from index `0` up to `str.length - 1`. They are immutable (`str[0] = "X"` is ignored)—always build a new string. Traverse character-by-character with `for (let i = 0; i < str.length; i++)`.',
    explanation: [
      'A string in JavaScript is an ordered sequence of UTF-16 text characters enclosed in single quotes (\'...\'), double quotes ("..."), or backtick template literals (`...`). Backticks let you write multi-line strings and embed variables cleanly using `${variable}`.',
      'Every character has a **zero-based index**: in `"Hello"`, `"H"` is at index `0`, `"e"` is at `1`, and `"o"` is at `str.length - 1` (`4`). You can read characters with `str[i]`, `str.charAt(i)`, or `str.at(-1)` (last character).',
      'Crucially, JavaScript strings are **immutable**—writing `str[0] = "J"` silently fails in non-strict mode (or throws in strict mode) and never edits the original text. To inspect or count characters (such as counting vowels or reversing text manually), loop from `i = 0` to `str.length - 1` using a classic `for` loop.',
    ],
    keyRules: [
      '`.length` is a property (`str.length`), NOT a method (`str.length()` throws a TypeError!).',
      'The last character is always at `str[str.length - 1]` (or modern `str.at(-1)`).',
      'Use `for (let i = 0; i < str.length; i++)` whenever you need both the index `i` and character `str[i]`.',
    ],
    codeExample: `const course = 'Web Dev';
console.log('Length:', course.length);        // 7 (space counts too!)
console.log('First char:', course[0]);        // 'W'
console.log('Last char:', course[course.length - 1]); // 'v'

// Strings are immutable:
course[0] = 'X'; // Ignored! course is still 'Web Dev'

// Classic for-loop traversal with index:
for (let i = 0; i < course.length; i++) {
  console.log('Index ' + i + ':', course[i]);
}`,
    commonMistake: {
      label: 'Trying to modify a character via index or calling .length() as a function',
      avoid: `let word = 'cat';
word[0] = 'b';           // Does NOT turn 'cat' into 'bat'!
console.log(word.length()); // TypeError: word.length is not a function`,
      prefer: `const word = 'cat';
const updated = 'b' + word.slice(1); // 'bat'
console.log(word.length); // 3`,
    },
    practice: {
      logical: {
        title: 'Reverse String & Palindrome Check with for Loop',
        scenario: 'Exam Question · Classic BCA / Interview String Algorithm',
        taskPrompt:
          'Without using `.reverse()`, write a reverse `for (let i = word.length - 1; i >= 0; i--)` loop inside `isPalindrome(word)` to reverse the text manually and check whether `"madam"` and `"racecar"` are palindromes.',
        starterHtml: `<div class="box">
  <h1>Manual Palindrome Checker (for Loop)</h1>
  <input id="word-in" type="text" value="madam" />
  <button id="btn-check" type="button">Check Palindrome</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function isPalindrome(raw) {
  const clean = raw.trim().toLowerCase();
  let reversed = '';

  // TODO: Loop backwards from i = clean.length - 1 down to 0
  // and build 'reversed' one character at a time (reversed += clean[i])

  return { clean, reversed, match: clean.length > 0 && clean === reversed };
}

function run() {
  const res = isPalindrome(document.getElementById('word-in').value);
  document.getElementById('out').textContent =
    'Clean: "' + res.clean + '"\\nReversed: "' + res.reversed + '"\\nIs Palindrome? ' + res.match;
}

document.getElementById('btn-check').addEventListener('click', run);
run();`,
        solutionJs: `function isPalindrome(raw) {
  const clean = raw.trim().toLowerCase();
  let reversed = '';

  for (let i = clean.length - 1; i >= 0; i--) {
    reversed += clean[i];
  }

  return { clean, reversed, match: clean.length > 0 && clean === reversed };
}

function run() {
  const res = isPalindrome(document.getElementById('word-in').value);
  document.getElementById('out').textContent =
    'Clean: "' + res.clean + '"\\nReversed: "' + res.reversed + '"\\nIs Palindrome? ' + res.match;
}

document.getElementById('btn-check').addEventListener('click', run);
run();`,
      },
      realLife: {
        title: 'Social Post / SMS Bio Character & Vowel Analyzer',
        scenario: 'Daily Life · Live Character Quota & Text Validator',
        taskPrompt:
          'As the user types a short social bio, use a `for (let i = 0; i < text.length; i++)` loop to count total characters, spaces, digits, and vowels, and warn if total length exceeds 40 characters.',
        starterHtml: `<div class="box">
  <h1>SMS / Social Bio Quota Checker</h1>
  <input id="bio-in" type="text" value="BCA Dev 2026 building JS apps" />
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function analyzeBio() {
  const text = document.getElementById('bio-in').value;
  let spaces = 0;
  let digits = 0;
  let vowels = 0;

  // TODO: Loop i from 0 to text.length - 1 and increment spaces, digits ('0'-'9'), and vowels
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') spaces += 1;
  }

  const remaining = 40 - text.length;
  document.getElementById('out').textContent =
    'Length: ' + text.length + '/40 (' + (remaining >= 0 ? remaining + ' left' : 'Over limit!') + ')' +
    '\\nSpaces: ' + spaces + ' | Digits: ' + digits + ' | Vowels: ' + vowels;
}

document.getElementById('bio-in').addEventListener('input', analyzeBio);
analyzeBio();`,
        solutionJs: `function analyzeBio() {
  const text = document.getElementById('bio-in').value;
  let spaces = 0;
  let digits = 0;
  let vowels = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') spaces += 1;
    if (ch >= '0' && ch <= '9') digits += 1;
    if ('aeiouAEIOU'.includes(ch)) vowels += 1;
  }

  const remaining = 40 - text.length;
  document.getElementById('out').textContent =
    'Length: ' + text.length + '/40 (' + (remaining >= 0 ? remaining + ' left' : 'Over limit!') + ')' +
    '\\nSpaces: ' + spaces + ' | Digits: ' + digits + ' | Vowels: ' + vowels;
}

document.getElementById('bio-in').addEventListener('input', analyzeBio);
analyzeBio();`,
      },
    },
    quiz: [
      {
        question: 'If `const title = "Code"`, what does `title[0] = "M"; console.log(title)` output in standard JS?',
        options: ['`"Mode"`', '`"Code"` because strings are immutable', '`["M", "o", "d", "e"]`'],
        correctIndex: 1,
        explanation: 'JavaScript strings are primitive and immutable; index assignment cannot overwrite characters in place.',
      },
      {
        question: 'How do you access the final character of any non-empty string `s` using its `.length` property?',
        options: ['`s[s.length]`', '`s[s.length - 1]`', '`s.length(-1)`'],
        correctIndex: 1,
        explanation: 'Because indexing starts at `0`, the last character is always at `s.length - 1`. (`s[s.length]` is `undefined`.)',
      },
    ],
  },
  {
    id: 't05-string-methods',
    number: 6,
    categoryId: 'cat-2-strings-arrays',
    categoryTitle: '2. Inbuilt String & Array Methods',
    tier: 'Basic',
    title: 'Inbuilt String Methods (slice, substring, substr, indexOf, replaceAll, split...)',
    webDevUseCase: 'Parsing URLs, Masking Inputs, Search Highlighting & Text Cleanup',
    summary:
      'Master every essential inbuilt string method: `slice()`, `substring()`, `substr()`, `indexOf()`, `lastIndexOf()`, `replace()`, `replaceAll()`, `startsWith()`, `endsWith()`, and `split()`—remembering all of them return a new string or array.',
    revisionTldr:
      '`slice(start, end)` accepts negative indices; `substring(start, end)` swaps args if start>end; legacy `substr(start, len)` takes length. `indexOf`/`lastIndexOf` return `-1` if missing. `replace` fixes first match; `replaceAll` fixes all; `startsWith`/`endsWith` return booleans; `split(sep)` returns an array.',
    explanation: [
      'Extracting parts of a string: `slice(start, end)` extracts from `start` up to (not including) `end` and supports negative offsets like `str.slice(-4)` for the last 4 characters. `substring(start, end)` treats negatives as `0` and swaps arguments if `start > end`. Legacy `substr(start, length)` takes a start index plus a character count (legacy—prefer `slice()` in new code).',
      'Searching & testing prefixes/suffixes: `indexOf("word")` finds the FIRST position (or `-1` if absent), while `lastIndexOf("word")` finds the LAST position from the right. For readable true/false checks, use `startsWith("https://")` and `endsWith(".pdf")`.',
      'Replacing & splitting: `replace("a", "b")` replaces ONLY the first occurrence, whereas `replaceAll("a", "b")` replaces every match. Finally, `split(delimiter)` breaks a string into an array (for example, `"a,b,c".split(",")` -> `["a", "b", "c"]`), and remember all string methods leave the original string untouched.',
    ],
    keyRules: [
      'Prefer `slice(start, end)` over `substr()` (deprecated) because `slice()` cleanly supports negative indices like `slice(-4)`.',
      'Always check `str.indexOf(sub) !== -1` (remember index `0` is falsy, so `if (str.indexOf(sub))` fails when found at index `0`!).',
      'Use `replaceAll(" ", "-")` instead of `replace(" ", "-")` when replacing multiple occurrences without regex `/g`.',
    ],
    codeExample: `const url = '  https://shop.dev/api/orders/api/101  '.trim();

// 1. Extraction: slice vs substring vs substr
console.log('slice(-3):', url.slice(-3));          // '101'
console.log('substring(0, 5):', url.substring(0, 5)); // 'https'
console.log('substr(8, 8):', url.substr(8, 8));    // 'shop.dev' (start, length)

// 2. Searching & Prefix/Suffix checks
console.log('indexOf("api"):', url.indexOf('api'));         // 17
console.log('lastIndexOf("api"):', url.lastIndexOf('api')); // 28
console.log('startsWith https:', url.startsWith('https://')); // true
console.log('endsWith 101:', url.endsWith('101'));            // true

// 3. Replacing & Splitting
console.log('replace first:', 'a-b-a'.replace('a', 'X'));       // 'X-b-a'
console.log('replaceAll:', 'a-b-a'.replaceAll('a', 'X'));       // 'X-b-X'
console.log('split segments:', 'react,node,js'.split(','));     // ['react', 'node', 'js']`,
    commonMistake: {
      label: 'Using replace() for all occurrences or treating indexOf() === 0 as falsy',
      avoid: `const path = '/home';
if (path.indexOf('/')) { /* BUG: index 0 is falsy, skips! */ }
const slug = 'hello world again'.replace(' ', '-'); // 'hello-world again'`,
      prefer: `if (path.startsWith('/')) { /* crystal clear! */ }
const slug = 'hello world again'.replaceAll(' ', '-'); // 'hello-world-again'`,
    },
    practice: {
      logical: {
        title: 'String Methods Exam Logic (slice vs substr, indexOf 0, replaceAll)',
        scenario: 'Exam Question · Predict & Fix Subtle String Method Traps',
        taskPrompt:
          'Fix 3 common exam bugs below: (1) `indexOf("/")` returns `0` (falsy!) so root path detection fails—use `startsWith`, (2) `replace(" ", "-")` only replaces the first space—use `replaceAll`, and (3) extract the last 4 chars using negative `slice(-4)`.',
        starterHtml: `<div class="box">
  <h1>String Methods Exam Challenge</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const path = '/courses/js';
// BUG 1: path.indexOf('/') returns 0, which if(...) treats as false!
const isRootPath = path.indexOf('/') ? true : false;

// BUG 2: replace() only replaces the FIRST space!
const slug = 'learn js string methods'.replace(' ', '-');

// BUG 3: Replace placeholder with slice(-4) & lastIndexOf('s')
const word = 'Mississippi';
const last4 = word.substring(-4); // substring treats negative as 0!
const lastS = word.indexOf('s');   // finds FIRST 's', we want LAST 's'

document.getElementById('out').textContent = [
  'isRootPath (expected true): ' + isRootPath,
  'slug (expected learn-js-string-methods): ' + slug,
  'last4 (expected ippi): ' + last4,
  'lastIndexOf("s") (expected 6): ' + lastS,
].join('\\n');`,
        solutionJs: `const path = '/courses/js';
const isRootPath = path.startsWith('/');
const slug = 'learn js string methods'.replaceAll(' ', '-');

const word = 'Mississippi';
const last4 = word.slice(-4);
const lastS = word.lastIndexOf('s');

document.getElementById('out').textContent = [
  'isRootPath (expected true): ' + isRootPath,
  'slug (expected learn-js-string-methods): ' + slug,
  'last4 (expected ippi): ' + last4,
  'lastIndexOf("s") (expected 6): ' + lastS,
].join('\\n');`,
      },
      realLife: {
        title: 'WhatsApp Phone Masker, PDF Checker & URL Slugger',
        scenario: 'Daily Life · Checkout Privacy Masking & File Upload Validation',
        taskPrompt:
          'In a real workspace form: mask a 10-digit phone number using `.slice(-4)` (`******4321`), check `.endsWith(".pdf")` for resume uploads, build a clean URL slug with `.replaceAll(" ", "-")`, and split comma tags via `.split(",")`.',
        starterHtml: `<div class="box">
  <h1>Workspace Text & File Validator</h1>
  <input id="phone" type="text" value="9876544321" placeholder="10-digit phone" />
  <input id="resume" type="text" value="Aarav_Resume_2026.pdf" placeholder="Filename" />
  <input id="title" type="text" value="Full Stack JS Guide" placeholder="Blog title" />
  <button id="btn-run" type="button">Process Inputs</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function processWorkspace() {
  const phone = document.getElementById('phone').value.trim();
  const file = document.getElementById('resume').value.trim();
  const title = document.getElementById('title').value.trim().toLowerCase();

  // TODO: Use slice(-4) to mask phone like '******' + phone.slice(-4)
  const maskedPhone = phone;
  // TODO: Check endsWith('.pdf') and indexOf('.') !== -1
  const validPdf = false;
  // TODO: Convert spaces to '-' with replaceAll
  const urlSlug = title;
  const words = title.split(' ');

  document.getElementById('out').textContent =
    'Masked Phone: ' + maskedPhone +
    '\\nValid PDF? ' + validPdf +
    '\\nURL Slug: /blog/' + urlSlug +
    '\\nWords (' + words.length + '): ' + JSON.stringify(words);
}

document.getElementById('btn-run').addEventListener('click', processWorkspace);
processWorkspace();`,
        solutionJs: `function processWorkspace() {
  const phone = document.getElementById('phone').value.trim();
  const file = document.getElementById('resume').value.trim();
  const title = document.getElementById('title').value.trim().toLowerCase();

  const maskedPhone = '******' + phone.slice(-4);
  const validPdf = file.toLowerCase().endsWith('.pdf') && file.indexOf('.') > 0;
  const urlSlug = title.replaceAll(' ', '-');
  const words = title.split(' ');

  document.getElementById('out').textContent =
    'Masked Phone: ' + maskedPhone +
    '\\nValid PDF? ' + validPdf +
    '\\nURL Slug: /blog/' + urlSlug +
    '\\nWords (' + words.length + '): ' + JSON.stringify(words);
}

document.getElementById('btn-run').addEventListener('click', processWorkspace);
processWorkspace();`,
      },
    },
    quiz: [
      {
        question: 'What is the main difference between `"abc".slice(0, 2)` and legacy `"abc".substr(1, 2)`?',
        options: [
          '`slice(start, end)` takes an END index; `substr(start, length)` takes a character COUNT as its 2nd argument',
          '`substr()` mutates the original string',
          '`slice()` only works on arrays',
        ],
        correctIndex: 0,
        explanation:
          '`slice(start, end)` stops before `end`, while legacy `substr(start, length)` extracts `length` characters starting from `start`.',
      },
      {
        question: 'What does `"banana".lastIndexOf("a")` return?',
        options: ['1', '5', '-1'],
        correctIndex: 1,
        explanation: '`indexOf("a")` returns `1` (first match), whereas `lastIndexOf("a")` returns `5` (final match).',
      },
    ],
  },
  {
    id: 't06a-array-foundations',
    number: 7,
    categoryId: 'cat-2-strings-arrays',
    categoryTitle: '2. Inbuilt String & Array Methods',
    tier: 'Basic',
    title: 'Array Basics: Creation, Indexing, Length & Accessing with for Loops',
    webDevUseCase: 'Storing Lists, Updating Elements & Computing Totals with Loops',
    summary:
      'Build a solid foundation with JavaScript arrays before jumping into inbuilt methods: creating arrays, reading and modifying zero-based indices (`arr[0]`), checking `.length` and `Array.isArray()`, and traversing every item using `for` loops.',
    revisionTldr:
      'Arrays store ordered values at indices `0`..`arr.length - 1`. Read/update via `arr[i]`; verify arrays via `Array.isArray(x)`. Loop with `for (let i = 0; i < arr.length; i++)` (need index/reverse/break) or `for (const item of arr)`.',
    explanation: [
      'An **Array** (`const skills = ["HTML", "CSS", "JS"]`) holds an ordered list of values inside square brackets. Positions start at `0`: `skills[0]` is `"HTML"`, `skills[1]` is `"CSS"`, and `skills[skills.length - 1]` is `"JS"`. Even when declared with `const`, you can still update elements inside (`skills[1] = "Tailwind"`)—`const` only prevents reassigning `skills = []`.',
      'To access every element one by one, the fundamental pattern is a **classic `for` loop**: `for (let i = 0; i < arr.length; i++) { console.log(i, arr[i]); }`. Writing `< arr.length` (strictly less than!) ensures you stop at the final valid index `arr.length - 1` instead of reading `undefined` past the end.',
      'Classic `for` loops shine when you need the numeric index `i`, want to loop backwards (`for (let i = arr.length - 1; i >= 0; i--)`), step by 2 (`i += 2`), or exit early with `break`. When you just want each value cleanly left-to-right, `for (const item of arr)` is also great.',
    ],
    keyRules: [
      'Loop condition MUST be `i < arr.length`, NEVER `i <= arr.length` (which reads an extra `undefined` element at `arr[arr.length]`).',
      'Use `Array.isArray(val)` to check if a value is an array—`typeof []` returns `"object"`!',
      'Prefer array literals `["a", "b"]` instead of `new Array(5)` (which creates 5 confusing empty holes).',
    ],
    codeExample: `const marks = [78, 92, 65, 88];
console.log('First:', marks[0], '| Last:', marks[marks.length - 1]);

// Update an element by index:
marks[2] = 75;

// 1. Classic for loop (forward with index):
let sum = 0;
for (let i = 0; i < marks.length; i++) {
  console.log('Student #' + i + ':', marks[i]);
  sum += marks[i];
}
console.log('Average:', sum / marks.length);

// 2. Reverse for loop:
for (let i = marks.length - 1; i >= 0; i--) {
  console.log('Reverse:', marks[i]);
}`,
    commonMistake: {
      label: 'Off-by-one loop condition (i <= arr.length) or using typeof arr === "array"',
      avoid: `const nums = [10, 20, 30];
for (let i = 0; i <= nums.length; i++) {
  console.log(nums[i]); // Prints undefined on the 4th iteration!
}
console.log(typeof nums); // "object", NOT "array"!`,
      prefer: `for (let i = 0; i < nums.length; i++) {
  console.log(nums[i]); // 10, 20, 30
}
console.log(Array.isArray(nums)); // true`,
    },
    practice: {
      logical: {
        title: 'Find Second Largest Element Using One for Loop',
        scenario: 'Exam Question · Classic Array Traversal Algorithm (No .sort())',
        taskPrompt:
          'A classic exam question: given `nums = [14, 92, 55, 92, 38, 74]`, find the SECOND largest unique number (`74`) using a single `for (let i = 0; i < nums.length; i++)` loop without calling `.sort()`. Also fix the `i <= nums.length` off-by-one bug!',
        starterHtml: `<div class="box">
  <h1>Second Largest via for Loop</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const nums = [14, 92, 55, 92, 38, 74];
let first = -Infinity;
let second = -Infinity;

// BUG: i <= nums.length reads undefined! Fix to i < nums.length and update first/second
for (let i = 0; i <= nums.length; i++) {
  const n = nums[i];
  if (n > first) {
    first = n; // TODO: save old 'first' into 'second' before overwriting!
  }
}

document.getElementById('out').textContent =
  'Array: ' + JSON.stringify(nums) +
  '\\nLargest: ' + first +
  '\\nSecond Largest (expected 74): ' + second;`,
        solutionJs: `const nums = [14, 92, 55, 92, 38, 74];
let first = -Infinity;
let second = -Infinity;

for (let i = 0; i < nums.length; i++) {
  const n = nums[i];
  if (n > first) {
    second = first;
    first = n;
  } else if (n > second && n < first) {
    second = n;
  }
}

document.getElementById('out').textContent =
  'Array: ' + JSON.stringify(nums) +
  '\\nLargest: ' + first +
  '\\nSecond Largest: ' + second;`,
      },
      realLife: {
        title: 'Weekly Daily-Expense Tracker (for Loop)',
        scenario: 'Daily Life · Calculating Spend, Peak Day & Budget Alerts',
        taskPrompt:
          'You recorded 7 daily expenses `[220, 640, 150, 980, 310, 450, 520]`. Write a `for (let i = 0; i < expenses.length; i++)` loop to compute the weekly total, average per day, highest spend, and how many days crossed ₹500.',
        starterHtml: `<div class="box">
  <h1>Weekly Expense Tracker</h1>
  <button id="btn-calc" type="button">Analyze Weekly Spend</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const expenses = [220, 640, 150, 980, 310, 450, 520];

function analyze() {
  let total = 0;
  let peak = expenses[0];
  let over500Count = 0;

  // TODO: Loop i from 0 to expenses.length - 1 and compute total, peak, and over500Count

  const avg = (total / expenses.length).toFixed(2);
  document.getElementById('out').textContent =
    'Total Spend: ₹' + total +
    '\\nDaily Avg: ₹' + avg +
    '\\nHighest Day: ₹' + peak +
    '\\nDays over ₹500: ' + over500Count;
}

document.getElementById('btn-calc').addEventListener('click', analyze);
analyze();`,
        solutionJs: `const expenses = [220, 640, 150, 980, 310, 450, 520];

function analyze() {
  let total = 0;
  let peak = expenses[0];
  let over500Count = 0;

  for (let i = 0; i < expenses.length; i++) {
    const amt = expenses[i];
    total += amt;
    if (amt > peak) peak = amt;
    if (amt > 500) over500Count += 1;
  }

  const avg = (total / expenses.length).toFixed(2);
  document.getElementById('out').textContent =
    'Total Spend: ₹' + total +
    '\\nDaily Avg: ₹' + avg +
    '\\nHighest Day: ₹' + peak +
    '\\nDays over ₹500: ' + over500Count;
}

document.getElementById('btn-calc').addEventListener('click', analyze);
analyze();`,
      },
    },
    quiz: [
      {
        question: 'What happens if you write `for (let i = 0; i <= arr.length; i++)` on `const arr = ["a", "b"]`?',
        options: [
          'It prints `"a"` and `"b"` cleanly',
          'It runs an extra iteration where `arr[2]` is `undefined`',
          'JavaScript throws a SyntaxError',
        ],
        correctIndex: 1,
        explanation: 'For a 2-item array, valid indices are `0` and `1`; `arr[2]` is `undefined`. Always use `i < arr.length`.',
      },
      {
        question: 'How do you reliably check whether a variable `data` is a JavaScript Array?',
        options: ['`typeof data === "array"`', '`Array.isArray(data)`', '`data.isArray()`'],
        correctIndex: 1,
        explanation: '`typeof []` evaluates to `"object"`, so always use `Array.isArray(data)`.',
      },
    ],
  },
  {
    id: 't06-array-basics-methods',
    number: 8,
    categoryId: 'cat-2-strings-arrays',
    categoryTitle: '2. Inbuilt String & Array Methods',
    tier: 'Basic',
    title: 'Inbuilt Array Methods (toString, join, slice, push, pop, shift, unshift, concat, indexOf, reverse, sort, splice...)',
    webDevUseCase: 'Adding, Removing, Joining, Searching & Sorting Lists Safely',
    summary:
      'Master all 14 core inbuilt array methods (`toString()`, `join()`, `slice()`, `push()`, `pop()`, `concat()`, `indexOf()`, `lastIndexOf()`, `includes()`, `shift()`, `unshift()`, `reverse()`, `sort()`, `splice()`) and know which ones mutate vs copy.',
    revisionTldr:
      'Mutating (edits original): `push`, `pop`, `unshift`, `shift`, `splice`, `reverse`, `sort`. Non-mutating (returns new): `toString`, `join`, `slice`, `concat`, `indexOf`, `lastIndexOf`, `includes`. Always pass `(a,b) => a-b` to `sort()` for numbers!',
    explanation: [
      'Convert, Combine & Copy (Non-Mutating): `toString()` converts elements into a comma-separated string (`[1,2].toString()` -> `"1,2"`), while `join(" | ")` lets you pick any custom separator. `concat()` merges arrays into a brand-new array (`a.concat(b)`), and `slice(start, end)` copies a sub-section without changing the original array.',
      'Search Elements (Non-Mutating): `indexOf(val)` returns the first matching index or `-1`; `lastIndexOf(val)` searches from the end; `includes(val)` returns a clean boolean (`true`/`false`)—and unlike `indexOf`, `includes(NaN)` also works accurately.',
      'Add, Remove & Reorder (Mutating In Place!): `push()`/`pop()` add/remove at the END (fast O(1)); `unshift()`/`shift()` add/remove at the START. `splice(start, deleteCount, ...newItems)` inserts, removes, or replaces anywhere in the middle. Finally, `reverse()` flips the array in place, and `sort()` sorts strings alphabetically in place—for numbers, always copy and pass a comparator: `[...nums].sort((a, b) => a - b)`.',
    ],
    keyRules: [
      'Memorize mutating vs non-mutating: `slice()` COPIES safely; `splice()` MUTATES the array directly.',
      '`sort()` converts items to strings by default (`[10, 2]` stays `[10, 2]`). Always write `[...arr].sort((a, b) => a - b)` for numbers.',
      'Use `arr.includes(val)` for boolean checks and `arr.indexOf(val) !== -1` when you need the index.',
    ],
    codeExample: `// 1. Convert & Combine (Non-mutating)
const a = ['HTML', 'CSS'];
const b = ['JS', 'CSS'];
const all = a.concat(b);                 // ['HTML', 'CSS', 'JS', 'CSS']
console.log('toString:', all.toString()); // 'HTML,CSS,JS,CSS'
console.log('join:', all.join(' -> '));   // 'HTML -> CSS -> JS -> CSS'

// 2. Search (Non-mutating)
console.log('indexOf CSS:', all.indexOf('CSS'));         // 1
console.log('lastIndexOf CSS:', all.lastIndexOf('CSS')); // 3
console.log('includes JS:', all.includes('JS'));         // true
console.log('slice(1, 3):', all.slice(1, 3));            // ['CSS', 'JS']

// 3. Mutate Ends & Middle
const queue = ['T1', 'T2'];
queue.push('T3');      // ['T1', 'T2', 'T3'] (add end)
queue.pop();           // ['T1', 'T2']       (remove end)
queue.unshift('T0');   // ['T0', 'T1', 'T2'] (add start)
queue.shift();         // ['T1', 'T2']       (remove start)
queue.splice(1, 1, 'T99', 'T100'); // At index 1, remove 1 & insert 2 -> ['T1', 'T99', 'T100']

// 4. Reverse & Numeric Sort
const nums = [40, 5, 100, 12];
nums.sort((x, y) => x - y); // [5, 12, 40, 100]
nums.reverse();             // [100, 40, 12, 5]`,
    commonMistake: {
      label: 'Calling .sort() on numbers without comparator or expecting slice() to mutate',
      avoid: `const nums = [10, 2, 30];
nums.sort(); // [10, 2, 30] — sorted as strings!
const part = nums.slice(0, 1); // Did NOT remove anything from nums!`,
      prefer: `const sorted = [...nums].sort((a, b) => a - b); // [2, 10, 30]
const removed = nums.splice(0, 1); // Mutates nums, returns removed items`,
    },
    practice: {
      logical: {
        title: 'Inbuilt Array Methods Exam Traps (sort, splice, slice)',
        scenario: 'Exam Question · Predict Output & Fix Numeric Sort / Splice Mutation',
        taskPrompt:
          'Fix two famous exam traps: (1) `scores.sort()` sorts `[100, 9, 42, 5]` alphabetically as `[100, 42, 5, 9]`—pass `(a, b) => a - b` on a copy! (2) Use `splice(1, 1, "Fixed")` to replace `"Bug"` cleanly while keeping `"slice"` non-mutating.',
        starterHtml: `<div class="box">
  <h1>Array Methods Exam Challenge</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const scores = [100, 9, 42, 5];
// BUG 1: Alphabetical sort puts 100 before 5! Pass numeric comparator (a, b) => a - b
const sortedAsc = [...scores].sort();

const items = ['A', 'Bug', 'C'];
// TODO: Use splice() at index 1 to remove 1 item ('Bug') and insert 'Fixed'
// items.splice(...);

const middleCopy = items.slice(0, 2);

document.getElementById('out').textContent =
  'Numeric sort (expected [5,9,42,100]): ' + JSON.stringify(sortedAsc) +
  '\\nAfter splice (expected ["A","Fixed","C"]): ' + JSON.stringify(items) +
  '\\nNon-mutating slice(0,2): ' + JSON.stringify(middleCopy);`,
        solutionJs: `const scores = [100, 9, 42, 5];
const sortedAsc = [...scores].sort((a, b) => a - b);

const items = ['A', 'Bug', 'C'];
items.splice(1, 1, 'Fixed');

const middleCopy = items.slice(0, 2);

document.getElementById('out').textContent =
  'Numeric sort: ' + JSON.stringify(sortedAsc) +
  '\\nAfter splice: ' + JSON.stringify(items) +
  '\\nNon-mutating slice(0,2): ' + JSON.stringify(middleCopy);`,
      },
      realLife: {
        title: 'Quick-Commerce Shopping Cart Queue Manager',
        scenario: 'Daily Life · Add, Prioritise, Remove & Sort Cart Items Live',
        taskPrompt:
          'Test a live grocery cart powered by inbuilt array methods (`push`, `pop`, `unshift`, `shift`, `splice`, `includes`, `join`, `sort`, `reverse`). Add the TODO check inside `btn-add` so duplicate items aren’t pushed twice.',
        starterHtml: `<div class="box">
  <h1>Grocery Cart Manager</h1>
  <input id="item-in" type="text" value="Coffee" placeholder="Add grocery item..." />
  <button id="btn-add" type="button">Add End (push)</button>
  <button id="btn-vip" type="button">Add Priority First (unshift)</button>
  <button id="btn-undo" type="button">Undo Last (pop)</button>
  <button id="btn-sort" type="button">Sort A-Z</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const cart = ['Milk', 'Bread', 'Eggs'];
const out = document.getElementById('out');

function render(actionMsg) {
  out.textContent =
    actionMsg +
    '\\nCart (' + cart.length + '): ' + cart.join(' | ') +
    '\\ntoString(): ' + cart.toString();
}

document.getElementById('btn-add').addEventListener('click', () => {
  const val = document.getElementById('item-in').value.trim();
  if (!val) return;
  // TODO: Check cart.includes(val) first—if already present, show 'Already in cart!'
  cart.push(val);
  render('Added "' + val + '" at end.');
});

document.getElementById('btn-vip').addEventListener('click', () => {
  const val = document.getElementById('item-in').value.trim();
  if (!val) return;
  cart.unshift(val);
  render('Prioritized "' + val + '" at index 0.');
});

document.getElementById('btn-undo').addEventListener('click', () => {
  const removed = cart.pop();
  render('Removed last item: ' + (removed ?? 'none'));
});

document.getElementById('btn-sort').addEventListener('click', () => {
  cart.sort();
  render('Sorted A-Z.');
});

render('Ready');`,
        solutionJs: `const cart = ['Milk', 'Bread', 'Eggs'];
const out = document.getElementById('out');

function render(actionMsg) {
  out.textContent =
    actionMsg +
    '\\nCart (' + cart.length + '): ' + cart.join(' | ') +
    '\\ntoString(): ' + cart.toString();
}

document.getElementById('btn-add').addEventListener('click', () => {
  const val = document.getElementById('item-in').value.trim();
  if (!val) return;
  if (cart.includes(val)) {
    render('"' + val + '" is already in your cart (index ' + cart.indexOf(val) + ')!');
    return;
  }
  cart.push(val);
  render('Added "' + val + '" at end.');
});

document.getElementById('btn-vip').addEventListener('click', () => {
  const val = document.getElementById('item-in').value.trim();
  if (!val) return;
  cart.unshift(val);
  render('Prioritized "' + val + '" at index 0.');
});

document.getElementById('btn-undo').addEventListener('click', () => {
  const removed = cart.pop();
  render('Removed last item: ' + (removed ?? 'none'));
});

document.getElementById('btn-sort').addEventListener('click', () => {
  cart.sort();
  render('Sorted A-Z.');
});

render('Ready');`,
      },
    },
    quiz: [
      {
        question: 'Which pair of array methods adds and removes elements from the BEGINNING of an array?',
        options: ['`push()` and `pop()`', '`unshift()` and `shift()`', '`slice()` and `concat()`'],
        correctIndex: 1,
        explanation: '`unshift()` inserts at index `0` and `shift()` removes index `0` (`push`/`pop` work on the end).',
      },
      {
        question: 'What does `const arr = ["a", "b", "c"]; arr.splice(1, 1, "X")` leave inside `arr`?',
        options: ['`["a", "X", "c"]`', '`["a", "X", "b", "c"]`', '`["b"]`'],
        correctIndex: 0,
        explanation:
          '`splice(1, 1, "X")` starts at index `1`, deletes `1` item (`"b"`), and inserts `"X"` in its place.',
      },
    ],
  },
  {
    id: 't07-foreach-map',
    number: 9,
    categoryId: 'cat-2-strings-arrays',
    categoryTitle: '2. Inbuilt String & Array Methods',
    tier: 'Intermediate',
    title: 'Iterating Arrays & Arrays of Objects (forEach() vs map())',
    webDevUseCase: 'Transforming API Arrays into Clean UI Cards',
    summary:
      'Choose `forEach()` for side effects (`console.log`, DOM appending) and `map()` for transforming every element into a brand-new array of equal length.',
    revisionTldr:
      '`forEach()` always returns `undefined` (side effects only); `map()` returns a NEW transformed array of identical length (must `return` inside callback).',
    explanation: [
      '`forEach((item, index) => ...)` runs a callback once per element purely for side effects and ALWAYS returns `undefined`. You cannot `break` out of `forEach()` early.',
      '`map((item, index) => ...)` transforms each element and builds a BRAND-NEW array of the exact same length—making it essential when converting raw JSON records into formatted UI items.',
      'If you forget `return` inside `map(() => { ... })`, every element in the resulting array becomes `undefined`.',
    ],
    keyRules: [
      'Never use `map()` if you ignore its return value; use `forEach()` or `for...of`.',
      'Inside `map()`, always return the transformed value (`item => ({ ...item, taxed: item.price * 1.18 })`).',
      'When iterating an Array of Object Notations, destructure properties right in the parameter list: `users.map(({ name, role }) => ...)`.',
    ],
    codeExample: `const items = [
  { name: 'Notebook', price: 200 },
  { name: 'Pen', price: 40 },
];

// map() transforms data into a new array
const tagged = items.map(({ name, price }) => name + ' (₹' + price + ')');

// forEach() executes side effects
tagged.forEach((label) => console.log('Item:', label));`,
    commonMistake: {
      label: 'Expecting forEach to return a new array or omitting return in map',
      avoid: `const titles = books.forEach((b) => b.title); // undefined!
const upper = books.map((b) => { b.title.toUpperCase(); }); // [undefined, ...]`,
      prefer: `const titles = books.map((b) => b.title);
const upper = books.map((b) => b.title.toUpperCase());`,
    },
    practice: {
      logical: {
        title: 'Fix Missing Return in map() & undefined forEach() Trap',
        scenario: 'Exam Question · Why map() Returns [undefined] & forEach() Returns undefined',
        taskPrompt:
          'Debug two classic exam mistakes: `doubled` uses `forEach` (which returns `undefined`!) and `squares` uses `{}` inside `map()` without `return`. Fix both so the output shows `[2, 4, 6]` and `[1, 4, 9]`.',
        starterHtml: `<div class="box">
  <h1>forEach vs map Exam Bug Hunt</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const nums = [1, 2, 3];

// BUG 1: forEach always returns undefined! Switch to map()
const doubled = nums.forEach((n) => n * 2);

// BUG 2: Block {} inside map() without 'return' produces [undefined, undefined, undefined]!
const squares = nums.map((n) => { n * n; });

document.getElementById('out').textContent =
  'doubled (expected [2,4,6]): ' + JSON.stringify(doubled) +
  '\\nsquares (expected [1,4,9]): ' + JSON.stringify(squares);`,
        solutionJs: `const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2);
const squares = nums.map((n) => {
  return n * n;
});

document.getElementById('out').textContent =
  'doubled: ' + JSON.stringify(doubled) +
  '\\nsquares: ' + JSON.stringify(squares);`,
      },
      realLife: {
        title: 'E-Commerce Product Card Price Tag Renderer',
        scenario: 'Daily Life · Applying 18% GST with map() & Rendering List with forEach()',
        taskPrompt:
          'Given an array of catalog items, use `.map()` to calculate `withGst` (`Math.round(item.price * 1.18)`) and return `{ label }`, then use `.forEach()` to append `<li>` elements to the store list.',
        starterHtml: `<div class="box">
  <h1>Store Catalog Price List (18% GST)</h1>
  <ul id="list"></ul>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const products = [
  { title: 'Mechanical Keyboard', price: 2500 },
  { title: 'USB-C Hub', price: 1200 },
  { title: 'Laptop Stand', price: 850 },
];

// TODO: Use map() to add 18% GST to each price
const priceTags = products.map((item) => {
  const withGst = item.price; // BUG: add 18% GST here!
  return item.title + ' — Base ₹' + item.price + ' -> Final ₹' + withGst;
});

const listEl = document.getElementById('list');
priceTags.forEach((line) => {
  const li = document.createElement('li');
  li.textContent = line;
  listEl.appendChild(li);
});`,
        solutionJs: `const products = [
  { title: 'Mechanical Keyboard', price: 2500 },
  { title: 'USB-C Hub', price: 1200 },
  { title: 'Laptop Stand', price: 850 },
];

const priceTags = products.map((item) => {
  const withGst = Math.round(item.price * 1.18);
  return item.title + ' — Base ₹' + item.price + ' -> Final ₹' + withGst;
});

const listEl = document.getElementById('list');
priceTags.forEach((line) => {
  const li = document.createElement('li');
  li.textContent = line;
  listEl.appendChild(li);
});`,
      },
    },
    quiz: [
      {
        question: 'What does `[1, 2, 3].forEach((n) => n * 2)` return?',
        options: ['[2, 4, 6]', 'undefined', '6'],
        correctIndex: 1,
        explanation: '`forEach()` always returns `undefined`; use `map()` to produce `[2, 4, 6]`.',
      },
      {
        question: 'What happens when a `map()` block `{ ... }` has no `return` statement?',
        options: [
          'It keeps the original elements unchanged',
          'It returns an array of `undefined` values',
          'It filters out elements automatically',
        ],
        correctIndex: 1,
        explanation: 'Functions without `return` yield `undefined`, so `map()` fills the new array with `undefined`.',
      },
    ],
  },
  {
    id: 't08-filter-find-index',
    number: 10,
    categoryId: 'cat-2-strings-arrays',
    categoryTitle: '2. Inbuilt String & Array Methods',
    tier: 'Intermediate',
    title: 'Searching & Filtering (filter(), find(), findIndex(), includes())',
    webDevUseCase: 'Live Search Bars, Deleting Items & Lookup by ID',
    summary:
      'Filter subsets with `filter()`, locate the first matching object with `find()`, retrieve positions with `findIndex()`, and test primitive membership with `includes()`.',
    revisionTldr:
      '`filter()` -> NEW array of all matches (`[]` if none); `find()` -> FIRST matching item or `undefined`; `findIndex()` -> index or `-1`.',
    explanation: [
      '`filter(predicate)` tests every item and returns a NEW array containing only items for which the callback returns truthy. It is the cleanest way to delete an item immutably: `items.filter(x => x.id !== id)`.',
      '`find(predicate)` stops immediately at the first match and returns that object/value directly—or `undefined` if nothing matches.',
      '`findIndex(predicate)` returns the numeric index (`0, 1, ...`) or `-1` when missing. Always guard `if (idx !== -1)` before passing the index to `splice` or `slice`.',
    ],
    keyRules: [
      'Use `find()` when looking up a unique ID (`users.find(u => u.id === 4)`), not `filter()[0]`.',
      'Guard `find()` results (`if (!item) return;`) because `undefined.name` throws a TypeError.',
      'Check `idx !== -1` before using `findIndex()` or `indexOf()`.',
    ],
    codeExample: `const users = [
  { id: 1, name: 'Asha', active: true },
  { id: 2, name: 'Dev', active: false },
  { id: 3, name: 'Neha', active: true },
];

const activeUsers = users.filter((u) => u.active);
const devUser = users.find((u) => u.id === 2);
const nehaIdx = users.findIndex((u) => u.name === 'Neha');
console.log({ activeCount: activeUsers.length, devUser, nehaIdx });`,
    commonMistake: {
      label: 'Using filter() when expecting a single object',
      avoid: `const product = items.filter((p) => p.id === 10);
console.log(product.price); // undefined! product is an ARRAY!`,
      prefer: `const product = items.find((p) => p.id === 10);
if (product) console.log(product.price);`,
    },
    practice: {
      logical: {
        title: 'filter() vs find() & findIndex() === -1 Guard',
        scenario: 'Exam Question · Avoid Array-vs-Object & -1 Index Bugs',
        taskPrompt:
          'Fix two bugs: (1) `getUserById` uses `.filter()` so `user.name` is `undefined`—switch to `.find()`, and (2) `removeById` calls `.splice(idx, 1)` even when `findIndex()` returns `-1` (which deletes the LAST item in the array!). Guard `idx !== -1`.',
        starterHtml: `<div class="box">
  <h1>filter / find / findIndex Exam Bug Hunt</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const users = [
  { id: 10, name: 'Asha' },
  { id: 20, name: 'Dev' },
  { id: 30, name: 'Neha' },
];

// BUG 1: filter() returns [{ id: 20, name: 'Dev' }], so .name is undefined!
const foundUser = users.filter((u) => u.id === 20);

// BUG 2: findIndex returns -1 for missing id=999, and splice(-1, 1) deletes Neha!
const copy = [...users];
const idx = copy.findIndex((u) => u.id === 999);
copy.splice(idx, 1);

document.getElementById('out').textContent =
  'Found user name (expected Dev): ' + foundUser?.name +
  '\\nRemaining count after missing ID delete (expected 3): ' + copy.length;`,
        solutionJs: `const users = [
  { id: 10, name: 'Asha' },
  { id: 20, name: 'Dev' },
  { id: 30, name: 'Neha' },
];

const foundUser = users.find((u) => u.id === 20);

const copy = [...users];
const idx = copy.findIndex((u) => u.id === 999);
if (idx !== -1) {
  copy.splice(idx, 1);
}

document.getElementById('out').textContent =
  'Found user name: ' + foundUser?.name +
  '\\nRemaining count after missing ID delete: ' + copy.length;`,
      },
      realLife: {
        title: 'Support Ticket Live Search & ID Lookup',
        scenario: 'Daily Life · Filtering Helpdesk Queue & Locating Exact Ticket',
        taskPrompt:
          'Type into the search box to filter support tickets by title OR priority using `.filter()`, and display the first `"High"` priority ticket found with `.find()`.',
        starterHtml: `<div class="box">
  <h1>Helpdesk Ticket Search</h1>
  <input id="q" type="text" placeholder="Search (e.g. login or high)..." />
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const tickets = [
  { id: 101, title: 'Reset password email', priority: 'High' },
  { id: 102, title: 'Update billing GSTIN', priority: 'Low' },
  { id: 103, title: 'Checkout UPI timeout', priority: 'High' },
];

function search() {
  const q = document.getElementById('q').value.trim().toLowerCase();
  // TODO: Match either ticket title OR ticket priority!
  const matched = tickets.filter((t) => t.title.toLowerCase().includes(q));
  const urgent = tickets.find((t) => t.priority === 'High');

  document.getElementById('out').textContent =
    'Matching Tickets (' + matched.length + '): ' +
    (matched.map((t) => '#' + t.id + ' ' + t.title).join(' | ') || 'None') +
    '\\nFirst High Priority: ' + (urgent ? '#' + urgent.id + ' ' + urgent.title : 'None');
}

document.getElementById('q').addEventListener('input', search);
search();`,
        solutionJs: `const tickets = [
  { id: 101, title: 'Reset password email', priority: 'High' },
  { id: 102, title: 'Update billing GSTIN', priority: 'Low' },
  { id: 103, title: 'Checkout UPI timeout', priority: 'High' },
];

function search() {
  const q = document.getElementById('q').value.trim().toLowerCase();
  const matched = tickets.filter(
    (t) => t.title.toLowerCase().includes(q) || t.priority.toLowerCase().includes(q)
  );
  const urgent = tickets.find((t) => t.priority === 'High');

  document.getElementById('out').textContent =
    'Matching Tickets (' + matched.length + '): ' +
    (matched.map((t) => '#' + t.id + ' ' + t.title).join(' | ') || 'None') +
    '\\nFirst High Priority: ' + (urgent ? '#' + urgent.id + ' ' + urgent.title : 'None');
}

document.getElementById('q').addEventListener('input', search);
search();`,
      },
    },
    quiz: [
      {
        question: 'What does `find()` return if no element satisfies the condition?',
        options: ['null', '-1', 'undefined'],
        correctIndex: 2,
        explanation: '`find()` returns `undefined` when nothing matches (whereas `findIndex()` returns `-1`).',
      },
      {
        question: 'What is the cleanest immutable way to remove item with `id === 5` from `items`?',
        options: [
          'items.filter(item => item.id !== 5)',
          'items.splice(5, 1)',
          'items.find(item => item.id !== 5)',
        ],
        correctIndex: 0,
        explanation: '`filter()` returns a brand-new array excluding item #5 without mutating the original array.',
      },
    ],
  },
  {
    id: 't09-some-every-reduce',
    number: 11,
    categoryId: 'cat-2-strings-arrays',
    categoryTitle: '2. Inbuilt String & Array Methods',
    tier: 'Intermediate',
    title: 'Testing & Folding (some(), every(), reduce(), reduceRight())',
    webDevUseCase: 'Cart Totals, Form Validation & Right-to-Left Composition',
    summary:
      'Short-circuit boolean checks across arrays with `some()` / `every()`, compute totals or lookup maps with `reduce()`, and fold from right to left with `reduceRight()`.',
    revisionTldr:
      '`some()` = at least one true; `every()` = all true; `reduce((acc, cur) => nextAcc, init)` folds left-to-right; `reduceRight()` folds right-to-left.',
    explanation: [
      '`some(fn)` returns `true` immediately when ANY element passes, while `every(fn)` returns `true` only if ALL elements pass (short-circuiting on the first `false`).',
      '`reduce((acc, item) => nextAcc, initialValue)` combines all elements into a single result—sums, averages, grouped objects, or flattened arrays.',
      '`reduceRight()` folds from the last index down to `0`, making it ideal for reversing pipelines or composing functions right-to-left.',
    ],
    keyRules: [
      'ALWAYS pass an explicit `initialValue` (`0`, `{}`, `[]`) to `reduce()` so empty arrays work without TypeErrors.',
      'Always `return` the updated accumulator `acc` inside every branch of `reduce()`.',
      'Watch out for `[].every(...)` returning `true`; check `arr.length > 0 && arr.every(...)` when non-empty lists are required.',
    ],
    codeExample: `const cart = [
  { item: 'Book', price: 450, qty: 2 },
  { item: 'Mouse', price: 800, qty: 1 },
];

const total = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
const hasMulti = cart.some((line) => line.qty > 1);
const allValid = cart.every((line) => line.price > 0);
const reversed = cart.reduceRight((acc, line) => [...acc, line.item], []);
console.log({ total, hasMulti, allValid, reversed });`,
    commonMistake: {
      label: 'Omitting initialValue in reduce() on an array of objects',
      avoid: `const sum = cart.reduce((acc, x) => acc + x.price);
// acc starts as the FIRST OBJECT, producing "[object Object]800"!`,
      prefer: `const sum = cart.reduce((acc, x) => acc + x.price, 0);`,
    },
    practice: {
      logical: {
        title: 'reduce() Initializer Bug & reduceRight() Function Composition',
        scenario: 'Exam Question · Grouping Frequency & Right-to-Left Function Compose',
        taskPrompt:
          'Fix two classic reduce problems: (1) `sumPrices` omits initial `0` so it outputs `"[object Object]500"`, and (2) `composeRight(add1, double)(5)` should use `reduceRight` (`double(5) = 10`, then `add1(10) = 11`).',
        starterHtml: `<div class="box">
  <h1>reduce & reduceRight Exam Challenge</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const rows = [{ price: 200 }, { price: 500 }, { price: 300 }];

// BUG 1: Missing initialValue 0 makes acc the first object!
const sumPrices = rows.reduce((acc, row) => acc + row.price);

// TODO 2: Use reduceRight to compose functions right-to-left: compose(f, g)(5) -> f(g(5))
const add1 = (x) => x + 1;
const double = (x) => x * 2;
const compose = (...fns) => (initial) =>
  fns.reduce((val, fn) => fn(val), initial); // Currently left-to-right! Change to reduceRight

document.getElementById('out').textContent =
  'sumPrices (expected 1000): ' + sumPrices +
  '\\ncompose(add1, double)(5) (expected 11): ' + compose(add1, double)(5);`,
        solutionJs: `const rows = [{ price: 200 }, { price: 500 }, { price: 300 }];
const sumPrices = rows.reduce((acc, row) => acc + row.price, 0);

const add1 = (x) => x + 1;
const double = (x) => x * 2;
const compose = (...fns) => (initial) =>
  fns.reduceRight((val, fn) => fn(val), initial);

document.getElementById('out').textContent =
  'sumPrices: ' + sumPrices +
  '\\ncompose(add1, double)(5): ' + compose(add1, double)(5);`,
      },
      realLife: {
        title: 'Swiggy / E-Commerce Cart Checkout Validator & Bill',
        scenario: 'Daily Life · Pre-Checkout Stock Check + Free Delivery Qualifier',
        taskPrompt:
          'Compute the total bill (`price * qty`) using `.reduce()`, verify every item is in stock via `.every()`, and check if any item qualifies for express shipping (`express === true`) via `.some()`.',
        starterHtml: `<div class="box">
  <h1>Checkout Readiness & Bill Summary</h1>
  <button id="btn-eval" type="button">Evaluate Order</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const basket = [
  { name: 'Wireless Mouse', price: 799, qty: 1, inStock: true, express: true },
  { name: 'Desk Mat', price: 450, qty: 2, inStock: true, express: false },
];

function evaluateCheckout() {
  // TODO: Multiply item.price * item.qty inside reduce()!
  const subtotal = basket.reduce((acc, item) => acc + item.price, 0);
  const canCheckout = basket.length > 0 && basket.every((i) => i.inStock);
  const hasExpressItem = basket.some((i) => i.express);

  document.getElementById('out').textContent =
    'Subtotal (expected ₹1699): ₹' + subtotal +
    '\\nAll items in stock? ' + canCheckout +
    '\\nExpress item in cart? ' + hasExpressItem;
}

document.getElementById('btn-eval').addEventListener('click', evaluateCheckout);
evaluateCheckout();`,
        solutionJs: `const basket = [
  { name: 'Wireless Mouse', price: 799, qty: 1, inStock: true, express: true },
  { name: 'Desk Mat', price: 450, qty: 2, inStock: true, express: false },
];

function evaluateCheckout() {
  const subtotal = basket.reduce((acc, item) => acc + item.price * item.qty, 0);
  const canCheckout = basket.length > 0 && basket.every((i) => i.inStock);
  const hasExpressItem = basket.some((i) => i.express);

  document.getElementById('out').textContent =
    'Subtotal: ₹' + subtotal +
    '\\nAll items in stock? ' + canCheckout +
    '\\nExpress item in cart? ' + hasExpressItem;
}

document.getElementById('btn-eval').addEventListener('click', evaluateCheckout);
evaluateCheckout();`,
      },
    },
    quiz: [
      {
        question: 'Why should you always pass an `initialValue` as the second argument to `reduce()`?',
        options: [
          'To avoid TypeError on empty arrays and control the starting accumulator type',
          'Because JavaScript throws a SyntaxError without it',
          'To force reduce() to iterate backwards',
        ],
        correctIndex: 0,
        explanation: 'Passing `0`, `{}`, or `[]` ensures safe handling of empty arrays and object lists.',
      },
      {
        question: 'Which method stops iterating immediately once a single element fails the test?',
        options: ['map()', 'every()', 'reduce()'],
        correctIndex: 1,
        explanation: '`every()` short-circuits and returns `false` on the very first element that fails.',
      },
    ],
  },
];
