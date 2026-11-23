import type { CategoryId } from '../../types/topic';
import type { CodingChallengeItem, RichQuizQuestion } from '../../types/practiceBank';
import { buildWeightedQuestionBanks, type SectionBankSummary } from './sectionBankBuilder';

const built = buildWeightedQuestionBanks();

export const ALL_CODING_CHALLENGES: CodingChallengeItem[] = built.allCodingChallenges;
export const ALL_RICH_QUESTIONS: RichQuizQuestion[] = built.allRichQuestions;
export const SECTION_BANK_SUMMARIES: Record<CategoryId, SectionBankSummary> = built.sectionSummaries;

const CODING_BY_TOPIC = new Map<string, CodingChallengeItem[]>();
for (const item of ALL_CODING_CHALLENGES) {
  const arr = CODING_BY_TOPIC.get(item.topicId) ?? [];
  arr.push(item);
  CODING_BY_TOPIC.set(item.topicId, arr);
}

const RICH_BY_TOPIC = new Map<string, RichQuizQuestion[]>();
for (const item of ALL_RICH_QUESTIONS) {
  const arr = RICH_BY_TOPIC.get(item.topicId) ?? [];
  arr.push(item);
  RICH_BY_TOPIC.set(item.topicId, arr);
}

export function getTopicCodingChallenges(topicId: string): CodingChallengeItem[] {
  return (CODING_BY_TOPIC.get(topicId) ?? []).filter((c) => c.kind !== 'debug');
}

export function getTopicDebugChallenges(topicId: string): CodingChallengeItem[] {
  return (CODING_BY_TOPIC.get(topicId) ?? []).filter((c) => c.kind === 'debug');
}

export function getAllTopicExecutableChallenges(topicId: string): CodingChallengeItem[] {
  return CODING_BY_TOPIC.get(topicId) ?? [];
}

export function getTopicRichQuestions(topicId: string): RichQuizQuestion[] {
  return RICH_BY_TOPIC.get(topicId) ?? [];
}

export function getTopicTotalQuestionCount(topicId: string, categoryId: CategoryId): number {
  return SECTION_BANK_SUMMARIES[categoryId]?.perTopicTotals[topicId] ?? 4;
}

export function getSectionQuestionSummary(categoryId: CategoryId): SectionBankSummary {
  return SECTION_BANK_SUMMARIES[categoryId];
}
