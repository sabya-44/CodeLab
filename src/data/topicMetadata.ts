import type { GoDeeperBlock, TopicTrack, TopicWeight } from '../types/topic';

export interface TopicEnrichment {
  track: TopicTrack;
  importanceWeight: TopicWeight;
  prerequisites: string[];
  learningObjectives: string[];
  realWorldAnalogy: string;
  goDeeper: GoDeeperBlock[];
}

export const TOPIC_METADATA: Record<string, TopicEnrichment> = {
  // Section 1: Core Foundations & Language Mechanics
  't01-variables-hoisting': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: [],
    learningObjectives: [
      'Choose correctly between `const`, `let`, and legacy `var`.',
      'Predict block scope boundaries vs function scope leakage.',
      'Explain why accessing `let`/`const` before declaration triggers a Temporal Dead Zone `ReferenceError`.',
    ],
    realWorldAnalogy:
      'Think of `const` as a labeled locker welded to one box (you cannot swap the box, though you can rearrange items inside an object), `let` as a re-assignable locker in one room, and `var` as a loud speaker that leaks out of block rooms.',
    goDeeper: [
      {
        title: 'Two-Phase Execution: Creation Phase vs Execution Phase',
        paragraphs: [
          'Before running line 1, the JS engine scans the current scope (Creation Phase). Function declarations are stored in full, `var` bindings are initialized to `undefined`, and `let`/`const` bindings are registered as uninitialized—entering the Temporal Dead Zone (TDZ) until their declaration line runs.',
          'Note that `const` prevents reassigning the variable binding, NOT mutating properties of an object or array stored inside it. Use `Object.freeze()` for shallow immutability.',
        ],
      },
    ],
  },
  't02-data-types-coercion': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t01-variables-hoisting'],
    learningObjectives: [
      'Distinguish all 7 primitive types from reference Objects.',
      'Avoid implicit string/number coercion bugs from HTML input values.',
      'Identify `typeof null === "object"`, `Array.isArray()`, and `Number.isNaN()` edge cases.',
    ],
    realWorldAnalogy:
      'Primitives are photocopied notes handed to a friend (changing theirs does not alter yours); objects are a shared Google Doc link (both edits change the same document).',
    goDeeper: [
      {
        title: 'How the `+` Operator Decides Between Addition and Concatenation',
        paragraphs: [
          'If either operand of `+` is a string (or converts to a string), JavaScript performs string concatenation (`"10" + 5 === "105"`). Other math operators (`-`, `*`, `/`) always coerce operands to numbers (`"10" - 5 === 5`), which is why explicit `Number(val)` is mandatory for form math.',
        ],
      },
    ],
  },
  't03-operators-equality': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t02-data-types-coercion'],
    learningObjectives: [
      'Default to strict equality (`===`) and recognize all 7 falsy values.',
      'Use nullish coalescing (`??`) so valid `0`, `""`, and `false` values are preserved.',
      'Leverage short-circuit evaluation (`&&`, `||`) safely in UI logic.',
    ],
    realWorldAnalogy:
      '`||` rejects anything that looks "empty" (even a valid ₹0 tip), whereas `??` only steps in when a seat is truly unoccupied (`null` or `undefined`).',
    goDeeper: [
      {
        title: 'Operator Precedence Between `??`, `||`, and `&&`',
        paragraphs: [
          'JavaScript forbids mixing `??` directly with `&&` or `||` without explicit parentheses (`(a || b) ?? c`) to prevent subtle precedence bugs.',
          'Use `Object.is(a, b)` in rare cases where you need `NaN === NaN` to be `true` or to tell `+0` apart from `-0`.',
        ],
      },
    ],
  },
  't04-control-flow-loops': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t03-operators-equality'],
    learningObjectives: [
      'Branch cleanly with `if/else`, `switch` (with `break`), and ternary (`?:`) expressions.',
      'Pick the right loop (`for`, `while`, `for...of` for values, `for...in` for object keys).',
      'Control loop flow accurately using `break` and `continue`.',
    ],
    realWorldAnalogy:
      '`for...of` walks through items on a conveyor belt one by one, while `for...in` reads the name labels printed on filing cabinet drawers.',
    goDeeper: [
      {
        title: 'Why `for...in` Is Risky on Arrays',
        paragraphs: [
          '`for...in` iterates over stringified enumerable keys (including inherited prototype keys if anything modified `Array.prototype`). Always use `for...of` or indexed `for (let i = 0; i < arr.length; i++)` for arrays.',
        ],
      },
    ],
  },

  // Section 2: Inbuilt String & Array Methods
  't05a-string-foundations': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t04-control-flow-loops'],
    learningObjectives: [
      'Build strings with quotes and template literals (`${expr}`).',
      'Index characters (`str[i]`, `str.length`) and iterate over strings with `for` loops.',
      'Remember that JS strings are immutable—every edit builds a brand-new string.',
    ],
    realWorldAnalogy:
      'A JavaScript string is like carved stone lettering: you cannot overwrite letter #0 in place, so you carve a new tablet with the updated text.',
    goDeeper: [
      {
        title: 'UTF-16 Code Units vs Unicode Emojis',
        paragraphs: [
          '`str.length` counts UTF-16 code units, so surrogate-pair emojis like `"🚀".length` return `2`. Iterating with `for...of` or `[...str]` safely splits by full Unicode code points.',
        ],
      },
    ],
  },
  't05-string-methods': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t05a-string-foundations'],
    learningObjectives: [
      'Slice and search text using `slice()`, `substring()`, `indexOf()`, `lastIndexOf()`, `startsWith()`, and `endsWith()`.',
      'Transform text safely with `replace()`, `replaceAll()`, `trim()`, and `split()`.',
      'Guard against the `indexOf() === 0` falsy bug by checking `!== -1`.',
    ],
    realWorldAnalogy:
      'Inbuilt string methods are a Swiss-army text processor: `slice` cuts a coupon, `split` chops CSV columns, and `replaceAll` runs Find & Replace across the whole document.',
    goDeeper: [
      {
        title: 'Why `slice()` Beats `substr()` and `substring()`',
        paragraphs: [
          '`substr(start, length)` is deprecated in modern JS specs, and `substring()` silently swaps arguments if `start > end`. Prefer `slice(start, end)` everywhere because it cleanly supports negative indexes (`str.slice(-4)` for last 4 digits).',
        ],
      },
    ],
  },
  't06a-array-foundations': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t04-control-flow-loops'],
    learningObjectives: [
      'Create, read, update, and traverse 0-indexed arrays using classic `for` loops.',
      'Avoid off-by-one `i <= arr.length` bugs when accessing `arr[arr.length - 1]`.',
      'Compute totals, min/max, and second-largest values in a single pass.',
    ],
    realWorldAnalogy:
      'An array is an apartment hallway with numbered doors starting at Room 0—jumping directly to Room 4 (`arr[4]`) takes instant time.',
    goDeeper: [
      {
        title: 'Using `arr.at(-1)` for Negative Indexing',
        paragraphs: [
          'Modern ES2022 introduced `arr.at(-1)` to read the last element cleanly without writing `arr[arr.length - 1]`. It works on both arrays and strings.',
        ],
      },
    ],
  },
  't06-array-basics-methods': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t06a-array-foundations'],
    learningObjectives: [
      'Distinguish mutating methods (`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`) from non-mutating ones (`slice`, `concat`, `join`, `includes`).',
      'Sort numbers numerically with `(a, b) => a - b` instead of default alphabetical sort.',
      'Insert/remove array entries cleanly with `splice()` vs read-only copies with `slice()`.',
    ],
    realWorldAnalogy:
      '`slice()` is like taking a screenshot of a playlist (original untouched); `splice()` is using scissors on the original tape.',
    goDeeper: [
      {
        title: 'ES2023 Non-Mutating Twins: `toSorted()`, `toReversed()`, `toSpliced()`',
        paragraphs: [
          'Modern browsers provide `arr.toSorted((a, b) => a - b)`, `arr.toReversed()`, and `arr.toSpliced(idx, count)` which return fresh arrays instead of mutating state—ideal for React and Redux.',
        ],
      },
    ],
  },
  't07-foreach-map': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t06-array-basics-methods'],
    learningObjectives: [
      'Use `map()` to transform arrays 1-to-1 into new arrays without mutating the original.',
      'Use `forEach()` strictly for side effects (DOM logging/updates), never expecting a return array.',
      'Avoid the missing `return` bug inside curly-brace `map()` callbacks.',
    ],
    realWorldAnalogy:
      '`map()` is a factory assembly line that turns raw ingredients into a boxed list of finished products; `forEach()` is a delivery driver who visits each address and returns empty-handed (`undefined`).',
    goDeeper: [
      {
        title: 'Why `break` Does Not Work Inside `forEach()`',
        paragraphs: [
          'Because `forEach()` invokes a callback for every element, `return` only exits the current callback—not the loop. If you need early termination, use a `for...of` loop, `find()`, or `some()`.',
        ],
      },
    ],
  },
  't08-filter-find-index': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t07-foreach-map'],
    learningObjectives: [
      'Select matching subsets with `filter()` vs the first matching item with `find()`.',
      'Locate indices with `findIndex()` and always guard against `-1`.',
      'Chain `filter().map()` cleanly for search and dashboard UI pipelines.',
    ],
    realWorldAnalogy:
      '`filter()` is a coffee strainer collecting every matching bean into a new cup; `find()` grabs the first matching mug off the shelf and stops looking.',
    goDeeper: [
      {
        title: 'Short-Circuit Performance of `find()` vs `filter()[0]`',
        paragraphs: [
          'Writing `items.filter(x => x.id === target)[0]` scans the entire array even if the item is at index 0. `items.find(...)` stops immediately on the first match.',
        ],
      },
    ],
  },
  't09-some-every-reduce': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t08-filter-find-index'],
    learningObjectives: [
      'Validate datasets concisely using `some()` (at least one) and `every()` (all pass).',
      'Fold arrays into totals, grouped objects, or pipelines using `reduce()` with an explicit initial value.',
      'Understand right-to-left folding with `reduceRight()`.',
    ],
    realWorldAnalogy:
      '`reduce()` is a snowball rolling down a hill: you start with an initial snowball (initialValue) and accumulate each array element into one final result.',
    goDeeper: [
      {
        title: 'Vacuous Truth Trap on `every()` and Missing Initial Value on `reduce()`',
        paragraphs: [
          '`[].every(fn)` returns `true` (vacuous truth!), while `[].reduce(fn)` WITHOUT an initial value throws a `TypeError`. Always pass an initial accumulator (`0`, `{}`, `[]`) to `reduce()`.',
        ],
      },
    ],
  },

  // Section 3: Functions, Callbacks & Scope
  't10-functions-defaults': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t01-variables-hoisting', 't03-operators-equality'],
    learningObjectives: [
      'Differentiate hoisted function declarations from non-hoisted function expressions.',
      'Use ES6 default parameters safely and know they only trigger on `undefined` (not `null` or `0`).',
      'Return structured values cleanly from reusable helper functions.',
    ],
    realWorldAnalogy:
      'A function declaration is printed in the table of contents (available anywhere in scope), while a function expression is a sticky note created only when execution reaches that line.',
    goDeeper: [
      {
        title: 'Default Parameters Can Reference Earlier Parameters',
        paragraphs: [
          'Default expressions are evaluated lazily left-to-right at call time, so `function bill(price, tax = price * 0.18)` works cleanly whenever `tax` is omitted or `undefined`.',
        ],
      },
    ],
  },
  't11-arrow-functions': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t10-functions-defaults'],
    learningObjectives: [
      'Write concise arrow functions with implicit returns.',
      'Wrap implicit object returns in parentheses `x => ({ id: x })` so `{}` is not parsed as a block.',
      'Know when NOT to use arrow functions (object methods needing dynamic `this`).',
    ],
    realWorldAnalogy:
      'Arrow functions inherit their outer room’s `this` like a camera fixed to the ceiling, whereas regular functions point `this` at whoever called them.',
    goDeeper: [
      {
        title: 'No `arguments` Object & Not Constructible',
        paragraphs: [
          'Arrow functions do not have their own `this`, `arguments`, or `prototype`—they cannot be called with `new`. Use rest parameters `(...args)` instead of `arguments`.',
        ],
      },
    ],
  },
  't12-callbacks-hof': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t11-arrow-functions'],
    learningObjectives: [
      'Pass function references (`onDone`) without invoking them prematurely (`onDone()`).',
      'Build custom Higher-Order Functions that accept callbacks or return specialized functions.',
      'Connect callbacks directly to DOM events, timers, and array methods.',
    ],
    realWorldAnalogy:
      'Passing a callback is like leaving your phone number at a busy restaurant (`onTableReady`) instead of standing at the counter blocking the line.',
    goDeeper: [
      {
        title: 'Inversion of Control & Why Promises Replaced Nested Callbacks',
        paragraphs: [
          'Passing a callback hands control of *when* and *how many times* it runs to another function. Deeply nested async callbacks ("callback hell") led to Promises and `async/await` in Section 7.',
        ],
      },
    ],
  },
  't13-lexical-scope-closures': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t12-callbacks-hof'],
    learningObjectives: [
      'Trace variable lookup up the Lexical Environment scope chain.',
      'Encapsulate private state using closure factory functions.',
      'Solve `var`-in-loop closure bugs with `let` and build a practical `debounce()` utility.',
    ],
    realWorldAnalogy:
      'A closure is a backpack that an inner function carries wherever it goes—packed with live links to the variables from the room where it was born.',
    goDeeper: [
      {
        title: 'Lexical Environment Records & Closure Memory',
        paragraphs: [
          'Every function call creates an Execution Context containing a Lexical Environment (local bindings + a pointer to the outer environment). Only variables actually referenced by surviving inner functions are retained in heap closure records by modern V8 engines.',
          'Release long-lived event listeners holding closures when components unmount so detached DOM trees can be garbage collected.',
        ],
      },
    ],
  },

  // Section 4: Objects, Destructuring & Modern Operators
  't14-object-notations-methods': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t11-arrow-functions'],
    learningObjectives: [
      'Model structured records with object literals and nested objects.',
      'Use dot notation for static keys and bracket notation (`obj[key]`) for dynamic keys.',
      'Attach object methods with regular/shorthand functions so `this` binds to the object.',
    ],
    realWorldAnalogy:
      'Dot notation opens a drawer with a fixed printed label (`cabinet.email`), while bracket notation reads the drawer name off a variable sticky note (`cabinet[selectedField]`).',
    goDeeper: [
      {
        title: 'Computed Property Names & Shorthand Syntax',
        paragraphs: [
          'ES6 lets you construct dynamic keys directly inside literals (`{ [fieldName]: value }`) and omit repeated names (`{ name, role }` instead of `{ name: name, role: role }`).',
        ],
      },
    ],
  },
  't15-array-of-objects': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t08-filter-find-index', 't14-object-notations-methods'],
    learningObjectives: [
      'Transform API-style arrays of objects with `map()`, `filter()`, and `sort()`.',
      'Update a single item immutably without mutating original state arrays.',
      'Combine filtering, sorting, and projection cleanly for tables and order boards.',
    ],
    realWorldAnalogy:
      'An array of objects is a spreadsheet table: the array is the list of rows, and each object is one row with named columns.',
    goDeeper: [
      {
        title: 'Avoiding Mutation When Sorting State Arrays',
        paragraphs: [
          'Calling `orders.sort(...)` mutates `orders` in place. Always clone first (`[...orders].sort(...)`) or use `orders.toSorted(...)` before sorting UI state.',
        ],
      },
    ],
  },
  't16-destructuring-optional': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t14-object-notations-methods'],
    learningObjectives: [
      'Extract properties and elements concisely with object and array destructuring (including renaming & defaults).',
      'Read deep optional API fields safely using optional chaining (`?.`) paired with `??`.',
      'Prevent runtime `TypeError: Cannot read properties of undefined` crashes on incomplete payloads.',
    ],
    realWorldAnalogy:
      'Optional chaining (`?.`) is a polite doorbell check: if nobody lives at `user.address`, it stops gracefully and returns `undefined` instead of breaking the door down.',
    goDeeper: [
      {
        title: 'Optional Method Calls & Bracket Access (`fn?.()`, `arr?.[0]`)',
        paragraphs: [
          'Optional chaining also works before function calls (`onSuccess?.(data)`) and dynamic bracket access (`users?.[0]?.name`), making callback props and sparse API payloads rock-solid.',
        ],
      },
    ],
  },
  't17-rest-spread': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t16-destructuring-optional'],
    learningObjectives: [
      'Distinguish Spread (expanding items/props) from Rest (collecting remaining args/props).',
      'Control property override order when merging objects with `{ ...defaults, ...overrides }`.',
      'Strip sensitive fields cleanly using rest destructuring (`const { passwordHash, ...safeUser } = user`).',
    ],
    realWorldAnalogy:
      'Spread unpacks a suitcase onto the bed; Rest zips everything left over into one pouch.',
    goDeeper: [
      {
        title: 'Spread Only Copies Own Enumerable Properties (Shallowly)',
        paragraphs: [
          'Object spread ignores inherited prototype properties and non-enumerable properties, and copies nested objects by reference—never rely on `{ ...obj }` for deep cloning.',
        ],
      },
    ],
  },
  't18-reference-deep-clone': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t17-rest-spread'],
    learningObjectives: [
      'Visualize Stack primitive values vs Heap object references.',
      'Predict why shallow copies (`{ ...a }`, `[...arr]`) still share nested objects.',
      'Deep-clone nested state cleanly using `structuredClone()`.',
    ],
    realWorldAnalogy:
      'A shallow copy photocopies the cover sheet of a binder while keeping the same shared folder inside; `structuredClone()` photocopies every nested page too.',
    goDeeper: [
      {
        title: '`structuredClone()` vs `JSON.parse(JSON.stringify())`',
        paragraphs: [
          '`JSON.parse(JSON.stringify(obj))` silently drops `undefined`, converts `Date` to strings, breaks `Map`/`Set`, and crashes on circular references. `structuredClone()` preserves `Date`, `Map`, `Set`, `RegExp`, and handles circular graphs (only throwing on functions/DOM nodes).',
        ],
      },
    ],
  },

  // Section 5: Execution Context (this), Prototypes & OOP
  't19-this-call-apply-bind': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t14-object-notations-methods'],
    learningObjectives: [
      'Determine what `this` points to based on call-site rules (method, standalone, `new`, arrow).',
      'Fix detached method context bugs when passing object methods as callbacks.',
      'Bind `this` explicitly using `call(ctx, a, b)`, `apply(ctx, [a, b])`, and `bind(ctx)`.',
    ],
    realWorldAnalogy:
      '`call` and `apply` borrow a tool and use it immediately; `bind` creates a customized copy permanently engraved with the owner’s name for later use.',
    goDeeper: [
      {
        title: 'The 4 Precedence Rules of `this` Binding',
        paragraphs: [
          'From highest to lowest priority: (1) `new Fn()` binds `this` to the new instance, (2) explicit `bind`/`call`/`apply`, (3) implicit `obj.method()` left of the dot, (4) default binding (`undefined` in strict mode / ES modules, `window` in sloppy mode). Arrow functions bypass all four and use lexical outer `this`.',
        ],
      },
    ],
  },
  't20-prototypes-chain': {
    track: 'Deep-dive',
    importanceWeight: 2,
    prerequisites: ['t19-this-call-apply-bind'],
    learningObjectives: [
      'Trace property lookups up the `[[Prototype]]` chain until `null`.',
      'Share methods efficiently across instances via prototypes and `Object.create()`.',
      'Distinguish own vs inherited properties with `Object.hasOwn(obj, key)`.',
    ],
    realWorldAnalogy:
      'Prototypes work like a family cookbook: if you do not have a recipe on your desk, you check your parent’s shelf, then your grandparent’s shelf, stopping at `null`.',
    goDeeper: [
      {
        title: 'Why `Object.hasOwn()` Replaced `obj.hasOwnProperty()`',
        paragraphs: [
          'Objects created with `Object.create(null)` have no prototype, so calling `obj.hasOwnProperty("k")` throws a `TypeError`. `Object.hasOwn(obj, "k")` works safely on every object.',
        ],
      },
    ],
  },
  't21-es6-classes-super': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t20-prototypes-chain'],
    learningObjectives: [
      'Define ES6 classes with constructors, instance methods, and static utilities.',
      'Extend base classes using `extends` and call `super()` before touching `this`.',
      'Enforce true runtime encapsulation with `#privateFields`.',
    ],
    realWorldAnalogy:
      'A class is an architectural blueprint; `new` builds a house from it, `extends` creates a specialized villa blueprint, and `#private` locks the safe inside.',
    goDeeper: [
      {
        title: 'Classes Are Syntactic Sugar Over Prototypes (With Strict Mode Built-In)',
        paragraphs: [
          'Methods declared inside `class Foo {}` are placed on `Foo.prototype` (non-enumerable), class bodies always execute in strict mode, and classes are NOT hoisted out of the TDZ.',
        ],
      },
    ],
  },
  't22-set-map-iterators': {
    track: 'Deep-dive',
    importanceWeight: 2,
    prerequisites: ['t08-filter-find-index', 't14-object-notations-methods'],
    learningObjectives: [
      'Deduplicate collections in one line with `new Set()` and test membership in `O(1)`.',
      'Store arbitrary key types and iterate cleanly with `Map` (`set`, `get`, `has`).',
      'Produce lazy on-demand sequences using generator functions (`function*` and `yield`).',
    ],
    realWorldAnalogy:
      'A `Set` is a VIP guest list that automatically rejects duplicate names; a `Map` is a coat check that accepts any badge—even objects—as a ticket; a Generator is a ticket dispenser printing one number only when asked.',
    goDeeper: [
      {
        title: '`WeakMap` and `WeakSet` for Leak-Free Metadata',
        paragraphs: [
          'Unlike `Map`/`Set`, `WeakMap` holds weak object keys—if the object is no longer referenced elsewhere in your app, garbage collection can reclaim it automatically.',
        ],
      },
    ],
  },

  // Section 6: Browser DOM, Events, Forms & Storage
  't23-dom-selection-xss': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t04-control-flow-loops', 't14-object-notations-methods'],
    learningObjectives: [
      'Query elements cleanly with `querySelector`, `querySelectorAll`, `classList`, and `dataset`.',
      'Prevent Cross-Site Scripting (XSS) by using `textContent` instead of `innerHTML` for untrusted text.',
      'Build DOM nodes safely using `document.createElement()`.',
    ],
    realWorldAnalogy:
      '`textContent` hangs a visitor’s handwritten note behind glass so it can only be read; `innerHTML` hands the visitor a microphone connected to your building’s control panel.',
    goDeeper: [
      {
        title: 'Live `HTMLCollection` vs Static `NodeList`',
        paragraphs: [
          '`getElementsByClassName` returns a live collection that mutates as you edit the DOM (causing sneaky loop skips), whereas `querySelectorAll` returns a static `NodeList` snapshot.',
        ],
      },
    ],
  },
  't24-events-forms-prevent': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t12-callbacks-hof', 't23-dom-selection-xss'],
    learningObjectives: [
      'Handle form `submit` events and call `event.preventDefault()` to stop full-page reloads.',
      'Read all named inputs cleanly with `new FormData(form)`.',
      'Validate user input and render accessible inline feedback without `window.alert()`.',
    ],
    realWorldAnalogy:
      '`event.preventDefault()` tells the browser "hold on, JavaScript will handle sending this letter instead of reloading the entire desk."',
    goDeeper: [
      {
        title: 'Why `name` Attributes Matter for `FormData`',
        paragraphs: [
          '`new FormData(form)` only collects form controls that have a `name="..."` attribute (not just `id="..."`), and disabled inputs are skipped automatically.',
        ],
      },
    ],
  },
  't25-event-bubbling-delegation': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t24-events-forms-prevent'],
    learningObjectives: [
      'Trace the Event Capturing -> Target -> Bubbling phases across the DOM tree.',
      'Attach ONE delegated listener on a parent container to handle dynamic child items.',
      'Use `event.target.closest(selector)` so clicks on nested icons/spans still match their button.',
    ],
    realWorldAnalogy:
      'Event delegation is having one building receptionist handle visitors for all 50 offices instead of hiring 50 separate receptionists—and it automatically works when office #51 opens.',
    goDeeper: [
      {
        title: '`event.target` vs `event.currentTarget`',
        paragraphs: [
          '`event.target` is the deepest element actually clicked (e.g., an SVG icon inside a button); `event.currentTarget` is the element where `addEventListener` was attached.',
        ],
      },
    ],
  },
  't26-regex-validation': {
    track: 'Deep-dive',
    importanceWeight: 2,
    prerequisites: ['t05-string-methods'],
    learningObjectives: [
      'Validate entire strings accurately using start/end anchors (`^...$`).',
      'Extract multiple matches cleanly with `matchAll()` or `/g`.',
      'Avoid the stateful `regex.lastIndex` bug when reusing a `/g` regex with `.test()`.',
    ],
    realWorldAnalogy:
      'Regex anchors `^` and `$` act like fences around a field: without them, a pattern matches even if invalid junk surrounds a tiny valid substring.',
    goDeeper: [
      {
        title: 'Avoiding Catastrophic Backtracking (ReDoS)',
        paragraphs: [
          'Nested quantifiers like `(a+)+$` can freeze the browser on long invalid inputs. Keep validation regexes simple, flat, and bounded with explicit lengths (`{3,20}`).',
        ],
      },
    ],
  },
  't27-json-web-storage': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t14-object-notations-methods', 't23-dom-selection-xss'],
    learningObjectives: [
      'Serialize objects with `JSON.stringify()` and deserialize safely with `try { JSON.parse() }`.',
      'Persist non-sensitive UI preferences in `localStorage` and per-tab state in `sessionStorage`.',
      'Know what JSON strips (`undefined`, functions, `Symbol`) and why secrets never belong in Web Storage.',
    ],
    realWorldAnalogy:
      'Web Storage only stores flat string envelopes—`JSON.stringify()` folds your JS object into an envelope, and `JSON.parse()` unfolds it back into an object.',
    goDeeper: [
      {
        title: 'Storage Quotas, `storage` Event & Private Browsing Safety',
        paragraphs: [
          '`localStorage` typically holds ~5MB per origin and is synchronous (avoid writing giant blobs on every keystroke). Always wrap `setItem`/`getItem` in `try/catch` to survive quota or private-mode errors.',
        ],
      },
    ],
  },

  // Section 7: Error Handling & Asynchronous JavaScript
  't28-try-catch-finally': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t27b-debugging-devtools'],
    learningObjectives: [
      'Catch synchronous runtime errors cleanly with `try / catch` and always clean up resources in `finally`.',
      'Throw descriptive `Error` / custom subclass instances instead of raw strings.',
      'Understand why `try / catch` cannot catch errors thrown later inside a `setTimeout` callback.',
    ],
    realWorldAnalogy:
      '`try` is the stunt, `catch` is the safety net, and `finally` is turning off the stadium lights whether the stunt succeeded or fell.',
    goDeeper: [
      {
        title: 'Why `return` Inside `finally` Overrides Everything',
        paragraphs: [
          'Never put a `return` statement inside `finally`: it silently swallows both the `try` return value AND any thrown exception from `catch`!',
        ],
      },
    ],
  },
  't29-event-loop': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t12-callbacks-hof', 't13b-recursion-call-stack'],
    learningObjectives: [
      'Explain how JavaScript runs asynchronously on a single thread via Web APIs + Queues.',
      'Predict exact output order across Call Stack (sync), Microtask Queue (Promises), and Macrotask Queue (`setTimeout`).',
      'Avoid blocking the main thread so browser UI stays smooth at 60fps.',
    ],
    realWorldAnalogy:
      'Sync code is the customer currently at the counter; Microtasks are express priority tickets cleared completely before calling the next regular queue ticket (Macrotask).',
    goDeeper: [
      {
        title: 'Microtask Starvation & Browser Repaint Timing',
        paragraphs: [
          'The browser only gets a chance to paint visual updates between macrotasks—after the entire Microtask Queue drains. Recursively queuing microtasks indefinitely can freeze rendering completely.',
        ],
      },
    ],
  },
  't30-promises-chaining': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t29-event-loop'],
    learningObjectives: [
      'Track the 3 Promise states (`pending`, `fulfilled`, `rejected`) and immutability once settled.',
      'Chain multi-step async workflows cleanly by returning values/Promises inside `.then()`.',
      'Centralize error handling with `.catch()` and loading cleanup with `.finally()`.',
    ],
    realWorldAnalogy:
      'A Promise is a food-delivery order tracker: it starts Pending, settles permanently into Delivered (Fulfilled) or Cancelled (Rejected), and lets you attach follow-up steps.',
    goDeeper: [
      {
        title: 'Why Forgetting `return` Inside `.then()` Breaks Chains',
        paragraphs: [
          'If a `.then()` handler creates a Promise without `return`ing it, the next `.then()` runs immediately with `undefined` instead of waiting for the async work to finish.',
        ],
      },
    ],
  },
  't31-async-await-fetch': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t28-try-catch-finally', 't30-promises-chaining'],
    learningObjectives: [
      'Write readable asynchronous workflows with `async` / `await` and `try / catch / finally`.',
      'Always check `if (!response.ok)` after `fetch()` because HTTP 404/500 do NOT reject automatically.',
      'Manage loading, success, and error UI states cleanly around API requests.',
    ],
    realWorldAnalogy:
      '`await` pauses only the current `async` function like stepping aside while coffee brews, while the rest of the café (event loop) keeps serving other clicks.',
    goDeeper: [
      {
        title: 'Every `async` Function Always Returns a Promise',
        paragraphs: [
          'Even if an `async` function returns `"hello"`, callers receive `Promise<"hello">`. Forgetting `await` on the caller side is one of the most common bugs in modern web apps.',
        ],
      },
    ],
  },
  't32-async-concurrency': {
    track: 'Deep-dive',
    importanceWeight: 2,
    prerequisites: ['t31-async-await-fetch'],
    learningObjectives: [
      'Eliminate slow sequential waterfalls by running independent requests in parallel with `Promise.all()`.',
      'Build resilient dashboards with `Promise.allSettled()` so one failing endpoint does not crash the page.',
      'Cancel stale/timed-out requests with `AbortController` and avoid `forEach(async ...)` traps.',
    ],
    realWorldAnalogy:
      'Sequential `await` cooks pasta, waits until it finishes, then starts boiling sauce; `Promise.all()` puts both pots on the stove at once.',
    goDeeper: [
      {
        title: 'Choosing Between `all`, `allSettled`, `race`, and `any`',
        paragraphs: [
          '`Promise.all` fails fast on the first rejection; `allSettled` waits for all outcomes; `race` settles on whichever finishes first (great for timeouts); `any` resolves on the first fulfillment (great for redundant mirrors).',
        ],
      },
    ],
  },

  // Section 8: Modern Web Architecture & Browser APIs
  't33-es-modules': {
    track: 'Essential',
    importanceWeight: 3,
    prerequisites: ['t10-functions-defaults', 't31-async-await-fetch'],
    learningObjectives: [
      'Organize code across files using named exports, default exports, and `import` statements.',
      'Understand module singleton caching (top-level module code runs once per app load).',
      'Code-split heavy features on demand using dynamic `import()`.',
    ],
    realWorldAnalogy:
      'ES Modules are neatly labeled toolboxes: each file exposes only the tools marked `export`, keeping internal helper bolts private.',
    goDeeper: [
      {
        title: 'Tree-Shaking & Why Named Exports Help Bundlers',
        paragraphs: [
          'Static `import { formatCurrency } from "./utils"` syntax lets Vite/Rollup analyze unused exports at build time and strip dead code out of your production bundle.',
        ],
      },
    ],
  },
  't34-web-timers-observers': {
    track: 'Deep-dive',
    importanceWeight: 1,
    prerequisites: ['t29-event-loop'],
    learningObjectives: [
      'Schedule and cancel timers cleanly with `setTimeout`, `setInterval`, `clearTimeout`, and `clearInterval`.',
      'Prevent stacked intervals when users click Start repeatedly.',
      'Know when to prefer `requestAnimationFrame` and `IntersectionObserver` over polling timers.',
    ],
    realWorldAnalogy:
      'Always clear the old alarm clock before setting a new one—otherwise two alarms ring at double speed.',
    goDeeper: [
      {
        title: 'Background Tab Throttling & Timer Drift',
        paragraphs: [
          'Browsers throttle `setInterval` in inactive tabs to save battery. For accurate countdowns (like OTP timers), compute remaining seconds from `targetEndTime - Date.now()` instead of decrementing `seconds--`.',
        ],
      },
    ],
  },
  't35-immutability-pure-functions': {
    track: 'Essential',
    importanceWeight: 2,
    prerequisites: ['t13-lexical-scope-closures', 't17-rest-spread'],
    learningObjectives: [
      'Write deterministic pure functions with zero hidden side effects.',
      'Update nested arrays/objects immutably (the foundation of React state updates).',
      'Use currying and memoization to compose and cache expensive pure computations.',
    ],
    realWorldAnalogy:
      'A pure function is like a pocket calculator: typing `2 + 2` always gives `4` without changing the weather or rewriting your notebook.',
    goDeeper: [
      {
        title: 'Why React Relies on Immutable References (`Object.is`)',
        paragraphs: [
          'React detects state updates by comparing object references (`prevState === nextState`). Mutating `cart.push(item)` keeps the same reference so React skips re-rendering; returning `[...cart, item]` creates a new reference.',
        ],
      },
    ],
  },
  't36-memory-performance': {
    track: 'Deep-dive',
    importanceWeight: 2,
    prerequisites: ['t25-event-bubbling-delegation', 't34-web-timers-observers'],
    learningObjectives: [
      'Understand reachability-based Mark-and-Sweep Garbage Collection.',
      'Prevent memory leaks from dangling event listeners, uncleared timers, and detached DOM nodes using `AbortController`.',
      'Load scripts without blocking HTML parsing using `<script defer>` vs `<script async>`.',
    ],
    realWorldAnalogy:
      'Garbage Collection is a nighttime custodian who discards anything not reachable from active desks—forgetting to remove a `window` listener leaves a cable tethered so the old desk can never be cleared.',
    goDeeper: [
      {
        title: 'One `AbortController` to Clean Up Dozens of Listeners',
        paragraphs: [
          'Passing `{ signal: controller.signal }` to multiple `addEventListener` calls lets you tear down every listener in one line (`controller.abort()`), avoiding mismatched anonymous-function reference bugs.',
        ],
      },
    ],
  },
};
