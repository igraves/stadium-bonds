import type { FastifyInstance } from 'fastify';
import type {
  SimulateRequest,
  SimulateResponse,
  SensitivityRequest,
  SensitivityResponse,
  PaydownComparisonRequest,
  PaydownComparisonResponse,
  DefaultsResponse,
} from '../types/index.js';
import { financingService } from '../services/financing.service.js';

export async function simulateRoutes(server: FastifyInstance): Promise<void> {
  /**
   * GET /api/defaults
   * Get default parameter values
   */
  server.get<{ Reply: DefaultsResponse }>(
    '/api/defaults',
    async (): Promise<DefaultsResponse> => {
      return financingService.getDefaults();
    }
  );

  /**
   * POST /api/simulate
   * Run a single financing simulation
   */
  server.post<{ Body: SimulateRequest; Reply: SimulateResponse }>(
    '/api/simulate',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            bond: {
              type: 'object',
              properties: {
                principal: { type: 'number' },
                interestRate: { type: 'number' },
                termYears: { type: 'number' },
                coverageRatio: { type: 'number' },
                maxCapYears: { type: 'number' },
              },
            },
            streams: { type: 'array' },
            streamOverrides: { type: 'object' },
            localAddIns: {
              type: 'object',
              properties: {
                includeOlathe: { type: 'boolean' },
                includeWyandotteUG: { type: 'boolean' },
              },
            },
            excessPaydownPct: { type: 'number', minimum: 0, maximum: 1 },
          },
        },
      },
    },
    async (request): Promise<SimulateResponse> => {
      try {
        const result = financingService.simulate(request.body);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  /**
   * POST /api/simulate/sensitivity
   * Run sensitivity analysis grid
   */
  server.post<{ Body: SensitivityRequest; Reply: SensitivityResponse }>(
    '/api/simulate/sensitivity',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            bond: { type: 'object' },
            streams: { type: 'array' },
            localAddIns: { type: 'object' },
            interestRates: { type: 'array', items: { type: 'number' } },
            growthRates: { type: 'array', items: { type: 'number' } },
            excessPaydownPct: { type: 'number', minimum: 0, maximum: 1 },
          },
        },
      },
    },
    async (request): Promise<SensitivityResponse> => {
      try {
        const result = financingService.runSensitivity(request.body);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  /**
   * POST /api/simulate/compare-paydown
   * Compare different paydown percentages
   */
  server.post<{ Body: PaydownComparisonRequest; Reply: PaydownComparisonResponse }>(
    '/api/simulate/compare-paydown',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            bond: { type: 'object' },
            streams: { type: 'array' },
            localAddIns: { type: 'object' },
            paydownPercentages: { type: 'array', items: { type: 'number' } },
          },
        },
      },
    },
    async (request): Promise<PaydownComparisonResponse> => {
      try {
        const result = financingService.comparePaydown(request.body);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
