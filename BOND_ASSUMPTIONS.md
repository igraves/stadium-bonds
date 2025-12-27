# STAR Bond Structure — Assumptions

This document details the assumptions for modeling STAR Bond debt service requirements.

---

## Top-Line Financing Structure

Per the executed STAR Bond Agreement (Project Monitor 2.0, December 22, 2025):

| Parameter | Value | Notes |
|-----------|-------|-------|
| Total Stadium Budget | $3.0 billion | Stadium construction cost |
| Public Share (State) | 60% | STAR Bond financing |
| Private Share (Team) | 40% | Team/owner contribution |
| **Net Construction Funding** | **$1.8 billion** | 60% of $3.0B |

---

## Bond Terms

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| Bond Interest Rate | 5.0% | 4.0% - 6.5% | Tax-exempt municipal bond rate assumption |
| Bond Term | 30 years | — | Matches STAR statute maximum |
| Construction Period | 4 years | 3-5 years | Period before stadium generates increment |

---

## Immediate Debt Service Model

**Structure**: Bonds are issued at project start, and debt service (principal + interest) begins immediately. During the construction period, debt service is funded from bond proceeds. After construction, debt service is funded from increment revenues.

This means gross bond proceeds must exceed net construction funding to cover debt service during construction.

### Gross vs Net Proceeds

**Net Construction Funding**: The actual dollars needed for stadium construction = $1.8 billion

**Gross Bond Proceeds**: The total bonds issued, which must fund both:
1. Net construction costs ($1.8B)
2. Debt service payments during construction (Years 1-4)

**Calculation**:
```
Let:
  N = Net construction funding needed ($1.8B)
  r = Annual interest rate (5%)
  n = Total bond term (30 years)
  c = Construction years (4 years)

Annual debt service (level payment):
  PMT = Gross × [r(1+r)^n] / [(1+r)^n - 1]
      = Gross × pmt_factor

Where pmt_factor at defaults:
  pmt_factor = [0.05 × 1.05^30] / [1.05^30 - 1]
             = 0.0651

During construction, PMT × c is paid from bond proceeds:
  Gross = N + (Gross × pmt_factor × c)

Solving for Gross:
  Gross = N / (1 - pmt_factor × c)
        = $1.8B / (1 - 0.0651 × 4)
        = $1.8B / 0.7396
        = $2.433 billion
```

---

## Bond Model Results

| Component | Calculation | Amount |
|-----------|-------------|--------|
| Net Construction Funding | 60% of $3.0B | $1.80 billion |
| Gross Bond Proceeds | $1.8B / (1 - 4 × 0.0651) | $2.43 billion |
| Annual Debt Service | $2.43B × 0.0651 | **$158 million/year** |
| Capitalized Debt Service | $158M × 4 years | $634 million |
| Total Interest (30 years) | $158M × 30 - $2.43B | $2.32 billion |

### Funding Sources by Period

| Period | Years | Debt Service Source |
|--------|-------|---------------------|
| Construction | 1-4 | Bond Proceeds |
| Operational | 5-30 | Increment Revenue |

---

## Coverage Ratio Requirement

**Definition**: Bond covenants require pledged revenues to exceed debt service by a safety margin (coverage ratio). This protects bondholders against revenue shortfalls.

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| Coverage Ratio | 1.30x | 1.25x - 1.50x | Industry standard for revenue bonds |

**Required Annual Revenue**:
```
Required Revenue = Annual Debt Service × Coverage Ratio

Example:
  $158M × 1.30 = $206 million/year required
```

---

## Sensitivity Analysis

### Interest Rate Impact

| Rate | pmt_factor | Gross Proceeds | Annual Service | Required @ 1.3x |
|------|------------|----------------|----------------|-----------------|
| 4.0% | 0.0578 | $2.33B | $135M | $175M |
| 4.5% | 0.0614 | $2.38B | $146M | $190M |
| **5.0%** | **0.0651** | **$2.43B** | **$158M** | **$206M** |
| 5.5% | 0.0688 | $2.49B | $171M | $223M |
| 6.0% | 0.0726 | $2.55B | $185M | $241M |

### Coverage Ratio Impact (at 5% rate)

| Coverage | Required Annual Revenue |
|----------|------------------------|
| 1.25x | $198M |
| **1.30x** | **$206M** |
| 1.35x | $214M |
| 1.40x | $221M |
| 1.50x | $237M |

---

## Mapping to Increment Revenue

From the increment model (at 2.5% CPI), annual increment in key years:

| Year | Sales+Use Increment | Total Increment | Meets 1.3x Coverage? |
|------|--------------------:|----------------:|:--------------------:|
| 5 (first operational) | $88M | $92M | No |
| 10 | $195M | $204M | No |
| 12 | $224M | $235M | Yes |
| 15 | $317M | $331M | Yes |
| 20 | $456M | $476M | Yes |
| 25 | $614M | $641M | Yes |
| 30 | $795M | $829M | Yes |

**Key Finding**: Coverage ratio is met starting Year 12. Years 5-11 show a cumulative gap of approximately $400-500M that must be bridged via:
- Bond reserve funds (debt service reserve typically 1 year of payments)
- State appropriation support
- Alcohol/gaming revenue streams (LET, APSK, Liquor Drink Tax)

---

## Construction Period Funding

During Years 1-4, debt service is met automatically from bond proceeds:

| Year | Debt Service | Source | Increment Available |
|------|-------------|--------|---------------------|
| 1 | $158M | Bond Proceeds | $0 (under construction) |
| 2 | $158M | Bond Proceeds | $0 (under construction) |
| 3 | $158M | Bond Proceeds | $0 (under construction) |
| 4 | $158M | Bond Proceeds | $0 (under construction) |
| **5** | **$158M** | **Increment** | **$92M** (gap: $114M) |

This structure eliminates the funding gap during construction but creates a transition gap when the stadium opens and increment must cover debt service.

---

## Key Assumptions & Caveats

1. **Tax-Exempt Rate**: Assumes bonds are tax-exempt municipals. Taxable bonds would carry higher rates (add ~1-1.5%).

2. **Level Amortization**: Assumes equal annual payments. Alternative structures (ascending payments, bullet maturities) would change profile.

3. **No Refinancing**: Model assumes bonds are held to maturity. Refinancing at lower rates would reduce debt service.

4. **Construction Period**: 4 years is estimate. Delays would require additional capitalized debt service.

5. **Coverage Ratio**: 1.30x is typical for investment-grade revenue bonds. Lower-rated bonds may require 1.40x+.

6. **Revenue Timing**: Increment revenues ramp up over time. Coverage met at Year 12 under this model.

7. **Immediate Debt Service**: This model assumes bonds are fully amortizing from Year 1, with construction-period payments funded from gross proceeds.

---

## Adjustable Parameters

The notebook model allows adjustment of:

| Parameter | Variable Name | Default |
|-----------|---------------|---------|
| Net Construction Funding | `NET_CONSTRUCTION_FUNDING` | $1.8 billion |
| Bond Interest Rate | `BOND_RATE` | 5.0% |
| Construction Period | `CONSTRUCTION_YEARS` | 4 years |
| Bond Term | `BOND_TERM_YEARS` | 30 years |
| Coverage Ratio | `COVERAGE_RATIO` | 1.30x |

---

## Comparison: Old vs New Model

| Metric | Old (Deferred) Model | New (Immediate) Model |
|--------|---------------------|----------------------|
| Bond Principal | $2.40B | $2.43B (gross) |
| Construction Debt Service | Accrues (capitalized) | Paid from proceeds |
| Post-Construction Principal | $2.88B | $2.43B |
| Repayment Term | 26 years | 30 years |
| Annual Debt Service | $208M | $158M |
| Required @ 1.3x | $270M | $206M |
| Coverage Met | Year 14 | Year 12 |

The immediate debt service model results in **lower annual payments** ($158M vs $208M) because:
1. Gross proceeds are smaller than deferred total debt
2. Full 30-year amortization vs 26-year
3. No interest-on-interest compounding during construction
