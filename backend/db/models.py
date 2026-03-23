"""
SQLAlchemy ORM table definitions.
These are kept separate from Pydantic schemas in models/models.py.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    JSON, String, Text
)
from sqlalchemy.orm import DeclarativeBase, relationship


def utcnow():
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class PendingRegistrationRow(Base):
    __tablename__ = "pending_registrations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    role = Column(Enum("student", "admin", name="user_role"), nullable=False)
    password = Column(String, nullable=False)
    verification_token = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow)


class UserRow(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    role = Column(Enum("student", "admin", name="user_role"), nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    # Relationship to student profile (one-to-one)
    student = relationship("StudentRow", back_populates="user", uselist=False)
    notifications = relationship("NotificationRow", back_populates="user", cascade="all, delete-orphan")


class StudentRow(Base):
    __tablename__ = "students"

    id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    enrollment_status = Column(
        Enum("not_enrolled", "pending", "approved", "rejected", name="enrollment_status"),
        default="not_enrolled",
        nullable=False,
    )
    enrollment_data = Column(JSON, nullable=True)
    enrollment_submitted_at = Column(DateTime, nullable=True)
    grade_level = Column(String, nullable=True)
    tuition_balance = Column(Float, default=0.0, nullable=False)

    user = relationship("UserRow", back_populates="student")
    payments = relationship("PaymentRow", back_populates="student", cascade="all, delete-orphan")


class PaymentRow(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=utcnow, nullable=False)
    status = Column(
        Enum("pending", "completed", "failed", "cancelled", name="payment_status"),
        default="pending",
        nullable=False,
    )
    description = Column(String, nullable=False)
    receipt = Column(Text, nullable=True)       # base64 data URL
    receipt_name = Column(String, nullable=True)
    type = Column(Enum("payment", "adjustment", name="payment_type"), nullable=True)
    adjustment_type = Column(Enum("credit", "debit", name="adjustment_type"), nullable=True)

    student = relationship("StudentRow", back_populates="payments")


class NotificationRow(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(
        Enum("info", "success", "warning", "error", name="notification_type"),
        default="info",
        nullable=False,
    )
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    link = Column(String, nullable=True)

    user = relationship("UserRow", back_populates="notifications")


class TuitionRateRow(Base):
    __tablename__ = "tuition_rates"

    grade_level = Column(String, primary_key=True)
    amount = Column(Float, nullable=False)
    last_updated = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)


class AppSettingRow(Base):
    __tablename__ = "app_settings"

    key = Column(String, primary_key=True)
    value = Column(String, nullable=False)
