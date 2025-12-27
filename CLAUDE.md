# County Study - Project Context

This project analyzes tax collection data and bond financing structures for Johnson County, Wyandotte County, and Johnson County cities in Kansas.

---

## Data Sources

- **Kansas Department of Revenue**: City/County Annual Local Sales Tax Reports (2014-2025)
- **Kansas Department of Revenue**: City/County Use Tax Reports (2014-2025)
- **Kansas Department of Revenue**: Pub 1700 Sales Tax Rates by Jurisdiction (Jan 2026)
- **Kansas Department of Revenue**: CY25 Local Use Tax Distributions (CY25LocUseTaxDist.xlsx)
- **STAR Bond Agreement**: Project Monitor 2.0 (Chiefs Stadium) execution documents
- **Kansas Liquor Enforcement Tax**: FY25 county tables
- **Kansas Lottery/Gaming**: FY25-26 Budget Reports

**See also**:
- `ASSUMPTIONS.md` — Increment model assumptions (base values, CPI rates)
- `BOND_ASSUMPTIONS.md` — Bond structure assumptions (capitalized interest, debt service)

---

## Source Document Specifics

### STAR Bond Agreement (Project Monitor 2.0)

**Document**: Project-Monitor-2.0-STAR-Bond-Agreement-Execution-Version.pdf
**Execution Date**: December 22, 2025

| Parameter | Value |
|-----------|-------|
| Total Stadium Budget | **$3.0 billion** |
| Public Funding (STAR Bonds) | **$1.8 billion (60%)** |
| Private Investment | **$1.2 billion (40%)** |
| Bond Term | **30 years** |
| Stadium Capacity | **65,000+ seats (domed)** |
| RMMO Base Threshold | **$17 million/year** |
| RMMO Escalation | Greater of 2% or CPI annually |

**Sports Fund Allocation** (K.S.A. 74-8733):
- **65%** → STAR Bond debt service
- **10%** → RMMO Fund (Repairs, Maintenance, Management, Operations)
- **25%** → Other state purposes

**RMMO Fund**: Team responsible for costs up to $17M/year threshold (escalating). State covers overages from Sports Fund 10% allocation. Unspent RMMO balance reverts to state when bonds retired.

---

### Kansas Liquor Enforcement Tax - FY2025 Actuals

**Document**: liqenffy25.pdf
**Tax Rate**: 8% on retail liquor sales (K.S.A. 79-4101)

| Jurisdiction | FY2025 Collections | YoY Change |
|--------------|-------------------|------------|
| **Johnson County** | **$20,454,005.17** | 0% |
| **Wyandotte County** | **$4,829,887.63** | -1% |
| Douglas County | $3,618,612.92 | +7% |
| Sedgwick County | $9,428,000.46 | +1% |
| **State Total** | **~$82.7 million** | — |

Johnson County represents **24.7%** of statewide LET collections.

---

### Kansas Sports Wagering / APSK Fund - FY2025-26

**Document**: 450-Kansas-Lottery-FY-2026.pdf

| Metric | FY2025 | FY2026 (Projected) |
|--------|--------|-------------------|
| Sports Wagering Gross Revenue | $112 million | $120 million |
| State Share (10% privilege fee) | $11.2 million | $12.0 million |
| **APSK Fund (80% of state share)** | **$8.36 million** | **$9.0 million** |
| Problem Gambling (3% of state share) | $336,000 | $360,000 |

**APSK Allocation for STAR Bonds**: 65% of APSK Fund = **$5.4M - $5.9M/year**

**Context**: Kansas sports wagering began September 2022. Market stabilizing at ~$112-120M annual gross revenue. Four licensed operators (FanDuel, DraftKings, BetMGM, Caesars).

---

### Kansas Sales Tax Rates - January 2026

**Document**: pub17000126.xlsx (Kansas Dept of Revenue Pub 1700)
**Effective Date**: January 1, 2026

**State Base Rate**: 6.5% (non-food) / 0% (food as of 2025)

| Jurisdiction | Total Rate | State | County | City |
|--------------|-----------|-------|--------|------|
| **Johnson County (unincorp.)** | **7.975%** | 6.5% | 1.475% | 0% |
| **Wyandotte County (unincorp.)** | **7.50%** | 6.5% | 1.0% | 0% |
| Kansas City, KS | 9.125% | 6.5% | 1.0% | 1.625% |
| Overland Park | 9.35% | 6.5% | 1.475% | 1.375% |
| Olathe | 9.475% | 6.5% | 1.475% | 1.5% |
| Shawnee | 9.60% | 6.5% | 1.475% | 1.625% |
| Lenexa | 9.35% | 6.5% | 1.475% | 1.375% |
| Leawood | 9.10% | 6.5% | 1.475% | 1.125% |
| Prairie Village | 8.975% | 6.5% | 1.475% | 1.0% |
| Merriam | 9.475% | 6.5% | 1.475% | 1.5% |
| Mission | 9.725% | 6.5% | 1.475% | 1.75% |
| Gardner | 9.475% | 6.5% | 1.475% | 1.5% |
| Fairway | 9.975% | 6.5% | 1.475% | 2.0% |

**Special District Counts (Statewide)**:
- STAR Bond districts: 47
- Community Improvement Districts (CID): 247
- Transportation Development Districts (TDD): 36

**Rate Range**: 6.5% (state only, rural unincorporated) to 11.5% (with CID/TDD overlays)

**Kansas City Homefield STAR Bond Area** (Chiefs-relevant):
- Base rate: 9.125% (no special district overlay)
- With Homefield CID overlay: 11.125% (+2% CID)
- All located in Wyandotte County

**Overland Park STAR Bond Areas**:
- Bluhawk STAR Bond: 9.35% base
- Bluhawk with CID/TDD: 10.85% (+1.5%)
- Prairiefire STAR Bond with CID: 10.85% (+1.5%)

---

### Comparative Scale (Updated with Use Tax)

**Use Tax Inclusion**: STAR bond statute allows capture of both state sales AND use tax increment. Use tax runs at same rates as sales tax (6.5% state, local rates vary).

**Use/Sales Ratio**: ~34.9% (derived from KDOR CY2025 local use tax distributions)

| Base Component | Annual Amount |
|----------------|---------------|
| State Sales Tax Base (grocery-adjusted) | $495M/year |
| State Use Tax Base (34.9% ratio) | $173M/year |
| **Combined State Base** | **$668M/year** |

**30-Year Increment Projections**:

| Scenario | Year-30 Increment | 30-Year Cumulative |
|----------|-------------------|-------------------|
| Sales Only @ 2% CPI | $402M/year | $5.63 billion |
| Sales Only @ 3% CPI | $706M/year | $9.41 billion |
| **Sales + Use @ 2% CPI** | **$542M/year** | **$7.60 billion** |
| **Sales + Use @ 3% CPI** | **$953M/year** | **$12.69 billion** |

Including use tax adds **$2.0B - $3.3B** to 30-year projections.

**Other Revenue Streams** (coverage support only):

| Source | Annual Base | 30-Year Increment |
|--------|-------------|-------------------|
| LET (district portion) | ~$17.4M/year | $200-330M |
| Liquor Drink Tax (state) | ~$8.2M/year | $93-155M |
| APSK (65% pledged) | ~$5.7M/year | $65-108M |

Alcohol + gaming streams = **6-10%** of total STAR financing capacity.
Sales + use tax increment = **90-94%** of financing capacity.

---

## Key Analytical Conclusions: Chiefs STAR Bond Financing

### Executive Summary

The Kansas Chiefs STAR Bond financing is **fundamentally a sales tax diversion mechanism**, not an alcohol/gaming-funded project. Public framing suggesting it's "funded with gambling and booze" is not supported by the underlying financial math.

### Revenue Stream Hierarchy (Updated with Use Tax)

| Source | 30-Year Cumulative | Role |
|--------|-------------------|------|
| **Sales + Use Tax Increment** | $7.6B - $12.7B | Primary funding engine (90-94%) |
| Liquor Enforcement Tax (LET) | $200M - $330M | Coverage support |
| Liquor Drink Tax (10% state) | $93M - $155M | Coverage support |
| Sports Wagering (APSK) | $65M - $108M | Coverage support |

### Sales + Use Tax Increment Details

- Driven by STAR district's very large geographic footprint
- Normal CPI-driven revenue growth (2-3%) diverted for stadium debt service
- 30-year pledge captures organic economic growth that would otherwise flow to general funds
- **Use tax eligible under STAR statute** — adds ~35% to harvestable base
- Combined state base: $668M/year ($495M sales + $173M use)
- At 2% CPI: ~$7.6B cumulative increment (sales + use)
- At 3% CPI: ~$12.7B cumulative increment (sales + use)

### Alcohol Tax Components

**Liquor Enforcement Tax (LET):**
- District baseline: ~$17.4M/year
- 30-year increment: ~$200-330M (CPI dependent)

**Liquor Drink Tax (10% State Portion):**
- District state baseline: ~$8.2M/year
- 30-year increment: ~$93-155M

### Sports Wagering / APSK Fund

- State APSK intake: ~$8.7-9.0M/year
- 65% pledged to STAR bonds: ~$5.5-6.0M/year
- 30-year incremental contribution: ~$65-108M

### Structural Mechanics

The financing relies on:
1. **Capitalized interest** during construction
2. **Oversized STAR district footprint** capturing broad economic activity
3. **Coverage ratio requirements** (1.3x-1.5x) that necessitate multiple revenue streams
4. **30+ year pledge horizon** maximizing captured growth

### Policy Analysis

Alcohol and gaming revenues exist primarily to:
- Satisfy bond coverage ratios
- Stabilize early-year investor confidence
- Improve credit rating optics

They do **not** materially change the financing math. Together they contribute only **6-10%** of total STAR financing capacity.

The core mechanism is a **$7.6B - $12.7B diversion of state sales + use tax growth** from general public purposes to stadium debt service over 30 years.

**Metaphor**: Sales + use tax increment = entrée; Alcohol + gaming = garnish.

---

## Consolidated Data Structure

The project maintains a consolidated Excel file (`data/johnson_wyandotte_tax_consolidated.xlsx`) containing:

- **Entities**: Johnson County, Wyandotte County, and 18 Johnson County cities
- **Tax Types**: Local Sales Tax, Use Tax
- **Time Range**: 2019-2025 (Excel data); 2014-2018 (PDF data pending extraction)
- **Granularity**: Monthly collections by entity

### Johnson County Cities in Dataset

Overland Park, Olathe, Shawnee, Lenexa, Leawood, Prairie Village, Gardner, Merriam, Mission, Roeland Park, Fairway, Mission Hills, Westwood, Westwood Hills, Mission Woods, DeSoto, Edgerton, Spring Hill

Note: Lake Quivira excluded (no meaningful sales tax base - residential neighborhood)

---

## Analysis Notebook

`tax_bond_analysis.ipynb` contains:
- Data loading and entity categorization
- YoY growth analysis and CAGR calculations
- Time series visualizations
- Entity comparison charts
- Bond projection models using historical growth rates
