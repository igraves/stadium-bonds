# Chiefs STAR Bond Analysis

An open, auditable financial model of the Kansas STAR bond financing for the proposed Chiefs stadium in Wyandotte County, and what it means for taxpayers in Johnson and Wyandotte counties.

**Live model:** https://starbonds.graveissues.com/

**Coverage:** [Kansas Reflector](https://kansasreflector.com/2026/01/02/chiefs-move-to-kansas-leaves-experts-grappling-with-possible-revenue-drain-massive-unknowns/) · [Kansas Policy Institute](https://kansaspolicy.org/why-the-approved-chiefs-deal-is-bad-economics/) · [Field of Schemes](https://www.fieldofschemes.com/2026/01/05/23513/kansas-council-rep-sets-up-website-to-calculate-how-many-billions-chiefs-stadium-would-cost-taxpayers/) · [KC Business Journal](https://www.bizjournals.com/kansascity/news/2026/01/23/chiefs-stadium-star-bonds-wyandotte-county-olathe.html)

## What this shows

Under the executed STAR Bond Agreement (Project Monitor 2.0, December 22, 2025), the state finances $1.8B of a $3.0B stadium through 30-year STAR bonds repaid from *incremental* state sales, use, alcohol, and sports-wagering tax revenue inside the district — only growth above the base year is captured.

At default assumptions (5.0% bond rate, 2.5% revenue growth, 4-year construction, 1.30x coverage):

- Gross bond proceeds of roughly **$2.43B** are needed to fund $1.8B of construction plus debt service during construction.
- Annual debt service is about **$158M**, requiring ~**$206M/yr** of pledged revenue at 1.30x coverage.
- Increment revenue does not reach that threshold until **Year 12**. Years 5–11 show a cumulative shortfall of roughly **$400–500M** that has to be covered by reserve funds, state appropriations, or other pledged streams.
- Over 30 years, sales + use tax provides over 95% of the increment. Alcohol and sports wagering are marginal.

Every input above is adjustable in the live tool and the notebooks. Full derivations and sources:

- [`ASSUMPTIONS.md`](ASSUMPTIONS.md) — base-year revenues, growth rates, increment method, data sources
- [`BOND_ASSUMPTIONS.md`](BOND_ASSUMPTIONS.md) — bond structure, debt service math, coverage requirements, sensitivity tables

## Data sources

Primary documents are in [`data/`](data/): the executed STAR Bond Agreement, Kansas Department of Revenue sales/use tax publications and distributions, the Liquor Enforcement Tax FY25 county report, and the Kansas Lottery FY26 budget report. Each figure in the assumptions docs cites its source.

## Repository layout

| Path | What it is |
|------|------------|
| `star_financing_model.ipynb` | Core increment and debt-service model |
| `star_financing_accelerated.ipynb` | Alternative amortization / timing scenarios |
| `tax_bond_analysis.ipynb` | Exploratory tax base analysis |
| `extract_2018_2020_data.py` | Pulls historical KDOR data used to establish baselines |
| `api/` | Backend serving model outputs to the web app |
| `web/` | Interactive front end (starbonds.graveissues.com) |
| `infra/` | Deployment configuration |
| `data/` | Source documents and extracted datasets |
| `CLAUDE.md` | Working notes for AI-assisted development of this repo |

## Running it

```bash
uv sync
uv run jupyter lab          # open the notebooks
```

See `web/` and `api/` for running the interactive app locally.

## Caveats

This is a projection model, not a forecast. It assumes steady growth with no recessions, holds the grocery sales tax exemption permanent, and treats district boundaries as approximate. It is intended to make the financing structure legible and the assumptions arguable — if you think an input is wrong, change it and see what moves.

## About

Built by Ian Graves, Prairie Village city councilmember and software engineer, as an independent analysis. Not affiliated with any party to the agreement. Developed with Claude as a modeling and coding collaborator; the assumptions, sources, and conclusions are mine.

## License

MIT — see [`LICENSE`](LICENSE).
