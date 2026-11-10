# Skyinten — Full Stack (Frontend + Backend)

This repository contains the Skyinten frontend (React + Vite). The project also includes a paired backend server in the sibling `backend/` folder. This README provides clear, step-by-step instructions to install, configure and run both the frontend and backend locally for development and testing.

---

## Table of contents

- Prerequisites
- Project structure
- Environment variables
- Running the backend (local)
- Running the frontend (local)
- Running both for full-stack development
- Building frontend for production
- Troubleshooting
- Optional: run both with a single command

---

## Prerequisites

Before you begin make sure you have the following installed:

- Node.js (recommended v18+)
- npm (comes with Node; recommended v9+)
- (Optional for backend) MongoDB Community Edition or a hosted MongoDB (Atlas)

Check versions in PowerShell:

```powershell
node --version
npm --version
```

---

## Project structure (relevant folders)

- backend/   — Express API server, MongoDB connection, authentication controllers
- edutech-frontend/ — React + Vite frontend

---

## Environment variables (overview)

Frontend (Vite)
- File: `edutech-frontend/.env`
- Key: `VITE_BACKEND_URL` — base URL for the backend API (e.g. `http://localhost:4000`)

Backend
- File: `backend/.env`
- Required keys used by the backend in this project:
  - `JWT_SECRET` — secret used for signing JWT tokens
  - `SENDER_MAIL` — the from address used for automated emails
  - `SMTP_USER` and `SMTP_PASS` — SMTP credentials for sending mail
  - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` — if you use Razorpay payments

Example backend `.env`:

```env
JWT_SECRET=replace_this_with_a_strong_secret
SENDER_MAIL=your@example.com
SMTP_USER=smtp_user
SMTP_PASS=smtp_password
```

The backend connects to MongoDB at `mongodb://localhost:27017/Skyinten` by default (see `backend/config/Mongodb.js`). If you're using MongoDB Atlas, replace that connection string in the config or modify the backend to read a DB URL env var.

Note: `backend/config/nodemailer.js` currently uses `smtp-relay.brevo.com` as the SMTP host and `port: 587`. If you use a different provider, update the host/port or replace the transport configuration.

---

## Run the backend locally

1) Open a terminal and change into the backend folder:

```powershell
cd backend
npm install
```

2) Create `.env` with the variables described above.

3) Make sure MongoDB is running locally or your connection string points to a reachable instance.

4) Start the backend in development mode (uses nodemon):

```powershell
npm run server
```

5) Confirm the backend is reachable at:

```
http://localhost:4000
```

The backend includes routes at `/api` for auth and user features.

---

## Seed data (optional but helpful)

This project includes several seed scripts to populate example data into the database. Seed scripts live in `backend/scripts/` and connect directly to MongoDB (they do not require the backend server to be running, but MongoDB must be reachable).

- `backend/scripts/seed_courses.js` — inserts a set of example courses (if they don't already exist).
- `backend/scripts/seed_hackathons.js` — inserts example hackathons.
- `backend/scripts/seed_admin.js` — creates an admin user (Skyinten / admin1627@gmail.com) with the password you gave when running the seed script (the script hashes the password).

Run a seed script from the `backend` folder:

```powershell
cd backend
node scripts/seed_courses.js
node scripts/seed_hackathons.js
node scripts/seed_admin.js
```

Notes:
- If you prefer to run seeds from the root, prefix with `node backend/scripts/seed_courses.js`.
- The seed scripts will exit with success or a non-zero code on error; check the console output for details.
- To customize seed data (images, prices, names), edit the corresponding `seed_*.js` file before running.

---

---

## Run the frontend locally

1) Open a separate terminal and change into the frontend folder:

```powershell
cd edutech-frontend
npm install
```

2) Create `edutech-frontend/.env` and set the backend URL:

```env
VITE_BACKEND_URL="http://localhost:4000"
```

3) Start the Vite dev server:

```powershell
npm run dev
```

4) Open the app in your browser (usually `http://localhost:5173`). The frontend will call the backend at `VITE_BACKEND_URL`.

---

## Run both frontend and backend together (development)

Open two terminal windows (or tabs):

- Terminal A — start backend:

```powershell
cd backend
npm run server
```

- Terminal B — start frontend:

```powershell
cd edutech-frontend
npm run dev
```

This gives you hot reload on both ends and lets you test the full auth / email flows.

---

## Building the frontend for production

From `edutech-frontend`:

```powershell
npm run build
npm run preview  # optional local preview of the production build
```

---

## Troubleshooting

- Backend not reachable: make sure `npm run server` is running and using port 4000.
- CORS errors: the backend allows `http://localhost:5173` by default; check `backend/index.js` CORS configuration if you changed the frontend host.
- MongoDB connection refused: confirm MongoDB is running or change `backend/config/Mongodb.js` to point to your DB URI.
- Emails not sending: check SMTP credentials and host/port in `backend/config/nodemailer.js`. Some providers may require additional settings (TLS, allow-listing the sender, app-specific passwords, etc.).

---

## Optional: single command to start both services

If you'd like, I can add a convenience script to run both services with one command using a small dev dependency such as `concurrently` or `npm-run-all`. Example (conceptual):

```json
// in root package.json or `edutech-frontend/package.json` add:
"dev:full": "concurrently \"npm:start --prefix backend\" \"npm:dev --prefix edutech-frontend\""
````

Then run :
```powershell
npm run dev:full
```