# Task Manager – Frontend

React + Vite frontend for the Full-Stack Task Manager (MERN).

## Setup

1. Make sure the backend is running on http://localhost:5000
2. Install and run:

   npm install
   cp .env.example .env
   npm run dev

3. Open http://localhost:5173

## Environment

VITE_API_URL=http://localhost:5000/api

## Features

- Register / Login with JWT (from the existing backend)
- Protected /dashboard route
- Task CRUD (create, read, edit, delete, complete / mark pending)
- Loading, error, empty and success states
- Responsive layout (plain CSS)

## Scripts

- npm run dev – start dev server
- npm run build – production build
- npm run preview – preview production build
