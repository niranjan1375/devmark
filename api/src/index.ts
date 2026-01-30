import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import jwtPlugin from './plugins/jwt';
import authRoutes from './routes/auth';
import bookmarkRoutes from './routes/bookmarks';
import tagRoutes from './routes/tags';
import apiTokenRoutes from './routes/apiTokens';
import workspaceRoutesV2 from './routes/v2/workspaces';
import bookmarkRoutesV2 from './routes/v2/bookmarks';
import tagRoutesV2 from './routes/v2/tags';

// Load environment variables
dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    ...(process.env.NODE_ENV === 'production' && {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error'
    : error.message;
  
  reply.status(error.statusCode || 500).send({
    error: message,
    statusCode: error.statusCode || 500,
  });
});

// Security headers
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

// Rate limiting
fastify.register(rateLimit, {
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
  timeWindow: process.env.RATE_LIMIT_WINDOW || '15 minutes',
  cache: 10000,
});

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:4200', 'http://localhost:4100'];

fastify.register(cors, {
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true);
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return cb(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    
    // Reject other origins
    cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
});

fastify.register(jwtPlugin);

// Register V1 routes (backward compatible)
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(bookmarkRoutes, { prefix: '/api/bookmarks' });
fastify.register(tagRoutes, { prefix: '/api/tags' });
fastify.register(apiTokenRoutes, { prefix: '/api/tokens' });

// Register V2 routes (workspace-aware)
fastify.register(workspaceRoutesV2, { prefix: '/api/v2/workspaces' });
fastify.register(bookmarkRoutesV2, { prefix: '/api/v2/workspaces' });
fastify.register(tagRoutesV2, { prefix: '/api/v2/workspaces' });

// Health check endpoint
fastify.get('/health', async () => {
  return { 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };
});

// Ready check (includes DB connection)
fastify.get('/ready', async () => {
  try {
    // Test database connection
    const prisma = (await import('./utils/db')).default;
    await prisma.$queryRaw`SELECT 1`;
    
    return { 
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'not ready',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
});

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing server gracefully...`);
  
  try {
    await fastify.close();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    fastify.log.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => closeGracefully('SIGTERM'));
process.on('SIGINT', () => closeGracefully('SIGINT'));

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4100', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server is running on http://${host}:${port}`);
    fastify.log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
