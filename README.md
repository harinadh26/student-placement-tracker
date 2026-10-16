# Student Placement Tracker

A full-stack web application that helps students organize job and internship applications, monitor their placement progress, and manage upcoming interviews in one place.

**Live Demo:** [Student Placement Tracker](https://student-placement-tracker-mauve-zeta.vercel.app)

**Backend API:** [Render API](https://student-placement-tracker-3fmy.onrender.com)

**Source Code:** [GitHub Repository](https://github.com/harinadh26/student-placement-tracker)

## Overview

Managing multiple job applications can become difficult during placement season. The Student Placement Tracker provides a centralized dashboard to record applications, update their status, track interviews, and review placement statistics.

The project demonstrates full-stack development using React, Node.js, Express, and MySQL, including authentication, REST API integration, database operations, and cloud deployment.

## Features

- **Authentication:** User registration and login with JWT-based authentication.
- **Application Management:** Add, view, edit, and delete job or internship applications.
- **Application Tracking:** Track statuses such as Applied, Online Assessment, Interview, Selected, and Rejected.
- **Interview Tracking:** Record interview dates and review upcoming interviews.
- **Search and Filtering:** Find applications and organize them using available filters and sorting.
- **Analytics Dashboard:** Visualize application statistics, status distribution, job types, company-wise data, and application trends.
- **Calendar:** Review scheduled interviews using the interview calendar.
- **Data Export:** Export application data to CSV and PDF.
- **Profile Management:** Manage profile information and change your password.
- **Theme Support:** Switch between dark and light modes.
- **Responsive UI:** Use the application on desktop and mobile-sized screens.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite, CSS |
| Charts and Visualization | Recharts |
| PDF Export | jsPDF |
| Backend | Node.js, Express.js |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| Database | MySQL |
| Database Driver | mysql2 |
| Deployment | Vercel, Render |
| Database Hosting | Aiven |
| Version Control | Git, GitHub |

## Application Architecture

```text
User
 |
 v
React + Vite Frontend
(Vercel)
 |
 | HTTP requests / REST API
 v
Node.js + Express Backend
(Render)
 |
 | mysql2 + SSL connection
 v
MySQL Database
(Aiven)
```

The frontend communicates with the backend through API requests. The backend handles authentication, application operations, and database communication. Application records are associated with authenticated users.

## Project Structure

```text
student-placement-tracker/
│
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── AuthPage.jsx
│   ├── Auth.css
│   ├── profile.jsx
│   ├── profile.css
│   └── main.jsx
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
├── vite.config.js
├── eslint.config.js
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project locally:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [Git](https://git-scm.com/)
- A MySQL database that you can access

### 1. Clone the repository

```bash
git clone https://github.com/harinadh26/student-placement-tracker.git
cd student-placement-tracker
```

### 2. Install frontend dependencies

From the project root:

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd Student-Placement-Tracker/backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside `Student-Placement-Tracker/backend/`. Use `.env.example` as a reference if it is available.

Configure the following variables with your own database credentials and secrets:

```env
PORT=5000

DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

DB_SSL=false
DB_SSL_CA=

JWT_SECRET=your_long_random_secret

CLIENT_URL=http://localhost:5173
```

**Database configuration notes:**

- The example uses a local MySQL connection. If your database requires SSL, configure `DB_SSL=true` and provide the appropriate CA certificate path using `DB_SSL_CA`.
- Make sure your database and required tables are initialized before testing the application.
- Use a strong, unique JWT secret.
- Never commit `.env` files, database passwords, JWT secrets, or private certificates to GitHub.

### 5. Start the backend

From `Student-Placement-Tracker/backend/`:

```bash
npm start
```

The local backend should run at:

`http://localhost:5000`

You can check the API's root endpoint in your browser.

### 6. Configure and start the frontend

Open a second terminal at the project root.

Create a `.env` file in the root directory with the following frontend variable:

```env
VITE_API_URL=http://localhost:5000
```

Then start the frontend:

```bash
npm run dev
```

Open:

`http://localhost:5173`

> Restart the Vite development server after changing frontend environment variables.

## Deployment

The application is deployed using the following services:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Aiven MySQL

The frontend uses `VITE_API_URL` to identify the backend API. The backend uses environment variables for database configuration, authentication secrets, and the allowed frontend origin.

For a production deployment:

1. Configure the backend environment variables in Render.
2. Configure the MySQL SSL certificate securely if required.
3. Set `CLIENT_URL` to the deployed frontend's exact origin.
4. Set `VITE_API_URL` in Vercel to the deployed backend URL.
5. Redeploy the relevant service after changing environment variables.
6. Test registration, login, application operations, and data export on the live website.

## Security

Security considerations in this project include:

- JWT-based authentication.
- Password hashing with bcryptjs.
- Protected application endpoints.
- User-specific application data.
- Environment-based configuration for sensitive values.
- SSL verification for the hosted MySQL connection.

Do not expose credentials or private certificates in source code, screenshots, or public repositories.

## Future Enhancements

Potential improvements include:

- Automated email notifications for interviews.
- Job recommendations based on student preferences.
- Resume upload and management.
- AI-assisted resume analysis.
- Placement prediction analytics.
- Company research integration.
- An administration dashboard.

## Author

**Harinadh Valaboju**

- GitHub: [@harinadh26](https://github.com/harinadh26)
- Project: [Student Placement Tracker](https://github.com/harinadh26/student-placement-tracker)

---

If you find this project useful, consider giving the repository a ⭐ on GitHub.
