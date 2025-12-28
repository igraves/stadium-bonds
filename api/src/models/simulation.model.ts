import type {
  BondParams,
  RevenueStream,
  SimulationResult,
  AmortizationRow,
  SimulationSummary,
} from '../types/index.js';
import { calculateAllRevenues, getStreamColumnName } from './revenue.model.js';
import { calculateLevelPayment } from './debt-service.model.js';
import { SIMULATION_DEFAULTS } from '../config/defaults.js';

export interface SimulationOptions {
  excessPaydownPct?: number;
  maxIterations?: number;
  tolerance?: number;
}

/**
 * Simulate STAR financing with capitalized interest and optional accelerated paydown.
 *
 * Maps to Python: simulate_star_financing()
 *
 * During capitalization period (when available revenue < required coverage):
 *   - Available revenue pays partial interest
 *   - Shortfall is capitalized (added to principal)
 *
 * After capitalization:
 *   - Level debt service payments begin
 *   - Excess revenue can be applied to extra principal paydown
 *
 * @param bond - Bond parameters
 * @param streams - Array of revenue streams
 * @param options - Simulation options
 * @returns Simulation result with schedule and summary
 */
export function simulateStarFinancing(
  bond: BondParams,
  streams: RevenueStream[],
  options: SimulationOptions = {}
): SimulationResult {
  const {
    excessPaydownPct = SIMULATION_DEFAULTS.excessPaydownPct,
    maxIterations = SIMULATION_DEFAULTS.maxIterations,
    tolerance = SIMULATION_DEFAULTS.tolerance,
  } = options;

  // Calculate all revenue streams
  const revenueCalc = calculateAllRevenues(streams, bond.termYears);
  const available = revenueCalc.totalAvailable;

  // Phase 1: Iteratively solve for debt service (converges when cap period stabilizes)
  let debtService = calculateLevelPayment(
    bond.principal,
    bond.interestRate,
    bond.termYears
  );
  let prevFinalPrincipal = 0;
  let capYears = 0;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let principal = bond.principal;
    capYears = 0;

    for (let year = 0; year < bond.termYears; year++) {
      const interestDue = principal * bond.interestRate;
      const avail = available[year] ?? 0;
      const required = debtService * bond.coverageRatio;

      if (year < bond.maxCapYears && avail < required) {
        // Capitalize shortfall
        const paid = Math.min(avail, interestDue);
        const shortfall = interestDue - paid;
        principal += shortfall;
        capYears = year + 1;
      } else {
        break;
      }
    }

    if (Math.abs(principal - prevFinalPrincipal) < tolerance) {
      break;
    }

    prevFinalPrincipal = principal;
    const remaining = Math.max(1, bond.termYears - capYears);
    debtService = calculateLevelPayment(principal, bond.interestRate, remaining);
  }

  // Phase 2: Final simulation with converged parameters AND accelerated paydown
  const results: AmortizationRow[] = [];
  let principal = bond.principal;
  let capitalizedInterest = 0;
  let totalExtraPrincipal = 0;
  let payoffYear: number | null = null;

  // Get stream column names for breakdown
  const streamColumns = streams.map((s) => getStreamColumnName(s));

  for (let year = 0; year < bond.termYears; year++) {
    const avail = available[year] ?? 0;

    // Build revenue breakdown
    const revenueByStream: Record<string, number> = {};
    for (const col of streamColumns) {
      const values = revenueCalc.streamRevenues[col];
      revenueByStream[col] = values?.[year] ?? 0;
    }

    // Check if bonds already paid off
    if (principal <= 0) {
      results.push({
        year: year + 1,
        availableRevenue: avail,
        interestDue: 0,
        interestPaid: 0,
        interestCapitalized: 0,
        principalPaid: 0,
        extraPrincipal: 0,
        debtService: 0,
        endingPrincipal: 0,
        coverageRatio: Infinity,
        inCapPeriod: false,
        excessRevenue: avail,
        bondsRetired: true,
        revenueByStream,
      });
      continue;
    }

    const interestDue = principal * bond.interestRate;

    if (year < capYears) {
      // Capitalization period
      const interestPaid = Math.min(avail, interestDue);
      const interestCap = interestDue - interestPaid;
      principal += interestCap;
      capitalizedInterest += interestCap;

      results.push({
        year: year + 1,
        availableRevenue: avail,
        interestDue,
        interestPaid,
        interestCapitalized: interestCap,
        principalPaid: 0,
        extraPrincipal: 0,
        debtService: interestPaid,
        endingPrincipal: Math.max(0, principal),
        coverageRatio: debtService > 0 ? avail / debtService : Infinity,
        inCapPeriod: true,
        excessRevenue: 0,
        bondsRetired: false,
        revenueByStream,
      });
    } else {
      // Amortization period
      const interestPaid = principal * bond.interestRate;
      const scheduledPrincipal = Math.min(debtService - interestPaid, principal);

      // Calculate excess and apply accelerated paydown
      const excess = Math.max(0, avail - debtService);
      let extraPrincipal = Math.min(
        excess * excessPaydownPct,
        principal - scheduledPrincipal
      );
      extraPrincipal = Math.max(0, extraPrincipal);

      totalExtraPrincipal += extraPrincipal;
      principal -= scheduledPrincipal + extraPrincipal;

      // Check for early payoff
      if (principal <= 0 && payoffYear === null) {
        payoffYear = year + 1;
        principal = 0;
      }

      results.push({
        year: year + 1,
        availableRevenue: avail,
        interestDue: interestPaid,
        interestPaid,
        interestCapitalized: 0,
        principalPaid: scheduledPrincipal,
        extraPrincipal,
        debtService: interestPaid + scheduledPrincipal,
        endingPrincipal: Math.max(0, principal),
        coverageRatio: debtService > 0 ? avail / debtService : Infinity,
        inCapPeriod: false,
        excessRevenue: excess,
        bondsRetired: principal <= 0,
        revenueByStream,
      });
    }
  }

  // Calculate summary statistics
  const totalInterestPaid = results.reduce((sum, r) => sum + r.interestPaid, 0);
  const totalInterest = capitalizedInterest + totalInterestPaid;
  const totalRevenue = results.reduce((sum, r) => sum + r.availableRevenue, 0);

  // Calculate interest savings vs no acceleration
  let interestSavings = 0;
  let yearsSaved = 0;

  if (excessPaydownPct > 0) {
    const baseline = simulateStarFinancing(bond, streams, { excessPaydownPct: 0 });
    interestSavings = baseline.summary.totalInterest - totalInterest;
    yearsSaved =
      (baseline.summary.payoffYear ?? baseline.summary.termYears) -
      (payoffYear ?? bond.termYears);
  }

  const summary: SimulationSummary = {
    initialPrincipal: bond.principal,
    interestRate: bond.interestRate,
    termYears: bond.termYears,
    coverageRatio: bond.coverageRatio,
    excessPaydownPct,
    capitalizationYears: capYears,
    amortizationYears: bond.termYears - capYears,
    principalAfterCap: bond.principal + capitalizedInterest,
    annualDebtService: debtService,
    totalInterestCapitalized: capitalizedInterest,
    totalInterestPaid,
    totalInterest,
    interestPctOfPrincipal: (totalInterest / bond.principal) * 100,
    totalRevenue30yr: totalRevenue,
    totalExtraPrincipal,
    payoffYear,
    interestSavings,
    yearsSaved,
    viable: capYears < bond.maxCapYears,
  };

  return {
    schedule: results,
    summary,
    parameters: {
      bond,
      streams,
      excessPaydownPct,
    },
  };
}
