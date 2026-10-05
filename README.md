# Task Manager

A full-stack task management web app where users can sign up, log in, and manage their own personal to-do list. Built with the MERN stack (MongoDB, Express, React, Node.js) and secured with JWT authentication.

## Features

- User registration and login with JWT authentication
- Passwords hashed with bcryptjs (never stored or returned in plain text)
- Protected dashboard: logged-out users are redirected to the login page
- Session survives page refresh (token is verified with the backend on load)
- Create, view, edit, complete / un-complete, and delete tasks
- Each user can only see and change their own tasks
- Form validation on both frontend and backend
- Loading, empty, success, and error states
- Responsive layout for desktop, tablet, and mobile

## Technologies Used

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, React Router, Axios, plain CSS |
| Backend | Node.js, Express, Mongoose, jsonwebtoken, bcryptjs, cors, dotenv |
| Database | MongoDB Atlas |
| Hosting (planned) | Render (API), Vercel (frontend) |

## Project Structure

```
task-manager/
├── .gitignore
├── README.md
├── backend/
│   ├── server.js            # App entry point, CORS, routes
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # User and Task schemas
│   ├── routes/              # Route definitions
│   ├── controllers/         # Request handlers (auth, tasks)
│   ├── middleware/          # JWT protection, error handling
│   └── .env.example
└── frontend/
    ├── vercel.json          # SPA routing for Vercel
    ├── .env.example
    └── src/
        ├── components/      # Navbar, TaskForm, TaskItem, TaskList, ProtectedRoute
        ├── pages/           # Login, Register, Dashboard
        ├── services/api.js  # Axios instance and API calls
        ├── context/         # AuthContext (login state)
        ├── App.jsx
        └── main.jsx
```

## Run Locally

**Prerequisites:** Node.js 18+, and a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 1. Clone

```bash
git clone https://github.com/Sanika1501/TaskManager.git
cd TaskManager
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env     # on Windows: copy .env.example .env
```

Open `backend/.env` and fill in your real values (see [Environment Variables](#environment-variables)), then:

```bash
npm run dev
```

The API runs at http://localhost:5000. Check http://localhost:5000/api/health.

### 3. Frontend (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm run dev
```

Open http://localhost:5173.

## Environment Variables

**`backend/.env`**

| Variable | Description |
| --- | --- |
| `PORT` | Port for the API (default `5000`; Render sets this automatically) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Frontend URL(s) allowed by CORS, comma-separated |
| `JWT_EXPIRES_IN` | Optional, default `7d` |

**`frontend/.env`**

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL, e.g. `http://localhost:5000/api` |

Real `.env` files are git-ignored. Only the `.env.example` files are committed.

## API Overview

All task routes require the header `Authorization: Bearer <JWT_TOKEN>`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Create an account |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | Yes | Get the logged-in user |
| GET | `/api/tasks` | Yes | List your tasks |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks/:id` | Yes | Get one of your tasks |
| PUT | `/api/tasks/:id` | Yes | Update title, description, or completed |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |
| GET | `/api/health` | No | Health check |

More detail and cURL examples are in [`backend/README.md`](backend/README.md).

## Screenshots

_Add screenshots here after running the app (for example: login page, dashboard with tasks, mobile view)._

<!--
![Login](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
-->

## Deployment

Planned setup: **MongoDB Atlas** (database), **Render** (backend), **Vercel** (frontend).

1. **Atlas:** create a database user, and under *Network Access* allow connections from Render (for a student project, `0.0.0.0/0`).
2. **Render:** new Web Service, root directory `backend`, build command `npm install`, start command `npm start`. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV=production`.
3. **Vercel:** import the repo with root directory `frontend` (framework: Vite). Set `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`.
4. Copy the final Vercel URL into `CLIENT_URL` on Render and redeploy the backend.

Note: on Render's free tier the API sleeps when idle, so the first request after a break can take around a minute.

## Known Limitations

- The JWT is stored in `localStorage`, which is simple but exposed if the site ever has an XSS bug. Httponly cookies are the safer production choice.
- No rate limiting on login attempts yet.
- No automated tests yet.

## Future Improvements

- Task due dates, priorities, and categories
- Search, filter, and sort on the dashboard
- Password reset by email
- Rate limiting and security headers (`express-rate-limit`, `helmet`)
- Automated tests (Jest and Supertest for the API, Vitest for the UI)
- Refresh tokens or httponly-cookie sessions
- Drag-and-drop task ordering

## License

MIT
