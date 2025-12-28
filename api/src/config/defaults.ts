import {
  DEFAULT_BOND_PARAMS,
  DEFAULT_REVENUE_STREAMS,
  DEFAULT_LOCAL_ADD_INS,
  RevenueStreamType,
} from '../types/index.js';

/**
 * Default interest rates for sensitivity analysis
 * Matches Python: [0.04, 0.045, 0.05, 0.055, 0.06]
 */
export const DEFAULT_INTEREST_RATES = [0.04, 0.045, 0.05, 0.055, 0.06];

/**
 * Default growth rates for sensitivity analysis
 * Matches Python: [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.05]
 */
export const DEFAULT_GROWTH_RATES = [0.01, 0.015, 0.02, 0.025, 0.03, 0.035, 0.04, 0.05];

/**
 * Default paydown percentages for comparison
 * Matches Python: [0.0, 0.25, 0.50, 0.75, 1.0]
 */
export const DEFAULT_PAYDOWN_PERCENTAGES = [0.0, 0.25, 0.5, 0.75, 1.0];

/**
 * Re-export defaults for convenience
 */
export {
  DEFAULT_BOND_PARAMS,
  DEFAULT_REVENUE_STREAMS,
  DEFAULT_LOCAL_ADD_INS,
  RevenueStreamType,
};

/**
 * API version
 */
export const API_VERSION = '1.0.0';

/**
 * Simulation constants
 */
export const SIMULATION_DEFAULTS = {
  maxIterations: 50,
  tolerance: 1000,
  excessPaydownPct: 0.0,
};
