export type CategoryId =
  | 'cat-1-foundations'
  | 'cat-2-strings-arrays'
  | 'cat-3-functions-scope'
  | 'cat-4-objects-operators'
  | 'cat-5-context-oop'
  | 'cat-6-dom-browser'
  | 'cat-7-async-js'
  | 'cat-8-modern-architecture';

export type DifficultyTier = 'Basic' | 'Intermediate' | 'Advanced';

export type TopicTrack = 'Essential' | 'Deep-dive';
export type TopicWeight = 1 | 2 | 3;

export interface GoDeeperBlock {
  title: string;
  paragraphs: string[];
  codeExample?: string;
}

export interface TopicCategory {
  id: CategoryId;
  order: number;
  title: string;
  tierRange: string;
  description: string;
}

export interface QuizQuestion {
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
}

export interface ConsoleEntry {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
}

export interface PracticeExercise {
  title: string;
  scenario: string;
  taskPrompt: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  solutionJs: string;
}

export interface JsTopic {
  id: string;
  number: number;
  categoryId: CategoryId;
  categoryTitle: string;
  tier: DifficultyTier;
  title: string;
  webDevUseCase: string;
  summary: string;
  revisionTldr: string;
  explanation: string[];
  keyRules: string[];
  codeExample: string;
  commonMistake: {
    label: string;
    avoid: string;
    prefer: string;
  };
  practice: {
    logical: PracticeExercise;
    realLife: PracticeExercise;
  };
  quiz: [QuizQuestion, QuizQuestion];
  // Phase 1+ additive curriculum metadata (backward-compatible)
  track?: TopicTrack;
  importanceWeight?: TopicWeight;
  prerequisites?: string[];
  learningObjectives?: string[];
  realWorldAnalogy?: string;
  goDeeper?: GoDeeperBlock[];
}

export interface TopicProgressRecord {
  challengeId: string;
  status: 'attempted' | 'solved';
  savedHtml: string;
  savedJs: string;
  studyNote: string;
  hintsUsed: number;
  attempts: number;
  solvedAt?: string;
  updatedAt?: string;
}

export interface MasteryDimensions {
  conceptUnderstanding: number;
  codingAbility: number;
  problemSolving: number;
  debugging: number;
  quizPerformance: number;
  practicalApplication: number;
}

export interface SpacedRevisionState {
  stage: 0 | 1 | 2 | 3;
  intervalDays: 1 | 3 | 7 | 14;
  nextReviewAt: string;
  lastReviewedAt?: string;
  consecutiveStrongReviews: number;
}

export interface QuizAttemptState {
  answeredIndices: Record<number, number>;
  correctCount: number;
  totalQuestions: number;
  bestScorePct: number;
  lastAnsweredAt?: string;
}

export interface TopicMasteryRecord {
  topicId: string;
  schemaVersion: 2;
  legacySolved?: boolean;
  state: 'not_started' | 'in_progress' | 'mastered';
  overallScore: number;
  dimensions: MasteryDimensions;
  practicedModes: Array<'logical' | 'realLife'>;
  solvedPracticeIds: string[];
  solvedDebugIds: string[];
  richQuizAnswered?: Record<string, boolean>;
  quizState?: QuizAttemptState;
  spacedRevision?: SpacedRevisionState;
  updatedAt: string;
}

export interface ProjectProgressRecord {
  projectId: string;
  savedHtml: string;
  savedCss: string;
  savedJs: string;
  completedMilestones: string[];
  checkedChecklistIds: string[];
  passedTestIds: string[];
  hintsRevealed: number;
  completedAt?: string;
  updatedAt: string;
}

export interface MockInterviewResult {
  id: string;
  completedAt: string;
  preset: string;
  totalQuestions: number;
  correctCount: number;
  scorePct: number;
  durationSec: number;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
  weakTopicIds: string[];
}

export interface ProgressStoreV2 {
  schemaVersion: 2;
  migratedFromV1At?: string;
  progressMap: Record<string, TopicProgressRecord>;
  masteryMap: Record<string, TopicMasteryRecord>;
  projectProgressMap?: Record<string, ProjectProgressRecord>;
  interviewHistory?: MockInterviewResult[];
}


