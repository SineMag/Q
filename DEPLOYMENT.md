# Q Healthcare - Deployment Guide

## Render.com Deployment

This project is configured for deployment on Render.com using the `render.yaml` file.

### Prerequisites

1. Fork this repository to your GitHub account
2. Create a Render.com account
3. Connect your GitHub account to Render

### Services Configuration

The `render.yaml` file defines:

- **Backend Service** (`q-backend`)

  - Node.js runtime
  - PostgreSQL database integration
  - Health check at `/health`
  - Auto-builds on push to main branch

- **Frontend Service** (`q-frontend`)

  - Static site deployment
  - SPA routing support
  - API proxy configuration

- **Database** (`q-db`)
  - PostgreSQL free tier
  - Automatic connection string injection

### Environment Variables

Backend automatically receives:

- `DATABASE_URL` from Render database
- `PORT` set to 10000 (Render's default)
- `NODE_ENV` set to production
- `CORS_ORIGIN` set to frontend URL

### Deployment Steps

1. **Create Render Web Service**

   - Go to Render dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

2. **Database Setup**

   - Render will create PostgreSQL database automatically
   - Database schema is initialized on first deployment

3. **Verify Deployment**
   - Backend health check: `https://q-backend.onrender.com/health
   - Frontend application: `https://q-frontend.onrender.com`

### Local Development

```bash
 dashboard
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Troubleshooting

1. **Build Failures**

   - Check Node.js version (requires >=18.0.0)

2. **Database Connection**

   - Verify DATABASE_URL is correctly injected
   - Check database schema initialization

3. **CORS Issues**

   - Ensure CORS_ORIGIN matches frontend URL
   - Check API proxy configuration

4. **Frontend Routing**
   - SPA routes are handled by rewrite rules
   - Verify API proxy is working

### Production Considerations

- Database migrations run automatically
- Health checks ensure service availability
- Zero-downtime deployments
- Automatic SSL certificates
- Built-in monitoring and logging

For more information, visit [Render.com documentation](https://render.com/docs).
