from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import uuid

from app.database import get_db
from app.models.medicine import Medicine, MedicineSchedule, MedicineLog
from app.schemas.medicine import MedicineCreate, MedicineResponse, MedicineLogCreate, MedicineLogResponse

router = APIRouter()

MOCK_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")

@router.post("/", response_model=MedicineResponse)
async def create_medicine(medicine: MedicineCreate, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Creation currently disabled during architecture migration")

@router.get("/", response_model=List[MedicineResponse])
async def get_medicines(db: AsyncSession = Depends(get_db)):
    # Return empty list until we migrate UI to read MedicineSchedules instead of old Medicines
    return []

@router.post("/{medicine_id}/log", response_model=MedicineLogResponse)
async def log_medicine_taken(medicine_id: uuid.UUID, log: MedicineLogCreate, db: AsyncSession = Depends(get_db)):
    raise HTTPException(status_code=501, detail="Logging currently disabled during architecture migration")
