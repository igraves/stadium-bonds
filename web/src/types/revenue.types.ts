/**
 * Revenue stream configuration
 */
export interface RevenueStream {
  /** Display name for the stream */
  name: string;
  /** Base year revenue in dollars */
  base: number;
  /** Annual growth rate (e.g., 0.025 for 2.5%) */
  growthRate: number;
  /** True for STAR increment (only growth above base captured) */
  isIncrement: boolean;
  /** Percentage pledged to bonds (0.0 to 1.0) */
  pledgePct: number;
}

/**
 * Predefined revenue stream types
 */
export const RevenueStreamType = {
  STATE_SALES_TAX: 'state_sales_tax',
  USE_TAX: 'use_tax',
  LET: 'let',
  LIQUOR_EXCISE: 'liquor_excise',
  APSK: 'apsk',
  OLATHE_LOCAL: 'olathe_local',
  WYANDOTTE_UG_LOCAL: 'wyandotte_ug_local',
} as const;

export type RevenueStreamType = typeof RevenueStreamType[keyof typeof RevenueStreamType];

/**
 * Default raw base values BEFORE grocery exemption adjustment
 */
export const RAW_TAX_BASES = {
  stateSalesTax: 619_000_000,
  useTax: 216_000_000,
};

/**
 * Default grocery exemption percentages
 */
export const DEFAULT_GROCERY_EXEMPTIONS = {
  stateSalesTax: 0.20,  // 20% reduction for state sales tax
  useTax: 0.00,         // 0% reduction for use tax
};

/**
 * Default revenue streams
 * State Sales Tax: $619M * (1 - 0.20) = $495.2M
 * Use Tax: $216M * (1 - 0.00) = $216M
 */
export const DEFAULT_REVENUE_STREAMS: Record<RevenueStreamType, RevenueStream> = {
  [RevenueStreamType.STATE_SALES_TAX]: {
    name: 'State_Sales_Tax',
    base: 495_200_000, // $619M * (1 - 20%)
    growthRate: 0.025,
    isIncrement: true,
    pledgePct: 1.0,
  },
  [RevenueStreamType.USE_TAX]: {
    name: 'Use_Tax',
    base: 216_000_000, // $216M * (1 - 0%)
    growthRate: 0.025,
    isIncrement: true,
    pledgePct: 1.0,
  },
  [RevenueStreamType.LET]: {
    name: 'LET',
    base: 17_400_000,
    growthRate: 0.02,
    isIncrement: false,
    pledgePct: 1.0,
  },
  [RevenueStreamType.LIQUOR_EXCISE]: {
    name: 'Liquor_Excise',
    base: 8_200_000,
    growthRate: 0.02,
    isIncrement: false,
    pledgePct: 1.0,
  },
  [RevenueStreamType.APSK]: {
    name: 'APSK',
    base: 8_700_000,
    growthRate: 0.03,
    isIncrement: false,
    pledgePct: 0.75,
  },
  [RevenueStreamType.OLATHE_LOCAL]: {
    name: 'Olathe_Local',
    base: 65_889_479,
    growthRate: 0.035,
    isIncrement: true,
    pledgePct: 1.0,
  },
  [RevenueStreamType.WYANDOTTE_UG_LOCAL]: {
    name: 'Wyandotte_UG_Local',
    base: 107_068_477,
    growthRate: 0.035,
    isIncrement: true,
    pledgePct: 1.0,
  },
};

/**
 * Local add-in configuration
 */
export interface LocalAddInsConfig {
  includeOlathe: boolean;
  includeWyandotteUG: boolean;
}

/**
 * Default local add-ins configuration
 */
export const DEFAULT_LOCAL_ADD_INS: LocalAddInsConfig = {
  includeOlathe: false,
  includeWyandotteUG: false,
};

/**
 * Stream override for individual adjustments
 */
export interface StreamOverride {
  base?: number;
  growthRate?: number;
  groceryExemption?: number; // Percentage to reduce base (0.0 to 1.0)
}

/**
 * All stream overrides keyed by stream type
 */
export type StreamOverrides = Partial<Record<RevenueStreamType, StreamOverride>>;

/**
 * Grocery exemption configuration for tax streams
 */
export interface GroceryExemptions {
  stateSalesTax: number;  // 0.0 to 1.0
  useTax: number;         // 0.0 to 1.0
}

/**
 * Human-readable labels for stream types
 */
export const STREAM_LABELS: Record<RevenueStreamType, string> = {
  [RevenueStreamType.STATE_SALES_TAX]: 'State Sales Tax',
  [RevenueStreamType.USE_TAX]: 'Use Tax',
  [RevenueStreamType.LET]: 'Liquor Enforcement Tax',
  [RevenueStreamType.LIQUOR_EXCISE]: 'Liquor Excise Tax',
  [RevenueStreamType.APSK]: 'APSK (Sports Wagering)',
  [RevenueStreamType.OLATHE_LOCAL]: 'Olathe Local',
  [RevenueStreamType.WYANDOTTE_UG_LOCAL]: 'Wyandotte UG',
};
