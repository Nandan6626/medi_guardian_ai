# MediGuardian AI

MediGuardian AI is a Next-Generation AI-powered Healthcare Operating System. It provides a premium, comprehensive ecosystem for patients, doctors, and family members to manage medical schedules, verify prescriptions, chat, track health metrics, and trigger emergency SOS protocols.

## Features

- **Role-Based Workspaces**: Distinct, optimized dashboards for Patients, Doctors, and Caregivers.
- **Smart Medicine Reminders**: Animated 3D stacked card UI for tracking and managing daily prescriptions.
- **AI Verification**: Scan medicine strips and prescriptions for drug interaction warnings and genuine verification.
- **Health Timeline**: Interactive chronological view of health milestones, appointments, and alerts.
- **Clinical Management**: Advanced patient listing and clinical insights panel for Doctors.
- **Emergency SOS**: Instant one-tap emergency beacon with live location sharing.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (v4), Framer Motion, Recharts, Zustand.
- **Backend**: FastAPI, Python 3.10+, SQLAlchemy, SQLite.
- **Styling**: Premium Soft Claymorphism & Glassmorphism dark mode.

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Seed the database (optional): `python seed_db.py`.
4. Run the server: `uvicorn app.main:app --reload`.

### Frontend Setup
1. Navigate to the `web` directory.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.

## Architecture
- `web/`: Contains the React/Vite frontend application.
- `backend/`: Contains the FastAPI backend application.
- `medi_guardian_ai/`: Contains the Expo/React Native mobile application (in progress).
