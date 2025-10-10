# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: Railway PostgreSQL addon (recommended) or external database

## Step 1: Prepare Your Application

The following files have been created for Railway deployment:

- `Dockerfile` - Multi-stage build for both frontend and backend
- `railway.toml` - Railway configuration
- `.dockerignore` - Excludes unnecessary files from build
- `RAILWAY_DEPLOYMENT.md` - This guide

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**:
   ```bash
   # Required Variables
   DB_URL=postgresql://user:password@host:port/database
   JWT_ACCESS_SECRET=your-jwt-access-secret-here
   JWT_REFRESH_SECRET=your-jwt-refresh-secret-here
   
   # Google OAuth (if using)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URL=https://your-domain.up.railway.app/api/auth/google/callback
   
   # Application Configuration
   PORT=8080
   FRONTEND_ORIGIN=https://your-domain.up.railway.app
   COOKIE_DOMAIN=.up.railway.app
   COOKIE_SECURE=true
   ```

3. **Add PostgreSQL Database**:
   - In your Railway project dashboard
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Copy the connection string to `DB_URL`

### Option B: Deploy using Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

## Step 3: Database Migration

After deployment, run your database migrations:

1. **Connect to Railway shell**:
   ```bash
   railway shell
   ```

2. **Run migrations** (adjust path as needed):
   ```bash
   # If you have a migration script
   psql $DATABASE_URL -f migrations/0001_init.sql
   ```

## Step 4: Custom Domain (Optional)

1. Go to your Railway project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update environment variables:
   - `FRONTEND_ORIGIN=https://yourdomain.com`
   - `GOOGLE_REDIRECT_URL=https://yourdomain.com/api/auth/google/callback`

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | `random-secret-key-32-chars` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `different-random-secret-32-chars` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-app.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOC-secret-key` |
| `GOOGLE_REDIRECT_URL` | OAuth callback URL | `https://app.railway.app/api/auth/google/callback` |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | `https://app.railway.app` |
| `COOKIE_DOMAIN` | Cookie domain setting | `.railway.app` |
| `COOKIE_SECURE` | Use secure cookies | `true` |

## Troubleshooting

### Build Issues
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify Go modules are up to date

### Runtime Issues
- Check Railway deployment logs
- Verify environment variables are set
- Test database connectivity

### Frontend Issues
- Ensure static files are being served correctly
- Check CORS configuration
- Verify API endpoints are accessible

## Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Health Checks**: Automatic health monitoring at `/health`

## Scaling

Railway auto-scales based on:
- CPU usage
- Memory usage
- Request volume

You can also manually configure scaling in the project settings.

## Security Notes

1. **Environment Variables**: Never commit secrets to your repository
2. **HTTPS**: Railway provides HTTPS by default
3. **Database**: Use Railway PostgreSQL or secure external database
4. **Secrets**: Use Railway's secret management for sensitive data

## Cost Estimation

Railway pricing is based on:
- **Hobby Plan**: $5/month for small apps
- **Pro Plan**: Usage-based pricing
- **Database**: Additional cost for PostgreSQL addon

Check [Railway Pricing](https://railway.app/pricing) for current rates.
