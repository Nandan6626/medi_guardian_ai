import enum
from sqlalchemy import Column, String, Boolean, DateTime, Date, Numeric, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class UserRole(str, enum.Enum):
    PATIENT = 'PATIENT'
    DOCTOR = 'DOCTOR'
    CAREGIVER = 'CAREGIVER'
    ADMIN = 'ADMIN'

class HealthStatus(str, enum.Enum):
    STABLE = 'STABLE'
    NEEDS_ATTENTION = 'NEEDS_ATTENTION'
    CRITICAL = 'CRITICAL'

class ConnectionType(str, enum.Enum):
    DOCTOR = 'DOCTOR'
    CAREGIVER = 'CAREGIVER'

class ConnectionStatus(str, enum.Enum):
    PENDING = 'PENDING'
    ACTIVE = 'ACTIVE'
    REJECTED = 'REJECTED'
    REVOKED = 'REVOKED'

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String, unique=True, nullable=False)
    role = Column(ENUM(UserRole, name="user_role", create_type=False), nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
    last_login = Column(DateTime(timezone=False), nullable=True)
    is_active = Column(Boolean, server_default="true")
    
    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
    caregiver_profile = relationship("CaregiverProfile", back_populates="user", uselist=False)


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    mg_pat_id = Column(String, unique=True, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    date_of_birth = Column(Date)
    blood_group = Column(String)
    health_status = Column(ENUM(HealthStatus, name="health_status", create_type=False), server_default="STABLE")
    adherence_score = Column(Numeric, server_default="0")
    allergies = Column(JSONB)
    chronic_conditions = Column(JSONB)
    avatar_url = Column(String)

    user = relationship("User", back_populates="patient_profile")
    connections = relationship("PatientConnection", back_populates="patient", foreign_keys="PatientConnection.patient_id")


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    first_name = Column(String)
    last_name = Column(String)
    specialization = Column(String)
    hospital_affiliation = Column(String)
    license_number = Column(String)
    is_verified = Column(Boolean, server_default="false")

    user = relationship("User", back_populates="doctor_profile")


class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String)

    user = relationship("User", back_populates="caregiver_profile")


class PatientConnection(Base):
    __tablename__ = "patient_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    connected_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    connection_type = Column(ENUM(ConnectionType, name="connection_type", create_type=False), nullable=False)
    status = Column(ENUM(ConnectionStatus, name="connection_status", create_type=False), server_default="PENDING")
    permissions = Column(JSONB)
    created_at = Column(DateTime(timezone=False), server_default=func.now())

    patient = relationship("PatientProfile", back_populates="connections", foreign_keys=[patient_id])
    connected_user = relationship("User", foreign_keys=[connected_user_id])
