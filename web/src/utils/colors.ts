/**
 * Revenue stream colors matching Python notebooks
 */
export const STREAM_COLORS: Record<string, string> = {
  sales_use_increment: '#2ecc71',
  let: '#9b59b6',
  liquor_excise: '#e74c3c',
  apsk: '#3498db',
  olathe_local: '#f39c12',
  wyandotte_ug_local: '#1abc9c',
};

/**
 * Period status colors
 */
export const PERIOD_COLORS = {
  cap: '#95a5a6',
  amort: '#27ae60',
  paid: '#3498db',
};

/**
 * Get color for a revenue stream
 */
export function getStreamColor(streamName: string): string {
  const key = streamName.toLowerCase().replace(/ /g, '_');
  return STREAM_COLORS[key] ?? '#888888';
}

/**
 * Get color for a period status
 */
export function getPeriodColor(inCapPeriod: boolean, bondsRetired: boolean): string {
  if (bondsRetired) return PERIOD_COLORS.paid;
  if (inCapPeriod) return PERIOD_COLORS.cap;
  return PERIOD_COLORS.amort;
}

/**
 * Get human-readable stream name
 */
export function getStreamDisplayName(streamKey: string): string {
  const displayNames: Record<string, string> = {
    sales_use_increment: 'Sales + Use Tax',
    let: 'Liquor Enforcement Tax',
    liquor_excise: 'Liquor Excise',
    apsk: 'Sports Wagering (APSK)',
    olathe_local: 'Olathe Local',
    wyandotte_ug_local: 'Wyandotte UG Local',
  };
  return displayNames[streamKey] ?? streamKey;
}

/**
 * Heatmap color scale (green = good, red = bad)
 * Returns color for value in range [min, max]
 */
export function getHeatmapColor(value: number, min: number, max: number, invert: boolean = false): string {
  if (!isFinite(value)) return '#e0e0e0';

  // Normalize to 0-1
  let normalized = (value - min) / (max - min);
  normalized = Math.max(0, Math.min(1, normalized));

  if (invert) normalized = 1 - normalized;

  // Interpolate from red (0) through yellow (0.5) to green (1)
  if (normalized < 0.5) {
    // Red to yellow
    const t = normalized * 2;
    const r = 231;
    const g = Math.round(76 + (196 - 76) * t);
    const b = Math.round(60 + (60 - 60) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to green
    const t = (normalized - 0.5) * 2;
    const r = Math.round(241 - (241 - 46) * t);
    const g = Math.round(196 + (204 - 196) * t);
    const b = Math.round(60 + (113 - 60) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
