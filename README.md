# Founder Talent Assessment

A premium, dark-themed founder talent assessment with real-time radar visualization, insights, and shareable state.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Update `vite.config.ts` with the correct base path:

```ts
export default defineConfig({
  plugins: [react()],
  base: '/talent/',
});
```

2. Build and deploy:

```bash
npm run build
```

3. Push `dist/` to the `gh-pages` branch. One simple approach:

```bash
git subtree push --prefix dist origin gh-pages
```

## Persistence + Sharing

- Answers and edited labels auto-save to `localStorage`.
- Share links encode the current state in the query string (`?s=...`). Opening the URL restores the assessment.
