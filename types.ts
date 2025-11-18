
export enum Topic {
  Algebra = 'Algebra',
  Geometry = 'Geometry',
  Calculus = 'Calculus',
  Trigonometry = 'Trigonometry',
  Statistics = 'Statistics',
}

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
  Expert = 'Expert',
}

export interface Problem {
  title: string;
  context: string;
  questions: string[];
  answer: string;
}

export interface YouTubeVideo {
  title: string;
  videoId: string;
}
