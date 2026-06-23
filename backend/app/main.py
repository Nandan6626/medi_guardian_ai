from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from app.database import engine, Base
from app.api.endpoints import medicines, family, doctor, emergency
from app.notifications_worker import notifications_worker_loop

from contextlib import asynccontextmanager

# Async lifespan to create tables safely


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Note: In production, use Alembic for migrations instead of create_all
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Optional background worker; keep disabled by default in constrained environments.
    if os.getenv("ENABLE_NOTIFICATIONS_WORKER", "false").lower() == "true":
        asyncio.create_task(notifications_worker_loop())
    yield

app = FastAPI(
    title="MediGuardian AI API",
    description="Backend API for the AI-Powered Smart Medication & Preventive Healthcare Ecosystem",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. Will restrict in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "MediGuardian AI API",
        "message": "Welcome to the future of healthcare."
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Include routers
app.include_router(
    medicines.router, prefix="/api/medicines", tags=["Medicines"])
app.include_router(family.router, prefix="/api/family", tags=["Family"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["Doctor"])
app.include_router(
    emergency.router, prefix="/api/emergency", tags=["Emergency"])
