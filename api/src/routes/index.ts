import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';
import { simulateRoutes } from './simulate.routes.js';

/**
 * Register all routes
 */
export async function registerRoutes(server: FastifyInstance): Promise<void> {
  await server.register(healthRoutes);
  await server.register(simulateRoutes);
}
