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

export type AssessmentState = {
  step: 'welcome' | 'assessment';
  founder: FounderInfo;
  answers: Record<string, number>;
  labels: Record<string, string>;
  categoryLabels: Record<string, string>;
  categoryDescriptions: Record<string, string>;
  editMode: boolean;
};

export type CategoryScore = {
  id: string;
  name: string;
  score: number;
};

export type ScoreSummary = {
  categoryScores: CategoryScore[];
  overall: number;
  strengths: CategoryScore[];
  gaps: CategoryScore[];
  interpretations: Record<string, string>;
};
