# Employee Workload Portal

Stella Maris College styled employee workload tracker built with:

- Frontend: React, Vite, Tailwind CSS, Zustand
- Backend: NestJS, Prisma
- Auth: JWT with first-login password change

This project supports the same dynamic concept as your earlier hosted admin-driven app:

- admin actions save to the database
- frontend reads live backend data
- updates reflect for users without changing code

## Features

- Employee master with employee ID, designation, employee name, department, and DOB
- Employee login using employee ID and DOB (`DD-MM-YYYY`) as the default first password
- Forced password change after first login
- Daily workload entry with:
  - date picker
  - work type
  - work description
  - work shared by team
  - detailed description
  - status dropdown
  - custom status text when `Other` is selected
- Printable report page in the requested institutional format

## Project structure

- `frontend/` React application
- `backend/` NestJS API

## Setup

This project is isolated from any existing database on your machine.
For local development it uses its own Prisma SQLite database file inside the project.

1. Install dependencies:

```bash
npm install
```

2. Copy backend environment:

```bash
copy backend\.env.example backend\.env
```

3. Run Prisma setup:

```bash
npx prisma generate --schema backend/prisma/schema.prisma
npx prisma db push --schema backend/prisma/schema.prisma
```

4. Seed a starter admin and sample employee:

```bash
npm run prisma:seed --workspace backend
```

5. Start the apps:

```bash
npm run dev:backend
npm run dev:frontend
```

## Dynamic Hosting Setup

To make this behave like your earlier live dynamic project, deploy it in three parts:

1. GitHub repository for source code
2. Hosted frontend for the React app
3. Hosted backend API with a hosted PostgreSQL database

### Recommended production stack

- GitHub: source code
- Frontend: Vercel or Netlify
- Backend: Render or Railway
- Database: Neon Postgres / Supabase Postgres / Railway Postgres

### Production environment files

- Backend production example: `backend/.env.production.example`
- Frontend example: `frontend/.env.example`

### Render backend deploy

This repo includes `render.yaml` for backend deployment.

Backend environment values you will set on the host:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `PORT`

### Frontend deploy

Set this in the frontend host:

```bash
VITE_API_URL=https://your-backend-domain.onrender.com
```

After that, the app works as a real dynamic system:

- employee master updates reflect live
- inactive users are blocked live
- workload entries and reports update live
- admin changes are reflected from database state

## Database Isolation

- Local database file: `backend/dev.db`
- This project does not need to connect to any existing college or personal database
- This makes the app portable for GitHub source control and simple local startup

## GitHub Hosting Note

GitHub is excellent for:

- source code
- version control
- collaboration

GitHub alone does not host:

- NestJS backend APIs
- server-side databases

If you specifically want a GitHub domain style URL, the frontend can be published from GitHub Pages, but the backend and production database still need separate hosting.

## Default seeded accounts

- Admin
  - username: `admin`
  - password: `Admin@123`
- Employee
  - employee ID: `EMP001`
  - password: `14-04-1995`

## Branding asset

The project now uses the Stella Maris logo asset at:

- `frontend/public/logo.webp`

You can replace that file later with a higher-resolution official version if needed.
