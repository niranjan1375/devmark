import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import prisma from './db';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}

/**
 * Authenticate using either JWT or API token
 * Supports:
 * - Authorization: Bearer <jwt_token>
 * - Authorization: Bearer <api_token>
 * - X-API-Token: <api_token>
 */
export async function authenticateFlexible(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;
  const apiTokenHeader = request.headers['x-api-token'] as string;

  // Try JWT first
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // First try as JWT
    try {
      await request.jwtVerify();
      return; // Success with JWT
    } catch (err) {
      // Not a valid JWT, try as API token
      const user = await verifyApiToken(token);
      if (user) {
        // Attach user to request (similar to JWT)
        request.user = { id: user.id, email: user.email };
        return; // Success with API token
      }
    }
  }

  // Try X-API-Token header
  if (apiTokenHeader) {
    const user = await verifyApiToken(apiTokenHeader);
    if (user) {
      request.user = { id: user.id, email: user.email };
      return; // Success with API token
    }
  }

  // No valid authentication found
  return reply.code(401).send({ error: 'Unauthorized' });
}

/**
 * Verify API token and return user if valid
 */
async function verifyApiToken(rawToken: string) {
  const MIN_TOKEN_LENGTH = 10;
  
  if (!rawToken || rawToken.length < MIN_TOKEN_LENGTH) {
    return null;
  }

  // Get all non-revoked, non-expired tokens
  const tokens = await prisma.apiToken.findMany({
    where: {
      revokedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  // Check each token hash
  for (const tokenRecord of tokens) {
    const isValid = await bcrypt.compare(rawToken, tokenRecord.token);
    if (isValid) {
      // Update last used timestamp
      await prisma.apiToken.update({
        where: { id: tokenRecord.id },
        data: { lastUsedAt: new Date() },
      });
      
      return tokenRecord.user;
    }
  }

  return null;
}
