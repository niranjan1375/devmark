import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../utils/db';

export default async function apiTokenRoutes(fastify: FastifyInstance) {
  // Generate a new API token
  fastify.post<{ Body: { name: string } }>('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const { name } = request.body;

    if (!name || name.trim().length === 0) {
      return reply.code(400).send({ error: 'Token name is required' });
    }

    // Generate a random token (this is what the user will use)
    const rawToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token for storage
    const hashedToken = await bcrypt.hash(rawToken, 10);

    // Create the token record
    const apiToken = await prisma.apiToken.create({
      data: {
        name: name.trim(),
        token: hashedToken,
        userId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Return the raw token ONLY once - user must save it
    return reply.code(201).send({
      ...apiToken,
      token: rawToken, // Only time we send the raw token
      message: 'Save this token securely. You won\'t be able to see it again.',
    });
  });

  // List all API tokens for the user (without the token value)
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id as string;

    const tokens = await prisma.apiToken.findMany({
      where: {
        userId,
        revokedAt: null, // Only show non-revoked tokens
      },
      select: {
        id: true,
        name: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(tokens);
  });

  // Revoke an API token
  fastify.delete<{ Params: { id: string } }>('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const { id } = request.params;

    // Check if token exists and belongs to user
    const token = await prisma.apiToken.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!token) {
      return reply.code(404).send({ error: 'Token not found' });
    }

    if (token.revokedAt) {
      return reply.code(400).send({ error: 'Token already revoked' });
    }

    // Revoke the token
    await prisma.apiToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
      },
    });

    return reply.code(204).send();
  });
}
