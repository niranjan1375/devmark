# Production Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured (for production)
- SSL certificates (recommended: Let's Encrypt)

## Quick Start - Production Deployment

### 1. Clone and Configure

```bash
git clone <your-repo>
cd devmark

# Copy and configure production environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values
```

### 2. Generate Secrets

```bash
# Generate strong JWT secret
openssl rand -base64 64

# Generate strong database password
openssl rand -base64 32
```

### 3. Configure Environment

Edit `.env.production` with:

```env
DB_PASSWORD=<generated-password>
JWT_SECRET=<generated-secret>
ALLOWED_ORIGINS=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

### 4. Build and Deploy

```bash
# Build containers
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec api pnpm run prisma:migrate:deploy
```

### 5. Verify Deployment

```bash
# Check service health
curl http://localhost:3000/health
curl http://localhost:3000/ready

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Environment Variables

### Required Production Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret for JWT tokens | Generated with openssl |
| `DB_PASSWORD` | PostgreSQL password | Strong random password |
| `ALLOWED_ORIGINS` | Comma-separated origins | `https://yourdomain.com` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW` | 15 minutes | Rate limit time window |
| `LOG_LEVEL` | info | Logging level (debug, info, warn, error) |

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated strong JWT secret (64+ characters)
- [ ] Configured CORS for your domain only
- [ ] Set up SSL/TLS certificates
- [ ] Enabled rate limiting
- [ ] Configured backup strategy
- [ ] Set up monitoring and alerts
- [ ] Reviewed and secured all environment variables

## Monitoring

### Health Endpoints

- `GET /health` - Basic health check
- `GET /ready` - Readiness check (includes DB connection)

### Logging

Logs are output to stdout/stderr. Configure log aggregation:

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Filter error logs
docker-compose -f docker-compose.prod.yml logs api | grep ERROR
```

## Backup and Recovery

### Database Backup

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U devmark devmark > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U devmark devmark < backup.sql
```

### Automated Backups

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/devmark && docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U devmark devmark > backups/backup-$(date +\%Y\%m\%d).sql
```

## Scaling

### Horizontal Scaling (API)

```yaml
# docker-compose.prod.yml
services:
  api:
    deploy:
      replicas: 3
    # ... other config
```

### Database Connection Pooling

Prisma automatically manages connection pooling. For high load:

```env
# Add to DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=20&pool_timeout=20"
```

## Troubleshooting

### API won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api

# Check environment
docker-compose -f docker-compose.prod.yml exec api env

# Rebuild
docker-compose -f docker-compose.prod.yml build --no-cache api
```

### Database connection issues

```bash
# Check postgres is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check postgres logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec api node -e "require('./dist/utils/db').default.\$queryRaw\`SELECT 1\`"
```

### CORS errors

1. Verify `ALLOWED_ORIGINS` in `.env.production`
2. Check browser console for actual origin
3. Add origin to allowed list
4. Restart API container

## Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild containers
docker-compose -f docker-compose.prod.yml build

# Run migrations
docker-compose -f docker-compose.prod.yml exec api pnpm run prisma:migrate:deploy

# Restart with zero downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps --build api web
```

### Database Migrations

```bash
# Create migration (development)
cd api && pnpm run prisma:migrate

# Apply in production
docker-compose -f docker-compose.prod.yml exec api pnpm run prisma:migrate:deploy
```

## Performance Optimization

1. **Enable query caching** - Use Redis for session storage
2. **CDN** - Serve static assets via CDN
3. **Database indexes** - Already configured in schema
4. **Load balancing** - Use nginx or cloud load balancer
5. **Monitoring** - Set up APM (Application Performance Monitoring)

## Support

For issues, check:
- [GitHub Issues](https://github.com/niranjan1375/devmark/issues)
- Documentation in `/issues/SECURITY_AUDIT.md`
- Deployment guide in `/DEPLOYMENT.md`
