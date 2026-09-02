/**
 * Revenue stream colors matching Python notebooks
 */
export const STREAM_COLORS: Record<string, string> = {
  sales_use_increment: '#2ecc71',
  state_sales_tax: '#2ecc71',    // Green - primary state tax
  use_tax: '#00bcd4',            // Cyan/teal - distinct from sales tax
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
    state_sales_tax: 'State Sales Tax',
    use_tax: 'Use Tax',
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

/**
 * Generate a color scale for heatmaps
 */
export function createColorScale(
  _minValue: number,
  _maxValue: number,
  colorStops: { value: number; color: string }[]
): (value: number | null, viable: boolean) => string {
  return (value: number | null, viable: boolean): string => {
    if (value === null) return '#f3f4f6'; // gray-100
    if (!viable) return '#fef2f2'; // red-50

    // Find which color stops we're between
    for (let i = 0; i < colorStops.length - 1; i++) {
      const start = colorStops[i];
      const end = colorStops[i + 1];

      if (value >= start.value && value <= end.value) {
        const t = (value - start.value) / (end.value - start.value);
        return interpolateColor(start.color, end.color, t);
      }
    }

    // Clamp to ends
    if (value < colorStops[0].value) return colorStops[0].color;
    return colorStops[colorStops.length - 1].color;
  };
}

function interpolateColor(color1: string, color2: string, t: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
