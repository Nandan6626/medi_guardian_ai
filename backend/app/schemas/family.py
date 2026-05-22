from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.medicine import MedicineResponse

class PatientAdherenceStats(BaseModel):
    patient_id: int
    patient_name: str
    adherence_score: int
    total_medicines: int
    missed_medicines: int

class FamilyDashboardResponse(BaseModel):
    patients: List[PatientAdherenceStats]

class PatientDetailResponse(BaseModel):
    patient_id: int
    patient_name: str
    medicines: List[MedicineResponse]
