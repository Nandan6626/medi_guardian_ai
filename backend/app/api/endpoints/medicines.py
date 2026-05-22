from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.medicine import Medicine, MedicineLog
from app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineLogCreate, MedicineLogResponse

router = APIRouter()

# Mock user id for Phase 1 until auth is implemented
MOCK_USER_ID = 1

@router.post("/", response_model=MedicineResponse)
def create_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    db_medicine = Medicine(
        patient_id=MOCK_USER_ID,
        added_by=MOCK_USER_ID,
        **medicine.model_dump()
    )
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

@router.get("/", response_model=List[MedicineResponse])
def get_medicines(db: Session = Depends(get_db)):
    return db.query(Medicine).filter(Medicine.patient_id == MOCK_USER_ID).all()

@router.post("/{medicine_id}/log", response_model=MedicineLogResponse)
def log_medicine_taken(medicine_id: int, log: MedicineLogCreate, db: Session = Depends(get_db)):
    db_medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db_log = MedicineLog(
        medicine_id=medicine_id,
        **log.model_dump()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
