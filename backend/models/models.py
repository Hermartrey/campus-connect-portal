from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    student = 'student'
    admin = 'admin'


class EnrollmentStatus(str, Enum):
    not_enrolled = 'not_enrolled'
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'


class PaymentStatus(str, Enum):
    pending = 'pending'
    completed = 'completed'
    failed = 'failed'
    cancelled = 'cancelled'


class PaymentType(str, Enum):
    payment = 'payment'
    adjustment = 'adjustment'


class AdjustmentType(str, Enum):
    credit = 'credit'
    debit = 'debit'


class NotificationType(str, Enum):
    info = 'info'
    success = 'success'
    warning = 'warning'
    error = 'error'


class User(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: UserRole
    createdAt: datetime


class AuthResponse(BaseModel):
    success: bool
    user: User
    token: Optional[str] = None


class EnrollmentFormData(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    dateOfBirth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    phone: Optional[str] = None
    primarySchool: Optional[str] = None
    gradeLevel: Optional[str] = None
    strand: Optional[str] = None
    guardianName: Optional[str] = None
    guardianRelationship: Optional[str] = None
    guardianPhone: Optional[str] = None
    guardianEmail: Optional[str] = None
    paymentMethod: Optional[str] = None
    paymentAmount: Optional[float] = None
    paymentStatus: Optional[str] = None
    paymentReceipt: Optional[str] = None


class Payment(BaseModel):
    id: str
    amount: float
    date: datetime
    status: PaymentStatus
    description: str
    receipt: Optional[str] = None
    receiptName: Optional[str] = None
    type: Optional[PaymentType] = None
    adjustmentType: Optional[AdjustmentType] = None


class Student(User):
    enrollmentStatus: EnrollmentStatus
    enrollmentData: Optional[EnrollmentFormData] = None
    enrollmentSubmittedAt: Optional[datetime] = None
    gradeLevel: Optional[str] = None
    tuitionBalance: float = 0.0
    payments: List[Payment] = []


class TuitionRate(BaseModel):
    gradeLevel: str
    amount: float


class TuitionConfig(BaseModel):
    rates: List[TuitionRate]
    lastUpdated: datetime


class Notification(BaseModel):
    id: str
    userId: str
    title: str
    message: str
    type: NotificationType
    read: bool
    createdAt: datetime
    link: Optional[str] = None
