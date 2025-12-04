# Quick Setup Guide

## Prerequisites

1. **Install Node.js** (v18 or higher)
   - Download from https://nodejs.org/

2. **Install PostgreSQL** (v12 or higher)
   - Download from https://www.postgresql.org/download/
   - Or use Homebrew: `brew install postgresql` (Mac)
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

## Setup Steps

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for:
- Root project (concurrently for running both servers)
- Backend (Express, PostgreSQL, WebSocket, etc.)
- Frontend (React, Vite, TypeScript, etc.)

### 2. Create PostgreSQL Database

```bash
# Using psql
createdb q_healthcare

# Or using SQL
psql -U postgres
CREATE DATABASE q_healthcare;
```

### 3. Configure Backend Environment

```bash
cd backend
cp env.example .env
```

Edit `.env` and update the `DATABASE_URL` if needed:
```
DATABASE_URL=postgresql://localhost:5432/q_healthcare
```

If your PostgreSQL requires authentication:
```
DATABASE_URL=postgresql://username:password@localhost:5432/q_healthcare
```

### 4. Start Development Servers

From the root directory:

```bash
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173

The database schema will be automatically created when the backend starts.

## First Time Usage

1. Open http://localhost:5173 in your browser
2. Navigate to "Check In" to add your first patient
3. Go to "Queue" to see the patient in the queue
4. Assign a staff member to start the visit
5. View the "Dashboard" for real-time statistics

## Troubleshooting

### Database Connection Issues

- Make sure PostgreSQL is running: `pg_isready` or `psql -U postgres`
- Check your connection string in `backend/.env`
- Verify database exists: `psql -l | grep q_healthcare`

### Port Already in Use

- Backend port 3001: Change `PORT` in `backend/.env`
- Frontend port 5173: Change in `frontend/vite.config.ts`

### Module Not Found Errors

- Delete `node_modules` folders and reinstall:
  ```bash
  rm -rf node_modules backend/node_modules frontend/node_modules
  npm run install:all
  ```

## Next Steps

- Review the main [README.md](./README.md) for API documentation
- Check out the code structure in `backend/src` and `frontend/src`
- Customize colors and styling in `frontend/src/index.css`

