from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    family = "family"
    nurse = "nurse"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.patient)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PatientProfile(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, unique=True)
    age = Column(Integer)
    emergency_contact = Column(String)
    
    # Extended Phase 6 Fields
    blood_group = Column(String, nullable=True)
    allergies = Column(String, nullable=True)
    medical_conditions = Column(String, nullable=True)
    adherence_score = Column(Integer, default=100)

class FamilyConnection(Base):
    __tablename__ = "family_connections"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)
    family_member_id = Column(Integer, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DoctorProfile(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, unique=True)
    specialization = Column(String)
    hospital = Column(String)
    verification_status = Column(String, default="pending")

class DoctorPatientConnection(Base):
    __tablename__ = "doctor_patient_connections"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, index=True)
    patient_id = Column(Integer, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
