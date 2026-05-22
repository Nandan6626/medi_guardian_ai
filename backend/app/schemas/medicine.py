from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MedicineBase(BaseModel):
    name: str = Field(..., description="Name of the medicine")
    dosage: str = Field(..., description="Dosage amount (e.g., '10mg')")
    timing: str = Field(..., description="Time to take medicine (e.g., '08:00 AM')")
    duration: str = Field(..., description="Duration of prescription (e.g., '30 days')")
    notes: Optional[str] = None

class MedicineCreate(BaseModel):
    name: str
    dosage: str
    timing: str
    duration: str
    frequency: Optional[str] = "Daily"
    notes: Optional[str] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    shape: Optional[str] = None
    food_instruction: Optional[str] = None

class MedicineResponse(BaseModel):
    id: int
    patient_id: int
    added_by: int
    name: str
    dosage: str
    timing: str
    duration: str
    frequency: str
    notes: Optional[str] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    shape: Optional[str] = None
    food_instruction: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MedicineLogBase(BaseModel):
    taken_status: str
    scheduled_time: datetime

class MedicineLogCreate(MedicineLogBase):
    taken_time: Optional[datetime] = None

class MedicineLogResponse(MedicineLogBase):
    id: int
    medicine_id: int
    taken_time: Optional[datetime]
    
    class Config:
        from_attributes = True
