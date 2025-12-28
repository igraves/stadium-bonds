import type { BondParams } from './bond.types';
import type { RevenueStream, RevenueStreamType, LocalAddInsConfig } from './revenue.types';
import type { SimulationResult } from './simulation.types';

/**
 * Request body for simulation endpoint
 */
export interface SimulateRequest {
  bond?: Partial<BondParams>;
  streams?: RevenueStream[];
  streamOverrides?: Partial<Record<RevenueStreamType, Partial<RevenueStream>>>;
  localAddIns?: LocalAddInsConfig;
  excessPaydownPct?: number;
}

/**
 * Response from simulation endpoint
 */
export interface SimulateResponse {
  success: boolean;
  data?: SimulationResult;
  error?: string;
}

/**
 * Sensitivity analysis request
 */
export interface SensitivityRequest {
  bond?: Partial<BondParams>;
  streams?: RevenueStream[];
  localAddIns?: LocalAddInsConfig;
  interestRates?: number[];
  growthRates?: number[];
  excessPaydownPct?: number;
}

/**
 * Single cell in sensitivity grid
 */
export interface SensitivityCell {
  interestRate: number;
  growthRate: number;
  capYears: number | null;
  debtServiceM: number | null;
  totalInterestB: number | null;
  payoffYear: number | null;
  extraPrincipalM: number | null;
  viable: boolean;
}

/**
 * Paydown comparison row
 */
export interface PaydownComparisonRow {
  paydownPct: number;
  totalInterestB: number;
  extraPrincipalM: number;
  payoffYear: number;
  interestSavingsM: number;
  viable: boolean;
}

/**
 * Paydown comparison request
 */
export interface PaydownComparisonRequest {
  bond?: Partial<BondParams>;
  streams?: RevenueStream[];
  localAddIns?: LocalAddInsConfig;
  paydownPercentages?: number[];
}

/**
 * Sensitivity analysis response
 */
export interface SensitivityResponse {
  success: boolean;
  data?: {
    grid: SensitivityCell[];
    interestRates: number[];
    growthRates: number[];
  };
  error?: string;
}

/**
 * Paydown comparison response
 */
export interface PaydownComparisonResponse {
  success: boolean;
  data?: {
    comparison: PaydownComparisonRow[];
  };
  error?: string;
}

/**
 * Defaults response
 */
export interface DefaultsResponse {
  bond: BondParams;
  streams: Record<RevenueStreamType, RevenueStream>;
  localAddIns: LocalAddInsConfig;
  defaultInterestRates: number[];
  defaultGrowthRates: number[];
  defaultPaydownPercentages: number[];
}
