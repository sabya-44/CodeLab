import type { JsTopic } from '../types/topic';

const BASE_CSS = `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 18px; color: #0f172a; }
.box { max-width: 440px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; }
h1 { font-size: 16px; margin: 0 0 10px; }
p, li { font-size: 13px; line-height: 1.5; }
input, select { width: 100%; padding: 7px 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
button { padding: 7px 12px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; margin-right: 6px; margin-bottom: 6px; }
.out { background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-top: 10px; white-space: pre-wrap; }`;

export const TOPICS_PART_4: JsTopic[] = [
  {
    id: 't28-try-catch-finally',
    number: 30,
    categoryId: 'cat-7-async-js',
    categoryTitle: '7. Error Handling & Asynchronous JavaScript',
    tier: 'Advanced',
    title: 'Exception Handling (try, catch, finally) & Custom Errors',
    webDevUseCase: 'Graceful Recovery from Bad JSON, Network Failures & Cleanup Locks',
    summary:
      'Prevent silent crashes and broken UI states using `try / catch / finally`, `throw new Error()`, custom `Error` subclasses, and cleanup guarantees.',
    revisionTldr:
      '`try` runs risky code; `catch (err)` handles synchronous or `await`ed errors; `finally` ALWAYS executes (even after `return`!) to release loading spinners or locks. Note: `try/catch` only catches async errors if `await`ed.',
    explanation: [
      'When an unexpected failure occurs—malformed JSON from storage, an unreachable API, or invalid input—uncaught exceptions crash execution and leave loading spinners stuck forever.',
      'Wrapping risky code in `try { ... } catch (err) { ... }` captures the thrown error object (`err.name`, `err.message`), letting you display friendly UI feedback instead of a blank screen. Adding a `finally { ... }` block guarantees cleanup code (like `isLoading = false`) runs whether `try` succeeded, failed, or returned early.',
      'Important limitation: `try / catch` only catches synchronous exceptions or rejected Promises inside an `async` function when `await` is used. It will NOT catch errors inside a non-awaited `.then()` or `setTimeout` callback.',
    ],
    keyRules: [
      'Always `throw new Error("descriptive message")` rather than throwing plain strings, so stack traces (`err.stack`) are preserved.',
      'Extend `class ValidationError extends Error` when callers need to distinguish user-input errors from network crashes via `instanceof`.',
      'Never swallow errors inside an empty `catch (err) {}` block—at minimum log or surface feedback.',
    ],
    codeExample: `class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function parseDiscount(jsonStr) {
  let completed = false;
  try {
    const data = JSON.parse(jsonStr);
    if (typeof data.pct !== 'number' || data.pct > 90) {
      throw new ValidationError('Discount must be a number <= 90');
    }
    completed = true;
    return data.pct;
  } catch (err) {
    console.warn(err.name + ':', err.message);
    return 0;
  } finally {
    console.log('Cleanup ran. Success?', completed);
  }
}

console.log('Valid:', parseDiscount('{"pct": 25}'));
console.log('Invalid:', parseDiscount('{bad json'));`,
    commonMistake: {
      label: 'Forgetting that synchronous try/catch does NOT catch setTimeout callbacks',
      avoid: `try {
  setTimeout(() => { throw new Error('Async boom'); }, 50);
} catch (err) {
  // NEVER runs! setTimeout executes on a future tick
}`,
      prefer: `setTimeout(() => {
  try {
    throw new Error('Handled inside callback');
  } catch (err) {
    console.error(err.message);
  }
}, 50);`,
    },
    practice: {
      logical: {
        title: 'try / catch / finally Return Override & setTimeout Trap',
        scenario: 'Exam Question · Why finally Runs After Return & Async try/catch Limits',
        taskPrompt:
          'Predict and fix two classic exam puzzles: (1) `testOrder()` returns `"try"` BEFORE `finally` mutates `cleanupRan = true`—verify both! (2) `riskyAsync()` puts `try/catch` OUTSIDE `setTimeout`, so an error inside the timer crashes uncaught! Move `try/catch` INSIDE the `setTimeout` callback.',
        starterHtml: `<div class="box">
  <h1>Exception Handling Exam Traps</h1>
  <button id="btn-run" type="button">Run Exam Checks</button>
  <div id="out" class="out">Click to run exception traps</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `let cleanupRan = false;

function testFinallyOrder() {
  try {
    return 'returned-from-try';
  } finally {
    cleanupRan = true; // Still runs BEFORE caller receives return value!
  }
}

document.getElementById('btn-run').addEventListener('click', () => {
  const out = document.getElementById('out');
  const val = testFinallyOrder();

  // BUG: Synchronous try/catch CANNOT catch errors thrown later inside setTimeout!
  try {
    setTimeout(() => {
      // TODO: Wrap this risky operation inside its OWN try/catch inside setTimeout!
      const bad = JSON.parse('{broken}');
      out.textContent += '\\nParsed: ' + bad;
    }, 50);
  } catch (err) {
    out.textContent = 'Caught timer error: ' + err.message;
  }

  out.textContent = 'testFinallyOrder() -> ' + val + ' | cleanupRan -> ' + cleanupRan;
});`,
        solutionJs: `let cleanupRan = false;

function testFinallyOrder() {
  try {
    return 'returned-from-try';
  } finally {
    cleanupRan = true;
  }
}

document.getElementById('btn-run').addEventListener('click', () => {
  const out = document.getElementById('out');
  const val = testFinallyOrder();
  out.textContent = 'testFinallyOrder() -> ' + val + ' | cleanupRan -> ' + cleanupRan;

  setTimeout(() => {
    try {
      JSON.parse('{broken}');
    } catch (err) {
      out.textContent += '\\nTimer caught cleanly inside callback: ' + err.message;
    }
  }, 50);
});`,
      },
      realLife: {
        title: 'Promo JSON Config Importer with Loading-Lock Cleanup',
        scenario: 'Daily Life · Recovering from Corrupted JSON & Invalid Coupon Rules',
        taskPrompt:
          'Users paste JSON promo settings into an admin tool. Catch malformed JSON (`SyntaxError`), throw a custom `PromoRangeError` if `discount > 90`, and ensure `finally` ALWAYS unlocks `status = "idle"`.',
        starterHtml: `<div class="box">
  <h1>Admin Promo Code Importer</h1>
  <input id="json-in" type="text" value='{"code":"SAVE150","discount":120}' />
  <button id="btn-parse" type="button">Import Promo</button>
  <div id="out" class="out">Try broken JSON, discount > 90, or valid discount <= 90</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `class PromoRangeError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'PromoRangeError';
  }
}

document.getElementById('btn-parse').addEventListener('click', () => {
  const out = document.getElementById('out');
  let lock = 'busy';
  try {
    const data = JSON.parse(document.getElementById('json-in').value);
    if (typeof data.discount !== 'number' || data.discount < 1 || data.discount > 90) {
      throw new PromoRangeError('Discount must be between 1% and 90%');
    }
    out.textContent = 'Imported Promo: ' + data.code + ' (' + data.discount + '% OFF)';
  } catch (err) {
    out.textContent = err instanceof PromoRangeError
      ? 'Rule Error: ' + err.message
      : 'Bad JSON Syntax: ' + err.message;
  } finally {
    lock = 'unlocked';
    console.log('UI Lock released ->', lock);
  }
});`,
        solutionJs: `class PromoRangeError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'PromoRangeError';
  }
}

document.getElementById('btn-parse').addEventListener('click', () => {
  const out = document.getElementById('out');
  let lock = 'busy';
  try {
    const data = JSON.parse(document.getElementById('json-in').value);
    if (typeof data.discount !== 'number' || data.discount < 1 || data.discount > 90) {
      throw new PromoRangeError('Discount must be between 1% and 90%');
    }
    out.textContent = 'Imported Promo: ' + data.code + ' (' + data.discount + '% OFF)';
  } catch (err) {
    out.textContent = err instanceof PromoRangeError
      ? 'Rule Error: ' + err.message
      : 'Bad JSON Syntax: ' + err.message;
  } finally {
    lock = 'unlocked';
    console.log('UI Lock released ->', lock);
  }
});`,
      },
    },
    quiz: [
      {
        question: 'If a `try` block executes `return "ok"` and there is also a `finally` block, does `finally` still run?',
        options: [
          'No, `return` exits the function immediately before `finally`',
          'Yes, `finally` ALWAYS executes before the function finishes returning',
          'Only if an error was thrown',
        ],
        correctIndex: 1,
        explanation:
          'JavaScript guarantees `finally` executes after `try` (or `catch`) even when a `return` statement is inside `try`.',
      },
      {
        question: 'Why create a custom class like `class ApiError extends Error`?',
        options: [
          'So callers can branch handling with `err instanceof ApiError`',
          'Because built-in `Error` has no `.message` property',
          'To skip the `catch` block automatically',
        ],
        correctIndex: 0,
        explanation: 'Custom `Error` subclasses let `catch` handlers inspect `instanceof` to treat domain errors differently from unexpected bugs.',
      },
    ],
  },
  {
    id: 't29-event-loop',
    number: 31,
    categoryId: 'cat-7-async-js',
    categoryTitle: '7. Error Handling & Asynchronous JavaScript',
    tier: 'Advanced',
    title: 'The Event Loop: Call Stack, Microtasks & Macrotasks',
    webDevUseCase: 'Predicting Execution Order & Keeping Browser UI Animations Smooth',
    summary:
      'Understand how single-threaded JavaScript coordinates synchronous code on the Call Stack, drains Promise callbacks in the Microtask Queue first, and runs `setTimeout` macrotasks afterward.',
    revisionTldr:
      'Execution priority: (1) Synchronous Call Stack -> (2) ALL queued Microtasks (`Promise.then`, `queueMicrotask`) -> (3) Browser Paint / One Macrotask (`setTimeout`, DOM click).',
    explanation: [
      'JavaScript runs on a single main thread with ONE Call Stack. While synchronous code is running, the browser cannot repaint or respond to clicks—which is why heavy blocking loops freeze the tab.',
      'Asynchronous APIs (`setTimeout`, `fetch`, DOM events) are handled by the browser environment outside the Call Stack. Once finished, their callbacks wait in queues until the Call Stack is completely empty.',
      'There are two key queues: the **Microtask Queue** (Promises `.then()`, `async/await` continuations, `queueMicrotask`) and the **Task / Macrotask Queue** (`setTimeout`, `setInterval`, UI events). After EVERY synchronous turn, the Event Loop drains the ENTIRE Microtask Queue before picking even a single `setTimeout(..., 0)` macrotask!',
    ],
    keyRules: [
      'Synchronous code always finishes before ANY `.then()` or `setTimeout(..., 0)` runs.',
      '`Promise.resolve().then(...)` ALWAYS runs before `setTimeout(..., 0)` because Microtasks have higher priority than Macrotasks.',
      'Never create an infinite recursive microtask loop (`function loop() { Promise.resolve().then(loop); }`)—it starves rendering and freezes the browser.',
    ],
    codeExample: `console.log('1: Sync start');

setTimeout(() => console.log('4: Macrotask (setTimeout 0)'), 0);

Promise.resolve().then(() => {
  console.log('3: Microtask (Promise.then)');
});

console.log('2: Sync end');
// Guaranteed order: 1 -> 2 -> 3 -> 4`,
    commonMistake: {
      label: 'Assuming setTimeout(fn, 0) executes immediately or before Promises',
      avoid: `let ready = false;
Promise.resolve().then(() => { ready = true; });
console.log(ready); // FALSE! Synchronous log runs before microtask!`,
      prefer: `Promise.resolve()
  .then(() => true)
  .then((ready) => console.log('Ready inside microtask:', ready));`,
    },
    practice: {
      logical: {
        title: 'Predict Event Loop Print Order (Sync vs Microtask vs Macrotask)',
        scenario: 'Exam Question · Classic Output Prediction Challenge',
        taskPrompt:
          'Before clicking Run, update `predictedOrder` to match the true Event Loop execution order (`["A", "D", "C", "B"]`) where Sync runs first, Microtasks drain second, and `setTimeout(..., 0)` runs last!',
        starterHtml: `<div class="box">
  <h1>Event Loop Output Predictor</h1>
  <button id="btn-trace" type="button">Verify Prediction</button>
  <div id="out" class="out">Edit predictedOrder in script.js, then click Verify!</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `// TODO: Fix predictedOrder to match the real JS Event Loop order!
const predictedOrder = ['A', 'B', 'C', 'D'];

document.getElementById('btn-trace').addEventListener('click', () => {
  const actual = [];
  actual.push('A');
  setTimeout(() => {
    actual.push('B');
    const matched = JSON.stringify(actual) === JSON.stringify(predictedOrder);
    document.getElementById('out').textContent =
      'Actual Order: ' + actual.join(' -> ') +
      '\\nYour Prediction: ' + predictedOrder.join(' -> ') +
      '\\nResult: ' + (matched ? 'PASS!' : 'Try reordering Microtask vs Macrotask!');
  }, 0);
  Promise.resolve().then(() => actual.push('C'));
  actual.push('D');
});`,
        solutionJs: `const predictedOrder = ['A', 'D', 'C', 'B'];

document.getElementById('btn-trace').addEventListener('click', () => {
  const actual = [];
  actual.push('A');
  setTimeout(() => {
    actual.push('B');
    const matched = JSON.stringify(actual) === JSON.stringify(predictedOrder);
    document.getElementById('out').textContent =
      'Actual Order: ' + actual.join(' -> ') +
      '\\nYour Prediction: ' + predictedOrder.join(' -> ') +
      '\\nResult: ' + (matched ? 'PASS!' : 'Mismatch');
  }, 0);
  Promise.resolve().then(() => actual.push('C'));
  actual.push('D');
});`,
      },
      realLife: {
        title: 'Priority UI Update Before Background Analytics Ping',
        scenario: 'Daily Life · Keeping Button Feedback Instant While Deferring Heavy Logging',
        taskPrompt:
          'When a user clicks "Save Note", schedule the UI text confirmation synchronously, queue state synchronization in a Microtask (`queueMicrotask`), and defer non-critical analytics reporting to a Macrotask (`setTimeout(..., 0)`) so the UI never feels sluggish.',
        starterHtml: `<div class="box">
  <h1>Responsive UI + Deferred Analytics</h1>
  <button id="btn-save" type="button">Save Note</button>
  <div id="out" class="out">Click Save Note to inspect task scheduling</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `document.getElementById('btn-save').addEventListener('click', () => {
  const steps = [];
  const logStep = (s) => {
    steps.push(s);
    document.getElementById('out').textContent = steps.join('\\n');
  };

  logStep('1. [Sync] Show "Saved!" badge immediately');
  setTimeout(() => logStep('3. [Macrotask] Send analytics ping after paint'), 0);
  queueMicrotask(() => logStep('2. [Microtask] Sync local cache before next frame'));
});`,
        solutionJs: `document.getElementById('btn-save').addEventListener('click', () => {
  const steps = [];
  const logStep = (s) => {
    steps.push(s);
    document.getElementById('out').textContent = steps.join('\\n');
  };

  logStep('1. [Sync] Show "Saved!" badge immediately');
  setTimeout(() => logStep('3. [Macrotask] Send analytics ping after paint'), 0);
  queueMicrotask(() => logStep('2. [Microtask] Sync local cache before next frame'));
});`,
      },
    },
    quiz: [
      {
        question: 'In what order do `console.log("A")`, `setTimeout(() => log("B"), 0)`, and `Promise.resolve().then(() => log("C"))` print?',
        options: ['A -> B -> C', 'A -> C -> B', 'C -> A -> B'],
        correctIndex: 1,
        explanation:
          'Synchronous `"A"` executes first on the Call Stack, then the Microtask `"C"` drains before the `setTimeout` Macrotask `"B"`.',
      },
      {
        question: 'Why does a `while (true)` loop freeze button clicks and CSS animations on a webpage?',
        options: [
          'Because CSS runs inside Node.js',
          'Because JavaScript’s Call Stack never empties, preventing the Event Loop from processing tasks or repaints',
          'Because `while` loops bypass `const`',
        ],
        correctIndex: 1,
        explanation: 'The main thread handles both JS execution and browser rendering; an infinite synchronous loop blocks the Event Loop completely.',
      },
    ],
  },
  {
    id: 't30-promises-chaining',
    number: 32,
    categoryId: 'cat-7-async-js',
    categoryTitle: '7. Error Handling & Asynchronous JavaScript',
    tier: 'Advanced',
    title: 'Promise Concept & Method Chaining (.then, .catch, .finally)',
    webDevUseCase: 'Sequential Async Steps Without Nested Callback Hell',
    summary:
      'Model future async values with `new Promise`, understand the three states (`pending`, `fulfilled`, `rejected`), and return values/promises inside `.then()` chains so `.catch()` handles any failure.',
    revisionTldr:
      'Every `.then()` returns a NEW Promise! Always `return` the next value or Promise inside `.then()` so the chain stays flat and waits properly; attach `.catch()` once at the end and `.finally()` for cleanup.',
    explanation: [
      'A `Promise` represents the eventual result of an asynchronous operation. It begins in `pending` state and settles once (never changes again) into either `fulfilled` (resolved with a value) or `rejected` (failed with an Error).',
      'Unlike nested callbacks ("Callback Hell"), every `.then()` returns a brand-new Promise, enabling flat linear chains: `step1().then(step2).then(step3).catch(handleErr).finally(cleanup)`.',
      'If you forget `return` inside a `.then()` callback, the next `.then()` immediately receives `undefined` instead of waiting for the nested async operation!',
    ],
    keyRules: [
      'ALWAYS `return` the transformed value or inner Promise from every `.then()` callback.',
      'A single `.catch()` at the end of a chain catches rejections from ANY earlier `.then()` step.',
      'If a `.catch()` returns a normal fallback value (instead of re-throwing), the chain recovers and continues into subsequent `.then()` steps.',
    ],
    codeExample: `function delayStep(label, ms, shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error(label + ' failed'));
      else resolve(label + ' ok');
    }, ms);
  });
}

delayStep('1. Auth', 150)
  .then((res) => {
    console.log(res);
    return delayStep('2. Profile', 150); // Must return!
  })
  .then((res) => console.log(res))
  .catch((err) => console.error('Caught:', err.message))
  .finally(() => console.log('Pipeline finished'));`,
    commonMistake: {
      label: 'Forgetting `return` inside `.then()` (breaking the chain)',
      avoid: `fetchUser()
  .then((user) => {
    fetchOrders(user.id); // Missing return! Next .then gets undefined
  })
  .then((orders) => console.log(orders)); // undefined!`,
      prefer: `fetchUser()
  .then((user) => fetchOrders(user.id)) // Returned cleanly!
  .then((orders) => console.log(orders));`,
    },
    practice: {
      logical: {
        title: 'Fix Broken Promise Chain (Missing return in .then)',
        scenario: 'Exam Question · Why Chained .then() Receives undefined',
        taskPrompt:
          'This Promise chain outputs `Step 2 got: undefined` because the first `.then()` forgot `return` before `stepTwo(val)`! Add the missing `return` and attach a `.catch()` so rejections are handled gracefully.',
        starterHtml: `<div class="box">
  <h1>Promise Chain Missing Return Fix</h1>
  <button id="btn-run" type="button">Run Promise Chain</button>
  <div id="out" class="out">Click to test chain</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const stepOne = () => Promise.resolve(10);
const stepTwo = (n) => new Promise((res) => setTimeout(() => res(n * 5), 100));

document.getElementById('btn-run').addEventListener('click', () => {
  stepOne()
    .then((val) => {
      // BUG: Missing 'return' breaks chaining—stepTwo resolves later while next .then receives undefined!
      stepTwo(val);
    })
    .then((result) => {
      document.getElementById('out').textContent =
        'Final Result (expected 50): ' + result;
    });
});`,
        solutionJs: `const stepOne = () => Promise.resolve(10);
const stepTwo = (n) => new Promise((res) => setTimeout(() => res(n * 5), 100));

document.getElementById('btn-run').addEventListener('click', () => {
  stepOne()
    .then((val) => {
      return stepTwo(val);
    })
    .then((result) => {
      document.getElementById('out').textContent = 'Final Result: ' + result;
    })
    .catch((err) => {
      document.getElementById('out').textContent = 'Error: ' + err.message;
    });
});`,
      },
      realLife: {
        title: '3-Step UPI Checkout Pipeline (.then / .catch / .finally)',
        scenario: 'Daily Life · Sequential Payment Steps with Failure Recovery & Button Unlock',
        taskPrompt:
          'Run a 3-step checkout pipeline (Validate Cart -> Charge UPI -> Issue Receipt). Toggle "Simulate UPI Decline" to verify `.catch()` intercepts the error cleanly and `.finally()` always re-enables the button.',
        starterHtml: `<div class="box">
  <h1>UPI Checkout Promise Pipeline</h1>
  <label><input id="fail-chk" type="checkbox" style="width:auto;" /> Simulate UPI Decline</label><br/>
  <button id="btn-pay" type="button">Pay ₹499 via UPI</button>
  <div id="out" class="out">Click to start checkout</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function waitStep(msg, ms, fail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(new Error(msg + ' declined')) : resolve(msg)), ms);
  });
}

const btn = document.getElementById('btn-pay');
const out = document.getElementById('out');

btn.addEventListener('click', () => {
  const shouldFail = document.getElementById('fail-chk').checked;
  btn.disabled = true;
  out.textContent = '1. Validating cart...';

  waitStep('Cart validated', 300)
    .then((msg) => {
      out.textContent += '\\n' + msg + ' -> Debiting UPI...';
      return waitStep('UPI Debit', 350, shouldFail);
    })
    .then((msg) => {
      out.textContent += '\\n' + msg + ' complete -> Generating receipt...';
      return waitStep('Receipt #UPI-8821 Issued', 250);
    })
    .then((finalMsg) => {
      out.textContent += '\\nSUCCESS: ' + finalMsg;
    })
    .catch((err) => {
      out.textContent += '\\nCAUGHT ERROR: ' + err.message;
    })
    .finally(() => {
      btn.disabled = false;
      out.textContent += '\\n[finally] Pay button unlocked.';
    });
});`,
        solutionJs: `function waitStep(msg, ms, fail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => (fail ? reject(new Error(msg + ' declined')) : resolve(msg)), ms);
  });
}

const btn = document.getElementById('btn-pay');
const out = document.getElementById('out');

btn.addEventListener('click', () => {
  const shouldFail = document.getElementById('fail-chk').checked;
  btn.disabled = true;
  out.textContent = '1. Validating cart...';

  waitStep('Cart validated', 300)
    .then((msg) => {
      out.textContent += '\\n' + msg + ' -> Debiting UPI...';
      return waitStep('UPI Debit', 350, shouldFail);
    })
    .then((msg) => {
      out.textContent += '\\n' + msg + ' complete -> Generating receipt...';
      return waitStep('Receipt #UPI-8821 Issued', 250);
    })
    .then((finalMsg) => {
      out.textContent += '\\nSUCCESS: ' + finalMsg;
    })
    .catch((err) => {
      out.textContent += '\\nCAUGHT ERROR: ' + err.message;
    })
    .finally(() => {
      btn.disabled = false;
      out.textContent += '\\n[finally] Pay button unlocked.';
    });
});`,
      },
    },
    quiz: [
      {
        question: 'What happens if you omit `return` before a nested Promise call inside `.then()`?',
        options: [
          'JavaScript automatically awaits it anyway',
          'The next `.then()` receives `undefined` immediately without waiting',
          'It throws a SyntaxError',
        ],
        correctIndex: 1,
        explanation:
          'Without `return`, the `.then()` callback resolves immediately with `undefined`, breaking async sequencing.',
      },
      {
        question: 'Once a Promise transitions from `pending` to `fulfilled`, can it later change to `rejected`?',
        options: [
          'Yes, if `.catch()` runs afterward',
          'No, a settled Promise is immutable and never changes state again',
          'Yes, after 5 seconds',
        ],
        correctIndex: 1,
        explanation: 'A Promise settles at most once; subsequent `resolve()` or `reject()` calls are ignored.',
      },
    ],
  },
  {
    id: 't31-async-await-fetch',
    number: 33,
    categoryId: 'cat-7-async-js',
    categoryTitle: '7. Error Handling & Asynchronous JavaScript',
    tier: 'Advanced',
    title: 'async / await, Fetch Web API & HTTP res.ok Guarding',
    webDevUseCase: 'Fetching REST APIs Cleanly & Handling 404/500 Responses Properly',
    summary:
      'Write asynchronous workflows in readable top-to-bottom syntax using `async / await`, wrap `await` inside `try / catch`, and remember that `fetch()` does NOT reject on HTTP 404 or 500 errors.',
    revisionTldr:
      'An `async` function ALWAYS returns a Promise. `await` pauses that function until the Promise settles. CRITICAL: `fetch()` only rejects on network drop—you MUST check `if (!res.ok) throw new Error(res.status)`!',
    explanation: [
      '`async / await` is clean syntactic sugar over Promises. Placing `async` before a function ensures it always returns a Promise, and `await promise` pauses execution inside that function until the Promise resolves or throws into `try / catch`.',
      'When calling backend APIs with `fetch(url)`, beginners hit a huge trap: if the server replies with `404 Not Found` or `500 Server Error`, `fetch()` considers that a valid HTTP reply and **resolves normally**! Only complete network failure triggers a rejection.',
      'Therefore, every production `fetch()` helper checks `if (!res.ok) throw new Error("HTTP " + res.status)` before calling `await res.json()`.',
    ],
    keyRules: [
      'Always check `if (!res.ok)` before parsing `await res.json()`, otherwise error HTML pages crash `res.json()`.',
      'Always wrap `await` statements inside `try { ... } catch (err) { ... } finally { ... }`.',
      'Pass `{ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }` when sending JSON to APIs.',
    ],
    codeExample: `async function loadUserProfile(userId) {
  try {
    const res = await fetch('/api/users/' + encodeURIComponent(userId));
    if (!res.ok) {
      throw new Error('Request failed with HTTP ' + res.status);
    }
    const user = await res.json();
    return user;
  } catch (err) {
    console.error('Fetch failed:', err.message);
    return null;
  }
}`,
    commonMistake: {
      label: 'Calling await res.json() without checking res.ok first',
      avoid: `const res = await fetch('/api/missing');
const data = await res.json(); // 404 HTML page throws SyntaxError instead of clear HTTP 404!`,
      prefer: `const res = await fetch('/api/missing');
if (!res.ok) throw new Error('HTTP error ' + res.status);
const data = await res.json();`,
    },
    practice: {
      logical: {
        title: 'Fix Missing res.ok Guard & async Return Value Trap',
        scenario: 'Exam Question · Why fetch() Resolves on HTTP 404 Without Throwing',
        taskPrompt:
          'When `mockFetch("/api/missing")` returns `{ ok: false, status: 404 }`, `loadData` currently ignores `res.ok` and prints error payloads as valid data! Add `if (!res.ok) throw new Error("HTTP " + res.status);` inside `try / catch`.',
        starterHtml: `<div class="box">
  <h1>Fetch 404 res.ok Guard Exam Fix</h1>
  <button id="btn-404" type="button">Request Missing Endpoint (404)</button>
  <div id="out" class="out">Click to test 404 handling</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function mockFetch(url) {
  return Promise.resolve({
    ok: false,
    status: 404,
    async json() { return { detail: 'Route not found' }; },
  });
}

document.getElementById('btn-404').addEventListener('click', async () => {
  const out = document.getElementById('out');
  try {
    const res = await mockFetch('/api/missing');
    // BUG: Forgot to check if (!res.ok) throw new Error('HTTP ' + res.status)!
    const data = await res.json();
    out.textContent = 'BUGGY SUCCESS (should have thrown!): ' + JSON.stringify(data);
  } catch (err) {
    out.textContent = 'CLEANLY CAUGHT ERROR: ' + err.message;
  }
});`,
        solutionJs: `function mockFetch(url) {
  return Promise.resolve({
    ok: false,
    status: 404,
    async json() { return { detail: 'Route not found' }; },
  });
}

document.getElementById('btn-404').addEventListener('click', async () => {
  const out = document.getElementById('out');
  try {
    const res = await mockFetch('/api/missing');
    if (!res.ok) {
      throw new Error('HTTP ' + res.status + ' Not Found');
    }
    const data = await res.json();
    out.textContent = JSON.stringify(data);
  } catch (err) {
    out.textContent = 'CLEANLY CAUGHT ERROR: ' + err.message;
  }
});`,
      },
      realLife: {
        title: 'Live City Weather API Loader with Loading & Error States',
        scenario: 'Daily Life · Fetching Remote JSON Cleanly with async / await + finally',
        taskPrompt:
          'Fetch weather data for `"Pune"` (200 OK) or `"Atlantis"` (404 Error) using `async / await`, guarding `!res.ok`, showing `"Loading..."`, and cleaning up loading state in `finally`.',
        starterHtml: `<div class="box">
  <h1>City Weather API Loader</h1>
  <button id="btn-pune" type="button">Load Pune Weather (200)</button>
  <button id="btn-bad" type="button">Load Unknown City (404)</button>
  <div id="out" class="out">Pick a city to fetch weather</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function mockWeatherApi(city) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (city === 'Pune') {
        resolve({ ok: true, status: 200, async json() { return { city: 'Pune', tempC: 29, sky: 'Clear' }; } });
      } else {
        resolve({ ok: false, status: 404, async json() { return { error: 'City not found' }; } });
      }
    }, 300);
  });
}

async function fetchWeather(city) {
  const out = document.getElementById('out');
  out.textContent = 'Loading weather for ' + city + '...';
  try {
    const res = await mockWeatherApi(city);
    if (!res.ok) throw new Error('City lookup failed (HTTP ' + res.status + ')');
    const data = await res.json();
    out.textContent = data.city + ': ' + data.tempC + '°C (' + data.sky + ')';
  } catch (err) {
    out.textContent = 'Alert: ' + err.message;
  }
}

document.getElementById('btn-pune').addEventListener('click', () => fetchWeather('Pune'));
document.getElementById('btn-bad').addEventListener('click', () => fetchWeather('Atlantis'));`,
        solutionJs: `function mockWeatherApi(city) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (city === 'Pune') {
        resolve({ ok: true, status: 200, async json() { return { city: 'Pune', tempC: 29, sky: 'Clear' }; } });
      } else {
        resolve({ ok: false, status: 404, async json() { return { error: 'City not found' }; } });
      }
    }, 300);
  });
}

async function fetchWeather(city) {
  const out = document.getElementById('out');
  out.textContent = 'Loading weather for ' + city + '...';
  try {
    const res = await mockWeatherApi(city);
    if (!res.ok) throw new Error('City lookup failed (HTTP ' + res.status + ')');
    const data = await res.json();
    out.textContent = data.city + ': ' + data.tempC + '°C (' + data.sky + ')';
  } catch (err) {
    out.textContent = 'Alert: ' + err.message;
  }
}

document.getElementById('btn-pune').addEventListener('click', () => fetchWeather('Pune'));
document.getElementById('btn-bad').addEventListener('click', () => fetchWeather('Atlantis'));`,
      },
    },
    quiz: [
      {
        question: 'Does `await fetch("/not-found")` throw an error automatically when the server responds with HTTP 404?',
        options: [
          'Yes, any status >= 400 automatically rejects `fetch()`',
          'No! `fetch()` only rejects on network failure; you must check `if (!res.ok)` manually',
          'Only in `POST` requests',
        ],
        correctIndex: 1,
        explanation:
          'Unlike Axios, browser `fetch()` resolves on 404/500 responses with `res.ok === false`. Always check `if (!res.ok) throw new Error(...)`.',
      },
      {
        question: 'What does an `async` function return if you write `async function getTwo() { return 2; }`?',
        options: ['The raw number `2`', 'A resolved `Promise` wrapping `2`', '`undefined`'],
        correctIndex: 1,
        explanation: 'Every `async` function automatically wraps its return value inside a Promise.',
      },
    ],
  },
  {
    id: 't32-async-concurrency',
    number: 34,
    categoryId: 'cat-7-async-js',
    categoryTitle: '7. Error Handling & Asynchronous JavaScript',
    tier: 'Advanced',
    title: 'Async Concurrency (Promise.all, allSettled, race) & AbortController',
    webDevUseCase: 'Loading Multiple Endpoints in Parallel & Cancelling Stale Requests',
    summary:
      'Eliminate slow async waterfalls by running independent requests in parallel with `Promise.all` / `Promise.allSettled`, understand why `Array.forEach` ignores `await`, and cancel stale requests with `AbortController`.',
    revisionTldr:
      'Never stack sequential `await`s for independent requests, and NEVER put `await` inside `.forEach()`. Use `Promise.all` (fail-fast parallel), `Promise.allSettled` (keeps partial successes), and `AbortController` for timeouts/cancellations.',
    explanation: [
      'Awaiting three independent 500ms API calls one after another takes 1,500ms ("async waterfall"). Running them concurrently with `await Promise.all([fetchA(), fetchB(), fetchC()])` completes in 500ms.',
      'Choose the right combinator: `Promise.all` rejects immediately if ANY promise fails (fail-fast); `Promise.allSettled` waits for ALL promises and gives `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`; `Promise.race` settles with whichever finishes first (great for timeouts).',
      'Watch out for loops: `items.forEach(async (item) => await save(item))` fires all callbacks and exits immediately without awaiting them! Use `await Promise.all(items.map(save))` for parallel work or `for (const item of items) await save(item)` for sequential work.',
    ],
    keyRules: [
      'Use `Promise.allSettled()` on dashboards where one failing widget should not wipe out the rest of the page.',
      'Never pass an `async` callback to `Array.prototype.forEach()` expecting the outer function to wait.',
      'Pass `signal: controller.signal` to `fetch(url, { signal })` to cancel stale searches when the user types something new.',
    ],
    codeExample: `// Parallel dashboard fetch where partial failure is acceptable:
const results = await Promise.allSettled([
  Promise.resolve({ users: 120 }),
  Promise.reject(new Error('Analytics offline')),
  Promise.resolve({ revenue: 45000 }),
]);

results.forEach((res, idx) => {
  if (res.status === 'fulfilled') console.log('Widget', idx, res.value);
  else console.warn('Widget', idx, 'failed:', res.reason.message);
});

// Cancelling a slow task with AbortController:
const controller = new AbortController();
setTimeout(() => controller.abort(), 1000);`,
    commonMistake: {
      label: 'Putting await inside Array.prototype.forEach()',
      avoid: `async function saveAll(ids) {
  ids.forEach(async (id) => {
    await saveItem(id); // Outer function returns BEFORE saves finish!
  });
  console.log('All saved!'); // LIE! Runs immediately
}`,
      prefer: `async function saveAll(ids) {
  await Promise.all(ids.map((id) => saveItem(id)));
  console.log('Actually all saved!');
}`,
    },
    practice: {
      logical: {
        title: 'Fix Broken forEach(async) Bug with Promise.all(map)',
        scenario: 'Exam Question · Why Array.forEach Ignores await',
        taskPrompt:
          '`saveAllIds()` uses `ids.forEach(async (id) => ...)` so `saved` is `[]` (empty!) when logged immediately after! Replace `.forEach` with `await Promise.all(ids.map(async (id) => ...))`.',
        starterHtml: `<div class="box">
  <h1>forEach(async) Bug vs Promise.all</h1>
  <button id="btn-save" type="button">Save All Records</button>
  <div id="out" class="out">Click to test async saving</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const saveRecord = (id) =>
  new Promise((res) => setTimeout(() => res('Saved #' + id), 80));

document.getElementById('btn-save').addEventListener('click', async () => {
  const ids = [101, 102, 103];
  const saved = [];

  // BUG: forEach does NOT await async callbacks! Replace with await Promise.all(ids.map(...))
  ids.forEach(async (id) => {
    const msg = await saveRecord(id);
    saved.push(msg);
  });

  document.getElementById('out').textContent =
    'Done! Saved count (expected 3): ' + saved.length + '\\n' + JSON.stringify(saved);
});`,
        solutionJs: `const saveRecord = (id) =>
  new Promise((res) => setTimeout(() => res('Saved #' + id), 80));

document.getElementById('btn-save').addEventListener('click', async () => {
  const ids = [101, 102, 103];
  const saved = await Promise.all(ids.map((id) => saveRecord(id)));

  document.getElementById('out').textContent =
    'Done! Saved count: ' + saved.length + '\\n' + JSON.stringify(saved);
});`,
      },
      realLife: {
        title: 'Resilient Analytics Dashboard Loader (Promise.allSettled)',
        scenario: 'Daily Life · Keeping Healthy Dashboard Widgets Visible When One API Fails',
        taskPrompt:
          'Compare `Promise.all` (one offline microservice breaks the entire screen) vs `Promise.allSettled` (Profile & Alerts still render even if Feed fails).',
        starterHtml: `<div class="box">
  <h1>Dashboard Multi-Widget Loader</h1>
  <button id="btn-all" type="button">Load via Promise.all</button>
  <button id="btn-settled" type="button">Load via Promise.allSettled</button>
  <div id="out" class="out">Compare fail-fast vs resilient loading</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const loadWidget = (name, ms, fail = false) =>
  new Promise((res, rej) =>
    setTimeout(() => (fail ? rej(new Error(name + ' offline')) : res(name + ' loaded')), ms)
  );

const out = document.getElementById('out');

document.getElementById('btn-all').addEventListener('click', async () => {
  out.textContent = 'Loading widgets with Promise.all...';
  try {
    const res = await Promise.all([loadWidget('Profile', 180), loadWidget('Feed', 250, true), loadWidget('Alerts', 120)]);
    out.textContent = JSON.stringify(res);
  } catch (err) {
    out.textContent = 'Whole Dashboard Crashed (Promise.all): ' + err.message;
  }
});

document.getElementById('btn-settled').addEventListener('click', async () => {
  out.textContent = 'Loading widgets with Promise.allSettled...';
  const results = await Promise.allSettled([loadWidget('Profile', 180), loadWidget('Feed', 250, true), loadWidget('Alerts', 120)]);
  out.textContent = results
    .map((r) => (r.status === 'fulfilled' ? '[OK] ' + r.value : '[WARN] ' + r.reason.message))
    .join('\\n');
});`,
        solutionJs: `const loadWidget = (name, ms, fail = false) =>
  new Promise((res, rej) =>
    setTimeout(() => (fail ? rej(new Error(name + ' offline')) : res(name + ' loaded')), ms)
  );

const out = document.getElementById('out');

document.getElementById('btn-all').addEventListener('click', async () => {
  try {
    const res = await Promise.all([loadWidget('Profile', 180), loadWidget('Feed', 250, true)]);
    out.textContent = JSON.stringify(res);
  } catch (err) {
    out.textContent = 'Promise.all failed fast: ' + err.message;
  }
});

document.getElementById('btn-settled').addEventListener('click', async () => {
  const results = await Promise.allSettled([loadWidget('Profile', 180), loadWidget('Feed', 250, true), loadWidget('Alerts', 120)]);
  out.textContent = results
    .map((r) => (r.status === 'fulfilled' ? '[OK] ' + r.value : '[WARN] ' + r.reason.message))
    .join('\\n');
});`,
      },
    },
    quiz: [
      {
        question: 'Which Promise combinator ensures you still receive fulfilled results even if one request rejects?',
        options: ['`Promise.all()`', '`Promise.allSettled()`', '`Promise.race()`'],
        correctIndex: 1,
        explanation:
          '`Promise.allSettled()` never short-circuits on error; it waits for every Promise and reports each item’s status.',
      },
      {
        question: 'Why does `items.forEach(async (item) => await work(item))` NOT wait before continuing to the next line?',
        options: [
          '`forEach` is not designed for Promises and ignores the returned Promise from each async callback',
          '`forEach` converts `async` functions to synchronous',
          '`forEach` runs in a Web Worker',
        ],
        correctIndex: 0,
        explanation:
          '`forEach` discards callback return values. Use `await Promise.all(items.map(work))` or `for...of`.',
      },
    ],
  },
  {
    id: 't33-es-modules',
    number: 35,
    categoryId: 'cat-8-modern-architecture',
    categoryTitle: '8. Modern Web Architecture & Browser APIs',
    tier: 'Advanced',
    title: 'ES Modules (export / import), Named vs Default & Dynamic import()',
    webDevUseCase: 'Organizing Multi-File Web Apps & Lazy-Loading Heavy Features',
    summary:
      'Split applications cleanly using ES Module `export` and `import`, understand strict-mode & singleton module caching, and code-split on demand with dynamic `import()`.',
    revisionTldr:
      'Named exports (`export const x`) use `{ x }` on import and enforce exact names; default exports (`export default Foo`) can be named anything. Modules are always strict mode, deferred by default, and evaluated only once (cached).',
    explanation: [
      'Before ES Modules (`<script type="module">`), every script dumped variables onto the global `window` object and broke if loaded in the wrong order. ES Modules isolate every file in its own scope and resolve explicit `import` dependencies before execution.',
      'Files can have unlimited **named exports** (`export function formatCurrency() {}`, imported via `import { formatCurrency } from "./money.js"`) and at most ONE **default export** (`export default class Router {}`, imported without braces).',
      'For large features like PDF generators or charting libraries, dynamic `const { renderChart } = await import("./chart.js")` downloads the module only when the user clicks the button (code splitting).',
    ],
    keyRules: [
      'Browser `<script type="module">` tags automatically run in `' + "'use strict'" + '` mode and defer execution until HTML is parsed.',
      'Because ES Modules are evaluated once and cached, exporting a shared singleton config/store shares the same instance across all importers.',
      'Prefer named exports for utility libraries so IDE autocomplete and tree-shaking work accurately.',
    ],
    codeExample: `// --- mathUtils.js ---
export const TAX_RATE = 0.18;
export function addTax(price) {
  return Number((price * (1 + TAX_RATE)).toFixed(2));
}
export default function formatInr(amount) {
  return '₹' + amount;
}

// --- main.js ---
// import formatInr, { addTax, TAX_RATE } from './mathUtils.js';
// Lazy load heavy feature on click:
// const mod = await import('./heavyChart.js');`,
    commonMistake: {
      label: 'Confusing default import syntax with named curly-brace imports',
      avoid: `// If math.js has: export function sum(a, b) {}
import sum from './math.js'; // SyntaxError: does not provide a default export!`,
      prefer: `import { sum } from './math.js'; // Matches named export`,
    },
    practice: {
      logical: {
        title: 'Module Singleton Caching & Named vs Default Import Resolution',
        scenario: 'Exam Question · ES Module Single Evaluation Guarantee',
        taskPrompt:
          'Verify how ES Modules cache exports on first evaluation: right now `loadModule()` runs the module factory twice (`evalCount === 2`), breaking singleton caching! Check `moduleCache.has(path)` before executing the factory so `evalCount` stays `1`.',
        starterHtml: `<div class="box">
  <h1>ES Module Singleton Cache Check</h1>
  <button id="btn-test" type="button">Import "./config.js" Twice</button>
  <div id="out" class="out">Click to test module caching</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const moduleCache = new Map();
let evalCount = 0;

function loadModule(path) {
  // BUG: Missing cache check causes config.js to re-run every time!
  evalCount += 1;
  const exports = { default: 'AppRouter', API_BASE: '/api/v1' };
  moduleCache.set(path, exports);
  return exports;
}

document.getElementById('btn-test').addEventListener('click', () => {
  const imp1 = loadModule('./config.js');
  const imp2 = loadModule('./config.js');
  document.getElementById('out').textContent =
    'Same cached object? ' + (imp1 === imp2) +
    '\\nTimes evaluated (expected 1): ' + evalCount;
});`,
        solutionJs: `const moduleCache = new Map();
let evalCount = 0;

function loadModule(path) {
  if (moduleCache.has(path)) {
    return moduleCache.get(path);
  }
  evalCount += 1;
  const exports = { default: 'AppRouter', API_BASE: '/api/v1' };
  moduleCache.set(path, exports);
  return exports;
}

document.getElementById('btn-test').addEventListener('click', () => {
  const imp1 = loadModule('./config.js');
  const imp2 = loadModule('./config.js');
  document.getElementById('out').textContent =
    'Same cached object? ' + (imp1 === imp2) +
    '\\nTimes evaluated: ' + evalCount;
});`,
      },
      realLife: {
        title: 'Lazy-Loading Invoice Tax Formatter via Dynamic import()',
        scenario: 'Daily Life · Code-Splitting Heavy Utilities Until User Clicks Export',
        taskPrompt:
          'Simulate dynamic `await import("./currency.js")` when the user clicks "Export GST Summary": first click loads over the network, while subsequent clicks read immediately from the module cache.',
        starterHtml: `<div class="box">
  <h1>Lazy-Loaded GST Invoice Module</h1>
  <button id="btn-lazy" type="button">Export GST Summary (Dynamic import)</button>
  <div id="out" class="out">Click to load formatter module on demand</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const moduleCache = new Map();

async function dynamicImport(specifier) {
  if (moduleCache.has(specifier)) {
    return { cached: true, exports: moduleCache.get(specifier) };
  }
  await new Promise((r) => setTimeout(r, 250));
  const exports = {
    default: (n) => '₹' + Number(n).toLocaleString('en-IN'),
    withGst: (n) => Math.round(n * 1.18),
  };
  moduleCache.set(specifier, exports);
  return { cached: false, exports };
}

document.getElementById('btn-lazy').addEventListener('click', async () => {
  const { cached, exports: mod } = await dynamicImport('./currency.js');
  const formatInr = mod.default;
  const total = formatInr(mod.withGst(2000));
  document.getElementById('out').textContent =
    'Source: ' + (cached ? 'Cached Module' : 'Network Chunk Loaded') + '\\nInvoice Total: ' + total;
});`,
        solutionJs: `const moduleCache = new Map();

async function dynamicImport(specifier) {
  if (moduleCache.has(specifier)) {
    return { cached: true, exports: moduleCache.get(specifier) };
  }
  await new Promise((r) => setTimeout(r, 250));
  const exports = {
    default: (n) => '₹' + Number(n).toLocaleString('en-IN'),
    withGst: (n) => Math.round(n * 1.18),
  };
  moduleCache.set(specifier, exports);
  return { cached: false, exports };
}

document.getElementById('btn-lazy').addEventListener('click', async () => {
  const { cached, exports: mod } = await dynamicImport('./currency.js');
  const formatInr = mod.default;
  const total = formatInr(mod.withGst(2000));
  document.getElementById('out').textContent =
    'Source: ' + (cached ? 'Cached Module' : 'Network Chunk Loaded') + '\\nInvoice Total: ' + total;
});`,
      },
    },
    quiz: [
      {
        question: 'If a module runs `export const API_URL = "/v1"`, how must another file import it?',
        options: [
          '`import API_URL from "./config.js"`',
          '`import { API_URL } from "./config.js"`',
          '`require("./config.js").API_URL` only',
        ],
        correctIndex: 1,
        explanation: 'Named exports must be destructured with curly braces `{ API_URL }` on import.',
      },
      {
        question: 'What happens if two different files both `import "./state.js"` in a browser app?',
        options: [
          '`state.js` runs twice and creates two separate copies',
          '`state.js` executes once, and both importers share the cached module exports',
          'The second import throws an error',
        ],
        correctIndex: 1,
        explanation: 'ES Modules are singletons per URL: they execute once on first load and return cached bindings thereafter.',
      },
    ],
  },
  {
    id: 't34-web-timers-observers',
    number: 36,
    categoryId: 'cat-8-modern-architecture',
    categoryTitle: '8. Modern Web Architecture & Browser APIs',
    tier: 'Advanced',
    title: 'Timers (setTimeout, setInterval), requestAnimationFrame & Observers',
    webDevUseCase: 'Countdowns, Smooth 60fps Animations & Lazy Image Loading',
    summary:
      'Manage and clear `setTimeout`/`setInterval` without stacking leaks, sync visual animations to screen refresh with `requestAnimationFrame`, and detect element visibility via `IntersectionObserver`.',
    revisionTldr:
      'Always clear old timers (`clearTimeout` / `clearInterval`) before starting a new one! Use `requestAnimationFrame` (not `setInterval`) for smooth UI motion, and `IntersectionObserver` instead of heavy `scroll` listeners.',
    explanation: [
      '`setTimeout(fn, ms)` runs once after at least `ms` milliseconds, while `setInterval(fn, ms)` repeats forever until `clearInterval(id)` is called. Both return a numeric timer ID—if you start a new interval without clearing the old one, multiple timers stack and run concurrently.',
      'For visual animations, `setInterval` drifts out of sync with monitor refreshes (causing jitter). `requestAnimationFrame(step)` asks the browser to invoke your callback right before the next display repaint (typically 60–120fps) and passes a high-resolution `timestamp`.',
      'For infinite scroll or reveal-on-scroll effects, attaching `window.addEventListener("scroll", ...)` fires dozens of times per second. `IntersectionObserver` efficiently notifies you only when an element enters or leaves the viewport.',
    ],
    keyRules: [
      'Always store timer IDs and run `clearInterval(id)` / `cancelAnimationFrame(rafId)` on stop or component unmount.',
      'Remember `setTimeout(fn, 1000)` guarantees a MINIMUM delay of 1000ms, not an exact time, if the main thread is busy.',
      'Use `IntersectionObserver` (`entry.isIntersecting`) for scroll triggers and lazy loading.',
    ],
    codeExample: `let timerId = null;
let seconds = 5;

function startCountdown(onTick) {
  clearInterval(timerId); // Prevent stacked timers!
  seconds = 5;
  onTick(seconds);

  timerId = setInterval(() => {
    seconds -= 1;
    onTick(seconds);
    if (seconds <= 0) {
      clearInterval(timerId);
      timerId = null;
    }
  }, 1000);
}`,
    commonMistake: {
      label: 'Starting a new setInterval on button click without clearing the previous timer',
      avoid: `startBtn.addEventListener('click', () => {
  // Clicking twice spawns TWO overlapping intervals counting 2x faster!
  setInterval(tick, 1000);
});`,
      prefer: `let id = null;
startBtn.addEventListener('click', () => {
  clearInterval(id);
  id = setInterval(tick, 1000);
});`,
    },
    practice: {
      logical: {
        title: 'Fix Stacked setInterval Bug (2x Accelerated Counter)',
        scenario: 'Exam Question · Preventing Overlapping Timers & Stopping at 0',
        taskPrompt:
          'Clicking "Start" twice spawns two stacked `setInterval` loops that race and skip numbers, and it keeps counting negative below `0`! Store `timerId`, call `clearInterval(timerId)` before starting, and clear it when `count <= 0`.',
        starterHtml: `<div class="box">
  <h1>Stacked setInterval Bug Hunt</h1>
  <button id="btn-start" type="button">Start / Restart (Click Twice!)</button>
  <div id="out" class="out">Ready (5s)</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const out = document.getElementById('out');

document.getElementById('btn-start').addEventListener('click', () => {
  // BUG 1: Forgot clearInterval(timerId) before starting! Clicking twice stacks timers!
  let count = 5;
  out.textContent = 'Count: ' + count;

  setInterval(() => {
    count -= 1;
    // BUG 2: Never stops at 0! Counts -1, -2, -3 forever!
    out.textContent = 'Count: ' + count;
  }, 500);
});`,
        solutionJs: `let timerId = null;
const out = document.getElementById('out');

document.getElementById('btn-start').addEventListener('click', () => {
  clearInterval(timerId);
  let count = 5;
  out.textContent = 'Count: ' + count;

  timerId = setInterval(() => {
    count -= 1;
    if (count <= 0) {
      clearInterval(timerId);
      timerId = null;
      out.textContent = 'Done (0)';
    } else {
      out.textContent = 'Count: ' + count;
    }
  }, 500);
});`,
      },
      realLife: {
        title: 'OTP Resend 5-Second Cooldown Timer',
        scenario: 'Daily Life · Banking / Login Screen Safe Cooldown Button',
        taskPrompt:
          'Disable the "Resend OTP" button for 5 seconds after clicking, show live seconds left, and safely re-enable it when the countdown finishes using `clearInterval(intervalId)`.',
        starterHtml: `<div class="box">
  <h1>Login OTP Resend Cooldown</h1>
  <button id="btn-otp" type="button">Send OTP</button>
  <div id="out" class="out">Click Send OTP to start 5s cooldown</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `let intervalId = null;
const btn = document.getElementById('btn-otp');
const out = document.getElementById('out');

btn.addEventListener('click', () => {
  clearInterval(intervalId);
  let seconds = 5;
  btn.disabled = true;
  out.textContent = 'OTP sent! Resend available in ' + seconds + 's';

  intervalId = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      btn.disabled = false;
      out.textContent = 'You can now resend OTP.';
    } else {
      out.textContent = 'OTP sent! Resend available in ' + seconds + 's';
    }
  }, 1000);
});`,
        solutionJs: `let intervalId = null;
const btn = document.getElementById('btn-otp');
const out = document.getElementById('out');

btn.addEventListener('click', () => {
  clearInterval(intervalId);
  let seconds = 5;
  btn.disabled = true;
  out.textContent = 'OTP sent! Resend available in ' + seconds + 's';

  intervalId = setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      clearInterval(intervalId);
      intervalId = null;
      btn.disabled = false;
      out.textContent = 'You can now resend OTP.';
    } else {
      out.textContent = 'OTP sent! Resend available in ' + seconds + 's';
    }
  }, 1000);
});`,
      },
    },
    quiz: [
      {
        question: 'Why should smooth frame-by-frame JavaScript animations use `requestAnimationFrame` instead of `setInterval(..., 16)`?',
        options: [
          '`requestAnimationFrame` syncs directly with browser display repaints and pauses in background tabs',
          '`setInterval` is deprecated in ES2022',
          '`requestAnimationFrame` runs on a separate CPU thread',
        ],
        correctIndex: 0,
        explanation:
          '`requestAnimationFrame` schedules callbacks right before the browser’s repaint cycle and pauses automatically when the tab is hidden, saving battery.',
      },
      {
        question: 'Which Web API efficiently detects when a DOM card scrolls into view without polling scroll coordinates?',
        options: ['`MutationObserver`', '`IntersectionObserver`', '`PerformanceObserver`'],
        correctIndex: 1,
        explanation: '`IntersectionObserver` asynchronously reports viewport visibility intersections with minimal overhead.',
      },
    ],
  },
  {
    id: 't35-immutability-pure-functions',
    number: 37,
    categoryId: 'cat-8-modern-architecture',
    categoryTitle: '8. Modern Web Architecture & Browser APIs',
    tier: 'Advanced',
    title: 'Pure Functions, Immutability, Currying & Memoization',
    webDevUseCase: 'Predictable UI State Updates (React/Redux Style) & Fast Caching',
    summary:
      'Write side-effect-free pure functions, update nested state immutably without mutating inputs, specialize reusable helpers via currying, and cache expensive calculations with memoization.',
    revisionTldr:
      'Pure functions depend ONLY on arguments, produce zero side effects, and never mutate inputs. Update arrays/objects via `[...arr]`, `.map()`, `.filter()`, and `{ ...obj }`. Memoization caches results keyed by inputs.',
    explanation: [
      'A **pure function** always returns the exact same output for the same inputs and causes zero external side effects (no mutating global variables, no modifying passed-in arrays). This predictability makes UI bugs trivial to reproduce and test.',
      'Modern web frameworks rely on **immutability**: instead of `cart.push(item)`, create a fresh array `[...cart, item]`. Because the array reference changes, UI components immediately detect the update (`prevCart !== nextCart`).',
      '**Currying** transforms `fn(a, b)` into `a => b => fn(a, b)` so you can pre-configure reusable formatters (`const inr = formatWith("₹")`). **Memoization** stores computed outputs in a closure `Map` so repeated calls with identical arguments return instantly in O(1).',
    ],
    keyRules: [
      'Add item immutably: `[...arr, item]`. Remove: `arr.filter(x => x.id !== id)`. Update one item: `arr.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x)`.',
      'Always keep I/O (API calls, `localStorage`, DOM writes) at the outer boundary of pure business logic.',
      'Memoization only works safely on pure functions whose output depends solely on their arguments.',
    ],
    codeExample: `// 1. Immutable cart update
function toggleTodo(todos, id) {
  return todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

// 2. Curried logger/formatter
const makeMultiplier = (factor) => (value) => value * factor;
const applyGst = makeMultiplier(1.18);
console.log('GST price:', applyGst(1000));

// 3. Memoization helper
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (cache.has(arg)) return cache.get(arg);
    const res = fn(arg);
    cache.set(arg, res);
    return res;
  };
}`,
    commonMistake: {
      label: 'Mutating an item inside state directly with .push() or property assignment',
      avoid: `function addItem(cart, item) {
  cart.push(item); // Mutates original reference! UI state diffing misses it
  return cart;
}`,
      prefer: `function addItem(cart, item) {
  return [...cart, item]; // New reference, original untouched
}`,
    },
    practice: {
      logical: {
        title: 'Pure Memoizer & Reference-Preserving Immutable State',
        scenario: 'Exam Question · Caching Pure Functions & UI Diff Reference Check',
        taskPrompt:
          'Complete `memoize(fn)` using a closure `Map` so calling `fastFib(10)` a second time returns the cached value without incrementing `computeRuns`, and fix `toggleItem` so `nextList !== prevList`.',
        starterHtml: `<div class="box">
  <h1>Memoization & Pure State Exam Check</h1>
  <button id="btn-run" type="button">Run Twice & Compare</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `let computeRuns = 0;

function memoize(fn) {
  const cache = new Map();
  return (x) => {
    // TODO: If cache.has(x), return cache.get(x) directly without calling fn(x)!
    const val = fn(x);
    cache.set(x, val);
    return val;
  };
}

const slowCube = memoize((n) => {
  computeRuns += 1;
  return n * n * n;
});

document.getElementById('btn-run').addEventListener('click', () => {
  computeRuns = 0;
  const r1 = slowCube(9);
  const r2 = slowCube(9);
  document.getElementById('out').textContent =
    '9^3 = ' + r1 + ' & ' + r2 +
    '\\nActual compute runs (expected 1): ' + computeRuns;
});`,
        solutionJs: `let computeRuns = 0;

function memoize(fn) {
  const cache = new Map();
  return (x) => {
    if (cache.has(x)) return cache.get(x);
    const val = fn(x);
    cache.set(x, val);
    return val;
  };
}

const slowCube = memoize((n) => {
  computeRuns += 1;
  return n * n * n;
});

document.getElementById('btn-run').addEventListener('click', () => {
  computeRuns = 0;
  const r1 = slowCube(9);
  const r2 = slowCube(9);
  document.getElementById('out').textContent =
    '9^3 = ' + r1 + ' & ' + r2 +
    '\\nActual compute runs (expected 1): ' + computeRuns;
});`,
      },
      realLife: {
        title: 'React-Style Immutable Cart Qty +1 & Curried Tax Helper',
        scenario: 'Daily Life · Updating Cart Line Quantities Without Mutating History',
        taskPrompt:
          'When clicking "+1 Notebook", update `currentCart` immutably via `.map()` + `{ ...item, qty: item.qty + 1 }` so `prev !== currentCart` is `true` while `initialCart[0].qty` remains `1`.',
        starterHtml: `<div class="box">
  <h1>Immutable Cart State Update</h1>
  <button id="btn-inc" type="button">+1 Notebook (Immutable)</button>
  <div id="out" class="out">Click to increment quantity cleanly</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const initialCart = [
  { id: 'a', name: 'Notebook', qty: 1 },
  { id: 'b', name: 'Pen', qty: 2 },
];
let currentCart = initialCart;

document.getElementById('btn-inc').addEventListener('click', () => {
  const prev = currentCart;
  currentCart = currentCart.map((item) =>
    item.id === 'a' ? { ...item, qty: item.qty + 1 } : item
  );
  document.getElementById('out').textContent =
    'New array reference (React re-renders!)? ' + (prev !== currentCart) +
    '\\ninitialCart[0].qty: ' + initialCart[0].qty +
    ' | currentCart[0].qty: ' + currentCart[0].qty;
});`,
        solutionJs: `const initialCart = [
  { id: 'a', name: 'Notebook', qty: 1 },
  { id: 'b', name: 'Pen', qty: 2 },
];
let currentCart = initialCart;

document.getElementById('btn-inc').addEventListener('click', () => {
  const prev = currentCart;
  currentCart = currentCart.map((item) =>
    item.id === 'a' ? { ...item, qty: item.qty + 1 } : item
  );
  document.getElementById('out').textContent =
    'New array reference (React re-renders!)? ' + (prev !== currentCart) +
    '\\ninitialCart[0].qty: ' + initialCart[0].qty +
    ' | currentCart[0].qty: ' + currentCart[0].qty;
});`,
      },
    },
    quiz: [
      {
        question: 'Which code removes item with `id === 3` from `items` WITHOUT mutating the original array?',
        options: [
          '`items.splice(items.findIndex(x => x.id === 3), 1)`',
          '`items.filter(x => x.id !== 3)`',
          '`delete items[3]`',
        ],
        correctIndex: 1,
        explanation:
          '`.filter()` returns a brand-new array leaving `items` untouched, whereas `.splice()` and `delete` mutate in place.',
      },
      {
        question: 'Which condition MUST hold true for a function to be safely memoized?',
        options: [
          'It must be pure (same input always returns the same output with no side effects)',
          'It must use `var` declarations',
          'It must accept at least 3 arguments',
        ],
        correctIndex: 0,
        explanation: 'Caching results is only valid if the function has no hidden mutable dependencies or time-varying behavior.',
      },
    ],
  },
  {
    id: 't36-memory-performance',
    number: 38,
    categoryId: 'cat-8-modern-architecture',
    categoryTitle: '8. Modern Web Architecture & Browser APIs',
    tier: 'Advanced',
    title: 'Garbage Collection, Memory Leaks & Script Loading (defer vs async)',
    webDevUseCase: 'Shipping Fast Initial Page Loads & Long-Running Leak-Free SPAs',
    summary:
      'Prevent memory leaks from forgotten listeners, timers, and detached DOM references; speed up initial rendering with `<script defer>` vs `<script async>`.',
    revisionTldr:
      'JS Garbage Collection reclaims unreachable values—forgotten `setInterval`s, global caches, and unremoved `window` listeners keep closures alive and leak RAM. Always put `<script defer>` in `<head>` for ordered non-blocking execution.',
    explanation: [
      'JavaScript frees memory automatically via Mark-and-Sweep Garbage Collection: anything reachable from the root (`window`, active closures, or running timers) stays in RAM forever.',
      'Top 3 web memory leaks: (1) an uncancelled `setInterval` referencing a large array, (2) global `window.addEventListener("resize", handler)` added repeatedly when components mount without `.removeEventListener()` or `AbortController`, and (3) keeping references to removed DOM nodes ("detached DOM trees").',
      'For script loading: a bare `<script>` in `<head>` blocks HTML parsing. `<script async>` downloads in parallel and executes the instant it finishes (unordered—good only for standalone analytics). `<script defer>` downloads in parallel AND executes in exact script order right before `DOMContentLoaded`.',
    ],
    keyRules: [
      'Use `<script defer src="app.js">` (or `<script type="module">`) so HTML renders first and DOM elements exist when JS runs.',
      'Pass `{ signal: abortController.signal }` to `addEventListener` so calling `abortController.abort()` cleans up multiple listeners in one line.',
      'Avoid storing unbounded arrays or DOM element references in module-level/global variables without eviction limits.',
    ],
    codeExample: `// Clean listener teardown using AbortController signal
const ac = new AbortController();

window.addEventListener('resize', () => {
  console.log('Viewport width:', window.innerWidth);
}, { signal: ac.signal });

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') console.log('Esc pressed');
}, { signal: ac.signal });

// One call removes ALL listeners attached with ac.signal!
ac.abort();`,
    commonMistake: {
      label: 'Calling removeEventListener with a newly created anonymous function',
      avoid: `window.addEventListener('scroll', () => handleScroll());
// Fails silently because () => ... is a DIFFERENT function reference!
window.removeEventListener('scroll', () => handleScroll());`,
      prefer: `const ac = new AbortController();
window.addEventListener('scroll', handleScroll, { signal: ac.signal });
// Later on cleanup:
ac.abort();`,
    },
    practice: {
      logical: {
        title: 'Fix Broken removeEventListener Reference Leak with AbortController',
        scenario: 'Exam Question · Why Anonymous Arrows Fail to Remove Listeners',
        taskPrompt:
          'Calling `zone.removeEventListener("click", () => handle())` fails silently because two `() => handle()` arrows are different function objects in memory, causing duplicate clicks to stack up! Fix cleanup using `AbortController` (`{ signal: ac.signal }`).',
        starterHtml: `<div class="box">
  <h1>Listener Memory Leak Exam Fix</h1>
  <button id="btn-cleanup" type="button">Attempt Cleanup & Test Click</button>
  <button id="btn-target" type="button">Target Button (Click Me)</button>
  <div id="out" class="out">Clicks: 0</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `let clicks = 0;
const target = document.getElementById('btn-target');
const out = document.getElementById('out');

// BUG: Removing an anonymous arrow () => ... NEVER removes the original listener!
target.addEventListener('click', () => {
  clicks += 1;
  out.textContent = 'Clicks (should stay 0 after cleanup!): ' + clicks;
});

document.getElementById('btn-cleanup').addEventListener('click', () => {
  target.removeEventListener('click', () => {
    clicks += 1;
  });
  out.textContent = 'Cleanup attempted! Now click Target Button to see if it leaked.';
});`,
        solutionJs: `let clicks = 0;
const ac = new AbortController();
const target = document.getElementById('btn-target');
const out = document.getElementById('out');

target.addEventListener(
  'click',
  () => {
    clicks += 1;
    out.textContent = 'Clicks: ' + clicks;
  },
  { signal: ac.signal }
);

document.getElementById('btn-cleanup').addEventListener('click', () => {
  ac.abort();
  out.textContent = 'Aborted cleanly! Clicking Target Button will now do nothing (0 leaks).';
});`,
      },
      realLife: {
        title: 'Leak-Free Drawing Canvas Pointer Tracker with AbortController',
        scenario: 'Daily Life · Tearing Down High-Frequency Mouse Listeners on Panel Close',
        taskPrompt:
          'Attach a high-frequency `mousemove` pointer tracker controlled by `AbortController`. Move your mouse over the box, then click "Close Panel & Cleanup" to detach the listener immediately with zero memory leak.',
        starterHtml: `<div class="box" id="zone">
  <h1>Pointer Tracker Panel</h1>
  <button id="btn-attach" type="button">Open Tracker</button>
  <button id="btn-abort" type="button">Close Panel & Cleanup</button>
  <div id="out" class="out">Open tracker, move pointer, then close cleanly</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `let controller = null;
const zone = document.getElementById('zone');
const out = document.getElementById('out');

document.getElementById('btn-attach').addEventListener('click', () => {
  controller?.abort();
  controller = new AbortController();
  let moves = 0;

  zone.addEventListener(
    'mousemove',
    (e) => {
      moves += 1;
      out.textContent = 'Tracking active -> Move #' + moves + ' (x=' + e.clientX + ', y=' + e.clientY + ')';
    },
    { signal: controller.signal }
  );
  out.textContent = 'Tracker active! Move mouse inside box.';
});

document.getElementById('btn-abort').addEventListener('click', () => {
  if (controller) {
    controller.abort();
    controller = null;
    out.textContent = 'Panel closed & listener garbage-collectible!';
  }
});`,
        solutionJs: `let controller = null;
const zone = document.getElementById('zone');
const out = document.getElementById('out');

document.getElementById('btn-attach').addEventListener('click', () => {
  controller?.abort();
  controller = new AbortController();
  let moves = 0;

  zone.addEventListener(
    'mousemove',
    (e) => {
      moves += 1;
      out.textContent = 'Tracking active -> Move #' + moves + ' (x=' + e.clientX + ', y=' + e.clientY + ')';
    },
    { signal: controller.signal }
  );
  out.textContent = 'Tracker active! Move mouse inside box.';
});

document.getElementById('btn-abort').addEventListener('click', () => {
  controller?.abort();
  controller = null;
  out.textContent = 'Panel closed & listener garbage-collectible!';
});`,
      },
    },
    quiz: [
      {
        question: 'Which `<script>` attribute downloads JS in parallel without blocking HTML parsing and guarantees ordered execution before `DOMContentLoaded`?',
        options: ['`<script async>`', '`<script defer>`', '`<script sync>`'],
        correctIndex: 1,
        explanation:
          '`defer` downloads scripts non-blockingly and executes them in document order after HTML parsing completes.',
      },
      {
        question: 'Why does passing `{ signal: controller.signal }` to `addEventListener` help prevent memory leaks?',
        options: [
          'Calling `controller.abort()` removes all linked listeners cleanly without needing exact function reference copies',
          'It freezes the DOM permanently',
          'It clears `localStorage` automatically',
        ],
        correctIndex: 0,
        explanation: '`AbortController.abort()` detaches all registered listeners in one call, freeing closures for Garbage Collection.',
      },
    ],
  },
];
