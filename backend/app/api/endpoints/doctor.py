from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User, DoctorProfile, DoctorPatientConnection
from app.models.medicine import Medicine, MedicineLog
from app.schemas.doctor import DoctorDashboardResponse, DoctorDashboardMetrics, PatientAlert, PrescribeMedicineRequest, PatientListResponse, PatientDetailMetrics
from app.schemas.medicine import MedicineResponse

router = APIRouter()

# Mock Doctor user id for Phase 3 until auth is implemented
MOCK_DOCTOR_ID = 3

@router.get("/dashboard", response_model=DoctorDashboardResponse)
def get_doctor_dashboard(db: Session = Depends(get_db)):
    doctor_user = db.query(User).filter(User.id == MOCK_DOCTOR_ID).first()
    doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == MOCK_DOCTOR_ID).first()
    
    if not doctor_user or not doctor_profile:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    connections = db.query(DoctorPatientConnection).filter(DoctorPatientConnection.doctor_id == MOCK_DOCTOR_ID).all()
    
    total_patients = len(connections)
    # Mocking analytics logic
    metrics = DoctorDashboardMetrics(
        doctor_name=doctor_user.name,
        specialization=doctor_profile.specialization,
        hospital=doctor_profile.hospital,
        total_patients=total_patients,
        critical_alerts=1 if total_patients > 0 else 0, # mock logic
        avg_adherence=85, # mock logic
        pending_reviews=2 # mock logic
    )

    action_required = []
    # Mock finding a patient with an alert
    if connections:
        first_patient = db.query(User).filter(User.id == connections[0].patient_id).first()
        if first_patient:
            action_required.append(PatientAlert(
                patient_id=first_patient.id,
                patient_name=first_patient.name,
                issue="Missed recent dosage",
                risk_level="High"
            ))

    return DoctorDashboardResponse(metrics=metrics, action_required=action_required)

@router.get("/patients", response_model=List[PatientListResponse])
def get_patients(db: Session = Depends(get_db)):
    connections = db.query(DoctorPatientConnection).filter(DoctorPatientConnection.doctor_id == MOCK_DOCTOR_ID).all()
    patients = []
    for conn in connections:
        user = db.query(User).filter(User.id == conn.patient_id).first()
        if user:
            patients.append(PatientListResponse(
                id=user.id,
                name=user.name,
                status="Critical" if "1" in str(user.id) else "Stable", # Mock logic
                alerts=1 if "1" in str(user.id) else 0
            ))
    return patients

@router.get("/patients/{patient_id}", response_model=PatientDetailMetrics)
def get_patient_details(patient_id: int, db: Session = Depends(get_db)):
    # Verify connection
    conn = db.query(DoctorPatientConnection).filter(
        DoctorPatientConnection.doctor_id == MOCK_DOCTOR_ID,
        DoctorPatientConnection.patient_id == patient_id
    ).first()
    if not conn:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    user = db.query(User).filter(User.id == patient_id).first()
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient_id).first()
    
    if not user or not profile:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    return PatientDetailMetrics(
        id=user.id,
        name=user.name,
        age=profile.age,
        blood_group=profile.blood_group,
        allergies=profile.allergies,
        medical_conditions=profile.medical_conditions,
        emergency_contact=profile.emergency_contact,
        adherence_score=profile.adherence_score
    )

@router.post("/patients/{patient_id}/prescriptions", response_model=MedicineResponse)
def prescribe_medicine(patient_id: int, request: PrescribeMedicineRequest, db: Session = Depends(get_db)):
    # Verify patient is connected to doctor
    conn = db.query(DoctorPatientConnection).filter(
        DoctorPatientConnection.doctor_id == MOCK_DOCTOR_ID,
        DoctorPatientConnection.patient_id == patient_id
    ).first()
    if not conn:
        raise HTTPException(status_code=403, detail="Not authorized to prescribe to this patient")

    db_medicine = Medicine(
        patient_id=patient_id,
        added_by=MOCK_DOCTOR_ID,
        **request.model_dump()
    )
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine

