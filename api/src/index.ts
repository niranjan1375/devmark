import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import jwtPlugin from './plugins/jwt';
import authRoutes from './routes/auth';
import bookmarkRoutes from './routes/bookmarks';
import tagRoutes from './routes/tags';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Register plugins
fastify.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true,
});

fastify.register(jwtPlugin);

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(bookmarkRoutes, { prefix: '/api/bookmarks' });
fastify.register(tagRoutes, { prefix: '/api/tags' });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`Server is running on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
