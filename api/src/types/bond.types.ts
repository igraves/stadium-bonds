/**
 * Bond structure parameters
 * Maps to Python BondParams dataclass in star_financing_model.ipynb
 */
export interface BondParams {
  /** Initial bond principal in dollars */
  principal: number;
  /** Annual interest rate (e.g., 0.05 for 5%) */
  interestRate: number;
  /** Total bond term in years */
  termYears: number;
  /** Required coverage ratio (e.g., 1.30 for 1.30x) */
  coverageRatio: number;
  /** Maximum allowed capitalization period in years */
  maxCapYears: number;
}

/**
 * Default bond parameters matching BOND_ASSUMPTIONS.md
 */
export const DEFAULT_BOND_PARAMS: BondParams = {
  principal: 2_400_000_000,
  interestRate: 0.05,
  termYears: 30,
  coverageRatio: 1.30,
  maxCapYears: 20,
};
