import type { VisualizerScenario } from '../types/visualizer';

export const VISUALIZERS_PART_1: VisualizerScenario[] = [
  // 1. Hoisting, TDZ & Block Scope (Topic 01)
  {
    id: 'vis-hoisting-tdz',
    topicId: 't01-variables-hoisting',
    title: 'Creation Phase, Hoisting & Block Scope Trace',
    subtitle: 'See why `var` starts as `undefined` while `let`/`const` sit in the Temporal Dead Zone.',
    focus: 'call-stack-scope',
    codeLines: [
      'console.log(legacy);',
      'var legacy = "ready";',
      'let total = 10;',
      'if (true) {',
      '  let total = 99;',
      '  var leaked = "escaped";',
      '}',
      'console.log(total, leaked);',
    ],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Creation Phase (Before Line 1 Runs)',
        explanation:
          'Before executing code, JS allocates bindings in Global Scope: `var legacy` and `var leaked` are initialized to `undefined`, whereas `let total` is registered as `<TDZ uninitialized>`.',
        callStack: [{ frame: 'Global Execution Context', detail: 'Creation Phase', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'legacy (var)', value: 'undefined', changed: true },
              { key: 'leaked (var)', value: 'undefined', changed: true },
              { key: 'total (let)', value: '<TDZ uninitialized>', changed: true },
            ],
          },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 1,
        phaseLabel: 'Line 1 · Read Hoisted var',
        explanation:
          'Reading `legacy` before line 2 does NOT throw because `var` was hoisted with `undefined`. Reading `total` here would throw a ReferenceError (TDZ).',
        callStack: [{ frame: 'Global Execution Context', detail: 'Line 1', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'legacy (var)', value: 'undefined' },
              { key: 'leaked (var)', value: 'undefined' },
              { key: 'total (let)', value: '<TDZ uninitialized>' },
            ],
          },
        ],
        consoleOutput: ['undefined'],
      },
      {
        activeLine: 2,
        phaseLabel: 'Line 2 · Assign legacy',
        explanation: '`legacy` is assigned `"ready"` in the Global Scope.',
        callStack: [{ frame: 'Global Execution Context', detail: 'Line 2', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'legacy (var)', value: '"ready"', changed: true },
              { key: 'leaked (var)', value: 'undefined' },
              { key: 'total (let)', value: '<TDZ uninitialized>' },
            ],
          },
        ],
        consoleOutput: ['undefined'],
      },
      {
        activeLine: 3,
        phaseLabel: 'Line 3 · Initialize let total',
        explanation: '`total` leaves the Temporal Dead Zone and receives the value `10`.',
        callStack: [{ frame: 'Global Execution Context', detail: 'Line 3', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'legacy (var)', value: '"ready"' },
              { key: 'leaked (var)', value: 'undefined' },
              { key: 'total (let)', value: '10', changed: true },
            ],
          },
        ],
        consoleOutput: ['undefined'],
      },
      {
        activeLine: 5,
        phaseLabel: 'Line 5 · Block-Scoped Shadowing',
        explanation:
          'Entering `if (true) { ... }` creates a Block Scope. `let total = 99` lives ONLY inside this block—outer `total` stays `10`!',
        callStack: [{ frame: 'Global Execution Context', detail: 'Inside if-block', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'legacy (var)', value: '"ready"' },
              { key: 'leaked (var)', value: 'undefined' },
              { key: 'total (let)', value: '10' },
            ],
          },
          {
            name: 'if Block Scope',
            kind: 'block',
            bindings: [{ key: 'total (let)', value: '99', changed: true }],
          },
        ],
        consoleOutput: ['undefined'],
      },
      {
        activeLine: 6,
        phaseLabel: 'Line 6 · var Ignores Block Scope',
        explanation:
          '`var leaked = "escaped"` ignores the `if` block and writes directly to Global Scope!',
        callStack: [{ frame: 'Global Execution Context', detail: 'Inside if-block', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'legacy (var)', value: '"ready"' },
              { key: 'leaked (var)', value: '"escaped"', changed: true },
              { key: 'total (let)', value: '10' },
            ],
          },
          {
            name: 'if Block Scope',
            kind: 'block',
            bindings: [{ key: 'total (let)', value: '99' }],
          },
        ],
        consoleOutput: ['undefined'],
      },
      {
        activeLine: 8,
        phaseLabel: 'Line 8 · Block Destroyed, Output Printed',
        explanation:
          'The `if` block scope is discarded (removing inner `total = 99`). Outer `total` is still `10`, while `leaked` escaped to Global Scope.',
        callStack: [{ frame: 'Global Execution Context', detail: 'Line 8', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'legacy (var)', value: '"ready"' },
              { key: 'leaked (var)', value: '"escaped"' },
              { key: 'total (let)', value: '10' },
            ],
          },
        ],
        consoleOutput: ['undefined', '10 "escaped"'],
      },
    ],
  },

  // 2. For Loop Dry-Run Table (Topic 04)
  {
    id: 'vis-for-loop-sum',
    topicId: 't04-control-flow-loops',
    title: 'For Loop Trace Table (Accumulator Dry-Run)',
    subtitle: 'Watch `i`, `nums[i]`, and `sum` evolve on every single iteration.',
    focus: 'variables-table',
    codeLines: [
      'const nums = [12, 8, 25, 5];',
      'let sum = 0;',
      'for (let i = 0; i < nums.length; i++) {',
      '  sum = sum + nums[i];',
      '}',
      'console.log("Total:", sum);',
    ],
    tableColumns: ['Iteration', 'i', 'nums[i]', 'sum before', 'sum after'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Initialize Array',
        explanation: 'Create array `nums` with 4 elements (`nums.length === 4`).',
        variables: [{ name: 'nums', value: '[12, 8, 25, 5]', type: 'Array(4)', changed: true }],
        tableRows: [],
        callStack: [{ frame: 'Global', detail: 'Line 1', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Initialize Accumulator',
        explanation: 'Set `sum = 0` before entering the loop.',
        variables: [
          { name: 'nums', value: '[12, 8, 25, 5]', type: 'Array(4)' },
          { name: 'sum', value: '0', type: 'number', changed: true },
        ],
        tableRows: [],
        callStack: [{ frame: 'Global', detail: 'Line 2', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Iteration 1 · i = 0 (0 < 4 is true)',
        explanation: 'Read `nums[0]` (`12`) and add to `sum` (`0 + 12 = 12`).',
        variables: [
          { name: 'i', value: '0', type: 'number', changed: true },
          { name: 'nums[i]', value: '12', type: 'number', changed: true },
          { name: 'sum', value: '12', type: 'number', changed: true },
        ],
        tableRows: [['1', '0', '12', '0', '12']],
        callStack: [{ frame: 'Global', detail: 'for-loop body (i=0)', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Iteration 2 · i = 1 (1 < 4 is true)',
        explanation: 'Increment `i` to `1`, read `nums[1]` (`8`), update `sum` (`12 + 8 = 20`).',
        variables: [
          { name: 'i', value: '1', type: 'number', changed: true },
          { name: 'nums[i]', value: '8', type: 'number', changed: true },
          { name: 'sum', value: '20', type: 'number', changed: true },
        ],
        tableRows: [
          ['1', '0', '12', '0', '12'],
          ['2', '1', '8', '12', '20'],
        ],
        callStack: [{ frame: 'Global', detail: 'for-loop body (i=1)', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Iteration 3 · i = 2 (2 < 4 is true)',
        explanation: 'Increment `i` to `2`, read `nums[2]` (`25`), update `sum` (`20 + 25 = 45`).',
        variables: [
          { name: 'i', value: '2', type: 'number', changed: true },
          { name: 'nums[i]', value: '25', type: 'number', changed: true },
          { name: 'sum', value: '45', type: 'number', changed: true },
        ],
        tableRows: [
          ['1', '0', '12', '0', '12'],
          ['2', '1', '8', '12', '20'],
          ['3', '2', '25', '20', '45'],
        ],
        callStack: [{ frame: 'Global', detail: 'for-loop body (i=2)', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Iteration 4 · i = 3 (3 < 4 is true)',
        explanation: 'Increment `i` to `3`, read `nums[3]` (`5`), update `sum` (`45 + 5 = 50`).',
        variables: [
          { name: 'i', value: '3', type: 'number', changed: true },
          { name: 'nums[i]', value: '5', type: 'number', changed: true },
          { name: 'sum', value: '50', type: 'number', changed: true },
        ],
        tableRows: [
          ['1', '0', '12', '0', '12'],
          ['2', '1', '8', '12', '20'],
          ['3', '2', '25', '20', '45'],
          ['4', '3', '5', '45', '50'],
        ],
        callStack: [{ frame: 'Global', detail: 'for-loop body (i=3)', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Loop Condition Check · i = 4 (4 < 4 is false)',
        explanation: '`i` becomes `4`. Since `4 < 4` is `false`, the loop terminates cleanly without reading out-of-bounds `nums[4]`.',
        variables: [
          { name: 'i', value: '4 (exits loop)', type: 'number', changed: true },
          { name: 'sum', value: '50', type: 'number' },
        ],
        tableRows: [
          ['1', '0', '12', '0', '12'],
          ['2', '1', '8', '12', '20'],
          ['3', '2', '25', '20', '45'],
          ['4', '3', '5', '45', '50'],
        ],
        callStack: [{ frame: 'Global', detail: 'Exiting for-loop', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 6,
        phaseLabel: 'Done · Print Final Total',
        explanation: 'Execution continues after the loop and prints `"Total: 50"`.',
        variables: [{ name: 'sum', value: '50', type: 'number' }],
        tableRows: [
          ['1', '0', '12', '0', '12'],
          ['2', '1', '8', '12', '20'],
          ['3', '2', '25', '20', '45'],
          ['4', '3', '5', '45', '50'],
        ],
        callStack: [{ frame: 'Global', detail: 'Line 6', status: 'running' }],
        consoleOutput: ['Total: 50'],
      },
    ],
  },

  // 3. Array map() Transformation Trace (Topic 09)
  {
    id: 'vis-array-map',
    topicId: 't07-foreach-map',
    title: 'How Array.map() Builds a Brand-New Array',
    subtitle: 'Track each callback invocation and see why the original `prices` array stays untouched.',
    focus: 'variables-table',
    codeLines: [
      'const prices = [100, 250, 400];',
      'const withTax = prices.map((p) => {',
      '  return p * 1.18;',
      '});',
      'console.log(prices, withTax);',
    ],
    tableColumns: ['Call #', 'p', 'Returned', 'withTax (new array)'],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Original Array Created',
        explanation: '`prices` points to `[100, 250, 400]`. `map()` will NEVER mutate this array.',
        variables: [{ name: 'prices', value: '[100, 250, 400]', type: 'Array(3)', changed: true }],
        tableRows: [],
        callStack: [{ frame: 'Global', detail: 'Line 1', status: 'running' }],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'map() Callback #1 · p = 100',
        explanation: 'JS pushes the callback onto the Call Stack with `p = 100`. It returns `118`, which `map()` writes into slot 0 of the new array.',
        variables: [
          { name: 'p', value: '100', type: 'number', changed: true },
          { name: 'return value', value: '118', type: 'number', changed: true },
        ],
        tableRows: [['1', '100', '118', '[118]']],
        callStack: [
          { frame: 'Global', detail: 'prices.map(...)' },
          { frame: 'callback(100)', detail: 'return 118', status: 'returning' },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'map() Callback #2 · p = 250',
        explanation: 'Callback runs for `p = 250`, returning `295` into slot 1 of the new array.',
        variables: [
          { name: 'p', value: '250', type: 'number', changed: true },
          { name: 'return value', value: '295', type: 'number', changed: true },
        ],
        tableRows: [
          ['1', '100', '118', '[118]'],
          ['2', '250', '295', '[118, 295]'],
        ],
        callStack: [
          { frame: 'Global', detail: 'prices.map(...)' },
          { frame: 'callback(250)', detail: 'return 295', status: 'returning' },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'map() Callback #3 · p = 400',
        explanation: 'Callback runs for `p = 400`, returning `472` into slot 2 of the new array.',
        variables: [
          { name: 'p', value: '400', type: 'number', changed: true },
          { name: 'return value', value: '472', type: 'number', changed: true },
        ],
        tableRows: [
          ['1', '100', '118', '[118]'],
          ['2', '250', '295', '[118, 295]'],
          ['3', '400', '472', '[118, 295, 472]'],
        ],
        callStack: [
          { frame: 'Global', detail: 'prices.map(...)' },
          { frame: 'callback(400)', detail: 'return 472', status: 'returning' },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 5,
        phaseLabel: 'Result Assigned & Logged',
        explanation: '`withTax` holds `[118, 295, 472]`, while `prices` is still `[100, 250, 400]`. (Note: `forEach()` would have returned `undefined`!)',
        variables: [
          { name: 'prices', value: '[100, 250, 400]', type: 'Array(3)' },
          { name: 'withTax', value: '[118, 295, 472]', type: 'Array(3)', changed: true },
        ],
        tableRows: [
          ['1', '100', '118', '[118]'],
          ['2', '250', '295', '[118, 295]'],
          ['3', '400', '472', '[118, 295, 472]'],
        ],
        callStack: [{ frame: 'Global', detail: 'Line 5', status: 'running' }],
        consoleOutput: ['[100, 250, 400] [118, 295, 472]'],
      },
    ],
  },

  // 4. Array filter() vs find() Trace (Topic 10)
  {
    id: 'vis-filter-vs-find',
    topicId: 't08-filter-find-index',
    title: 'filter() Full Scan vs find() Short-Circuit',
    subtitle: 'See why `filter()` inspects every element while `find()` stops immediately on the first match.',
    focus: 'variables-table',
    codeLines: [
      'const scores = [45, 82, 91, 60];',
      'const passed = scores.filter(s => s >= 80);',
      'const firstHigh = scores.find(s => s >= 80);',
      'console.log(passed, firstHigh);',
    ],
    tableColumns: ['Method', 'Index', 's', 's >= 80?', 'Outcome'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'filter() · Index 0 (s = 45)',
        explanation: '`45 >= 80` is `false` -> skipped.',
        variables: [{ name: 'passed (building)', value: '[]', type: 'Array' }],
        tableRows: [['filter', '0', '45', 'false', 'skip']],
        callStack: [{ frame: 'scores.filter()', detail: 's = 45', status: 'running' }],
      },
      {
        activeLine: 2,
        phaseLabel: 'filter() · Index 1 (s = 82)',
        explanation: '`82 >= 80` is `true` -> kept in `passed`. `filter()` keeps scanning.',
        variables: [{ name: 'passed (building)', value: '[82]', type: 'Array', changed: true }],
        tableRows: [
          ['filter', '0', '45', 'false', 'skip'],
          ['filter', '1', '82', 'true', 'push 82'],
        ],
        callStack: [{ frame: 'scores.filter()', detail: 's = 82', status: 'running' }],
      },
      {
        activeLine: 2,
        phaseLabel: 'filter() · Index 2 & 3 (s = 91, 60)',
        explanation: '`91` passes (pushed); `60` fails (skipped). `filter()` always visits all 4 elements and returns an Array (`[82, 91]`).',
        variables: [{ name: 'passed', value: '[82, 91]', type: 'Array(2)', changed: true }],
        tableRows: [
          ['filter', '0', '45', 'false', 'skip'],
          ['filter', '1', '82', 'true', 'push 82'],
          ['filter', '2', '91', 'true', 'push 91'],
          ['filter', '3', '60', 'false', 'skip (done)'],
        ],
        callStack: [{ frame: 'Global', detail: 'passed = [82, 91]', status: 'running' }],
      },
      {
        activeLine: 3,
        phaseLabel: 'find() · Index 0 (s = 45)',
        explanation: 'Now `find()` starts: `45 >= 80` is `false`, so it checks index 1.',
        variables: [
          { name: 'passed', value: '[82, 91]', type: 'Array(2)' },
          { name: 'firstHigh', value: '(searching...)', type: 'pending' },
        ],
        tableRows: [
          ['filter', '0..3', 'all 4', '2 matches', '[82, 91]'],
          ['find', '0', '45', 'false', 'continue'],
        ],
        callStack: [{ frame: 'scores.find()', detail: 's = 45', status: 'running' }],
      },
      {
        activeLine: 3,
        phaseLabel: 'find() · Index 1 (s = 82) -> Short-Circuit!',
        explanation: '`82 >= 80` is `true`! `find()` immediately returns `82` and NEVER even visits `91` or `60`.',
        variables: [
          { name: 'passed', value: '[82, 91]', type: 'Array(2)' },
          { name: 'firstHigh', value: '82', type: 'number', changed: true },
        ],
        tableRows: [
          ['filter', '0..3', 'all 4', '2 matches', '[82, 91]'],
          ['find', '0', '45', 'false', 'continue'],
          ['find', '1', '82', 'true', 'RETURN 82 (stop!)'],
        ],
        callStack: [{ frame: 'Global', detail: 'firstHigh = 82', status: 'returning' }],
      },
      {
        activeLine: 4,
        phaseLabel: 'Final Output',
        explanation: '`filter()` always returns an Array; `find()` returns the single matched element (or `undefined`).',
        variables: [
          { name: 'passed', value: '[82, 91]', type: 'Array(2)' },
          { name: 'firstHigh', value: '82', type: 'number' },
        ],
        tableRows: [
          ['filter', '0..3', 'all 4', '2 matches', '[82, 91]'],
          ['find', '0', '45', 'false', 'continue'],
          ['find', '1', '82', 'true', 'RETURN 82 (stop!)'],
        ],
        callStack: [{ frame: 'Global', detail: 'Line 4', status: 'running' }],
        consoleOutput: ['[82, 91] 82'],
      },
    ],
  },

  // 5. Array reduce() Accumulator Table (Topic 11)
  {
    id: 'vis-array-reduce',
    topicId: 't09-some-every-reduce',
    title: 'Array.reduce() Accumulator Dry-Run Table',
    subtitle: 'Trace how `acc` carries forward from the initial value `0` across every cart item.',
    focus: 'variables-table',
    codeLines: [
      'const cart = [{ qty: 2, price: 150 }, { qty: 1, price: 400 }, { qty: 3, price: 50 }];',
      'const bill = cart.reduce((acc, item) => {',
      '  return acc + item.qty * item.price;',
      '}, 0);',
      'console.log("Bill:", bill);',
    ],
    tableColumns: ['Step', 'item', 'acc before', 'item.qty * price', 'acc after (returned)'],
    steps: [
      {
        activeLine: 2,
        phaseLabel: 'Start reduce() with Initial Value 0',
        explanation: 'Passing `0` as the second argument guarantees `acc` starts as a clean number `0` (safe even on an empty cart!).',
        variables: [{ name: 'initialValue (acc)', value: '0', type: 'number', changed: true }],
        tableRows: [],
        callStack: [{ frame: 'cart.reduce(..., 0)', detail: 'starting', status: 'running' }],
      },
      {
        activeLine: 3,
        phaseLabel: 'Step 1 · { qty: 2, price: 150 }',
        explanation: 'Compute `0 + (2 * 150) = 300`. The returned `300` becomes `acc` for Step 2.',
        variables: [
          { name: 'acc', value: '0 -> 300', type: 'number', changed: true },
          { name: 'item', value: '{ qty: 2, price: 150 }', type: 'Object' },
        ],
        tableRows: [['1', '2 × ₹150', '0', '300', '300']],
        callStack: [
          { frame: 'cart.reduce()' },
          { frame: 'reducer(0, item[0])', detail: 'returns 300', status: 'returning' },
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Step 2 · { qty: 1, price: 400 }',
        explanation: 'Previous return `300` flows into `acc`. Compute `300 + (1 * 400) = 700`.',
        variables: [
          { name: 'acc', value: '300 -> 700', type: 'number', changed: true },
          { name: 'item', value: '{ qty: 1, price: 400 }', type: 'Object' },
        ],
        tableRows: [
          ['1', '2 × ₹150', '0', '300', '300'],
          ['2', '1 × ₹400', '300', '400', '700'],
        ],
        callStack: [
          { frame: 'cart.reduce()' },
          { frame: 'reducer(300, item[1])', detail: 'returns 700', status: 'returning' },
        ],
      },
      {
        activeLine: 3,
        phaseLabel: 'Step 3 · { qty: 3, price: 50 }',
        explanation: 'Compute `700 + (3 * 50) = 850`. No more items remain, so `reduce()` returns `850`.',
        variables: [
          { name: 'acc', value: '700 -> 850', type: 'number', changed: true },
          { name: 'item', value: '{ qty: 3, price: 50 }', type: 'Object' },
        ],
        tableRows: [
          ['1', '2 × ₹150', '0', '300', '300'],
          ['2', '1 × ₹400', '300', '400', '700'],
          ['3', '3 × ₹50', '700', '150', '850'],
        ],
        callStack: [
          { frame: 'cart.reduce()' },
          { frame: 'reducer(700, item[2])', detail: 'returns 850', status: 'returning' },
        ],
      },
      {
        activeLine: 5,
        phaseLabel: 'Final Bill Logged',
        explanation: '`bill` receives the final folded accumulator `850`.',
        variables: [{ name: 'bill', value: '850', type: 'number', changed: true }],
        tableRows: [
          ['1', '2 × ₹150', '0', '300', '300'],
          ['2', '1 × ₹400', '300', '400', '700'],
          ['3', '3 × ₹50', '700', '150', '850'],
        ],
        callStack: [{ frame: 'Global', detail: 'Line 5', status: 'running' }],
        consoleOutput: ['Bill: 850'],
      },
    ],
  },

  // 6. Closures & Lexical Environment (Topic 15)
  {
    id: 'vis-closure-wallet',
    topicId: 't13-lexical-scope-closures',
    title: 'Closure & Retained Lexical Environment',
    subtitle: 'Watch `createWallet()` pop off the Call Stack while its private `balance` stays alive inside the returned closure.',
    focus: 'call-stack-scope',
    codeLines: [
      'function createWallet(start) {',
      '  let balance = start;',
      '  return function deposit(amt) {',
      '    balance += amt;',
      '    return balance;',
      '  };',
      '}',
      'const add = createWallet(500);',
      'console.log(add(200));',
      'console.log(add(50));',
    ],
    steps: [
      {
        activeLine: 8,
        phaseLabel: 'Call createWallet(500)',
        explanation: '`createWallet(500)` is pushed onto the Call Stack with parameter `start = 500`.',
        callStack: [
          { frame: 'Global' },
          { frame: 'createWallet(500)', detail: 'creating local scope', status: 'running' },
        ],
        scopes: [
          { name: 'Global Scope', kind: 'global', bindings: [{ key: 'createWallet', value: 'fn()' }] },
          { name: 'createWallet Scope', kind: 'function', bindings: [{ key: 'start', value: '500', changed: true }] },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Initialize Private balance = 500',
        explanation: 'Local variable `balance = 500` is created inside `createWallet`’s Lexical Environment.',
        callStack: [
          { frame: 'Global' },
          { frame: 'createWallet(500)', detail: 'Line 2', status: 'running' },
        ],
        scopes: [
          { name: 'Global Scope', kind: 'global', bindings: [{ key: 'createWallet', value: 'fn()' }] },
          {
            name: 'createWallet Scope',
            kind: 'function',
            bindings: [
              { key: 'start', value: '500' },
              { key: 'balance', value: '500', changed: true },
            ],
          },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 8,
        phaseLabel: 'createWallet() Returns & Pops — Closure Survives!',
        explanation:
          '`createWallet()` finishes and pops OFF the Call Stack! Normally its locals would be garbage collected, but `deposit` still references `balance`, so JS retains that environment as a **Closure** attached to `add`.',
        callStack: [{ frame: 'Global', detail: 'add = deposit fn + [[Closure]]', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [
              { key: 'createWallet', value: 'fn()' },
              { key: 'add', value: 'deposit(amt) + Closure', changed: true },
            ],
          },
          {
            name: 'Closure Environment (Retained on Heap)',
            kind: 'closure',
            retained: true,
            bindings: [{ key: 'balance (private)', value: '500' }],
          },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Call add(200) · Mutate Closed-Over balance',
        explanation:
          '`deposit(200)` looks up `balance`—not found locally, so it follows its closure link to the retained environment and updates `balance` from `500` to `700`!',
        callStack: [
          { frame: 'Global' },
          { frame: 'add(200)', detail: 'balance += 200', status: 'running' },
        ],
        scopes: [
          {
            name: 'add(200) Local Scope',
            kind: 'function',
            bindings: [{ key: 'amt', value: '200', changed: true }],
          },
          {
            name: 'Closure Environment (Retained on Heap)',
            kind: 'closure',
            retained: true,
            bindings: [{ key: 'balance (private)', value: '700', changed: true }],
          },
        ],
        consoleOutput: [],
      },
      {
        activeLine: 9,
        phaseLabel: 'add(200) Returns 700',
        explanation: '`add(200)` returns `700` and pops off the stack. The updated `balance: 700` remains preserved inside the closure.',
        callStack: [{ frame: 'Global', detail: 'console.log(700)', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [{ key: 'add', value: 'deposit(amt) + Closure' }],
          },
          {
            name: 'Closure Environment (Retained on Heap)',
            kind: 'closure',
            retained: true,
            bindings: [{ key: 'balance (private)', value: '700' }],
          },
        ],
        consoleOutput: ['700'],
      },
      {
        activeLine: 10,
        phaseLabel: 'Call add(50) · Live State Continues (700 -> 750)',
        explanation:
          'Calling `add(50)` reads the SAME live closure variable (`700`), increments it to `750`, and logs `750`. External code cannot directly touch `balance`!',
        callStack: [{ frame: 'Global', detail: 'console.log(750)', status: 'running' }],
        scopes: [
          {
            name: 'Global Scope',
            kind: 'global',
            bindings: [{ key: 'add', value: 'deposit(amt) + Closure' }],
          },
          {
            name: 'Closure Environment (Retained on Heap)',
            kind: 'closure',
            retained: true,
            bindings: [{ key: 'balance (private)', value: '750', changed: true }],
          },
        ],
        consoleOutput: ['700', '750'],
      },
    ],
  },

  // 7. Recursion Call Stack Unwind (Topic 16)
  {
    id: 'vis-recursion-stack',
    topicId: 't13b-recursion-call-stack',
    title: 'Recursion Call Stack Push & Unwind Trace',
    subtitle: 'Watch frames pile up until the base case `n <= 1`, then multiply values as the stack unwinds.',
    focus: 'call-stack-scope',
    codeLines: [
      'function factorial(n) {',
      '  if (n <= 1) return 1;',
      '  return n * factorial(n - 1);',
      '}',
      'const ans = factorial(4);',
      'console.log(ans);',
    ],
    steps: [
      {
        activeLine: 5,
        phaseLabel: 'Push factorial(4)',
        explanation: 'Start calling `factorial(4)`. `4 <= 1` is false, so it pauses at `4 * factorial(3)` waiting for the recursive call.',
        callStack: [
          { frame: 'Global', detail: 'ans = ?' },
          { frame: 'factorial(4)', detail: 'waiting for 4 * factorial(3)', status: 'paused' },
        ],
        variables: [{ name: 'n', value: '4', type: 'number', changed: true }],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Push factorial(3)',
        explanation: 'New frame `factorial(3)` pushes onto the stack. `3 <= 1` is false -> waits on `3 * factorial(2)`.',
        callStack: [
          { frame: 'Global' },
          { frame: 'factorial(4)', detail: '4 * ?' },
          { frame: 'factorial(3)', detail: 'waiting for 3 * factorial(2)', status: 'paused' },
        ],
        variables: [{ name: 'n', value: '3', type: 'number', changed: true }],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Push factorial(2)',
        explanation: 'New frame `factorial(2)` pushes onto the stack -> waits on `2 * factorial(1)`.',
        callStack: [
          { frame: 'Global' },
          { frame: 'factorial(4)', detail: '4 * ?' },
          { frame: 'factorial(3)', detail: '3 * ?' },
          { frame: 'factorial(2)', detail: 'waiting for 2 * factorial(1)', status: 'paused' },
        ],
        variables: [{ name: 'n', value: '2', type: 'number', changed: true }],
        consoleOutput: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Base Case Hit! factorial(1) -> returns 1',
        explanation: '`1 <= 1` is TRUE! No more recursive calls—`factorial(1)` immediately returns `1` and begins unwinding the stack.',
        callStack: [
          { frame: 'Global' },
          { frame: 'factorial(4)', detail: '4 * ?' },
          { frame: 'factorial(3)', detail: '3 * ?' },
          { frame: 'factorial(2)', detail: '2 * ?' },
          { frame: 'factorial(1)', detail: 'BASE CASE -> return 1', status: 'returning' },
        ],
        variables: [{ name: 'n', value: '1 (Base Case)', type: 'number', changed: true }],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Unwind factorial(2) -> returns 2',
        explanation: '`factorial(2)` receives `1`, computes `2 * 1 = 2`, and pops off the stack.',
        callStack: [
          { frame: 'Global' },
          { frame: 'factorial(4)', detail: '4 * ?' },
          { frame: 'factorial(3)', detail: '3 * ?' },
          { frame: 'factorial(2)', detail: '2 * 1 = 2 -> return 2', status: 'returning' },
        ],
        variables: [{ name: 'result', value: '2', type: 'number', changed: true }],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Unwind factorial(3) -> returns 6',
        explanation: '`factorial(3)` receives `2`, computes `3 * 2 = 6`, and pops off the stack.',
        callStack: [
          { frame: 'Global' },
          { frame: 'factorial(4)', detail: '4 * ?' },
          { frame: 'factorial(3)', detail: '3 * 2 = 6 -> return 6', status: 'returning' },
        ],
        variables: [{ name: 'result', value: '6', type: 'number', changed: true }],
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Unwind factorial(4) -> returns 24',
        explanation: '`factorial(4)` receives `6`, computes `4 * 6 = 24`, and pops off the stack.',
        callStack: [
          { frame: 'Global' },
          { frame: 'factorial(4)', detail: '4 * 6 = 24 -> return 24', status: 'returning' },
        ],
        variables: [{ name: 'result', value: '24', type: 'number', changed: true }],
        consoleOutput: [],
      },
      {
        activeLine: 6,
        phaseLabel: 'Stack Unwound · Output 24',
        explanation: '`ans` receives `24` and `console.log(ans)` prints `24`.',
        callStack: [{ frame: 'Global', detail: 'ans = 24', status: 'running' }],
        variables: [{ name: 'ans', value: '24', type: 'number', changed: true }],
        consoleOutput: ['24'],
      },
    ],
  },

  // 8. Stack vs Heap References, Shallow Copy & Deep Clone (Topic 21)
  {
    id: 'vis-stack-heap-clone',
    topicId: 't18-reference-deep-clone',
    title: 'Stack vs Heap Memory: Shallow Copy vs structuredClone()',
    subtitle: 'See why `{ ...user }` still mutates nested objects on the Heap while `structuredClone()` isolates them.',
    focus: 'memory-heap',
    codeLines: [
      'const user = { name: "Neha", prefs: { theme: "light" } };',
      'const shallow = { ...user };',
      'shallow.prefs.theme = "dark";',
      'const deep = structuredClone(user);',
      'deep.prefs.theme = "solarized";',
      'console.log(user.prefs.theme, deep.prefs.theme);',
    ],
    steps: [
      {
        activeLine: 1,
        phaseLabel: 'Line 1 · Allocate Objects on Heap',
        explanation:
          '`user` on the Stack holds a reference pointer (`@0x10`) to the outer object on the Heap. Its `prefs` property holds a second pointer (`@0x20`) to the nested object.',
        memory: {
          stack: [{ name: 'user', value: 'ref -> @0x10', refId: '@0x10', changed: true }],
          heap: [
            {
              id: '@0x10',
              label: 'Object (user)',
              entries: [
                { key: 'name', value: '"Neha"' },
                { key: 'prefs', value: 'ref -> @0x20', refId: '@0x20' },
              ],
            },
            {
              id: '@0x20',
              label: 'Object (prefs)',
              entries: [{ key: 'theme', value: '"light"', changed: true }],
            },
          ],
        },
        consoleOutput: [],
      },
      {
        activeLine: 2,
        phaseLabel: 'Line 2 · Shallow Copy Shares Nested Pointer @0x20!',
        explanation:
          '`{ ...user }` creates a NEW outer object (`@0x11`), BUT copies the `prefs` pointer verbatim—so BOTH `user.prefs` and `shallow.prefs` point to the exact same `@0x20` object!',
        memory: {
          stack: [
            { name: 'user', value: 'ref -> @0x10', refId: '@0x10' },
            { name: 'shallow', value: 'ref -> @0x11', refId: '@0x11', changed: true },
          ],
          heap: [
            {
              id: '@0x10',
              label: 'Object (user)',
              entries: [
                { key: 'name', value: '"Neha"' },
                { key: 'prefs', value: 'ref -> @0x20', refId: '@0x20' },
              ],
            },
            {
              id: '@0x11',
              label: 'Object (shallow)',
              entries: [
                { key: 'name', value: '"Neha"' },
                { key: 'prefs', value: 'ref -> @0x20 (SHARED!)', refId: '@0x20', changed: true },
              ],
            },
            {
              id: '@0x20',
              label: 'Object (prefs — SHARED)',
              entries: [{ key: 'theme', value: '"light"' }],
            },
          ],
        },
        consoleOutput: [],
      },
      {
        activeLine: 3,
        phaseLabel: 'Line 3 · Mutation Bug! user.prefs.theme Changed Too',
        explanation:
          'Writing `shallow.prefs.theme = "dark"` mutates `@0x20` on the Heap. Because `user.prefs` also points to `@0x20`, `user.prefs.theme` silently became `"dark"`!',
        memory: {
          stack: [
            { name: 'user', value: 'ref -> @0x10', refId: '@0x10' },
            { name: 'shallow', value: 'ref -> @0x11', refId: '@0x11' },
          ],
          heap: [
            {
              id: '@0x10',
              label: 'Object (user)',
              entries: [
                { key: 'name', value: '"Neha"' },
                { key: 'prefs', value: 'ref -> @0x20', refId: '@0x20' },
              ],
            },
            {
              id: '@0x11',
              label: 'Object (shallow)',
              entries: [
                { key: 'name', value: '"Neha"' },
                { key: 'prefs', value: 'ref -> @0x20', refId: '@0x20' },
              ],
            },
            {
              id: '@0x20',
              label: 'Object (prefs — MUTATED!)',
              entries: [{ key: 'theme', value: '"dark"', changed: true }],
            },
          ],
        },
        consoleOutput: [],
      },
      {
        activeLine: 4,
        phaseLabel: 'Line 4 · structuredClone() Copies Every Nested Level',
        explanation:
          '`structuredClone(user)` allocates BOTH a new outer object (`@0x30`) AND a completely separate nested `prefs` object (`@0x31`).',
        memory: {
          stack: [
            { name: 'user', value: 'ref -> @0x10', refId: '@0x10' },
            { name: 'deep', value: 'ref -> @0x30', refId: '@0x30', changed: true },
          ],
          heap: [
            {
              id: '@0x10',
              label: 'Object (user)',
              entries: [
                { key: 'name', value: '"Neha"' },
                { key: 'prefs', value: 'ref -> @0x20', refId: '@0x20' },
              ],
            },
            {
              id: '@0x20',
              label: 'Object (user.prefs)',
              entries: [{ key: 'theme', value: '"dark"' }],
            },
            {
              id: '@0x30',
              label: 'Object (deep)',
              entries: [
                { key: 'name', value: '"Neha"' },
                { key: 'prefs', value: 'ref -> @0x31 (ISOLATED)', refId: '@0x31', changed: true },
              ],
            },
            {
              id: '@0x31',
              label: 'Object (deep.prefs)',
              entries: [{ key: 'theme', value: '"dark"', changed: true }],
            },
          ],
        },
        consoleOutput: [],
      },
      {
        activeLine: 6,
        phaseLabel: 'Line 5 & 6 · Isolated Edit Confirmed',
        explanation:
          'Setting `deep.prefs.theme = "solarized"` updates ONLY `@0x31`. `user.prefs.theme` remains `"dark"`—zero accidental cross-mutation!',
        memory: {
          stack: [
            { name: 'user', value: 'ref -> @0x10', refId: '@0x10' },
            { name: 'deep', value: 'ref -> @0x30', refId: '@0x30' },
          ],
          heap: [
            {
              id: '@0x20',
              label: 'Object (user.prefs — Untouched)',
              entries: [{ key: 'theme', value: '"dark"' }],
            },
            {
              id: '@0x31',
              label: 'Object (deep.prefs — Updated)',
              entries: [{ key: 'theme', value: '"solarized"', changed: true }],
            },
          ],
        },
        consoleOutput: ['"dark" "solarized"'],
      },
    ],
  },
];
