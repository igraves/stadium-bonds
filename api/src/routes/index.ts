import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';
import { simulateRoutes } from './simulate.routes.js';

/**
 * Register all routes
 */
export async function registerRoutes(server: FastifyInstance): Promise<void> {
  await server.register(healthRoutes);

  // In local dev, add /api prefix since there's no API Gateway
  // In production (Lambda), API Gateway handles the /api prefix
  const apiPrefix = process.env['LOCAL_DEV'] === 'true' ? '/api' : '';
  await server.register(simulateRoutes, { prefix: apiPrefix });
}
