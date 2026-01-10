import { Category, ScoreSummary } from '../types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const computeScores = (categories: Category[], answers: Record<string, number>): ScoreSummary => {
  const categoryScores = categories.map((category) => {
    const total = category.questions.reduce(
      (sum, question) => sum + clamp(answers[question.id] ?? 0, 0, 5),
      0
    );
    const max = category.questions.length * 5;
    const raw = max === 0 ? 0 : total / max;
    const score = Math.round(raw * 100);
    return { id: category.id, name: category.name, score };
  });

  const overallTotals = categories.reduce(
    (acc, category) => {
      const total = category.questions.reduce(
        (sum, question) => sum + clamp(answers[question.id] ?? 0, 0, 5),
        0
      );
      const max = category.questions.length * 5;
      acc.total += total;
      acc.max += max;
      return acc;
    },
    { total: 0, max: 0 }
  );
  const overall = overallTotals.max === 0 ? 0 : Math.round((overallTotals.total / overallTotals.max) * 100);

  const sorted = [...categoryScores].sort((a, b) => b.score - a.score);
  const strengths = sorted.slice(0, 2);
  const gaps = [...sorted].reverse().slice(0, 2);

  const interpretations: Record<string, string> = {};
  categoryScores.forEach((category) => {
    if (category.score <= 39) {
      interpretations[category.id] = 'Foundational work needed. Prioritize quick wins and clarity.';
    } else if (category.score <= 59) {
      interpretations[category.id] = 'Some traction, but inconsistent. Tighten systems and repeatability.';
    } else if (category.score <= 79) {
      interpretations[category.id] = 'Strong momentum. Focus on scale and operational excellence.';
    } else {
      interpretations[category.id] = 'Exceptional strength. Maintain edge and invest for compounding gains.';
    }
  });

  return { categoryScores, overall, strengths, gaps, interpretations };
};

export const buildSummaryText = (summary: ScoreSummary) => {
  const lines = [`Overall Score: ${summary.overall}`];
  summary.categoryScores.forEach((category) => {
    lines.push(`${category.name}: ${category.score}`);
  });
  lines.push(`Strengths: ${summary.strengths.map((item) => item.name).join(', ')}`);
  lines.push(`Gaps: ${summary.gaps.map((item) => item.name).join(', ')}`);
  return lines.join('\n');
};
