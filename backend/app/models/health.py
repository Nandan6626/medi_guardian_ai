import enum
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Integer, ForeignKey, text, Enum, JSON, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class SOSStatus(str, enum.Enum):
    ACTIVE = 'ACTIVE'
    RESOLVED = 'RESOLVED'
    FALSE_ALARM = 'FALSE_ALARM'


class InsightType(str, enum.Enum):
    ADHERENCE_RISK = 'ADHERENCE_RISK'
    DRUG_INTERACTION = 'DRUG_INTERACTION'
    VITAL_ANOMALY = 'VITAL_ANOMALY'


class RiskLevel(str, enum.Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'


class VerificationStatus(str, enum.Enum):
    SAFE = 'SAFE'
    WARNING = 'WARNING'
    DANGER = 'DANGER'
    UNREADABLE = 'UNREADABLE'


class PatientVitals(Base):
    __tablename__ = "patient_vitals"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(as_uuid=True), ForeignKey("patient_profiles.id"))
    recorded_at = Column(DateTime(timezone=False), server_default=func.now())
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    blood_sugar = Column(Numeric)
    heart_rate = Column(Integer)
    temperature = Column(Numeric)


class HealthReport(Base):
    __tablename__ = "health_reports"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(as_uuid=True), ForeignKey("patient_profiles.id"))
    uploaded_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"))
    title = Column(String)
    report_type = Column(String)
    file_url = Column(String)
    ai_summary = Column(String)


class SOSLog(Base):
    __tablename__ = "sos_logs"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(as_uuid=True), ForeignKey("patient_profiles.id"))
    triggered_at = Column(DateTime(timezone=False), server_default=func.now())
    location_lat = Column(Numeric)
    location_lng = Column(Numeric)
    status = Column(Enum(SOSStatus, name="sos_status",
                    native_enum=False), default=SOSStatus.ACTIVE.value)
    resolved_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"))


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(as_uuid=True), ForeignKey("patient_profiles.id"))
    insight_type = Column(
        Enum(InsightType, name="insight_type", native_enum=False))
    risk_level = Column(Enum(RiskLevel, name="risk_level", native_enum=False))
    description = Column(String)
    recommendation = Column(String)
    is_acknowledged = Column(Boolean, server_default="false")
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class AIVerification(Base):
    __tablename__ = "ai_verifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Uuid(as_uuid=True), ForeignKey("patient_profiles.id"))
    image_url = Column(String)
    extracted_medicine_name = Column(String)
    verification_status = Column(
        Enum(VerificationStatus, name="verification_status", native_enum=False))
    interaction_warnings = Column(JSON)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
