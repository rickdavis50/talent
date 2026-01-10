import { AssessmentState } from '../types';

const STORAGE_KEY = 'talent-assessment-v1';

export const loadState = (): AssessmentState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentState;
  } catch (error) {
    console.warn('Failed to load state', error);
    return null;
  }
};

export const saveState = (state: AssessmentState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save state', error);
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear state', error);
  }
};
