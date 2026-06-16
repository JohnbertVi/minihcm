# Mini Time Tracking

A lightweight Human Capital Management (HCM) time-in/time-out system built with free and open-source tools.

## Overview

This system records employee punches for attendance tracking, computes worked hours, overtime, night differential, lateness, undertime, and stores daily attendance summaries.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Backend | Node.js, Express |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |

## Core Features

- **Authentication** — email/password registration and login with role-based access (`employee` | `admin`).
- **Time Tracking** — punch in and punch out with backend computation.
- **Calculations** — regular hours, overtime, night differential, late minutes, and undertime minutes.
- **Dashboard** — daily and weekly KPI summaries for employees.
- **History** — personal attendance history table.
- **Admin Tools** — view/edit employee punches, recompute summaries, and view daily/weekly reports.

## Project Structure

```txt
hcm/
├── backend/          # Express API + Firebase Admin SDK
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       └── config/
└── front/            # React SPA
    └── src/
        ├── components/
        │   └── ui/   # shadcn/ui components
        ├── pages/
        ├── services/
        ├── hooks/
        ├── lib/
        └── context/
```

## Getting Started

### 1. Install dependencies

```bash
npm --prefix backend install
npm --prefix front install
```

### 2. Configure environment variables

Copy the example files and fill in your Firebase credentials.

```bash
cp front/.env.example front/.env
cp backend/.env.example backend/.env
```

- `front/.env` — Firebase web app config (`VITE_FIREBASE_*`).
- `backend/.env` — Firebase Admin credential (`FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`).

### 3. Run locally

```bash
# Terminal 1
npm --prefix backend run dev

# Terminal 2
npm --prefix front run dev
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health

## Build

```bash
npm --prefix front run build
```
