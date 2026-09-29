# Student Placement Tracker

A full-stack web application designed to help students manage and track their job and internship applications throughout the placement process.

## Features

- User registration and login
- JWT-based authentication
- Add, edit and delete placement applications
- Track application status
- Track job type and location
- Interview date tracking
- Upcoming interview reminders
- Advanced search and filtering
- Application sorting
- Interactive placement statistics
- Application status charts
- Job type analytics
- Company-wise application analytics
- Six-month application trend
- Interview calendar
- CSV export
- PDF export
- User profile
- Placement progress tracking
- Change password
- Dark and light mode
- Responsive user interface

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Recharts
- jsPDF

### Backend
- Node.js
- Express.js
- JWT
- bcryptjs
- CORS

### Database
- MySQL
- mysql2

### Development Tools
- Git
- GitHub
- Visual Studio Code

## Project Structure

```text
student-placement-tracker/
│
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── AuthPage.jsx
│   ├── Auth.css
│   ├── profile.jsx
│   ├── profile.css
│   └── main.jsx
│
├── public/
│
├── Student-Placement-Tracker/
│   └── backend/
│       ├── server.js
│       ├── package.json
│       ├── package-lock.json
│       └── .env.example
│
├── package.json
├── package-lock.json
├── .gitignore
└── README.md

## Application Architecture

```text
React Frontend
      │
      │ REST API
      ▼
Node.js + Express Backend
      │
      │ mysql2
      ▼
MySQL Database

Database

The application uses MySQL with the following main tables:

users
applications

The applications table is associated with users so each authenticated user can access only their own placement applications.

Getting Started
1. Clone the repository
git clone https://github.com/harinadh26/student-placement-tracker.git
cd student-placement-tracker
2. Install frontend dependencies
npm install
3. Install backend dependencies
cd Student-Placement-Tracker/backend
npm install
4. Configure environment variables

Create a .env file inside the backend folder.

Use .env.example as a template:
PORT=5000

DB_HOST=localhost
DB_USER=placement_user
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=student_placement_tracker

JWT_SECRET=YOUR_JWT_SECRET

CLIENT_URL=http://localhost:5173

Do not commit the .env file to GitHub.

5. Start the backend

From the backend folder:

npm start

The backend runs on:

http://localhost:5000
6. Start the frontend

Open another terminal and go to the project root:

cd student-placement-tracker
npm run dev

The frontend runs on:

http://localhost:5173

Authentication

The application uses:

JWT for authentication
bcryptjs for password hashing
Protected application APIs
User-specific application data

Users can:

Register an account
Login securely
Manage their applications
Change their password
Logout
Application Statuses
The application supports:

Applied
Online Assessment
Interview
Selected
Rejected
Job Types
Full Time
Internship
Contract
Analytics
The dashboard provides visual analytics for:

Application status
Job type
Companies
Application trends
Interview activity
Selection success rate
Export

Application data can be exported as:

CSV
PDF
Security
Sensitive configuration is stored using environment variables.

The repository excludes:

.env
node_modules
Build files
Log files

A .env.example file is provided so developers can configure their own environment.

Future Enhancements
Email notifications for interviews
Job recommendation system
Resume upload and management
AI-powered resume analysis
Placement prediction analytics
Company research integration
Cloud deployment
Admin dashboard
Automated interview reminders

Author

Harinadh Valaboju

GitHub:
https://github.com/harinadh26



### Important

There is one correction I recommend **before saving**: your actual folder structure from PowerShell showed that the backend is inside:

```text
frontend/
└── Student-Placement-Tracker/
    └── backend/
while the React frontend is directly inside frontend/.