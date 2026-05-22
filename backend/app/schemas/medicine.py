from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

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
    is_self_reminder: Optional[bool] = False
    reminder_sound: Optional[bool] = True
    requires_refill: Optional[bool] = False
    refill_date: Optional[datetime] = None

class MedicineResponse(BaseModel):
    id: UUID
    patient_id: UUID
    added_by: UUID
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
    is_self_reminder: bool
    reminder_sound: bool
    requires_refill: bool
    refill_date: Optional[datetime] = None
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
    id: UUID
    medicine_id: UUID
    taken_time: Optional[datetime]
    
    class Config:
        from_attributes = True
