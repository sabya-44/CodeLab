import type { QuizQuestion } from './topic';

export type AiStageId = 'stage-1-foundations' | 'stage-2-integration' | 'stage-3-production';

export interface AiStage {
  id: AiStageId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
}

export interface AiLesson {
  id: string;
  number: number;
  stageId: AiStageId;
  stageTitle: string;
  levelLabel: 'Beginner Friendly' | 'Full-Stack Core' | 'Job-Ready Architecture';
  title: string;
  jobRoleFocus: string;
  summary: string;
  keyTakeaway: string;
  architectureSteps: {
    actor: string;
    action: string;
  }[];
  explanation: string[];
  codeBlueprint: {
    backendLabel: string;
    backendCode: string;
    frontendLabel: string;
    frontendCode: string;
  };
  commonMistake: {
    label: string;
    avoid: string;
    prefer: string;
  };
  practice: {
    taskPrompt: string;
    starterHtml: string;
    starterCss: string;
    starterJs: string;
    solutionJs: string;
  };
  quiz: [QuizQuestion, QuizQuestion];
}
