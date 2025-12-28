/**
 * Calculate level annual debt service (P&I) for amortizing loan.
 *
 * Maps to Python: calculate_level_payment()
 *
 * PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
 *
 * @param principal - Loan principal amount
 * @param rate - Annual interest rate (decimal, e.g., 0.05 for 5%)
 * @param periods - Number of payment periods (years)
 * @returns Annual payment amount (principal + interest)
 */
export function calculateLevelPayment(
  principal: number,
  rate: number,
  periods: number
): number {
  if (rate === 0) {
    return principal / periods;
  }

  const factor = Math.pow(1 + rate, periods);
  return (principal * (rate * factor)) / (factor - 1);
}
