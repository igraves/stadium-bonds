import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type {
  SimulateRequest,
  SensitivityRequest,
  PaydownComparisonRequest,
} from '../types';

/**
 * Fetch default parameter values
 */
export function useDefaults() {
  return useQuery({
    queryKey: ['defaults'],
    queryFn: api.getDefaults,
    staleTime: Infinity, // Defaults don't change during session
  });
}

/**
 * Run a simulation with the given parameters
 */
export function useSimulation(params: SimulateRequest, enabled: boolean = true) {
  return useQuery({
    queryKey: ['simulation', params],
    queryFn: () => api.simulate(params),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

/**
 * Run sensitivity analysis
 */
export function useSensitivity(params: SensitivityRequest, enabled: boolean = true) {
  return useQuery({
    queryKey: ['sensitivity', params],
    queryFn: () => api.runSensitivity(params),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Compare paydown percentages
 */
export function usePaydownComparison(params: PaydownComparisonRequest, enabled: boolean = true) {
  return useQuery({
    queryKey: ['paydownComparison', params],
    queryFn: () => api.comparePaydown(params),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
