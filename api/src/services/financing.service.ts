import type {
  BondParams,
  RevenueStream,
  SimulateRequest,
  SensitivityRequest,
  PaydownComparisonRequest,
  SimulationResult,
  SensitivityCell,
  PaydownComparisonRow,
  DefaultsResponse,
  LocalAddInsConfig,
} from '../types/index.js';
import {
  DEFAULT_BOND_PARAMS,
  DEFAULT_REVENUE_STREAMS,
  DEFAULT_LOCAL_ADD_INS,
  DEFAULT_INTEREST_RATES,
  DEFAULT_GROWTH_RATES,
  DEFAULT_PAYDOWN_PERCENTAGES,
  RevenueStreamType,
} from '../config/defaults.js';
import { simulateStarFinancing } from '../models/simulation.model.js';
import {
  runSensitivityAnalysis,
  runPaydownComparison,
} from '../models/sensitivity.model.js';
import {
  validateBondParams,
  validatePaydownPct,
  validateSensitivityParams,
} from './validation.service.js';

/**
 * Financing service - orchestrates simulations and analysis
 */
export class FinancingService {
  /**
   * Build the complete list of revenue streams based on configuration
   */
  private buildStreams(
    customStreams?: RevenueStream[],
    streamOverrides?: Partial<Record<RevenueStreamType, Partial<RevenueStream>>>,
    localAddIns?: LocalAddInsConfig
  ): RevenueStream[] {
    // If custom streams are provided, use them directly
    if (customStreams && customStreams.length > 0) {
      return customStreams;
    }

    // Build from defaults with optional overrides
    const streams: RevenueStream[] = [];
    const addInsConfig = localAddIns ?? DEFAULT_LOCAL_ADD_INS;

    // Core streams (always included)
    const coreTypes: RevenueStreamType[] = [
      RevenueStreamType.STATE_SALES_TAX,
      RevenueStreamType.USE_TAX,
      RevenueStreamType.LET,
      RevenueStreamType.LIQUOR_EXCISE,
      RevenueStreamType.APSK,
    ];

    for (const type of coreTypes) {
      const defaultStream = DEFAULT_REVENUE_STREAMS[type];
      const override = streamOverrides?.[type];
      streams.push({
        ...defaultStream,
        ...override,
      });
    }

    // Local add-ins (conditionally included)
    if (addInsConfig.includeOlathe) {
      const defaultStream = DEFAULT_REVENUE_STREAMS[RevenueStreamType.OLATHE_LOCAL];
      const override = streamOverrides?.[RevenueStreamType.OLATHE_LOCAL];
      streams.push({
        ...defaultStream,
        ...override,
      });
    }

    if (addInsConfig.includeWyandotteUG) {
      const defaultStream =
        DEFAULT_REVENUE_STREAMS[RevenueStreamType.WYANDOTTE_UG_LOCAL];
      const override = streamOverrides?.[RevenueStreamType.WYANDOTTE_UG_LOCAL];
      streams.push({
        ...defaultStream,
        ...override,
      });
    }

    return streams;
  }

  /**
   * Build bond parameters with defaults
   * Automatically adjusts maxCapYears if it would exceed termYears
   */
  private buildBondParams(partial?: Partial<BondParams>): BondParams {
    const merged = {
      ...DEFAULT_BOND_PARAMS,
      ...partial,
    };

    // Ensure maxCapYears is less than termYears
    if (merged.maxCapYears >= merged.termYears) {
      merged.maxCapYears = Math.max(1, merged.termYears - 1);
    }

    return merged;
  }

  /**
   * Run a single simulation
   */
  simulate(request: SimulateRequest): SimulationResult {
    const bond = this.buildBondParams(request.bond);
    const streams = this.buildStreams(
      request.streams,
      request.streamOverrides,
      request.localAddIns
    );
    const excessPaydownPct = request.excessPaydownPct ?? 0;

    // Validate inputs
    const bondValidation = validateBondParams(bond);
    if (!bondValidation.valid) {
      throw new Error(
        `Invalid bond parameters: ${bondValidation.errors.map((e) => e.message).join(', ')}`
      );
    }

    const paydownValidation = validatePaydownPct(excessPaydownPct);
    if (!paydownValidation.valid) {
      throw new Error(
        `Invalid paydown percentage: ${paydownValidation.errors.map((e) => e.message).join(', ')}`
      );
    }

    return simulateStarFinancing(bond, streams, { excessPaydownPct });
  }

  /**
   * Run sensitivity analysis
   */
  runSensitivity(request: SensitivityRequest): {
    grid: SensitivityCell[];
    interestRates: number[];
    growthRates: number[];
  } {
    const bond = this.buildBondParams(request.bond);
    const streams = this.buildStreams(
      request.streams,
      undefined,
      request.localAddIns
    );
    const interestRates = request.interestRates ?? DEFAULT_INTEREST_RATES;
    const growthRates = request.growthRates ?? DEFAULT_GROWTH_RATES;
    const excessPaydownPct = request.excessPaydownPct ?? 0;

    // Validate inputs
    const bondValidation = validateBondParams(bond);
    if (!bondValidation.valid) {
      throw new Error(
        `Invalid bond parameters: ${bondValidation.errors.map((e) => e.message).join(', ')}`
      );
    }

    const sensitivityValidation = validateSensitivityParams(
      interestRates,
      growthRates
    );
    if (!sensitivityValidation.valid) {
      throw new Error(
        `Invalid sensitivity parameters: ${sensitivityValidation.errors.map((e) => e.message).join(', ')}`
      );
    }

    const grid = runSensitivityAnalysis(
      streams,
      bond,
      interestRates,
      growthRates,
      excessPaydownPct
    );

    return { grid, interestRates, growthRates };
  }

  /**
   * Compare different paydown percentages
   */
  comparePaydown(request: PaydownComparisonRequest): {
    comparison: PaydownComparisonRow[];
  } {
    const bond = this.buildBondParams(request.bond);
    const streams = this.buildStreams(
      request.streams,
      undefined,
      request.localAddIns
    );
    const paydownPercentages =
      request.paydownPercentages ?? DEFAULT_PAYDOWN_PERCENTAGES;

    // Validate inputs
    const bondValidation = validateBondParams(bond);
    if (!bondValidation.valid) {
      throw new Error(
        `Invalid bond parameters: ${bondValidation.errors.map((e) => e.message).join(', ')}`
      );
    }

    for (const pct of paydownPercentages) {
      const validation = validatePaydownPct(pct);
      if (!validation.valid) {
        throw new Error(
          `Invalid paydown percentage ${pct}: ${validation.errors.map((e) => e.message).join(', ')}`
        );
      }
    }

    const comparison = runPaydownComparison(streams, bond, paydownPercentages);
    return { comparison };
  }

  /**
   * Get all default values
   */
  getDefaults(): DefaultsResponse {
    return {
      bond: DEFAULT_BOND_PARAMS,
      streams: DEFAULT_REVENUE_STREAMS,
      localAddIns: DEFAULT_LOCAL_ADD_INS,
      defaultInterestRates: DEFAULT_INTEREST_RATES,
      defaultGrowthRates: DEFAULT_GROWTH_RATES,
      defaultPaydownPercentages: DEFAULT_PAYDOWN_PERCENTAGES,
    };
  }
}

// Singleton instance
export const financingService = new FinancingService();
