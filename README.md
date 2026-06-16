Mini HCM Time Tracking
A lightweight Human Capital Management (HCM) time-in/time-out system built with free and open-source tools.

The system records employee punches for a 1-week attendance tracking activity, computes worked hours, overtime, night differential, lateness, undertime, and stores daily attendance summaries.

Tech Stack
Frontend: React.js
Backend: Node.js + Express
Authentication: Firebase Authentication
Database: Cloud Firestore
Frontend Hosting: Firebase Hosting
Backend Hosting: Render, Vercel, Heroku, Railway, or another Node.js hosting platform
Core Features
1. User Registration and Authentication
Use Firebase Authentication with email and password.
Allow employees to register and log in.
Store user details in Firestore.
Each user document should include:

{
  name: "John Doe",
  email: "john@example.com",
  role: "employee", // employee | admin
  timezone: "Asia/Manila",
  schedule: {
    start: "09:00",
    end: "18:00"
  },
  createdAt: timestamp
}
The schedule field is used to compute lateness, undertime, regular hours, and overtime.

2. Time-In and Time-Out Logging
Build a React interface with Punch In and Punch Out buttons.
Save punches to Firestore under an attendance collection.
Each punch record must include the employee user ID and timestamps.
Example attendance document:

{
  userId: "firebaseUserId",
  date: "2026-06-16",
  punchIn: timestamp,
  punchOut: timestamp,
  editedByAdmin: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
3. Computation of Hours
Implement the computation logic in the backend using Node.js and Express.

The backend should calculate:

Regular hours: worked time inside the scheduled shift
Overtime: worked time beyond the scheduled shift end
Night differential: worked time between 22:00 and 06:00
Late minutes: arrival after the scheduled shift start
Undertime minutes: leaving before the scheduled shift end
Example:

Schedule: 09:00 - 18:00
Punch In: 09:15
Punch Out: 19:30

Late: 15 minutes
Regular Hours: 8.75
Overtime Hours: 1.5
Undertime: 0 minutes
Night Differential: 0 hours
4. Daily Summary
Store computed daily totals in a dailySummary collection.

Example daily summary document:

{
  userId: "firebaseUserId",
  date: "2026-06-16",
  regularHours: 8,
  overtimeHours: 1.5,
  nightDiffHours: 0,
  lateMinutes: 15,
  undertimeMinutes: 0,
  totalWorkedHours: 9.5,
  computedAt: timestamp
}
The React dashboard should display:

Daily regular hours
Overtime hours
Night differential hours
Late minutes
Undertime minutes
Total worked hours
5. History Table
Employees should be able to view their attendance history.

The history table should show:

Date
Punch in time
Punch out time
Regular hours
Overtime
Night differential
Late
Undertime
6. Admin Tools
Admin users should be able to:

View all employee attendance records
Edit punch in and punch out times
Recompute daily summaries after editing punches
View daily reports for all employees
View weekly reports for all employees
Admin reports should include:

Employee name
Date or week range
Regular hours
Overtime hours
Night differential hours
Late minutes
Undertime minutes
Total worked hours
Expected Output
A working mini HCM system that demonstrates:

Registration and login flow
Time-in and time-out recording
Firestore attendance records
Backend computation of regular hours, overtime, night differential, late minutes, and undertime
Daily summary dashboard with KPI cards
Attendance history table
Admin attendance management
Admin daily and weekly reports