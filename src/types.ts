export type Question = {
  id: string;
  label: string;
  helper: string;
  defaultValue: number;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  questions: Question[];
};

export type FounderInfo = {
  name: string;
  company: string;
  assessmentName?: string;
};

export type Perspective = 'individual' | 'manager';

export type Scores = Record<string, number | null>;

export type DualScores = {
  individual: Scores;
  manager: Scores;
};

export type AssessmentState = {
  step: 'welcome' | 'assessment';
  founder: FounderInfo;
  scores: DualScores;
  labels: Record<string, string>;
  categoryLabels: Record<string, string>;
  categoryDescriptions: Record<string, string>;
  editMode: boolean;
};

export type LegacyAssessmentState = Omit<AssessmentState, 'scores'> & {
  answers: Record<string, number>;
};

export type CategoryScore = {
  id: string;
  name: string;
  score: number;
  iconSrc?: string;
};

export type ScoreSummary = {
  categoryScores: CategoryScore[];
  overall: number;
  strengths: CategoryScore[];
  gaps: CategoryScore[];
  interpretations: Record<string, string>;
};
