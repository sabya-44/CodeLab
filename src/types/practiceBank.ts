import type { DifficultyTier } from './topic';

export type PracticeBankKind = 'logical' | 'realLife' | 'debug' | 'output';

export type QuestionCategory =
  | 'Conceptual'
  | 'Output-based'
  | 'Logical'
  | 'Practical'
  | 'Debugging'
  | 'Scenario';

export interface CodeRestriction {
  id: string;
  label: string;
  forbiddenPattern: string; // Regex source checked against learner code (stripped of comments)
  violationMessage: string;
}

export interface ExecutableTestCase {
  id: string;
  label: string;
  hidden?: boolean;
  inputSummary: string;
  expectedSummary: string;
  /**
   * JS expression evaluated inside the sandboxed Web Worker after learner code runs.
   * Must evaluate to `{ actual: any, expected: any, pass?: boolean }`.
   */
  checkExpression: string;
}

export interface CodingChallengeItem {
  id: string;
  topicId: string;
  kind: 'logical' | 'realLife' | 'debug';
  difficulty: DifficultyTier;
  title: string;
  scenario: string;
  taskPrompt: string;
  restrictions?: CodeRestriction[];
  starterJs: string;
  testCases: ExecutableTestCase[];
  /**
   * 4-level progressive hint ladder (Rule Phase 4):
   * [0] Conceptual direction
   * [1] Logical approach
   * [2] Pseudocode / partial code
   * [3] Full walkthrough explanation (paired with solutionJs + dryRun + alternatives)
   */
  hints: [string, string, string, string];
  solutionJs: string;
  dryRun: string;
  alternatives?: string[];
  // Optional diagnosis step for "Find the Bug!" challenges
  bugDiagnosis?: {
    question: string;
    options: [string, string, string];
    correctIndex: 0 | 1 | 2;
    explanation: string;
  };
}

export interface RichQuizQuestion {
  id: string;
  topicId: string;
  category: QuestionCategory;
  difficulty: DifficultyTier;
  question: string;
  codeSnippet?: string;
  options: [string, string, string, string] | [string, string, string];
  correctIndex: number;
  whyCorrect: string;
  wrongOptionReasons: Record<number, string>;
}

export interface PracticeDrillItem {
  id: string;
  topicId: string;
  kind: 'logical' | 'realLife' | 'debug' | 'output';
  difficulty: DifficultyTier;
  title: string;
  prompt: string;
  codeSnippet?: string;
  /**
   * Either an interactive coding challenge ID (links to full worker playground)
   * OR an inline quick output-prediction / debug-fix drill.
   */
  codingChallengeId?: string;
  options?: string[];
  correctIndex?: number;
  hints?: [string, string, string, string];
  whyCorrect?: string;
  wrongOptionReasons?: Record<number, string>;
}

export interface TestCaseExecutionResult {
  id: string;
  label: string;
  hidden: boolean;
  passed: boolean;
  inputSummary: string;
  expectedDisplay: string;
  actualDisplay: string;
  error?: string;
}

export interface FeedbackTrack {
  status: 'strong' | 'good' | 'needs-work';
  summary: string;
  notes: string[];
}

export interface PlaygroundRunResult {
  timedOut: boolean;
  runtimeError?: string;
  restrictionViolations: string[];
  consoleLogs: Array<{ level: 'log' | 'warn' | 'error' | 'info'; message: string }>;
  testResults: TestCaseExecutionResult[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  durationMs: number;
  feedback: {
    correctness: FeedbackTrack;
    readability: FeedbackTrack;
    efficiency: FeedbackTrack;
  };
}
