import enum
from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class PrescriptionStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    COMPLETED = 'COMPLETED'
    REVOKED = 'REVOKED'

class MedicineScheduleStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    PAUSED = 'PAUSED'
    STOPPED = 'STOPPED'

class MedicineFrequency(str, enum.Enum):
    DAILY = 'DAILY'
    WEEKLY = 'WEEKLY'
    AS_NEEDED = 'AS_NEEDED'

class MedicineInstructions(str, enum.Enum):
    BEFORE_FOOD = 'BEFORE_FOOD'
    AFTER_FOOD = 'AFTER_FOOD'
    WITH_FOOD = 'WITH_FOOD'

class MedicineLogStatus(str, enum.Enum):
    TAKEN = 'TAKEN'
    MISSED = 'MISSED'
    SKIPPED = 'SKIPPED'
    PENDING = 'PENDING'

class LogActor(str, enum.Enum):
    PATIENT = 'PATIENT'
    CAREGIVER = 'CAREGIVER'
    SYSTEM_AUTO = 'SYSTEM_AUTO'

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String)
    generic_name = Column(String)
    type = Column(String)
    manufacturer = Column(String)


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id"))
    diagnosis = Column(String)
    status = Column(ENUM(PrescriptionStatus, name="prescription_status", create_type=False), server_default="ACTIVE")
    valid_until = Column(DateTime(timezone=False))
    created_at = Column(DateTime(timezone=False), server_default=func.now())

    schedules = relationship("MedicineSchedule", back_populates="prescription")


class MedicineSchedule(Base):
    __tablename__ = "medicine_schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    prescription_id = Column(UUID(as_uuid=True), ForeignKey("prescriptions.id"))
    medicine_name = Column(String)
    is_self_reminder = Column(Boolean, server_default="false")
    dosage = Column(String)
    frequency = Column(ENUM(MedicineFrequency, name="medicine_frequency", create_type=False))
    timing_slots = Column(JSONB)
    instructions = Column(ENUM(MedicineInstructions, name="medicine_instructions", create_type=False))
    start_date = Column(Date)
    end_date = Column(Date)
    requires_refill = Column(Boolean, server_default="false")
    refill_date = Column(Date)
    status = Column(ENUM(MedicineScheduleStatus, name="medicine_schedule_status", create_type=False), server_default="ACTIVE")

    prescription = relationship("Prescription", back_populates="schedules")
    logs = relationship("MedicineLog", back_populates="schedule")


class MedicineLog(Base):
    __tablename__ = "medicine_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("medicine_schedules.id"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    scheduled_time = Column(DateTime(timezone=False))
    taken_time = Column(DateTime(timezone=False))
    status = Column(ENUM(MedicineLogStatus, name="medicine_log_status", create_type=False), server_default="PENDING")
    logged_by = Column(ENUM(LogActor, name="log_actor", create_type=False))

    schedule = relationship("MedicineSchedule", back_populates="logs")
