# Render.com Deployment Guide

## Quick Fix: JWT_SECRET Error

If you see this error:
```
{"timestamp":"...","level":"error","message":"JWT_SECRET environment variable is required"}
```

**Solution:** Set the `JWT_SECRET` environment variable in Render.com.

## Step-by-Step: Setting Environment Variables in Render

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Click on your backend service

2. **Open Environment Tab**
   - Click on "Environment" in the left sidebar
   - Or go to: Settings → Environment

3. **Add Required Variables**

   Click "Add Environment Variable" for each:

   | Variable | Value | Example |
   |----------|-------|---------|
   | `JWT_SECRET` | Strong random string (32+ chars) | `a1b2c3d4e5f6...` (see generation below) |
   | `NODE_ENV` | `production` | `production` |
   | `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
   | `ALLOWED_ORIGINS` | Your frontend URL(s) | `https://yourdomain.com,https://www.yourdomain.com` |
   | `PORT` | (Optional - Render sets this) | `10000` |

4. **Generate JWT_SECRET**

   Run this command locally to generate a secure secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Or use an online generator: https://randomkeygen.com/

5. **Save and Redeploy**
   - Click "Save Changes"
   - Render will automatically redeploy your service
   - Check the logs to verify it starts successfully

## Required Environment Variables Checklist

- [ ] `JWT_SECRET` - **REQUIRED** (32+ character random string)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `ALLOWED_ORIGINS` - Your frontend domain(s)
- [ ] `PORT` - Usually auto-set by Render

## Verification

After setting variables, check the logs. You should see:
```
{"timestamp":"...","level":"info","message":"Q Healthcare API running on port ..."}
{"timestamp":"...","level":"info","message":"WebSocket server ready for real-time updates"}
```

If you still see the JWT_SECRET error:
1. Verify the variable name is exactly `JWT_SECRET` (case-sensitive)
2. Make sure there are no extra spaces in the value
3. Check that you saved the changes
4. Wait for the redeploy to complete

## Frontend Environment Variables

For your frontend service on Render, set:
- `VITE_API_URL` - Your backend API URL (e.g., `https://your-backend.onrender.com`)

## Troubleshooting

### Backend won't start
- ✅ Check all required environment variables are set
- ✅ Verify `JWT_SECRET` is at least 32 characters
- ✅ Check Render logs for other errors

### CORS errors
- ✅ Set `ALLOWED_ORIGINS` with your exact frontend URL
- ✅ Include protocol (`https://`)
- ✅ No trailing slashes

### Database connection errors
- ✅ Verify `DATABASE_URL` format is correct
- ✅ Check database is accessible from Render
- ✅ Ensure database credentials are correct

