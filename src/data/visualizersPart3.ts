import type { VisualizerScenario } from '../types/visualizer';

/**
 * Interactive dry-run visual working explanations for remaining topics in Sections 1–5
 * (t02, t03, t05a, t05, t06a, t06, t10, t11, t12, t14, t15, t16, t17, t19, t20, t21).
 */
export const VISUALIZERS_PART_3: VisualizerScenario[] = [
  // t02: Data Types, Primitives vs Objects & Coercion
  {
    id: 'vis-t02-coercion-trace',
    topicId: 't02-data-types-coercion',
    title: 'Type Coercion & Primitive vs Reference Copy',
    subtitle: 'Watch how `+` vs `-` coerces types and how primitives copy by value while objects share references.',
    focus: 'variables-table',
    codeLines: [
      "const raw = '40';",
      "const concatRes = raw + 5;",
      "const mathRes = Number(raw) + 5;",
      "const subRes = raw - 5;",
      "const isNanCheck = Number.isNaN(Number('abc'));",
      "console.log(concatRes, mathRes, subRes, isNanCheck);",
    ],
    tableColumns: ['Expression', 'Left Type', 'Right Type', 'Result', 'Why'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'String Literal',
        explanation: '`raw` holds the primitive string `"40"` (like any HTML `<input>.value`).',
        variables: [{ name: 'raw', value: '"40"', type: 'string', changed: true }],
        tableRows: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Implicit Concatenation',
        explanation: 'Because the left side is a string, `+` converts `5` into `"5"` and concatenates into `"405"`.',
        variables: [
          { name: 'raw', value: '"40"', type: 'string' },
          { name: 'concatRes', value: '"405"', type: 'string', changed: true },
        ],
        tableRows: [['"40" + 5', 'string', 'number', '"405"', '+ prefers string concat']],
      },
      {
        activeLine: 3,
        phaseLabel: 'Explicit Conversion',
        explanation: '`Number(raw)` converts `"40"` into numeric `40`, so `40 + 5` performs arithmetic addition -> `45`.',
        variables: [
          { name: 'concatRes', value: '"405"', type: 'string' },
          { name: 'mathRes', value: '45', type: 'number', changed: true },
        ],
        tableRows: [
          ['"40" + 5', 'string', 'number', '"405"', '+ prefers string concat'],
          ['Number("40") + 5', 'number', 'number', '45', 'Explicit numeric add'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Numeric-Only Operator',
        explanation: '`-` only works on numbers, so JS implicitly coerces `"40"` to `40` and computes `35`.',
        variables: [
          { name: 'mathRes', value: '45', type: 'number' },
          { name: 'subRes', value: '35', type: 'number', changed: true },
        ],
        tableRows: [
          ['"40" + 5', 'string', 'number', '"405"', '+ prefers string concat'],
          ['Number("40") + 5', 'number', 'number', '45', 'Explicit numeric add'],
          ['"40" - 5', 'string', 'number', '35', '- forces numeric coercion'],
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'Safe NaN Detection',
        explanation: '`Number("abc")` yields `NaN`. Always check with `Number.isNaN(...)` because `NaN === NaN` is `false`.',
        variables: [
          { name: 'subRes', value: '35', type: 'number' },
          { name: 'isNanCheck', value: 'true', type: 'boolean', changed: true },
        ],
        tableRows: [
          ['"40" + 5', 'string', 'number', '"405"', '+ prefers string concat'],
          ['Number("40") + 5', 'number', 'number', '45', 'Explicit numeric add'],
          ['"40" - 5', 'string', 'number', '35', '- forces numeric coercion'],
          ['Number.isNaN(NaN)', 'number', '—', 'true', 'Reliable NaN check'],
        ],
        consoleOutput: ['"405" 45 35 true'],
      },
    ],
  },

  // t03: Operators, ===, Truthy/Falsy & ??
  {
    id: 'vis-t03-nullish-vs-or',
    topicId: 't03-operators-equality',
    title: 'Short-Circuiting: `||` vs `??` vs `===`',
    subtitle: 'Compare how falsy `0` and `""` behave under Logical OR (`||`) versus Nullish Coalescing (`??`).',
    focus: 'variables-table',
    codeLines: [
      'const userConfig = { volume: 0, tag: "" };',
      'const volWithOr = userConfig.volume || 50;',
      'const volWithNullish = userConfig.volume ?? 50;',
      'const tagWithNullish = userConfig.tag ?? "default";',
      'const strictEq = (0 === "0");',
      'console.log({ volWithOr, volWithNullish, tagWithNullish, strictEq });',
    ],
    tableColumns: ['Expression', 'Left Value', 'Falsy?', 'Nullish?', 'Evaluates To'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Input Config',
        explanation: 'The user explicitly muted audio (`volume: 0`) and cleared `tag` (`""`). Both are valid values!',
        variables: [{ name: 'userConfig', value: '{ volume: 0, tag: "" }', type: 'object', changed: true }],
        tableRows: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Logical OR Bug',
        explanation: '`||` checks truthiness. Since `0` is falsy, `0 || 50` overwrites the user’s mute setting with `50`!',
        variables: [{ name: 'volWithOr', value: '50', type: 'number', changed: true }],
        tableRows: [['0 || 50', '0', 'Yes', 'No', '50 (Bug!)']],
      },
      {
        activeLine: 3,
        phaseLabel: 'Nullish Coalescing Fix',
        explanation: '`??` ONLY falls back on `null` or `undefined`. `0` is not nullish, so `0 ?? 50` preserves `0`.',
        variables: [
          { name: 'volWithOr', value: '50', type: 'number' },
          { name: 'volWithNullish', value: '0', type: 'number', changed: true },
        ],
        tableRows: [
          ['0 || 50', '0', 'Yes', 'No', '50 (Bug!)'],
          ['0 ?? 50', '0', 'Yes', 'No', '0 (Preserved)'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Empty String Preserved',
        explanation: '`""` is falsy for `||`, but non-nullish for `??`, so `"" ?? "default"` stays `""`.',
        variables: [{ name: 'tagWithNullish', value: '""', type: 'string', changed: true }],
        tableRows: [
          ['0 || 50', '0', 'Yes', 'No', '50 (Bug!)'],
          ['0 ?? 50', '0', 'Yes', 'No', '0 (Preserved)'],
          ['"" ?? "default"', '""', 'Yes', 'No', '"" (Preserved)'],
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'Strict Equality',
        explanation: '`0 === "0"` compares types FIRST (`number !== string`) and immediately returns `false` without coercion.',
        variables: [{ name: 'strictEq', value: 'false', type: 'boolean', changed: true }],
        tableRows: [
          ['0 || 50', '0', 'Yes', 'No', '50 (Bug!)'],
          ['0 ?? 50', '0', 'Yes', 'No', '0 (Preserved)'],
          ['"" ?? "default"', '""', 'Yes', 'No', '"" (Preserved)'],
          ['0 === "0"', '0', '—', '—', 'false (different types)'],
        ],
        consoleOutput: ['{ volWithOr: 50, volWithNullish: 0, tagWithNullish: "", strictEq: false }'],
      },
    ],
  },

  // t05a: String Foundations
  {
    id: 'vis-t05a-string-loop',
    topicId: 't05a-string-foundations',
    title: 'String Indexing, Immutability & Character Loop',
    subtitle: 'Trace character-by-character traversal and see why strings build new values instead of mutating.',
    focus: 'variables-table',
    codeLines: [
      "const word = 'JS!';",
      "let reversed = '';",
      'for (let i = word.length - 1; i >= 0; i--) {',
      '  reversed += word[i];',
      '}',
      'console.log(word, reversed);',
    ],
    tableColumns: ['Step', 'i', 'word[i]', 'reversed before', 'reversed after'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Initialize String',
        explanation: '`"JS!"` has indices `0:"J"`, `1:"S"`, `2:"!"` and `word.length === 3`.',
        variables: [
          { name: 'word', value: '"JS!"', type: 'string', changed: true },
          { name: 'word.length', value: '3', type: 'number' },
        ],
        tableRows: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Iteration 1 (i = 2)',
        explanation: 'Reads `word[2]` (`"!"`) and creates a new string `"!"`. `word` itself never changes.',
        variables: [
          { name: 'i', value: '2', type: 'number', changed: true },
          { name: 'reversed', value: '"!"', type: 'string', changed: true },
        ],
        tableRows: [['1', '2', '"!"', '""', '"!"']],
      },
      {
        activeLine: 4,
        phaseLabel: 'Iteration 2 (i = 1)',
        explanation: 'Appends `word[1]` (`"S"`) -> `reversed` becomes `"!S"`.',
        variables: [
          { name: 'i', value: '1', type: 'number', changed: true },
          { name: 'reversed', value: '"!S"', type: 'string', changed: true },
        ],
        tableRows: [
          ['1', '2', '"!"', '""', '"!"'],
          ['2', '1', '"S"', '"!"', '"!S"'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Iteration 3 (i = 0)',
        explanation: 'Appends `word[0]` (`"J"`) -> `reversed` becomes `"!SJ"`. Next `i--` makes `i = -1`, ending loop.',
        variables: [
          { name: 'i', value: '0', type: 'number', changed: true },
          { name: 'reversed', value: '"!SJ"', type: 'string', changed: true },
        ],
        tableRows: [
          ['1', '2', '"!"', '""', '"!"'],
          ['2', '1', '"S"', '"!"', '"!S"'],
          ['3', '0', '"J"', '"!S"', '"!SJ"'],
        ],
        consoleOutput: ['"JS!" "!SJ"'],
      },
    ],
  },

  // t05: String Built-in Methods
  {
    id: 'vis-t05-string-pipeline',
    topicId: 't05-string-methods',
    title: 'Chaining String Methods (trim → slice → replaceAll → split)',
    subtitle: 'See how every string method returns a brand-new string while leaving the original untouched.',
    focus: 'variables-table',
    codeLines: [
      "const raw = '  user:ada_lovelace  ';",
      'const trimmed = raw.trim();',
      'const username = trimmed.slice(5);',
      "const clean = username.replaceAll('_', ' ');",
      "const parts = clean.split(' ');",
    ],
    tableColumns: ['Method Call', 'Input', 'Return Value', 'Original Mutated?'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Raw Input',
        explanation: 'Raw user string contains leading/trailing spaces and a prefix `"user:"`.',
        variables: [{ name: 'raw', value: '"  user:ada_lovelace  "', type: 'string', changed: true }],
        tableRows: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'trim()',
        explanation: '`.trim()` strips whitespace from both ends without changing `raw`.',
        variables: [{ name: 'trimmed', value: '"user:ada_lovelace"', type: 'string', changed: true }],
        tableRows: [['.trim()', '"  user:ada_lovelace  "', '"user:ada_lovelace"', 'No']],
      },
      {
        activeLine: 3,
        phaseLabel: 'slice(5)',
        explanation: '`.slice(5)` extracts from index 5 to the end, removing `"user:"`.',
        variables: [{ name: 'username', value: '"ada_lovelace"', type: 'string', changed: true }],
        tableRows: [
          ['.trim()', '"  user:ada_lovelace  "', '"user:ada_lovelace"', 'No'],
          ['.slice(5)', '"user:ada_lovelace"', '"ada_lovelace"', 'No'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'replaceAll()',
        explanation: '`.replaceAll("_", " ")` replaces every underscore with a space.',
        variables: [{ name: 'clean', value: '"ada lovelace"', type: 'string', changed: true }],
        tableRows: [
          ['.trim()', '"  user:ada_lovelace  "', '"user:ada_lovelace"', 'No'],
          ['.slice(5)', '"user:ada_lovelace"', '"ada_lovelace"', 'No'],
          ['.replaceAll("_", " ")', '"ada_lovelace"', '"ada lovelace"', 'No'],
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'split(" ")',
        explanation: '`.split(" ")` converts the string into an array of tokens `["ada", "lovelace"]`.',
        variables: [{ name: 'parts', value: '["ada", "lovelace"]', type: 'array', changed: true }],
        tableRows: [
          ['.trim()', '"  user:ada_lovelace  "', '"user:ada_lovelace"', 'No'],
          ['.slice(5)', '"user:ada_lovelace"', '"ada_lovelace"', 'No'],
          ['.replaceAll("_", " ")', '"ada_lovelace"', '"ada lovelace"', 'No'],
          ['.split(" ")', '"ada lovelace"', '["ada", "lovelace"]', 'No'],
        ],
      },
    ],
  },

  // t06a: Array Foundations
  {
    id: 'vis-t06a-array-index-loop',
    topicId: 't06a-array-foundations',
    title: 'Array Memory Slots & Finding Max with a `for` Loop',
    subtitle: 'Track index `i`, `scores[i]`, and `max` across every iteration of a classic `for` loop.',
    focus: 'variables-table',
    codeLines: [
      'const scores = [42, 88, 65, 95];',
      'let max = scores[0];',
      'for (let i = 1; i < scores.length; i++) {',
      '  if (scores[i] > max) max = scores[i];',
      '}',
      'console.log(max);',
    ],
    tableColumns: ['i', 'scores[i]', 'max before', 'scores[i] > max?', 'max after'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Seed Max with Index 0',
        explanation: 'Initializing `max = scores[0]` (`42`) avoids bugs with all-negative arrays.',
        variables: [{ name: 'max', value: '42', type: 'number', changed: true }],
        tableRows: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Check Index 1',
        explanation: '`scores[1]` is `88`. Since `88 > 42` is `true`, `max` updates to `88`.',
        variables: [
          { name: 'i', value: '1', type: 'number', changed: true },
          { name: 'max', value: '88', type: 'number', changed: true },
        ],
        tableRows: [['1', '88', '42', 'Yes', '88']],
      },
      {
        activeLine: 4,
        phaseLabel: 'Check Index 2',
        explanation: '`scores[2]` is `65`. Since `65 > 88` is `false`, `max` stays `88`.',
        variables: [
          { name: 'i', value: '2', type: 'number', changed: true },
          { name: 'max', value: '88', type: 'number' },
        ],
        tableRows: [
          ['1', '88', '42', 'Yes', '88'],
          ['2', '65', '88', 'No', '88'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Check Index 3',
        explanation: '`scores[3]` is `95`. Since `95 > 88` is `true`, `max` becomes `95`. Loop finishes.',
        variables: [
          { name: 'i', value: '3', type: 'number', changed: true },
          { name: 'max', value: '95', type: 'number', changed: true },
        ],
        tableRows: [
          ['1', '88', '42', 'Yes', '88'],
          ['2', '65', '88', 'No', '88'],
          ['3', '95', '88', 'Yes', '95'],
        ],
        consoleOutput: ['95'],
      },
    ],
  },

  // t06: Inbuilt Array Methods (Mutating vs Non-Mutating)
  {
    id: 'vis-t06-slice-vs-splice',
    topicId: 't06-array-basics-methods',
    title: 'Mutating (`push`, `splice`, `sort`) vs Non-Mutating (`slice`, `concat`)',
    subtitle: 'Watch what each array method RETURNS versus whether it mutates the original array in place.',
    focus: 'variables-table',
    codeLines: [
      'const arr = [10, 20, 30, 40];',
      'const sliced = arr.slice(1, 3);',
      'const removed = arr.splice(1, 2);',
      'const newLen = arr.push(5);',
      'const sorted = [...arr].sort((a, b) => a - b);',
    ],
    tableColumns: ['Operation', 'Return Value', 'arr After Call', 'Mutates arr?'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Start Array',
        explanation: '`arr` starts with 4 numbers: `[10, 20, 30, 40]`.',
        variables: [{ name: 'arr', value: '[10, 20, 30, 40]', type: 'array', changed: true }],
        tableRows: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'slice(1, 3) — Safe Copy',
        explanation: '`.slice(1, 3)` returns `[20, 30]` (index 3 excluded) and leaves `arr` completely untouched.',
        variables: [
          { name: 'sliced', value: '[20, 30]', type: 'array', changed: true },
          { name: 'arr', value: '[10, 20, 30, 40]', type: 'array' },
        ],
        tableRows: [['arr.slice(1, 3)', '[20, 30]', '[10, 20, 30, 40]', 'No']],
      },
      {
        activeLine: 3,
        phaseLabel: 'splice(1, 2) — Mutates!',
        explanation: '`.splice(1, 2)` removes 2 elements starting at index 1, mutating `arr` down to `[10, 40]`.',
        variables: [
          { name: 'removed', value: '[20, 30]', type: 'array', changed: true },
          { name: 'arr', value: '[10, 40]', type: 'array', changed: true },
        ],
        tableRows: [
          ['arr.slice(1, 3)', '[20, 30]', '[10, 20, 30, 40]', 'No'],
          ['arr.splice(1, 2)', '[20, 30]', '[10, 40]', 'YES'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'push(5) Returns Length',
        explanation: '`.push(5)` appends `5` to `arr` and returns the NEW length (`3`), not the array.',
        variables: [
          { name: 'newLen', value: '3', type: 'number', changed: true },
          { name: 'arr', value: '[10, 40, 5]', type: 'array', changed: true },
        ],
        tableRows: [
          ['arr.slice(1, 3)', '[20, 30]', '[10, 20, 30, 40]', 'No'],
          ['arr.splice(1, 2)', '[20, 30]', '[10, 40]', 'YES'],
          ['arr.push(5)', '3 (length)', '[10, 40, 5]', 'YES'],
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'Safe Numeric Sort',
        explanation: 'Copying with `[...arr]` before `.sort((a, b) => a - b)` sorts numerically (`[5, 10, 40]`) without mutating `arr`.',
        variables: [
          { name: 'sorted', value: '[5, 10, 40]', type: 'array', changed: true },
          { name: 'arr', value: '[10, 40, 5]', type: 'array' },
        ],
        tableRows: [
          ['arr.slice(1, 3)', '[20, 30]', '[10, 20, 30, 40]', 'No'],
          ['arr.splice(1, 2)', '[20, 30]', '[10, 40]', 'YES'],
          ['arr.push(5)', '3 (length)', '[10, 40, 5]', 'YES'],
          ['[...arr].sort(a-b)', '[5, 10, 40]', '[10, 40, 5]', 'No (copied)'],
        ],
      },
    ],
  },

  // t10: Functions & Default Parameters
  {
    id: 'vis-t10-callstack-defaults',
    topicId: 't10-functions-defaults',
    title: 'Call Stack Frames & Default Parameter Triggering',
    subtitle: 'See how a function frame pushes onto the Call Stack and why `undefined` triggers defaults while `null` does not.',
    focus: 'call-stack-scope',
    codeLines: [
      "function greet(name = 'Guest', role = 'User') {",
      '  return `${name} (${role})`;',
      '}',
      'const a = greet(undefined, "Admin");',
      'const b = greet(null);',
    ],
    steps: [
      {
        activeLine: 4,
        phaseLabel: 'Call greet(undefined, "Admin")',
        explanation: 'Pushes `greet` frame onto the Call Stack. Passing `undefined` activates the default `name = "Guest"`.',
        callStack: [
          { frame: 'Global Execution Context', status: 'paused' },
          { frame: 'greet(undefined, "Admin")', status: 'running' },
        ],
        scopes: [
          {
            name: 'greet() Local Scope',
            kind: 'function',
            bindings: [
              { key: 'name', value: '"Guest" (default used)', changed: true },
              { key: 'role', value: '"Admin"', changed: true },
            ],
          },
        ],
      },
      {
        activeLine: 2,
        phaseLabel: 'Return & Pop Frame',
        explanation: '`greet` returns `"Guest (Admin)"` to `a` and pops off the Call Stack.',
        callStack: [{ frame: 'Global Execution Context', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [{ key: 'a', value: '"Guest (Admin)"', changed: true }],
          },
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'Call greet(null)',
        explanation: '`null` is an explicit value (NOT `undefined`), so `name` stays `null` while omitted `role` defaults to `"User"`.',
        callStack: [
          { frame: 'Global Execution Context', status: 'paused' },
          { frame: 'greet(null)', status: 'running' },
        ],
        scopes: [
          {
            name: 'greet() Local Scope',
            kind: 'function',
            bindings: [
              { key: 'name', value: 'null (default NOT used!)', changed: true },
              { key: 'role', value: '"User" (default used)', changed: true },
            ],
          },
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'Done',
        explanation: 'Frame pops and `b` receives `"null (User)"`. Remember: default params ONLY fire on `undefined`.',
        callStack: [{ frame: 'Global Execution Context', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'a', value: '"Guest (Admin)"' },
              { key: 'b', value: '"null (User)"', changed: true },
            ],
          },
        ],
      },
    ],
  },

  // t11: Arrow Functions
  {
    id: 'vis-t11-arrow-returns',
    topicId: 't11-arrow-functions',
    title: 'Arrow Function Implicit Returns & Object Literal Gotcha',
    subtitle: 'See why `=> { id: 1 }` returns `undefined` while `=> ({ id: 1 })` returns an object.',
    focus: 'variables-table',
    codeLines: [
      'const double = (n) => n * 2;',
      'const broken = (id) => { id: id };',
      'const fixed = (id) => ({ id });',
      'console.log(double(6), broken(1), fixed(1));',
    ],
    tableColumns: ['Function', 'Body Syntax', 'Parsed As', 'Return Value'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Concise Expression',
        explanation: 'No `{}` braces means `n * 2` is evaluated and implicitly returned (`12`).',
        variables: [{ name: 'double(6)', value: '12', type: 'number', changed: true }],
        tableRows: [['double(6)', 'n * 2', 'Expression', '12']],
      },
      {
        activeLine: 2,
        phaseLabel: 'Block Mis-Parse Trap',
        explanation: 'JS parses `{ id: id }` as a function BLOCK with label `id:` and no `return` statement -> `undefined`!',
        variables: [{ name: 'broken(1)', value: 'undefined', type: 'undefined', changed: true }],
        tableRows: [
          ['double(6)', 'n * 2', 'Expression', '12'],
          ['broken(1)', '{ id: id }', 'Block statement (no return)', 'undefined'],
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Parenthesized Object Literal',
        explanation: 'Wrapping `({ id })` in parentheses forces expression mode, returning `{ id: 1 }`.',
        variables: [{ name: 'fixed(1)', value: '{ id: 1 }', type: 'object', changed: true }],
        tableRows: [
          ['double(6)', 'n * 2', 'Expression', '12'],
          ['broken(1)', '{ id: id }', 'Block statement (no return)', 'undefined'],
          ['fixed(1)', '({ id })', 'Object expression', '{ id: 1 }'],
        ],
        consoleOutput: ['12 undefined { id: 1 }'],
      },
    ],
  },

  // t12: Callbacks & Higher-Order Functions
  {
    id: 'vis-t12-callback-hof',
    topicId: 't12-callbacks-hof',
    title: 'How a Higher-Order Function Invokes Your Callback',
    subtitle: 'Watch the Call Stack jump into the passed callback function on every element.',
    focus: 'call-stack-scope',
    codeLines: [
      'function applyToAll(arr, transform) {',
      '  const out = [];',
      '  for (const x of arr) out.push(transform(x));',
      '  return out;',
      '}',
      'const res = applyToAll([2, 5], (n) => n * 10);',
    ],
    steps: [
      {
        activeLine: 6,
        phaseLabel: 'Pass Function as Value',
        explanation: 'The arrow function `(n) => n * 10` is NOT called yet — its reference is passed as `transform`.',
        callStack: [{ frame: 'Global', status: 'running' }],
        scopes: [
          { name: 'Global', kind: 'global', bindings: [{ key: 'transform arg', value: 'fn (n) => n * 10', changed: true }] },
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Callback Invocation #1 (x = 2)',
        explanation: '`applyToAll` calls `transform(2)` -> pushes callback onto stack -> returns `20` -> `out = [20]`.',
        callStack: [
          { frame: 'Global', status: 'paused' },
          { frame: 'applyToAll([2, 5], fn)', status: 'paused' },
          { frame: 'transform(2) -> 20', status: 'running' },
        ],
        scopes: [
          { name: 'applyToAll', kind: 'function', bindings: [{ key: 'x', value: '2' }, { key: 'out', value: '[20]', changed: true }] },
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Callback Invocation #2 (x = 5)',
        explanation: '`applyToAll` calls `transform(5)` -> returns `50` -> `out = [20, 50]`.',
        callStack: [
          { frame: 'Global', status: 'paused' },
          { frame: 'applyToAll([2, 5], fn)', status: 'paused' },
          { frame: 'transform(5) -> 50', status: 'running' },
        ],
        scopes: [
          { name: 'applyToAll', kind: 'function', bindings: [{ key: 'x', value: '5', changed: true }, { key: 'out', value: '[20, 50]', changed: true }] },
        ],
      },
      {
        activeLine: 6,
        phaseLabel: 'Return Final Result',
        explanation: '`applyToAll` pops off the stack and assigns `[20, 50]` to `res`.',
        callStack: [{ frame: 'Global', status: 'running' }],
        scopes: [
          { name: 'Global', kind: 'global', bindings: [{ key: 'res', value: '[20, 50]', changed: true }] },
        ],
      },
    ],
  },

  // t14: Object Notations & Methods
  {
    id: 'vis-t14-object-heap',
    topicId: 't14-object-notations-methods',
    title: 'Nested Object Notation, Computed Keys & Methods in Heap',
    subtitle: 'Visualize how dot notation, bracket notation, and nested objects resolve on the Heap.',
    focus: 'memory-heap',
    codeLines: [
      "const field = 'role';",
      "const user = { name: 'Asha', meta: { plan: 'pro' } };",
      "user[field] = 'admin';",
      "user.meta.plan = 'enterprise';",
      "console.log(user.name, user['role'], user.meta.plan);",
    ],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Allocate Nested Heap Objects',
        explanation: '`user` points to `#obj1`, and `user.meta` points to a separate nested heap object `#obj2`.',
        memory: {
          stack: [
            { name: 'field', value: '"role"' },
            { name: 'user', value: 'ref -> #obj1', refId: '#obj1', changed: true },
          ],
          heap: [
            { id: '#obj1', label: 'user Object', entries: [{ key: 'name', value: '"Asha"' }, { key: 'meta', value: 'ref -> #obj2', refId: '#obj2' }] },
            { id: '#obj2', label: 'meta Object', entries: [{ key: 'plan', value: '"pro"' }] },
          ],
        },
      },
      {
        activeLine: 3,
        phaseLabel: 'Dynamic Bracket Assignment',
        explanation: '`user[field]` evaluates `field` to `"role"` and adds `role: "admin"` onto `#obj1`.',
        memory: {
          stack: [
            { name: 'field', value: '"role"' },
            { name: 'user', value: 'ref -> #obj1', refId: '#obj1' },
          ],
          heap: [
            { id: '#obj1', label: 'user Object', entries: [{ key: 'name', value: '"Asha"' }, { key: 'meta', value: 'ref -> #obj2', refId: '#obj2' }, { key: 'role', value: '"admin"', changed: true }] },
            { id: '#obj2', label: 'meta Object', entries: [{ key: 'plan', value: '"pro"' }] },
          ],
        },
      },
      {
        activeLine: 4,
        phaseLabel: 'Mutate Nested Property',
        explanation: '`user.meta.plan` follows `#obj1 -> #obj2` and updates `plan` to `"enterprise"`.',
        memory: {
          stack: [{ name: 'user', value: 'ref -> #obj1', refId: '#obj1' }],
          heap: [
            { id: '#obj1', label: 'user Object', entries: [{ key: 'name', value: '"Asha"' }, { key: 'meta', value: 'ref -> #obj2', refId: '#obj2' }, { key: 'role', value: '"admin"' }] },
            { id: '#obj2', label: 'meta Object', entries: [{ key: 'plan', value: '"enterprise"', changed: true }] },
          ],
        },
        consoleOutput: ['"Asha" "admin" "enterprise"'],
      },
    ],
  },

  // t15: Array of Objects
  {
    id: 'vis-t15-array-objects-pipeline',
    topicId: 't15-array-of-objects',
    title: 'Transforming an Array of Objects (`filter` → `map`)',
    subtitle: 'Step through how an array of API records filters active items and projects names.',
    focus: 'variables-table',
    codeLines: [
      "const items = [{ id: 1, name: 'Pen', ok: true }, { id: 2, name: 'Ink', ok: false }, { id: 3, name: 'Pad', ok: true }];",
      'const active = items.filter((i) => i.ok);',
      'const names = active.map((i) => i.name);',
    ],
    tableColumns: ['Stage', 'Item Examined', 'Condition / Projection', 'Output Array'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Source Records',
        explanation: 'Starts with 3 object records (typical JSON array returned from a REST API).',
        variables: [{ name: 'items.length', value: '3', type: 'number', changed: true }],
        tableRows: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'filter(i => i.ok)',
        explanation: 'Keeps `{ id: 1, Pen }` and `{ id: 3, Pad }`, skipping `{ id: 2, Ink }` where `ok === false`.',
        variables: [{ name: 'active', value: '[{id:1, Pen}, {id:3, Pad}]', type: 'array', changed: true }],
        tableRows: [
          ['filter', 'Pen (ok: true)', 'Keep', '[Pen]'],
          ['filter', 'Ink (ok: false)', 'Drop', '[Pen]'],
          ['filter', 'Pad (ok: true)', 'Keep', '[Pen, Pad]'],
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'map(i => i.name)',
        explanation: 'Extracts the `.name` string from each surviving object into `["Pen", "Pad"]`.',
        variables: [{ name: 'names', value: '["Pen", "Pad"]', type: 'array', changed: true }],
        tableRows: [
          ['filter', '3 objects', 'i.ok === true', '2 objects'],
          ['map', '2 objects', 'i.name', '["Pen", "Pad"]'],
        ],
      },
    ],
  },

  // t16: Destructuring & Optional Chaining
  {
    id: 'vis-t16-destructuring-optional',
    topicId: 't16-destructuring-optional',
    title: 'Destructuring Defaults & Optional Chaining Short-Circuit',
    subtitle: 'See how `?.` safely stops at `null`/`undefined` instead of throwing a TypeError.',
    focus: 'variables-table',
    codeLines: [
      "const res = { user: { name: 'Dev' } };",
      "const { name, role = 'member' } = res.user;",
      "const city = res.user?.address?.city ?? 'Unknown';",
      'console.log(name, role, city);',
    ],
    tableColumns: ['Binding', 'Lookup Path', 'Found?', 'Assigned Value'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Object Destructuring',
        explanation: 'Extracts `name` (`"Dev"`) and applies default `"member"` because `res.user.role` is `undefined`.',
        variables: [
          { name: 'name', value: '"Dev"', type: 'string', changed: true },
          { name: 'role', value: '"member"', type: 'string', changed: true },
        ],
        tableRows: [
          ['name', 'res.user.name', 'Yes', '"Dev"'],
          ['role', 'res.user.role', 'No (undefined)', '"member" (default)'],
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Optional Chaining Short-Circuit',
        explanation: '`res.user?.address` is `undefined`. Instead of crashing on `.city`, `?.` short-circuits to `undefined`, and `??` falls back to `"Unknown"`.',
        variables: [{ name: 'city', value: '"Unknown"', type: 'string', changed: true }],
        tableRows: [
          ['name', 'res.user.name', 'Yes', '"Dev"'],
          ['role', 'res.user.role', 'No (undefined)', '"member" (default)'],
          ['city', 'res.user?.address?.city', 'Short-circuited', '"Unknown" (via ??)'],
        ],
        consoleOutput: ['"Dev" "member" "Unknown"'],
      },
    ],
  },

  // t17: Rest & Spread
  {
    id: 'vis-t17-rest-spread',
    topicId: 't17-rest-spread',
    title: 'Spread (Expand Out) vs Rest (Collect In)',
    subtitle: 'Distinguish `...` on the right side (spreading) from `...` on the left side (collecting).',
    focus: 'variables-table',
    codeLines: [
      'const base = { theme: "light", font: 14 };',
      'const updated = { ...base, theme: "dark" };',
      'const { theme, ...otherPrefs } = updated;',
      'const nums = [1, ...[2, 3], 4];',
    ],
    tableColumns: ['Line', 'Syntax Role', 'Input', 'Result'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Object Spread (Right Side)',
        explanation: '`...base` copies all keys into a new object; later key `theme: "dark"` overrides `"light"` without mutating `base`.',
        variables: [
          { name: 'base.theme', value: '"light"', type: 'string' },
          { name: 'updated', value: '{ theme: "dark", font: 14 }', type: 'object', changed: true },
        ],
        tableRows: [['Line 2', 'Spread (expand)', 'base + override', '{ theme: "dark", font: 14 }']],
      },
      {
        activeLine: 3,
        phaseLabel: 'Object Rest (Left Side)',
        explanation: '`...otherPrefs` collects all remaining keys NOT explicitly destructured (`{ font: 14 }`).',
        variables: [
          { name: 'theme', value: '"dark"', type: 'string', changed: true },
          { name: 'otherPrefs', value: '{ font: 14 }', type: 'object', changed: true },
        ],
        tableRows: [
          ['Line 2', 'Spread (expand)', 'base + override', '{ theme: "dark", font: 14 }'],
          ['Line 3', 'Rest (collect)', 'updated without theme', '{ font: 14 }'],
        ],
      },
      {
        activeLine: 4,
        phaseLabel: 'Array Spread',
        explanation: '`...[2, 3]` unpacks elements inline into `[1, 2, 3, 4]`.',
        variables: [{ name: 'nums', value: '[1, 2, 3, 4]', type: 'array', changed: true }],
        tableRows: [
          ['Line 2', 'Spread (expand)', 'base + override', '{ theme: "dark", font: 14 }'],
          ['Line 3', 'Rest (collect)', 'updated without theme', '{ font: 14 }'],
          ['Line 4', 'Array Spread', '[1, ...[2, 3], 4]', '[1, 2, 3, 4]'],
        ],
      },
    ],
  },

  // t19: this, call, apply, bind
  {
    id: 'vis-t19-this-binding',
    topicId: 't19-this-call-apply-bind',
    title: 'How `this` Changes Across Method Call, Detached Call & `.bind()`',
    subtitle: 'Track the `this` receiver inside the Execution Context at each call site.',
    focus: 'call-stack-scope',
    codeLines: [
      "const bot = { id: 'B1', ping() { return this?.id; } };",
      'const a = bot.ping();',
      'const detached = bot.ping;',
      'const b = detached();',
      "const c = detached.call({ id: 'B2' });",
      'const bound = bot.ping.bind(bot);',
      'const d = bound();',
    ],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Implicit Receiver (`bot.ping()`)',
        explanation: 'Called with `bot.` before the dot -> `this` is `bot`, returning `"B1"`.',
        callStack: [{ frame: 'bot.ping() [this = bot]', status: 'running' }],
        scopes: [{ name: 'Execution Context', kind: 'function', bindings: [{ key: 'this', value: '{ id: "B1" }', changed: true }, { key: 'a', value: '"B1"', changed: true }] }],
      },
      {
        activeLine: 4,
        phaseLabel: 'Lost `this` (Detached Call)',
        explanation: 'Calling `detached()` without a receiver sets `this` to `undefined` in strict mode -> returns `undefined`.',
        callStack: [{ frame: 'detached() [this = undefined]', status: 'running' }],
        scopes: [{ name: 'Execution Context', kind: 'function', bindings: [{ key: 'this', value: 'undefined', changed: true }, { key: 'b', value: 'undefined', changed: true }] }],
      },
      {
        activeLine: 5,
        phaseLabel: 'Explicit `.call({ id: "B2" })`',
        explanation: '`.call()` immediately invokes the function with the supplied object as `this` -> returns `"B2"`.',
        callStack: [{ frame: 'detached.call({ id: "B2" })', status: 'running' }],
        scopes: [{ name: 'Execution Context', kind: 'function', bindings: [{ key: 'this', value: '{ id: "B2" }', changed: true }, { key: 'c', value: '"B2"', changed: true }] }],
      },
      {
        activeLine: 7,
        phaseLabel: 'Permanently Bound via `.bind(bot)`',
        explanation: '`bound()` permanently locks `this = bot` even when invoked standalone -> returns `"B1"`.',
        callStack: [{ frame: 'bound() [this = bot (locked)]', status: 'running' }],
        scopes: [{ name: 'Execution Context', kind: 'closure', retained: true, bindings: [{ key: 'this', value: '{ id: "B1" }', changed: true }, { key: 'd', value: '"B1"', changed: true }] }],
      },
    ],
  },

  // t20: Prototypes & Chain
  {
    id: 'vis-t20-prototype-lookup',
    topicId: 't20-prototypes-chain',
    title: 'Prototype Chain Property Lookup (`Object.create`)',
    subtitle: 'Watch JS walk from own properties up `[[Prototype]]` to find inherited methods.',
    focus: 'memory-heap',
    codeLines: [
      "const animal = { speak() { return this.sound; } };",
      'const dog = Object.create(animal);',
      "dog.sound = 'Woof';",
      'const out = dog.speak();',
    ],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Link [[Prototype]]',
        explanation: '`Object.create(animal)` allocates `#dog` with its hidden `[[Prototype]]` pointing to `#animal`.',
        memory: {
          stack: [
            { name: 'animal', value: 'ref -> #animal', refId: '#animal' },
            { name: 'dog', value: 'ref -> #dog', refId: '#dog', changed: true },
          ],
          heap: [
            { id: '#dog', label: 'dog instance', entries: [{ key: '[[Prototype]]', value: 'ref -> #animal', refId: '#animal', changed: true }] },
            { id: '#animal', label: 'animal prototype', entries: [{ key: 'speak', value: 'fn() { return this.sound }' }] },
          ],
        },
      },
      {
        activeLine: 3,
        phaseLabel: 'Own Property on dog',
        explanation: '`dog.sound = "Woof"` creates an OWN property directly on `#dog` (leaving `#animal` untouched).',
        memory: {
          stack: [{ name: 'dog', value: 'ref -> #dog', refId: '#dog' }],
          heap: [
            { id: '#dog', label: 'dog instance', entries: [{ key: 'sound (own)', value: '"Woof"', changed: true }, { key: '[[Prototype]]', value: 'ref -> #animal', refId: '#animal' }] },
            { id: '#animal', label: 'animal prototype', entries: [{ key: 'speak', value: 'fn() { return this.sound }' }] },
          ],
        },
      },
      {
        activeLine: 4,
        phaseLabel: 'Delegated Lookup + `this = dog`',
        explanation: '`speak` is not own on `#dog` -> JS follows `[[Prototype]]` to `#animal`, invokes `speak` with `this = dog`, reading `dog.sound` (`"Woof"`).',
        memory: {
          stack: [{ name: 'out', value: '"Woof"', changed: true }],
          heap: [
            { id: '#dog', label: 'dog instance (this)', entries: [{ key: 'sound (own)', value: '"Woof"' }, { key: '[[Prototype]]', value: 'ref -> #animal', refId: '#animal' }] },
            { id: '#animal', label: 'animal prototype (found speak)', entries: [{ key: 'speak', value: 'returns "Woof"', changed: true }] },
          ],
        },
      },
    ],
  },

  // t21: ES6 Classes & super()
  {
    id: 'vis-t21-class-super',
    topicId: 't21-es6-classes-super',
    title: 'Class Construction & `super()` Inheritance Flow',
    subtitle: 'Trace how `new Savings(100, 0.1)` initializes parent fields via `super()` before subclass fields.',
    focus: 'call-stack-scope',
    codeLines: [
      'class Account { constructor(bal) { this.bal = bal; } }',
      'class Savings extends Account {',
      '  constructor(bal, rate) { super(bal); this.rate = rate; }',
      '  grow() { this.bal += this.bal * this.rate; }',
      '}',
      'const acc = new Savings(100, 0.1);',
      'acc.grow();',
    ],
    steps: [
      {
        activeLine: 3,
        phaseLabel: 'Enter Savings Constructor -> super(100)',
        explanation: 'A subclass MUST call `super(bal)` first so the parent `Account` constructor creates and initializes `this`.',
        callStack: [
          { frame: 'new Savings(100, 0.1)', status: 'paused' },
          { frame: 'Account.constructor(100)', status: 'running' },
        ],
        scopes: [{ name: 'this (instance)', kind: 'function', bindings: [{ key: 'this.bal', value: '100', changed: true }] }],
      },
      {
        activeLine: 3,
        phaseLabel: 'Attach Subclass Field',
        explanation: '`super()` returns; now `Savings` safely attaches `this.rate = 0.1`.',
        callStack: [{ frame: 'new Savings(100, 0.1)', status: 'running' }],
        scopes: [{ name: 'this (instance)', kind: 'function', bindings: [{ key: 'this.bal', value: '100' }, { key: 'this.rate', value: '0.1', changed: true }] }],
      },
      {
        activeLine: 7,
        phaseLabel: 'Method Call acc.grow()',
        explanation: '`acc.grow()` runs from `Savings.prototype` with `this = acc`, updating `bal` from `100` to `110`.',
        callStack: [{ frame: 'acc.grow()', status: 'running' }],
        scopes: [{ name: 'acc (instance)', kind: 'function', bindings: [{ key: 'acc.bal', value: '110', changed: true }, { key: 'acc.rate', value: '0.1' }] }],
      },
    ],
  },
];
