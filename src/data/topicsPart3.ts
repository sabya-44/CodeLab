import type { JsTopic } from '../types/topic';

const BASE_CSS = `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 18px; color: #0f172a; }
.box { max-width: 440px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; }
h1 { font-size: 16px; margin: 0 0 10px; }
p, li { font-size: 13px; line-height: 1.5; }
input, select { width: 100%; padding: 7px 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 8px; }
button { padding: 7px 12px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; margin-right: 6px; margin-bottom: 6px; }
.out { background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-top: 10px; white-space: pre-wrap; }
.done { text-decoration: line-through; color: #64748b; }
.active-pill { background: #0f766e; }`;

export const TOPICS_PART_3: JsTopic[] = [
  {
    id: 't19-this-call-apply-bind',
    number: 21,
    categoryId: 'cat-5-context-oop',
    categoryTitle: '5. Execution Context (this), Prototypes & OOP',
    tier: 'Intermediate',
    title: 'Execution Context (this) & call(), apply(), bind()',
    webDevUseCase: 'Preserving Object Context Inside Event Handlers & Shared Methods',
    summary:
      'Master how JavaScript determines `this` at call time, why detaching a method loses its context, and how `call`, `apply`, and `bind` explicitly lock `this`.',
    revisionTldr:
      'Regular functions bind `this` dynamically at the call site; arrow functions inherit `this` lexically. `call(ctx, a, b)` & `apply(ctx, [a, b])` invoke immediately; `bind(ctx)` returns a new permanently bound function.',
    explanation: [
      'In JavaScript, `this` inside a regular function is NOT determined where the function is written—it is determined at the moment the function is invoked (`obj.method()` sets `this` to `obj`; calling `const fn = obj.method; fn()` drops `this` to `undefined` in strict mode or `window`).',
      'Passing an object method directly into `button.addEventListener("click", counter.increment)` or `setTimeout(user.greet, 500)` detaches it from its owner object, causing `this` to point to the DOM element or global window.',
      'To control `this` explicitly, `fn.call(ctx, arg1, arg2)` invokes immediately with comma-separated arguments, `fn.apply(ctx, [arg1, arg2])` invokes immediately with an arguments array, and `fn.bind(ctx)` returns a brand-new function whose `this` is locked forever.',
    ],
    keyRules: [
      '`call(thisArg, a, b)` -> Comma-separated args, runs immediately. `apply(thisArg, [a, b])` -> Array of args, runs immediately.',
      '`bind(thisArg, presetArg)` -> Does NOT run immediately; returns a permanently bound function ideal for callbacks.',
      'Arrow functions have no `this` of their own—they cannot be re-bound with `.call()`, `.apply()`, or `.bind()`.',
    ],
    codeExample: `const store = {
  currency: '₹',
  format(amount, label) {
    return label + ': ' + this.currency + amount;
  },
};

const eurStore = { currency: '€' };

// Immediate execution with custom context:
console.log(store.format.call(eurStore, 499, 'Pro'));     // Pro: €499
console.log(store.format.apply(eurStore, [999, 'Team'])); // Team: €999

// Deferred execution for callbacks:
const formatInr = store.format.bind(store);
console.log(formatInr(250, 'Starter'));                   // Starter: ₹250`,
    commonMistake: {
      label: 'Passing a detached method directly to setTimeout or an event listener',
      avoid: `const widget = {
  title: 'Inbox',
  logTitle() { console.log(this.title); }
};
setTimeout(widget.logTitle, 100); // undefined! "this" was lost`,
      prefer: `setTimeout(widget.logTitle.bind(widget), 100);
// OR wrap in an arrow function:
setTimeout(() => widget.logTitle(), 100);`,
    },
    practice: {
      logical: {
        title: 'Fix Detached this Context with bind(), call() & apply()',
        scenario: 'Exam Question · Preserving `this` When Detaching Object Methods',
        taskPrompt:
          'When `const logFn = tracker.log` is detached from `tracker`, calling `logFn("Click")` makes `this.app` `undefined`! Fix `boundLog` with `.bind(tracker)`, invoke `tracker.log.call(adminApp, ...)`, and pass arguments as an array with `.apply()`.',
        starterHtml: `<div class="box">
  <h1>this, call(), apply() & bind() Exam Fix</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const tracker = {
  app: 'MainPortal',
  log(eventName, severity) {
    return '[' + this.app + '] ' + eventName + ' (' + severity + ')';
  },
};

const adminApp = { app: 'AdminPanel' };

// BUG 1: Detached method loses 'this'! Lock it using .bind(tracker)
const boundLog = tracker.log;

// TODO 2: Use .call(adminApp, 'Login', 'INFO') and .apply(adminApp, ['Export', 'WARN'])
const viaCall = 'TODO';
const viaApply = 'TODO';

document.getElementById('out').textContent = [
  'boundLog: ' + boundLog('PageView', 'INFO'),
  'call(): ' + viaCall,
  'apply(): ' + viaApply,
].join('\\n');`,
        solutionJs: `const tracker = {
  app: 'MainPortal',
  log(eventName, severity) {
    return '[' + this.app + '] ' + eventName + ' (' + severity + ')';
  },
};

const adminApp = { app: 'AdminPanel' };

const boundLog = tracker.log.bind(tracker);
const viaCall = tracker.log.call(adminApp, 'Login', 'INFO');
const viaApply = tracker.log.apply(adminApp, ['Export', 'WARN']);

document.getElementById('out').textContent = [
  'boundLog: ' + boundLog('PageView', 'INFO'),
  'call(): ' + viaCall,
  'apply(): ' + viaApply,
].join('\\n');`,
      },
      realLife: {
        title: 'Multi-Currency Store Invoice Formatter',
        scenario: 'Daily Life · Borrowing Shared Formatter Across INR & USD Storefronts',
        taskPrompt:
          'A SaaS billing module defines `formatter.formatPrice(amount, label)`. Click each storefront button so `btn-inr` uses a `.bind(inrStore)` callback and `btn-usd` borrows the method dynamically via `.call(usdStore, 49, "Pro Plan")`.',
        starterHtml: `<div class="box">
  <h1>Multi-Currency Store Checkout</h1>
  <button id="btn-inr" type="button">Bill in INR (bind)</button>
  <button id="btn-usd" type="button">Bill in USD (call)</button>
  <div id="out" class="out">Click either storefront currency</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const inrStore = { currency: '₹', rate: 1 };
const usdStore = { currency: '$', rate: 1 };

const billingHelper = {
  formatPrice(amount, planName) {
    return planName + ': ' + this.currency + (amount * this.rate);
  },
};

const out = document.getElementById('out');

// BUG: Passing billingHelper.formatPrice directly detaches 'this'! Use .bind(inrStore, 999, 'Starter')
document.getElementById('btn-inr').addEventListener('click', () => {
  const fn = billingHelper.formatPrice;
  out.textContent = fn(999, 'Starter');
});

document.getElementById('btn-usd').addEventListener('click', () => {
  out.textContent = billingHelper.formatPrice.call(usdStore, 49, 'Pro Plan');
});`,
        solutionJs: `const inrStore = { currency: '₹', rate: 1 };
const usdStore = { currency: '$', rate: 1 };

const billingHelper = {
  formatPrice(amount, planName) {
    return planName + ': ' + this.currency + (amount * this.rate);
  },
};

const out = document.getElementById('out');

document.getElementById('btn-inr').addEventListener('click', () => {
  const boundInr = billingHelper.formatPrice.bind(inrStore);
  out.textContent = boundInr(999, 'Starter');
});

document.getElementById('btn-usd').addEventListener('click', () => {
  out.textContent = billingHelper.formatPrice.call(usdStore, 49, 'Pro Plan');
});`,
      },
    },
    quiz: [
      {
        question: 'What is the key difference between `fn.call(...)` and `fn.bind(...)`?',
        options: [
          '`call()` executes the function immediately; `bind()` returns a new function for later execution',
          '`bind()` only works on arrow functions; `call()` only works on classes',
          '`call()` takes an array of arguments; `bind()` executes asynchronously',
        ],
        correctIndex: 0,
        explanation:
          '`call()` and `apply()` invoke the function right away with a specified `this`, whereas `bind()` creates and returns a new permanently bound function.',
      },
      {
        question: 'If you pass `user.save` directly to `btn.addEventListener("click", user.save)`, what is `this` inside `save()` when clicked?',
        options: [
          'The `user` object',
          'The `btn` DOM element (because `addEventListener` binds `this` to the target element)',
          'Always `null`',
        ],
        correctIndex: 1,
        explanation:
          'Passing `user.save` detaches the method from `user`, and `addEventListener` invokes the callback with `this` set to the DOM element (`btn`). Use `.bind(user)` or an arrow wrapper.',
      },
    ],
  },
  {
    id: 't20-prototypes-chain',
    number: 22,
    categoryId: 'cat-5-context-oop',
    categoryTitle: '5. Execution Context (this), Prototypes & OOP',
    tier: 'Intermediate',
    title: 'Prototypes, Prototype Chain & Object.create()',
    webDevUseCase: 'Memory-Efficient Shared Methods & Understanding Built-In APIs',
    summary:
      'Discover how JavaScript objects delegate missing property lookups up the prototype chain (`[[Prototype]]`), share methods without duplication, and inherit via `Object.create()`.',
    revisionTldr:
      'Every JS object has an internal `[[Prototype]]` link. If a property is missing on the instance, JS walks up the chain until `Object.prototype`, then `null`. Put shared methods on `.prototype`, never inside constructors.',
    explanation: [
      'Unlike classical languages that copy blueprints into every object, JavaScript uses prototypal delegation. Every object holds a hidden link (`[[Prototype]]`, inspected via `Object.getPrototypeOf(obj)`) pointing to another object.',
      'When you access `arr.map` or `user.toString()`, JavaScript looks on the object itself first. If not found, it walks up the prototype chain (`arr -> Array.prototype -> Object.prototype -> null`) until it finds the method or hits `null` (`undefined`).',
      'Storing shared methods on a constructor’s `.prototype` (or creating objects via `Object.create(proto)`) ensures 1,000 instances share a single function in memory instead of allocating 1,000 identical copies.',
    ],
    keyRules: [
      'Use `Object.getPrototypeOf(obj)` to inspect prototypes in production instead of the legacy `__proto__` accessor.',
      'Use `Object.hasOwn(obj, key)` to check whether a property belongs directly to the instance rather than its prototype chain.',
      'Never mutate built-in prototypes (`Array.prototype.myHelper = ...`) in real projects—it risks breaking third-party libraries.',
    ],
    codeExample: `function UserAccount(name, role) {
  this.name = name;
  this.role = role;
}

// Shared once in memory on the prototype:
UserAccount.prototype.describe = function () {
  return this.name + ' [' + this.role + ']';
};

const u1 = new UserAccount('Kabir', 'Editor');
const u2 = new UserAccount('Naina', 'Admin');

console.log(u1.describe());
console.log(u1.describe === u2.describe); // true (same shared function)
console.log(Object.hasOwn(u1, 'name'));     // true
console.log(Object.hasOwn(u1, 'describe')); // false (inherited)`,
    commonMistake: {
      label: 'Defining methods inside the constructor function on every instance',
      avoid: `function Card(title) {
  this.title = title;
  this.render = function () { return this.title; }; // New function created per Card!
}`,
      prefer: `function Card(title) {
  this.title = title;
}
Card.prototype.render = function () {
  return this.title; // Shared by all Cards
};`,
    },
    practice: {
      logical: {
        title: 'Own vs Inherited Property Check & Shared Prototype Method',
        scenario: 'Exam Question · Object.hasOwn() vs `in` & Constructor Memory',
        taskPrompt:
          'Two `Person` instances currently allocate duplicate `describe` functions inside the constructor (`p1.describe === p2.describe` is `false`!). Move `describe` onto `Person.prototype`, and check own properties using `Object.hasOwn()` instead of `in`.',
        starterHtml: `<div class="box">
  <h1>Prototype Memory & Ownership Exam Check</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function Person(name) {
  this.name = name;
  // BUG 1: Moves method onto every instance instead of sharing on Person.prototype!
  this.describe = function () {
    return 'Person: ' + this.name;
  };
}

const p1 = new Person('Kabir');
const p2 = new Person('Naina');

// BUG 2: 'in' returns true even for inherited prototype properties! Use Object.hasOwn()
const isOwnDescribe = 'describe' in p1;

document.getElementById('out').textContent = [
  'Shared method (expected true): ' + (p1.describe === p2.describe),
  'Object.hasOwn(p1, "name") (expected true): ' + Object.hasOwn(p1, 'name'),
  'p1 own "describe"? (expected false): ' + isOwnDescribe,
].join('\\n');`,
        solutionJs: `function Person(name) {
  this.name = name;
}

Person.prototype.describe = function () {
  return 'Person: ' + this.name;
};

const p1 = new Person('Kabir');
const p2 = new Person('Naina');

const isOwnDescribe = Object.hasOwn(p1, 'describe');

document.getElementById('out').textContent = [
  'Shared method (expected true): ' + (p1.describe === p2.describe),
  'Object.hasOwn(p1, "name") (expected true): ' + Object.hasOwn(p1, 'name'),
  'p1 own "describe"? (expected false): ' + isOwnDescribe,
].join('\\n');`,
      },
      realLife: {
        title: 'App Role Permissions Inheritance with Object.create()',
        scenario: 'Daily Life · Extending Viewer -> Editor Permissions Without Duplication',
        taskPrompt:
          'Create an `editorRole` object inheriting shared `canRead` and `describe()` from `viewerRole` via `Object.create(viewerRole)`, adding `roleName: "Editor"` and `canEdit: true` without mutating `viewerRole`.',
        starterHtml: `<div class="box">
  <h1>Role Permissions Prototype Hierarchy</h1>
  <button id="btn-check" type="button">Inspect Viewer vs Editor</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const viewerRole = {
  roleName: 'Viewer',
  canRead: true,
  canEdit: false,
  describe() {
    return this.roleName + ' -> read:' + this.canRead + ', edit:' + this.canEdit;
  },
};

// TODO: Create editorRole via Object.create(viewerRole) and override roleName + canEdit
const editorRole = viewerRole; // BUG: Direct reference mutates viewerRole!

document.getElementById('btn-check').addEventListener('click', () => {
  editorRole.roleName = 'Editor';
  editorRole.canEdit = true;
  document.getElementById('out').textContent =
    'Viewer: ' + viewerRole.describe() + '\\nEditor: ' + editorRole.describe();
});`,
        solutionJs: `const viewerRole = {
  roleName: 'Viewer',
  canRead: true,
  canEdit: false,
  describe() {
    return this.roleName + ' -> read:' + this.canRead + ', edit:' + this.canEdit;
  },
};

const editorRole = Object.create(viewerRole);
editorRole.roleName = 'Editor';
editorRole.canEdit = true;

document.getElementById('btn-check').addEventListener('click', () => {
  document.getElementById('out').textContent =
    'Viewer: ' + viewerRole.describe() +
    '\\nEditor: ' + editorRole.describe() +
    '\\nEditor inherits canRead? ' + ('canRead' in editorRole && !Object.hasOwn(editorRole, 'canRead'));
});`,
      },
    },
    quiz: [
      {
        question: 'Where does JavaScript stop searching if a property is not found on an object or any object in its prototype chain?',
        options: [
          'At `window.global`, throwing a ReferenceError',
          'At `null` (after checking `Object.prototype`), returning `undefined`',
          'At `Array.prototype`',
        ],
        correctIndex: 1,
        explanation:
          '`Object.prototype` sits near the top of the chain and its prototype is `null`. Once `null` is reached, property lookup terminates and returns `undefined`.',
      },
      {
        question: 'Which modern method checks if a property exists directly on an object itself (not inherited)?',
        options: ['`Object.hasOwn(obj, prop)`', '`prop in obj`', '`typeof obj[prop]`'],
        correctIndex: 0,
        explanation:
          '`Object.hasOwn(obj, prop)` returns `true` only for own properties, whereas the `in` operator returns `true` for inherited prototype properties as well.',
      },
    ],
  },
  {
    id: 't21-es6-classes-super',
    number: 23,
    categoryId: 'cat-5-context-oop',
    categoryTitle: '5. Execution Context (this), Prototypes & OOP',
    tier: 'Intermediate',
    title: 'ES6 Classes, extends, super(), Private Fields & Static Methods',
    webDevUseCase: 'Designing UI Components, Custom Error Types & Service Managers',
    summary:
      'Use modern `class` syntax as a clean layer over prototypes, customize inheritance with `extends` and `super()`, encapsulate state with `#private` fields, and attach utility methods with `static`.',
    revisionTldr:
      '`class` is syntactic sugar over constructor functions and prototypes. Subclasses must call `super()` before touching `this`. `#field` enforces true runtime privacy; `static` attaches to the class itself, not instances.',
    explanation: [
      'ES6 classes organize state (`constructor`) and prototype methods inside one readable block. Under the hood, methods defined in the class body live on `ClassName.prototype`.',
      'Inheritance uses `class AdminUser extends User`. Inside a subclass constructor, you MUST call `super(...)` before accessing `this` so the parent class can initialize the instance first.',
      'Modern JavaScript also provides `get`/`set` computed accessors, `static` methods callable directly on the class (`User.fromJson(str)`), and `#private` fields (`#balance`) that throw a syntax error if accessed from outside the class.',
    ],
    keyRules: [
      'Always call `super(...)` as the first step inside a subclass `constructor`.',
      'Use `static` for factory constructors or validators that do not need a specific instance (`Cart.calculateTax()`).',
      'Prefix truly internal properties with `#` (`#token`) so external code cannot mutate them accidentally.',
    ],
    codeExample: `class Account {
  #balance = 0; // True private field
  constructor(owner, initial = 0) {
    this.owner = owner;
    this.#balance = initial;
  }
  deposit(amt) {
    if (amt > 0) this.#balance += amt;
    return this;
  }
  get balanceLabel() {
    return this.owner + ': ₹' + this.#balance;
  }
}

class SavingsAccount extends Account {
  constructor(owner, initial, rate) {
    super(owner, initial);
    this.rate = rate;
  }
  static isValidRate(r) {
    return r > 0 && r <= 15;
  }
}

const s = new SavingsAccount('Dev', 1000, 6);
s.deposit(500);
console.log(s.balanceLabel, '| Valid rate:', SavingsAccount.isValidRate(6));`,
    commonMistake: {
      label: 'Accessing `this` in a subclass constructor before calling `super()`',
      avoid: `class Admin extends User {
  constructor(name, level) {
    this.level = level; // ReferenceError! Must call super() first
    super(name);
  }
}`,
      prefer: `class Admin extends User {
  constructor(name, level) {
    super(name);
    this.level = level;
  }
}`,
    },
    practice: {
      logical: {
        title: 'Fix super() Order ReferenceError & Private #Field',
        scenario: 'Exam Question · Subclass Initialization Order & #Private Encapsulation',
        taskPrompt:
          '`AdminUser extends User` throws a `ReferenceError` because `this.level = level` runs BEFORE `super(name)`! Move `super(name)` first, and add a `static isValidLevel(n)` helper returning `n >= 1 && n <= 5`.',
        starterHtml: `<div class="box">
  <h1>ES6 Class super() & static Exam Fix</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `class User {
  #id;
  constructor(name) {
    this.name = name;
    this.#id = Math.floor(Math.random() * 1000);
  }
  getTag() {
    return this.name + ' (#' + this.#id + ')';
  }
}

class AdminUser extends User {
  constructor(name, level) {
    // BUG: Calling this.level before super(name) throws ReferenceError!
    this.level = level;
    super(name);
  }
  // TODO: Add static isValidLevel(n) returning n >= 1 && n <= 5
}

try {
  const admin = new AdminUser('Zara', 3);
  document.getElementById('out').textContent =
    admin.getTag() + ' | Level ' + admin.level +
    '\\nValid level 3? ' + Boolean(AdminUser.isValidLevel?.(3));
} catch (err) {
  document.getElementById('out').textContent = 'CRASH: ' + err.name + ' -> ' + err.message;
}`,
        solutionJs: `class User {
  #id;
  constructor(name) {
    this.name = name;
    this.#id = Math.floor(Math.random() * 1000);
  }
  getTag() {
    return this.name + ' (#' + this.#id + ')';
  }
}

class AdminUser extends User {
  constructor(name, level) {
    super(name);
    this.level = level;
  }
  static isValidLevel(n) {
    return n >= 1 && n <= 5;
  }
}

const admin = new AdminUser('Zara', 3);
document.getElementById('out').textContent =
  admin.getTag() + ' | Level ' + admin.level +
  '\\nValid level 3? ' + AdminUser.isValidLevel(3);`,
      },
      realLife: {
        title: 'E-Commerce Flash-Sale Product & #CostPrice Protection',
        scenario: 'Daily Life · Encapsulating Wholesale Cost & Computing Store Discount',
        taskPrompt:
          'Build `FlashSaleProduct extends Product` with `get finalPrice()` (applying `discountPct`) and `static formatINR(n)` while keeping `#wholesaleCost` strictly private inside the base class.',
        starterHtml: `<div class="box">
  <h1>Flash-Sale Inventory Pricing</h1>
  <button id="btn-calc" type="button">Calculate Sale Price</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `class Product {
  #wholesaleCost;
  constructor(name, mrp, wholesaleCost) {
    this.name = name;
    this.mrp = mrp;
    this.#wholesaleCost = wholesaleCost;
  }
  get marginLabel() {
    return 'Margin: ₹' + (this.mrp - this.#wholesaleCost);
  }
}

class FlashSaleProduct extends Product {
  constructor(name, mrp, wholesaleCost, discountPct) {
    super(name, mrp, wholesaleCost);
    this.discountPct = discountPct;
  }
  get finalPrice() {
    return Math.round(this.mrp * (1 - this.discountPct / 100));
  }
  static formatINR(n) {
    return '₹' + n.toLocaleString('en-IN');
  }
}

document.getElementById('btn-calc').addEventListener('click', () => {
  const item = new FlashSaleProduct('ANC Headphones', 4000, 2200, 20);
  document.getElementById('out').textContent =
    item.name + '\\nSale Price: ' + FlashSaleProduct.formatINR(item.finalPrice) +
    '\\nInternal ' + item.marginLabel;
});`,
        solutionJs: `class Product {
  #wholesaleCost;
  constructor(name, mrp, wholesaleCost) {
    this.name = name;
    this.mrp = mrp;
    this.#wholesaleCost = wholesaleCost;
  }
  get marginLabel() {
    return 'Margin: ₹' + (this.mrp - this.#wholesaleCost);
  }
}

class FlashSaleProduct extends Product {
  constructor(name, mrp, wholesaleCost, discountPct) {
    super(name, mrp, wholesaleCost);
    this.discountPct = discountPct;
  }
  get finalPrice() {
    return Math.round(this.mrp * (1 - this.discountPct / 100));
  }
  static formatINR(n) {
    return '₹' + n.toLocaleString('en-IN');
  }
}

document.getElementById('btn-calc').addEventListener('click', () => {
  const item = new FlashSaleProduct('ANC Headphones', 4000, 2200, 20);
  document.getElementById('out').textContent =
    item.name + '\\nSale Price: ' + FlashSaleProduct.formatINR(item.finalPrice) +
    '\\nInternal ' + item.marginLabel;
});`,
      },
    },
    quiz: [
      {
        question: 'How do you call a method defined directly on a class (e.g., `User.validate(data)`) rather than on an instance?',
        options: ['Mark it with `private`', 'Mark it with `static`', 'Define it inside `constructor()`'],
        correctIndex: 1,
        explanation: '`static` methods belong to the class constructor itself, not to instances created with `new`.',
      },
      {
        question: 'What happens if you try to read `instance.#secret` from outside the class body?',
        options: [
          'It returns `undefined`',
          'JavaScript throws a `SyntaxError` because `#` private fields are strictly enforced',
          'It logs a warning and returns the value',
        ],
        correctIndex: 1,
        explanation: 'Private fields prefixed with `#` are truly private at the syntax/runtime level and cannot be accessed outside the class.',
      },
    ],
  },
  {
    id: 't22-set-map-iterators',
    number: 24,
    categoryId: 'cat-5-context-oop',
    categoryTitle: '5. Execution Context (this), Prototypes & OOP',
    tier: 'Advanced',
    title: 'ES6 Set, Map, Object.entries() & Generators',
    webDevUseCase: 'Fast Deduplication, Key-Value Caching & Lazy Sequences',
    summary:
      'Choose `Set` for unique collections, `Map` for non-string keys and O(1) caches, `Object.entries()`/`Object.fromEntries()` for object transforms, and `function*` generators for lazy streams.',
    revisionTldr:
      '`new Set(arr)` deduplicates in O(n). `new Map()` supports object keys, `.size`, and preserves insertion order. Generators (`function*` + `yield`) pause and resume lazily on `.next()`.',
    explanation: [
      'Plain objects force keys into strings (`{}` keys collide with `"toString"` or convert numbers to strings). `Map` allows ANY value—even DOM elements or objects—as keys, exposes `.size`, and performs fast insertions/deletions for caches.',
      '`Set` stores strictly unique values, making `[...new Set(tags)]` the cleanest one-liner in JavaScript to deduplicate primitive arrays or track selected IDs with `.has()`, `.add()`, and `.delete()`.',
      'To transform plain objects with array methods, convert with `Object.entries(obj)` (array of `[key, val]` pairs), filter/map them, and convert back with `Object.fromEntries(pairs)`. For lazy sequences (like paginated IDs), `function*` generators emit values one at a time via `yield`.',
    ],
    keyRules: [
      'Use `set.has(val)` (O(1)) instead of `array.includes(val)` (O(n)) when checking membership on large lists.',
      'Combine `Object.fromEntries(Object.entries(obj).filter(...))` to filter object keys cleanly without mutation.',
      'Prefer `WeakMap` / `WeakSet` when attaching metadata to DOM nodes so removed nodes can still be garbage-collected.',
    ],
    codeExample: `// 1. Deduplicate tags with Set
const tags = ['js', 'dom', 'js', 'async', 'dom'];
const uniqueTags = [...new Set(tags)];
console.log('Unique:', uniqueTags);

// 2. Filter object keys via Object.entries + Object.fromEntries
const scores = { html: 92, css: 88, oldFlash: 10 };
const modernOnly = Object.fromEntries(
  Object.entries(scores).filter(([k]) => !k.startsWith('old'))
);
console.log('Filtered obj:', modernOnly);

// 3. Lazy ID generator
function* idGen(prefix = 'id') {
  let i = 1;
  while (true) yield prefix + '-' + i++;
}
const nextId = idGen('task');
console.log(nextId.next().value, nextId.next().value);`,
    commonMistake: {
      label: 'Checking object size with obj.length or accessing Map with bracket notation',
      avoid: `const cache = new Map();
cache['user1'] = 'Ananya'; // Sets plain property, NOT a Map entry!
console.log(cache.size);   // 0!`,
      prefer: `const cache = new Map();
cache.set('user1', 'Ananya');
console.log(cache.size, cache.get('user1')); // 1, 'Ananya'`,
    },
    practice: {
      logical: {
        title: 'Map .set()/.get() Trap & Set Array Deduplication',
        scenario: 'Exam Question · Map Bracket Bug & Filtering Object Keys with Object.entries',
        taskPrompt:
          'Fix two bugs: (1) `freq["js"] = 3` sets a plain property instead of a Map entry so `freq.size` is `0`! Use `.set()` and `.get()`. (2) Use `[...new Set(arr)]` to deduplicate `[1, 2, 2, 3, 1]` cleanly.',
        starterHtml: `<div class="box">
  <h1>Map, Set & Object.entries Exam Fix</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const freq = new Map();
// BUG: Using bracket notation leaves freq.size === 0! Use freq.set(...) and freq.get(...)
freq['js'] = 3;

const rawNums = [1, 2, 2, 3, 1, 4];
// TODO: Deduplicate rawNums using [...new Set(rawNums)]
const uniqueNums = rawNums;

document.getElementById('out').textContent =
  'Map size (expected 1): ' + freq.size +
  '\\nMap get("js") (expected 3): ' + freq.get('js') +
  '\\nUnique nums (expected [1,2,3,4]): ' + JSON.stringify(uniqueNums);`,
        solutionJs: `const freq = new Map();
freq.set('js', 3);

const rawNums = [1, 2, 2, 3, 1, 4];
const uniqueNums = [...new Set(rawNums)];

document.getElementById('out').textContent =
  'Map size: ' + freq.size +
  '\\nMap get("js"): ' + freq.get('js') +
  '\\nUnique nums: ' + JSON.stringify(uniqueNums);`,
      },
      realLife: {
        title: 'Support Tag Deduplicator & Auto Ticket-ID Generator',
        scenario: 'Daily Life · Cleaning Duplicate Issue Labels & Assigning Sequential IDs',
        taskPrompt:
          'A customer enters comma-separated tags `"billing, urgent, billing, upi"`. Use `Set` to keep only unique tags, store new tags inside a `Map`, and generate `TKT-1001`, `TKT-1002`... lazily using a `function*` generator.',
        starterHtml: `<div class="box">
  <h1>Helpdesk Tag & Ticket ID Manager</h1>
  <input id="tags-in" type="text" value="billing, urgent, billing, upi" />
  <button id="btn-dedupe" type="button">Clean Tags & Assign IDs</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `function* createTicketIds(start = 1001) {
  let num = start;
  while (true) {
    yield 'TKT-' + num++;
  }
}

const nextId = createTicketIds();
const tagDirectory = new Map();

document.getElementById('btn-dedupe').addEventListener('click', () => {
  const cleaned = document.getElementById('tags-in').value
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const uniqueTags = [...new Set(cleaned)];
  uniqueTags.forEach((tag) => {
    if (!tagDirectory.has(tag)) {
      tagDirectory.set(tag, nextId.next().value);
    }
  });

  const rows = Array.from(tagDirectory.entries()).map(([tag, id]) => id + ' -> #' + tag);
  document.getElementById('out').textContent =
    'Unique Tags (' + uniqueTags.length + '):\\n' + rows.join('\\n');
});`,
        solutionJs: `function* createTicketIds(start = 1001) {
  let num = start;
  while (true) {
    yield 'TKT-' + num++;
  }
}

const nextId = createTicketIds();
const tagDirectory = new Map();

document.getElementById('btn-dedupe').addEventListener('click', () => {
  const cleaned = document.getElementById('tags-in').value
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const uniqueTags = [...new Set(cleaned)];
  uniqueTags.forEach((tag) => {
    if (!tagDirectory.has(tag)) {
      tagDirectory.set(tag, nextId.next().value);
    }
  });

  const rows = Array.from(tagDirectory.entries()).map(([tag, id]) => id + ' -> #' + tag);
  document.getElementById('out').textContent =
    'Unique Tags (' + uniqueTags.length + '):\\n' + rows.join('\\n');
});`,
      },
    },
    quiz: [
      {
        question: 'How do you correctly add and read entries from an ES6 `Map`?',
        options: [
          '`map[key] = val` and `map[key]`',
          '`map.set(key, val)` and `map.get(key)`',
          '`map.push(key, val)` and `map.find(key)`',
        ],
        correctIndex: 1,
        explanation:
          '`Map` uses `.set()`, `.get()`, `.has()`, and `.delete()`. Using bracket syntax sets properties on the Map object wrapper rather than its internal collection.',
      },
      {
        question: 'What does `Object.fromEntries([["a", 1], ["b", 2]])` return?',
        options: ['`{ a: 1, b: 2 }`', '`["a", "b"]`', 'A `Set` containing two pairs'],
        correctIndex: 0,
        explanation: '`Object.fromEntries()` converts an iterable of `[key, value]` pairs back into a plain object.',
      },
    ],
  },
  {
    id: 't23-dom-selection-xss',
    number: 25,
    categoryId: 'cat-6-dom-browser',
    categoryTitle: '6. Browser DOM, Events, Forms & Storage',
    tier: 'Intermediate',
    title: 'DOM Selection, classList & XSS-Safe Updates (textContent vs innerHTML)',
    webDevUseCase: 'Rendering User Input Safely & Toggling Interactive UI States',
    summary:
      'Query elements reliably with `querySelector`/`querySelectorAll`, toggle styles via `classList` and `dataset`, and prevent Cross-Site Scripting (XSS) by choosing `textContent` over `innerHTML`.',
    revisionTldr:
      'Use `querySelector` / `querySelectorAll` (returns static NodeList). Never pass untrusted user input into `innerHTML`—use `textContent` or `createElement` to block `<script>` / `onerror` XSS attacks.',
    explanation: [
      'The Document Object Model (DOM) represents your HTML as a live tree of JavaScript objects. `document.querySelector(css)` grabs the first matching element, while `document.querySelectorAll(css)` returns a static `NodeList` supporting `.forEach()`.',
      'To build or update UI cleanly, prefer `el.classList.toggle("active")` and `el.dataset.id` (`data-id="..."` attributes) instead of concatenating messy inline CSS strings.',
      'Crucially, `element.innerHTML` parses strings as live HTML—meaning user input like `<img src=x onerror=alert(1)>` executes malicious scripts in your app (XSS). Use `element.textContent` for text, or build elements via `document.createElement()`.',
    ],
    keyRules: [
      'Always use `textContent` when displaying user-supplied names, comments, or search queries.',
      'Use `classList.add()`, `.remove()`, `.toggle()`, and `.contains()` for state styling instead of overwriting `el.className`.',
      'Cache frequent DOM queries in `const` variables or append batches via `DocumentFragment` to minimize layout reflows.',
    ],
    codeExample: `const list = document.querySelector('#notes-list');
const userComment = '<img src=x onerror="alert(1)"> Hello!';

const li = document.createElement('li');
li.dataset.status = 'unread';
li.classList.add('note-item');

// Safe: browser renders literal characters, zero script execution!
li.textContent = userComment;
list.appendChild(li);`,
    commonMistake: {
      label: 'Interpolating user input into innerHTML',
      avoid: `const query = input.value;
badge.innerHTML = 'Results for: <b>' + query + '</b>'; // XSS vulnerability!`,
      prefer: `const bold = document.createElement('b');
bold.textContent = input.value;
badge.replaceChildren('Results for: ', bold);`,
    },
    practice: {
      logical: {
        title: 'Fix XSS innerHTML Security Hole & dataset CamelCase',
        scenario: 'Exam Question · Security Audit & DOM Attribute Mapping',
        taskPrompt:
          'Security audit bug: `preview.innerHTML = untrusted` executes injected HTML/onerror scripts, and `card.dataset["user-id"]` fails because `data-user-id` maps to `dataset.userId`! Fix both lines cleanly.',
        starterHtml: `<div class="box" id="card" data-user-id="USR-42">
  <h1>DOM Security & dataset Audit</h1>
  <div id="preview" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const untrusted = '<img src=x onerror="console.error(\\'XSS EXECUTED!\\')"> Hello';
const card = document.getElementById('card');
const preview = document.getElementById('preview');

// BUG 1: innerHTML executes injected HTML attributes! Switch to textContent
preview.innerHTML = untrusted;

// BUG 2: Hyphenated data-user-id becomes camelCase card.dataset.userId!
const uid = card.dataset['user-id'];
console.log('Read data-user-id:', uid);`,
        solutionJs: `const untrusted = '<img src=x onerror="console.error(\\'XSS EXECUTED!\\')"> Hello';
const card = document.getElementById('card');
const preview = document.getElementById('preview');

preview.textContent = untrusted + ' (User: ' + card.dataset.userId + ')';
console.log('Read data-user-id safely:', card.dataset.userId);`,
      },
      realLife: {
        title: 'XSS-Safe Product Review Comment Wall',
        scenario: 'Daily Life · Rendering User Reviews Safely Without Script Injection',
        taskPrompt:
          'Allow users to post reviews safely onto the comment wall (even if someone pastes `<img src=x onerror=...>`!) using `document.createElement("li")` + `textContent`, and toggle highlight class with `classList.toggle("done")`.',
        starterHtml: `<div class="box">
  <h1>Safe Customer Review Wall</h1>
  <input id="note-in" type="text" value="<img src=x onerror=console.error('XSS')> Great course!" />
  <button id="btn-add" type="button">Post Safe Review</button>
  <button id="btn-toggle" type="button">Toggle Strike</button>
  <ul id="list"></ul>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const input = document.querySelector('#note-in');
const list = document.querySelector('#list');

document.querySelector('#btn-add').addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  // TODO: Ensure li.textContent is used (never li.innerHTML) so script tags render harmlessly!
  li.innerHTML = text;
  list.appendChild(li);
});

document.querySelector('#btn-toggle').addEventListener('click', () => {
  list.querySelectorAll('li').forEach((item) => item.classList.toggle('done'));
});`,
        solutionJs: `const input = document.querySelector('#note-in');
const list = document.querySelector('#list');

document.querySelector('#btn-add').addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.textContent = text;
  list.appendChild(li);
});

document.querySelector('#btn-toggle').addEventListener('click', () => {
  list.querySelectorAll('li').forEach((item) => item.classList.toggle('done'));
});`,
      },
    },
    quiz: [
      {
        question: 'Why should you avoid `el.innerHTML = userInput` when displaying user comments?',
        options: [
          '`innerHTML` converts strings to lowercase automatically',
          'Malicious HTML/event attributes like `<img onerror=...>` can execute arbitrary JavaScript (XSS)',
          '`innerHTML` only works inside `<form>` elements',
        ],
        correctIndex: 1,
        explanation:
          'Assigning untrusted input to `innerHTML` parses HTML tags and inline event handlers, opening Cross-Site Scripting (XSS) vulnerabilities. Use `textContent`.',
      },
      {
        question: 'How do you access `data-user-id="42"` in JavaScript on element `card`?',
        options: ['`card.dataset.userId`', '`card.data.user_id`', '`card.getProperty("userId")`'],
        correctIndex: 0,
        explanation:
          'Hyphenated `data-*` HTML attributes map automatically to camelCase properties on `element.dataset`.',
      },
    ],
  },
  {
    id: 't24-events-forms-prevent',
    number: 26,
    categoryId: 'cat-6-dom-browser',
    categoryTitle: '6. Browser DOM, Events, Forms & Storage',
    tier: 'Intermediate',
    title: 'Browser Events, Form Lifecycle (preventDefault) & FormData',
    webDevUseCase: 'Handling SPA Form Submissions Without Full Page Reloads',
    summary:
      'Capture `submit`, `input`, and keyboard events cleanly, prevent default browser page reloads with `e.preventDefault()`, and read all named form controls at once via `new FormData(form)`.',
    revisionTldr:
      'Listen to `"submit"` on the `<form>` (not click on the button) so Enter-key submission works too. Call `e.preventDefault()` immediately to stop page refresh, then read fields with `new FormData(e.currentTarget)`.',
    explanation: [
      'By default, submitting an HTML `<form>` triggers a full browser navigation/reload, wiping out your JavaScript state. Listening to the form’s `submit` event and calling `e.preventDefault()` keeps the user on your Single Page App.',
      'Instead of querying ten separate `.value` inputs by ID, pass the `<form>` element to `new FormData(form)`. Every input with a `name` attribute is collected automatically, and `Object.fromEntries(new FormData(form))` converts it into a clean object.',
      'For live feedback while typing, listen to `"input"` (fires on every keystroke or paste) rather than `"change"` (which only fires after focus leaves the input).',
    ],
    keyRules: [
      'Attach validation and submission to `<form>` `"submit"` event so pressing Enter inside any text field works natively.',
      'Always give inputs a `name="..."` attribute so `FormData` captures them.',
      'Check `e.key === "Escape"` or `e.key === "Enter"` on keyboard events instead of deprecated `e.keyCode`.',
    ],
    codeExample: `form.addEventListener('submit', (e) => {
  e.preventDefault(); // Stop browser page reload

  const data = Object.fromEntries(new FormData(e.currentTarget));
  const email = String(data.email || '').trim();

  if (!email.includes('@')) {
    statusEl.textContent = 'Please enter a valid email.';
    return;
  }

  console.log('Submitted payload:', data);
  e.currentTarget.reset();
});`,
    commonMistake: {
      label: 'Listening to button click instead of form submit, or missing name attributes',
      avoid: `// Breaks when user presses Enter in an input, and reloads the page!
submitBtn.addEventListener('click', () => {
  const fd = new FormData(form); // Empty if inputs lack name=""!
});`,
      prefer: `form.addEventListener('submit', (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.currentTarget));
  console.log(payload);
});`,
    },
    practice: {
      logical: {
        title: 'Fix Missing preventDefault() & Empty FormData Bug',
        scenario: 'Exam Question · Form Submit Reload Trap & Required `name` Attribute',
        taskPrompt:
          'Why is `Object.fromEntries(new FormData(form))` returning `{}` (empty) and refreshing the page? Check BOTH `index.html` (missing `name=""` on `<input>`) and `script.js` (missing `e.preventDefault()`). Fix both!',
        starterHtml: `<div class="box">
  <h1>FormData Exam Bug Hunt</h1>
  <form id="exam-form">
    <!-- BUG: FormData requires name="..." attribute on inputs! -->
    <input id="u-name" type="text" value="Meera" />
    <button type="submit">Submit Check</button>
  </form>
  <div id="out" class="out">Check HTML name attribute & preventDefault()</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const form = document.getElementById('exam-form');
const out = document.getElementById('out');

form.addEventListener('submit', (e) => {
  // BUG 1: Call e.preventDefault() so the iframe doesn't reload!
  const payload = Object.fromEntries(new FormData(e.currentTarget));
  out.textContent = 'FormData keys: ' + JSON.stringify(payload);
});`,
        solutionJs: `const form = document.getElementById('exam-form');
const out = document.getElementById('out');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Ensure input in index.html has name="studentName", or fallback gracefully:
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  if (Object.keys(payload).length === 0) {
    payload.note = 'Add name="studentName" on the <input> in index.html!';
  }
  out.textContent = 'Captured cleanly:\\n' + JSON.stringify(payload, null, 2);
});`,
      },
      realLife: {
        title: 'Workshop Registration Form Without Page Reload',
        scenario: 'Daily Life · Validating & Submitting User Signup via FormData',
        taskPrompt:
          'Handle the workshop registration `<form>` cleanly on `submit`: stop browser reload with `e.preventDefault()`, read fields via `new FormData(e.currentTarget)`, validate that `email` contains `"@"`, and reset the form on success.',
        starterHtml: `<div class="box">
  <h1>Workshop Registration Form</h1>
  <form id="reg-form">
    <input name="fullName" type="text" value="Rohan Verma" placeholder="Full Name" required />
    <input name="email" type="text" value="rohan@college.edu" placeholder="Email" required />
    <button type="submit">Register Seat</button>
  </form>
  <div id="out" class="out">Press Enter or click Register Seat</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const form = document.getElementById('reg-form');
const out = document.getElementById('out');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget));
  const email = String(data.email || '').trim();

  // TODO: Reject invalid email lacking '@' before confirming registration
  out.textContent = 'Registered!\\n' + JSON.stringify(data, null, 2);
});`,
        solutionJs: `const form = document.getElementById('reg-form');
const out = document.getElementById('out');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget));
  const email = String(data.email || '').trim();

  if (!email.includes('@')) {
    out.textContent = 'Validation Error: Please enter a valid email address.';
    return;
  }

  out.textContent = 'Registered cleanly!\\n' + JSON.stringify(data, null, 2);
  e.currentTarget.reset();
});`,
      },
    },
    quiz: [
      {
        question: 'Why do web apps call `e.preventDefault()` inside a form `submit` listener?',
        options: [
          'To clear all input fields automatically',
          'To stop the browser from performing a default full-page reload/navigation',
          'To block event bubbling to parent elements',
        ],
        correctIndex: 1,
        explanation:
          '`e.preventDefault()` cancels the browser’s default form HTTP submission/reload, whereas `e.stopPropagation()` controls event bubbling.',
      },
      {
        question: 'What HTML attribute must an `<input>` have for `new FormData(form)` to include its value?',
        options: ['`id`', '`name`', '`class`'],
        correctIndex: 1,
        explanation: '`FormData` keys every form control using its `name` attribute (disabled controls are excluded).',
      },
    ],
  },
  {
    id: 't25-event-bubbling-delegation',
    number: 27,
    categoryId: 'cat-6-dom-browser',
    categoryTitle: '6. Browser DOM, Events, Forms & Storage',
    tier: 'Advanced',
    title: 'Event Bubbling, Capturing & Event Delegation (closest)',
    webDevUseCase: 'Handling Dynamic Lists, Tables & Modals with a Single Listener',
    summary:
      'Trace the three DOM event phases (Capture, Target, Bubble), distinguish `e.target` from `e.currentTarget`, and use Event Delegation with `e.target.closest()` for dynamically added elements.',
    revisionTldr:
      'Events bubble upward from the clicked child (`e.target`) to ancestors (`e.currentTarget`). Attach ONE listener on the parent container and match `e.target.closest("[data-action]")` so newly added items work automatically.',
    explanation: [
      'When you click a `<button>` inside a `<li>` inside a `<ul>`, the event travels down during the Capture phase (`window -> ul -> li`), fires at the Target (`button`), and then bubbles back up (`li -> ul -> document`).',
      '`e.target` is the deepest element that was actually clicked (such as an icon inside a button), whereas `e.currentTarget` is the element where you attached `.addEventListener()`.',
      'Event Delegation puts a single click listener on the parent `<ul>` instead of binding 500 listeners to 500 `<li>` items. Using `const btn = e.target.closest("[data-action]")`, even newly created items work immediately with zero memory bloat.',
    ],
    keyRules: [
      'Always use `e.target.closest("button")` instead of checking `e.target.tagName === "BUTTON"` so clicks on nested icons inside the button still match.',
      'Only call `e.stopPropagation()` when genuinely needed (e.g., clicking inside a modal card shouldn’t close the backdrop); overusing it breaks analytics and global shortcuts.',
      'Pass `{ once: true }` to `addEventListener` when a handler should fire only once and auto-remove itself.',
    ],
    codeExample: `const taskList = document.querySelector('#task-list');

// Single listener handles existing AND future tasks!
taskList.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (!deleteBtn) return; // Click was somewhere else in the list

  const row = deleteBtn.closest('li');
  console.log('Deleting task ID:', row?.dataset.id);
  row?.remove();
});`,
    commonMistake: {
      label: 'Attaching listeners only at page load to items that are added dynamically later',
      avoid: `// Newly added <li> buttons later will NEVER respond!
document.querySelectorAll('.del-btn').forEach((btn) => {
  btn.addEventListener('click', () => btn.parentElement.remove());
});`,
      prefer: `list.addEventListener('click', (e) => {
  const btn = e.target.closest('.del-btn');
  if (btn) btn.closest('li')?.remove();
});`,
    },
    practice: {
      logical: {
        title: 'Nested Icon Click Bug: e.target vs e.target.closest()',
        scenario: 'Exam Question · Event Bubbling & Safe Delegated Matching',
        taskPrompt:
          'Clicking directly on the `<span>Trash</span>` label inside `<button class="del-btn">` fails because `e.target` is the `<span>`, NOT the `<button>`! Replace `e.target.classList.contains("del-btn")` with `e.target.closest(".del-btn")`.',
        starterHtml: `<div class="box">
  <h1>closest() Bubbling Exam Fix</h1>
  <ul id="items">
    <li data-id="A">Item A <button class="del-btn" type="button"><span>Delete Icon</span></button></li>
    <li data-id="B">Item B <button class="del-btn" type="button"><span>Delete Icon</span></button></li>
  </ul>
  <div id="out" class="out">Click on "Delete Icon" inside either button</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const list = document.getElementById('items');
const out = document.getElementById('out');

list.addEventListener('click', (e) => {
  // BUG: Clicking <span> inside button makes e.target the <span>, not .del-btn!
  if (!e.target.classList.contains('del-btn')) {
    out.textContent = 'Missed! e.target was <' + e.target.tagName + '>';
    return;
  }
  const li = e.target.closest('li');
  out.textContent = 'Deleted Item ' + li.dataset.id;
  li.remove();
});`,
        solutionJs: `const list = document.getElementById('items');
const out = document.getElementById('out');

list.addEventListener('click', (e) => {
  const btn = e.target.closest('.del-btn');
  if (!btn) return;

  const li = btn.closest('li');
  out.textContent = 'Deleted Item ' + li.dataset.id + ' cleanly via closest()!';
  li.remove();
});`,
      },
      realLife: {
        title: 'Dynamic Todo & Expense Checklist (1 Delegated Listener)',
        scenario: 'Daily Life · Handling Dynamically Added List Rows Without Re-Binding',
        taskPrompt:
          'Add new tasks dynamically with "Add Task" and complete or remove ANY row (old or newly created) using a single delegated click listener on `<ul id="tasks">` with `e.target.closest("button[data-act]")`.',
        starterHtml: `<div class="box">
  <h1>Dynamic Workspace Checklist</h1>
  <button id="btn-add" type="button">Add Dynamic Task</button>
  <ul id="tasks">
    <li data-id="1"><span>Review PR #42</span> <button data-act="done" type="button">Done</button> <button data-act="del" type="button">Remove</button></li>
  </ul>
  <div id="out" class="out">Click Done or Remove on existing or new tasks</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const list = document.getElementById('tasks');
const out = document.getElementById('out');
let nextNum = 2;

document.getElementById('btn-add').addEventListener('click', () => {
  const li = document.createElement('li');
  li.dataset.id = String(nextNum);
  li.innerHTML = '<span>Dynamic Task #' + nextNum + '</span> ' +
    '<button data-act="done" type="button">Done</button> ' +
    '<button data-act="del" type="button">Remove</button>';
  list.appendChild(li);
  nextNum += 1;
});

list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const row = btn.closest('li');
  if (btn.dataset.act === 'done') {
    row.querySelector('span').classList.toggle('done');
    out.textContent = 'Toggled task #' + row.dataset.id;
  } else if (btn.dataset.act === 'del') {
    out.textContent = 'Removed task #' + row.dataset.id;
    row.remove();
  }
});`,
        solutionJs: `const list = document.getElementById('tasks');
const out = document.getElementById('out');
let nextNum = 2;

document.getElementById('btn-add').addEventListener('click', () => {
  const li = document.createElement('li');
  li.dataset.id = String(nextNum++);
  li.innerHTML = '<span>Dynamic Task #' + li.dataset.id + '</span> <button data-act="done" type="button">Done</button> <button data-act="del" type="button">Remove</button>';
  list.appendChild(li);
});

list.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const row = btn.closest('li');
  if (btn.dataset.act === 'done') {
    row.querySelector('span').classList.toggle('done');
    out.textContent = 'Toggled #' + row.dataset.id;
  } else if (btn.dataset.act === 'del') {
    out.textContent = 'Removed #' + row.dataset.id;
    row.remove();
  }
});`,
      },
    },
    quiz: [
      {
        question: 'In a click handler attached to a `<ul>`, what is the difference between `e.target` and `e.currentTarget`?',
        options: [
          '`e.target` is always `<ul>`; `e.currentTarget` is the clicked element',
          '`e.target` is the exact element clicked; `e.currentTarget` is the `<ul>` holding the listener',
          'They are always identical',
        ],
        correctIndex: 1,
        explanation:
          '`e.target` identifies the original clicked node (even a nested `<span>`), while `e.currentTarget` is always the element to which the listener is bound.',
      },
      {
        question: 'Why is `e.target.closest("button")` safer than `e.target.tagName === "BUTTON"`?',
        options: [
          'If the user clicks an icon or `<span>` inside the button, `closest("button")` still finds the button',
          '`closest()` prevents page reloads',
          '`tagName` does not exist on DOM elements',
        ],
        correctIndex: 0,
        explanation: 'Clicking a child element inside `<button>` makes that child `e.target`; `.closest("button")` walks upward to locate the button.',
      },
    ],
  },
  {
    id: 't26-regex-validation',
    number: 28,
    categoryId: 'cat-6-dom-browser',
    categoryTitle: '6. Browser DOM, Events, Forms & Storage',
    tier: 'Advanced',
    title: 'Regular Expressions (RegExp), Anchors & Input Validation',
    webDevUseCase: 'Validating Passwords, Extracting URL Slugs & Highlighting Matches',
    summary:
      'Write safe regular expressions with character classes, quantifiers, start/end anchors (`^...$`), capture groups, and understand why the `/g` flag keeps `lastIndex` state on `.test()`.',
    revisionTldr:
      'Use `^` and `$` anchors for whole-string validation. Avoid `/g` with `.test()` (or reset `lastIndex`) because `/g` alternates true/false! Use `str.matchAll(re)` with `/g` to extract all captures cleanly.',
    explanation: [
      'A Regular Expression (`/[a-z0-9_-]{3,16}/`) describes a text pattern for validation, extraction, or replacement. Anchors `^` (start of string) and `$` (end of string) are essential—without them, `/\\d{4}/` matches `"abc1234xyz"`!',
      'Common building blocks include `\\d` (digit), `\\w` (word char), `\\s` (whitespace), `+` (1 or more), `*` (0 or more), `?` (optional), and `{min,max}`.',
      'A classic JavaScript gotcha: a regex with the global flag `/g` is stateful—repeatedly calling `re.test(str)` advances `re.lastIndex` and causes alternating `true`/`false` failures on identical valid strings! Omit `/g` for single-string validation.',
    ],
    keyRules: [
      'Validation regexes MUST start with `^` and end with `$` and MUST NOT carry the `/g` flag.',
      'Prefer `String.prototype.matchAll(/.../g)` or `replaceAll()` when iterating over multiple matches.',
      'Escape user-supplied strings before passing them into `new RegExp(userInput)` to avoid crashes on characters like `.` or `[`.',
    ],
    codeExample: `// Safe username rule: 3-15 lowercase letters, digits, or underscore
const USERNAME_RE = /^[a-z0-9_]{3,15}$/;

console.log(USERNAME_RE.test('dev_2025'));   // true
console.log(USERNAME_RE.test('dev_2025!'));  // false ($ anchor blocks trailing !)

// Extracting hashtags cleanly with matchAll:
const post = 'Learning #JavaScript and #WebDev in 2025';
const tags = [...post.matchAll(/#([a-zA-Z0-9_]+)/g)].map((m) => m[1]);
console.log('Hashtags:', tags); // ['JavaScript', 'WebDev']`,
    commonMistake: {
      label: 'Using the /g flag inside validation .test() or omitting ^ and $ anchors',
      avoid: `const pinRe = /\\d{6}/g; // Missing ^$ AND stateful /g!
console.log(pinRe.test('560001')); // true
console.log(pinRe.test('560001')); // FALSE! lastIndex moved past end!`,
      prefer: `const pinRe = /^\\d{6}$/;
console.log(pinRe.test('560001')); // true every time
console.log(pinRe.test('560001a')); // false`,
    },
    practice: {
      logical: {
        title: 'Stateful /g Regex Bug & Missing ^...$ Anchors',
        scenario: 'Exam Question · Why Regex .test() Alternates true/false with /g',
        taskPrompt:
          'Calling `PIN_RE.test("560001")` twice returns `true` then `false` because `/g` advances `lastIndex`! Also without `^...$`, `"560001XYZ"` falsely passes! Fix `PIN_RE` to `/^\\d{6}$/`.',
        starterHtml: `<div class="box">
  <h1>RegExp /g & Anchor Exam Bug</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `// BUG: Missing ^$ anchors AND stateful /g flag!
const PIN_RE = /\\d{6}/g;

const call1 = PIN_RE.test('560001');
const call2 = PIN_RE.test('560001'); // Unexpectedly false with /g!
const badInput = PIN_RE.test('560001XYZ'); // Should be false!

document.getElementById('out').textContent = [
  '1st test("560001") (expected true): ' + call1,
  '2nd test("560001") (expected true): ' + call2,
  'test("560001XYZ") (expected false): ' + badInput,
].join('\\n');`,
        solutionJs: `const PIN_RE = /^\\d{6}$/;

const call1 = PIN_RE.test('560001');
const call2 = PIN_RE.test('560001');
const badInput = PIN_RE.test('560001XYZ');

document.getElementById('out').textContent = [
  '1st test("560001"): ' + call1,
  '2nd test("560001"): ' + call2,
  'test("560001XYZ"): ' + badInput,
].join('\\n');`,
      },
      realLife: {
        title: 'Signup Handle Validator & Social Post #Hashtag Extractor',
        scenario: 'Daily Life · Validating Clean Usernames & Indexing Hashtags',
        taskPrompt:
          'Validate a user handle against `/^[a-z0-9_]{3,15}$/` and extract every `#hashtag` from a social bio using `matchAll(/#([a-zA-Z0-9_]+)/g)`.',
        starterHtml: `<div class="box">
  <h1>Signup Handle & Hashtag Extractor</h1>
  <input id="uname" type="text" value="coder_99" placeholder="Username (3-15 lowercase/digits/_)" />
  <input id="bio" type="text" value="Building #JS #DOM #WebDev apps!" />
  <button id="btn-check" type="button">Validate & Extract</button>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const USER_RE = /^[a-z0-9_]{3,15}$/;
const HASHTAG_RE = /#([a-zA-Z0-9_]+)/g;

function runCheck() {
  const uname = document.getElementById('uname').value;
  const bio = document.getElementById('bio').value;

  const isValid = USER_RE.test(uname);
  const hashtags = [...bio.matchAll(HASHTAG_RE)].map((m) => m[1]);

  document.getElementById('out').textContent =
    'Handle valid: ' + isValid + '\\nExtracted tags: ' + JSON.stringify(hashtags);
}

document.getElementById('btn-check').addEventListener('click', runCheck);
runCheck();`,
        solutionJs: `const USER_RE = /^[a-z0-9_]{3,15}$/;
const HASHTAG_RE = /#([a-zA-Z0-9_]+)/g;

function runCheck() {
  const uname = document.getElementById('uname').value;
  const bio = document.getElementById('bio').value;

  const isValid = USER_RE.test(uname);
  const hashtags = [...bio.matchAll(HASHTAG_RE)].map((m) => m[1]);

  document.getElementById('out').textContent =
    'Handle valid: ' + isValid + '\\nExtracted tags: ' + JSON.stringify(hashtags);
}

document.getElementById('btn-check').addEventListener('click', runCheck);
runCheck();`,
      },
    },
    quiz: [
      {
        question: 'Why can `/\\d{4}/g.test("2025")` return `true` on the first call and `false` on the second call?',
        options: [
          'Numbers must be wrapped in `String()` first',
          'The `/g` flag mutates `regex.lastIndex`, causing the second `.test()` to start past index 4',
          '`.test()` caches negative results',
        ],
        correctIndex: 1,
        explanation:
          'Global (`/g`) regexes advance `.lastIndex` after each match. Never attach `/g` to a validation regex used with `.test()`.',
      },
      {
        question: 'What do `^` and `$` accomplish in `/^[a-z]{3}$/`?',
        options: [
          'They require the entire string from start to end to be exactly 3 lowercase letters',
          'They make the match case-insensitive',
          'They exclude vowels',
        ],
        correctIndex: 0,
        explanation:
          '`^` anchors to the start of the string and `$` anchors to the end, rejecting inputs like `"abc123"`.',
      },
    ],
  },
  {
    id: 't27-json-web-storage',
    number: 29,
    categoryId: 'cat-6-dom-browser',
    categoryTitle: '6. Browser DOM, Events, Forms & Storage',
    tier: 'Intermediate',
    title: 'JSON Data Format (JSON.stringify / JSON.parse) & Web Storage',
    webDevUseCase: 'Saving Carts, Theme Preferences & Drafts in localStorage / APIs',
    summary:
      'Master JSON syntax rules, serialize JS objects safely with `JSON.stringify()`, parse JSON inside `try/catch` with `JSON.parse()`, and persist state cleanly in `localStorage` & `sessionStorage`.',
    revisionTldr:
      'JSON requires double-quoted keys/strings and drops `undefined`, functions, and `Date` methods. `localStorage` only stores strings—always wrap `JSON.stringify` / `JSON.parse` with `try/catch`!',
    explanation: [
      'JSON (JavaScript Object Notation) is the universal text interchange format between browser apps and backend servers. Unlike JS object literals, strict JSON requires double quotes on all keys and string values, forbids trailing commas, and omits functions or `undefined`.',
      '`JSON.stringify(value, null, 2)` converts an object/array into a formatted JSON string (note: `Date` objects serialize to ISO strings, while functions and `undefined` properties are omitted).',
      'Both `localStorage` (persists across browser restarts) and `sessionStorage` (cleared when the tab closes) store strings only. Calling `localStorage.setItem("prefs", obj)` coerces `obj` into `"[object Object]"` unless you serialize it with `JSON.stringify()` first and guard `JSON.parse()` with `try/catch`.',
    ],
    keyRules: [
      'Always wrap `JSON.parse()` in `try/catch` because corrupted storage strings throw a fatal `SyntaxError`.',
      'Remember `localStorage` stores strings—even booleans like `"false"` are truthy strings until parsed back with `JSON.parse()`.',
      'Never store sensitive secrets (passwords or private keys) in `localStorage`, because any script on the page can read it.',
    ],
    codeExample: `const KEY = 'demo_prefs_v1';

function savePrefs(prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}

function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { theme: 'light', fontSize: 16 };
  } catch {
    return { theme: 'light', fontSize: 16 };
  }
}

savePrefs({ theme: 'slate', fontSize: 18, skipUndef: undefined });
console.log('Loaded:', loadPrefs()); // skipUndef was dropped by JSON!`,
    commonMistake: {
      label: 'Storing raw objects in localStorage without JSON.stringify()',
      avoid: `localStorage.setItem('cart', [{ id: 1 }]);
// Stores literal string "[object Object]"!
const items = localStorage.getItem('cart'); // Crashes .map()`,
      prefer: `localStorage.setItem('cart', JSON.stringify([{ id: 1 }]));
const items = JSON.parse(localStorage.getItem('cart') || '[]');`,
    },
    practice: {
      logical: {
        title: 'JSON.stringify Serialization Rules & Safe try/catch Parse',
        scenario: 'Exam Question · What JSON Drops & Why Raw Storage Objects Fail',
        taskPrompt:
          'Observe two classic JSON exam behaviors: (1) saving a raw object into `sessionStorage` without `JSON.stringify()` stores `"[object Object]"` which crashes `JSON.parse()`, and (2) `undefined` keys & functions are dropped by `JSON.stringify()`. Fix `saveAndReload()` cleanly.',
        starterHtml: `<div class="box">
  <h1>JSON Serialization Exam Fix</h1>
  <div id="out" class="out"></div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const KEY = 'exam_json_test';
const obj = { id: 1, tag: 'JS', dropped: undefined, fn: () => 42 };

// BUG: Storing obj directly coerces it into "[object Object]"! Use JSON.stringify(obj)
sessionStorage.setItem(KEY, obj);

try {
  const parsed = JSON.parse(sessionStorage.getItem(KEY));
  document.getElementById('out').textContent =
    'Parsed cleanly! Keys kept: ' + JSON.stringify(Object.keys(parsed));
} catch (err) {
  document.getElementById('out').textContent =
    'CRASH: ' + err.message + ' (raw value was "' + sessionStorage.getItem(KEY) + '")';
}`,
        solutionJs: `const KEY = 'exam_json_test';
const obj = { id: 1, tag: 'JS', dropped: undefined, fn: () => 42 };

sessionStorage.setItem(KEY, JSON.stringify(obj));

try {
  const parsed = JSON.parse(sessionStorage.getItem(KEY));
  document.getElementById('out').textContent =
    'Parsed cleanly! Keys kept (undefined & fn dropped): ' + JSON.stringify(Object.keys(parsed));
} catch (err) {
  document.getElementById('out').textContent = 'CRASH: ' + err.message;
}`,
      },
      realLife: {
        title: 'Persisting Workspace Theme & User Preferences Across Reloads',
        scenario: 'Daily Life · Saving & Restoring App Settings in Web Storage',
        taskPrompt:
          'Save the user’s chosen display name and dark-mode toggle into `sessionStorage` using `JSON.stringify()`, and restore it safely inside a `try / catch` block using `JSON.parse()`.',
        starterHtml: `<div class="box">
  <h1>Workspace Preferences Storage</h1>
  <input id="pref-name" type="text" value="Asha" placeholder="Display Name" />
  <label><input id="pref-dark" type="checkbox" style="width:auto;" checked /> Compact Sidebar</label><br/>
  <button id="btn-save" type="button">Save Preferences</button>
  <button id="btn-load" type="button">Restore Preferences</button>
  <div id="out" class="out">Click Save, then Restore</div>
</div>`,
        starterCss: BASE_CSS,
        starterJs: `const STORAGE_KEY = 'workspace_prefs_v1';
const out = document.getElementById('out');

document.getElementById('btn-save').addEventListener('click', () => {
  const prefs = {
    name: document.getElementById('pref-name').value.trim() || 'Guest',
    compact: document.getElementById('pref-dark').checked,
    updatedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(prefs, null, 2);
  sessionStorage.setItem(STORAGE_KEY, json);
  out.textContent = 'Saved JSON:\\n' + json;
});

document.getElementById('btn-load').addEventListener('click', () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    out.textContent = parsed
      ? 'Restored -> Name: ' + parsed.name + ', Compact: ' + parsed.compact
      : 'Nothing saved yet.';
  } catch (err) {
    out.textContent = 'Corrupted storage JSON: ' + err.message;
  }
});`,
        solutionJs: `const STORAGE_KEY = 'workspace_prefs_v1';
const out = document.getElementById('out');

document.getElementById('btn-save').addEventListener('click', () => {
  const prefs = {
    name: document.getElementById('pref-name').value.trim() || 'Guest',
    compact: document.getElementById('pref-dark').checked,
    updatedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(prefs, null, 2);
  sessionStorage.setItem(STORAGE_KEY, json);
  out.textContent = 'Saved JSON:\\n' + json;
});

document.getElementById('btn-load').addEventListener('click', () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    out.textContent = parsed
      ? 'Restored -> Name: ' + parsed.name + ', Compact: ' + parsed.compact
      : 'Nothing saved yet.';
  } catch (err) {
    out.textContent = 'Corrupted storage JSON: ' + err.message;
  }
});`,
      },
    },
    quiz: [
      {
        question: 'What happens to a property whose value is a function or `undefined` when passed to `JSON.stringify()`?',
        options: [
          'It throws a TypeError',
          'It is silently omitted from the resulting JSON string',
          'It is converted into `null` inside objects',
        ],
        correctIndex: 1,
        explanation:
          'In plain objects, properties with `undefined`, functions, or Symbol values are dropped by `JSON.stringify()`. (Inside arrays, they turn into `null`.)',
      },
      {
        question: 'What does `localStorage.setItem("user", { name: "Kiran" })` store without `JSON.stringify`?',
        options: [
          'A live reference to the object',
          'The literal string `"[object Object]"`',
          'Only `"Kiran"`',
        ],
        correctIndex: 1,
        explanation:
          '`localStorage` coerces every value to a string via `.toString()`, producing `"[object Object]"` unless serialized with `JSON.stringify()`.',
      },
    ],
  },
];
