# Mini HCM Time Tracking

A lightweight Human Capital Management (HCM) Time-In/Time-Out system built with Firebase Authentication, Cloud Firestore, React, and Node.js/Express.

## Overview

This project records employee punch-in and punch-out activity, computes attendance metrics, and stores aggregated daily summaries.

## Activity Coverage

The system supports the required mini HCM features:

- User registration and login with Firebase Authentication email/password.
- Firestore user profiles with `name`, `email`, `role`, `timezone`, and `schedule`.
- Default employee schedule: `09:00` to `18:00`.
- Employee Punch In and Punch Out controls in React.
- Attendance records stored in Firestore under the `attendance` collection.
- Server-side attendance computation in Node.js/Express.
- Daily totals stored in the `dailySummary` collection.
- Employee dashboard and history views.
- Admin attendance tools for viewing and editing employee punches.
- Admin daily and weekly reports with full attendance metrics.

## Computed Metrics

The backend computes:

- Regular hours: work time within the scheduled shift.
- Overtime hours: work time beyond the scheduled shift end.
- Night differential hours: work time between 22:00 and 06:00.
- Late minutes: arrival after scheduled shift start.
- Undertime minutes: leaving before scheduled shift end.
- Total worked hours: full punch-in to punch-out duration.

## Expected Output

The finished application demonstrates:

- Registration and login flow.
- Time-in and time-out recording.
- Automatic computation of regular hours, overtime, night differential, lateness, and undertime.
- A daily employee dashboard with KPIs for regular hours, overtime, night differential, late time, and undertime.
- A running timer while an employee is clocked in.
- A history table showing punch records and computed daily breakdowns.
- Admin tools for reviewing and correcting punch records.
- Admin daily and weekly reports showing regular hours, OT, ND, late, undertime, and worked hours.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Backend | Node.js, Express |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting for React, with optional free-tier backend hosting such as Render, Vercel, or similar |

## Project Structure

```txt
hcm/
  backend/              Express API and Firebase Admin SDK
    src/
      config/           Firebase and environment setup
      controllers/      Auth, attendance, reports, and admin handlers
      middleware/       Auth and admin authorization guards
      routes/           API route definitions
      services/         Attendance persistence and time calculations
      scripts/          Utility scripts such as seed data
  front/                React SPA
    src/
      components/       Shared UI and layout components
      context/          Auth state provider
      hooks/            Reusable React hooks
      lib/              Firebase and utility setup
      pages/            Employee and admin pages
      routes/           Protected route wrappers
      services/         API and auth service clients
      utils/            Formatting and feedback helpers
```

## Main API Areas

- `POST /api/auth/profile` creates or updates the Firestore user profile.
- `POST /api/punch/in` creates an open attendance record.
- `POST /api/punch/out` closes the open attendance record and computes the daily summary.
- `GET /api/attendance/me` returns employee attendance history.
- `GET /api/summary/me/daily` returns the employee daily summary.
- `GET /api/summary/me/weekly` returns the employee weekly totals.
- `GET /api/admin/attendance` returns attendance records for admin review.
- `PATCH /api/admin/attendance/:id` updates a punch record and recomputes its summary.
- `GET /api/admin/reports/daily` returns daily admin reports.
- `GET /api/admin/reports/weekly` returns weekly admin reports.
- `GET /api/admin/users` returns registered user profiles for admin review.

## Getting Started

### 1. Install dependencies

```bash
npm --prefix backend install
npm --prefix front install
```

### 2. Configure environment variables

Create local environment files from the examples and fill in your Firebase credentials.

```bash
cp front/.env.example front/.env
cp backend/.env.example backend/.env
```

- `front/.env`: Firebase web app config using `VITE_FIREBASE_*` variables.
- `backend/.env`: Firebase Admin credential using `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`.

### 3. Run locally

```bash
# Terminal 1
npm --prefix backend run dev

# Terminal 2
npm --prefix front run dev
```

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

## Build

```bash
npm --prefix front run build
```

## Notes

- New users are created as employees by default.
- Admin access is controlled by the `role` field in the Firestore user profile.
- Attendance summaries are generated when a user punches out or when an admin edits a completed punch record.
