# STAR Bond Increment Model — Assumptions

This document details the assumptions underlying the 30-year STAR Bond increment projections.

---

## Base Year Revenue Amounts

### Sales + Use Tax (State Portion)

| Component | Base Amount | Source / Derivation |
|-----------|-------------|---------------------|
| State Sales Tax | $495,200,000 | STAR district state sales tax base, adjusted for grocery tax elimination (effective 2025) |
| State Use Tax | $173,000,000 **or** $216,000,000 | Two derivations, both in use — see below |
| **Combined** | **$668,000,000** or **$711,200,000** | Sum of sales + use tax bases |

**Key Notes:**
- Sales tax base reflects post-grocery-exemption reality (state rate on food = 0% as of 2025)
- Use tax assumed to be largely non-grocery (conservative assumption)

#### Two use tax estimates

The use tax base was estimated two different ways during development, and both
are live in the codebase. Neither has been retired in favour of the other, so
both are documented here rather than one being presented as correct.

| Estimate | Derivation | Implied use/sales ratio | Where it is used |
|----------|-----------|------------------------:|------------------|
| **$173M** | 34.9% ratio applied to the $495.2M sales base. The ratio comes from KDOR CY2025 Local Use Tax Distributions: $132.9M local use / $380.4M local sales in the STAR area. | 34.9% | `star_financing_model.ipynb`, `star_financing_accelerated.ipynb` (as a single combined `SALES_USE_TAX_BASE = 668_000_000`) |
| **$216M** | Estimated directly rather than from the local ratio, and carried with no grocery adjustment. | 43.6% | `api/src/types/revenue.types.ts`, and therefore the live tool |

The difference is $43M/year on the base, which compounds. At default parameters
it moves the year in which coverage is first met, though less than the
difference in capitalization rules between the two implementations does — see
[`BOND_ASSUMPTIONS.md`](BOND_ASSUMPTIONS.md).

If you are citing a single figure, say which base it came from.

---

### Alcohol Taxes (District Portion)

| Component | Base Amount | Source / Derivation |
|-----------|-------------|---------------------|
| Liquor Enforcement Tax (LET) | $17,400,000 | 8% tax on retail liquor sales (K.S.A. 79-4101); district baseline from FY25 data |
| Liquor Drink Tax (State 10%) | $8,200,000 | State portion of 10% drink tax; district baseline estimate |
| **Combined** | **$25,600,000** | Sum of LET + Drink Tax |

**Key Notes:**
- LET actuals: Johnson County $20.45M, Wyandotte County $4.83M (FY2025)
- District baseline estimated from geographic overlap with STAR footprint
- Drink tax is 10% total; state receives portion, remainder to localities

---

### Sports Wagering / APSK Fund

| Component | Base Amount | Source / Derivation |
|-----------|-------------|---------------------|
| Total APSK Fund | $8,700,000 | FY25 APSK Fund intake (~$8.36M actual, ~$9.0M FY26 projected) |
| STAR Bond Pledge (75%) | $6,525,000 | 75% of APSK pledged to bond debt service |

**Key Notes:**
- APSK = Attracting Professional Sports to Kansas Fund
- Sports wagering began September 2022; market stabilizing at $112-120M gross revenue
- State receives 10% privilege fee; 80% of state share goes to APSK
- The financing models pledge **75%** (`APSK_PLEDGE_PCT = 0.75` in
  `star_financing_model.ipynb` and `star_financing_accelerated.ipynb`,
  `pledgePct: 0.75` in the API), giving $6,525,000.
- `tax_bond_analysis.ipynb` still uses **65%** ($5,655,000) in its increment
  schedule section. It is exploratory and does not feed the bond model, but the
  two figures will not agree if you compare them directly.
- The statutory Sports Fund split under K.S.A. 74-8733 sends 65% to STAR debt
  service. The financing models use 75%; this document follows the models.

---

## Growth Rate Assumptions (CPI)

| Revenue Source | Default Rate | Rationale |
|----------------|--------------|-----------|
| Sales + Use Tax | 2.5% | Conservative CPI assumption; historical Kansas average ~2.5-3% |
| Alcohol Taxes | 2.0% | Slower growth; mature market with limited volume expansion |
| Gambling/APSK | 3.0% | Slightly higher; sports wagering market still maturing |

**Scenario Range:**
- Conservative: 2.0% (all sources)
- Moderate: 2.5% (default)
- Baseline: 3.0%
- Optimistic: 3.5%

**Key Notes:**
- Growth rates apply uniformly across each category
- Increment = (Current Year) - (Base Year); only growth above base is captured
- Compounding is annual: `Year_N = Base * (1 + CPI)^N`

---

## Bond Structure Assumptions

| Parameter | Value | Source |
|-----------|-------|--------|
| Bond Term | 30 years | STAR Bond Agreement (Project Monitor 2.0) |
| Total Stadium Budget | $3.0 billion | Agreement execution version |
| Public Funding (STAR Bonds) | $1.8 billion (60%) | Agreement execution version |
| Private Investment | $1.2 billion (40%) | Agreement execution version |
| RMMO Base Threshold | $17 million/year | Team maintenance obligation; escalates at greater of 2% or CPI |

---

## Increment Calculation Method

Not every pledged stream is treated as an increment. The model distinguishes two
kinds, via `is_increment` on the `RevenueStream` dataclass (`isIncrement` in the
API):

**Increment streams — sales and use tax, and the optional local add-ins.** The
base year is frozen and continues flowing to the general fund; only growth above
it is captured:

```
Revenue (Year N) = Base * (1 + growth)^N - Base
```

**Full-pledge streams — LET, liquor drink tax, and APSK.** The entire stream is
pledged each year, not just its growth, scaled by the pledge percentage:

```
Revenue (Year N) = Base * pledge_pct * (1 + growth)^N
```

This is why the alcohol and gaming streams contribute meaningfully in the early
years while the sales and use increment is still near zero — they are the only
revenue available in Year 1 that is not a small fraction of a large base.

**Year 0** is the base year for increment streams — no increment is captured
(establishes baseline). **Years 1-30** capture the growth above baseline.

---

## Data Sources

All paths are relative to the repository root.

| Document | Description |
|----------|-------------|
| `data/Project-Monitor-2.0-STAR-Bond-Agreement-Execution-Version.pdf` | Official STAR Bond Agreement (Dec 22, 2025) |
| `data/liqenffy25.pdf` | Kansas Liquor Enforcement Tax FY25 by county |
| `data/450-Kansas-Lottery-FY-2026.pdf` | Kansas Lottery FY25-26 Budget Report |
| `data/pub17000126.xlsx` | KDOR Pub 1700 - Sales Tax Rates (Jan 2026) |
| `data/CY25LocUseTaxDist.xlsx` | KDOR CY2025 Local Use Tax Distributions |
| `data/annual_sales_tax/loytd2025.xlsx` | Johnson County / Cities sales tax data |

Prior-year editions of the last two are in `data/use_tax/` (CY2014-CY2025) and
`data/annual_sales_tax/` (2014-2025); years through 2018 are PDFs, 2019 onward
are spreadsheets.

---

## Key Caveats

1. **Projections are estimates** — actual revenues depend on economic conditions, consumer behavior, and policy changes.

2. **Grocery exemption assumed permanent** — if grocery tax is reinstated, sales tax base would increase.

3. **Use tax ratio may vary** — 34.9% ratio is based on current local data; state-level ratio may differ.

4. **Sports wagering is volatile** — market is young (since 2022); growth rates are uncertain.

5. **No recession modeling** — projections assume steady CPI growth without economic downturns.

6. **District boundaries matter** — actual captured revenue depends on precise STAR district geography.

---

## Model Outputs

At default assumptions (2.5% growth, local add-ins off), 30-year cumulative
pledged revenue. Two columns because of the two use tax bases above.

| Source | $668M base | $711.2M base |
|--------|-----------:|-------------:|
| Sales + Use Tax increment | $10.02B (87.9%) | $10.67B (88.6%) |
| Alcohol (LET + drink tax, pledged in full) | $1.06B (9.3%) | $1.06B (8.8%) |
| Gaming (APSK, 75% pledged in full) | $0.32B (2.8%) | $0.32B (2.7%) |
| **Total pledged revenue** | **$11.40B** | **$12.05B** |

These totals match the runs they came from: `star_financing_model.ipynb` reports
`Total Available: $11,399,237,015`, and `POST /api/simulate` at defaults returns
`totalRevenue30yr: 12047248711`.

Sales + use tax is the dominant funding mechanism at roughly **88%** of pledged
revenue over 30 years, with alcohol and gaming together supplying about 12%.

That 12% is larger than a pure increment comparison would suggest, because those
streams are pledged in full rather than as increment (see above). On an
increment-only basis — comparing growth above base across all four streams —
sales and use tax is **96%**. Both framings appear in public discussion of this
deal and they answer different questions: 88% is the share of money actually
servicing the debt, 96% is the share of *growth* being diverted.

For what these revenues have to cover, see
[`BOND_ASSUMPTIONS.md`](BOND_ASSUMPTIONS.md).
