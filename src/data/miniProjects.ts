import type { DifficultyTier } from '../types/topic';

export interface ProjectMilestone {
  id: string;
  step: number;
  title: string;
  task: string;
}

export interface ProjectTestCase {
  id: string;
  label: string;
  /**
   * Async JS snippet executed inside the sandboxed project iframe after learner code runs.
   * Must return `{ pass: boolean, detail: string }`.
   */
  script: string;
}

export interface MiniProject {
  id: string;
  number: number;
  title: string;
  tier: DifficultyTier;
  unlockGroupLabel: string;
  unlockTopicIds: string[];
  requiredConcepts: string[];
  summary: string;
  functionalRequirements: string[];
  milestones: ProjectMilestone[];
  commonMistakes: string[];
  hints: [string, string, string];
  evaluationChecklist: Array<{ id: string; label: string }>;
  /** Optional sandbox prelude (e.g. offline mock fetch for Weather Dashboard) */
  sandboxPreludeJs?: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  testCases: ProjectTestCase[];
}

export const MINI_PROJECTS: MiniProject[] = [
  {
    id: 'proj-calculator',
    number: 1,
    title: 'Smart Calculator',
    tier: 'Basic',
    unlockGroupLabel: 'After Section 1 & DOM Basics',
    unlockTopicIds: ['t01-variables-hoisting', 't03-operators-equality', 't24-events-forms-prevent'],
    requiredConcepts: ['Variables & state', 'Operators & safe math', 'Functions', 'DOM Event Delegation', 'Number formatting'],
    summary:
      'Build a responsive calculator with a keypad, DEL, RESET, "=", keyboard-safe math evaluation (no eval), and comma-formatted numbers like 399,981.',
    functionalRequirements: [
      'Clicking digits (0-9) and decimal (.) builds the current operand shown in #display.',
      'Formatting displays thousands separators (e.g., 399981 -> "399,981").',
      'Operators (+, -, *, /) store previous value and compute accurately when "=" is clicked.',
      'DEL removes the last character; RESET clears state back to "0".',
      'Divide-by-zero displays "Error" instead of Infinity or NaN.',
    ],
    milestones: [
      { id: 'm1', step: 1, title: 'State & Formatter', task: 'Track `current`, `previous`, and `operator`, and write `formatDisplay(val)` using `Number(val).toLocaleString("en-US")`.' },
      { id: 'm2', step: 2, title: 'Event Delegation on Keypad', task: 'Attach one click listener to `#keypad` and read `btn.dataset.key` / `btn.dataset.action`.' },
      { id: 'm3', step: 3, title: 'Safe Computation Helper', task: 'Write `compute(a, b, op)` using `switch` (never `eval()`), guarding `b === 0` for `/`.' },
      { id: 'm4', step: 4, title: 'DEL & RESET Edge Cases', task: 'Ensure `DEL` on a 1-digit number resets to `"0"` and `RESET` clears all three state fields.' },
    ],
    commonMistakes: [
      'Using `eval(display.textContent)` — unsafe and breaks on formatted commas.',
      'Allowing multiple decimal points like `"12.3.4"`.',
      'Forgetting to handle `0 / 0` or `5 / 0` cleanly.',
    ],
    hints: [
      'Keep raw unformatted numeric strings in state (`"399981"`) and format ONLY when rendering to `#display`.',
      'In `#keypad` click handler: `const btn = e.target.closest("button"); if (!btn) return;`',
      'In `formatNumber(str)`: split on `.`, format integer part with `Number(intPart).toLocaleString("en-US")`, and re-attach decimal part if present.',
    ],
    evaluationChecklist: [
      { id: 'c1', label: 'Numbers format with commas (e.g., 399,981)' },
      { id: 'c2', label: 'DEL removes one digit and RESET clears to 0' },
      { id: 'c3', label: 'No eval() used anywhere in script.js' },
      { id: 'c4', label: 'Division by zero shows a clean error instead of Infinity' },
    ],
    starterHtml: `<div class="calc">
  <div class="calc-head">
    <span class="brand">calc</span>
    <span class="badge">SMART</span>
  </div>
  <div id="display" class="display" aria-live="polite">0</div>
  <div id="keypad" class="keypad">
    <button data-key="7">7</button><button data-key="8">8</button><button data-key="9">9</button><button data-action="del" class="key-muted">DEL</button>
    <button data-key="4">4</button><button data-key="5">5</button><button data-key="6">6</button><button data-op="+">+</button>
    <button data-key="1">1</button><button data-key="2">2</button><button data-key="3">3</button><button data-op="-">-</button>
    <button data-key=".">.</button><button data-key="0">0</button><button data-op="/">/</button><button data-op="*">x</button>
    <button data-action="reset" class="span-2 key-muted">RESET</button>
    <button data-action="equals" class="span-2 key-accent">=</button>
  </div>
</div>`,
    starterCss: `body { background: #1e293b; display: flex; justify-content: center; padding: 16px; font-family: system-ui, sans-serif; }
.calc { width: 100%; max-width: 310px; }
.calc-head { display: flex; justify-content: space-between; align-items: center; color: #f8fafc; margin-bottom: 10px; }
.brand { font-weight: 800; font-size: 18px; }
.badge { font-size: 10px; letter-spacing: 0.08em; color: #94a3b8; }
.display { background: #0f172a; color: #ffffff; border-radius: 10px; padding: 16px; text-align: right; font-size: 28px; font-weight: 700; margin-bottom: 12px; font-variant-numeric: tabular-nums; overflow-x: auto; }
.keypad { background: #0f172a; padding: 12px; border-radius: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
button { border: 0; border-radius: 7px; padding: 12px 0; font-size: 15px; font-weight: 700; background: #e2e8f0; color: #0f172a; cursor: pointer; }
button:hover { opacity: 0.9; }
.key-muted { background: #475569; color: #ffffff; font-size: 13px; }
.key-accent { background: #dc2626; color: #ffffff; }
.span-2 { grid-column: span 2; }`,
    starterJs: `const displayEl = document.getElementById('display');
const keypadEl = document.getElementById('keypad');

let current = '0';
let previous = null;
let operator = null;

function formatDisplay(raw) {
  if (raw === 'Error') return 'Error';
  const [intPart, decPart] = String(raw).split('.');
  const formattedInt = Number(intPart || 0).toLocaleString('en-US');
  return decPart !== undefined ? formattedInt + '.' + decPart : formattedInt;
}

function render() {
  displayEl.textContent = formatDisplay(current);
}

// TODO Milestone 1-4: Handle digit keys, operators, '=', DEL, and RESET
keypadEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const key = btn.dataset.key;
  const op = btn.dataset.op;
  const action = btn.dataset.action;

  if (key) {
    if (key === '.' && current.includes('.')) return;
    current = current === '0' && key !== '.' ? key : current + key;
  }
  // TODO: Implement op, action === 'equals', action === 'del', action === 'reset'
  render();
});

render();`,
    testCases: [
      {
        id: 'calc-1',
        label: 'Formats multi-digit number with commas (399,981)',
        script: `(() => {
          document.querySelector('[data-action="reset"]')?.click();
          for (const d of ['3','9','9','9','8','1']) document.querySelector('[data-key="'+d+'"]').click();
          const txt = document.getElementById('display').textContent.trim();
          return { pass: txt === '399,981', detail: 'Display shows: ' + txt };
        })()`,
      },
      {
        id: 'calc-2',
        label: 'Computes 12 + 30 = 42',
        script: `(() => {
          document.querySelector('[data-action="reset"]')?.click();
          ['1','2'].forEach(d => document.querySelector('[data-key="'+d+'"]').click());
          document.querySelector('[data-op="+"]').click();
          ['3','0'].forEach(d => document.querySelector('[data-key="'+d+'"]').click());
          document.querySelector('[data-action="equals"]').click();
          const txt = document.getElementById('display').textContent.trim();
          return { pass: txt === '42', detail: 'Display shows: ' + txt };
        })()`,
      },
      {
        id: 'calc-3',
        label: 'DEL removes last digit & RESET returns to 0',
        script: `(() => {
          document.querySelector('[data-action="reset"]')?.click();
          ['5','8'].forEach(d => document.querySelector('[data-key="'+d+'"]').click());
          document.querySelector('[data-action="del"]').click();
          const afterDel = document.getElementById('display').textContent.trim();
          document.querySelector('[data-action="reset"]').click();
          const afterReset = document.getElementById('display').textContent.trim();
          return { pass: afterDel === '5' && afterReset === '0', detail: 'afterDel=' + afterDel + ', afterReset=' + afterReset };
        })()`,
      },
    ],
  },

  {
    id: 'proj-todo',
    number: 2,
    title: 'Task Manager / Todo',
    tier: 'Basic',
    unlockGroupLabel: 'After Section 2 & Events',
    unlockTopicIds: ['t07-foreach-map', 't08-filter-find-index', 't25-event-bubbling-delegation'],
    requiredConcepts: ['Arrays of Objects', 'filter / map', 'Event Delegation', 'Timestamps', 'Live Counters'],
    summary:
      'Build a daily workspace task manager with task input, creation timestamp, Done/Undo toggle, Delete, live Total/Done/Left counters, and Clear All.',
    functionalRequirements: [
      'Submitting `#todo-form` adds a new task with `{ id, text, done: false, createdAt }` (ignoring blank text).',
      'Each item shows its title, timestamp, a Done/Undo toggle button, and a Delete button.',
      'Counters `#count-total`, `#count-done`, and `#count-left` update accurately after every action.',
      '`#clear-all` empties the list and resets counters to 0.',
    ],
    milestones: [
      { id: 'm1', step: 1, title: 'Data Model & Add Form', task: 'Store tasks in an array and push new task objects on form submit with `e.preventDefault()`.' },
      { id: 'm2', step: 2, title: 'Render List Safely', task: 'Render tasks into `#todo-list` using `textContent` or escaped HTML with `data-id` and `data-action` attributes.' },
      { id: 'm3', step: 3, title: 'Toggle Done/Undo & Delete', task: 'Use one delegated click listener on `#todo-list` to toggle `done` or filter out deleted tasks.' },
      { id: 'm4', step: 4, title: 'Live Counters & Clear All', task: 'Derive `total`, `done`, and `left` counts from the array on every render and wire `#clear-all`.' },
    ],
    commonMistakes: [
      'Forgetting `e.preventDefault()` on form submit, causing iframe reload.',
      'Storing separate counter numbers manually instead of computing them from `tasks.filter(t => t.done).length`.',
      'Rendering untrusted task text with raw `innerHTML` (XSS risk).',
    ],
    hints: [
      'Derive counts cleanly inside `render()`: `const done = tasks.filter(t => t.done).length; const left = tasks.length - done;`',
      'Use `tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)` for toggling.',
      'Use `tasks = tasks.filter(t => t.id !== id)` for deleting.',
    ],
    evaluationChecklist: [
      { id: 'c1', label: 'Empty/whitespace tasks are rejected cleanly' },
      { id: 'c2', label: 'Each task displays a timestamp and toggles between Done and Undo' },
      { id: 'c3', label: 'Total / Done / Left counters always stay in sync' },
      { id: 'c4', label: 'Clear All removes every task immediately' },
    ],
    starterHtml: `<div class="app">
  <h2>Task Manager</h2>
  <form id="todo-form" class="row">
    <input id="todo-input" type="text" placeholder="Add a workspace task..." />
    <button type="submit">Add</button>
  </form>
  <div class="stats">
    <span>Total: <strong id="count-total">0</strong></span>
    <span>Done: <strong id="count-done">0</strong></span>
    <span>Left: <strong id="count-left">0</strong></span>
    <button id="clear-all" type="button" class="clear-btn">Clear All</button>
  </div>
  <ul id="todo-list" class="list"></ul>
</div>`,
    starterCss: `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 16px; color: #0f172a; }
.app { max-width: 440px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
h2 { margin: 0 0 12px; font-size: 18px; }
.row { display: flex; gap: 8px; margin-bottom: 12px; }
input { flex: 1; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; }
button { padding: 8px 12px; border: 0; border-radius: 8px; background: #0369a1; color: #fff; font-weight: 600; font-size: 12px; cursor: pointer; }
.stats { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #475569; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
.clear-btn { margin-left: auto; background: #e2e8f0; color: #334155; }
.list { list-style: none; padding: 0; margin: 12px 0 0; display: flex; flex-direction: column; gap: 8px; }
.item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; }
.item.done .title { text-decoration: line-through; color: #94a3b8; }
.meta { font-size: 10px; color: #64748b; display: block; }
.actions { display: flex; gap: 6px; }
.btn-toggle { background: #059669; }
.btn-del { background: #dc2626; }`,
    starterJs: `const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const listEl = document.getElementById('todo-list');
const clearBtn = document.getElementById('clear-all');
const totalEl = document.getElementById('count-total');
const doneEl = document.getElementById('count-done');
const leftEl = document.getElementById('count-left');

let tasks = [];

function render() {
  // TODO Milestone 2 & 4: Render task items (with data-action="toggle" and data-action="delete") and update Total/Done/Left counters
  totalEl.textContent = String(tasks.length);
  doneEl.textContent = String(tasks.filter((t) => t.done).length);
  leftEl.textContent = String(tasks.filter((t) => !t.done).length);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: String(Date.now() + Math.random()), text, done: false, createdAt: new Date().toLocaleTimeString() });
  input.value = '';
  render();
});

// TODO Milestone 3: Add event delegation on listEl for toggle/delete and wire clearBtn
render();`,
    testCases: [
      {
        id: 'todo-1',
        label: 'Adding 2 tasks updates Total=2, Left=2 and renders list items',
        script: `(() => {
          const inp = document.getElementById('todo-input');
          const form = document.getElementById('todo-form');
          inp.value = 'Write tests'; form.dispatchEvent(new Event('submit', { cancelable: true }));
          inp.value = 'Deploy app'; form.dispatchEvent(new Event('submit', { cancelable: true }));
          const total = document.getElementById('count-total').textContent.trim();
          const items = document.querySelectorAll('#todo-list li').length;
          return { pass: total === '2' && items === 2, detail: 'total=' + total + ', rendered li=' + items };
        })()`,
      },
      {
        id: 'todo-2',
        label: 'Toggling Done updates Done=1, Left=1',
        script: `(() => {
          const toggleBtn = document.querySelector('#todo-list [data-action="toggle"]');
          if (!toggleBtn) return { pass: false, detail: 'No [data-action="toggle"] button found in #todo-list' };
          toggleBtn.click();
          const done = document.getElementById('count-done').textContent.trim();
          const left = document.getElementById('count-left').textContent.trim();
          return { pass: done === '1' && left === '1', detail: 'done=' + done + ', left=' + left };
        })()`,
      },
      {
        id: 'todo-3',
        label: 'Clear All resets Total, Done, Left to 0',
        script: `(() => {
          document.getElementById('clear-all').click();
          const total = document.getElementById('count-total').textContent.trim();
          const items = document.querySelectorAll('#todo-list li').length;
          return { pass: total === '0' && items === 0, detail: 'total=' + total + ', items=' + items };
        })()`,
      },
    ],
  },

  {
    id: 'proj-weather',
    number: 3,
    title: 'Weather Dashboard',
    tier: 'Intermediate',
    unlockGroupLabel: 'After Section 7 (Async & Fetch)',
    unlockTopicIds: ['t28-try-catch-finally', 't30-promises-chaining', 't31-async-await-fetch'],
    requiredConcepts: ['fetch() & async/await', 'res.ok HTTP checks', 'Loading & Error states', 'JSON rendering', 'try/catch/finally'],
    summary:
      'Build an async Weather Dashboard with city search, current conditions + 7-day forecast cards, loading indicator, and clean error handling using a real `fetch("/api/weather?city=...")` endpoint.',
    functionalRequirements: [
      'Searching a city calls `await fetch("/api/weather?city=" + encodeURIComponent(city))` (available cities in sandbox API: London, Tokyo, Mumbai, New York, Paris).',
      'Shows a loading state in `#status` while fetching and clears it in `finally`.',
      'Checks `if (!res.ok)` and displays a user-friendly error message for unknown cities (HTTP 404).',
      'Renders current city temperature in `#today-card` and 7 forecast cards in `#forecast-grid`.',
    ],
    milestones: [
      { id: 'm1', step: 1, title: 'Async Fetch Helper', task: 'Write `async function loadWeather(city)` with `try / catch / finally` and check `if (!res.ok) throw new Error(...)`.' },
      { id: 'm2', step: 2, title: 'Today Weather Card', task: 'Render city name, temperature, condition, and humidity into `#today-card`.' },
      { id: 'm3', step: 3, title: '7-Day Forecast Grid', task: 'Map `data.forecast` (7 days) into cards inside `#forecast-grid`.' },
      { id: 'm4', step: 4, title: 'Error & Loading UX', task: 'Show `"Loading..."` before fetch, clear in `finally`, and display `"City not found"` on 404.' },
    ],
    commonMistakes: [
      'Forgetting `if (!res.ok)` so 404 JSON crashes the UI renderer.',
      'Leaving `"Loading..."` stuck on screen when an error occurs (fix with `finally`).',
      'Calling `fetch` without `encodeURIComponent(city)` for multi-word cities like `"New York"`.',
    ],
    hints: [
      'The sandbox intercepts `fetch("/api/weather?city=...")` and returns `{ city, tempC, condition, humidity, forecast: [{ day, tempC, icon }] }` or HTTP 404.',
      'Use `if (!res.ok) throw new Error("City not found: " + city);` before `await res.json()`.',
      'Always clear the loading message in `finally { ... }` unless an error message is shown.',
    ],
    evaluationChecklist: [
      { id: 'c1', label: 'Uses async/await with try/catch/finally' },
      { id: 'c2', label: 'Checks res.ok before parsing JSON' },
      { id: 'c3', label: 'Renders today summary + all 7 forecast day cards' },
      { id: 'c4', label: 'Shows clean error state for unknown city' },
    ],
    sandboxPreludeJs: `
      (function () {
        const DB = {
          london: { city: 'London', tempC: 16, condition: 'Partly Cloudy', humidity: 68, forecast: [
            { day: 'Mon', tempC: 16, cond: 'Cloudy' }, { day: 'Tue', tempC: 18, cond: 'Sunny' },
            { day: 'Wed', tempC: 15, cond: 'Rain' }, { day: 'Thu', tempC: 17, cond: 'Breezy' },
            { day: 'Fri', tempC: 19, cond: 'Clear' }, { day: 'Sat', tempC: 20, cond: 'Sunny' },
            { day: 'Sun', tempC: 17, cond: 'Cloudy' },
          ]},
          tokyo: { city: 'Tokyo', tempC: 24, condition: 'Clear Sky', humidity: 54, forecast: [
            { day: 'Mon', tempC: 24, cond: 'Clear' }, { day: 'Tue', tempC: 25, cond: 'Sunny' },
            { day: 'Wed', tempC: 22, cond: 'Showers' }, { day: 'Thu', tempC: 23, cond: 'Cloudy' },
            { day: 'Fri', tempC: 26, cond: 'Sunny' }, { day: 'Sat', tempC: 27, cond: 'Clear' },
            { day: 'Sun', tempC: 25, cond: 'Breezy' },
          ]},
          mumbai: { city: 'Mumbai', tempC: 31, condition: 'Humid Sun', humidity: 78, forecast: [
            { day: 'Mon', tempC: 31, cond: 'Sunny' }, { day: 'Tue', tempC: 30, cond: 'Rain' },
            { day: 'Wed', tempC: 29, cond: 'Storm' }, { day: 'Thu', tempC: 30, cond: 'Cloudy' },
            { day: 'Fri', tempC: 32, cond: 'Sunny' }, { day: 'Sat', tempC: 31, cond: 'Clear' },
            { day: 'Sun', tempC: 30, cond: 'Showers' },
          ]},
          'new york': { city: 'New York', tempC: 21, condition: 'Crisp Breeze', humidity: 49, forecast: [
            { day: 'Mon', tempC: 21, cond: 'Clear' }, { day: 'Tue', tempC: 22, cond: 'Sunny' },
            { day: 'Wed', tempC: 19, cond: 'Rain' }, { day: 'Thu', tempC: 20, cond: 'Cloudy' },
            { day: 'Fri', tempC: 23, cond: 'Sunny' }, { day: 'Sat', tempC: 24, cond: 'Clear' },
            { day: 'Sun', tempC: 21, cond: 'Breezy' },
          ]},
          paris: { city: 'Paris', tempC: 19, condition: 'Mild Sun', humidity: 58, forecast: [
            { day: 'Mon', tempC: 19, cond: 'Sunny' }, { day: 'Tue', tempC: 20, cond: 'Clear' },
            { day: 'Wed', tempC: 18, cond: 'Cloudy' }, { day: 'Thu', tempC: 17, cond: 'Rain' },
            { day: 'Fri', tempC: 21, cond: 'Sunny' }, { day: 'Sat', tempC: 22, cond: 'Clear' },
            { day: 'Sun', tempC: 20, cond: 'Mild' },
          ]},
        };
        const origFetch = window.fetch ? window.fetch.bind(window) : null;
        window.fetch = async function (url, opts) {
          const str = String(url);
          if (str.startsWith('/api/weather')) {
            const match = str.match(/[?&]city=([^&]+)/);
            const rawCity = match ? decodeURIComponent(match[1]).trim().toLowerCase() : '';
            await new Promise((r) => setTimeout(r, 40));
            const record = DB[rawCity];
            if (!record) {
              return { ok: false, status: 404, json: async () => ({ error: 'City not found' }) };
            }
            return { ok: true, status: 200, json: async () => record };
          }
          if (origFetch) return origFetch(url, opts);
          throw new Error('Offline sandbox only mocks /api/weather?city=...');
        };
      })();
    `,
    starterHtml: `<div class="dash">
  <form id="search-form" class="search">
    <input id="city-input" value="Tokyo" placeholder="Search city (London, Tokyo, Mumbai, Paris, New York)" />
    <button type="submit">Search</button>
  </form>
  <div id="status" class="status"></div>
  <section id="today-card" class="today"></section>
  <section id="forecast-grid" class="grid"></section>
</div>`,
    starterCss: `body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 14px; }
.dash { max-width: 520px; margin: 0 auto; }
.search { display: flex; gap: 8px; margin-bottom: 10px; }
input { flex: 1; padding: 8px 10px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #fff; font-size: 13px; }
button { padding: 8px 14px; border: 0; border-radius: 8px; background: #0284c7; color: #fff; font-weight: 600; font-size: 12px; cursor: pointer; }
.status { font-size: 12px; min-height: 18px; color: #38bdf8; margin-bottom: 8px; }
.status.error { color: #fda4af; }
.today { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px; margin-bottom: 12px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(64px, 1fr)); gap: 6px; }
.day-card { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 6px; text-align: center; font-size: 11px; }`,
    starterJs: `const form = document.getElementById('search-form');
const input = document.getElementById('city-input');
const statusEl = document.getElementById('status');
const todayEl = document.getElementById('today-card');
const gridEl = document.getElementById('forecast-grid');

async function loadWeather(city) {
  statusEl.className = 'status';
  statusEl.textContent = 'Loading weather...';
  try {
    const res = await fetch('/api/weather?city=' + encodeURIComponent(city));
    // TODO Milestone 1-4: Check res.ok, parse JSON, render todayEl and 7 .day-card items in gridEl
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    todayEl.textContent = data.city + ' — ' + data.tempC + '°C';
  } catch (err) {
    statusEl.className = 'status error';
    statusEl.textContent = err.message;
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value.trim()) loadWeather(input.value.trim());
});`,
    testCases: [
      {
        id: 'w-1',
        label: 'Loads Tokyo current temp and 7 forecast cards',
        script: `(async () => {
          document.getElementById('city-input').value = 'Tokyo';
          document.getElementById('search-form').dispatchEvent(new Event('submit', { cancelable: true }));
          await new Promise((r) => setTimeout(r, 120));
          const today = document.getElementById('today-card').textContent;
          const cards = document.querySelectorAll('#forecast-grid .day-card').length;
          return { pass: today.includes('Tokyo') && cards === 7, detail: 'today="' + today.trim() + '", forecastCards=' + cards };
        })()`,
      },
      {
        id: 'w-2',
        label: 'Shows error message on unknown city (HTTP 404)',
        script: `(async () => {
          document.getElementById('city-input').value = 'Atlantis';
          document.getElementById('search-form').dispatchEvent(new Event('submit', { cancelable: true }));
          await new Promise((r) => setTimeout(r, 120));
          const status = document.getElementById('status').textContent.toLowerCase();
          return { pass: status.includes('not found') || status.includes('error'), detail: 'status="' + status + '"' };
        })()`,
      },
    ],
  },

  {
    id: 'proj-expense',
    number: 4,
    title: 'Expense Tracker',
    tier: 'Intermediate',
    unlockGroupLabel: 'After Section 4 & Web Storage',
    unlockTopicIds: ['t09-some-every-reduce', 't15-array-of-objects', 't27-json-web-storage'],
    requiredConcepts: ['reduce() summaries', 'Category filtering', 'CRUD edits', 'Budget warning state', 'localStorage JSON'],
    summary:
      'Build a personal finance Expense Tracker with income/expense entries, category filter, net balance summary, budget limit warning, delete, and localStorage persistence.',
    functionalRequirements: [
      'Add transactions with `{ id, title, amount, type: "income" | "expense", category }`.',
      'Compute and render `#sum-income`, `#sum-expense`, and `#sum-balance` using `.reduce()`.',
      'Filter displayed rows via `#filter-category` without losing stored entries.',
      'Display a warning in `#budget-alert` when total expenses exceed the monthly budget (`500`).',
      'Persist entries to `localStorage` under `"jslab_expenses"` wrapped in safe `try/catch`.',
    ],
    milestones: [
      { id: 'm1', step: 1, title: 'Safe Storage Load/Save', task: 'Read/write JSON in `localStorage` with `try/catch` fallback to `[]`.' },
      { id: 'm2', step: 2, title: 'Income / Expense / Balance Reducers', task: 'Calculate totals cleanly with `.reduce()` and show budget warning when expenses > 500.' },
      { id: 'm3', step: 3, title: 'Category Filter & Delete', task: 'Filter visible transactions by `#filter-category` and support deleting any row by `id`.' },
    ],
    commonMistakes: [
      'Storing amounts as strings (`"25"`) so `.reduce()` concatenates instead of summing.',
      'Overwriting the master array when applying a category filter.',
      'Forgetting `try/catch` around `JSON.parse(localStorage.getItem(...))`.',
    ],
    hints: [
      'Always coerce form input with `const amount = Number(amountInput.value); if (!Number.isFinite(amount) || amount <= 0) return;`',
      'Keep `allTransactions` untouched and derive `const visible = activeCat === "all" ? allTransactions : allTransactions.filter(t => t.category === activeCat);`',
      'Use `alertEl.textContent = expenseTotal > BUDGET ? "Over budget!" : "Within budget";`.',
    ],
    evaluationChecklist: [
      { id: 'c1', label: 'Income, Expense, and Net Balance compute accurately' },
      { id: 'c2', label: 'Category filter filters displayed list without mutating data' },
      { id: 'c3', label: 'Budget warning triggers when expenses exceed limit' },
      { id: 'c4', label: 'Transactions persist across reloads via localStorage' },
    ],
    starterHtml: `<div class="wrap">
  <div class="cards">
    <div>Income: <strong id="sum-income">$0</strong></div>
    <div>Expense: <strong id="sum-expense">$0</strong></div>
    <div>Balance: <strong id="sum-balance">$0</strong></div>
  </div>
  <div id="budget-alert" class="alert">Within budget ($500 limit)</div>
  <form id="tx-form" class="row">
    <input id="tx-title" placeholder="Description" />
    <input id="tx-amount" type="number" step="0.01" placeholder="Amount" />
    <select id="tx-type"><option value="expense">Expense</option><option value="income">Income</option></select>
    <select id="tx-cat"><option value="food">Food</option><option value="bills">Bills</option><option value="salary">Salary</option></select>
    <button type="submit">Add</button>
  </form>
  <div class="filter-row">
    <label>Filter: <select id="filter-category"><option value="all">All</option><option value="food">Food</option><option value="bills">Bills</option><option value="salary">Salary</option></select></label>
  </div>
  <ul id="tx-list" class="list"></ul>
</div>`,
    starterCss: `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 14px; color: #0f172a; }
.wrap { max-width: 540px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; font-size: 12px; }
.cards div { background: #f1f5f9; padding: 8px; border-radius: 8px; }
.alert { font-size: 12px; padding: 6px 10px; border-radius: 6px; background: #ecfdf5; color: #065f46; margin-bottom: 10px; }
.alert.over { background: #fff1f2; color: #9f1239; font-weight: 700; }
.row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
input, select { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; }
button { padding: 6px 12px; border: 0; border-radius: 6px; background: #0f172a; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
.filter-row { font-size: 12px; margin-bottom: 8px; }
.list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.list li { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; }`,
    starterJs: `const BUDGET_LIMIT = 500;
let transactions = [];

const form = document.getElementById('tx-form');
const filterEl = document.getElementById('filter-category');
const listEl = document.getElementById('tx-list');
const incomeEl = document.getElementById('sum-income');
const expenseEl = document.getElementById('sum-expense');
const balanceEl = document.getElementById('sum-balance');
const alertEl = document.getElementById('budget-alert');

function render() {
  // TODO: Compute income, expense, balance with .reduce(), check BUDGET_LIMIT, filter by filterEl.value, and render listEl
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: Read #tx-title, #tx-amount, #tx-type, #tx-cat, push to transactions, save to localStorage, and call render()
});

filterEl.addEventListener('change', render);
render();`,
    testCases: [
      {
        id: 'exp-1',
        label: 'Computes Income $1000, Expense $600, Balance $400 and triggers budget alert',
        script: `(() => {
          const title = document.getElementById('tx-title');
          const amt = document.getElementById('tx-amount');
          const type = document.getElementById('tx-type');
          const cat = document.getElementById('tx-cat');
          const form = document.getElementById('tx-form');
          title.value = 'Paycheck'; amt.value = '1000'; type.value = 'income'; cat.value = 'salary';
          form.dispatchEvent(new Event('submit', { cancelable: true }));
          title.value = 'Rent'; amt.value = '600'; type.value = 'expense'; cat.value = 'bills';
          form.dispatchEvent(new Event('submit', { cancelable: true }));
          const inc = document.getElementById('sum-income').textContent;
          const exp = document.getElementById('sum-expense').textContent;
          const bal = document.getElementById('sum-balance').textContent;
          const alertTxt = document.getElementById('budget-alert').textContent.toLowerCase();
          return {
            pass: inc.includes('1000') && exp.includes('600') && bal.includes('400') && (alertTxt.includes('over') || alertTxt.includes('exceed')),
            detail: 'inc=' + inc + ', exp=' + exp + ', bal=' + bal + ', alert=' + alertTxt,
          };
        })()`,
      },
    ],
  },

  {
    id: 'proj-student-mgmt',
    number: 5,
    title: 'Student Management System',
    tier: 'Advanced',
    unlockGroupLabel: 'Capstone (After Sections 1–8)',
    unlockTopicIds: ['t08-filter-find-index', 't15-array-of-objects', 't25-event-bubbling-delegation', 't36c-clean-code-organization'],
    requiredConcepts: ['CRUD state', 'Live Search', 'Multi-column Sorting', 'Pagination', 'Summary KPI Cards'],
    summary:
      'Build a full CRUD Student Management Dashboard featuring KPI stats cards, live search, score sorting, Pass/Fail status badges, pagination, and add/delete controls.',
    functionalRequirements: [
      'Displays Total Students, Average Score, and Pass Rate (`score >= 60`) in `#kpi-total`, `#kpi-avg`, `#kpi-pass`.',
      'Live search `#search-student` filters rows by student name case-insensitively.',
      'Clicking `#sort-score` toggles sorting rows by score descending/ascending without mutating original array.',
      'Paginates results (3 rows per page) with `#prev-page`, `#next-page`, and `#page-info`.',
      'Supports adding a new student (`name`, `score 0..100`) and deleting existing students.',
    ],
    milestones: [
      { id: 'm1', step: 1, title: 'Derive Pipeline (Filter -> Sort -> Paginate)', task: 'Build a clean pure pipeline `getVisibleStudents()` so search, sort, and pagination compose cleanly.' },
      { id: 'm2', step: 2, title: 'KPI Summary Cards', task: 'Compute total count, average score, and pass rate from the full student array.' },
      { id: 'm3', step: 3, title: 'Table Rendering & Delete Delegation', task: 'Render rows into `#student-tbody` with Pass/Fail status and delegated delete buttons.' },
      { id: 'm4', step: 4, title: 'Add Student Validation & Pagination Guards', task: 'Validate score `0..100` on submit and disable Prev/Next on boundary pages.' },
    ],
    commonMistakes: [
      'Calling `.sort()` directly on `students` instead of `[...filtered].sort(...)`.',
      'Forgetting to reset `page = 1` when the search query changes (leaving user on an empty page 3).',
      'Dividing by `0` when all students are deleted (NaN average score).',
    ],
    hints: [
      'Compute `const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)); page = Math.min(page, totalPages);`',
      'Slice the current page via `sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)`.',
      'Reset `page = 1` inside the search input listener.',
    ],
    evaluationChecklist: [
      { id: 'c1', label: 'KPI Total, Average, and Pass Rate stay accurate (even when empty)' },
      { id: 'c2', label: 'Live search filters case-insensitively and resets to Page 1' },
      { id: 'c3', label: 'Score sort works without mutating original data' },
      { id: 'c4', label: 'Pagination displays 3 students per page with Prev/Next controls' },
    ],
    starterHtml: `<div class="portal">
  <div class="kpis">
    <div>Total: <strong id="kpi-total">0</strong></div>
    <div>Avg Score: <strong id="kpi-avg">0</strong></div>
    <div>Pass Rate: <strong id="kpi-pass">0%</strong></div>
  </div>
  <form id="add-form" class="bar">
    <input id="stu-name" placeholder="Student name" />
    <input id="stu-score" type="number" min="0" max="100" placeholder="Score (0-100)" />
    <button type="submit">Add Student</button>
  </form>
  <div class="bar">
    <input id="search-student" placeholder="Search by name..." />
    <button id="sort-score" type="button">Sort by Score</button>
  </div>
  <table>
    <thead><tr><th>Name</th><th>Score</th><th>Status</th><th>Action</th></tr></thead>
    <tbody id="student-tbody"></tbody>
  </table>
  <div class="pager">
    <button id="prev-page" type="button">Prev</button>
    <span id="page-info">Page 1 of 1</span>
    <button id="next-page" type="button">Next</button>
  </div>
</div>`,
    starterCss: `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 14px; color: #0f172a; }
.portal { max-width: 560px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; font-size: 12px; }
.kpis div { background: #f1f5f9; padding: 8px; border-radius: 8px; }
.bar { display: flex; gap: 6px; margin-bottom: 10px; }
input { flex: 1; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; }
button { padding: 6px 10px; border: 0; border-radius: 6px; background: #0369a1; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 10px; }
th, td { text-align: left; padding: 7px 6px; border-bottom: 1px solid #e2e8f0; }
.pager { display: flex; align-items: center; justify-content: space-between; font-size: 12px; }`,
    starterJs: `const PAGE_SIZE = 3;
let students = [
  { id: 1, name: 'Aarav Patel', score: 92 },
  { id: 2, name: 'Elena Brooks', score: 54 },
  { id: 3, name: 'Kenji Sato', score: 78 },
  { id: 4, name: 'Maya Lin', score: 86 },
];
let searchQuery = '';
let sortDesc = true;
let page = 1;

const tbody = document.getElementById('student-tbody');
const kpiTotal = document.getElementById('kpi-total');
const kpiAvg = document.getElementById('kpi-avg');
const kpiPass = document.getElementById('kpi-pass');
const pageInfo = document.getElementById('page-info');

function render() {
  // TODO Milestone 1-4: Update KPIs, filter by searchQuery, sort immutably, paginate (3/page), and render tbody
  kpiTotal.textContent = String(students.length);
}

document.getElementById('search-student').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  page = 1;
  render();
});

render();`,
    testCases: [
      {
        id: 'stu-1',
        label: 'Renders 3 rows on Page 1 with accurate KPI stats',
        script: `(() => {
          const rows = document.querySelectorAll('#student-tbody tr').length;
          const total = document.getElementById('kpi-total').textContent.trim();
          const avg = document.getElementById('kpi-avg').textContent.trim();
          return { pass: rows === 3 && total === '4' && Number(avg) > 70, detail: 'rows=' + rows + ', total=' + total + ', avg=' + avg };
        })()`,
      },
      {
        id: 'stu-2',
        label: 'Search filters student rows by name',
        script: `(() => {
          const s = document.getElementById('search-student');
          s.value = 'maya';
          s.dispatchEvent(new Event('input'));
          const rows = document.querySelectorAll('#student-tbody tr').length;
          return { pass: rows === 1, detail: 'filtered rows=' + rows };
        })()`,
      },
    ],
  },
  {
    id: 'proj-shopping-cart',
    number: 6,
    title: 'Shopping Cart',
    tier: 'Intermediate',
    unlockGroupLabel: 'After Section 4 (Arrays, Objects & State)',
    unlockTopicIds: ['t09-some-every-reduce', 't14-object-notations-methods', 't25-event-bubbling-delegation'],
    requiredConcepts: ['Event delegation', 'Immutable array updates', 'reduce() totals', 'Conditional UI state', 'Currency formatting'],
    summary:
      'Build an interactive e-commerce Shopping Cart with a product catalog, Add-to-Cart actions, quantity +/- controls, item removal, subtotal/tax/shipping calculation, and a free-shipping threshold banner.',
    functionalRequirements: [
      'Clicking an "Add" button (`[data-add-id]`) adds the product to the cart or increments its quantity if already present.',
      'Quantity `+` (`[data-inc-id]`) and `-` (`[data-dec-id]`) buttons update quantities; decrementing at qty 1 removes the item.',
      'Subtotal (`#cart-subtotal`), 10% tax (`#cart-tax`), and final total (`#cart-total`) recompute via `.reduce()` on every state change.',
      'Shipping banner (`#shipping-banner`) shows remaining spend for free shipping ($100 threshold) or `"Free shipping unlocked!"`.',
    ],
    milestones: [
      { id: 'm1', step: 1, title: 'Catalog & Add Handler', task: 'Render the catalog items and use event delegation on `#catalog` to add or increment items in `cart`.' },
      { id: 'm2', step: 2, title: 'Quantity +/- & Remove', task: 'Handle `[data-inc-id]` and `[data-dec-id]` inside `#cart-list`, removing any item whose quantity hits `0`.' },
      { id: 'm3', step: 3, title: 'Reduce Totals & Tax', task: 'Compute subtotal via `cart.reduce(...)`, calculate 10% tax, and render formatted `$XX.XX` figures.' },
      { id: 'm4', step: 4, title: 'Free Shipping Progress', task: 'Update `#shipping-banner` with either `"Free shipping unlocked!"` (>= $100) or `"Add $X.XX more for free shipping"`. ' },
    ],
    commonMistakes: [
      'Mutating nested item objects inside `catalog` directly instead of copying `{ ...product, qty: 1 }` into `cart`.',
      'Leaving floating-point artifacts like `$29.990000000000002` instead of formatting with `.toFixed(2)`.',
      'Attaching click listeners inside `render()` without delegating, creating duplicate handlers on every re-render.',
    ],
    hints: [
      'Keep `cart` as an array of `{ id, name, price, qty }`. Check `cart.find(item => item.id === id)` before adding.',
      'Compute `const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);` and `const tax = subtotal * 0.1;`.',
      'Use a single delegated click listener on `#cart-list` that reads `e.target.dataset.incId` and `e.target.dataset.decId`.',
    ],
    evaluationChecklist: [
      { id: 'c1', label: 'Adding same product twice increments quantity instead of duplicating row' },
      { id: 'c2', label: 'Decrementing quantity to 0 removes the item cleanly' },
      { id: 'c3', label: 'Subtotal, 10% tax, and final total update with 2-decimal formatting' },
      { id: 'c4', label: 'Free shipping banner flips automatically at $100 subtotal' },
    ],
    starterHtml: `<div class="shop">
  <div id="shipping-banner" class="banner">Add $100.00 more for free shipping</div>
  <div class="cols">
    <section>
      <h3>Catalog</h3>
      <div id="catalog" class="stack"></div>
    </section>
    <section>
      <h3>Cart (<span id="cart-count">0</span>)</h3>
      <ul id="cart-list" class="stack"></ul>
      <div class="totals">
        <div>Subtotal: <strong id="cart-subtotal">$0.00</strong></div>
        <div>Tax (10%): <strong id="cart-tax">$0.00</strong></div>
        <div>Total: <strong id="cart-total">$0.00</strong></div>
      </div>
    </section>
  </div>
</div>`,
    starterCss: `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 14px; color: #0f172a; }
.shop { max-width: 560px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
.banner { background: #e0f2fe; color: #0c4a6e; font-size: 12px; font-weight: 600; padding: 8px 10px; border-radius: 8px; margin-bottom: 12px; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
h3 { margin: 0 0 8px; font-size: 13px; }
.stack { list-style: none; padding: 0; margin: 0; display: grid; gap: 6px; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 7px 8px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; }
button { padding: 4px 8px; border: 0; border-radius: 6px; background: #0369a1; color: #fff; font-size: 11px; font-weight: 600; cursor: pointer; }
.totals { margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 12px; display: grid; gap: 3px; }`,
    starterJs: `const CATALOG = [
  { id: 'p1', name: 'Mechanical Keyboard', price: 65 },
  { id: 'p2', name: 'USB-C Hub', price: 40 },
  { id: 'p3', name: 'Desk Lamp', price: 30 },
];

let cart = [];

const catalogEl = document.getElementById('catalog');
const cartListEl = document.getElementById('cart-list');
const countEl = document.getElementById('cart-count');
const subtotalEl = document.getElementById('cart-subtotal');
const taxEl = document.getElementById('cart-tax');
const totalEl = document.getElementById('cart-total');
const bannerEl = document.getElementById('shipping-banner');

function renderCatalog() {
  catalogEl.innerHTML = CATALOG.map(
    (p) => '<div class="row"><span>' + p.name + ' ($' + p.price + ')</span><button data-add-id="' + p.id + '">Add</button></div>'
  ).join('');
}

function renderCart() {
  // TODO Milestone 1-4: Render cart items with [data-dec-id]/[data-inc-id], count, subtotal, 10% tax, total, and #shipping-banner
  countEl.textContent = String(cart.reduce((s, i) => s + i.qty, 0));
}

catalogEl.addEventListener('click', (e) => {
  const addId = e.target.dataset.addId;
  if (!addId) return;
  const prod = CATALOG.find((p) => p.id === addId);
  if (!prod) return;
  const existing = cart.find((i) => i.id === addId);
  cart = existing
    ? cart.map((i) => (i.id === addId ? { ...i, qty: i.qty + 1 } : i))
    : [...cart, { ...prod, qty: 1 }];
  renderCart();
});

renderCatalog();
renderCart();`,
    testCases: [
      {
        id: 'cart-1',
        label: 'Adding two products computes accurate subtotal, 10% tax, and free shipping banner',
        script: `(() => {
          document.querySelector('[data-add-id="p1"]').click();
          document.querySelector('[data-add-id="p2"]').click();
          const sub = document.getElementById('cart-subtotal').textContent;
          const tax = document.getElementById('cart-tax').textContent;
          const banner = document.getElementById('shipping-banner').textContent.toLowerCase();
          return {
            pass: sub.includes('105.00') && tax.includes('10.50') && banner.includes('free shipping'),
            detail: 'sub=' + sub + ', tax=' + tax + ', banner=' + banner,
          };
        })()`,
      },
      {
        id: 'cart-2',
        label: 'Adding same item twice increments count without duplicating rows',
        script: `(() => {
          document.querySelector('[data-add-id="p3"]').click();
          document.querySelector('[data-add-id="p3"]').click();
          const rows = document.querySelectorAll('#cart-list li').length;
          const count = Number(document.getElementById('cart-count').textContent);
          return { pass: rows === 3 && count === 4, detail: 'rows=' + rows + ', count=' + count };
        })()`,
      },
    ],
  },
  {
    id: 'proj-search-filter',
    number: 7,
    title: 'Search & Filter App',
    tier: 'Intermediate',
    unlockGroupLabel: 'After Section 8 (Performance & Clean UI State)',
    unlockTopicIds: ['t06-array-basics-methods', 't08-filter-find-index', 't36d-performance-security-basics'],
    requiredConcepts: ['Multi-criteria filtering', 'Case-insensitive search', 'Immutable sorting', 'Result count & empty state', 'Debounce helper'],
    summary:
      'Build a fast course/resource Search & Filter Explorer combining live keyword search, category filter pills, price/rating sorting, live result count, and a clean empty-state reset button.',
    functionalRequirements: [
      'Typing into `#query-input` filters items case-insensitively across both `title` and `tags`.',
      'Selecting a category in `#category-select` (`All`, `Frontend`, `Backend`, `DevOps`) narrows results alongside the search query.',
      'Changing `#sort-select` (`rating`, `price-asc`, `price-desc`) sorts the filtered copy without mutating the source catalog.',
      'Displays exact matching count in `#result-count` and shows `#empty-state` when 0 items match.',
    ],
    milestones: [
      { id: 'm1', step: 1, title: 'Combined Filter Pipeline', task: 'Filter `ITEMS` by both `category` and case-insensitive `query` (matching `title` or any `tag`).' },
      { id: 'm2', step: 2, title: 'Immutable Sort Switch', task: 'Copy the filtered list (`[...filtered]`) and sort by highest rating or price ascending/descending.' },
      { id: 'm3', step: 3, title: 'Cards & Empty State', task: 'Render `.card` elements into `#results-grid`, update `#result-count`, and show `"No matching resources"` when empty.' },
      { id: 'm4', step: 4, title: 'Reset Controls', task: 'Wire `#reset-filters` to restore query=`""`, category=`"All"`, sort=`"rating"` and re-render.' },
    ],
    commonMistakes: [
      'Calling `.sort()` directly on `ITEMS`, permanently scrambling the default order.',
      'Forgetting `.toLowerCase()` on either the user query or item fields, breaking case-insensitive matches.',
      'Filtering only by `title` and forgetting to check `item.tags.some(...)`.',
    ],
    hints: [
      'Normalize once: `const q = query.trim().toLowerCase();` then check `item.title.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q))`.',
      'Chain `.filter(...)` first, then `[...filtered].sort(...)` using a comparator for `rating`, `price-asc`, or `price-desc`.',
      'When `sorted.length === 0`, render an element with `id="empty-state"` so users immediately know why the grid is blank.',
    ],
    evaluationChecklist: [
      { id: 'c1', label: 'Search matches both title and tags case-insensitively' },
      { id: 'c2', label: 'Category dropdown and search query compose cleanly together' },
      { id: 'c3', label: 'Sort modes never mutate the original ITEMS array' },
      { id: 'c4', label: 'Empty state appears when 0 results match and Reset restores all items' },
    ],
    starterHtml: `<div class="explorer">
  <div class="controls">
    <input id="query-input" placeholder="Search title or tag (e.g. react, api, docker)..." />
    <select id="category-select">
      <option value="All">All Categories</option>
      <option value="Frontend">Frontend</option>
      <option value="Backend">Backend</option>
      <option value="DevOps">DevOps</option>
    </select>
    <select id="sort-select">
      <option value="rating">Top Rated</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
    <button id="reset-filters" type="button">Reset</button>
  </div>
  <div class="meta">Showing <strong id="result-count">0</strong> resources</div>
  <div id="results-grid" class="grid"></div>
</div>`,
    starterCss: `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 14px; color: #0f172a; }
.explorer { max-width: 580px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
.controls { display: grid; grid-template-columns: 1.6fr 1fr 1fr auto; gap: 6px; margin-bottom: 10px; }
input, select { padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; background: #fff; }
button { padding: 6px 10px; border: 0; border-radius: 6px; background: #0f172a; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
.meta { font-size: 12px; color: #475569; margin-bottom: 10px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; font-size: 12px; }
.empty { grid-column: 1 / -1; text-align: center; padding: 20px; color: #64748b; border: 1px dashed #cbd5e1; border-radius: 8px; }`,
    starterJs: `const ITEMS = [
  { id: 1, title: 'Modern React Patterns', category: 'Frontend', price: 39, rating: 4.9, tags: ['react', 'hooks', 'ui'] },
  { id: 2, title: 'Node & Express REST APIs', category: 'Backend', price: 29, rating: 4.7, tags: ['node', 'express', 'api'] },
  { id: 3, title: 'Docker for Web Devs', category: 'DevOps', price: 45, rating: 4.8, tags: ['docker', 'containers', 'ci'] },
  { id: 4, title: 'CSS Grid & Layout Mastery', category: 'Frontend', price: 19, rating: 4.6, tags: ['css', 'responsive', 'ui'] },
  { id: 5, title: 'MongoDB Schema Design', category: 'Backend', price: 34, rating: 4.8, tags: ['mongodb', 'database', 'api'] },
];

const queryInput = document.getElementById('query-input');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const resetBtn = document.getElementById('reset-filters');
const countEl = document.getElementById('result-count');
const gridEl = document.getElementById('results-grid');

function render() {
  // TODO Milestone 1-4: Filter ITEMS by query + category, sort copy by sortSelect.value, update #result-count & #results-grid
  countEl.textContent = String(ITEMS.length);
}

queryInput.addEventListener('input', render);
categorySelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);
resetBtn.addEventListener('click', () => {
  queryInput.value = '';
  categorySelect.value = 'All';
  sortSelect.value = 'rating';
  render();
});

render();`,
    testCases: [
      {
        id: 'sf-1',
        label: 'Search matches tags case-insensitively and updates #result-count',
        script: `(() => {
          const inp = document.getElementById('query-input');
          inp.value = 'API';
          inp.dispatchEvent(new Event('input'));
          const cards = document.querySelectorAll('#results-grid .card').length;
          const cnt = document.getElementById('result-count').textContent.trim();
          return { pass: cards === 2 && cnt === '2', detail: 'cards=' + cards + ', count=' + cnt };
        })()`,
      },
      {
        id: 'sf-2',
        label: 'Category filter narrows results and Reset restores all 5 items',
        script: `(() => {
          const cat = document.getElementById('category-select');
          cat.value = 'Frontend';
          cat.dispatchEvent(new Event('change'));
          const noneCards = document.querySelectorAll('#results-grid .card').length;
          document.getElementById('reset-filters').click();
          const allCards = document.querySelectorAll('#results-grid .card').length;
          return { pass: noneCards === 0 && allCards === 5, detail: 'afterCat=' + noneCards + ', afterReset=' + allCards };
        })()`,
      },
    ],
  },
];

