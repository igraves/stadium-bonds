import { useEffect, useCallback, useRef } from 'react';
import type { BondParams, LocalAddInsConfig, StreamOverrides } from '../types';
import { DEFAULT_BOND_PARAMS, DEFAULT_LOCAL_ADD_INS } from '../types';
import {
  deserializeFromUrlParams,
  serializeToUrlParams,
  generateShareUrl,
  copyToClipboard,
  type ShareableParams,
} from '../utils/urlParams';

/**
 * Result of parsing URL parameters on mount
 */
export interface UrlParamsResult {
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
  paydownPct: number;
  streamOverrides: StreamOverrides;
  hasUrlParams: boolean;
}

/**
 * Parse URL parameters on mount and return initial state values
 * This is called once to initialize state from URL
 */
export function parseUrlParamsOnMount(): UrlParamsResult {
  const searchParams = new URLSearchParams(window.location.search);
  const parsed = deserializeFromUrlParams(searchParams);

  return {
    bondParams: parsed.bondParams ?? DEFAULT_BOND_PARAMS,
    localAddIns: parsed.localAddIns ?? DEFAULT_LOCAL_ADD_INS,
    paydownPct: parsed.paydownPct ?? 0,
    streamOverrides: parsed.streamOverrides ?? {},
    hasUrlParams: searchParams.toString().length > 0,
  };
}

/**
 * Hook to manage URL parameter synchronization
 * Handles both reading params on mount and updating URL when state changes
 */
export function useUrlParams(params: ShareableParams) {
  const isFirstRender = useRef(true);

  // Update URL when parameters change (after initial render)
  useEffect(() => {
    // Skip the first render to avoid overwriting URL params we just read
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const searchParams = serializeToUrlParams(params);
    const newUrl = searchParams.toString()
      ? `${window.location.pathname}?${searchParams.toString()}`
      : window.location.pathname;

    // Use replaceState to avoid polluting browser history
    window.history.replaceState(null, '', newUrl);
  }, [params]);

  // Generate share URL
  const getShareUrl = useCallback(() => {
    return generateShareUrl(params);
  }, [params]);

  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async (): Promise<boolean> => {
    const url = generateShareUrl(params);
    return copyToClipboard(url);
  }, [params]);

  return {
    getShareUrl,
    copyShareUrl,
  };
}
