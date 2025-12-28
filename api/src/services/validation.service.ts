import type { BondParams, RevenueStream } from '../types/index.js';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validate bond parameters
 */
export function validateBondParams(bond: Partial<BondParams>): ValidationResult {
  const errors: ValidationError[] = [];

  if (bond.principal !== undefined) {
    if (bond.principal <= 0) {
      errors.push({ field: 'principal', message: 'Principal must be positive' });
    }
    if (bond.principal > 100_000_000_000) {
      errors.push({
        field: 'principal',
        message: 'Principal exceeds maximum ($100B)',
      });
    }
  }

  if (bond.interestRate !== undefined) {
    if (bond.interestRate < 0.001) {
      errors.push({
        field: 'interestRate',
        message: 'Interest rate must be at least 0.1%',
      });
    }
    if (bond.interestRate > 0.20) {
      errors.push({
        field: 'interestRate',
        message: 'Interest rate exceeds maximum (20%)',
      });
    }
  }

  if (bond.termYears !== undefined) {
    if (bond.termYears < 1) {
      errors.push({ field: 'termYears', message: 'Term must be at least 1 year' });
    }
    if (bond.termYears > 50) {
      errors.push({ field: 'termYears', message: 'Term exceeds maximum (50 years)' });
    }
    if (!Number.isInteger(bond.termYears)) {
      errors.push({ field: 'termYears', message: 'Term must be a whole number' });
    }
  }

  if (bond.coverageRatio !== undefined) {
    if (bond.coverageRatio < 1.0) {
      errors.push({
        field: 'coverageRatio',
        message: 'Coverage ratio must be at least 1.0',
      });
    }
    if (bond.coverageRatio > 3.0) {
      errors.push({
        field: 'coverageRatio',
        message: 'Coverage ratio exceeds maximum (3.0)',
      });
    }
  }

  if (bond.maxCapYears !== undefined) {
    if (bond.maxCapYears < 0) {
      errors.push({
        field: 'maxCapYears',
        message: 'Max cap years cannot be negative',
      });
    }
    if (
      bond.termYears !== undefined &&
      bond.maxCapYears >= bond.termYears
    ) {
      errors.push({
        field: 'maxCapYears',
        message: 'Max cap years must be less than term',
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a revenue stream
 */
export function validateRevenueStream(stream: RevenueStream): ValidationResult {
  const errors: ValidationError[] = [];

  if (!stream.name || stream.name.trim() === '') {
    errors.push({ field: 'name', message: 'Stream name is required' });
  }

  if (stream.base < 0) {
    errors.push({ field: 'base', message: 'Base revenue cannot be negative' });
  }

  if (stream.growthRate < -0.1) {
    errors.push({
      field: 'growthRate',
      message: 'Growth rate cannot be less than -10%',
    });
  }
  if (stream.growthRate > 0.2) {
    errors.push({
      field: 'growthRate',
      message: 'Growth rate exceeds maximum (20%)',
    });
  }

  if (stream.pledgePct < 0) {
    errors.push({ field: 'pledgePct', message: 'Pledge percentage cannot be negative' });
  }
  if (stream.pledgePct > 1) {
    errors.push({
      field: 'pledgePct',
      message: 'Pledge percentage cannot exceed 100%',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate excess paydown percentage
 */
export function validatePaydownPct(pct: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (pct < 0) {
    errors.push({
      field: 'excessPaydownPct',
      message: 'Paydown percentage cannot be negative',
    });
  }
  if (pct > 1) {
    errors.push({
      field: 'excessPaydownPct',
      message: 'Paydown percentage cannot exceed 100%',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate sensitivity analysis parameters
 */
export function validateSensitivityParams(
  interestRates: number[],
  growthRates: number[]
): ValidationResult {
  const errors: ValidationError[] = [];

  if (interestRates.length === 0) {
    errors.push({
      field: 'interestRates',
      message: 'At least one interest rate required',
    });
  }
  if (interestRates.length > 20) {
    errors.push({
      field: 'interestRates',
      message: 'Maximum 20 interest rates allowed',
    });
  }

  if (growthRates.length === 0) {
    errors.push({
      field: 'growthRates',
      message: 'At least one growth rate required',
    });
  }
  if (growthRates.length > 20) {
    errors.push({
      field: 'growthRates',
      message: 'Maximum 20 growth rates allowed',
    });
  }

  // Validate individual rates
  for (const rate of interestRates) {
    if (rate < 0.001 || rate > 0.2) {
      errors.push({
        field: 'interestRates',
        message: `Interest rate ${rate} out of range (0.1% - 20%)`,
      });
      break;
    }
  }

  for (const rate of growthRates) {
    if (rate < -0.1 || rate > 0.2) {
      errors.push({
        field: 'growthRates',
        message: `Growth rate ${rate} out of range (-10% - 20%)`,
      });
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}
