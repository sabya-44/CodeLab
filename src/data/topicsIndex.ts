import type { CategoryId, JsTopic, TopicCategory } from '../types/topic';
import { TOPICS_PART_1 } from './topicsPart1';
import { TOPICS_PART_2 } from './topicsPart2';
import { TOPICS_PART_3 } from './topicsPart3';
import { TOPICS_PART_4 } from './topicsPart4';
import { TOPICS_PHASE1_GAPS } from './topicsPhase1Gaps';
import { TOPIC_METADATA } from './topicMetadata';

export const CATEGORIES: TopicCategory[] = [
  {
    id: 'cat-1-foundations',
    order: 1,
    title: '1. Core Foundations & Language Mechanics',
    tierRange: 'Basic',
    description:
      'Variables (var/let/const), hoisting and the Temporal Dead Zone, primitives vs objects, coercion, strict equality, nullish coalescing, and control-flow loops.',
  },
  {
    id: 'cat-2-strings-arrays',
    order: 2,
    title: '2. Inbuilt String & Array Methods',
    tierRange: 'Basic -> Intermediate',
    description:
      'String basics (quotes, indexing, length, for loops) & inbuilt methods (slice, substring, substr, indexOf, lastIndexOf, replace, replaceAll, startsWith, endsWith, split); Array basics (indexing, for-loop traversal) & inbuilt methods (toString, join, slice, push, pop, concat, indexOf, lastIndexOf, includes, shift, unshift, reverse, sort, splice) plus forEach, map, filter, find, findIndex, some, every, reduce, and reduceRight.',
  },
  {
    id: 'cat-3-functions-scope',
    order: 3,
    title: '3. Functions, Callbacks, Scope & Recursion',
    tierRange: 'Basic -> Intermediate',
    description:
      'Function declarations vs expressions, default parameters, arrow functions, callbacks, higher-order functions, lexical environments, closures & private state, and recursion with the call stack.',
  },
  {
    id: 'cat-4-objects-operators',
    order: 4,
    title: '4. Objects, Destructuring & Modern Operators',
    tierRange: 'Intermediate',
    description:
      'Object notations, nested objects, anonymous methods, arrays of objects, destructuring, optional chaining (?.), rest & spread (...), and shallow vs deep cloning.',
  },
  {
    id: 'cat-5-context-oop',
    order: 5,
    title: '5. Execution Context (this), Prototypes & OOP',
    tierRange: 'Intermediate -> Advanced',
    description:
      'Dynamic `this` binding with call(), apply(), and bind(), prototypes and Object.create(), ES6 classes with extends/super()/#private fields, plus Set, Map, and generators.',
  },
  {
    id: 'cat-6-dom-browser',
    order: 6,
    title: '6. Browser DOM, Events, Forms & Storage',
    tierRange: 'Intermediate -> Advanced',
    description:
      'DOM selection, classList, XSS-safe rendering (textContent vs innerHTML), form submission with preventDefault & FormData, event delegation, RegExp validation, and JSON + Web Storage.',
  },
  {
    id: 'cat-7-async-js',
    order: 7,
    title: '7. Debugging, Error Handling & Asynchronous JavaScript',
    tierRange: 'Basic -> Advanced',
    description:
      'DevTools debugging, breakpoints & stack traces, try/catch/finally & custom Errors, the Event Loop (Microtasks vs Macrotasks), Promises & method chaining, async/await with Fetch res.ok guards, and parallel concurrency.',
  },
  {
    id: 'cat-8-modern-architecture',
    order: 8,
    title: '8. Modern Web Architecture, Testing, Clean Code & Performance',
    tierRange: 'Intermediate -> Advanced',
    description:
      'ES Modules & dynamic import(), timers & observers, pure functions & immutability, Garbage Collection, Testing Fundamentals (Vitest/Jest), Clean Code & guard clauses, plus Big-O performance, throttling & web security basics.',
  },
];

const CATEGORY_ORDER_MAP = new Map<CategoryId, number>(
  CATEGORIES.map((c) => [c.id, c.order])
);

const CATEGORY_TITLE_MAP = new Map<CategoryId, string>(
  CATEGORIES.map((c) => [c.id, c.title])
);

// Explicit sequence order within categories for Phase 1 gap topics
const ORDER_TIEBREAKER: Record<string, number> = {
  't13b-recursion-call-stack': 15.5,
  't27b-debugging-devtools': 29.5,
  't36b-testing-fundamentals': 38.1,
  't36c-clean-code-organization': 38.2,
  't36d-performance-security-basics': 38.3,
};

const RAW_TOPICS: JsTopic[] = [
  ...TOPICS_PART_1,
  ...TOPICS_PART_2,
  ...TOPICS_PART_3,
  ...TOPICS_PART_4,
  ...TOPICS_PHASE1_GAPS,
];

export const TOPICS: JsTopic[] = RAW_TOPICS.map((topic) => {
  const enrichment = TOPIC_METADATA[topic.id];
  const categoryTitle = CATEGORY_TITLE_MAP.get(topic.categoryId) ?? topic.categoryTitle;
  return {
    ...topic,
    categoryTitle,
    track: topic.track ?? enrichment?.track ?? 'Essential',
    importanceWeight: topic.importanceWeight ?? enrichment?.importanceWeight ?? 2,
    prerequisites: topic.prerequisites ?? enrichment?.prerequisites ?? [],
    learningObjectives: topic.learningObjectives ?? enrichment?.learningObjectives,
    realWorldAnalogy: topic.realWorldAnalogy ?? enrichment?.realWorldAnalogy,
    goDeeper: topic.goDeeper ?? enrichment?.goDeeper,
  };
})
  .sort((a, b) => {
    const catDiff =
      (CATEGORY_ORDER_MAP.get(a.categoryId) ?? 99) -
      (CATEGORY_ORDER_MAP.get(b.categoryId) ?? 99);
    if (catDiff !== 0) return catDiff;
    const orderA = ORDER_TIEBREAKER[a.id] ?? a.number;
    const orderB = ORDER_TIEBREAKER[b.id] ?? b.number;
    return orderA - orderB;
  })
  .map((topic, index) => ({
    ...topic,
    number: index + 1,
  }));

export const TOPICS_BY_ID: Record<string, JsTopic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t])
);
