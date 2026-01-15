import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { categories } from './data/questions';
import iconEngineer from './assets/icon_engineer.svg';
import iconFinance from './assets/icon_finance.svg';
import iconGoToMarket from './assets/icon_go_to_market.svg';
import iconLeadership from './assets/icon_leadership.svg';
import iconProduct from './assets/icon_product.svg';
import { AssessmentState, FounderInfo } from './types';
import { computeScores } from './lib/scoring';
import { decodeStateFromQuery } from './lib/share';
import { clearState, loadState, saveState } from './lib/storage';
import RadarCanvas from './components/RadarCanvas';
import SliderRow from './components/SliderRow';
import CategoryAccordion from './components/CategoryAccordion';
import TopBar from './components/TopBar';
import BottomSheet from './components/BottomSheet';
import Modal from './components/Modal';
import Toast from './components/Toast';
import AppButton from './components/AppButton';

const defaultAnswers = categories.reduce<Record<string, number>>((acc, category) => {
  category.questions.forEach((question) => {
    acc[question.id] = question.defaultValue;
  });
  return acc;
}, {});

const initialState: AssessmentState = {
  step: 'welcome',
  founder: {
    name: '',
    company: '',
    assessmentName: '',
  },
  answers: defaultAnswers,
  labels: {},
  categoryLabels: {},
  categoryDescriptions: {},
  editMode: false,
};

type Action =
  | { type: 'SET_FOUNDER'; payload: Partial<FounderInfo> }
  | { type: 'SET_STEP'; payload: AssessmentState['step'] }
  | { type: 'SET_ANSWER'; payload: { id: string; value: number } }
  | { type: 'SET_LABEL'; payload: { id: string; value: string } }
  | { type: 'SET_CATEGORY_LABEL'; payload: { id: string; value: string } }
  | { type: 'SET_CATEGORY_DESCRIPTION'; payload: { id: string; value: string } }
  | { type: 'TOGGLE_EDIT' }
  | { type: 'RESET_SCORES' }
  | { type: 'RESET_TEXT' }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; payload: Partial<AssessmentState> };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const reducer = (state: AssessmentState, action: Action): AssessmentState => {
  switch (action.type) {
    case 'SET_FOUNDER':
      return { ...state, founder: { ...state.founder, ...action.payload } };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.payload.id]: action.payload.value },
      };
    case 'SET_LABEL':
      return {
        ...state,
        labels: { ...state.labels, [action.payload.id]: action.payload.value },
      };
    case 'SET_CATEGORY_LABEL':
      return {
        ...state,
        categoryLabels: { ...state.categoryLabels, [action.payload.id]: action.payload.value },
      };
    case 'SET_CATEGORY_DESCRIPTION':
      return {
        ...state,
        categoryDescriptions: { ...state.categoryDescriptions, [action.payload.id]: action.payload.value },
      };
    case 'TOGGLE_EDIT':
      return { ...state, editMode: !state.editMode };
    case 'RESET_SCORES': {
      return {
        ...state,
        answers: defaultAnswers,
        editMode: false,
      };
    }
    case 'RESET_TEXT': {
      return {
        ...state,
        labels: {},
        categoryLabels: {},
        categoryDescriptions: {},
        editMode: false,
      };
    }
    case 'RESET_ALL': {
      return {
        ...state,
        answers: defaultAnswers,
        labels: {},
        categoryLabels: {},
        categoryDescriptions: {},
        editMode: false,
      };
    }
    case 'HYDRATE': {
      return {
        ...state,
        ...action.payload,
      } as AssessmentState;
    }
    default:
      return state;
  }
};

const getLabel = (id: string, fallback: string, labels: Record<string, string>) => {
  const override = labels[id];
  return override && override.trim().length > 0 ? override : fallback;
};

const getCategoryValue = (id: string, fallback: string, overrides: Record<string, string>) => {
  const override = overrides[id];
  return override && override.trim().length > 0 ? override : fallback;
};

const sanitizeIncomingState = (incoming: Partial<AssessmentState>): Partial<AssessmentState> => {
  const sanitizedAnswers: Record<string, number> = { ...defaultAnswers };
  if (incoming.answers) {
    Object.keys(sanitizedAnswers).forEach((key) => {
      const value = incoming.answers?.[key];
      if (typeof value === 'number') {
        sanitizedAnswers[key] = clamp(value, 0, 5);
      }
    });
  }

  const sanitizedLabels: Record<string, string> = {};
  if (incoming.labels) {
    Object.entries(incoming.labels).forEach(([key, value]) => {
      if (typeof value === 'string') sanitizedLabels[key] = value;
    });
  }

  const sanitizedCategoryLabels: Record<string, string> = {};
  if (incoming.categoryLabels) {
    Object.entries(incoming.categoryLabels).forEach(([key, value]) => {
      if (typeof value === 'string') sanitizedCategoryLabels[key] = value;
    });
  }

  const sanitizedCategoryDescriptions: Record<string, string> = {};
  if (incoming.categoryDescriptions) {
    Object.entries(incoming.categoryDescriptions).forEach(([key, value]) => {
      if (typeof value === 'string') sanitizedCategoryDescriptions[key] = value;
    });
  }

  const founder = {
    name: incoming.founder?.name ?? '',
    company: incoming.founder?.company ?? '',
    assessmentName: incoming.founder?.assessmentName ?? '',
  };

  return {
    step: 'assessment',
    founder,
    answers: sanitizedAnswers,
    labels: sanitizedLabels,
    categoryLabels: sanitizedCategoryLabels,
    categoryDescriptions: sanitizedCategoryDescriptions,
    editMode: false,
  };
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [openCategory, setOpenCategory] = useState<string>('engineering');
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() =>
    categories.map((category) => category.id)
  );
  const [draggingCategory, setDraggingCategory] = useState<string | null>(null);

  const titleOptions = useMemo(
    () => ['Engineering', 'Leadership', 'Go-to-Market', 'Finance', 'Product'],
    []
  );
  const categoryIconMap = useMemo<Record<string, string>>(
    () => ({
      Engineering: iconEngineer,
      Leadership: iconLeadership,
      'Go-to-Market': iconGoToMarket,
      Finance: iconFinance,
      Product: iconProduct,
    }),
    []
  );

  const summary = useMemo(() => computeScores(categories, state.answers), [state.answers]);
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    []
  );
  const categoryScoreMap = useMemo(
    () => new Map(summary.categoryScores.map((score) => [score.id, score.score])),
    [summary.categoryScores]
  );
  const scoreTone = (score: number) =>
    score < 80 ? 'text-[var(--color-danger)]' : 'text-[var(--color-accent)]';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareValue = params.get('s');
    if (shareValue) {
      const decoded = decodeStateFromQuery(shareValue);
      if (decoded) {
        dispatch({ type: 'HYDRATE', payload: sanitizeIncomingState(decoded) });
        return;
      }
    }

    const stored = loadState();
    if (stored) {
      dispatch({ type: 'HYDRATE', payload: stored });
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      saveState(state);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    setShowToast(true);
    const handle = window.setTimeout(() => setShowToast(false), 2000);
    return () => window.clearTimeout(handle);
  }, [toast]);

  const toggleCategory = (id: string) => {
    setOpenCategory((prev) => (prev === id ? '' : id));
  };

  const handleDownload = () => {
    window.print();
  };

  const handleResetScores = () => {
    dispatch({ type: 'RESET_SCORES' });
    clearState();
    setShowReset(false);
    setToast('Scores reset');
  };

  const handleResetText = () => {
    dispatch({ type: 'RESET_TEXT' });
    clearState();
    setShowReset(false);
    setToast('Text reset');
  };

  const handleResetAll = () => {
    dispatch({ type: 'RESET_ALL' });
    clearState();
    setShowReset(false);
    setToast('Assessment reset');
  };

  const handleCategoryDragStart = (id: string) => {
    setDraggingCategory(id);
  };

  const handleCategoryDragOver = (event: React.DragEvent<HTMLDivElement>, _id: string) => {
    event.preventDefault();
  };

  const handleCategoryDrop = (targetId: string) => {
    if (!draggingCategory || draggingCategory === targetId) {
      setDraggingCategory(null);
      return;
    }
    setCategoryOrder((prev) => {
      const next = [...prev];
      const fromIndex = next.indexOf(draggingCategory);
      const toIndex = next.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggingCategory);
      return next;
    });
    setDraggingCategory(null);
  };

  const resolveCategoryTitle = (categoryId: string, fallback: string) => {
    const value = getCategoryValue(categoryId, fallback, state.categoryLabels);
    return titleOptions.includes(value) ? value : fallback;
  };

  const getCategoryIcon = (label: string) => categoryIconMap[label] ?? iconProduct;

  const usedTitles = useMemo(() => {
    return categories.map((category) => resolveCategoryTitle(category.id, category.name));
  }, [state.categoryLabels, titleOptions]);


  if (state.step === 'welcome') {
    return (
      <div className="min-h-screen px-6 py-12">
        <div className="mx-auto max-w-3xl animate-fade-up">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 shadow-lg">
            <div className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted)]">Talent OS</div>
            <h1 className="mt-4 text-4xl font-semibold font-display">Top Talent Tune-up</h1>
            <p className="mt-3 text-[var(--color-muted)]">
              Capture your baseline across product, engineering, leadership, go-to-market, and finance.
            </p>

            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm">
                Founder name
                <input
                  value={state.founder.name}
                  onChange={(event) => dispatch({ type: 'SET_FOUNDER', payload: { name: event.target.value } })}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 focus-ring"
                  placeholder="Alex Rivera"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm">
                Company
                <input
                  value={state.founder.company}
                  onChange={(event) => dispatch({ type: 'SET_FOUNDER', payload: { company: event.target.value } })}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 focus-ring"
                  placeholder="Nova Health"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm">
                Assessment name (optional)
                <input
                  value={state.founder.assessmentName}
                  onChange={(event) =>
                    dispatch({ type: 'SET_FOUNDER', payload: { assessmentName: event.target.value } })
                  }
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 focus-ring"
                  placeholder="Seed readiness check"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <AppButton
                type="button"
                variant="default"
                size="lg"
                onClick={() => dispatch({ type: 'SET_STEP', payload: 'assessment' })}
                disabled={!state.founder.name || !state.founder.company}
                className="rounded-full"
              >
                Start assessment
              </AppButton>
              <AppButton
                type="button"
                variant="outline"
                size="lg"
                onClick={() => dispatch({ type: 'SET_STEP', payload: 'assessment' })}
                className="rounded-full"
              >
                Skip for now
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-6 pb-24 pt-10 md:pb-10 no-print">
      <Toast message={toast} visible={showToast} />
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <TopBar
          onReset={() => setShowReset(true)}
          onDownload={handleDownload}
          editMode={state.editMode}
          onToggleEdit={() => dispatch({ type: 'TOGGLE_EDIT' })}
          onProfile={() => setShowProfile(true)}
        />

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:gap-0">
          <div className="order-2 lg:order-1 lg:border-r-2 lg:border-[var(--color-border)] lg:pr-8">
            <div className="w-full max-w-[600px] font-sans lg:pr-2">
              <div className="grid divide-y divide-[#2a2a2a]">
                {categoryOrder.map((id) => {
                  const category = categoryMap.get(id);
                  if (!category) return null;
                  const resolvedTitle = resolveCategoryTitle(category.id, category.name);
                  const iconSrc = getCategoryIcon(resolvedTitle);
                  const disabledOptions = usedTitles.filter((title) => title !== resolvedTitle);
                  const categoryScore = categoryScoreMap.get(category.id) ?? 0;
                  return (
                    <CategoryAccordion
                      key={category.id}
                      id={category.id}
                      title={resolvedTitle}
                      description={getCategoryValue(category.id, category.description, state.categoryDescriptions)}
                      score={categoryScore}
                      scoreTone={scoreTone(categoryScore)}
                      open={openCategory === category.id}
                      onToggle={() => toggleCategory(category.id)}
                      editMode={state.editMode}
                      onTitleChange={(value) =>
                        dispatch({ type: 'SET_CATEGORY_LABEL', payload: { id: category.id, value } })
                      }
                      onDescriptionChange={(value) =>
                        dispatch({ type: 'SET_CATEGORY_DESCRIPTION', payload: { id: category.id, value } })
                      }
                      onDragStart={state.editMode ? handleCategoryDragStart : undefined}
                      onDragOver={state.editMode ? handleCategoryDragOver : undefined}
                      onDrop={state.editMode ? handleCategoryDrop : undefined}
                      titleOptions={titleOptions}
                      disabledOptions={disabledOptions}
                      iconSrc={iconSrc}
                    >
                      {category.questions.map((question) => (
                        <SliderRow
                          key={question.id}
                          id={question.id}
                          label={getLabel(question.id, question.label, state.labels)}
                          helper={question.helper}
                          value={state.answers[question.id] ?? question.defaultValue}
                          onChange={(value) =>
                            dispatch({ type: 'SET_ANSWER', payload: { id: question.id, value } })
                          }
                          editMode={state.editMode}
                          onLabelChange={(value) =>
                            dispatch({ type: 'SET_LABEL', payload: { id: question.id, value } })
                          }
                        />
                      ))}
                    </CategoryAccordion>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-8 lg:pl-8">
            <div className="py-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase text-[var(--color-muted)]">Overall</div>
                  <div className="text-3xl font-semibold">{summary.overall}%</div>
                  <div className="text-xs text-[var(--color-muted)]">Overall score</div>
                </div>
                {state.founder.assessmentName ? (
                  <div className="rounded-full px-3 py-1 text-xs text-[var(--color-muted)]">
                    {state.founder.assessmentName}
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <RadarCanvas
                  scores={summary.categoryScores.map((score) => {
                    const resolvedTitle = resolveCategoryTitle(score.id, score.name);
                    return {
                      ...score,
                      name: resolvedTitle,
                      iconSrc: getCategoryIcon(resolvedTitle),
                    };
                  })}
                />
              </div>

              <div className="mt-5 grid gap-2 text-sm">
                {summary.categoryScores.map((score) => (
                  <div key={score.id} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <span className="text-[var(--color-muted)]">
                      {getCategoryValue(score.id, score.name, state.categoryLabels)}
                    </span>
                    <span className={`font-semibold ${scoreTone(score.score)}`}>{score.score}%</span>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-panel)]/95 px-6 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--color-muted)]">Overall</div>
            <div className="text-xl font-semibold">{summary.overall}%</div>
          </div>
          <AppButton
            type="button"
            variant="default"
            onClick={() => setShowInsights(true)}
            className="rounded-full"
          >
            View insights
          </AppButton>
        </div>
      </div>

      <BottomSheet open={showInsights} onClose={() => setShowInsights(false)} title="Insights">
        <div className="rounded-2xl bg-[var(--color-panel)] p-4 text-sm">
          <div className="text-xs uppercase text-[var(--color-muted)]">Strengths & Gaps</div>
          <div className="mt-2">
            Strengths:{' '}
            <span className="text-[var(--color-accent)]">
              {summary.strengths
                .map((s) => getCategoryValue(s.id, s.name, state.categoryLabels))
                .join(', ')}
            </span>
          </div>
          <div className="mt-1">
            Gaps:{' '}
            <span className="text-[var(--color-danger)]">
              {summary.gaps
                .map((g) => getCategoryValue(g.id, g.name, state.categoryLabels))
                .join(', ')}
            </span>
          </div>
        </div>
      </BottomSheet>

      <Modal
        open={showReset}
        onClose={() => setShowReset(false)}
        title="Reset assessment"
        actions={
          <>
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetScores}
              className="rounded-full px-4"
            >
              Reset scores
            </AppButton>
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetText}
              className="rounded-full px-4"
            >
              Reset text
            </AppButton>
            <AppButton
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleResetAll}
              className="rounded-full px-4"
            >
              Reset all
            </AppButton>
          </>
        }
      >
        <p className="text-xs text-[var(--color-muted)]">
          Choose what you want to reset.
        </p>
      </Modal>

      <Modal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        title="Update profile"
      >
        <div className="grid gap-4">
          <label className="grid gap-2 text-xs text-[var(--color-muted)]">
            Name
            <input
              data-autofocus
              autoFocus
              value={state.founder.name}
              onChange={(event) => dispatch({ type: 'SET_FOUNDER', payload: { name: event.target.value } })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm focus-ring"
              placeholder="Alex Rivera"
            />
          </label>
          <label className="grid gap-2 text-xs text-[var(--color-muted)]">
            Company
            <input
              value={state.founder.company}
              onChange={(event) => dispatch({ type: 'SET_FOUNDER', payload: { company: event.target.value } })}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm focus-ring"
              placeholder="Nova Health"
            />
          </label>
          <label className="grid gap-2 text-xs text-[var(--color-muted)]">
            Assessment name (optional)
            <input
              value={state.founder.assessmentName}
              onChange={(event) =>
                dispatch({ type: 'SET_FOUNDER', payload: { assessmentName: event.target.value } })
              }
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3 text-sm focus-ring"
              placeholder="Seed readiness check"
            />
          </label>
        </div>
      </Modal>

    </div>
      <div className="print-only">
      <div className="print-root">
        <div className="print-header">
          <div className="print-title">Top Talent Tune-up</div>
          <div className="print-meta">
            <div>{state.founder.name ? `Name: ${state.founder.name}` : 'Name: —'}</div>
            <div>{state.founder.company ? `Company: ${state.founder.company}` : 'Company: —'}</div>
            <div>
              {state.founder.assessmentName
                ? `Assessment: ${state.founder.assessmentName}`
                : 'Assessment: —'}
            </div>
            <div>{`Date: ${new Date().toLocaleDateString()}`}</div>
          </div>
        </div>

        <div className="print-card">
          <div className="print-kicker">Overall score</div>
          <div className="print-score">{summary.overall}</div>
          <div className="print-grid">
            {summary.categoryScores.map((score) => (
              <div key={score.id} className="print-grid-row">
                <span>{getCategoryValue(score.id, score.name, state.categoryLabels)}</span>
                <span className="print-accent">{score.score}</span>
              </div>
            ))}
          </div>
          <div className="print-insights">
            <div>
              Strengths:{' '}
              <span className="print-accent">
                {summary.strengths
                  .map((s) => getCategoryValue(s.id, s.name, state.categoryLabels))
                  .join(', ')}
              </span>
            </div>
            <div>
              Gaps:{' '}
              <span className="print-warning">
                {summary.gaps
                  .map((g) => getCategoryValue(g.id, g.name, state.categoryLabels))
                  .join(', ')}
              </span>
            </div>
          </div>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="print-section">
            <div className="print-section-header">
              <div>
                <div className="print-section-title">
                  {getCategoryValue(category.id, category.name, state.categoryLabels)}
                </div>
                <div className="print-section-desc">
                  {getCategoryValue(category.id, category.description, state.categoryDescriptions)}
                </div>
              </div>
              <div className="print-section-score">
                {categoryScoreMap.get(category.id) ?? 0}
              </div>
            </div>
            <div className="print-questions">
              {category.questions.map((question) => {
                const questionValue = state.answers[question.id] ?? question.defaultValue;
                return (
                  <div key={question.id} className="print-question-row">
                    <div className="print-question-text">
                      <div className="print-question-label">
                        {getLabel(question.id, question.label, state.labels)}
                      </div>
                      <div className="print-question-helper">{question.helper}</div>
                    </div>
                    <div className="print-question-score">{questionValue}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  );
};

export default App;
