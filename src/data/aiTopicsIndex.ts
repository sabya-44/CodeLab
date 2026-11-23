import type { AiLesson, AiStage } from '../types/aiTutorial';
import { AI_LESSONS_PART_1 } from './aiTopicsPart1';
import { AI_LESSONS_PART_2 } from './aiTopicsPart2';

export const AI_STAGES: AiStage[] = [
  {
    id: 'stage-1-foundations',
    order: 1,
    title: 'Stage 1: AI Foundations for Web Developers',
    subtitle: 'Zero AI background needed',
    description:
      'Start from scratch: learn what LLMs, tokens, and context windows are, how your browser communicates safely with an AI server proxy, and how system instructions control behavior.',
  },
  {
    id: 'stage-2-integration',
    order: 2,
    title: 'Stage 2: Connecting Frontend + Backend to AI',
    subtitle: 'Core full-stack workflows',
    description:
      'Build real product features: structured JSON outputs for React UIs, instant word-by-word SSE streaming with cancellation, and per-user database chat memory.',
  },
  {
    id: 'stage-3-production',
    order: 3,
    title: 'Stage 3: Production AI Engineering & Career Readiness',
    subtitle: 'Tools, RAG, security & portfolio',
    description:
      'Level up for Full-Stack job roles: connect AI to live databases via Function Calling, eliminate hallucinations with RAG embeddings, add rate-limit/XSS guardrails, and plan your portfolio.',
  },
];

export const AI_LESSONS: AiLesson[] = [...AI_LESSONS_PART_1, ...AI_LESSONS_PART_2].sort(
  (a, b) => a.number - b.number
);
