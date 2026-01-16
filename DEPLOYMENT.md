# DevMark Deployment Guide

This guide covers deploying DevMark to production.

## Architecture Overview

```
┌─────────────────┐
│  Chrome Browser │
│   + Extension   │
└────────┬────────┘
         │
         │ HTTPS
         │
    ┌────▼────┐          ┌──────────┐
    │   Web   │◄────────►│   API    │
    │ Next.js │  HTTPS   │ Fastify  │
    └─────────┘          └─────┬────┘
                               │
                               │ SQL
                               │
                         ┌─────▼─────┐
                         │ PostgreSQL │
                         └───────────┘
```

## Components to Deploy

1. **PostgreSQL Database** - Managed service recommended
2. **Backend API** - Node.js application (Fastify)
3. **Frontend Web** - Next.js application (static or SSR)
4. **Chrome Extension** - Published to Chrome Web Store (optional)

## Prerequisites

- Domain name (optional but recommended)
- SSL certificates (Let's Encrypt for free SSL)
- Cloud hosting account (see options below)

## Database Deployment

### Option 1: Managed PostgreSQL (Recommended)

**Recommended Providers:**
- Railway.app - Easy setup, good free tier
- Supabase - PostgreSQL with built-in features
- Neon - Serverless PostgreSQL
- DigitalOcean Managed Databases
- AWS RDS
- Google Cloud SQL

**Setup Steps:**
1. Create a PostgreSQL database instance
2. Note the connection string (DATABASE_URL)
3. Configure firewall to allow API server access
4. Enable SSL connections

### Option 2: Self-Hosted PostgreSQL

```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb devmark

# Create user
sudo -u postgres psql
CREATE USER devmark WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE devmark TO devmark;
```

## Backend API Deployment

### Option 1: Vercel (Recommended for simplicity)

```bash
cd api

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET
# - NODE_ENV=production
```

### Option 2: Railway.app

1. Connect your GitHub repository
2. Select the `api` directory
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT` (Railway sets this automatically)
4. Deploy

### Option 3: DigitalOcean App Platform

1. Create new app from GitHub
2. Select `api` directory
3. Set build command: `npm install && npm run build`
4. Set run command: `npm start`
5. Add environment variables
6. Deploy

### Option 4: Traditional VPS (Ubuntu)

```bash
# On your VPS
cd /var/www
git clone https://github.com/YOUR_USERNAME/devmark.git
cd devmark/api

# Install dependencies
npm install --production

# Set up environment
cp .env.example .env
# Edit .env with production values

# Build
npm run build

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start npm --name "devmark-api" -- start
pm2 save
pm2 startup

# Set up Nginx reverse proxy
sudo nano /etc/nginx/sites-available/devmark-api

# Nginx configuration:
server {
    listen 80;
    server_name api.yourdom.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/devmark-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Set up SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## Frontend Web Deployment

### Option 1: Vercel (Recommended)

```bash
cd web

# Deploy
vercel

# Set environment variable in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Option 2: Netlify

1. Connect GitHub repository
2. Set base directory: `web`
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Set environment variable: `NEXT_PUBLIC_API_URL`
6. Deploy

### Option 3: Self-Hosted

```bash
# On your VPS
cd /var/www/devmark/web

# Install dependencies
npm install --production

# Set environment
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > .env.local

# Build
npm run build

# Start with PM2
pm2 start npm --name "devmark-web" -- start
pm2 save

# Nginx configuration
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Chrome Extension Deployment

### Option 1: Chrome Web Store (Public)

1. **Prepare Extension**
   ```bash
   cd extension
   
   # Update popup.js with production API URL
   # Change: const API_URL = 'http://localhost:3000';
   # To: const API_URL = 'https://api.yourdomain.com';
   
   # Generate PNG icons
   cd icons
   ./create-icons.sh
   
   # Create zip file
   cd ..
   zip -r devmark-extension.zip * -x "*.txt" -x "create-icons.sh"
   ```

2. **Create Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Pay one-time $5 registration fee

3. **Upload Extension**
   - Click "New Item"
   - Upload `devmark-extension.zip`
   - Fill in store listing details
   - Upload screenshots
   - Submit for review (usually takes 1-3 days)

### Option 2: Private Distribution

For internal use or beta testing:

1. Update API URL in `popup.js`
2. Share the `extension/` folder
3. Users load unpacked extension in Chrome

## Environment Variables

### Backend API

```bash
DATABASE_URL="postgresql://user:password@host:5432/devmark?schema=public"
JWT_SECRET="your-very-secure-secret-key-min-32-characters"
PORT=3000
HOST="0.0.0.0"
NODE_ENV="production"
```

### Frontend Web

```bash
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

## Database Migration

```bash
cd api

# Run migrations on production database
npm run prisma:migrate

# Or if you need to reset (WARNING: deletes all data)
npx prisma migrate reset
```

## Security Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable PostgreSQL SSL connections
- [ ] Set secure CORS origins (not `origin: true`)
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting (add middleware)
- [ ] Regular security updates (`npm audit fix`)
- [ ] Backup database regularly
- [ ] Monitor error logs
- [ ] Set up error tracking (Sentry, etc.)

## Monitoring

### Health Checks

API has a health endpoint: `GET /health`

Set up monitoring:
- UptimeRobot (free)
- Pingdom
- Better Uptime

### Logging

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Custom analytics for bookmark stats

### Database Backups

Set up automated backups:
- Most managed services provide automatic backups
- For self-hosted: `pg_dump` with cron job

```bash
# Example backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
# Upload to S3 or similar
```

## Performance Optimization

### API
- Enable Fastify compression
- Add Redis for caching (future)
- Database connection pooling (Prisma handles this)
- Add rate limiting

### Web
- Enable Next.js image optimization
- Use CDN for static assets
- Enable HTTP/2
- Optimize bundle size

### Database
- Add indexes on frequently queried fields (userId, tag.name)
- Monitor slow queries with Prisma logging

## Cost Estimates

### Free Tier (Development/Personal)
- Database: Railway/Supabase free tier
- API: Vercel/Railway free tier
- Web: Vercel/Netlify free tier
- Extension: $5 one-time
- **Total: ~$5 one-time**

### Paid (Production/Scale)
- Database: $10-25/month (managed PostgreSQL)
- API: $10-20/month (VPS or serverless)
- Web: $10-20/month (hosting)
- Domain: $10-15/year
- **Total: ~$30-65/month + domain**

## Troubleshooting

### API won't start
- Check DATABASE_URL is correct
- Check migrations have run
- Check firewall rules
- Check logs: `pm2 logs devmark-api`

### Web can't connect to API
- Check NEXT_PUBLIC_API_URL is correct
- Check CORS settings in API
- Check SSL certificates
- Check network/firewall rules

### Database connection errors
- Check DATABASE_URL format
- Check database is running
- Check SSL mode (add `?sslmode=require`)
- Check connection limits

### Extension not working
- Check API URL in popup.js
- Check CORS allows extension origin
- Check manifest.json permissions

## Updates and Maintenance

```bash
# Pull latest changes
git pull

# Update dependencies
cd api && npm update
cd web && npm update

# Run migrations if schema changed
cd api && npm run prisma:migrate

# Rebuild and restart
cd api && npm run build && pm2 restart devmark-api
cd web && npm run build && pm2 restart devmark-web
```

## Rollback

If deployment fails:

```bash
# Rollback to previous commit
git revert HEAD
git push

# Or rollback to specific version
git checkout <previous-commit-hash>

# Rebuild and restart
# ... (same as update steps)
```

## Support

- Check logs first
- Review environment variables
- Test database connection
- Check API health endpoint
- Monitor error tracking service

## Next Steps

After successful deployment:
1. Set up monitoring
2. Configure backups
3. Set up error tracking
4. Add rate limiting
5. Enable analytics
6. Set up CI/CD (GitHub Actions)
7. Document your specific deployment

Good luck with your deployment! 🚀
