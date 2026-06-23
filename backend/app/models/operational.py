import enum
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, text, Enum, Uuid
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

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(as_uuid=True), ForeignKey("patient_profiles.id"))
    doctor_id = Column(Uuid(as_uuid=True), ForeignKey("doctor_profiles.id"))
    appointment_time = Column(DateTime(timezone=False))
    type = Column(
        Enum(AppointmentType, name="appointment_type", native_enum=False))
    status = Column(Enum(AppointmentStatus, name="appointment_status",
                    native_enum=False), default=AppointmentStatus.SCHEDULED.value)
    meeting_link = Column(String)
    clinical_notes = Column(String)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    type = Column(
        Enum(NotificationType, name="notification_type", native_enum=False))
    title = Column(String)
    body = Column(String)
    priority = Column(Enum(NotificationPriority, name="notification_priority",
                      native_enum=False), default=NotificationPriority.LOW.value)
    is_read = Column(Boolean, server_default="false")
    created_at = Column(DateTime(timezone=False), server_default=func.now())
