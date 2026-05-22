from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.database import get_db
from app.models.user import User, DoctorProfile, PatientConnection, PatientProfile, ConnectionType
from app.schemas.doctor import DoctorDashboardResponse, DoctorDashboardMetrics, PatientAlert, PrescribeMedicineRequest, PatientListResponse, PatientDetailMetrics
from app.schemas.medicine import MedicineResponse

router = APIRouter()

# Mock Doctor user id for Phase 3 until auth is implemented
MOCK_DOCTOR_ID = uuid.UUID("00000000-0000-0000-0000-000000000003")

@router.get("/dashboard", response_model=DoctorDashboardResponse)
async def get_doctor_dashboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == MOCK_DOCTOR_ID))
    doctor_user = result.scalars().first()
    
    result = await db.execute(select(DoctorProfile).where(DoctorProfile.user_id == MOCK_DOCTOR_ID))
    doctor_profile = result.scalars().first()
    
    if not doctor_user or not doctor_profile:
        # Return mock data for UI testing if empty DB
        return DoctorDashboardResponse(
            metrics=DoctorDashboardMetrics(
                doctor_name="Dr. Smith (Mock)",
                specialization="Cardiology",
                hospital="Central Hospital",
                total_patients=0,
                critical_alerts=0,
                avg_adherence=100,
                pending_reviews=0
            ),
            action_required=[]
        )

    result = await db.execute(
        select(PatientConnection)
        .where(PatientConnection.connected_user_id == MOCK_DOCTOR_ID)
        .where(PatientConnection.connection_type == ConnectionType.DOCTOR)
    )
    connections = result.scalars().all()
    
    total_patients = len(connections)
    metrics = DoctorDashboardMetrics(
        doctor_name=doctor_user.email, # email is the only standard name field on User currently
        specialization=doctor_profile.specialization or "General",
        hospital=doctor_profile.hospital_affiliation or "Clinic",
        total_patients=total_patients,
        critical_alerts=1 if total_patients > 0 else 0,
        avg_adherence=85,
        pending_reviews=2
    )

    action_required = []
    if connections:
        first_patient_id = connections[0].patient_id
        result = await db.execute(select(PatientProfile).where(PatientProfile.id == first_patient_id))
        first_patient = result.scalars().first()
        if first_patient:
            action_required.append(PatientAlert(
                patient_id=first_patient.id,
                patient_name=f"{first_patient.first_name} {first_patient.last_name}",
                issue="Missed recent dosage",
                risk_level="High"
            ))

    return DoctorDashboardResponse(metrics=metrics, action_required=action_required)

@router.get("/patients", response_model=List[PatientListResponse])
async def get_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientConnection)
        .where(PatientConnection.connected_user_id == MOCK_DOCTOR_ID)
    )
    connections = result.scalars().all()
    
    patients = []
    for conn in connections:
        result = await db.execute(select(PatientProfile).where(PatientProfile.id == conn.patient_id))
        profile = result.scalars().first()
        if profile:
            patients.append(PatientListResponse(
                id=profile.id,
                name=f"{profile.first_name} {profile.last_name}",
                status="Stable",
                alerts=0
            ))
    return patients

@router.get("/patients/{patient_id}", response_model=PatientDetailMetrics)
async def get_patient_details(patient_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientConnection).where(
            PatientConnection.connected_user_id == MOCK_DOCTOR_ID,
            PatientConnection.patient_id == patient_id
        )
    )
    conn = result.scalars().first()
    if not conn:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    result = await db.execute(select(PatientProfile).where(PatientProfile.id == patient_id))
    profile = result.scalars().first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return PatientDetailMetrics(
        id=profile.id,
        name=f"{profile.first_name} {profile.last_name}",
        age=30, # Derived from DOB in real app
        blood_group=profile.blood_group,
        allergies=str(profile.allergies),
        medical_conditions=str(profile.chronic_conditions),
        emergency_contact="",
        adherence_score=int(profile.adherence_score or 0)
    )

@router.post("/patients/{patient_id}/prescriptions", response_model=MedicineResponse)
async def prescribe_medicine(patient_id: uuid.UUID, request: PrescribeMedicineRequest, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Endpoint needs refactoring for new MedicineSchedule architecture")
