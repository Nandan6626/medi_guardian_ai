from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.database import get_db
from app.models.user import User, PatientConnection, PatientProfile, ConnectionType
from app.schemas.family import FamilyDashboardResponse, PatientAdherenceStats, PatientDetailResponse

router = APIRouter()

MOCK_FAMILY_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")

@router.get("/patients", response_model=FamilyDashboardResponse)
async def get_connected_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientConnection)
        .where(PatientConnection.connected_user_id == MOCK_FAMILY_ID)
        .where(PatientConnection.connection_type == ConnectionType.CAREGIVER)
    )
    connections = result.scalars().all()
    
    patient_stats = []
    for conn in connections:
        result = await db.execute(select(PatientProfile).where(PatientProfile.id == conn.patient_id))
        patient = result.scalars().first()
        if not patient:
            continue
        
        patient_stats.append(
            PatientAdherenceStats(
                patient_id=patient.id,
                patient_name=f"{patient.first_name} {patient.last_name}",
                adherence_score=int(patient.adherence_score or 100),
                total_medicines=0,
                missed_medicines=0
            )
        )
    
    if not patient_stats:
        # Mock for UI testing if DB empty
        return FamilyDashboardResponse(patients=[])

    return FamilyDashboardResponse(patients=patient_stats)

@router.get("/patients/{patient_id}/medicines", response_model=PatientDetailResponse)
async def get_patient_medicines(patient_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientConnection).where(
            PatientConnection.connected_user_id == MOCK_FAMILY_ID,
            PatientConnection.patient_id == patient_id
        )
    )
    conn = result.scalars().first()
    
    if not conn:
        raise HTTPException(status_code=403, detail="Not authorized to view this patient")
        
    result = await db.execute(select(PatientProfile).where(PatientProfile.id == patient_id))
    patient = result.scalars().first()
    
    return PatientDetailResponse(
        patient_id=patient.id,
        patient_name=f"{patient.first_name} {patient.last_name}",
        medicines=[] # Stubbed due to new schema
    )
