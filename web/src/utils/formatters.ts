/**
 * Format a number as currency with M or B suffix
 */
export function formatCurrency(value: number, options?: { scale?: 'auto' | 'M' | 'B'; decimals?: number }): string {
  const { scale = 'auto', decimals = 1 } = options ?? {};

  let divisor: number;
  let suffix: string;

  if (scale === 'B' || (scale === 'auto' && Math.abs(value) >= 1e9)) {
    divisor = 1e9;
    suffix = 'B';
  } else {
    divisor = 1e6;
    suffix = 'M';
  }

  const formatted = (value / divisor).toFixed(decimals);
  return `$${formatted}${suffix}`;
}

/**
 * Format a decimal as a percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a coverage ratio
 */
export function formatRatio(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '—';
  if (!isFinite(value)) return '∞';
  return `${value.toFixed(decimals)}x`;
}

/**
 * Format a large number with commas
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a year (e.g., "Year 17" or "Full Term")
 */
export function formatPayoffYear(year: number | null, termYears: number): string {
  if (year === null || year >= termYears) {
    return `Year ${termYears} (Full Term)`;
  }
  return `Year ${year}`;
}
