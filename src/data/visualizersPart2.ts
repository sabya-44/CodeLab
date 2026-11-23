import type { VisualizerScenario } from '../types/visualizer';

export const VISUALIZERS_PART_2: VisualizerScenario[] = [
  // 9. Event Loop: Call Stack -> Microtask Queue -> Macrotask Queue (Topic 32)
  {
    id: 'vis-event-loop',
    topicId: 't29-event-loop',
    title: 'Event Loop: Sync Stack -> Microtasks -> Macrotasks',
    subtitle: 'Step through exact priority order: synchronous code drains first, then ALL microtasks, then macrotasks.',
    focus: 'event-loop',
    codeLines: [
      'console.log("1. Sync Start");',
      'setTimeout(() => console.log("4. Macrotask: setTimeout"), 0);',
      'Promise.resolve().then(() => console.log("3. Microtask: Promise.then"));',
      'console.log("2. Sync End");',
    ],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Step 1 · Synchronous Call Stack',
        explanation:
          'Line 1 runs immediately on the Call Stack and logs `"1. Sync Start"`. Both async queues are empty.',
        callStack: [{ frame: 'console.log("1. Sync Start")', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Executing synchronous script on Call Stack',
          activePhase: 'sync',
        },
        consoleOutput: ['1. Sync Start'],
      },
      {
        activeLine: 2,
        phaseLabel: 'Step 2 · Register setTimeout (0ms) -> Macrotask Queue',
        explanation:
          '`setTimeout(..., 0)` delegates the timer to Web APIs. Even with 0ms delay, its callback is placed in the **Macrotask Queue**—it CANNOT interrupt the current Call Stack.',
        callStack: [{ frame: 'setTimeout(cb, 0)', detail: 'hands off to Web API', status: 'running' }],
        eventLoop: {
          webApis: ['Timer(0ms) -> completed immediately'],
          microtasks: [],
          macrotasks: ['() => console.log("4. Macrotask: setTimeout")'],
          loopStatus: 'Timer callback queued in Macrotask Queue (waiting)',
          activePhase: 'sync',
        },
        consoleOutput: ['1. Sync Start'],
      },
      {
        activeLine: 3,
        phaseLabel: 'Step 3 · Resolved Promise.then -> Microtask Queue',
        explanation:
          '`Promise.resolve().then(cb)` schedules its `.then()` callback into the high-priority **Microtask Queue**.',
        callStack: [{ frame: 'Promise.resolve().then(cb)', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: ['() => console.log("3. Microtask: Promise.then")'],
          macrotasks: ['() => console.log("4. Macrotask: setTimeout")'],
          loopStatus: 'Promise callback queued in Microtask Queue (higher priority)',
          activePhase: 'sync',
        },
        consoleOutput: ['1. Sync Start'],
      },
      {
        activeLine: 4,
        phaseLabel: 'Step 4 · Finish Synchronous Script',
        explanation:
          'Line 4 runs synchronously and logs `"2. Sync End"`. Now the Call Stack becomes completely EMPTY—giving the Event Loop its turn!',
        callStack: [{ frame: 'console.log("2. Sync End")', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: ['() => console.log("3. Microtask: Promise.then")'],
          macrotasks: ['() => console.log("4. Macrotask: setTimeout")'],
          loopStatus: 'Call Stack emptying -> Event Loop checks Microtasks FIRST',
          activePhase: 'sync',
        },
        consoleOutput: ['1. Sync Start', '2. Sync End'],
      },
      {
        activeLine: 3,
        phaseLabel: 'Step 5 · Event Loop Drains Microtask Queue FIRST',
        explanation:
          'Even though `setTimeout` was written earlier on line 2, the Event Loop ALWAYS drains the entire **Microtask Queue** before touching any Macrotask. Logs `"3. Microtask: Promise.then"`.',
        callStack: [{ frame: 'Promise.then callback', detail: 'moved from Microtask Queue', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: ['() => console.log("4. Macrotask: setTimeout")'],
          loopStatus: 'Draining Microtask Queue before any Macrotask',
          activePhase: 'microtask',
        },
        consoleOutput: ['1. Sync Start', '2. Sync End', '3. Microtask: Promise.then'],
      },
      {
        activeLine: 2,
        phaseLabel: 'Step 6 · Event Loop Runs Next Macrotask',
        explanation:
          'With both the Call Stack and Microtask Queue empty, the Event Loop dequeues one callback from the **Macrotask Queue** and runs `setTimeout`. Logs `"4. Macrotask: setTimeout"`.',
        callStack: [{ frame: 'setTimeout callback', detail: 'moved from Macrotask Queue', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Executing Macrotask after all Microtasks finished',
          activePhase: 'macrotask',
        },
        consoleOutput: [
          '1. Sync Start',
          '2. Sync End',
          '3. Microtask: Promise.then',
          '4. Macrotask: setTimeout',
        ],
      },
    ],
  },

  // 10. Promise Chaining Flow (Topic 33)
  {
    id: 'vis-promise-chaining',
    topicId: 't30-promises-chaining',
    title: 'Promise State Machine & .then() Value Chaining',
    subtitle: 'See how each `.then()` returns a new Promise carrying the transformed value to the next Microtask.',
    focus: 'event-loop',
    codeLines: [
      'Promise.resolve(100)',
      '  .then((price) => price * 0.9)',
      '  .then((discounted) => discounted + 40)',
      '  .then((finalBill) => console.log("Total:", finalBill))',
      '  .finally(() => console.log("Done"));',
    ],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Step 1 · Promise Fulfilled with 100',
        explanation:
          '`Promise.resolve(100)` creates a settled Promise in state `fulfilled (100)` and schedules the first `.then()` handler in the Microtask Queue.',
        variables: [{ name: 'Promise #1', value: 'fulfilled(100)', changed: true }],
        callStack: [{ frame: 'Global', detail: 'registers .then() chain', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: ['.then(price => price * 0.9) with 100'],
          macrotasks: [],
          loopStatus: 'First .then() queued as a Microtask',
          activePhase: 'sync',
        },
        consoleOutput: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Step 2 · First .then() Runs & Returns 90',
        explanation:
          'Microtask #1 runs with `price = 100`, returns `90`, fulfilling Promise #2 and queueing the second `.then()`.',
        variables: [
          { name: 'price', value: '100', type: 'number' },
          { name: 'returned -> Promise #2', value: 'fulfilled(90)', changed: true },
        ],
        callStack: [{ frame: '.then #1 (price = 100)', detail: 'returns 90', status: 'returning' }],
        eventLoop: {
          webApis: [],
          microtasks: ['.then(discounted => discounted + 40) with 90'],
          macrotasks: [],
          loopStatus: 'Return value 90 chains automatically to next .then()',
          activePhase: 'microtask',
        },
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Step 3 · Second .then() Adds Shipping -> 130',
        explanation:
          'Microtask #2 runs with `discounted = 90`, returns `130`. (If you forgot `return` here, the next step would receive `undefined`!)',
        variables: [
          { name: 'discounted', value: '90', type: 'number' },
          { name: 'returned -> Promise #3', value: 'fulfilled(130)', changed: true },
        ],
        callStack: [{ frame: '.then #2 (discounted = 90)', detail: 'returns 130', status: 'returning' }],
        eventLoop: {
          webApis: [],
          microtasks: ['.then(finalBill => console.log(...)) with 130'],
          macrotasks: [],
          loopStatus: 'Return value 130 passed to final .then()',
          activePhase: 'microtask',
        },
        consoleOutput: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Step 4 · Third .then() Logs Total: 130',
        explanation: 'Logs `"Total: 130"` and queues `.finally()` cleanup.',
        variables: [{ name: 'finalBill', value: '130', type: 'number', changed: true }],
        callStack: [{ frame: '.then #3 (finalBill = 130)', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: ['.finally(() => console.log("Done"))'],
          macrotasks: [],
          loopStatus: 'Final .then() finished -> queuing .finally()',
          activePhase: 'microtask',
        },
        consoleOutput: ['Total: 130'],
      },
      {
        activeLine: 5,
        phaseLabel: 'Step 5 · .finally() Runs Cleanup',
        explanation: '`.finally()` runs regardless of success or error—ideal for turning off loading spinners.',
        callStack: [{ frame: '.finally()', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'All Microtasks complete — Event Loop idle',
          activePhase: 'idle',
        },
        consoleOutput: ['Total: 130', 'Done'],
      },
    ],
  },

  // 11A. async / await Pause & Resume Flow (Topic 34 — Scenario 1)
  {
    id: 'vis-async-await-pause',
    topicId: 't31-async-await-fetch',
    title: 'async / await Flow: Pause, Return to Caller & Resume',
    subtitle: 'See how `await` suspends ONLY the async function without blocking synchronous code in the caller.',
    focus: 'async-await',
    codeLines: [
      'async function loadProfile() {',
      '  console.log("A. Inside async (before await)");',
      '  const user = await Promise.resolve({ name: "Aarav" });',
      '  console.log("C. Resumed after await:", user.name);',
      '}',
      'loadProfile();',
      'console.log("B. Caller continues immediately!");',
    ],
    steps: [
      {
        activeLine: 6,
        phaseLabel: 'Step 1 · Invoke loadProfile()',
        explanation:
          'Calling `loadProfile()` pushes its frame onto the Call Stack and runs synchronously UNTIL the very first `await`.',
        callStack: [
          { frame: 'Global', detail: 'Line 6' },
          { frame: 'loadProfile()', detail: 'running synchronously', status: 'running' },
        ],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Running synchronous portion before first await',
          activePhase: 'sync',
        },
        consoleOutput: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Step 2 · Run Code Before await',
        explanation: 'Line 2 runs immediately like normal synchronous code and prints `"A. Inside async (before await)"`.',
        callStack: [
          { frame: 'Global' },
          { frame: 'loadProfile()', detail: 'Line 2', status: 'running' },
        ],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Sync line inside async function',
          activePhase: 'sync',
        },
        consoleOutput: ['A. Inside async (before await)'],
      },
      {
        activeLine: 3,
        phaseLabel: 'Step 3 · Hit await -> Function PAUSES & Returns Pending Promise!',
        explanation:
          'At `await`, `loadProfile()` **suspends**, saves its local state, queues its continuation (Line 4) into the **Microtask Queue**, and POPS off the Call Stack—handing control right back to Global!',
        callStack: [
          { frame: 'Global', detail: 'resumes immediately after loadProfile()', status: 'running' },
          { frame: 'loadProfile() [SUSPENDED]', detail: 'paused at await (off stack)', status: 'paused' },
        ],
        eventLoop: {
          webApis: [],
          microtasks: ['Resume loadProfile() -> line 4 with { name: "Aarav" }'],
          macrotasks: [],
          loopStatus: 'await suspended loadProfile() -> control returned to caller!',
          activePhase: 'sync',
        },
        consoleOutput: ['A. Inside async (before await)'],
      },
      {
        activeLine: 7,
        phaseLabel: 'Step 4 · Caller Runs Line 7 Before Async Resumes!',
        explanation:
          'Because `loadProfile()` yielded control at `await`, Line 7 runs NOW and logs `"B. Caller continues immediately!"`—proving `await` never freezes the browser!',
        callStack: [{ frame: 'Global', detail: 'Line 7', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: ['Resume loadProfile() -> line 4 with { name: "Aarav" }'],
          macrotasks: [],
          loopStatus: 'Global finishes -> Call Stack empty -> Microtask next',
          activePhase: 'sync',
        },
        consoleOutput: ['A. Inside async (before await)', 'B. Caller continues immediately!'],
      },
      {
        activeLine: 4,
        phaseLabel: 'Step 5 · Promise Settled -> Resume loadProfile() via Microtask',
        explanation:
          'Now the Event Loop resumes `loadProfile()` from the Microtask Queue, assigns `user = { name: "Aarav" }`, and runs Line 4 to log `"C. Resumed after await: Aarav"`.',
        variables: [{ name: 'user', value: '{ name: "Aarav" }', type: 'Object', changed: true }],
        callStack: [{ frame: 'loadProfile() [RESUMED]', detail: 'Line 4', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Async continuation completed cleanly',
          activePhase: 'microtask',
        },
        consoleOutput: [
          'A. Inside async (before await)',
          'B. Caller continues immediately!',
          'C. Resumed after await: Aarav',
        ],
      },
    ],
  },

  // 11B. Full Fetch HTTP Lifecycle Pipeline (Topic 34 — Scenario 2)
  {
    id: 'vis-fetch-http-flow',
    topicId: 't31-async-await-fetch',
    title: 'Fetch Lifecycle: HTTP Request -> Server -> Response -> JSON -> UI',
    subtitle: 'Trace every stage from `fetch()` through HTTP headers, `res.ok` check, `res.json()` parsing, and DOM render.',
    focus: 'fetch-flow',
    codeLines: [
      'async function getWeather(city) {',
      '  const res = await fetch("/api/weather?city=" + city, { headers: { Accept: "application/json" } });',
      '  if (!res.ok) throw new Error("HTTP " + res.status);',
      '  const data = await res.json();',
      '  document.getElementById("temp").textContent = data.city + ": " + data.tempC + "°C";',
      '}',
    ],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Stage 1 · JS Calls fetch()',
        explanation:
          '`fetch()` starts an asynchronous network request in the browser Network engine and returns a pending Promise immediately so the UI stays responsive.',
        fetchFlow: {
          activeStage: 'call',
          method: 'GET',
          url: '/api/weather?city=Pune',
          requestHeaders: { Accept: 'application/json' },
          uiPreview: 'Loading weather for Pune...',
        },
      },
      {
        activeLine: 2,
        phaseLabel: 'Stage 2 · HTTP Request Leaves Browser',
        explanation:
          'The browser sends an HTTP `GET` request over the network with URL `/api/weather?city=Pune` and the `Accept: application/json` header.',
        fetchFlow: {
          activeStage: 'request',
          method: 'GET',
          url: '/api/weather?city=Pune',
          requestHeaders: { Accept: 'application/json', Host: 'api.weather.local' },
          uiPreview: 'Loading weather for Pune...',
        },
      },
      {
        activeLine: 2,
        phaseLabel: 'Stage 3 · Server Processes Request',
        explanation:
          'The backend API server queries weather data for `"Pune"`, serializes the payload into a JSON text string, and prepares an HTTP `200 OK` response.',
        fetchFlow: {
          activeStage: 'server',
          method: 'GET',
          url: '/api/weather?city=Pune',
          requestHeaders: { Accept: 'application/json' },
          uiPreview: 'Waiting for server response...',
        },
      },
      {
        activeLine: 3,
        phaseLabel: 'Stage 4 · HTTP Response Arrives -> Check res.ok!',
        explanation:
          'The `fetch()` Promise fulfills with a `Response` object (`status: 200 OK`, `res.ok: true`). Always guard `if (!res.ok)` because HTTP 404/500 do NOT reject `fetch()`!',
        fetchFlow: {
          activeStage: 'response',
          method: 'GET',
          url: '/api/weather?city=Pune',
          requestHeaders: { Accept: 'application/json' },
          status: '200 OK',
          ok: true,
          responseHeaders: { 'Content-Type': 'application/json; charset=utf-8' },
          rawJson: '{"city":"Pune","tempC":29,"condition":"Sunny"}',
          uiPreview: 'Response headers received (200 OK)...',
        },
      },
      {
        activeLine: 4,
        phaseLabel: 'Stage 5 · await res.json() Parses Body Stream',
        explanation:
          'Reading and parsing the HTTP body stream is ALSO asynchronous (`await res.json()`). It converts the raw JSON string into a real JavaScript object `{ city: "Pune", tempC: 29 }`.',
        fetchFlow: {
          activeStage: 'parse',
          method: 'GET',
          url: '/api/weather?city=Pune',
          requestHeaders: { Accept: 'application/json' },
          status: '200 OK',
          ok: true,
          responseHeaders: { 'Content-Type': 'application/json' },
          rawJson: '{"city":"Pune","tempC":29,"condition":"Sunny"}',
          parsedObject: '{ city: "Pune", tempC: 29, condition: "Sunny" }',
          uiPreview: 'JSON parsed into JS object...',
        },
      },
      {
        activeLine: 5,
        phaseLabel: 'Stage 6 · Safe UI DOM Update (textContent)',
        explanation:
          'Finally, Line 5 writes `"Pune: 29°C"` into `#temp` using `textContent` (XSS-safe), and the browser paints the updated weather card!',
        fetchFlow: {
          activeStage: 'ui',
          method: 'GET',
          url: '/api/weather?city=Pune',
          requestHeaders: { Accept: 'application/json' },
          status: '200 OK',
          ok: true,
          responseHeaders: { 'Content-Type': 'application/json' },
          rawJson: '{"city":"Pune","tempC":29,"condition":"Sunny"}',
          parsedObject: '{ city: "Pune", tempC: 29, condition: "Sunny" }',
          uiPreview: 'Pune: 29°C',
        },
      },
    ],
  },

  // 12. Parallel Concurrency with Promise.all (Topic 35)
  {
    id: 'vis-promise-all',
    topicId: 't32-async-concurrency',
    title: 'Parallel Requests with Promise.all() vs Waterfall',
    subtitle: 'See how launching requests together cuts total wait time from 600ms to 300ms.',
    focus: 'event-loop',
    codeLines: [
      'async function loadDashboard() {',
      '  const [user, orders] = await Promise.all([',
      '    fetchUser(),   // 200ms',
      '    fetchOrders(), // 300ms',
      '  ]);',
      '  console.log(user.name, orders.length);',
      '}',
    ],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 't = 0ms · Both Requests Launch Simultaneously',
        explanation:
          '`fetchUser()` and `fetchOrders()` are invoked together—BOTH start running concurrently in the browser Network Web API at `t = 0ms`!',
        callStack: [{ frame: 'loadDashboard()', detail: 'paused at Promise.all', status: 'paused' }],
        eventLoop: {
          webApis: ['fetchUser() — in flight (200ms)', 'fetchOrders() — in flight (300ms)'],
          microtasks: [],
          macrotasks: [],
          loopStatus: '2 parallel network requests running concurrently',
          activePhase: 'sync',
        },
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 't = 200ms · fetchUser() Resolves First',
        explanation:
          '`fetchUser()` finishes at 200ms. `Promise.all` stores its result at index 0 and keeps waiting only for `fetchOrders()`.',
        callStack: [{ frame: 'loadDashboard() [SUSPENDED]', detail: '1/2 settled', status: 'paused' }],
        eventLoop: {
          webApis: ['fetchOrders() — 100ms remaining'],
          microtasks: ['Promise.all slot[0] = { name: "Kiran" }'],
          macrotasks: [],
          loopStatus: 'Waiting for remaining 1 promise',
          activePhase: 'microtask',
        },
        consoleOutput: [],
      },
      {
        activeLine: 6,
        phaseLabel: 't = 300ms · Both Settled -> Destructured in Original Order!',
        explanation:
          'At 300ms (NOT 500ms!), `Promise.all` fulfills with `[user, orders]` in input order and resumes `loadDashboard()` on line 6.',
        variables: [
          { name: 'user', value: '{ name: "Kiran" }', changed: true },
          { name: 'orders', value: '[ord1, ord2, ord3]', changed: true },
        ],
        callStack: [{ frame: 'loadDashboard() [RESUMED]', detail: 'Line 6', status: 'running' }],
        eventLoop: {
          webApis: [],
          microtasks: [],
          macrotasks: [],
          loopStatus: 'Completed in 300ms (max duration, not sum)',
          activePhase: 'idle',
        },
        consoleOutput: ['Kiran 3'],
      },
    ],
  },
];
