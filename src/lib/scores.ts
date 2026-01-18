import { Category, DualScores, Scores } from '../types';

export const buildDefaultScores = (categories: Category[]): Scores => {
  const defaults: Scores = {};
  categories.forEach((category) => {
    category.questions.forEach((question) => {
      defaults[question.id] = question.defaultValue;
    });
  });
  return defaults;
};

export const createDualScores = (categories: Category[]): DualScores => {
  const defaults = buildDefaultScores(categories);
  return {
    individual: { ...defaults },
    manager: { ...defaults },
  };
};

const resolveValue = (value: number | null | undefined, fallback: number) =>
  typeof value === 'number' ? value : fallback;

export const resolveScores = (scores: Scores, defaults: Scores): Scores => {
  const resolved: Scores = {};
  Object.keys(defaults).forEach((key) => {
    resolved[key] = resolveValue(scores[key], defaults[key] ?? 0);
  });
  return resolved;
};

export const hasAnyEdits = (categories: Category[], scores: Scores, defaults: Scores) =>
  categories.some((category) =>
    category.questions.some(
      (question) => resolveValue(scores[question.id], defaults[question.id] ?? 0) !== defaults[question.id]
    )
  );

export const isPerspectiveComplete = (categories: Category[], scores: Scores, defaults: Scores) =>
  categories.every((category) =>
    category.questions.some(
      (question) => resolveValue(scores[question.id], defaults[question.id] ?? 0) !== defaults[question.id]
    )
  );

export const buildCombinedScores = (individual: Scores, manager: Scores, defaults: Scores): Scores => {
  const combined: Scores = {};
  Object.keys(defaults).forEach((key) => {
    const individualValue = resolveValue(individual[key], defaults[key] ?? 0);
    const managerValue = resolveValue(manager[key], defaults[key] ?? 0);
    combined[key] = Math.round((individualValue + managerValue) / 2);
  });
  return combined;
};
