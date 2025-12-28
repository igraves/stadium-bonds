import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Build and configure Fastify server
 */
export async function buildServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  });

  // CORS for frontend
  await server.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? '*',
  });

  // Serve static data files
  await server.register(fastifyStatic, {
    root: path.join(__dirname, '../../data'),
    prefix: '/api/data/',
    decorateReply: false,
  });

  // Register all routes
  await registerRoutes(server);

  return server;
}

/**
 * Start the server
 */
export async function startServer(): Promise<FastifyInstance> {
  const server = await buildServer();
  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  const host = process.env['HOST'] ?? '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);
    return server;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
