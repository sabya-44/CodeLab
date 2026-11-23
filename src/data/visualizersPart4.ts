import type { VisualizerScenario } from '../types/visualizer';

/**
 * Interactive dry-run visual working explanations for remaining topics in Sections 5–8
 * (t22, t23, t24, t25, t26, t27, t27b, t28, t33, t34, t35, t36, t36b, t36c, t36d).
 */
export const VISUALIZERS_PART_4: VisualizerScenario[] = [
  // t22: Set, Map & Iterators
  {
    id: 'vis-t22-set-map',
    topicId: 't22-set-map-iterators',
    title: 'O(1) Deduplication with `Set` & Frequency Counting with `Map`',
    subtitle: 'Watch `Set` drop duplicates automatically and `Map` update counts in one linear pass.',
    focus: 'variables-table',
    codeLines: [
      "const tags = ['js', 'css', 'js'];",
      'const unique = new Set(tags);',
      'const freq = new Map();',
      'for (const t of tags) freq.set(t, (freq.get(t) ?? 0) + 1);',
    ],
    tableColumns: ['Step', 'Item', 'unique (Set)', 'freq (Map)'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Build Set',
        explanation: '`new Set(["js", "css", "js"])` keeps unique entries in insertion order: `{"js", "css"}`.',
        variables: [{ name: 'unique.size', value: '2', type: 'number', changed: true }],
        tableRows: [['Set init', 'tags', '{"js", "css"}', '{}']],
      },
      {
        activeLine: 4,
        phaseLabel: 'Loop 1 ("js")',
        explanation: '`freq.get("js")` is `undefined` -> `?? 0` -> sets `"js" => 1`.',
        variables: [{ name: 'freq', value: 'Map { "js" => 1 }', type: 'Map', changed: true }],
        tableRows: [['Loop 1', '"js"', '{"js", "css"}', '"js" => 1']],
      },
      {
        activeLine: 4,
        phaseLabel: 'Loop 2 ("css")',
        explanation: 'Sets `"css" => 1`.',
        variables: [{ name: 'freq', value: 'Map { "js" => 1, "css" => 1 }', type: 'Map', changed: true }],
        tableRows: [
          ['Loop 1', '"js"', '{"js", "css"}', '"js" => 1'],
          ['Loop 2', '"css"', '{"js", "css"}', '"js" => 1, "css" => 1'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Loop 3 ("js")',
        explanation: '`freq.get("js")` is `1` -> increments to `"js" => 2` in O(1) time.',
        variables: [{ name: 'freq', value: 'Map { "js" => 2, "css" => 1 }', type: 'Map', changed: true }],
        tableRows: [
          ['Loop 1', '"js"', '{"js", "css"}', '"js" => 1'],
          ['Loop 2', '"css"', '{"js", "css"}', '"js" => 1, "css" => 1'],
          ['Loop 3', '"js"', '{"js", "css"}', '"js" => 2, "css" => 1'],
        ],
      },
    ],
  },

  // t23: DOM Selection & XSS Safety
  {
    id: 'vis-t23-xss-textcontent',
    topicId: 't23-dom-selection-xss',
    title: 'How `textContent` Prevents XSS vs `innerHTML`',
    subtitle: 'Compare how the browser HTML parser treats untrusted user strings under `innerHTML` vs `textContent`.',
    focus: 'variables-table',
    codeLines: [
      "const untrusted = '<img src=x onerror=\"steal()\">';",
      'const box = document.querySelector("#bio");',
      'box.innerHTML = untrusted; // DANGEROUS!',
      'box.textContent = untrusted; // SAFE!',
    ],
    tableColumns: ['Property', 'HTML Parsed?', 'Script Executes?', 'Rendered Result'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Untrusted User Input',
        explanation: 'An attacker submits an HTML tag with an inline `onerror` event handler as their bio.',
        variables: [{ name: 'untrusted', value: '"<img src=x onerror=...>"', type: 'string', changed: true }],
        tableRows: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'innerHTML (XSS Vulnerability)',
        explanation: '`innerHTML` hands the string to the HTML parser, creating a real `<img>` node that fires `onerror` -> steals cookies/tokens!',
        tableRows: [['innerHTML', 'YES', 'YES (XSS!)', 'Executes attacker JS']],
      },
      {
        activeLine: 4,
        phaseLabel: 'textContent (Safe Text Node)',
        explanation: '`textContent` skips HTML parsing completely and writes literal escaped characters onto the page.',
        tableRows: [
          ['innerHTML', 'YES', 'YES (XSS!)', 'Executes attacker JS'],
          ['textContent', 'NO', 'NO (Safe)', 'Literal "<img src=x ...>"'],
        ],
      },
    ],
  },

  // t24: Browser Events & Form Lifecycle
  {
    id: 'vis-t24-form-lifecycle',
    topicId: 't24-events-forms-prevent',
    title: 'Form Submit Event Lifecycle & `preventDefault()`',
    subtitle: 'Watch how `event.preventDefault()` stops full-page reload so JS can validate and submit asynchronously.',
    focus: 'variables-table',
    codeLines: [
      'form.addEventListener("submit", (event) => {',
      '  event.preventDefault();',
      '  const data = Object.fromEntries(new FormData(form));',
      '  if (!data.email.includes("@")) return showError("Invalid email");',
      '  submitOrder(data);',
      '});',
    ],
    tableColumns: ['Stage', 'Browser Action', 'JS State'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'User Clicks Submit',
        explanation: 'Browser fires the `submit` event on the `<form>` element and runs your listener.',
        tableRows: [['1. Submit Event', 'Pending page reload', 'Listener invoked']],
      },
      {
        activeLine: 2,
        phaseLabel: 'preventDefault()',
        explanation: 'Cancels the browser’s default full-page HTTP navigation so SPA state stays alive.',
        tableRows: [
          ['1. Submit Event', 'Pending page reload', 'Listener invoked'],
          ['2. preventDefault()', 'Reload CANCELED', 'JS owns the flow'],
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Extract FormData',
        explanation: '`Object.fromEntries(new FormData(form))` collects all named inputs cleanly into one plain object.',
        variables: [{ name: 'data', value: '{ email: "ada@dev.io" }', type: 'object', changed: true }],
        tableRows: [
          ['1. Submit Event', 'Pending page reload', 'Listener invoked'],
          ['2. preventDefault()', 'Reload CANCELED', 'JS owns the flow'],
          ['3. FormData', 'Reads input[name]', '{ email: "ada@dev.io" }'],
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'Validated Submit',
        explanation: 'Email passes guard check -> `submitOrder(data)` runs without losing page state.',
        tableRows: [
          ['1. Submit Event', 'Pending page reload', 'Listener invoked'],
          ['2. preventDefault()', 'Reload CANCELED', 'JS owns the flow'],
          ['3. FormData', 'Reads input[name]', '{ email: "ada@dev.io" }'],
          ['4. Validation Pass', 'No reload', 'submitOrder() called'],
        ],
      },
    ],
  },

  // t25: Event Bubbling & Delegation
  {
    id: 'vis-t25-event-delegation',
    topicId: 't25-event-bubbling-delegation',
    title: 'Event Bubbling & Delegation with `.closest()`',
    subtitle: 'Trace a click bubbling up from `<span>` → `<button>` → `<ul>` handled by ONE parent listener.',
    focus: 'variables-table',
    codeLines: [
      'list.addEventListener("click", (e) => {',
      '  const btn = e.target.closest("button[data-del]");',
      '  if (!btn) return;',
      '  removeItem(btn.dataset.del);',
      '});',
    ],
    tableColumns: ['Phase', 'DOM Element', 'e.target', 'e.currentTarget', 'Action'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Target Phase (`<span class="icon">`)',
        explanation: 'User clicks the trash icon inside the Delete button. `e.target` is the inner `<span>`, NOT the `<button>`!',
        tableRows: [['1. Target', '<span>', '<span>', '—', 'Click originates here']],
      },
      {
        activeLine: 1,
        phaseLabel: 'Bubbling Up (`<button>` -> `<li>` -> `<ul>`)',
        explanation: 'The event bubbles up through `<button>` and `<li>` until it reaches the single listener on `<ul>` (`list`).',
        tableRows: [
          ['1. Target', '<span>', '<span>', '—', 'Click originates here'],
          ['2. Bubble', '<ul> (list)', '<span>', '<ul>', 'Delegated listener fires'],
        ],
      },
      {
        activeLine: 2,
        phaseLabel: 'e.target.closest("button[data-del]")',
        explanation: '`.closest()` walks upward from `<span>`, immediately finding the enclosing `<button data-del="42">`.',
        variables: [{ name: 'btn.dataset.del', value: '"42"', type: 'string', changed: true }],
        tableRows: [
          ['1. Target', '<span>', '<span>', '—', 'Click originates here'],
          ['2. Bubble', '<ul> (list)', '<span>', '<ul>', 'Delegated listener fires'],
          ['3. .closest()', '<button data-del="42">', '<span>', '<ul>', 'Found button -> removeItem("42")'],
        ],
      },
    ],
  },

  // t26: Regular Expressions
  {
    id: 'vis-t26-regex-anchors',
    topicId: 't26-regex-validation',
    title: 'Anchored RegExp Validation (`^...$`) vs Unanchored Trap',
    subtitle: 'See why forgetting `^` and `$` lets invalid strings like `"12345abc"` pass validation.',
    focus: 'variables-table',
    codeLines: [
      'const input = "12345abc";',
      'const looseZip = /\\d{5}/.test(input);',
      'const strictZip = /^\\d{5}$/.test(input);',
      'const validZip = /^\\d{5}$/.test("90210");',
    ],
    tableColumns: ['Pattern', 'Input', 'Match Found', 'Result'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Unanchored Trap',
        explanation: '`/\\d{5}/` finds `"12345"` inside `"12345abc"` and falsely returns `true`!',
        variables: [{ name: 'looseZip', value: 'true (Bug!)', type: 'boolean', changed: true }],
        tableRows: [['/\\d{5}/', '"12345abc"', '"12345" substring', 'true (Bug!)']],
      },
      {
        activeLine: 3,
        phaseLabel: 'Anchored Validation (`^...$`)',
        explanation: '`^` (start) and `$` (end) require the ENTIRE string to be exactly 5 digits -> rejects `"12345abc"`.',
        variables: [{ name: 'strictZip', value: 'false', type: 'boolean', changed: true }],
        tableRows: [
          ['/\\d{5}/', '"12345abc"', '"12345" substring', 'true (Bug!)'],
          ['/^\\d{5}$/', '"12345abc"', 'None (extra "abc")', 'false (Safe)'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Valid Input Passes',
        explanation: '`"90210"` matches from start to end -> `true`.',
        variables: [{ name: 'validZip', value: 'true', type: 'boolean', changed: true }],
        tableRows: [
          ['/\\d{5}/', '"12345abc"', '"12345" substring', 'true (Bug!)'],
          ['/^\\d{5}$/', '"12345abc"', 'None (extra "abc")', 'false (Safe)'],
          ['/^\\d{5}$/', '"90210"', '"90210"', 'true'],
        ],
      },
    ],
  },

  // t27: JSON & Web Storage
  {
    id: 'vis-t27-json-storage',
    topicId: 't27-json-web-storage',
    title: 'Serialization Round-Trip (`JSON.stringify` ↔ `localStorage` ↔ `JSON.parse`)',
    subtitle: 'Track how a JS object turns into a JSON string for storage and parses back into a fresh object.',
    focus: 'variables-table',
    codeLines: [
      'const prefs = { theme: "dark", pageSize: 20 };',
      'const serialized = JSON.stringify(prefs);',
      'localStorage.setItem("prefs", serialized);',
      'const raw = localStorage.getItem("prefs");',
      'const restored = JSON.parse(raw);',
    ],
    tableColumns: ['Step', 'Value', 'typeof', 'Notes'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'In-Memory JS Object',
        explanation: 'Objects cannot be stored directly in `localStorage` (storing raw object writes `"[object Object]"`).',
        tableRows: [['1. prefs', '{ theme: "dark", pageSize: 20 }', 'object', 'In RAM']],
      },
      {
        activeLine: 2,
        phaseLabel: 'JSON.stringify()',
        explanation: 'Serializes the object into a double-quoted JSON text string.',
        variables: [{ name: 'serialized', value: '\'{"theme":"dark","pageSize":20}\'', type: 'string', changed: true }],
        tableRows: [
          ['1. prefs', '{ theme: "dark", pageSize: 20 }', 'object', 'In RAM'],
          ['2. stringify', '\'{"theme":"dark","pageSize":20}\'', 'string', 'Safe for storage/HTTP'],
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'JSON.parse() Round-Trip',
        explanation: 'Parses stored string back into a brand-new JS object (`restored !== prefs` by reference, equal by value).',
        variables: [{ name: 'restored.pageSize', value: '20', type: 'number', changed: true }],
        tableRows: [
          ['1. prefs', '{ theme: "dark", pageSize: 20 }', 'object', 'In RAM'],
          ['2. stringify', '\'{"theme":"dark","pageSize":20}\'', 'string', 'Stored in localStorage'],
          ['3. parse', '{ theme: "dark", pageSize: 20 }', 'object', 'Fresh object after reload'],
        ],
      },
    ],
  },

  // t27b: Debugging with DevTools
  {
    id: 'vis-t27b-stack-trace',
    topicId: 't27b-debugging-devtools',
    title: 'Reading a Stack Trace & Pausing at a Breakpoint',
    subtitle: 'Follow the Call Stack top-to-bottom to pinpoint the exact line that threw a TypeError.',
    focus: 'call-stack-scope',
    codeLines: [
      'function formatEmail(user) {',
      '  return user.email.toLowerCase(); // Throws here!',
      '}',
      'function renderRow(row) { return formatEmail(row.owner); }',
      'renderRow({ id: 1, owner: undefined });',
    ],
    steps: [
      {
        activeLine: 5,
        phaseLabel: 'Entry Call',
        explanation: '`renderRow` is called with `{ id: 1, owner: undefined }` (e.g., an unassigned ticket from API).',
        callStack: [{ frame: 'Global -> renderRow(row)', status: 'running' }],
        scopes: [{ name: 'renderRow Scope', kind: 'function', bindings: [{ key: 'row.owner', value: 'undefined', changed: true }] }],
      },
      {
        activeLine: 4,
        phaseLabel: 'Forward undefined Argument',
        explanation: '`renderRow` calls `formatEmail(undefined)`, pushing `formatEmail` onto the top of the Call Stack.',
        callStack: [
          { frame: 'Global', status: 'paused' },
          { frame: 'renderRow (line 4)', status: 'paused' },
          { frame: 'formatEmail(undefined) (line 2)', status: 'running' },
        ],
        scopes: [{ name: 'formatEmail Scope', kind: 'function', bindings: [{ key: 'user', value: 'undefined', changed: true }] }],
      },
      {
        activeLine: 2,
        phaseLabel: 'TypeError & Stack Trace',
        explanation: 'Evaluating `user.email` throws `TypeError: Cannot read properties of undefined`. The top frame shows WHERE it crashed; frame #2 (`renderRow`) shows WHO passed `undefined`.',
        callStack: [
          { frame: 'formatEmail (line 2) <-- crash site', status: 'returning' },
          { frame: 'renderRow (line 4) <-- caller', status: 'paused' },
        ],
        consoleOutput: ["TypeError: Cannot read properties of undefined (reading 'email')"],
      },
    ],
  },

  // t28: Exception Handling (try / catch / finally)
  {
    id: 'vis-t28-try-catch-finally',
    topicId: 't28-try-catch-finally',
    title: 'Execution Control Flow Through `try` → `catch` → `finally`',
    subtitle: 'See why `finally` ALWAYS executes for cleanup — even when `try` throws or `catch` returns.',
    focus: 'variables-table',
    codeLines: [
      'let loading = true;',
      'try {',
      '  JSON.parse("{broken");',
      '  console.log("never reached");',
      '} catch (err) {',
      '  console.log("Handled:", err.name);',
      '} finally {',
      '  loading = false;',
      '}',
    ],
    tableColumns: ['Block', 'Executed?', 'loading', 'Control Flow'],
    steps: [
      {
        activeLine: 3,
        phaseLabel: 'Throw Inside try',
        explanation: '`JSON.parse("{broken")` throws `SyntaxError`. Line 4 is immediately skipped!',
        variables: [{ name: 'loading', value: 'true', type: 'boolean' }],
        tableRows: [['try (line 3)', 'Throws SyntaxError', 'true', 'Jumps to catch']],
      },
      {
        activeLine: 6,
        phaseLabel: 'Recover in catch',
        explanation: '`catch (err)` intercepts the `SyntaxError` so the application does not crash.',
        tableRows: [
          ['try (line 3)', 'Throws SyntaxError', 'true', 'Jumps to catch'],
          ['catch (line 6)', 'Yes', 'true', 'Logs "Handled: SyntaxError"'],
        ],
        consoleOutput: ['Handled: SyntaxError'],
      },
      {
        activeLine: 8,
        phaseLabel: 'Guaranteed Cleanup in finally',
        explanation: '`finally` ALWAYS runs, resetting `loading = false` so UI spinners never freeze.',
        variables: [{ name: 'loading', value: 'false', type: 'boolean', changed: true }],
        tableRows: [
          ['try (line 3)', 'Throws SyntaxError', 'true', 'Jumps to catch'],
          ['catch (line 6)', 'Yes', 'true', 'Logs "Handled: SyntaxError"'],
          ['finally (line 8)', 'ALWAYS runs', 'false', 'Cleanup complete'],
        ],
        consoleOutput: ['Handled: SyntaxError'],
      },
    ],
  },

  // t33: ES Modules
  {
    id: 'vis-t33-esm-bindings',
    topicId: 't33-es-modules',
    title: 'ES Module Dependency Graph & Live Read-Only Bindings',
    subtitle: 'Visualize how static `import` statements resolve before execution and share live exports.',
    focus: 'variables-table',
    codeLines: [
      '// math.js: export const TAX = 0.1; export function addTax(p) { return p * (1 + TAX); }',
      "// app.js: import { addTax } from './math.js';",
      'const finalPrice = addTax(200);',
      'console.log(finalPrice);',
    ],
    tableColumns: ['Phase', 'Module', 'Action', 'Visibility'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: '1. Static Parse & Link',
        explanation: 'Before running any code, the engine scans static `import`/`export` statements and links `addTax` from `math.js`.',
        tableRows: [['1. Parse & Link', 'app.js -> math.js', 'Links named export addTax', 'TAX stays private to math.js']],
      },
      {
        activeLine: 3,
        phaseLabel: '2. Evaluate Dependency First',
        explanation: '`math.js` evaluates first (`TAX = 0.1`), then `app.js` calls `addTax(200)` -> `220`.',
        variables: [{ name: 'finalPrice', value: '220', type: 'number', changed: true }],
        tableRows: [
          ['1. Parse & Link', 'app.js -> math.js', 'Links named export addTax', 'Tree-shakeable'],
          ['2. Evaluate', 'app.js', 'addTax(200) -> 220', 'Zero global window pollution'],
        ],
        consoleOutput: ['220'],
      },
    ],
  },

  // t34: Web Timers & Debounce
  {
    id: 'vis-t34-debounce-timers',
    topicId: 't34-web-timers-observers',
    title: 'How Debounce Cancels Intermediate Timers (`clearTimeout`)',
    subtitle: 'Watch rapid keystrokes cancel old timers so only ONE API call fires after typing pauses.',
    focus: 'event-loop',
    codeLines: [
      'const search = debounce((q) => fetchApi(q), 300);',
      'search("r");   // t = 0ms',
      'search("re");  // t = 100ms (cancels "r")',
      'search("rea"); // t = 200ms (cancels "re")',
      '// t = 500ms -> fetchApi("rea") runs ONCE!',
    ],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 't = 0ms: First Keystroke',
        explanation: 'Schedules Timer #1 (`fetchApi("r")`) for 300ms.',
        eventLoop: {
          webApis: ['Timer #1: fetchApi("r") (300ms)'],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Timer #1 counting down in Web APIs',
          activePhase: 'sync',
        },
      },
      {
        activeLine: 3,
        phaseLabel: 't = 100ms: Second Keystroke Cancels #1',
        explanation: '`clearTimeout(timer1)` cancels `"r"` before it fires and schedules Timer #2 (`"re"`).',
        eventLoop: {
          webApis: ['Timer #2: fetchApi("re") (300ms)'],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Timer #1 canceled -> Timer #2 started',
          activePhase: 'sync',
        },
      },
      {
        activeLine: 4,
        phaseLabel: 't = 200ms: Third Keystroke Cancels #2',
        explanation: '`clearTimeout(timer2)` cancels `"re"` and schedules Timer #3 (`"rea"`).',
        eventLoop: {
          webApis: ['Timer #3: fetchApi("rea") (300ms)'],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Timer #2 canceled -> Timer #3 started',
          activePhase: 'sync',
        },
      },
      {
        activeLine: 5,
        phaseLabel: 't = 500ms: User Pauses -> Fires Once!',
        explanation: '300ms elapses with no new keystrokes -> Timer #3 moves to Macrotask Queue and calls `fetchApi("rea")` ONCE.',
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: ['fetchApi("rea")'],
          loopStatus: 'Only 1 API request instead of 3!',
          activePhase: 'macrotask',
        },
        consoleOutput: ['fetchApi("rea")'],
      },
    ],
  },

  // t35: Immutability & Pure Functions
  {
    id: 'vis-t35-immutable-update',
    topicId: 't35-immutability-pure-functions',
    title: 'Pure State Transition vs In-Place Mutation',
    subtitle: 'See why creating a new array reference (`next !== prev`) lets React detect updates reliably.',
    focus: 'memory-heap',
    codeLines: [
      'const prev = [{ id: 1, done: false }];',
      'const next = prev.map((t) => (t.id === 1 ? { ...t, done: true } : t));',
      'console.log(prev === next, prev[0].done, next[0].done);',
    ],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Initial State (#arr1)',
        explanation: '`prev` points to `#arr1` containing `{ id: 1, done: false }` (`#t1`).',
        memory: {
          stack: [{ name: 'prev', value: 'ref -> #arr1', refId: '#arr1', changed: true }],
          heap: [
            { id: '#arr1', label: 'prev Array', entries: [{ key: '[0]', value: 'ref -> #t1', refId: '#t1' }] },
            { id: '#t1', label: 'Todo #1', entries: [{ key: 'done', value: 'false' }] },
          ],
        },
      },
      {
        activeLine: 2,
        phaseLabel: 'Pure Immutable Update (#arr2)',
        explanation: '`.map()` allocates `#arr2` and `{ ...t, done: true }` allocates `#t2`, leaving `#arr1` and `#t1` completely unchanged!',
        memory: {
          stack: [
            { name: 'prev', value: 'ref -> #arr1', refId: '#arr1' },
            { name: 'next', value: 'ref -> #arr2', refId: '#arr2', changed: true },
          ],
          heap: [
            { id: '#arr1', label: 'prev Array (untouched)', entries: [{ key: '[0].done', value: 'false' }] },
            { id: '#arr2', label: 'next Array (new ref)', entries: [{ key: '[0].done', value: 'true', changed: true }] },
          ],
        },
        consoleOutput: ['false false true'],
      },
    ],
  },

  // t36: Memory & Garbage Collection
  {
    id: 'vis-t36-gc-reachability',
    topicId: 't36-memory-performance',
    title: 'Garbage Collection Reachability & Leak Prevention',
    subtitle: 'Watch how clearing a listener or reference makes large Heap objects eligible for GC.',
    focus: 'memory-heap',
    codeLines: [
      'let cache = { bigData: new Array(10000) };',
      'let ref = cache;',
      'cache = null; // Still reachable via ref!',
      'ref = null;   // Unreachable -> GC frees memory!',
    ],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Two Strong References',
        explanation: 'Both `cache` and `ref` point to `#bigObj` in Heap.',
        memory: {
          stack: [
            { name: 'cache', value: 'ref -> #bigObj', refId: '#bigObj' },
            { name: 'ref', value: 'ref -> #bigObj', refId: '#bigObj', changed: true },
          ],
          heap: [{ id: '#bigObj', label: 'Large Cache (Reachable)', entries: [{ key: 'refs', value: '2 active pointers' }] }],
        },
      },
      {
        activeLine: 3,
        phaseLabel: 'Still Retained (Classic Leak)',
        explanation: 'Setting `cache = null` does NOT free `#bigObj` yet because `ref` still points to it.',
        memory: {
          stack: [
            { name: 'cache', value: 'null', changed: true },
            { name: 'ref', value: 'ref -> #bigObj', refId: '#bigObj' },
          ],
          heap: [{ id: '#bigObj', label: 'Large Cache (Still Retained!)', entries: [{ key: 'refs', value: '1 pointer via ref' }] }],
        },
      },
      {
        activeLine: 4,
        phaseLabel: 'Unreachable -> Reclaimed by GC',
        explanation: 'Clearing `ref = null` removes the final root pointer. Mark-and-Sweep GC safely reclaims `#bigObj`.',
        memory: {
          stack: [
            { name: 'cache', value: 'null' },
            { name: 'ref', value: 'null', changed: true },
          ],
          heap: [{ id: '#bigObj', label: 'Swept / Freed by GC', entries: [{ key: 'status', value: '0 root references', changed: true }] }],
        },
      },
    ],
  },

  // t36b: Testing Fundamentals
  {
    id: 'vis-t36b-aaa-testing',
    topicId: 't36b-testing-fundamentals',
    title: 'Arrange → Act → Assert Unit Testing Flow',
    subtitle: 'Trace happy-path and edge-case assertions catching a subtle boundary bug.',
    focus: 'variables-table',
    codeLines: [
      'const calcDiscount = (price, pct) => (price <= 0 ? 0 : price * (1 - pct));',
      'expect(calcDiscount(100, 0.2)).toBe(80);  // Happy path',
      'expect(calcDiscount(0, 0.2)).toBe(0);     // Boundary: zero',
      'expect(calcDiscount(-50, 0.2)).toBe(0);   // Edge: negative',
    ],
    tableColumns: ['Test Case', 'Arrange (Input)', 'Act (Output)', 'Assert (Expected)', 'Status'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Happy Path',
        explanation: 'Standard input `(100, 0.2)` returns `80`, matching expected `80`.',
        tableRows: [['Happy path', '(100, 0.2)', '80', '80', 'PASS']],
      },
      {
        activeLine: 3,
        phaseLabel: 'Zero Boundary',
        explanation: 'Zero price hits guard `price <= 0` and cleanly returns `0`.',
        tableRows: [
          ['Happy path', '(100, 0.2)', '80', '80', 'PASS'],
          ['Zero boundary', '(0, 0.2)', '0', '0', 'PASS'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Negative Edge Case',
        explanation: 'Negative price `-50` returns `0` instead of a nonsensical negative charge `-40`.',
        tableRows: [
          ['Happy path', '(100, 0.2)', '80', '80', 'PASS'],
          ['Zero boundary', '(0, 0.2)', '0', '0', 'PASS'],
          ['Negative guard', '(-50, 0.2)', '0', '0', 'PASS'],
        ],
      },
    ],
  },

  // t36c: Clean Code & Guard Clauses
  {
    id: 'vis-t36c-guard-clauses',
    topicId: 't36c-clean-code-organization',
    title: 'Flattening Nested `if/else` Pyramids with Guard Clauses',
    subtitle: 'Trace how early returns handle invalid inputs first and keep the happy path at depth 1.',
    focus: 'variables-table',
    codeLines: [
      'function canCheckout(user, cart) {',
      '  if (!user) return "Login required";',
      '  if (cart.length === 0) return "Cart is empty";',
      '  return "Ready";',
      '}',
    ],
    tableColumns: ['Call', 'Guard 1 (!user)', 'Guard 2 (empty)', 'Return Value'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Case 1: Logged-Out User',
        explanation: 'Exits immediately on line 2 — no need to mentally track nested `else` blocks.',
        tableRows: [['(null, [item])', 'Triggers -> exit', 'Skipped', '"Login required"']],
      },
      {
        activeLine: 3,
        phaseLabel: 'Case 2: Empty Cart',
        explanation: 'User is valid, so Guard 1 passes; Guard 2 exits cleanly with `"Cart is empty"`.',
        tableRows: [
          ['(null, [item])', 'Triggers -> exit', 'Skipped', '"Login required"'],
          ['(ada, [])', 'Pass', 'Triggers -> exit', '"Cart is empty"'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Case 3: Happy Path',
        explanation: 'Both guards passed, reaching the clean unindented happy path `"Ready"`.',
        tableRows: [
          ['(null, [item])', 'Triggers -> exit', 'Skipped', '"Login required"'],
          ['(ada, [])', 'Pass', 'Triggers -> exit', '"Cart is empty"'],
          ['(ada, [item])', 'Pass', 'Pass', '"Ready"'],
        ],
      },
    ],
  },

  // t36d: Performance (Big-O) & Security
  {
    id: 'vis-t36d-bigo-set',
    topicId: 't36d-performance-security-basics',
    title: 'Big-O Scaling: Nested `O(n²)` vs Hash `Set` `O(n)`',
    subtitle: 'Compare exact operation counts as dataset size grows from 10 to 10,000 items.',
    focus: 'variables-table',
    codeLines: [
      '// O(n²): orders.filter(o => bannedIds.includes(o.uid))',
      '// O(n):  const banned = new Set(bannedIds);',
      '//        orders.filter(o => banned.has(o.uid));',
    ],
    tableColumns: ['Input Size (n)', 'Nested .includes() O(n²)', 'Set .has() O(n)', 'Speedup'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Small Dataset (n = 10)',
        explanation: 'At 10 items both feel instant (100 vs 20 checks) — which is why quadratic bugs hide during local dev!',
        tableRows: [['10 items', '100 checks', '20 checks', '5x']],
      },
      {
        activeLine: 2,
        phaseLabel: 'Medium Dataset (n = 1,000)',
        explanation: 'At 1,000 items, `O(n²)` jumps to 1,000,000 checks while `Set` takes only 2,000.',
        tableRows: [
          ['10 items', '100 checks', '20 checks', '5x'],
          ['1,000 items', '1,000,000 checks', '2,000 checks', '500x'],
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Production Scale (n = 10,000)',
        explanation: 'At 10,000 items, nested `.includes()` freezes the browser tab with 100 MILLION comparisons; `Set` finishes in ~2ms.',
        tableRows: [
          ['10 items', '100 checks', '20 checks', '5x'],
          ['1,000 items', '1,000,000 checks', '2,000 checks', '500x'],
          ['10,000 items', '100,000,000 checks (Freeze!)', '20,000 checks (~2ms)', '5,000x'],
        ],
      },
    ],
  },
];
