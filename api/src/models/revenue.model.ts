import type { RevenueStream, RevenueCalculation } from '../types/index.js';

/**
 * Calculate revenue for a single stream over time.
 *
 * Maps to Python: calculate_revenue_stream()
 *
 * For STAR increment streams (isIncrement=true):
 *   Year N revenue = Base * (1+g)^N - Base
 *
 * For regular streams:
 *   Year N revenue = Base * pledgePct * (1+g)^N
 *
 * @param stream - Revenue stream configuration
 * @param years - Number of years to calculate
 * @returns Array of revenue values for each year
 */
export function calculateRevenueStream(
  stream: RevenueStream,
  years: number
): number[] {
  const revenues: number[] = [];

  for (let t = 1; t <= years; t++) {
    if (stream.isIncrement) {
      // STAR increment: only capture growth above frozen base
      const total = stream.base * Math.pow(1 + stream.growthRate, t);
      revenues.push(total - stream.base);
    } else {
      // Regular stream: capture full amount with pledge percentage
      revenues.push(
        stream.base * stream.pledgePct * Math.pow(1 + stream.growthRate, t)
      );
    }
  }

  return revenues;
}

/**
 * Calculate all revenue streams and aggregate totals.
 *
 * Maps to Python: calculate_all_revenues()
 *
 * @param streams - Array of revenue stream configurations
 * @param years - Number of years to calculate
 * @returns Revenue calculation with per-stream and aggregate values
 */
export function calculateAllRevenues(
  streams: RevenueStream[],
  years: number
): RevenueCalculation {
  // Initialize year array
  const yearArray: number[] = [];
  for (let i = 1; i <= years; i++) {
    yearArray.push(i);
  }

  // Calculate each stream
  const streamRevenues: Record<string, number[]> = {};
  for (const stream of streams) {
    const colName = stream.name.toLowerCase().replace(/ /g, '_');
    streamRevenues[colName] = calculateRevenueStream(stream, years);
  }

  // Calculate total available (sum of all revenue streams per year)
  const totalAvailable: number[] = [];
  for (let i = 0; i < years; i++) {
    let sum = 0;
    for (const col of Object.keys(streamRevenues)) {
      const values = streamRevenues[col];
      const value = values?.[i];
      if (value !== undefined) {
        sum += value;
      }
    }
    totalAvailable.push(sum);
  }

  // Calculate cumulative sum
  let runningSum = 0;
  const cumulative: number[] = totalAvailable.map((v) => {
    runningSum += v;
    return runningSum;
  });

  return {
    year: yearArray,
    streamRevenues,
    totalAvailable,
    cumulative,
  };
}

/**
 * Get stream column name (normalized for consistent access)
 */
export function getStreamColumnName(stream: RevenueStream): string {
  return stream.name.toLowerCase().replace(/ /g, '_');
}
