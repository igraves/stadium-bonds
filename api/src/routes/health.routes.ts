import type { FastifyInstance } from 'fastify';
import type { HealthResponse } from '../types/index.js';
import { API_VERSION } from '../config/defaults.js';

export async function healthRoutes(server: FastifyInstance): Promise<void> {
  /**
   * GET /api/health
   * Health check endpoint
   */
  server.get<{ Reply: HealthResponse }>(
    '/health',
    async (): Promise<HealthResponse> => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: API_VERSION,
      };
    }
  );
}
