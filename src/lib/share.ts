import { AssessmentState } from '../types';

const base64UrlEncode = (input: string) =>
  btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const base64UrlDecode = (input: string) => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return decodeURIComponent(escape(atob(padded)));
};

export const encodeStateToQuery = (state: AssessmentState) => {
  const payload = {
    founder: state.founder,
    scores: state.scores,
    labels: state.labels,
    categoryLabels: state.categoryLabels,
    categoryDescriptions: state.categoryDescriptions,
  };
  return base64UrlEncode(JSON.stringify(payload));
};

export const decodeStateFromQuery = (value: string): Partial<AssessmentState> | null => {
  try {
    const raw = base64UrlDecode(value);
    const parsed = JSON.parse(raw) as Partial<AssessmentState>;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    console.warn('Failed to decode share state', error);
    return null;
  }
};
