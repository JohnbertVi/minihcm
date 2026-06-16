# Setup

## Stack

- Frontend: Vite, React, React Router, Tailwind CSS, Axios, Firebase client SDK
- Backend: Node.js, Express, Firebase Admin SDK, Firestore, Luxon
- Auth: Firebase Authentication email/password
- Database: Cloud Firestore

## Local Run

1. Copy env examples:

```bash
cp front/.env.example front/.env
cp backend/.env.example backend/.env
```

2. Fill `front/.env` with your Firebase web app config.

3. Fill `backend/.env` with a Firebase Admin credential option:

- `FIREBASE_SERVICE_ACCOUNT_JSON`, or
- `GOOGLE_APPLICATION_CREDENTIALS`, or
- Application Default Credentials.

4. Start the backend:

```bash
npm --prefix backend run dev
```

5. Start the frontend:

```bash
npm --prefix front run dev
```

Backend health check: `http://localhost:5000/api/health`

Frontend: `http://localhost:5173`
