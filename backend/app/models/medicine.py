from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True)
    added_by = Column(Integer) # Doctor or Patient ID
    name = Column(String, index=True)
    dosage = Column(String)
    timing = Column(String)
    frequency = Column(String, default="Daily")
    duration = Column(String)
    notes = Column(String, nullable=True)
    
    # Visual ID Features
    image_url = Column(String, nullable=True)
    color = Column(String, nullable=True)
    shape = Column(String, nullable=True)
    food_instruction = Column(String, nullable=True) # e.g. "After Breakfast"
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # relationship
    logs = relationship("MedicineLog", back_populates="medicine")

class MedicineLog(Base):
    __tablename__ = "medicine_logs"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"))
    taken_status = Column(String) # 'taken', 'missed', 'pending'
    taken_time = Column(DateTime(timezone=True), nullable=True)
    scheduled_time = Column(DateTime(timezone=True))
    
    medicine = relationship("Medicine", back_populates="logs")
