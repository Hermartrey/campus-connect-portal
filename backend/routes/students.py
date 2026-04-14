from fastapi import APIRouter, HTTPException, Depends
from typing import List
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from db.deps import get_db
from db.models import UserRow, StudentRow, PaymentRow, TuitionRateRow
from models.models import Student, EnrollmentStatus, EnrollmentFormData, Payment, PaymentStatus, PaymentType, AdjustmentType

router = APIRouter()


class StatusUpdateRequest(BaseModel):
    status: EnrollmentStatus


class BalanceUpdateRequest(BaseModel):
    newBalance: float


def _row_to_student(student: StudentRow) -> Student:
    """Convert ORM StudentRow + UserRow to Pydantic Student model."""
    user = student.user
    payments = [
        Payment(
            id=p.id,
            amount=p.amount,
            date=p.date,
            status=PaymentStatus(p.status),
            description=p.description,
            receipt=p.receipt,
            receiptName=p.receipt_name,
            type=PaymentType(p.type) if p.type else None,
            adjustmentType=AdjustmentType(p.adjustment_type) if p.adjustment_type else None,
        )
        for p in student.payments
    ]
    return Student(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        createdAt=user.created_at,
        enrollmentStatus=EnrollmentStatus(student.enrollment_status),
        enrollmentData=EnrollmentFormData(**student.enrollment_data) if student.enrollment_data else None,
        enrollmentSubmittedAt=student.enrollment_submitted_at,
        gradeLevel=student.grade_level,
        tuitionBalance=student.tuition_balance,
        payments=payments,
    )


@router.get("", response_model=List[Student])
def list_students(db: Session = Depends(get_db)):
    students = db.query(StudentRow).all()
    return [_row_to_student(s) for s in students]


@router.get("/{student_id}", response_model=Student)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return _row_to_student(student)


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: str, db: Session = Depends(get_db)):
    # Delete student row first (its id is a FK to users.id)
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if student:
        db.delete(student)
        db.flush()  # flush before deleting the parent

    user = db.query(UserRow).filter(UserRow.id == student_id).first()
    if user:
        db.delete(user)

    db.commit()
    return None


@router.put("/{student_id}/status")
def update_status(student_id: str, request: StatusUpdateRequest, db: Session = Depends(get_db)):
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.enrollment_status = request.status.value

    # When approving, automatically set tuition balance from tuition_rates table
    if request.status.value == "approved" and student.grade_level:
        rate = db.query(TuitionRateRow).filter(
            TuitionRateRow.grade_level == student.grade_level
        ).first()
        if rate:
            student.tuition_balance = rate.amount

    db.commit()
    return {"message": "Status updated"}


@router.post("/{student_id}/enroll")
def submit_enrollment(student_id: str, request: EnrollmentFormData, db: Session = Depends(get_db)):
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.enrollment_status = "pending"
    student.enrollment_data = request.model_dump()
    student.enrollment_submitted_at = datetime.now(timezone.utc)
    student.grade_level = request.gradeLevel
    db.commit()
    return {"message": "Enrollment submitted"}


@router.put("/{student_id}/enrollment-data")
def update_enrollment_data(student_id: str, request: dict, db: Session = Depends(get_db)):
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    current = student.enrollment_data or {}
    current.update(request)
    student.enrollment_data = current
    db.commit()
    return {"message": "Data updated"}


@router.put("/{student_id}/balance")
def update_balance(student_id: str, request: BalanceUpdateRequest, db: Session = Depends(get_db)):
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.tuition_balance = request.newBalance
    db.commit()
    return {"message": "Balance updated"}


@router.post("/{student_id}/reset-enrollment")
def reset_student_enrollment(student_id: str, db: Session = Depends(get_db)):
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    student.enrollment_status = "not_enrolled"
    student.enrollment_data = None
    student.enrollment_submitted_at = None
    db.commit()
    return {"message": "Enrollment reset"}


@router.post("/reset-all-enrollments")
def reset_all_enrollments(db: Session = Depends(get_db)):
    students = db.query(StudentRow).all()
    for s in students:
        s.enrollment_status = "not_enrolled"
        s.enrollment_submitted_at = None
    db.commit()
    return {"message": "All enrollments reset"}
