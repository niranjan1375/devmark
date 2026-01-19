import { FastifyInstance } from 'fastify';
import prisma from '../utils/db';

export default async function tagRoutes(fastify: FastifyInstance) {
  // Get all tags for authenticated user (tags from their bookmarks)
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const userId = request.user?.id as string;

    // Get all unique tags from user's bookmarks
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        tags: true,
      },
    });

    // Extract unique tags
    const tagsSet = new Set<string>();
    const tagsMap = new Map<string, any>();

    bookmarks.forEach((bookmark: any) => {
      bookmark.tags.forEach((tag: any) => {
        if (!tagsSet.has(tag.id)) {
          tagsSet.add(tag.id);
          tagsMap.set(tag.id, {
            id: tag.id,
            name: tag.name,
            count: 1,
          });
        } else {
          const existing = tagsMap.get(tag.id);
          if (existing) {
            existing.count += 1;
          }
        }
      });
    });

    const tags = Array.from(tagsMap.values()).sort((a, b) => b.count - a.count);

    return reply.send(tags);
  });
}
