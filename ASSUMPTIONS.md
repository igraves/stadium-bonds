# STAR Bond Increment Model — Assumptions

This document details the assumptions underlying the 30-year STAR Bond increment projections.

---

## Base Year Revenue Amounts

### Sales + Use Tax (State Portion)

| Component | Base Amount | Source / Derivation |
|-----------|-------------|---------------------|
| State Sales Tax | $495,000,000 | STAR district state sales tax base, adjusted for grocery tax elimination (effective 2025) |
| State Use Tax | $173,000,000 | Derived from 34.9% use/sales ratio (KDOR CY2025 Local Use Tax Distributions) |
| **Combined** | **$668,000,000** | Sum of sales + use tax bases |

**Key Notes:**
- Sales tax base reflects post-grocery-exemption reality (state rate on food = 0% as of 2025)
- Use tax assumed to be largely non-grocery (conservative assumption)
- Use/sales ratio (34.9%) derived from: $132.9M local use / $380.4M local sales in STAR area

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
| STAR Bond Pledge (65%) | $5,655,000 | Per STAR Bond Agreement, 65% of APSK pledged to bond debt service |

**Key Notes:**
- APSK = Attracting Professional Sports to Kansas Fund
- Sports wagering began September 2022; market stabilizing at $112-120M gross revenue
- State receives 10% privilege fee; 80% of state share goes to APSK
- Remaining 35% of APSK: 10% to RMMO Fund, 25% to other state purposes

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

```
Annual Increment (Year N) = Current Revenue (Year N) - Base Revenue (Year 0)

Where:
  Current Revenue (Year N) = Base Revenue * (1 + CPI)^N

Cumulative Increment = Sum of Annual Increments from Year 1 to Year N
```

**Year 0** is the base year — no increment is captured (establishes baseline).

**Years 1-30** capture the growth above baseline, which funds bond debt service.

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

At default assumptions (2.5% CPI), the 30-year model produces:

| Source | Cumulative Increment | Share |
|--------|---------------------|-------|
| Sales + Use Tax | ~$10.0 billion | ~96% |
| Alcohol | ~$290 million | ~3% |
| Gambling | ~$110 million | ~1% |
| **Total** | **~$10.4 billion** | 100% |

This confirms that **sales + use tax increment is the dominant funding mechanism** (>95%), with alcohol and gambling providing minor coverage support.
