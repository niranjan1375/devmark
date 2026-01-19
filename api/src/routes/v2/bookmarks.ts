import { FastifyInstance } from 'fastify';
import prisma from '../../utils/db';
import { CreateBookmarkInput, UpdateBookmarkInput } from '../../types';
import { validateNote, validateTags, normalizeTags } from '../../utils/validation';
import { authenticateFlexible } from '../../utils/auth';

export default async function bookmarkRoutesV2(fastify: FastifyInstance) {
  // Get all bookmarks for a specific workspace
  fastify.get<{ Params: { workspaceId: string } }>('/:workspaceId/bookmarks', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const { workspaceId } = request.params;

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { workspaceId },
      include: {
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(bookmarks);
  });

  // Get single bookmark from workspace
  fastify.get<{ Params: { workspaceId: string; id: string } }>('/:workspaceId/bookmarks/:id', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const { workspaceId, id } = request.params;

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        workspaceId,
      },
      include: {
        tags: true,
      },
    });

    if (!bookmark) {
      return reply.code(404).send({ error: 'Bookmark not found' });
    }

    return reply.send(bookmark);
  });

  // Create bookmark in workspace
  fastify.post<{ Params: { workspaceId: string }; Body: CreateBookmarkInput }>('/:workspaceId/bookmarks', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const { workspaceId } = request.params;
    const { url, title, note, tags } = request.body;

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    // Validate required fields
    if (!url || !title) {
      return reply.code(400).send({ error: 'URL and title are required' });
    }

    // Validate note
    const noteValidation = validateNote(note);
    if (!noteValidation.valid) {
      return reply.code(400).send({ error: noteValidation.error });
    }

    // Validate tags
    const tagsValidation = validateTags(tags || []);
    if (!tagsValidation.valid) {
      return reply.code(400).send({ error: tagsValidation.error });
    }

    // Normalize tags (lowercase)
    const normalizedTags = normalizeTags(tags || []);

    // Find or create tags (scoped to workspace)
    const tagRecords = await Promise.all(
      normalizedTags.map(async (tagName: string) => {
        const tag = await prisma.tag.upsert({
          where: { 
            name_workspaceId: {
              name: tagName,
              workspaceId,
            },
          },
          update: {},
          create: { 
            name: tagName,
            workspaceId,
          },
        });
        return tag;
      })
    );

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title,
        note,
        workspaceId,
        tags: {
          connect: tagRecords.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        tags: true,
      },
    });

    return reply.code(201).send(bookmark);
  });

  // Search bookmarks in workspace
  fastify.get<{ 
    Params: { workspaceId: string }; 
    Querystring: { tag?: string; search?: string } 
  }>('/:workspaceId/bookmarks/search', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const { workspaceId } = request.params;
    const { tag, search } = request.query;

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    });

    if (!workspace) {
      return reply.code(404).send({ error: 'Workspace not found' });
    }

    const where: any = { workspaceId };

    if (tag) {
      where.tags = {
        some: {
          name: tag.toLowerCase(),
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { note: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
      ];
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(bookmarks);
  });
}
