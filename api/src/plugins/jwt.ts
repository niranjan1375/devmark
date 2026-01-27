import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';

export default fp(async function (fastify: FastifyInstance) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters long');
  }
  
  fastify.register(jwt, {
    secret: jwtSecret,
  });

  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
