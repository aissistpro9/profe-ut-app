import { Topic, Difficulty } from './types';

export const TOPICS: Topic[] = [
  Topic.Algebra,
  Topic.Geometry,
  Topic.Calculus,
  Topic.Trigonometry,
  Topic.Statistics,
];

export const DIFFICULTIES: Difficulty[] = [
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
  Difficulty.Expert,
];

export const DIFFICULTY_LABELS_ES: { [key in Difficulty]: string } = {
    [Difficulty.Easy]: 'Fácil',
    [Difficulty.Medium]: 'Medio',
    [Difficulty.Hard]: 'Difícil',
    [Difficulty.Expert]: 'Experto',
};