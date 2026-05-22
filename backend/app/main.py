from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.endpoints import medicines, family, doctor

# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="MediGuardian AI API",
    description="Backend API for the AI-Powered Smart Medication & Preventive Healthcare Ecosystem",
    version="1.0.0"
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
app.include_router(medicines.router, prefix="/api/medicines", tags=["Medicines"])
app.include_router(family.router, prefix="/api/family", tags=["Family"])
app.include_router(doctor.router, prefix="/api/doctor", tags=["Doctor"])
