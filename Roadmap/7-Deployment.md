# Deployment - Getting Your Backend to Production

## Deployment Platforms

### Popular Platforms

| Platform         | Type | Best For                         |
| ---------------- | ---- | -------------------------------- |
| **Heroku**       | PaaS | Quick deployment, small apps     |
| **AWS**          | IaaS | Scalable, enterprise apps        |
| **DigitalOcean** | VPS  | Affordable, mid-size apps        |
| **Vercel**       | PaaS | Full-stack apps (frontend focus) |
| **Render**       | PaaS | Modern apps, easy setup          |
| **Railway**      | PaaS | Simple deployment                |

---

## Pre-Deployment Checklist

Before deploying, ensure:

```
✓ All environment variables configured
✓ Database is set up and accessible
✓ Code is tested and working locally
✓ .gitignore includes node_modules
✓ package.json has all dependencies
✓ No hardcoded secrets or passwords
✓ Error handling is implemented
✓ Logging is in place
✓ Security measures (CORS, helmet, etc.)
```

---

## Environment Variables

### .env File Structure

```
# Server
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
DB_HOST=localhost
DB_USER=backend_user
DB_PASSWORD=secure_password
DB_NAME=my_backend_db

# JWT
JWT_SECRET=your_super_secret_key_change_this

# API
API_URL=https://api.example.com
FRONTEND_URL=https://example.com

# Third Party Services
SENDGRID_API_KEY=your_sendgrid_key
AWS_ACCESS_KEY_ID=your_aws_key
```

### Never Commit .env

```bash
# Add to .gitignore
.env
.env.local
.env.*.local
```

---

## Deploying to Heroku

### Setup

```bash
# Install Heroku CLI
# Create account on heroku.com

# Login
heroku login

# Create app
heroku create my-backend-app

# Add MongoDB Atlas URI
heroku config:set MONGODB_URI=mongodb+srv://...
```

### Procfile

Create `Procfile` in root directory:

```
web: node server.js
```

### Deploy

```bash
# Push to Heroku
git push heroku main

# View logs
heroku logs --tail

# Access app
https://my-backend-app.herokuapp.com
```

---

## Deploying to DigitalOcean

### VPS Setup

```bash
# SSH into droplet
ssh root@your_droplet_ip

# Update system
apt-get update
apt-get upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
apt-get install -y nodejs

# Install npm packages
npm install -g pm2 nginx
```

### Setup PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start app with PM2
pm2 start server.js --name "backend-app"

# Save PM2 config
pm2 save

# Startup on reboot
pm2 startup
```

### Configure Nginx (Reverse Proxy)

Create `/etc/nginx/sites-available/backend`:

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/

# Test nginx
nginx -t

# Restart nginx
systemctl restart nginx

# Install SSL (Let's Encrypt)
apt-get install certbot python3-certbot-nginx
certbot --nginx -d api.example.com
```

---

## Production Best Practices

### 1. Security

```javascript
const helmet = require("helmet");
const cors = require("cors");

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);
```

### 2. Logging

```javascript
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    timestamp: new Date(),
  });
  next();
});
```

### 3. Monitoring

```javascript
// Use services like:
// - New Relic
// - Datadog
// - Sentry (error tracking)

const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your_sentry_dsn" });
app.use(Sentry.Handlers.errorHandler());
```

---

## Database Deployment

### MongoDB Atlas (Cloud)

```bash
# Create cluster at mongodb.com/cloud/atlas
# Get connection string
# Add to .env: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### PostgreSQL on Cloud

```bash
# Use:
# - AWS RDS
# - DigitalOcean Managed Database
# - Heroku Postgres
# - Railway

# Get connection string and add to .env
```

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "16"
      - run: npm ci
      - run: npm test
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: my-backend-app
          heroku_email: your-email@example.com
```

---

## Monitoring After Deployment

### Key Metrics to Monitor

- **Response Time** - API latency
- **Error Rate** - 4xx and 5xx errors
- **CPU Usage** - Server load
- **Memory Usage** - RAM consumption
- **Database Queries** - Slow queries
- **Uptime** - Service availability

### Uptime Monitoring

```javascript
// Use: UptimeRobot, Pingdom, or StatusPage
// Set alerts for downtime
```

---

## Troubleshooting

### Common Issues

| Issue                     | Solution                                   |
| ------------------------- | ------------------------------------------ |
| 500 errors                | Check logs, verify env vars                |
| Database connection fails | Check connection string, firewall          |
| High latency              | Optimize queries, add caching              |
| Memory leaks              | Check for event listeners, clear intervals |
| CORS errors               | Check CORS configuration                   |

---

## Summary

✓ Use environment variables
✓ Choose appropriate platform
✓ Implement security measures
✓ Set up monitoring
✓ Use CI/CD for automation
✓ Monitor performance

---

## Deployment Checklist

```
Pre-Deployment:
☐ All tests pass
☐ Environment variables configured
☐ Database ready
☐ Security middleware in place

Deployment:
☐ Deploy to staging first
☐ Test in staging environment
☐ Deploy to production
☐ Verify deployment

Post-Deployment:
☐ Monitor logs
☐ Check error rates
☐ Monitor performance metrics
☐ Set up alerts
☐ Keep backups
```

---

**Congratulations! Your backend is now in production! 🚀**
