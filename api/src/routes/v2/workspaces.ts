import { FastifyInstance } from 'fastify';
import prisma from '../../utils/db';

export default async function workspaceRoutesV2(fastify: FastifyInstance) {
  // Get user's workspaces
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id;
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const workspaces = await prisma.workspace.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        isPersonal: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookmarks: true,
            tags: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return reply.send(workspaces);
  });

  // Get specific workspace
  fastify.get<{ Params: { id: string } }>('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id;
    const { id } = request.params;
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: {
            bookmarks: true,
            tags: true,
          },
        },
      },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    return reply.send(workspace);
  });

  // Update workspace
  fastify.put<{ Params: { id: string }; Body: { name: string } }>('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id;
    const { id } = request.params;
    const { name } = request.body;
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    if (!name || name.trim().length === 0) {
      return reply.code(400).send({ error: 'Workspace name is required' });
    }

    // Check if workspace exists and belongs to user
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { id, userId },
    });

    if (!existingWorkspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data: { name: name.trim() },
    });

    return reply.send(workspace);
  });

  // Get workspace stats
  fastify.get<{ Params: { id: string } }>('/:id/stats', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id;
    const { id } = request.params;
    
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id, userId },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    // Get detailed stats
    const [bookmarkCount, tagCount, recentBookmarks] = await Promise.all([
      prisma.bookmark.count({ where: { workspaceId: id } }),
      prisma.tag.count({ where: { workspaceId: id } }),
      prisma.bookmark.findMany({
        where: { workspaceId: id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          url: true,
          createdAt: true,
        },
      }),
    ]);

    return reply.send({
      bookmarkCount,
      tagCount,
      recentBookmarks,
    });
  });
}
