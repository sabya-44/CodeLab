import type { VisualizerScenario } from '../types/visualizer';
import { VISUALIZERS_PART_1 } from './visualizersPart1';
import { VISUALIZERS_PART_2 } from './visualizersPart2';
import { VISUALIZERS_PART_3 } from './visualizersPart3';
import { VISUALIZERS_PART_4 } from './visualizersPart4';

export const ALL_VISUALIZERS: VisualizerScenario[] = [
  ...VISUALIZERS_PART_1,
  ...VISUALIZERS_PART_2,
  ...VISUALIZERS_PART_3,
  ...VISUALIZERS_PART_4,
];

const VISUALIZERS_BY_TOPIC = new Map<string, VisualizerScenario[]>();
for (const scenario of ALL_VISUALIZERS) {
  const list = VISUALIZERS_BY_TOPIC.get(scenario.topicId) ?? [];
  list.push(scenario);
  VISUALIZERS_BY_TOPIC.set(scenario.topicId, list);
}

export function getVisualizersForTopic(topicId: string): VisualizerScenario[] {
  return VISUALIZERS_BY_TOPIC.get(topicId) ?? [];
}

export function topicHasVisualizer(topicId: string): boolean {
  return (VISUALIZERS_BY_TOPIC.get(topicId)?.length ?? 0) > 0;
}
