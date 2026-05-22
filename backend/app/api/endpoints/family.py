from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, FamilyConnection
from app.models.medicine import Medicine, MedicineLog
from app.schemas.family import FamilyDashboardResponse, PatientAdherenceStats, PatientDetailResponse

router = APIRouter()

# Mock Family user id for Phase 2 until auth is implemented
MOCK_FAMILY_ID = 2

@router.get("/patients", response_model=FamilyDashboardResponse)
def get_connected_patients(db: Session = Depends(get_db)):
    connections = db.query(FamilyConnection).filter(FamilyConnection.family_member_id == MOCK_FAMILY_ID).all()
    
    patient_stats = []
    for conn in connections:
        patient = db.query(User).filter(User.id == conn.patient_id).first()
        if not patient:
            continue
        
        medicines = db.query(Medicine).filter(Medicine.patient_id == patient.id).all()
        # Mock calculating stats
        total = len(medicines)
        missed = 0 # In real logic, we query MedicineLog where taken_status == 'missed'
        score = 100 if total == 0 else max(0, 100 - (missed * 10))
        
        patient_stats.append(
            PatientAdherenceStats(
                patient_id=patient.id,
                patient_name=patient.name,
                adherence_score=score,
                total_medicines=total,
                missed_medicines=missed
            )
        )
    
    return FamilyDashboardResponse(patients=patient_stats)

@router.get("/patients/{patient_id}/medicines", response_model=PatientDetailResponse)
def get_patient_medicines(patient_id: int, db: Session = Depends(get_db)):
    # Verify connection exists
    conn = db.query(FamilyConnection).filter(
        FamilyConnection.family_member_id == MOCK_FAMILY_ID,
        FamilyConnection.patient_id == patient_id
    ).first()
    
    if not conn:
        raise HTTPException(status_code=403, detail="Not authorized to view this patient")
        
    patient = db.query(User).filter(User.id == patient_id).first()
    medicines = db.query(Medicine).filter(Medicine.patient_id == patient_id).all()
    
    return PatientDetailResponse(
        patient_id=patient.id,
        patient_name=patient.name,
        medicines=medicines
    )
