# Task Manager – Backend API

REST API for the **Full-Stack Task Manager App**, built with Node.js, Express, MongoDB Atlas (Mongoose) and JWT authentication.

## Features

- User registration and login with hashed passwords (bcryptjs)
- JWT authentication via `Authorization: Bearer <token>`
- Full task CRUD, scoped so each user can only access their own tasks
- Input validation, consistent JSON error responses, invalid ObjectId handling
- CORS configured through environment variables

## Tech Stack

Node.js · Express.js · MongoDB Atlas · Mongoose · JWT · bcryptjs · dotenv · cors

## Prerequisites

- Node.js 18 or newer
- A MongoDB Atlas account (free tier is enough)

## Installation

```bash
cd backend
npm install
cp .env.example .env     # Windows (cmd): copy .env.example .env
```

Then edit `.env` with your own values.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/task-manager?retryWrites=true&w=majority` |
| `JWT_SECRET` | Long random string used to sign tokens | *(see below)* |
| `CLIENT_URL` | Frontend origin(s) allowed by CORS (comma-separated for several) | `http://localhost:5173` |
| `JWT_EXPIRES_IN` | *(optional)* Token lifetime, default `7d` | `7d` |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> Never commit `.env`. It is already listed in `.gitignore`.

## MongoDB Atlas Setup

1. Sign in at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free **M0** cluster.
2. Go to **Database Access** → **Add New Database User**. Choose a username and password (avoid special characters, or URL-encode them).
3. Go to **Network Access** → **Add IP Address**. Add your current IP, or `0.0.0.0/0` for development only.
4. Go to **Database** → **Connect** → **Drivers** and copy the connection string.
5. Replace `<password>` with your user's password and add the database name (e.g. `/task-manager`) before the `?`.
6. Paste the final string into `MONGO_URI` in your `.env` file.

Collections (`users`, `tasks`) are created automatically on first use.

## Running the Server

```bash
npm run dev      # development with nodemon (auto-restart)
npm start        # production
```

Check it works: <http://localhost:5000/api/health>

## Authentication

1. Register or log in to receive a JWT.
2. Send the token on every protected request:

```
Authorization: Bearer <your_token>
```

Missing, malformed, invalid or expired tokens return `401 Unauthorized`.

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | API status check |

```json
{ "success": true, "message": "API is running" }
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in, receive JWT |
| GET | `/api/auth/me` | Yes | Get the current user |

**Register** – `POST /api/auth/register`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "createdAt": "..." }
}
```

**Login** – `POST /api/auth/login`

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

Returns `200` with `token` and `user`, or `401` for invalid credentials.

### Tasks (all require a JWT)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List your tasks (optional `?completed=true` or `false`) |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get one task |
| PUT | `/api/tasks/:id` | Update `title`, `description`, `completed` |
| DELETE | `/api/tasks/:id` | Delete a task |

**Create** – `POST /api/tasks`

```json
{
  "title": "Complete MERN project",
  "description": "Finish internship project"
}
```

**Update** – `PUT /api/tasks/:id` (send any subset of the fields)

```json
{
  "title": "Complete MERN project",
  "description": "Finish backend and frontend",
  "completed": true
}
```

Tasks that belong to another user are never exposed: requesting them returns `404 Task not found`.

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Resource created |
| 400 | Validation error / invalid ObjectId / malformed JSON |
| 401 | Missing, invalid or expired token; wrong credentials |
| 404 | Resource or route not found |
| 409 | Email already registered |
| 500 | Server error |

## Error Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Title is required and must be a non-empty string"]
}
```

## Quick Test with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'

# Create a task (replace TOKEN)
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Complete MERN project","description":"Finish internship project"}'

# List tasks
curl http://localhost:5000/api/tasks -H "Authorization: Bearer TOKEN"
```

## Project Structure

```
backend/
├── config/db.js
├── controllers/        # authController.js, taskController.js
├── middleware/         # authMiddleware.js, errorMiddleware.js
├── models/             # User.js, Task.js
├── routes/             # authRoutes.js, taskRoutes.js
├── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Security Notes

- Passwords are hashed with bcryptjs and never returned in responses (`select: false` plus a `toJSON` transform).
- Request bodies are type-checked, and only whitelisted fields are written to the database.
- Request body size is limited to 10 KB.
- Use a long, random `JWT_SECRET` and restrict Atlas network access before deploying.
