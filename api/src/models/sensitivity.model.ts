import type {
  BondParams,
  RevenueStream,
  SensitivityCell,
  PaydownComparisonRow,
} from '../types/index.js';
import { simulateStarFinancing } from './simulation.model.js';

/**
 * Run sensitivity analysis varying interest rate and growth rate.
 *
 * Maps to Python: run_sensitivity_analysis()
 *
 * @param baseStreams - Base revenue streams
 * @param bond - Bond parameters
 * @param interestRates - Array of interest rates to test
 * @param growthRates - Array of growth rates to test (applied to increment streams)
 * @param excessPaydownPct - Accelerated paydown percentage
 * @returns Array of sensitivity analysis cells
 */
export function runSensitivityAnalysis(
  baseStreams: RevenueStream[],
  bond: BondParams,
  interestRates: number[],
  growthRates: number[],
  excessPaydownPct: number = 0.0
): SensitivityCell[] {
  const results: SensitivityCell[] = [];

  for (const rate of interestRates) {
    for (const growth of growthRates) {
      // Modify streams with new growth rate
      const modStreams = baseStreams.map((s) => {
        if (s.isIncrement) {
          return { ...s, growthRate: growth };
        } else {
          // Scale other growth rates proportionally (matches Python logic)
          return { ...s, growthRate: Math.max(0.01, growth - 0.005) };
        }
      });

      // Modify bond with new interest rate
      const modBond: BondParams = { ...bond, interestRate: rate };

      try {
        const result = simulateStarFinancing(modBond, modStreams, {
          excessPaydownPct,
        });
        const { summary } = result;

        results.push({
          interestRate: rate,
          growthRate: growth,
          capYears: summary.viable ? summary.capitalizationYears : null,
          debtServiceM: summary.viable
            ? summary.annualDebtService / 1e6
            : null,
          totalInterestB: summary.viable ? summary.totalInterest / 1e9 : null,
          payoffYear: summary.viable ? summary.payoffYear : null,
          extraPrincipalM: summary.viable
            ? summary.totalExtraPrincipal / 1e6
            : null,
          viable: summary.viable,
        });
      } catch {
        results.push({
          interestRate: rate,
          growthRate: growth,
          capYears: null,
          debtServiceM: null,
          totalInterestB: null,
          payoffYear: null,
          extraPrincipalM: null,
          viable: false,
        });
      }
    }
  }

  return results;
}

/**
 * Compare different accelerated paydown percentages.
 *
 * Maps to Python: run_paydown_comparison()
 *
 * @param baseStreams - Base revenue streams
 * @param bond - Bond parameters
 * @param paydownPercentages - Array of paydown percentages to compare
 * @returns Array of paydown comparison rows
 */
export function runPaydownComparison(
  baseStreams: RevenueStream[],
  bond: BondParams,
  paydownPercentages: number[] = [0.0, 0.25, 0.5, 0.75, 1.0]
): PaydownComparisonRow[] {
  const results: PaydownComparisonRow[] = [];

  for (const pct of paydownPercentages) {
    try {
      const result = simulateStarFinancing(bond, baseStreams, {
        excessPaydownPct: pct,
      });
      const { summary } = result;

      results.push({
        paydownPct: pct,
        totalInterestB: summary.totalInterest / 1e9,
        extraPrincipalM: summary.totalExtraPrincipal / 1e6,
        payoffYear: summary.payoffYear ?? summary.termYears,
        interestSavingsM: summary.interestSavings / 1e6,
        viable: summary.viable,
      });
    } catch {
      results.push({
        paydownPct: pct,
        totalInterestB: NaN,
        extraPrincipalM: NaN,
        payoffYear: NaN,
        interestSavingsM: NaN,
        viable: false,
      });
    }
  }

  return results;
}
