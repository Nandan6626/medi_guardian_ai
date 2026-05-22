from app.database import engine, Base, SessionLocal
from app.models.user import User, PatientProfile, FamilyConnection, UserRole
from app.models.medicine import Medicine, MedicineLog
from datetime import datetime, timedelta

def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.query(Medicine).delete()
    db.query(FamilyConnection).delete()
    db.query(PatientProfile).delete()
    db.query(User).delete()

    # Create Patient User (id=1 for MOCK_USER_ID)
    patient = User(id=1, name="Alex", email="alex@example.com", role=UserRole.patient)
    db.add(patient)
    
    # Create Patient Profile
    patient_profile = PatientProfile(
        user_id=1, 
        age=72, 
        emergency_contact="+1 (555) 911-0000",
        blood_group="O+",
        allergies="Penicillin, Peanuts",
        medical_conditions="Hypertension, Type 2 Diabetes",
        adherence_score=85
    )
    db.add(patient_profile)

    # Create Family User (id=2 for MOCK_FAMILY_ID)
    family = User(id=2, name="Sarah (Mom)", email="sarah@example.com", role=UserRole.family)
    db.add(family)

    # Create Doctor User (id=3 for MOCK_DOCTOR_ID)
    doctor_user = User(id=3, name="Dr. Sarah Jenkins", email="dr.jenkins@example.com", role=UserRole.doctor)
    db.add(doctor_user)
    
    db.commit()

    # Create Doctor Profile
    from app.models.user import DoctorProfile, DoctorPatientConnection
    db.query(DoctorPatientConnection).delete()
    db.query(DoctorProfile).delete()
    
    doc_profile = DoctorProfile(user_id=3, specialization="Cardiology", hospital="Global Bank Medical Center", verification_status="verified")
    db.add(doc_profile)

    # Create connections
    conn1 = FamilyConnection(patient_id=1, family_member_id=2)
    conn2 = DoctorPatientConnection(patient_id=1, doctor_id=3)
    db.add_all([conn1, conn2])

    # Add medicines for Alex
    med1 = Medicine(patient_id=1, added_by=1, name="Lisinopril", dosage="10mg", timing="08:00 AM", duration="30 days", notes="Blood Pressure")
    med2 = Medicine(patient_id=1, added_by=1, name="Metformin", dosage="500mg", timing="01:00 PM", duration="60 days", notes="Diabetes")
    med3 = Medicine(patient_id=1, added_by=1, name="Atorvastatin", dosage="20mg", timing="08:00 PM", duration="30 days", notes="Cholesterol")
    
    db.add_all([med1, med2, med3])
    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
