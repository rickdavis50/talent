import { Category } from '../types';

export const categories: Category[] = [
  {
    id: 'product',
    name: 'Product',
    description: 'Vision, discovery, and product quality discipline.',
    questions: [
      {
        id: 'product-vision',
        label: 'I can articulate a crisp, differentiated product vision.',
        helper: 'Clear, inspiring narrative with differentiated positioning.',
        defaultValue: 3,
      },
      {
        id: 'product-discovery',
        label: 'We regularly validate assumptions with real users.',
        helper: 'Continuous discovery with real user input.',
        defaultValue: 3,
      },
      {
        id: 'product-prioritization',
        label: 'Our roadmap prioritization is disciplined and data-informed.',
        helper: 'Deliberate, outcome-driven prioritization.',
        defaultValue: 3,
      },
      {
        id: 'product-experience',
        label: 'The product experience is delightful and consistent.',
        helper: 'Polished experience users love.',
        defaultValue: 3,
      },
      {
        id: 'product-iteration',
        label: 'We ship improvements quickly and learn from results.',
        helper: 'Fast iteration with tight feedback loops.',
        defaultValue: 3,
      },
    ],
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Technical execution, architecture, and delivery.',
    questions: [
      {
        id: 'eng-velocity',
        label: 'The team delivers reliably and on a steady cadence.',
        helper: 'Consistent, trusted delivery cadence.',
        defaultValue: 3,
      },
      {
        id: 'eng-quality',
        label: 'Quality is engineered in, not inspected at the end.',
        helper: 'Built-in quality and stability.',
        defaultValue: 3,
      },
      {
        id: 'eng-architecture',
        label: 'Our architecture scales with product and team growth.',
        helper: 'Modular, resilient architecture.',
        defaultValue: 3,
      },
      {
        id: 'eng-ownership',
        label: 'Engineers own outcomes, not just output.',
        helper: 'Outcome ownership across the team.',
        defaultValue: 3,
      },
      {
        id: 'eng-hiring',
        label: 'We hire and onboard technical talent effectively.',
        helper: 'Repeatable, high-signal hiring and onboarding.',
        defaultValue: 3,
      },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Decision-making, alignment, and culture.',
    questions: [
      {
        id: 'lead-clarity',
        label: 'The team has clarity on goals and priorities.',
        helper: 'Clear alignment on goals and priorities.',
        defaultValue: 3,
      },
      {
        id: 'lead-decision',
        label: 'We make timely, high-quality decisions.',
        helper: 'Decisive, accountable decisions.',
        defaultValue: 3,
      },
      {
        id: 'lead-culture',
        label: 'Our culture reinforces focus, trust, and high standards.',
        helper: 'Intentional, healthy culture.',
        defaultValue: 3,
      },
      {
        id: 'lead-feedback',
        label: 'Feedback loops are frequent and constructive.',
        helper: 'Frequent, constructive feedback loops.',
        defaultValue: 3,
      },
      {
        id: 'lead-resilience',
        label: 'We stay resilient under pressure and setbacks.',
        helper: 'Calm, adaptive leadership under pressure.',
        defaultValue: 3,
      },
    ],
  },
  {
    id: 'go-to-market',
    name: 'Go-to-Market',
    description: 'Demand generation, sales, and customer success.',
    questions: [
      {
        id: 'gtm-icp',
        label: 'We have a clear ICP and positioning that resonates.',
        helper: 'Sharp ICP with proven resonance.',
        defaultValue: 3,
      },
      {
        id: 'gtm-pipeline',
        label: 'Our pipeline generation is predictable.',
        helper: 'Predictable, repeatable pipeline engine.',
        defaultValue: 3,
      },
      {
        id: 'gtm-sales',
        label: 'The sales motion is efficient and improving.',
        helper: 'Structured, measurable sales motion.',
        defaultValue: 3,
      },
      {
        id: 'gtm-retention',
        label: 'Customers renew and expand with confidence.',
        helper: 'Strong retention and expansion.',
        defaultValue: 3,
      },
      {
        id: 'gtm-story',
        label: 'Our narrative stands out in the market.',
        helper: 'Memorable, differentiated story.',
        defaultValue: 3,
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Runway planning, unit economics, and reporting.',
    questions: [
      {
        id: 'fin-runway',
        label: 'We have a clear runway and burn plan.',
        helper: 'Disciplined runway and burn management.',
        defaultValue: 3,
      },
      {
        id: 'fin-unit',
        label: 'Unit economics are healthy or improving.',
        helper: 'Healthy, tracked unit economics.',
        defaultValue: 3,
      },
      {
        id: 'fin-forecast',
        label: 'We forecast and track cash with confidence.',
        helper: 'Reliable monthly forecasting.',
        defaultValue: 3,
      },
      {
        id: 'fin-kpis',
        label: 'Key financial KPIs are visible to leadership.',
        helper: 'Visible, regularly reviewed KPIs.',
        defaultValue: 3,
      },
      {
        id: 'fin-fundraising',
        label: 'Fundraising readiness is high.',
        helper: 'Materials and metrics ready.',
        defaultValue: 3,
      },
    ],
  },
];
