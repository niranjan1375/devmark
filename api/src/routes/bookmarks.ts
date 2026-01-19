import { FastifyInstance } from 'fastify';
import prisma from '../utils/db';
import { CreateBookmarkInput, UpdateBookmarkInput } from '../types';
import { validateNote, validateTags, normalizeTags } from '../utils/validation';
import { getWorkspaceId } from '../utils/workspace';
import { authenticateFlexible } from '../utils/auth';

export default async function bookmarkRoutes(fastify: FastifyInstance) {
  // Get all bookmarks for authenticated user
  fastify.get('/', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const workspaceId = await getWorkspaceId(userId);

    const bookmarks = await prisma.bookmark.findMany({
      where: { workspaceId },
      include: {
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(bookmarks);
  });

  // Get single bookmark
  fastify.get<{ Params: { id: string } }>('/:id', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const workspaceId = await getWorkspaceId(userId);
    const { id } = request.params;

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

  // Create bookmark
  fastify.post<{ Body: CreateBookmarkInput }>('/', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const workspaceId = await getWorkspaceId(userId);
    const { url, title, note, tags } = request.body;

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

  // Update bookmark
  fastify.put<{ Params: { id: string }; Body: UpdateBookmarkInput }>('/:id', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const workspaceId = await getWorkspaceId(userId);
    const { id } = request.params;
    const { url, title, note, tags } = request.body;

    // Check if bookmark exists and belongs to user's workspace
    const existingBookmark = await prisma.bookmark.findFirst({
      where: { id, workspaceId },
    });

    if (!existingBookmark) {
      return reply.code(404).send({ error: 'Bookmark not found' });
    }

    // Validate note if provided
    if (note !== undefined) {
      const noteValidation = validateNote(note);
      if (!noteValidation.valid) {
        return reply.code(400).send({ error: noteValidation.error });
      }
    }

    // Validate tags if provided
    if (tags !== undefined) {
      const tagsValidation = validateTags(tags);
      if (!tagsValidation.valid) {
        return reply.code(400).send({ error: tagsValidation.error });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (url !== undefined) updateData.url = url;
    if (title !== undefined) updateData.title = title;
    if (note !== undefined) updateData.note = note;

    // Handle tags update
    if (tags !== undefined) {
      const normalizedTags = normalizeTags(tags);
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

      // Disconnect all existing tags and connect new ones
      await prisma.bookmark.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      });

      updateData.tags = {
        connect: tagRecords.map(tag => ({ id: tag.id })),
      };
    }

    // Update bookmark
    const bookmark = await prisma.bookmark.update({
      where: { id },
      data: updateData,
      include: {
        tags: true,
      },
    });

    return reply.send(bookmark);
  });

  // Delete bookmark
  fastify.delete<{ Params: { id: string } }>('/:id', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const workspaceId = await getWorkspaceId(userId);
    const { id } = request.params;

    // Check if bookmark exists and belongs to user's workspace
    const existingBookmark = await prisma.bookmark.findFirst({
      where: { id, workspaceId },
    });

    if (!existingBookmark) {
      return reply.code(404).send({ error: 'Bookmark not found' });
    }

    await prisma.bookmark.delete({
      where: { id },
    });

    return reply.code(204).send();
  });

  // Search bookmarks by tag
  fastify.get<{ Querystring: { tag?: string; search?: string } }>('/search', {
    onRequest: [authenticateFlexible],
  }, async (request, reply) => {
    const userId = request.user?.id as string;
    const workspaceId = await getWorkspaceId(userId);
    const { tag, search } = request.query;

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
