# STAR Bond Structure — Assumptions

This document describes the bond structure the model implements, the parameters
it exposes, and what it produces at their default values.

Two implementations exist and they differ. `star_financing_model.ipynb` is the
reference; `api/` is the port behind
[starbonds.graveissues.com](https://starbonds.graveissues.com/) and has since
diverged from it. Both are documented below rather than one being presented as
canonical. See [`ASSUMPTIONS.md`](ASSUMPTIONS.md) for the revenue side.

---

## Top-Line Financing Structure

Per the executed STAR Bond Agreement (Project Monitor 2.0, December 22, 2025):

| Parameter | Value | Notes |
|-----------|-------|-------|
| Total Stadium Budget | $3.0 billion | Stadium construction cost |
| Public Share (State) | 60% | STAR Bond financing |
| Private Share (Team) | 40% | Team/owner contribution |
| **Net Construction Funding** | **$1.8 billion** | 60% of $3.0B |

The model does not start from the $1.8B construction figure. It starts from an
issued par amount of **$2.4 billion**, the default `PRINCIPAL`, which carries the
construction cost plus issuance and reserve requirements. That figure is an
input you can change, not a derived result.

---

## Bond Terms

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| Principal | $2.4 billion | — | Issued par amount |
| Bond Interest Rate | 5.0% | 4.0% - 6.5% | Tax-exempt municipal bond rate assumption |
| Bond Term | 30 years | — | Matches STAR statute maximum |
| Coverage Ratio | 1.30x | 1.25x - 1.50x | Industry standard for revenue bonds |
| Maximum Capitalization | 20 years | — | Cap period longer than this is treated as non-viable |

---

## Capitalized Interest Model

Pledged revenue in the early years is far below full debt service, because STAR
captures only the *increment* — growth above a frozen base — and that increment
starts near zero. The model handles this by capitalizing the shortfall rather
than by assuming an outside source covers it.

Each year of the capitalization period:

```
interest_due   = principal x rate
interest_paid  = min(available_revenue, interest_due)
shortfall      = interest_due - interest_paid
principal      = principal + shortfall
```

Available revenue pays what interest it can; the unpaid remainder is added to
principal and accrues interest itself. Once the capitalization period ends,
level annual debt service is calculated on the grown principal over the
remaining term:

```
PMT = principal x [r(1+r)^n] / [(1+r)^n - 1]        n = term - cap_years
```

Because the debt service figure determines when the cap period ends, and the cap
period determines the principal that debt service is calculated on, the model
solves the two iteratively until the principal stabilizes within $1,000
(`max_iterations = 50`).

### Where the two implementations differ

| | `star_financing_model.ipynb` | `api/` (live tool) |
|---|---|---|
| Capitalization ends when | `available >= debt_service x coverage_ratio` | `available >= debt_service` |
| Excess revenue during cap period | not applied to principal | 100% applied to principal |

The live tool exits capitalization as soon as revenue covers debt service at
1.00x, so its `coverageRatio` parameter affects only the coverage figure it
reports, not the length of the capitalization period. It also sweeps any revenue
above interest due into principal during the cap period, regardless of the
accelerated-paydown setting. Both changes shorten capitalization and lower the
resulting debt service.

---

## Results at Default Parameters

$2.4B principal, 5.0%, 30 years, 1.30x coverage, 20-year cap limit, 2.5% growth,
local add-ins off.

| | `star_financing_model.ipynb` | `api/` (live tool) |
|---|---|---|
| Sales + use tax base | $668.0M | $711.2M |
| Capitalization years | 11 | 7 |
| Coverage first met | **Year 12** | **Year 8** |
| Principal after capitalization | $2.60B | $2.58B |
| **Annual debt service** | **$197M** | **$187M** |
| Required revenue @ 1.30x | $257M | $243M |
| Interest capitalized | $197M | $180M |
| Total interest over 30 years | $3.10B | $2.65B |

The two bases come from different derivations of the use tax; see the use tax
section of [`ASSUMPTIONS.md`](ASSUMPTIONS.md). The gap between Year 8 and Year 12
is driven more by the cap-exit rule than by the base.

---

## Coverage Ratio Requirement

Bond covenants require pledged revenues to exceed debt service by a safety
margin. Required annual revenue is simply:

```
Required Revenue = Annual Debt Service x Coverage Ratio
```

At the notebook's $197M debt service: 1.25x = $247M, **1.30x = $257M**,
1.40x = $276M, 1.50x = $296M.

Note the caveat above: in the live tool the coverage ratio does not feed the
capitalization logic, so changing it moves the reported coverage line without
changing the schedule.

---

## Sensitivity

Capitalization years by interest rate and sales/use growth rate, from the
sensitivity section of `star_financing_model.ipynb`. `N/A` means capitalization
would exceed the 20-year limit — the project does not pencil. Alcohol and gaming
growth is scaled to `max(1%, growth - 0.5%)` in these runs.

| Rate \ Growth | 1.0% | 1.5% | 2.0% | 2.5% | 3.0% | 3.5% | 4.0% | 5.0% |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 4.0% | N/A | N/A | 12 | 9 | 7 | 6 | 5 | 4 |
| 4.5% | N/A | N/A | 14 | 10 | 8 | 7 | 5 | 4 |
| **5.0%** | N/A | N/A | 15 | **11** | 9 | 7 | 6 | 4 |
| 5.5% | N/A | N/A | 17 | 12 | 9 | 8 | 6 | 5 |
| 6.0% | N/A | N/A | 19 | 13 | 10 | 8 | 7 | 5 |

10 of the 40 combinations are non-viable. Every scenario at or below 1.5% growth
fails at every interest rate: the increment never catches up with the
compounding capitalized interest.

---

## Amortization Profile

From `star_financing_model.ipynb` at defaults. Years 1-11 are the capitalization
period, where debt service equals whatever interest the available revenue can
pay and the rest is added to principal.

| Year | Available | Debt Service | Interest Capitalized | Ending Principal | Coverage |
|------|----------:|-------------:|---------------------:|-----------------:|---------:|
| 1 | $49.5M | $49.5M | $70.5M | $2.47B | 0.25x |
| 5 | $123.6M | $123.6M | $6.0M | $2.60B | 0.63x |
| 10 | $227.1M | $129.9M | — | $2.60B | 1.15x |
| 11 | $249.3M | $129.9M | — | $2.60B | 1.26x |
| 12 | $272.2M | $197.3M | — | $2.53B | 1.38x |
| 15 | $344.1M | $197.3M | — | $2.31B | 1.74x |
| 20 | $476.4M | $197.3M | — | $1.85B | 2.41x |
| 25 | $626.1M | $197.3M | — | $1.28B | 3.17x |
| 30 | $795.4M | $197.3M | — | $0.54B | 4.03x |

Principal is not fully retired at Year 30 under the notebook variant; $0.54B
remains outstanding. The accelerated-paydown model in
`star_financing_accelerated.ipynb` exists to explore closing that gap by routing
revenue above required debt service into early principal reduction.

Note that `data/star_financing_results.xlsx` does not correspond to this table.
It was exported from a run with `INCLUDE_LOCAL_ADD_INS = True`, which pledges the
Olathe and Wyandotte UG local increments on top of the state streams and shortens
capitalization to 4 years. Re-run the notebook to regenerate it at current
defaults.

---

## Adjustable Parameters

In the notebooks, the parameter cells at the top:

| Parameter | Variable | Default |
|-----------|----------|---------|
| Issued principal | `PRINCIPAL` | $2,400,000,000 |
| Bond Interest Rate | `INTEREST_RATE` | 0.05 |
| Bond Term | `TERM_YEARS` | 30 |
| Coverage Ratio | `COVERAGE_RATIO` | 1.30 |
| Maximum capitalization | `MAX_CAP_YEARS` | 20 |
| Excess applied to principal | `EXCESS_PAYDOWN_PCT` | 1.00 (accelerated notebook only) |

In the API, the same values live in `api/src/types/bond.types.ts` as
`DEFAULT_BOND_PARAMS` and are served by `GET /api/defaults`. They can be
overridden per request in the body of `POST /api/simulate`.

---

## Key Assumptions & Caveats

1. **Tax-Exempt Rate**: Assumes bonds are tax-exempt municipals. Taxable bonds
   would carry higher rates (add ~1-1.5%).

2. **Level Amortization**: Assumes equal annual payments after the
   capitalization period. Alternative structures (ascending payments, bullet
   maturities) would change the profile.

3. **No Refinancing**: Model assumes bonds are held to maturity. Refinancing at
   lower rates would reduce debt service.

4. **Coverage Ratio**: 1.30x is typical for investment-grade revenue bonds.
   Lower-rated bonds may require 1.40x+.

5. **Principal is an input, not a derivation**: $2.4B is assumed, not computed
   from the $1.8B construction figure. Issuance costs, reserve funding, and the
   split between the two are not modeled separately.

6. **Capitalizing interest compounds**: The unpaid interest added to principal
   earns interest in every subsequent year. This is the single largest driver of
   total interest cost — over $3.1B on $2.4B of principal in the notebook
   variant.
