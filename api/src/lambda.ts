import awsLambdaFastify from '@fastify/aws-lambda';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { buildServer } from './server.js';

let proxy: (event: APIGatewayProxyEvent, context: Context) => Promise<APIGatewayProxyResult>;

/**
 * Lambda handler that wraps the Fastify server
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  if (!proxy) {
    const server = await buildServer();
    proxy = awsLambdaFastify(server);
  }
  return proxy(event, context);
};
