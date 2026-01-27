import { FastifyInstance } from 'fastify';
import prisma from '../utils/db';
import { getWorkspaceId } from '../utils/workspace';
import { authenticateFlexible } from '../utils/auth';

export default async function tagRoutes(fastify: FastifyInstance) {
  // Get all tags for authenticated user (tags from their workspace)
  fastify.get('/', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const workspaceId = await getWorkspaceId(userId);

    // Get all tags in the workspace with their usage count
    const tags = await prisma.tag.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
    });

    // Transform to match expected format
    const tagsWithCount = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      count: tag._count.bookmarks,
    })).sort((a, b) => b.count - a.count);

    return reply.send(tagsWithCount);
  });
}
