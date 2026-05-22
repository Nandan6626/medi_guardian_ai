from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class DoctorDashboardMetrics(BaseModel):
    doctor_name: str
    specialization: str
    hospital: str
    total_patients: int
    critical_alerts: int
    avg_adherence: int
    pending_reviews: int

class PatientAlert(BaseModel):
    patient_id: UUID
    patient_name: str
    issue: str
    risk_level: str # 'High', 'Medium', 'Low'

class DoctorDashboardResponse(BaseModel):
    metrics: DoctorDashboardMetrics
    action_required: List[PatientAlert]

class PatientDetailMetrics(BaseModel):
    id: UUID
    name: str
    age: int
    blood_group: Optional[str]
    allergies: Optional[str]
    medical_conditions: Optional[str]
    emergency_contact: Optional[str]
    adherence_score: int

class PatientListResponse(BaseModel):
    id: UUID
    name: str
    status: str
    alerts: int

class PrescribeMedicineRequest(BaseModel):
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
