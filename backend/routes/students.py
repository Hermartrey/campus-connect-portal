from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel

from db.database import db
from models.models import Student, EnrollmentStatus, EnrollmentFormData

router = APIRouter()

class StatusUpdateRequest(BaseModel):
    status: EnrollmentStatus

class BalanceUpdateRequest(BaseModel):
    newBalance: float


@router.get("/", response_model=List[Student])
def list_students():
    return list(db.students.values())


@router.get("/{student_id}", response_model=Student)
def get_student(student_id: str):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    return db.students[student_id]


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: str):
    if student_id in db.students:
        del db.students[student_id]
    if student_id in db.users:
        del db.users[student_id]
    return None


@router.put("/{student_id}/status")
def update_status(student_id: str, request: StatusUpdateRequest):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    db.students[student_id]["enrollmentStatus"] = request.status
    return {"message": "Status updated"}


@router.post("/{student_id}/enroll")
def submit_enrollment(student_id: str, request: EnrollmentFormData):
    from datetime import datetime
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.students[student_id]["enrollmentStatus"] = "pending"
    db.students[student_id]["enrollmentData"] = request.model_dump()
    db.students[student_id]["enrollmentSubmittedAt"] = datetime.utcnow()
    db.students[student_id]["gradeLevel"] = request.gradeLevel
    return {"message": "Enrollment submitted"}


@router.put("/{student_id}/enrollment-data")
def update_enrollment_data(student_id: str, request: dict): # Accepting dict to merge
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
        
    current_data = db.students[student_id].get("enrollmentData") or {}
    current_data.update(request)
    db.students[student_id]["enrollmentData"] = current_data
    return {"message": "Data updated"}


@router.put("/{student_id}/balance")
def update_balance(student_id: str, request: BalanceUpdateRequest):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    db.students[student_id]["tuitionBalance"] = request.newBalance
    return {"message": "Balance updated"}


@router.post("/{student_id}/reset-enrollment")
def reset_student_enrollment(student_id: str):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
    db.students[student_id]["enrollmentStatus"] = "not_enrolled"
    db.students[student_id]["enrollmentData"] = None
    db.students[student_id]["enrollmentSubmittedAt"] = None
    return {"message": "Enrollment reset"}


@router.post("/reset-all-enrollments")
def reset_all_enrollments():
    for student_id in db.students:
        db.students[student_id]["enrollmentStatus"] = "not_enrolled"
        db.students[student_id]["enrollmentSubmittedAt"] = None
    return {"message": "All enrollments reset"}
