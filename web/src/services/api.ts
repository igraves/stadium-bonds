import type {
  SimulateRequest,
  SimulateResponse,
  SensitivityRequest,
  SensitivityResponse,
  PaydownComparisonRequest,
  PaydownComparisonResponse,
  DefaultsResponse,
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  /**
   * Get default parameter values
   */
  getDefaults: async (): Promise<DefaultsResponse> => {
    return fetchJSON<DefaultsResponse>(`${API_BASE}/defaults`);
  },

  /**
   * Run a single financing simulation
   */
  simulate: async (params: SimulateRequest): Promise<SimulateResponse> => {
    return fetchJSON<SimulateResponse>(`${API_BASE}/simulate`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Run sensitivity analysis grid
   */
  runSensitivity: async (params: SensitivityRequest): Promise<SensitivityResponse> => {
    return fetchJSON<SensitivityResponse>(`${API_BASE}/simulate/sensitivity`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * Compare different paydown percentages
   */
  comparePaydown: async (params: PaydownComparisonRequest): Promise<PaydownComparisonResponse> => {
    return fetchJSON<PaydownComparisonResponse>(`${API_BASE}/simulate/compare-paydown`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
