import type { RichQuizQuestion } from '../types/practiceBank';

export interface MernMappingItem {
  id: string;
  jsConcept: string;
  mernLayer: 'React' | 'Express / Node' | 'MongoDB' | 'Full-Stack API';
  mernUsage: string;
  topicId: string;
  vanillaJsCode: string;
  mernCode: string;
  keyTakeaway: string;
}

export interface MernBridgeLesson {
  id: string;
  number: number;
  title: string;
  mernFocus: string;
  summary: string;
  explanation: string[];
  jsVsMern: {
    leftLabel: string;
    leftCode: string;
    rightLabel: string;
    rightCode: string;
  };
  commonPitfall: {
    label: string;
    avoid: string;
    prefer: string;
  };
  quiz: RichQuizQuestion[];
}

export const MERN_CONCEPT_MATRIX: MernMappingItem[] = [
  {
    id: 'map-array-react',
    jsConcept: 'Array Methods (map, filter, reduce)',
    mernLayer: 'React',
    mernUsage: 'Rendering dynamic lists, filtered tables, and cart totals in JSX',
    topicId: 't07-foreach-map',
    vanillaJsCode: `const titles = products\n  .filter((p) => p.inStock)\n  .map((p) => \`<li>\${p.name}</li>\`);`,
    mernCode: `return (\n  <ul>\n    {products\n      .filter((p) => p.inStock)\n      .map((p) => <li key={p._id}>{p.name}</li>)}\n  </ul>\n);`,
    keyTakeaway: 'JSX renders arrays of elements directly from `.map()`; always provide a stable `key` (like MongoDB `_id`).',
  },
  {
    id: 'map-destructuring',
    jsConcept: 'Object & Array Destructuring',
    mernLayer: 'React',
    mernUsage: 'Extracting React props, `useState` tuples, and Express `req.body` / `req.params`',
    topicId: 't16-destructuring-optional',
    vanillaJsCode: `const { name, role = 'user' } = payload;\nconst [first, second] = pair;`,
    mernCode: `function ProfileCard({ name, role = 'user' }) {\n  const [open, setOpen] = useState(false);\n  return <button onClick={() => setOpen(!open)}>{name} ({role})</button>;\n}`,
    keyTakeaway: 'Destructuring eliminates `props.x` boilerplate in React and `req.body.email` repetition in Express.',
  },
  {
    id: 'map-spread',
    jsConcept: 'Spread Operator (...) & Immutability',
    mernLayer: 'React',
    mernUsage: 'Immutable React state updates & Express default config merging',
    topicId: 't17-rest-spread',
    vanillaJsCode: `const nextUser = { ...user, theme: 'dark' };\nconst nextItems = [...items, newItem];`,
    mernCode: `setTasks((prev) => [\n  ...prev,\n  { id: crypto.randomUUID(), title, done: false }\n]);`,
    keyTakeaway: 'React detects changes via reference equality (`Object.is`); spreading creates a new reference so UI re-renders.',
  },
  {
    id: 'map-callbacks',
    jsConcept: 'Callbacks & Higher-Order Functions',
    mernLayer: 'Express / Node',
    mernUsage: 'React event handlers (`onClick`) & Express middleware `(req, res, next)`',
    topicId: 't12-callbacks-hof',
    vanillaJsCode: `function withAuth(handler) {\n  return (ctx) => (ctx.user ? handler(ctx) : '401');\n}`,
    mernCode: `function requireAuth(req, res, next) {\n  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });\n  next();\n}\napp.get('/api/orders', requireAuth, listOrders);`,
    keyTakeaway: 'Express routes are literally chains of higher-order callback functions passing control via `next()`.',
  },
  {
    id: 'map-async-await',
    jsConcept: 'Promises & async/await',
    mernLayer: 'MongoDB',
    mernUsage: 'Frontend `fetch()` API calls & backend MongoDB/Mongoose async queries',
    topicId: 't31-async-await-fetch',
    vanillaJsCode: `const res = await fetch('/api/users');\nif (!res.ok) throw new Error('HTTP ' + res.status);\nconst users = await res.json();`,
    mernCode: `app.get('/api/users', async (req, res, next) => {\n  try {\n    const users = await User.find({ active: true }).lean();\n    res.json(users);\n  } catch (err) { next(err); }\n});`,
    keyTakeaway: 'Every MongoDB database read/write returns a Promise — `async/await` + `try/catch` drives the entire backend.',
  },
  {
    id: 'map-modules',
    jsConcept: 'ES Modules (import / export)',
    mernLayer: 'Full-Stack API',
    mernUsage: 'Organizing React components, hooks, Express routers, and DB models',
    topicId: 't33-es-modules',
    vanillaJsCode: `export function formatUsd(n) { return '$' + n.toFixed(2); }\n// consumer:\nimport { formatUsd } from './format.js';`,
    mernCode: `// routes/orders.js\nexport const ordersRouter = express.Router();\n// server.js\nimport { ordersRouter } from './routes/orders.js';\napp.use('/api/orders', ordersRouter);`,
    keyTakeaway: 'Clean modular exports let React and Express apps scale across dozens of features without global leaks.',
  },
  {
    id: 'map-json',
    jsConcept: 'JSON (JSON.stringify / JSON.parse)',
    mernLayer: 'Full-Stack API',
    mernUsage: 'Frontend-to-backend HTTP request bodies & REST API responses',
    topicId: 't27-json-web-storage',
    vanillaJsCode: `const body = JSON.stringify({ title: 'Book', price: 20 });\nconst parsed = JSON.parse(body);`,
    mernCode: `// React client:\nawait fetch('/api/books', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ title: 'Book', price: 20 }),\n});\n// Express: app.use(express.json());`,
    keyTakeaway: 'HTTP sends text over the wire: React serializes objects with `JSON.stringify`, Express parses them with `express.json()`.',
  },
  {
    id: 'map-closures',
    jsConcept: 'Closures & Lexical Scope',
    mernLayer: 'React',
    mernUsage: 'React Hooks (`useState`, `useEffect`, `useCallback`) & avoiding stale closures',
    topicId: 't13-lexical-scope-closures',
    vanillaJsCode: `function createCounter() {\n  let n = 0;\n  return () => ++n;\n}`,
    mernCode: `useEffect(() => {\n  const id = setInterval(() => {\n    setCount((prev) => prev + 1); // Functional update avoids stale closure!\n  }, 1000);\n  return () => clearInterval(id);\n}, []);`,
    keyTakeaway: 'Every React render creates a new closure snapshot; functional state updates (`prev => prev + 1`) prevent stale state bugs.',
  },
  {
    id: 'map-errors',
    jsConcept: 'Error Handling (try / catch / finally)',
    mernLayer: 'Express / Node',
    mernUsage: 'UI error states, `finally` loading resets & centralized Express error middleware',
    topicId: 't28-try-catch-finally',
    vanillaJsCode: `try {\n  await submitOrder();\n} catch (err) {\n  showError(err.message);\n} finally {\n  setLoading(false);\n}`,
    mernCode: `app.use((err, req, res, next) => {\n  console.error(err.stack);\n  res.status(err.status || 500).json({ error: err.message || 'Server error' });\n});`,
    keyTakeaway: 'Unhandled async errors crash Node processes or freeze React spinners — always catch and forward to error handlers.',
  },
];

export const MERN_BRIDGE_LESSONS: MernBridgeLesson[] = [
  {
    id: 'mern-l1-js-vs-jsx',
    number: 1,
    title: 'JavaScript vs JSX in React',
    mernFocus: 'React Frontend Layer',
    summary:
      'JSX is NOT HTML inside JavaScript — it is syntactic sugar compiled into `React.createElement()` calls where `{}` embeds any valid JavaScript expression.',
    explanation: [
      'Inside JSX curly braces `{ ... }`, you can place JavaScript EXPRESSIONS (variables, ternary `?:`, `.map()`, `&&`, function calls), NEVER statements like `if (...)` or `for (...)` loops.',
      'Because `class` and `for` are reserved JavaScript keywords, JSX uses camelCase DOM property names: `className`, `htmlFor`, `onClick`, and `onChange`.',
      'Always use `.map()` (returning an array of elements with unique `key` props) instead of `.forEach()` (which returns `undefined` and renders nothing).',
    ],
    jsVsMern: {
      leftLabel: 'Vanilla JS DOM Creation',
      leftCode: `const ul = document.createElement('ul');\nitems.forEach((item) => {\n  const li = document.createElement('li');\n  li.className = 'row';\n  li.textContent = item.title;\n  ul.appendChild(li);\n});`,
      rightLabel: 'React JSX Equivalent',
      rightCode: `function ItemList({ items }) {\n  return (\n    <ul>\n      {items.map((item) => (\n        <li key={item.id} className="row">{item.title}</li>\n      ))}\n    </ul>\n  );\n}`,
    },
    commonPitfall: {
      label: 'Writing `for` loops or `{count && <Badge />}` when `count === 0` renders a literal "0"',
      avoid: `{items.length && <List items={items} />} // Renders "0" when empty!`,
      prefer: `{items.length > 0 && <List items={items} />} // Clean boolean guard`,
    },
    quiz: [
      {
        id: 'mern-q1',
        topicId: 't07-foreach-map',
        category: 'Practical',
        difficulty: 'Basic',
        question: 'Why does `{tasks.forEach(t => <li key={t.id}>{t.title}</li>)}` render nothing in React?',
        options: [
          '`.forEach()` always returns `undefined`, whereas `.map()` returns the array of JSX elements React needs.',
          'React blocks `.forEach()` with a compiler error.',
          '`<li>` cannot be used inside `.forEach()`.',
          'JSX only accepts `for...in` loops.',
        ],
        correctIndex: 0,
        whyCorrect: 'React renders whatever expression `{ ... }` evaluates to; `.forEach()` evaluates to `undefined`, while `.map()` returns an array of React elements.',
        wrongOptionReasons: {
          1: 'It is valid JS syntax, so it compiles and silently renders nothing.',
          2: 'The issue is `.forEach()` returning `undefined`, not the `<li>` tag.',
          3: '`for...in` is a statement and cannot be written directly inside `{ ... }` JSX braces.',
        },
      },
    ],
  },
  {
    id: 'mern-l2-modules',
    number: 2,
    title: 'ES Modules in React & Node.js',
    mernFocus: 'Full-Stack Module Architecture',
    summary:
      'Master default vs named exports, organizing feature folders cleanly, and understanding ESM (`import/export`) across both Vite/React and modern Node.js.',
    explanation: [
      'Named exports (`export function fetchUsers()`) enforce exact identifier names and enable tree-shaking in bundlers like Vite so unused helpers are stripped from production bundles.',
      'Default exports (`export default function Dashboard()`) allow the importer to pick any name — popular for top-level route components.',
      'In Node.js, setting `"type": "module"` in `package.json` lets Express servers use the exact same `import/export` syntax as React instead of legacy `require()`.',
    ],
    jsVsMern: {
      leftLabel: 'Legacy CommonJS (Node)',
      leftCode: `const express = require('express');\nconst { getOrders } = require('./orders');\nmodule.exports = { router };`,
      rightLabel: 'Modern ES Modules (React & Node)',
      rightCode: `import express from 'express';\nimport { getOrders } from './orders.js';\nexport const router = express.Router();`,
    },
    commonPitfall: {
      label: 'Mixing up default vs named import braces `{}` causes `undefined` component crashes',
      avoid: `import { UserCard } from './UserCard'; // Fails if UserCard used export default!`,
      prefer: `// Match export style:\nexport function UserCard() { ... }\nimport { UserCard } from './UserCard';`,
    },
    quiz: [
      {
        id: 'mern-q2',
        topicId: 't33-es-modules',
        category: 'Conceptual',
        difficulty: 'Intermediate',
        question: 'Why do React & TypeScript teams often prefer named exports (`export function Button`) over default exports?',
        options: [
          'Consistent symbol names across the codebase, reliable IDE auto-imports/refactoring, and cleaner tree-shaking.',
          'Default exports cannot export React components.',
          'Named exports run twice as fast in the browser.',
          'ES Modules forbid more than one default export per project.',
        ],
        correctIndex: 0,
        whyCorrect: 'Named exports keep import names consistent across files and make automated refactoring and static analysis predictable.',
        wrongOptionReasons: {
          1: 'Default exports work fine for components; the trade-off is naming consistency.',
          2: 'Runtime execution speed is identical.',
          3: 'Each FILE (not project) can have one default export.',
        },
      },
    ],
  },
  {
    id: 'mern-l3-mongodb-objects',
    number: 3,
    title: 'JS Objects & Arrays in MongoDB Workflows',
    mernFocus: 'MongoDB / Mongoose Data Layer',
    summary:
      'MongoDB stores BSON documents that map directly to nested JavaScript objects and arrays — making JS destructuring, spread, and array methods your daily database toolkit.',
    explanation: [
      'A MongoDB document looks just like a JS object (`{ _id, email, tags: ["js", "mern"], profile: { city: "Pune" } }`).',
      'Always whitelist allowed fields via destructuring (`const { title, price } = req.body`) before inserting or updating in MongoDB so attackers cannot inject `role: "admin"` (mass-assignment vulnerability).',
      'In Mongoose, calling `.lean()` on read-only queries returns plain lightweight JS objects instead of heavy hydrated Document instances, significantly speeding up API responses.',
    ],
    jsVsMern: {
      leftLabel: 'Unsafe Raw req.body Insert',
      leftCode: `// Dangerous: attacker can send { role: "admin" }!\nawait User.create(req.body);`,
      rightLabel: 'Whitelisted JS Destructuring + MongoDB',
      rightCode: `const { name, email } = req.body;\nconst user = await User.create({ name, email, role: 'member' });\nconst active = await User.find({ active: true }).lean();`,
    },
    commonPitfall: {
      label: 'Passing `req.body` directly to `Model.create()` or `findByIdAndUpdate()`',
      avoid: `await User.findByIdAndUpdate(id, req.body);`,
      prefer: `const { name, bio } = req.body;\nawait User.findByIdAndUpdate(id, { $set: { name, bio } }, { new: true });`,
    },
    quiz: [
      {
        id: 'mern-q3',
        topicId: 't16-destructuring-optional',
        category: 'Scenario',
        difficulty: 'Intermediate',
        question: 'Why should you destructure specific fields from `req.body` before saving to MongoDB?',
        options: [
          'It prevents mass-assignment attacks where a client injects privileged fields like `role: "admin"` or `isPaid: true`.',
          'MongoDB rejects objects with more than 3 keys.',
          'Destructuring automatically encrypts passwords.',
          '`req.body` is always an array, not an object.',
        ],
        correctIndex: 0,
        whyCorrect: 'Explicitly picking allowed fields ensures clients can only set fields intended for that endpoint.',
        wrongOptionReasons: {
          1: 'MongoDB documents support hundreds of fields.',
          2: 'Password hashing requires `bcrypt`/`argon2`, not destructuring.',
          3: 'For JSON payloads, `req.body` is typically a plain JS object.',
        },
      },
    ],
  },
  {
    id: 'mern-l4-express-req-res',
    number: 4,
    title: 'Express Request, Response & Middleware Pipeline',
    mernFocus: 'Express Backend Layer',
    summary:
      'Every Express API is a pipeline of JavaScript callback functions `(req, res, next)` that inspect requests, validate inputs, and send structured JSON responses.',
    explanation: [
      '`req.params` holds URL path segments (`/users/:id`), `req.query` holds query strings (`?page=2&sort=asc`), and `req.body` holds parsed JSON payloads (via `app.use(express.json())`).',
      'Always `return` when sending an early error response (`return res.status(400).json(...)`) so the handler does not keep running and trigger `"Cannot set headers after they are sent"`.',
      'Middleware functions call `next()` to pass control to the next handler, or `next(err)` to jump straight to your error-handling middleware.',
    ],
    jsVsMern: {
      leftLabel: 'Missing Early Return (Double Send Crash)',
      leftCode: `app.post('/api/items', (req, res) => {\n  if (!req.body.title) {\n    res.status(400).json({ error: 'Title required' });\n  }\n  res.status(201).json({ ok: true }); // CRASH!\n});`,
      rightLabel: 'Clean Guard Clause + Status Codes',
      rightCode: `app.post('/api/items', (req, res) => {\n  const title = req.body?.title?.trim();\n  if (!title) {\n    return res.status(400).json({ error: 'Title required' });\n  }\n  return res.status(201).json({ title });\n});`,
    },
    commonPitfall: {
      label: 'Sending two responses from the same route handler',
      avoid: `if (!user) res.status(404).json({ error: 'Not found' });\nres.json(user);`,
      prefer: `if (!user) return res.status(404).json({ error: 'Not found' });\nreturn res.json(user);`,
    },
    quiz: [
      {
        id: 'mern-q4',
        topicId: 't36c-clean-code-organization',
        category: 'Debugging',
        difficulty: 'Intermediate',
        question: 'What causes the classic Express error `ERR_HTTP_HEADERS_SENT: Cannot set headers after they are sent`?',
        options: [
          'Calling `res.json()` or `res.send()` twice in one request — usually because a guard `if` forgot `return`.',
          'Forgetting to import `fetch` in Express.',
          'Using HTTP status code 201 instead of 200.',
          'Parsing JSON with `express.json()`.',
        ],
        correctIndex: 0,
        whyCorrect: 'HTTP allows only one response per request; forgetting `return` after `res.status(400).json(...)` lets execution fall through to a second `res.json()`.',
        wrongOptionReasons: {
          1: 'Node 18+ has built-in `fetch`, unrelated to Express response headers.',
          2: '201 Created is standard for POST creation endpoints.',
          3: '`express.json()` parses incoming bodies before your handler runs.',
        },
      },
    ],
  },
  {
    id: 'mern-l5-node-async-errors',
    number: 5,
    title: 'Async Error Handling in Node.js & Express',
    mernFocus: 'Production Reliability & Error Middleware',
    summary:
      'Learn how to catch rejected Promises cleanly in Express routes, forward them to centralized 4-argument error middleware, and never leak stack traces to clients.',
    explanation: [
      'In Express 4, throwing inside an `async` route handler does NOT automatically reach error middleware unless wrapped in `try/catch` calling `next(err)` (or an `asyncHandler` HOF wrapper). Express 5 adds built-in promise rejection forwarding, but explicit error handling remains vital.',
      'A centralized Express error middleware MUST declare all 4 parameters `(err, req, res, next)` — Express inspects `fn.length === 4` to recognize it as an error handler!',
      'Log full stack traces on the server for engineers, but send only safe, clean error messages and proper HTTP status codes (`400`, `401`, `404`, `500`) to the React frontend.',
    ],
    jsVsMern: {
      leftLabel: 'Reusable asyncHandler HOF Wrapper',
      leftCode: `const asyncHandler = (fn) => (req, res, next) =>\n  Promise.resolve(fn(req, res, next)).catch(next);\n\napp.get('/api/orders/:id', asyncHandler(async (req, res) => {\n  const order = await Order.findById(req.params.id);\n  if (!order) return res.status(404).json({ error: 'Order not found' });\n  res.json(order);\n}));`,
      rightLabel: 'Centralized 4-Arg Error Middleware',
      rightCode: `app.use((err, req, res, next) => {\n  console.error('[API Error]', err);\n  const status = err.statusCode || 500;\n  res.status(status).json({\n    error: status === 500 ? 'Internal server error' : err.message,\n  });\n});`,
    },
    commonPitfall: {
      label: 'Omitting the 4th `next` parameter breaks Express error middleware detection',
      avoid: `app.use((err, req, res) => { res.status(500).json({ error: err.message }); });`,
      prefer: `app.use((err, req, res, next) => {\n  void next;\n  res.status(500).json({ error: 'Server error' });\n});`,
    },
    quiz: [
      {
        id: 'mern-q5',
        topicId: 't28-try-catch-finally',
        category: 'Debugging',
        difficulty: 'Advanced',
        question: 'Why does an Express error handler defined as `app.use((err, req, res) => ...)` NEVER get called when `next(err)` fires?',
        options: [
          'Express checks `fn.length === 4` to identify error-handling middleware — you MUST include all four parameters `(err, req, res, next)`.',
          'Express does not support arrow functions for error handlers.',
          '`next(err)` only works on `POST` routes.',
          'Error middleware must be registered BEFORE all routes.',
        ],
        correctIndex: 0,
        whyCorrect: 'Express distinguishes normal middleware (3 args) from error middleware (4 args) using `Function.prototype.length`.',
        wrongOptionReasons: {
          1: 'Arrow functions work identically as long as they declare 4 parameters.',
          2: '`next(err)` works on all HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).',
          3: 'Error middleware must be registered AFTER all routes so it catches errors forwarded from them.',
        },
      },
    ],
  },
];
