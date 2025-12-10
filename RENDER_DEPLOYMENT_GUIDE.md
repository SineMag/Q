# Fresh Render Deployment Guide

## Step 1: Clean Up Existing Services

1. Go to Render.com dashboard
2. Delete existing services:
   - q-backend service
   - q-frontend service
   - q-db database (if you want to start fresh)

## Step 2: Update Repository

Push all latest changes to GitHub:

```bash
git add .
git commit -m "Fix deployment configuration"
git push origin main
```

## Step 3: Create New Backend Service

1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. **Backend Configuration:**
   - Name: `q-backend`
   - Runtime: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: `Free`
   - Region: `Oregon`
   - Node Version: `18` (important!)

## Step 4: Create Database

1. Click "New" → "PostgreSQL"
2. Name: `q-db`
3. Database Name: `q_healthcare`
4. Instance Type: `Free`
5. Region: `Oregon`

## Step 5: Connect Database to Backend

1. Go to your backend service
2. Add Environment Variable:
   - Key: `DATABASE_URL`
   - Value: Connect to your `q-db` database
3. Add other env vars:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CORS_ORIGIN`: `https://your-frontend-url.onrender.com`

## Step 6: Create New Frontend Service

1. Click "New" → "Web Service"
2. Connect your GitHub repo
3. **Frontend Configuration:**
   - Name: `q-frontend`
   - Runtime: `Node`
   - Root Directory: `frontend`
   - Build Command: `npm install && npx vite build`
   - Start Command: `npx vite preview --port 10000 --host`
   - Instance Type: `Free`
   - Region: `Oregon`
   - Node Version: `18` (important!)

## Step 7: Frontend Environment Variables

Add to frontend service:

- `VITE_API_URL`: `https://your-backend-url.onrender.com`

## Step 8: Update CORS

Once you have the URLs, update:

1. Backend CORS_ORIGIN to your frontend URL
2. Frontend VITE_API_URL to your backend URL

## Step 9: Test

1. Backend health check: `https://your-backend.onrender.com/health`
2. Frontend: `https://your-frontend.onrender.com`

## Troubleshooting

- Check build logs for errors
- Verify environment variables
- Ensure database connection works
- Check CORS settings

## Important Notes

- Use Node.js 18 runtime
- Make sure package.json has correct scripts
- Database will auto-initialize schema
- First deployment may take 5-10 minutes
