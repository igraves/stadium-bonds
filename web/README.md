# web/ — STAR Bond dashboard front end

React 19 + TypeScript + Vite + Tailwind. Renders the interactive model at
[starbonds.graveissues.com](https://starbonds.graveissues.com/) against the
Fastify API in [`../api`](../api).

## Running locally

From the repository root (this is an npm workspace):

```bash
npm install
npm run dev          # starts the API on :3000 and this app on :5173
```

To run only the front end (assumes an API is already listening on :3000):

```bash
npm run dev:web
```

The dev server proxies `/api` to `http://localhost:3000` — see
[`vite.config.ts`](vite.config.ts). No environment variables are required.

## Other commands

```bash
npm run build -w web     # tsc -b && vite build, output in web/dist
npm run preview -w web   # serve the production build locally
npm run lint -w web      # eslint
```

## Layout

| Path | What it is |
|------|------------|
| `src/components/forms/` | Parameter inputs (bond terms, revenue growth, local add-ins, paydown) |
| `src/components/charts/` | Recharts views: revenue vs. debt service, coverage, principal balance, sensitivity heatmaps |
| `src/hooks/useSimulation.ts` | React Query wrapper over the `/api/simulate` endpoints |
| `src/hooks/useUrlParams.ts` | Encodes the current scenario into the URL so a run can be shared |
| `src/services/api.ts` | Typed API client |
| `src/types/` | Shared request/response types, mirrored from `api/src/types` |
