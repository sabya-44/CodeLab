import type { CategoryId, DifficultyTier, JsTopic } from '../../types/topic';
import type { CodingChallengeItem, QuestionCategory, RichQuizQuestion } from '../../types/practiceBank';
import { TOPICS } from '../topicsIndex';
import { CODING_CHALLENGES_PART_1 } from './codingChallengesPart1';
import { CODING_CHALLENGES_PART_2 } from './codingChallengesPart2';
import { CODING_CHALLENGES_PART_3 } from './codingChallengesPart3';
import { RICH_QUESTIONS_CORE } from './richQuestionsCore';

/**
 * Target total questions per section (STRICTLY within 100..130, NEVER exceeding 130!).
 * Total per section =
 *   (2 existing DOM practice exercises + 2 existing core recall quizzes per topic)
 * + executable Coding / Find-the-Bug challenges
 * + rich Interactive Practice / Recall / Output-Prediction / Debugging / Scenario questions
 */
export const SECTION_TARGET_TOTALS: Record<CategoryId, number> = {
  'cat-1-foundations': 112,
  'cat-2-strings-arrays': 126,
  'cat-3-functions-scope': 116,
  'cat-4-objects-operators': 118,
  'cat-5-context-oop': 110,
  'cat-6-dom-browser': 118,
  'cat-7-async-js': 124,
  'cat-8-modern-architecture': 114,
};

interface DrillSpec {
  category: QuestionCategory;
  difficulty: DifficultyTier;
  question: string;
  codeSnippet?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  whyCorrect: string;
  wrongOptionReasons: Record<number, string>;
}

/**
 * Deterministic topic-specific evaluation templates covering authentic JS expressions,
 * code traces, workspace bugs, and architectural trade-offs for every single topic.
 * Never produces generic filler — every question evaluates real JavaScript mechanics.
 */
function buildTopicSpecificTemplates(topic: JsTopic): DrillSpec[] {
  const specs: DrillSpec[] = [];

  // ---- Dynamic Code-Evaluation & Output-Prediction Bank by Topic ----
  switch (topic.id) {
    case 't01-variables-hoisting': {
      const pairs = [
        { k: 'let', val: 10, inner: 25, out: '25, 10', why: '`let` is block-scoped, so the inner `let x = 25` does not overwrite the outer `x = 10`.' },
        { k: 'var', val: 10, inner: 25, out: '25, 25', why: '`var` ignores `{}` blocks, so the inner `var x = 25` overwrites the same variable.' },
        { k: 'let', val: 4, inner: 9, out: '9, 4', why: 'The block creates a separate lexical environment for `let`, keeping outer `x = 4` intact.' },
        { k: 'var', val: 7, inner: 14, out: '14, 14', why: '`var` is function/global scoped, not block scoped, so both logs read `14`.' },
      ];
      pairs.forEach((p, idx) => {
        specs.push({
          category: 'Output-based',
          difficulty: idx % 2 === 0 ? 'Basic' : 'Intermediate',
          question: `What does this ${p.k} block-scope snippet output?`,
          codeSnippet: `${p.k} x = ${p.val};\nif (true) {\n  ${p.k} x = ${p.inner};\n  console.log(x);\n}\nconsole.log(x);`,
          options: [
            p.out,
            p.k === 'let' ? `${p.inner}, ${p.inner}` : `${p.inner}, ${p.val}`,
            `${p.val}, ${p.val}`,
            'SyntaxError: Identifier already declared',
          ],
          correctIndex: 0,
          whyCorrect: p.why,
          wrongOptionReasons: {
            1: p.k === 'let' ? '`let` does not leak out of `if {}` blocks.' : '`var` does not create block scope inside `if {}`.',
            2: 'Inside the `if (true)` block, `x` evaluates to the inner assignment first.',
            3: 'Redeclaring in an inner block with `let` or redeclaring `var` does not throw a SyntaxError here.',
          },
        });
      });

      const hoistCases = [
        { code: `console.log(greet());\nfunction greet() { return 'Hi'; }`, ans: '"Hi"', d1: 'undefined', d2: 'TypeError: greet is not a function', d3: 'ReferenceError', why: 'Function declarations are hoisted completely with their body.' },
        { code: `console.log(typeof greet);\nvar greet = function() { return 'Hi'; };`, ans: '"undefined"', d1: '"function"', d2: 'ReferenceError', d3: '"object"', why: 'Only the `var greet` binding is hoisted (initialized to `undefined`), not the function expression.' },
        { code: `greet();\nconst greet = () => 'Hi';`, ans: 'ReferenceError (TDZ)', d1: '"Hi"', d2: 'TypeError: greet is not a function', d3: 'undefined', why: '`const` arrow function expressions stay in the Temporal Dead Zone until evaluated.' },
        { code: `greet();\nvar greet = () => 'Hi';`, ans: 'TypeError: greet is not a function', d1: 'ReferenceError', d2: '"Hi"', d3: 'undefined', why: '`var greet` is hoisted as `undefined`; calling `undefined()` throws a `TypeError`.' },
      ];
      hoistCases.forEach((h) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Intermediate',
          question: 'Predict the exact runtime behavior of this hoisted function call:',
          codeSnippet: h.code,
          options: [h.ans, h.d1, h.d2, h.d3],
          correctIndex: 0,
          whyCorrect: h.why,
          wrongOptionReasons: {
            1: 'Check whether the identifier is a function declaration, `var` expression, or `const` TDZ binding.',
            2: 'Calling `undefined()` throws `TypeError`, while accessing an uninitialized `let`/`const` throws `ReferenceError`.',
            3: 'The code does not evaluate to that value during the creation/execution phases.',
          },
        });
      });
      break;
    }

    case 't02-data-types-coercion': {
      const exprs = [
        { expr: `typeof []`, ans: '"object"', w: ['"array"', '"list"', '"undefined"'], why: 'Arrays are specialized objects in JS; use `Array.isArray()` to detect them.' },
        { expr: `typeof NaN`, ans: '"number"', w: ['"NaN"', '"undefined"', '"object"'], why: '`NaN` represents an invalid IEEE-754 numeric result, so `typeof NaN === "number"`.' },
        { expr: `Number(null)`, ans: '0', w: ['NaN', 'null', 'undefined'], why: '`Number(null)` coerces `null` to `0` (whereas `Number(undefined)` is `NaN`).' },
        { expr: `Number(undefined)`, ans: 'NaN', w: ['0', 'undefined', 'null'], why: '`undefined` has no numeric representation and coerces to `NaN`.' },
        { expr: `Boolean([])`, ans: 'true', w: ['false', 'undefined', 'TypeError'], why: 'ALL objects and arrays — even empty `[]` and `{}` — are truthy.' },
        { expr: `'10' - '4' + '2'`, ans: '"62"', w: ['8', '"1042"', 'NaN'], why: '`"10" - "4"` coerces to `6`, then `6 + "2"` concatenates into `"62"`.' },
        { expr: `1 + 2 + '3'`, ans: '"33"', w: ['"123"', '6', 'NaN'], why: 'Left-to-right: `1 + 2` is `3`, then `3 + "3"` concatenates to `"33"`.' },
        { expr: `'3' + 1 + 2`, ans: '"312"', w: ['"33"', '6', 'NaN'], why: 'Left-to-right: `"3" + 1` becomes `"31"`, then `"31" + 2` becomes `"312"`.' },
      ];
      exprs.forEach((e) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Basic',
          question: `What does \`${e.expr}\` evaluate to?`,
          codeSnippet: `console.log(${e.expr});`,
          options: [e.ans, e.w[0], e.w[1], e.w[2]],
          correctIndex: 0,
          whyCorrect: e.why,
          wrongOptionReasons: {
            1: `JavaScript coercion rules produce ${e.ans}, not ${e.w[0]}.`,
            2: `${e.w[1]} is a common misconception when guessing JS type conversion.`,
            3: `This expression evaluates cleanly to ${e.ans}, not ${e.w[2]}.`,
          },
        });
      });
      break;
    }

    case 't03-operators-equality': {
      const exprs = [
        { expr: `'' || 'guest'`, ans: '"guest"', w: ['""', 'false', 'undefined'], why: '`""` is falsy, so `||` returns its right operand `"guest"`.' },
        { expr: `'' ?? 'guest'`, ans: '""', w: ['"guest"', 'null', 'false'], why: '`??` only falls back on `null` or `undefined`; `""` is preserved.' },
        { expr: `null ?? 0 ?? 42`, ans: '0', w: ['42', 'null', 'false'], why: '`null` falls through to `0`; `0` is non-nullish so `??` stops and returns `0`.' },
        { expr: `0 && 'hello'`, ans: '0', w: ['false', '"hello"', 'undefined'], why: '`&&` short-circuits and returns the first falsy operand itself (`0`), not a boolean.' },
        { expr: `'hi' && 42`, ans: '42', w: ['true', '"hi"', 'undefined'], why: 'When the left side is truthy, `&&` returns the right operand (`42`).' },
        { expr: `0 === -0 && Object.is(NaN, NaN)`, ans: 'true', w: ['false', 'NaN', 'TypeError'], why: '`0 === -0` is `true`, and `Object.is(NaN, NaN)` is `true`.' },
        { expr: `null == undefined`, ans: 'true', w: ['false', 'TypeError', 'undefined'], why: 'Loose equality treats `null` and `undefined` as equal only to each other.' },
        { expr: `null === undefined`, ans: 'false', w: ['true', 'null', 'undefined'], why: 'Strict equality checks type first; `null` and `undefined` are different types.' },
      ];
      exprs.forEach((e) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Basic',
          question: `What is the result of \`${e.expr}\`?`,
          codeSnippet: `console.log(${e.expr});`,
          options: [e.ans, e.w[0], e.w[1], e.w[2]],
          correctIndex: 0,
          whyCorrect: e.why,
          wrongOptionReasons: {
            1: `Check short-circuit / equality semantics — the expression returns ${e.ans}.`,
            2: `Logical operators in JS return operands directly rather than always coercing to booleans.`,
            3: `This expression does not evaluate to ${e.w[2]}.`,
          },
        });
      });
      break;
    }

    case 't04-control-flow-loops': {
      const loops = [
        { code: `let s = 0;\nfor (let i = 1; i <= 4; i++) {\n  if (i === 3) continue;\n  s += i;\n}\nconsole.log(s);`, ans: '7', w: ['10', '3', '6'], why: '`continue` skips `i = 3`, summing `1 + 2 + 4 = 7`.' },
        { code: `let s = 0;\nfor (let i = 1; i <= 5; i++) {\n  if (i === 4) break;\n  s += i;\n}\nconsole.log(s);`, ans: '6', w: ['10', '15', '11'], why: '`break` exits when `i === 4`, summing `1 + 2 + 3 = 6`.' },
        { code: `const arr = ['a', 'b'];\nconst out = [];\nfor (const k in arr) out.push(k);\nconsole.log(out);`, ans: '["0", "1"]', w: ['["a", "b"]', '[0, 1]', '["length"]'], why: '`for...in` iterates enumerable STRING property keys (`"0"`, `"1"`), not values.' },
        { code: `const out = [];\nfor (const v of 'JS') out.push(v);\nconsole.log(out);`, ans: '["J", "S"]', w: ['["0", "1"]', '["JS"]', 'TypeError'], why: '`for...of` iterates iterable VALUES, yielding each character of `"JS"`.' },
        { code: `let n = 0;\ndo { n += 5; } while (n < 0);\nconsole.log(n);`, ans: '5', w: ['0', 'Infinite loop', '-5'], why: '`do...while` always executes its body at least once before checking `n < 0`.' },
      ];
      loops.forEach((l) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Basic',
          question: 'Trace the loop dry-run. What does it print?',
          codeSnippet: l.code,
          options: [l.ans, l.w[0], l.w[1], l.w[2]],
          correctIndex: 0,
          whyCorrect: l.why,
          wrongOptionReasons: {
            1: `Step through each iteration variable value carefully — final output is ${l.ans}.`,
            2: `Check loop termination/skip semantics (` + '`break` vs `continue`, `for...in` vs `for...of`' + `).`,
            3: `This loop terminates cleanly and logs ${l.ans}.`,
          },
        });
      });
      break;
    }

    case 't05a-string-foundations':
    case 't05-string-methods': {
      const strTests = [
        { code: `'JavaScript'.slice(0, 4)`, ans: '"Java"', w: ['"JavaS"', '"avaS"', '"Script"'], why: '`slice(0, 4)` extracts characters at indices `0, 1, 2, 3` (end is exclusive).' },
        { code: `'JavaScript'.slice(-6)`, ans: '"Script"', w: ['"Java"', '""', '"tpircS"'], why: 'Negative index `-6` counts 6 characters from the end of the string.' },
        { code: `'a,b,c'.split(',').length`, ans: '3', w: ['5', '2', '1'], why: 'Splitting on `","` yields `["a", "b", "c"]` with length `3`.' },
        { code: `'hello world'.indexOf('o')`, ans: '4', w: ['7', '5', '-1'], why: '`indexOf` returns the FIRST zero-based index (`4`); use `lastIndexOf` for `7`.' },
        { code: `'hello world'.lastIndexOf('o')`, ans: '7', w: ['4', '8', '-1'], why: '`lastIndexOf("o")` finds the last `"o"` at index `7`.' },
        { code: `'app.test.js'.endsWith('.js')`, ans: 'true', w: ['false', '8', '".js"'], why: '`endsWith` returns a boolean checking the trailing suffix.' },
        { code: `'foo-bar-foo'.replace('foo', 'baz')`, ans: '"baz-bar-foo"', w: ['"baz-bar-baz"', '"foo-bar-baz"', '"baz"'], why: '`.replace()` with a plain string replaces ONLY the first match.' },
        { code: `'foo-bar-foo'.replaceAll('foo', 'baz')`, ans: '"baz-bar-baz"', w: ['"baz-bar-foo"', '["baz","bar","baz"]', 'TypeError'], why: '`.replaceAll()` replaces every matching substring.' },
        { code: `'  hi  '.trim().length`, ans: '2', w: ['6', '4', '0'], why: '`.trim()` strips leading and trailing whitespace leaving `"hi"` (length `2`).' },
        { code: `'JavaScript'.substring(4, 0)`, ans: '"Java"', w: ['""', '"Script"', 'RangeError'], why: '`substring(start, end)` swaps arguments if `start > end` (unlike `slice`, which returns `""`).' },
      ];
      strTests.forEach((s) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Basic',
          question: `What does \`${s.code}\` return?`,
          codeSnippet: `console.log(${s.code});`,
          options: [s.ans, s.w[0], s.w[1], s.w[2]],
          correctIndex: 0,
          whyCorrect: s.why,
          wrongOptionReasons: {
            1: `Double-check zero-based indexing and inclusive/exclusive bounds — result is ${s.ans}.`,
            2: `Strings are immutable and method signatures return ${s.ans} here.`,
            3: `This built-in string method executes without error and returns ${s.ans}.`,
          },
        });
      });
      break;
    }

    case 't06a-array-foundations':
    case 't06-array-basics-methods': {
      const arrTests = [
        { code: `const a = [1, 2, 3];\nconsole.log(a.push(4), a.length);`, ans: '4 4', w: ['[1,2,3,4] 4', '3 4', 'undefined 4'], why: '`.push()` mutates the array and returns the NEW length (`4`), NOT the array.' },
        { code: `const a = [10, 20, 30];\nconsole.log(a.pop(), a);`, ans: '30 [10, 20]', w: ['10 [20, 30]', '2 [10, 20]', '[30] [10, 20]'], why: '`.pop()` removes and returns the LAST element (`30`).' },
        { code: `const a = [10, 20, 30];\nconsole.log(a.shift(), a);`, ans: '10 [20, 30]', w: ['30 [10, 20]', '2 [20, 30]', 'undefined [10, 20, 30]'], why: '`.shift()` removes and returns the FIRST element (`10`).' },
        { code: `const a = [1, 2, 3, 4];\nconsole.log(a.slice(1, 3), a.length);`, ans: '[2, 3] 4', w: ['[2, 3] 2', '[2, 3, 4] 4', '[1, 2, 3] 4'], why: '`.slice(1, 3)` is NON-MUTATING and excludes index `3`, leaving `a.length === 4`.' },
        { code: `const a = [1, 2, 3, 4];\nconsole.log(a.splice(1, 2), a);`, ans: '[2, 3] [1, 4]', w: ['[2] [1, 3, 4]', '[2, 3] [1, 2, 3, 4]', '[1, 2] [3, 4]'], why: '`.splice(1, 2)` MUTATES `a` by removing 2 elements starting at index 1 and returns removed elements.' },
        { code: `[10, 2, 1].sort()`, ans: '[1, 10, 2]', w: ['[1, 2, 10]', '[10, 2, 1]', '[2, 10, 1]'], why: 'Without a comparator, `.sort()` converts elements to strings (`"1" < "10" < "2"`).' },
        { code: `[1, 2].concat([3, 4]).join('-')`, ans: '"1-2-3-4"', w: ['"1,2,3,4"', '["1-2-3-4"]', '"1-2-[3,4]"'], why: '`.concat()` merges arrays into `[1,2,3,4]` and `.join("-")` creates `"1-2-3-4"`.' },
        { code: `[NaN, 1].includes(NaN) + ' / ' + [NaN, 1].indexOf(NaN)`, ans: '"true / -1"', w: ['"false / -1"', '"true / 0"', '"false / 0"'], why: '`.includes()` uses SameValueZero (finds `NaN`), while `.indexOf()` uses `===` (returns `-1`).' },
      ];
      arrTests.forEach((a) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Basic',
          question: 'What does this array method snippet produce?',
          codeSnippet: a.code,
          options: [a.ans, a.w[0], a.w[1], a.w[2]],
          correctIndex: 0,
          whyCorrect: a.why,
          wrongOptionReasons: {
            1: `Check mutating vs non-mutating behavior and return value — expected ${a.ans}.`,
            2: `Verify index bounds and method return types (` + '`push` returns length, `splice` mutates, `slice` copies' + `).`,
            3: `This array call evaluates cleanly to ${a.ans}.`,
          },
        });
      });
      break;
    }

    case 't07-foreach-map':
    case 't08-filter-find-index':
    case 't09-some-every-reduce': {
      const hofTests = [
        { code: `[1, 2, 3].map(x => x * 2)`, ans: '[2, 4, 6]', w: ['undefined', '6', '[1, 2, 3]'], why: '`.map()` returns a new array of equal length with transformed values.' },
        { code: `[1, 2, 3].forEach(x => x * 2)`, ans: 'undefined', w: ['[2, 4, 6]', '[1, 2, 3]', '6'], why: '`.forEach()` always returns `undefined`.' },
        { code: `[5, 12, 8, 130].find(n => n > 10)`, ans: '12', w: ['[12, 130]', '1', 'true'], why: '`.find()` stops at and returns the FIRST matching element (`12`).' },
        { code: `[5, 12, 8, 130].findIndex(n => n > 200)`, ans: '-1', w: ['undefined', 'false', '0'], why: '`.findIndex()` returns `-1` when no element satisfies the predicate.' },
        { code: `[2, 4, 6].every(n => n % 2 === 0)`, ans: 'true', w: ['[2, 4, 6]', 'false', '3'], why: '`.every()` returns `true` only if ALL elements pass the test.' },
        { code: `[].every(n => n > 100)`, ans: 'true', w: ['false', 'undefined', 'TypeError'], why: 'Vacuous truth: `.every()` on an empty array returns `true` (and `.some()` returns `false`).' },
        { code: `[1, 2, 3, 4].reduce((a, b) => a + b, 10)`, ans: '20', w: ['10', '24', '[11, 13, 16, 20]'], why: 'Accumulator starts at `10`: `10 + 1 + 2 + 3 + 4 = 20`.' },
        { code: `['a', 'b', 'c'].reduceRight((acc, ch) => acc + ch, '')`, ans: '"cba"', w: ['"abc"', '["c","b","a"]', 'undefined'], why: '`.reduceRight()` folds elements from right to left (`"c" -> "cb" -> "cba"`).' },
      ];
      hofTests.forEach((h) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Intermediate',
          question: `What does \`${h.code}\` evaluate to?`,
          codeSnippet: `console.log(${h.code});`,
          options: [h.ans, h.w[0], h.w[1], h.w[2]],
          correctIndex: 0,
          whyCorrect: h.why,
          wrongOptionReasons: {
            1: `Distinguish what each HOF returns: \`map/filter\` -> array, \`find\` -> item, \`some/every\` -> boolean, \`forEach\` -> undefined.`,
            2: `Trace the callback execution carefully — it yields ${h.ans}.`,
            3: `This expression evaluates cleanly to ${h.ans}.`,
          },
        });
      });
      break;
    }

    case 't13-lexical-scope-closures':
    case 't13b-recursion-call-stack':
    case 't10-functions-defaults':
    case 't11-arrow-functions':
    case 't12-callbacks-hof': {
      const fnTests = [
        { code: `function greet(name = 'Guest') {\n  return name;\n}\nconsole.log(greet(undefined), greet(null));`, ans: '"Guest" null', w: ['"Guest" "Guest"', 'undefined null', '"Guest" undefined'], why: 'Default parameters ONLY trigger for `undefined` (missing arg), NEVER for `null`.' },
        { code: `const make = () => { a: 1 };\nconsole.log(make());`, ans: 'undefined', w: ['{ a: 1 }', '1', 'SyntaxError'], why: 'Without `({ a: 1 })`, `a: 1` is parsed as a labeled statement inside a function block that returns nothing.' },
        { code: `let n = 10;\nfunction outer() {\n  let n = 20;\n  return () => n;\n}\nconsole.log(outer()());`, ans: '20', w: ['10', 'undefined', 'ReferenceError'], why: 'The returned arrow function closes over `outer`\'s lexical variable `n = 20`.' },
        { code: `function sum(n) {\n  if (n <= 0) return 0;\n  return n + sum(n - 1);\n}\nconsole.log(sum(4));`, ans: '10', w: ['4', '24', '0'], why: '`4 + 3 + 2 + 1 + 0 = 10`.' },
        { code: `const compose = (f, g) => x => f(g(x));\nconst inc = x => x + 1;\nconst dbl = x => x * 2;\nconsole.log(compose(dbl, inc)(3));`, ans: '8', w: ['7', '6', '9'], why: '`inc(3)` runs first (`4`), then `dbl(4)` returns `8`.' },
      ];
      fnTests.forEach((f) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Intermediate',
          question: 'Predict the output of this function/scope snippet:',
          codeSnippet: f.code,
          options: [f.ans, f.w[0], f.w[1], f.w[2]],
          correctIndex: 0,
          whyCorrect: f.why,
          wrongOptionReasons: {
            1: `Trace parameter evaluation and lexical bindings step by step — output is ${f.ans}.`,
            2: `Check return syntax and call-order evaluation.`,
            3: `This code executes without throwing and prints ${f.ans}.`,
          },
        });
      });
      break;
    }

    case 't29-event-loop':
    case 't30-promises-chaining':
    case 't31-async-await-fetch':
    case 't32-async-concurrency': {
      const asyncTests = [
        { code: `async function f() { return 42; }\nconsole.log(f() instanceof Promise);`, ans: 'true', w: ['false', '42', 'TypeError'], why: 'Every `async` function ALWAYS wraps its return value in a resolved `Promise`.' },
        { code: `Promise.resolve(2)\n  .then(x => x * 3)\n  .then(x => console.log(x));`, ans: '6', w: ['2', 'undefined', 'Promise { 6 }'], why: 'The first `.then` returns `6`, passing `6` into the second `.then`.' },
        { code: `setTimeout(() => console.log('T'), 0);\nqueueMicrotask(() => console.log('M'));\nconsole.log('S');`, ans: 'S, M, T', w: ['S, T, M', 'M, S, T', 'T, M, S'], why: 'Sync (`S`) runs first, then microtask (`M`), then macrotask timer (`T`).' },
        { code: `Promise.race([\n  new Promise(r => setTimeout(() => r('slow'), 50)),\n  Promise.resolve('fast')\n]).then(console.log);`, ans: '"fast"', w: ['"slow"', '["fast","slow"]', 'undefined'], why: '`Promise.race()` settles with whichever promise settles FIRST (`"fast"`).' },
        { code: `Promise.any([\n  Promise.reject('e1'),\n  Promise.resolve('ok'),\n]).then(console.log);`, ans: '"ok"', w: ['"e1"', 'AggregateError', '["ok"]'], why: '`Promise.any()` resolves with the FIRST fulfilled promise, ignoring earlier rejections.' },
      ];
      asyncTests.forEach((a) => {
        specs.push({
          category: 'Output-based',
          difficulty: 'Advanced',
          question: 'Predict the asynchronous output:',
          codeSnippet: a.code,
          options: [a.ans, a.w[0], a.w[1], a.w[2]],
          correctIndex: 0,
          whyCorrect: a.why,
          wrongOptionReasons: {
            1: `Remember Call Stack -> Microtask Queue -> Macrotask Queue priority and combinator semantics.`,
            2: `Trace how the promise combinator or async wrapper settles.`,
            3: `This asynchronous snippet resolves cleanly to ${a.ans}.`,
          },
        });
      });
      break;
    }

    default: {
      // Topic-tailored code/conceptual drills derived directly from the topic's rules & mistake patterns
      break;
    }
  }

  // ---- Derive crisp, authentic topic-grounded drills from the topic's own keyRules, commonMistake, webDevUseCase & goDeeper ----
  const otherTopics = TOPICS.filter((t) => t.id !== topic.id);
  const pickDistractors = (seed: number, fn: (t: JsTopic) => string): [string, string, string] => {
    const out: string[] = [];
    let cursor = seed % otherTopics.length;
    while (out.length < 3) {
      const candidate = fn(otherTopics[cursor]);
      if (candidate && !out.includes(candidate)) {
        out.push(candidate);
      }
      cursor = (cursor + 7) % otherTopics.length;
    }
    return [out[0], out[1], out[2]];
  };

  // 1. Common Mistake -> Debugging Question
  specs.push({
    category: 'Debugging',
    difficulty: topic.tier,
    question: `Code Review (${topic.title}): Which bug exists in this pattern, and what is the clean fix?`,
    codeSnippet: topic.commonMistake.avoid,
    options: [
      `Clean fix: ${topic.commonMistake.prefer.split('\n')[0].trim()}`,
      'Wrap the snippet in `eval()` to force strict parsing.',
      'Convert all variables to global `var` declarations.',
      'No issue exists — this pattern is recommended for production.',
    ],
    correctIndex: 0,
    whyCorrect: `${topic.commonMistake.label}. Using the clean pattern avoids the bug and keeps behavior predictable.`,
    wrongOptionReasons: {
      1: '`eval()` introduces XSS security vulnerabilities and disables engine optimizations.',
      2: 'Global `var` leaks state across modules and causes shadowing/hoisting bugs.',
      3: `The shown snippet demonstrates a classic pitfall: ${topic.commonMistake.label}.`,
    },
  });

  // 2. Key Rules -> Conceptual & Logical checks (one per keyRule)
  topic.keyRules.forEach((rule, rIdx) => {
    const distractors = pickDistractors(topic.number * 3 + rIdx, (t) => t.keyRules[rIdx % t.keyRules.length]);
    const rotatedIdx = ((topic.number + rIdx) % 4) as 0 | 1 | 2 | 3;
    const rawOpts = [rule, distractors[0], distractors[1], distractors[2]];
    const placed: [string, string, string, string] = ['', '', '', ''];
    placed[rotatedIdx] = rawOpts[0];
    let dCursor = 1;
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) {
        placed[i] = rawOpts[dCursor++];
      }
    }
    const wrongReasons: Record<number, string> = {};
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) {
        wrongReasons[i] = `That rule belongs to a different JavaScript concept, not "${topic.title}".`;
      }
    }

    specs.push({
      category: rIdx % 2 === 0 ? 'Conceptual' : 'Logical',
      difficulty: topic.tier,
      question: `Which core rule accurately governs "${topic.title}"?`,
      options: placed,
      correctIndex: rotatedIdx,
      whyCorrect: `Rule #${rIdx + 1} for ${topic.title}: ${rule}`,
      wrongOptionReasons: wrongReasons,
    });
  });

  // 3. Web Dev Use Case -> Practical / Workspace Scenario question
  {
    const dUse = pickDistractors(topic.number * 5 + 1, (t) => t.webDevUseCase);
    const rotatedIdx = ((topic.number + 1) % 4) as 0 | 1 | 2 | 3;
    const placed: [string, string, string, string] = ['', '', '', ''];
    placed[rotatedIdx] = topic.webDevUseCase;
    let c = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) placed[i] = dUse[c++];
    }
    const wrongReasons: Record<number, string> = {};
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) {
        wrongReasons[i] = `That describes a primary use case for a different module rather than ${topic.title}.`;
      }
    }
    specs.push({
      category: 'Practical',
      difficulty: topic.tier,
      question: `In a production web application, when is "${topic.title}" the direct tool of choice?`,
      options: placed,
      correctIndex: rotatedIdx,
      whyCorrect: `${topic.title} directly powers: ${topic.webDevUseCase}.`,
      wrongOptionReasons: wrongReasons,
    });
  }

  // 4. Revision TL;DR -> Fast Recall Scenario
  {
    const dTldr = pickDistractors(topic.number * 7 + 2, (t) => t.revisionTldr);
    const rotatedIdx = ((topic.number + 2) % 4) as 0 | 1 | 2 | 3;
    const placed: [string, string, string, string] = ['', '', '', ''];
    placed[rotatedIdx] = topic.revisionTldr;
    let c = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) placed[i] = dTldr[c++];
    }
    const wrongReasons: Record<number, string> = {};
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) {
        wrongReasons[i] = `That summary applies to another JS topic, not ${topic.title}.`;
      }
    }
    specs.push({
      category: 'Scenario',
      difficulty: topic.tier,
      question: `Interview Rapid-Fire: Which engineering summary best captures "${topic.title}"?`,
      options: placed,
      correctIndex: rotatedIdx,
      whyCorrect: topic.revisionTldr,
      wrongOptionReasons: wrongReasons,
    });
  }

  // 5. Explanation-grounded comprehension & Debugging / Practical variants to support weighted section quotas
  topic.explanation.forEach((para, pIdx) => {
    const shortClaim = para.length > 160 ? para.slice(0, 157).trimEnd() + '...' : para;
    const dPara = pickDistractors(topic.number * 11 + pIdx, (t) => {
      const p = t.explanation[0] ?? t.summary;
      return p.length > 160 ? p.slice(0, 157).trimEnd() + '...' : p;
    });
    const rotatedIdx = ((topic.number + pIdx + 3) % 4) as 0 | 1 | 2 | 3;
    const placed: [string, string, string, string] = ['', '', '', ''];
    placed[rotatedIdx] = shortClaim;
    let c = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) placed[i] = dPara[c++];
    }
    const wrongReasons: Record<number, string> = {};
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) {
        wrongReasons[i] = `This explanation describes a different JavaScript mechanism outside "${topic.title}".`;
      }
    }
    specs.push({
      category: pIdx === 0 ? 'Conceptual' : pIdx === 1 ? 'Practical' : 'Scenario',
      difficulty: topic.tier,
      question: `Concept Check #${pIdx + 1}: Which technical statement accurately explains "${topic.title}"?`,
      options: placed,
      correctIndex: rotatedIdx,
      whyCorrect: para,
      wrongOptionReasons: wrongReasons,
    });
  });

  // 6. Real-World Analogy & Learning Objectives checks
  if (topic.learningObjectives) {
    topic.learningObjectives.forEach((obj, oIdx) => {
      const dObj = pickDistractors(topic.number * 13 + oIdx, (t) => t.learningObjectives?.[0] ?? t.summary);
      const rotatedIdx = ((topic.number + oIdx) % 4) as 0 | 1 | 2 | 3;
      const placed: [string, string, string, string] = ['', '', '', ''];
      placed[rotatedIdx] = obj;
      let c = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== rotatedIdx) placed[i] = dObj[c++];
      }
      const wrongReasons: Record<number, string> = {};
      for (let i = 0; i < 4; i++) {
        if (i !== rotatedIdx) {
          wrongReasons[i] = `That skill targets a different topic in the curriculum rather than "${topic.title}".`;
        }
      }
      specs.push({
        category: oIdx % 2 === 0 ? 'Practical' : 'Logical',
        difficulty: topic.tier,
        question: `Mastery Objective Check (${topic.title}): Which capability demonstrates mastery of this topic?`,
        options: placed,
        correctIndex: rotatedIdx,
        whyCorrect: `Mastering ${topic.title} enables you to: ${obj}`,
        wrongOptionReasons: wrongReasons,
      });
    });
  }

  // 7. Scenario-based Debugging & Edge-Case Trade-off questions (guarantees ample unique pool for weighted allocation)
  const edgeScenarios: Array<{
    cat: QuestionCategory;
    q: string;
    right: string;
    wrongs: [string, string, string];
    why: string;
  }> = [
    {
      cat: 'Debugging',
      q: `You encounter unexpected output while applying "${topic.title}" on empty or nullish data. What is the first engineering check to perform?`,
      right: `Verify input types, boundary conditions (empty/null/zero), and step through values using DevTools or assertions before assuming a syntax bug.`,
      wrongs: [
        'Wrap the entire file in an empty `try {} catch {}` block to hide errors.',
        'Switch all `===` checks to `==` so values coerce automatically.',
        'Add arbitrary `setTimeout(..., 1000)` delays around synchronous statements.',
      ],
      why: `Boundary/type verification isolates root causes cleanly instead of masking bugs.`,
    },
    {
      cat: 'Logical',
      q: `Exam Check (${topic.title}): When writing a clean solution for "${topic.practice.logical.title}", what should you verify before submitting?`,
      right: `Verify standard inputs plus edge cases (empty inputs, zeros, negatives, duplicates) and ensure no unintended mutation of caller inputs.`,
      wrongs: [
        'Hard-code the return value for the single sample test shown in the prompt.',
        'Use global mutable variables so results leak between test runs.',
        'Avoid returning values and only log to the console.',
      ],
      why: `Real test suites verify both visible cases and hidden edge cases without shared mutable state.`,
    },
    {
      cat: 'Scenario',
      q: `Workspace Review (${topic.title}): When implementing "${topic.practice.realLife.title}" in a team codebase, what makes the code production-ready?`,
      right: `Small, readable functions with descriptive names, explicit error/edge-case guards, and clean separation of logic from UI rendering.`,
      wrongs: [
        'Packing all DOM queries, business rules, and network retries into a single 300-line anonymous callback.',
        'Ignoring invalid user input because the UI already has an HTML placeholder.',
        'Skipping error handling to reduce line count.',
      ],
      why: `Production JavaScript prioritizes clarity, defensive input handling, and maintainable modular structure.`,
    },
    {
      cat: 'Practical',
      q: `Code Refactor (${topic.title}): Why is the preferred pattern "${topic.commonMistake.prefer.split('\n')[0].trim()}" safer than "${topic.commonMistake.avoid.split('\n')[0].trim()}"?`,
      right: `It directly eliminates the pitfall: ${topic.commonMistake.label}.`,
      wrongs: [
        'It makes the JavaScript engine skip garbage collection.',
        'It disables strict mode checks across the module.',
        'It forces synchronous network I/O.',
      ],
      why: `${topic.commonMistake.label} — adopting the clean pattern prevents subtle runtime bugs.`,
    },
    {
      cat: 'Conceptual',
      q: `Mental Model (${topic.title}): Which real-world analogy best matches how "${topic.title}" behaves?`,
      right: topic.realWorldAnalogy ?? topic.revisionTldr,
      wrongs: [
        'A static PDF document that can never respond to inputs or state changes.',
        'A hardware GPU shader that bypasses the JavaScript event loop completely.',
        'A CSS stylesheet rule that only controls font color without logic.',
      ],
      why: topic.realWorldAnalogy ?? topic.revisionTldr,
    },
    {
      cat: 'Debugging',
      q: `Production Incident (${topic.title}): A colleague reports a flaky failure related to ${topic.webDevUseCase.toLowerCase()}. Which diagnostic step narrows down the bug fastest?`,
      right: `Reproduce with a minimal isolated input, inspect actual vs expected values at each step, and write a regression test for the failing edge case.`,
      wrongs: [
        'Randomly edit unrelated files until the error message changes.',
        'Delete all unit tests so the build turns green.',
        'Disable browser console warnings.',
      ],
      why: `Minimal reproduction + step-by-step state inspection + regression testing is the reliable debugging workflow.`,
    },
    {
      cat: 'Logical',
      q: `Complexity & Design (${topic.title}): When combining "${topic.title}" with larger datasets in a web app, what is the best habit?`,
      right: `Prefer clear, linear-time single-pass patterns and pure transformations, optimizing hot paths only when data size or profiling demands it.`,
      wrongs: [
        'Always nest three loops inside each render cycle to be thorough.',
        'Mutate shared arrays in place across unrelated components.',
        'Store binary files directly inside URL query parameters.',
      ],
      why: `Clean O(n) transformations keep UIs responsive and easy to maintain.`,
    },
    {
      cat: 'Scenario',
      q: `Architecture Bridge (${topic.title}): How does mastering "${topic.title}" prepare you for full-stack React & Node (MERN) engineering?`,
      right: `It builds the exact core language mechanic behind ${topic.webDevUseCase.toLowerCase()}, which React components and Express APIs rely on daily.`,
      wrongs: [
        'React and Node completely replace JavaScript rules with a different language.',
        'Frameworks automatically fix all JS scoping, mutation, and async bugs for you.',
        'Core JS concepts are only used in browser alerts.',
      ],
      why: `React, Express, and MongoDB drivers are pure JavaScript — strong JS fundamentals directly prevent framework bugs.`,
    },
  ];

  edgeScenarios.forEach((es, idx) => {
    const rotatedIdx = ((topic.number + idx) % 4) as 0 | 1 | 2 | 3;
    const placed: [string, string, string, string] = ['', '', '', ''];
    placed[rotatedIdx] = es.right;
    let c = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) placed[i] = es.wrongs[c++];
    }
    const wrongReasons: Record<number, string> = {};
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) {
        wrongReasons[i] = `That approach introduces reliability, security, or maintainability issues instead of solving the root cause.`;
      }
    }
    specs.push({
      category: es.cat,
      difficulty: idx % 3 === 2 ? 'Advanced' : topic.tier,
      question: es.q,
      options: placed,
      correctIndex: rotatedIdx,
      whyCorrect: es.why,
      wrongOptionReasons: wrongReasons,
    });
  });

  // 8. Code-Example line/behavior inspection drills for extra depth on weight-3 flagship topics
  const codeLines = topic.codeExample
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 8 && !l.startsWith('//'));
  const snippetPreview = codeLines.slice(0, 6).join('\n');

  const extraDrills: Array<{
    cat: QuestionCategory;
    q: string;
    right: string;
    wrongs: [string, string, string];
    why: string;
  }> = [
    {
      cat: 'Practical',
      q: `Study this reference snippet from "${topic.title}". What is its primary engineering goal?`,
      right: topic.summary,
      wrongs: [
        'To block the browser main thread with a synchronous busy-wait loop.',
        'To bypass JavaScript type checking by converting all values to global strings.',
        'To mutate `Object.prototype` globally across all modules.',
      ],
      why: topic.summary,
    },
    {
      cat: 'Output-based',
      q: `Trace Check (${topic.title}): When stepping through the reference example in DevTools, what guarantees predictable output?`,
      right: topic.keyRules[0],
      wrongs: [
        'Relying on undeclared implicit global variables.',
        'Skipping validation and ignoring thrown exceptions.',
        'Assuming asynchronous callbacks always finish before the next synchronous line.',
      ],
      why: topic.keyRules[0],
    },
    {
      cat: 'Debugging',
      q: `PR Review (${topic.title}): Which mistake from "${topic.title}" most frequently slips past manual clicking but gets caught by automated tests?`,
      right: topic.commonMistake.label,
      wrongs: [
        'Using `const` for variables that are never reassigned.',
        'Formatting code with consistent 2-space indentation.',
        'Adding clear JSDoc or TypeScript types to helper functions.',
      ],
      why: `${topic.commonMistake.label}. Automated edge-case tests expose this immediately.`,
    },
    {
      cat: 'Scenario',
      q: `Interview Deep-Dive (${topic.title}): A senior interviewer asks why "${topic.title}" matters in real web apps. What is the strongest concise answer?`,
      right: `${topic.revisionTldr} — directly used for ${topic.webDevUseCase.toLowerCase()}.`,
      wrongs: [
        'It is an obsolete ES3 feature that modern browsers ignore.',
        'It only works inside Node.js and throws errors in browsers.',
        'It is purely syntactic sugar with zero runtime impact.',
      ],
      why: `${topic.revisionTldr}`,
    },
    {
      cat: 'Logical',
      q: `Edge-Case Check (${topic.title}): Which rule MUST stay true even when inputs are empty, repeated, or boundary values?`,
      right: topic.keyRules[topic.keyRules.length - 1],
      wrongs: [
        'Returning `undefined` silently whenever an input array has length 1.',
        'Throwing an uncaught exception on empty arrays instead of handling them gracefully.',
        'Mutating the caller’s input object directly without documenting it.',
      ],
      why: topic.keyRules[topic.keyRules.length - 1],
    },
  ];

  extraDrills.forEach((ed, idx) => {
    const rotatedIdx = ((topic.number + idx + 1) % 4) as 0 | 1 | 2 | 3;
    const placed: [string, string, string, string] = ['', '', '', ''];
    placed[rotatedIdx] = ed.right;
    let c = 0;
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) placed[i] = ed.wrongs[c++];
    }
    const wrongReasons: Record<number, string> = {};
    for (let i = 0; i < 4; i++) {
      if (i !== rotatedIdx) {
        wrongReasons[i] = `That violates JavaScript best practices for "${topic.title}".`;
      }
    }
    specs.push({
      category: ed.cat,
      difficulty: idx % 2 === 0 ? topic.tier : 'Intermediate',
      question: ed.q,
      codeSnippet: idx < 2 ? snippetPreview : undefined,
      options: placed,
      correctIndex: rotatedIdx,
      whyCorrect: ed.why,
      wrongOptionReasons: wrongReasons,
    });
  });

  return specs;
}

export interface SectionBankSummary {
  categoryId: CategoryId;
  totalQuestions: number;
  basePracticeCount: number;
  codingChallengeCount: number;
  baseQuizCount: number;
  richQuizCount: number;
  perTopicTotals: Record<string, number>;
}

export interface BuiltQuestionBanks {
  allCodingChallenges: CodingChallengeItem[];
  allRichQuestions: RichQuizQuestion[];
  sectionSummaries: Record<CategoryId, SectionBankSummary>;
}

/**
 * Builds the complete, weighted question bank across all 8 sections so that:
 * - Every section's sum across subtopics (existing 2 practices + existing 2 quizzes
 *   + executable coding/debug challenges + rich practice/recall questions)
 *   is STRICTLY between 100 and 130 (never exceeding 130!).
 * - Higher `importanceWeight` topics within each section receive proportionally MORE questions.
 */
export function buildWeightedQuestionBanks(): BuiltQuestionBanks {
  const allCodingChallenges: CodingChallengeItem[] = [
    ...CODING_CHALLENGES_PART_1,
    ...CODING_CHALLENGES_PART_2,
    ...CODING_CHALLENGES_PART_3,
  ];

  const codingByTopic = new Map<string, CodingChallengeItem[]>();
  for (const cc of allCodingChallenges) {
    const list = codingByTopic.get(cc.topicId) ?? [];
    list.push(cc);
    codingByTopic.set(cc.topicId, list);
  }

  const coreRichByTopic = new Map<string, RichQuizQuestion[]>();
  for (const rq of RICH_QUESTIONS_CORE) {
    const list = coreRichByTopic.get(rq.topicId) ?? [];
    list.push(rq);
    coreRichByTopic.set(rq.topicId, list);
  }

  const allRichQuestions: RichQuizQuestion[] = [];
  const sectionSummaries = {} as Record<CategoryId, SectionBankSummary>;

  const categories = Array.from(new Set(TOPICS.map((t) => t.categoryId)));

  for (const catId of categories) {
    const secTopics = TOPICS.filter((t) => t.categoryId === catId);
    const targetTotal = SECTION_TARGET_TOTALS[catId];

    // Fixed existing counts per topic: 2 DOM practices + 2 core quizzes + codingChallenges
    const fixedPerTopic = secTopics.map((t) => {
      const codingCount = (codingByTopic.get(t.id) ?? []).length;
      const coreRichCount = (coreRichByTopic.get(t.id) ?? []).length;
      return {
        topic: t,
        weight: t.importanceWeight ?? 2,
        fixed: 4 + codingCount + coreRichCount,
        codingCount,
        coreRichCount,
      };
    });

    const fixedSectionSum = fixedPerTopic.reduce((acc, item) => acc + item.fixed, 0);
    const remainingNeeded = Math.max(0, targetTotal - fixedSectionSum);
    const weightSum = fixedPerTopic.reduce((acc, item) => acc + item.weight, 0);

    // Weighted integer allocation (largest remainder method) so higher-importance topics get more questions
    const rawAlloc = fixedPerTopic.map((item) => {
      const exact = (remainingNeeded * item.weight) / weightSum;
      return {
        ...item,
        extra: Math.floor(exact),
        frac: exact - Math.floor(exact),
      };
    });

    let assigned = rawAlloc.reduce((acc, item) => acc + item.extra, 0);
    const byFrac = [...rawAlloc].sort((a, b) => b.frac - a.frac || b.weight - a.weight);
    let idx = 0;
    while (assigned < remainingNeeded) {
      byFrac[idx % byFrac.length].extra += 1;
      assigned += 1;
      idx += 1;
    }

    const perTopicTotals: Record<string, number> = {};
    let secCoding = 0;
    let secRich = 0;

    for (const alloc of rawAlloc) {
      const t = alloc.topic;
      const coreList = coreRichByTopic.get(t.id) ?? [];
      const templatePool = buildTopicSpecificTemplates(t);

      const topicRich: RichQuizQuestion[] = [...coreList];
      for (let i = 0; i < alloc.extra; i++) {
        const spec = templatePool[i % templatePool.length];
        topicRich.push({
          id: `rq-${t.id}-w${i + 1}`,
          topicId: t.id,
          category: spec.category,
          difficulty: spec.difficulty,
          question:
            i < templatePool.length
              ? spec.question
              : `${spec.question} (Variant ${Math.floor(i / templatePool.length) + 1})`,
          codeSnippet: spec.codeSnippet,
          options: spec.options,
          correctIndex: spec.correctIndex,
          whyCorrect: spec.whyCorrect,
          wrongOptionReasons: spec.wrongOptionReasons,
        });
      }

      allRichQuestions.push(...topicRich);
      secCoding += alloc.codingCount;
      secRich += topicRich.length;
      perTopicTotals[t.id] = 4 + alloc.codingCount + topicRich.length;
    }

    const basePracticeCount = secTopics.length * 2;
    const baseQuizCount = secTopics.length * 2;
    sectionSummaries[catId] = {
      categoryId: catId,
      totalQuestions: basePracticeCount + baseQuizCount + secCoding + secRich,
      basePracticeCount,
      codingChallengeCount: secCoding,
      baseQuizCount,
      richQuizCount: secRich,
      perTopicTotals,
    };
  }

  return {
    allCodingChallenges,
    allRichQuestions,
    sectionSummaries,
  };
}
