# Full-Stack Task Manager (MERN)

A task management app where users can register, log in and manage their daily tasks.
Built with **MongoDB Atlas, Express, React (Vite) and Node.js**, secured with **JWT authentication**.

- **Live frontend:** `https://YOUR-APP.vercel.app`
- **Live backend API:** `https://YOUR-API.onrender.com`

## Features

- Register / login with bcrypt-hashed passwords and JWT tokens
- Protected API routes and protected React routes
- Each user sees only their own tasks
- Create, read, update and delete tasks
- Task **priority** (low / medium / high) and **status** (to do / in progress / completed), optional due date
- Search, status filter, stats summary, overdue highlight
- Loading, empty and error states; responsive UI

## Tech Stack

| Layer      | Technology                                         |
| ---------- | -------------------------------------------------- |
| Frontend   | React 18, Vite, React Router v6, Axios             |
| Backend    | Node.js, Express, Mongoose, bcryptjs, jsonwebtoken |
| Database   | MongoDB Atlas                                      |
| Deployment | Vercel (frontend), Render (backend)                |

## Project Structure

```
task-manager/
├── backend/
│   ├── config/db.js
│   ├── controllers/      authController.js, taskController.js
│   ├── middleware/       auth.js, errorHandler.js
│   ├── models/           User.js, Task.js
│   ├── routes/           authRoutes.js, taskRoutes.js
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   Navbar, ProtectedRoute, TaskForm, TaskItem, Loader
│   │   ├── context/      AuthContext.jsx
│   │   ├── pages/        Login, Register, Dashboard
│   │   ├── services/     api.js
│   │   ├── App.jsx, main.jsx, index.css
│   ├── vercel.json
│   └── .env.example
└── README.md
```

## Run Locally

**Prerequisites:** Node.js 18+, a free MongoDB Atlas cluster.

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run dev               # http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## Environment Variables

**backend/.env**

| Variable       | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| PORT           | Server port (Render sets this automatically)                  |
| MONGO_URI      | MongoDB Atlas connection string                               |
| JWT_SECRET     | Long random secret used to sign tokens                        |
| JWT_EXPIRES_IN | Token lifetime, e.g. `7d`                                     |
| CLIENT_URL     | Allowed frontend origin(s), comma-separated, no trailing `/`  |

**frontend/.env**

| Variable     | Description                                         |
| ------------ | --------------------------------------------------- |
| VITE_API_URL | Backend base URL ending in `/api`                   |

## API Reference

Base URL: `/api`. Protected routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint         | Auth | Description                                   |
| ------ | ---------------- | ---- | --------------------------------------------- |
| POST   | /auth/register   | No   | Create account `{name, email, password}`      |
| POST   | /auth/login      | No   | Login `{email, password}` → `{token, user}`   |
| GET    | /auth/me         | Yes  | Current user                                  |
| GET    | /tasks           | Yes  | List your tasks (`?status=&priority=&search=`) |
| POST   | /tasks           | Yes  | Create task                                   |
| GET    | /tasks/:id       | Yes  | Get one task                                  |
| PUT    | /tasks/:id       | Yes  | Update task                                   |
| DELETE | /tasks/:id       | Yes  | Delete task                                   |

Task body: `{ title, description?, status?: "todo|in-progress|completed", priority?: "low|medium|high", dueDate? }`

## Deployment

### 1. MongoDB Atlas
1. Create a free **M0** cluster → **Database Access**: create a user with a password.
2. **Network Access** → add IP `0.0.0.0/0` (needed for Render).
3. **Connect → Drivers** → copy the connection string, replace `<password>`, and add the database name `taskmanager` before the `?`.

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: MERN task manager"
git branch -M main
git remote add origin https://github.com/<you>/task-manager.git
git push -u origin main
```
Make sure `.env` is **not** committed (it is in `.gitignore`).

### 3. Backend on Render
1. Render → **New → Web Service** → connect your GitHub repo.
2. **Root Directory:** `backend` · **Build Command:** `npm install` · **Start Command:** `npm start`
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `CLIENT_URL` (set after step 4).
4. Deploy and test: open `https://YOUR-API.onrender.com/api/health` → `{"status":"ok"}`.

> Free Render services sleep after inactivity; the first request may take ~30–60 seconds.

### 4. Frontend on Vercel
1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** `frontend` · Framework preset: **Vite**.
3. Add environment variable `VITE_API_URL=https://YOUR-API.onrender.com/api`.
4. Deploy, copy the Vercel URL.

### 5. Connect them (CORS)
Go back to Render → Environment → set `CLIENT_URL=https://YOUR-APP.vercel.app` (no trailing slash) → save (it redeploys).

## Security Notes

- Passwords hashed with bcrypt (10 salt rounds); the password field is never returned by queries
- JWT verified on every protected request; tasks are always queried with the logged-in user's id
- Only whitelisted task fields are accepted; request body size is limited
- CORS restricted to configured frontend origins
- Secrets live only in environment variables

## Biggest Challenge I Solved

_Write 3–5 lines in your own words here. Example: "Getting CORS and environment variables right between Vercel and Render, so the deployed frontend could talk to the deployed API. I fixed it by setting CLIENT_URL on Render and VITE_API_URL on Vercel."_

## Submission Checklist

- [ ] Public GitHub repo with clean, meaningful commits and this README
- [ ] Live frontend URL (Vercel) works: register, login, add / edit / complete / delete task
- [ ] Live backend URL (Render) responds at `/api/health`
- [ ] `.env` files are not in GitHub; `.env.example` files are
- [ ] README has your real live URLs filled in
- [ ] 3–5 line note on your biggest challenge written
