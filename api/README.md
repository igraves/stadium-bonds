# api/ — STAR Bond financing model service

Fastify + TypeScript port of the notebook model in
[`../star_financing_model.ipynb`](../star_financing_model.ipynb) and
[`../star_financing_accelerated.ipynb`](../star_financing_accelerated.ipynb).
Runs as a local server for development and as a bundled Lambda behind API
Gateway in production.

## Running locally

From the repository root (this is an npm workspace):

```bash
npm install
npm run dev          # this API on :3000 and the web app on :5173
npm run dev:api      # just this service
```

`npm run dev:api` sets `LOCAL_DEV=true`, which mounts the routes under `/api` to
match the deployed API Gateway stage.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness check (not prefixed in local dev) |
| `GET` | `/api/defaults` | Default bond parameters and revenue streams |
| `POST` | `/api/simulate` | Run one scenario; returns the amortization schedule and summary |
| `POST` | `/api/simulate/sensitivity` | Interest rate x growth rate grid |
| `POST` | `/api/simulate/compare-paydown` | Compare excess-revenue paydown percentages |
| `POST` | `/api/feedback` | Forwards the feedback form via SES; requires `FEEDBACK_EMAIL` |

## Configuration

All optional — the service runs with everything unset. See
[`../.env.example`](../.env.example) for the full list: `PORT`, `HOST`,
`LOG_LEVEL`, `CORS_ORIGIN`, `LOCAL_DEV`, and `FEEDBACK_EMAIL`.

## Layout

| Path | What it is |
|------|------------|
| `src/models/revenue.model.ts` | Revenue streams and increment growth |
| `src/models/debt-service.model.ts` | Level payment and amortization math |
| `src/models/simulation.model.ts` | Capitalized-interest simulation loop |
| `src/models/sensitivity.model.ts` | Parameter sweeps |
| `src/config/defaults.ts` | Default parameters served by `/api/defaults` |
| `src/lambda.ts` | API Gateway adapter |
| `scripts/bundle-lambda.js` | esbuild bundle for deployment |

## Build

```bash
npm run build -w api          # tsc, output in api/dist
npm run build:lambda -w api   # tsc + esbuild bundle for Lambda
```
