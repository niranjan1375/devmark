# Production Deployment Checklist

## Pre-Deployment

### Security
- [x] JWT secret is strong (64+ characters from openssl)
- [x] Database password is secure
- [x] CORS configured for production domains only
- [x] Rate limiting enabled (100 req/15min)
- [x] Security headers enabled (Helmet)
- [x] bcrypt rounds set to 12
- [x] XSS vulnerabilities fixed
- [x] URL validation in place
- [x] Error messages don't leak information
- [ ] SSL/TLS certificates configured
- [ ] Environment files not in git (.env in .gitignore)

### Infrastructure
- [x] Docker configuration ready
- [x] Health check endpoints (/health, /ready)
- [x] Graceful shutdown handlers
- [x] Database connection pooling
- [x] Production logging configured
- [ ] Database backup strategy
- [ ] Monitoring/alerting setup
- [ ] CDN for static assets (optional)

### Configuration
- [x] Production environment template created
- [x] Build scripts added
- [x] Migration scripts ready
- [ ] Domain DNS configured
- [ ] Load balancer configured (if needed)
- [ ] Firewall rules set

## Deployment Steps

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd devmark

# Copy and edit production environment
cp .env.production.example .env.production
nano .env.production
```

### 2. Generate Secrets

```bash
# JWT Secret
openssl rand -base64 64

# Database Password
openssl rand -base64 32
```

### 3. Configure .env.production

```env
DB_PASSWORD=<generated-password>
JWT_SECRET=<generated-jwt-secret>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
API_URL=https://api.yourdomain.com
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

### 4. Build and Deploy

```bash
# Build production images
make prod-build

# Start services
make prod-up

# Run database migrations
make prod-migrate

# Check health
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

### 5. Verify

```bash
# Check logs
make prod-logs

# Test API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# Test web app
open http://localhost:3001
```

## Post-Deployment

### Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up log aggregation
- [ ] Monitor database performance
- [ ] Set up alerts for downtime

### Backups
- [ ] Automated daily database backups
- [ ] Test restore procedure
- [ ] Off-site backup storage
- [ ] Backup retention policy (30 days recommended)

### Performance
- [ ] Enable caching (Redis)
- [ ] Configure CDN for static assets
- [ ] Optimize database queries
- [ ] Set up load balancing (if needed)
- [ ] Enable compression

### Documentation
- [ ] Update README with production URL
- [ ] Document backup/restore procedures
- [ ] Create runbook for common issues
- [ ] Document scaling procedures

## Rollback Plan

If deployment fails:

```bash
# Stop production containers
make prod-down

# Check logs
docker-compose -f docker-compose.prod.yml logs

# Roll back to previous version
git checkout <previous-commit>
make prod-build
make prod-up
```

## Maintenance

### Regular Tasks
- Weekly: Review logs for errors
- Weekly: Check disk space
- Monthly: Update dependencies
- Monthly: Review and rotate API tokens
- Quarterly: Security audit
- Quarterly: Performance review

### Updates

```bash
# Pull latest code
git pull

# Rebuild
make prod-build

# Run migrations
make prod-migrate

# Restart (zero downtime)
docker-compose -f docker-compose.prod.yml up -d --no-deps api web
```

## Production URLs

After deployment, update these in your `.env.production`:

- **Web App**: https://yourdomain.com
- **API**: https://api.yourdomain.com
- **Health Check**: https://api.yourdomain.com/health
- **Ready Check**: https://api.yourdomain.com/ready

## Support

- **Documentation**: See `/PRODUCTION.md`
- **Security**: See `/issues/SECURITY_AUDIT.md`
- **Issues**: https://github.com/niranjan1375/devmark/issues

## Environment Variables Reference

### Required
| Variable | Description | Example |
|----------|-------------|---------|
| JWT_SECRET | JWT signing secret | Generated with openssl |
| DB_PASSWORD | PostgreSQL password | Strong random password |
| ALLOWED_ORIGINS | CORS origins | https://yourdomain.com |

### Optional
| Variable | Default | Description |
|----------|---------|-------------|
| RATE_LIMIT_MAX | 100 | Max requests per window |
| RATE_LIMIT_WINDOW | 15 minutes | Rate limit window |
| LOG_LEVEL | info | Log level (debug/info/warn/error) |
| DB_USER | devmark | Database user |
| DB_NAME | devmark | Database name |
| API_PORT | 3000 | API server port |
| WEB_PORT | 3001 | Web server port |
