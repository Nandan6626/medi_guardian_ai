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
    db_patient = User(id=1, name="Alex", email="alex@example.com", role=UserRole.patient)
    db.add(db_patient)
    
    # Create Patient Profile with unique code
    db_patient_profile = PatientProfile(
        user_id=db_patient.id,
        patient_code="MG-PAT-10458",
        age=32,
        emergency_contact="+1-555-0100",
        blood_group="O+",
        allergies="Penicillin",
        medical_conditions="Hypertension",
        adherence_score=92
    )
    db.add(db_patient_profile)

    # Create Family User (id=2 for MOCK_FAMILY_ID)
    db_family = User(id=2, name="Sarah (Mom)", email="sarah@example.com", role=UserRole.family)
    db.add(db_family)

    # Create Doctor User (id=3 for MOCK_DOCTOR_ID)
    db_doctor = User(id=3, name="Dr. Sarah Jenkins", email="dr.jenkins@example.com", role=UserRole.doctor)
    db.add(db_doctor)
    
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

    # Create Medicines (Doctor Prescribed)
    med1 = Medicine(
        patient_id=db_patient.id,
        added_by=db_doctor.id,
        name="Lisinopril",
        dosage="10mg",
        timing="08:00 AM",
        frequency="Daily",
        duration="30 Days",
        image_url="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        color="White",
        shape="Round",
        food_instruction="Before Food",
        is_self_reminder=False
    )
    
    med2 = Medicine(
        patient_id=db_patient.id,
        added_by=db_doctor.id,
        name="Metformin",
        dosage="500mg",
        timing="20:00 PM",
        frequency="Daily",
        duration="60 Days",
        image_url="https://images.unsplash.com/photo-1628771065518-0d82f5d75cb4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        color="White",
        shape="Oval",
        food_instruction="After Food",
        is_self_reminder=False
    )

    # Self Reminder
    med3 = Medicine(
        patient_id=db_patient.id,
        added_by=db_patient.id,
        name="Vitamin D3",
        dosage="1000 IU",
        timing="12:00 PM",
        frequency="Daily",
        duration="90 Days",
        color="Yellow",
        shape="Capsule",
        food_instruction="After Food",
        is_self_reminder=True,
        reminder_sound=True
    )
    
    db.add(med1)
    db.add(med2)
    db.add(med3)
    db.commit()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed()
