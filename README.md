# Q - Healthcare Queue & Triage Companion

An AI-powered dynamic queue and triage management system designed to streamline patient flow in healthcare settings.

## Features

- **Patient Check-In**: Easy patient registration and triage level assignment
- **Real-Time Queue Management**: Dynamic queue with priority-based ordering
- **Staff Dashboard**: Monitor queue status, assign staff, and track patient flow
- **Patient Status Tracking**: Real-time wait time updates and status notifications
- **Triage System**: Four-level triage (Immediate, Urgent, Semi-Urgent, Non-Urgent)
- **Priority Scoring**: Intelligent priority calculation based on triage level and wait time

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- WebSocket (for real-time updates)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up PostgreSQL database:**
   ```bash
   createdb q_healthcare
   ```

3. **Configure backend environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database connection string
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API on `http://localhost:3001`
   - Frontend on `http://localhost:5173`

### Database Setup

The database schema will be automatically created when you start the backend server. Default staff members will be seeded:
- Dr. Sarah Chen (Physician)
- Dr. Michael Torres (Physician)
- Nurse Emily Johnson
- Nurse James Wilson

## Project Structure

```
Q/
├── backend/
│   ├── src/
│   │   ├── db/          # Database connection and schema
│   │   ├── routes/      # API routes
│   │   └── index.ts     # Express server setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── App.tsx      # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient

### Queue
- `GET /api/queue` - Get queue (optional ?status= filter)
- `GET /api/queue/stats` - Get queue statistics
- `POST /api/queue/check-in` - Check in patient
- `PUT /api/queue/:id` - Update queue entry
- `POST /api/queue/:id/complete` - Complete queue entry
- `GET /api/queue/patient/:patientId` - Get patient's queue status

### Staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/available` - Get available staff
- `PUT /api/staff/:id/availability` - Update staff availability

## Usage

1. **Check In a Patient:**
   - Navigate to "Check In" in the menu
   - Fill in patient information
   - Select triage level
   - Complete check-in

2. **View Queue:**
   - Navigate to "Queue" to see all patients
   - Filter by status (All, Waiting, In Progress)
   - Assign staff members to patients
   - Mark visits as complete

3. **Monitor Dashboard:**
   - View real-time statistics
   - Monitor wait times and queue status

4. **Patient Status:**
   - Patients can view their status at `/status/:patientId`
   - Real-time updates every 5 seconds

## Design Philosophy

The UI uses warm, welcoming colors suitable for healthcare environments:
- Primary: Soft teal (#4A90A4)
- Secondary: Warm beige (#E8D5B7)
- Accent: Warm tan (#D4A574)
- Background: Soft white (#FEFCF9)

## Future Enhancements

- AI-powered wait time prediction using Llama
- SMS notifications for patients
- Integration with EHR systems
- Advanced analytics and reporting
- Multi-location support
- Mobile app

## License

MIT
