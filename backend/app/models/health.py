import enum
from sqlalchemy import Column, String, Boolean, DateTime, Numeric, Integer, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
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

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    recorded_at = Column(DateTime(timezone=False), server_default=func.now())
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    blood_sugar = Column(Numeric)
    heart_rate = Column(Integer)
    temperature = Column(Numeric)


class HealthReport(Base):
    __tablename__ = "health_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String)
    report_type = Column(String)
    file_url = Column(String)
    ai_summary = Column(String)


class SOSLog(Base):
    __tablename__ = "sos_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    triggered_at = Column(DateTime(timezone=False), server_default=func.now())
    location_lat = Column(Numeric)
    location_lng = Column(Numeric)
    status = Column(ENUM(SOSStatus, name="sos_status", create_type=False), server_default="ACTIVE")
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    insight_type = Column(ENUM(InsightType, name="insight_type", create_type=False))
    risk_level = Column(ENUM(RiskLevel, name="risk_level", create_type=False))
    description = Column(String)
    recommendation = Column(String)
    is_acknowledged = Column(Boolean, server_default="false")
    created_at = Column(DateTime(timezone=False), server_default=func.now())


class AIVerification(Base):
    __tablename__ = "ai_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patient_profiles.id"))
    image_url = Column(String)
    extracted_medicine_name = Column(String)
    verification_status = Column(ENUM(VerificationStatus, name="verification_status", create_type=False))
    interaction_warnings = Column(JSONB)
    created_at = Column(DateTime(timezone=False), server_default=func.now())
