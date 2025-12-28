import type { BondParams, LocalAddInsConfig, StreamOverrides, StreamOverride } from '../types';
import { DEFAULT_BOND_PARAMS, RevenueStreamType } from '../types';

/**
 * URL parameter keys for simulation settings
 */
export const URL_PARAM_KEYS = {
  // Bond parameters
  principal: 'p',
  interestRate: 'r',
  termYears: 't',
  coverageRatio: 'c',

  // Local add-ins
  includeOlathe: 'ol',
  includeWyandotteUG: 'wy',

  // Paydown
  paydownPct: 'pd',

  // Stream overrides (prefixed with stream type abbreviation)
  // Format: {streamAbbrev}_{property} e.g., sst_b (state sales tax base)
} as const;

/**
 * Stream type abbreviations for URL parameters
 */
const STREAM_ABBREVS: Record<RevenueStreamType, string> = {
  [RevenueStreamType.STATE_SALES_TAX]: 'sst',
  [RevenueStreamType.USE_TAX]: 'ut',
  [RevenueStreamType.LET]: 'let',
  [RevenueStreamType.LIQUOR_EXCISE]: 'le',
  [RevenueStreamType.APSK]: 'apsk',
  [RevenueStreamType.OLATHE_LOCAL]: 'oll',
  [RevenueStreamType.WYANDOTTE_UG_LOCAL]: 'wyl',
};

const ABBREV_TO_STREAM: Record<string, RevenueStreamType> = Object.entries(STREAM_ABBREVS)
  .reduce((acc, [key, value]) => ({ ...acc, [value]: key as RevenueStreamType }), {});

/**
 * Interface for all shareable simulation parameters
 */
export interface ShareableParams {
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
  paydownPct: number;
  streamOverrides: StreamOverrides;
}

/**
 * Serialize simulation parameters to URL search params
 * Only includes values that differ from defaults to keep URLs short
 */
export function serializeToUrlParams(params: ShareableParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  // Bond parameters - only add if different from default
  if (params.bondParams.principal !== DEFAULT_BOND_PARAMS.principal) {
    // Store in billions for shorter URLs
    searchParams.set(URL_PARAM_KEYS.principal, (params.bondParams.principal / 1_000_000_000).toString());
  }
  if (params.bondParams.interestRate !== DEFAULT_BOND_PARAMS.interestRate) {
    // Store as percentage (e.g., 5 instead of 0.05)
    searchParams.set(URL_PARAM_KEYS.interestRate, (params.bondParams.interestRate * 100).toString());
  }
  if (params.bondParams.termYears !== DEFAULT_BOND_PARAMS.termYears) {
    searchParams.set(URL_PARAM_KEYS.termYears, params.bondParams.termYears.toString());
  }
  if (params.bondParams.coverageRatio !== DEFAULT_BOND_PARAMS.coverageRatio) {
    searchParams.set(URL_PARAM_KEYS.coverageRatio, params.bondParams.coverageRatio.toString());
  }

  // Local add-ins - only add if true (default is false)
  if (params.localAddIns.includeOlathe) {
    searchParams.set(URL_PARAM_KEYS.includeOlathe, '1');
  }
  if (params.localAddIns.includeWyandotteUG) {
    searchParams.set(URL_PARAM_KEYS.includeWyandotteUG, '1');
  }

  // Paydown percentage - only add if non-zero
  if (params.paydownPct > 0) {
    // Store as percentage (e.g., 50 instead of 0.5)
    searchParams.set(URL_PARAM_KEYS.paydownPct, (params.paydownPct * 100).toString());
  }

  // Stream overrides
  for (const [streamType, override] of Object.entries(params.streamOverrides)) {
    const abbrev = STREAM_ABBREVS[streamType as RevenueStreamType];
    if (!abbrev || !override) continue;

    if (override.base !== undefined) {
      // Store in millions for shorter URLs
      searchParams.set(`${abbrev}_b`, (override.base / 1_000_000).toString());
    }
    if (override.growthRate !== undefined) {
      // Store as percentage (e.g., 2.5 instead of 0.025)
      searchParams.set(`${abbrev}_g`, (override.growthRate * 100).toString());
    }
    if (override.groceryExemption !== undefined) {
      // Store as percentage (e.g., 20 instead of 0.20)
      searchParams.set(`${abbrev}_ge`, (override.groceryExemption * 100).toString());
    }
  }

  return searchParams;
}

/**
 * Deserialize URL search params to simulation parameters
 * Returns partial params - undefined values mean use default
 */
export function deserializeFromUrlParams(searchParams: URLSearchParams): Partial<ShareableParams> {
  const result: Partial<ShareableParams> = {};

  // Bond parameters
  const bondParams: Partial<BondParams> = {};

  const principal = searchParams.get(URL_PARAM_KEYS.principal);
  if (principal !== null) {
    bondParams.principal = parseFloat(principal) * 1_000_000_000;
  }

  const interestRate = searchParams.get(URL_PARAM_KEYS.interestRate);
  if (interestRate !== null) {
    bondParams.interestRate = parseFloat(interestRate) / 100;
  }

  const termYears = searchParams.get(URL_PARAM_KEYS.termYears);
  if (termYears !== null) {
    bondParams.termYears = parseInt(termYears, 10);
  }

  const coverageRatio = searchParams.get(URL_PARAM_KEYS.coverageRatio);
  if (coverageRatio !== null) {
    bondParams.coverageRatio = parseFloat(coverageRatio);
  }

  if (Object.keys(bondParams).length > 0) {
    result.bondParams = { ...DEFAULT_BOND_PARAMS, ...bondParams };
  }

  // Local add-ins
  const includeOlathe = searchParams.get(URL_PARAM_KEYS.includeOlathe);
  const includeWyandotteUG = searchParams.get(URL_PARAM_KEYS.includeWyandotteUG);

  if (includeOlathe !== null || includeWyandotteUG !== null) {
    result.localAddIns = {
      includeOlathe: includeOlathe === '1',
      includeWyandotteUG: includeWyandotteUG === '1',
    };
  }

  // Paydown percentage
  const paydownPct = searchParams.get(URL_PARAM_KEYS.paydownPct);
  if (paydownPct !== null) {
    result.paydownPct = parseFloat(paydownPct) / 100;
  }

  // Stream overrides
  const streamOverrides: StreamOverrides = {};

  for (const [abbrev, streamType] of Object.entries(ABBREV_TO_STREAM)) {
    const override: StreamOverride = {};

    const base = searchParams.get(`${abbrev}_b`);
    if (base !== null) {
      override.base = parseFloat(base) * 1_000_000;
    }

    const growthRate = searchParams.get(`${abbrev}_g`);
    if (growthRate !== null) {
      override.growthRate = parseFloat(growthRate) / 100;
    }

    const groceryExemption = searchParams.get(`${abbrev}_ge`);
    if (groceryExemption !== null) {
      override.groceryExemption = parseFloat(groceryExemption) / 100;
    }

    if (Object.keys(override).length > 0) {
      streamOverrides[streamType] = override;
    }
  }

  if (Object.keys(streamOverrides).length > 0) {
    result.streamOverrides = streamOverrides;
  }

  return result;
}

/**
 * Generate a shareable URL with the current simulation parameters
 */
export function generateShareUrl(params: ShareableParams): string {
  const searchParams = serializeToUrlParams(params);
  const queryString = searchParams.toString();

  // Use current origin for the base URL
  const baseUrl = window.location.origin + window.location.pathname;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Copy text to clipboard and return success status
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
