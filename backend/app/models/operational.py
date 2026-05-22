import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class AppointmentType(str, enum.Enum):
    VIDEO = 'VIDEO'
    IN_PERSON = 'IN_PERSON'

class AppointmentStatus(str, enum.Enum):
    SCHEDULED = 'SCHEDULED'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'
    NO_SHOW = 'NO_SHOW'

class NotificationType(str, enum.Enum):
    MISSED_MEDICINE = 'MISSED_MEDICINE'
    EMERGENCY = 'EMERGENCY'
    APPOINTMENT = 'APPOINTMENT'
    SYSTEM = 'SYSTEM'

class NotificationPriority(str, enum.Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'
    CRITICAL = 'CRITICAL'


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("doctor_profiles.id"))
    appointment_time = Column(DateTime(timezone=False))
    type = Column(ENUM(AppointmentType, name="appointment_type", create_type=False))
    status = Column(ENUM(AppointmentStatus, name="appointment_status", create_type=False), server_default="SCHEDULED")
    meeting_link = Column(String)
    clinical_notes = Column(String)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(ENUM(NotificationType, name="notification_type", create_type=False))
    title = Column(String)
    body = Column(String)
    priority = Column(ENUM(NotificationPriority, name="notification_priority", create_type=False), server_default="LOW")
    is_read = Column(Boolean, server_default="false")
    created_at = Column(DateTime(timezone=False), server_default=func.now())
