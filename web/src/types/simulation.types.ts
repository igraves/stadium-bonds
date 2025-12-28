import type { BondParams } from './bond.types';
import type { RevenueStream } from './revenue.types';

/**
 * Single year row in amortization schedule
 */
export interface AmortizationRow {
  year: number;
  availableRevenue: number;
  interestDue: number;
  interestPaid: number;
  interestCapitalized: number;
  principalPaid: number;
  extraPrincipal: number;
  debtService: number;
  endingPrincipal: number;
  coverageRatio: number;
  inCapPeriod: boolean;
  excessRevenue: number;
  bondsRetired: boolean;
  /** Revenue breakdown by stream name (lowercase, underscores) */
  revenueByStream: Record<string, number>;
}

/**
 * Summary statistics from simulation
 */
export interface SimulationSummary {
  initialPrincipal: number;
  interestRate: number;
  termYears: number;
  coverageRatio: number;
  excessPaydownPct: number;
  capitalizationYears: number;
  amortizationYears: number;
  principalAfterCap: number;
  annualDebtService: number;
  totalInterestCapitalized: number;
  totalInterestPaid: number;
  totalInterest: number;
  interestPctOfPrincipal: number;
  totalRevenue30yr: number;
  totalExtraPrincipal: number;
  payoffYear: number | null;
  interestSavings: number;
  yearsSaved: number;
  viable: boolean;
}

/**
 * Complete simulation result
 */
export interface SimulationResult {
  schedule: AmortizationRow[];
  summary: SimulationSummary;
  parameters: {
    bond: BondParams;
    streams: RevenueStream[];
    excessPaydownPct: number;
  };
}
