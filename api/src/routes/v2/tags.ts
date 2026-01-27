import { FastifyInstance } from 'fastify';
import prisma from '../../utils/db';
import { authenticateFlexible } from '../../utils/auth';

export default async function tagRoutesV2(fastify: FastifyInstance) {
  // Get all tags for a specific workspace
  fastify.get<{ Params: { workspaceId: string } }>('/:workspaceId/tags', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id;
    const { workspaceId } = request.params;
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

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

  // Get bookmarks for a specific tag in workspace
  fastify.get<{ Params: { workspaceId: string; tagName: string } }>('/:workspaceId/tags/:tagName/bookmarks', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id;
    const { workspaceId, tagName } = request.params;
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        workspaceId,
        tags: {
          some: {
            name: tagName.toLowerCase(),
          },
        },
      },
      include: {
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(bookmarks);
  });
}
