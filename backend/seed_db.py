import asyncio
import uuid
from sqlalchemy import delete
from app.database import engine, Base, AsyncSessionLocal
import app.models
from app.models.user import (
    User, PatientProfile, DoctorProfile, CaregiverProfile, PatientConnection,
    UserRole, HealthStatus, ConnectionType, ConnectionStatus
)
from app.models.medicine import Medicine, MedicineSchedule, MedicineLog

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await db.execute(delete(MedicineLog))
        await db.execute(delete(MedicineSchedule))
        await db.execute(delete(Medicine))
        await db.execute(delete(PatientConnection))
        await db.execute(delete(DoctorProfile))
        await db.execute(delete(CaregiverProfile))
        await db.execute(delete(PatientProfile))
        await db.execute(delete(User))
        await db.commit()

        # Mock UUIDs
        patient_user_id = uuid.UUID("00000000-0000-0000-0000-000000000001")
        caregiver_user_id = uuid.UUID("00000000-0000-0000-0000-000000000002")
        doctor_user_id = uuid.UUID("00000000-0000-0000-0000-000000000003")

        # Create Patient User
        db_patient = User(id=patient_user_id, email="alex@example.com", role=UserRole.PATIENT)
        db.add(db_patient)

        # Create Caregiver User
        db_caregiver = User(id=caregiver_user_id, email="sarah@example.com", role=UserRole.CAREGIVER)
        db.add(db_caregiver)

        # Create Doctor User
        db_doctor = User(id=doctor_user_id, email="dr.jenkins@example.com", role=UserRole.DOCTOR)
        db.add(db_doctor)
        await db.commit()

        # Create Patient Profile
        patient_profile_id = uuid.uuid4()
        db_patient_profile = PatientProfile(
            id=patient_profile_id,
            user_id=patient_user_id,
            mg_pat_id="MG-PAT-10458",
            first_name="Alex",
            last_name="Morgan",
            blood_group="O+",
            health_status=HealthStatus.STABLE,
            adherence_score=92,
            allergies=["Penicillin"],
            chronic_conditions=["Hypertension"]
        )
        db.add(db_patient_profile)

        # Create Caregiver Profile
        db_caregiver_profile = CaregiverProfile(
            user_id=caregiver_user_id,
            first_name="Sarah",
            last_name="Morgan",
            phone_number="+1-555-0100"
        )
        db.add(db_caregiver_profile)

        # Create Doctor Profile
        db_doctor_profile = DoctorProfile(
            user_id=doctor_user_id,
            first_name="Sarah",
            last_name="Jenkins",
            specialization="Cardiology",
            hospital_affiliation="Global Bank Medical Center",
            is_verified=True
        )
        db.add(db_doctor_profile)

        # Create Connections
        conn1 = PatientConnection(
            patient_id=patient_profile_id,
            connected_user_id=caregiver_user_id,
            connection_type=ConnectionType.CAREGIVER,
            status=ConnectionStatus.ACTIVE
        )
        conn2 = PatientConnection(
            patient_id=patient_profile_id,
            connected_user_id=doctor_user_id,
            connection_type=ConnectionType.DOCTOR,
            status=ConnectionStatus.ACTIVE
        )
        db.add_all([conn1, conn2])

        await db.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())


