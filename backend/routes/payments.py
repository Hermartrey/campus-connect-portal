from fastapi import APIRouter, HTTPException
from db.database import db
from models.models import Payment, PaymentStatus
import uuid

router = APIRouter()

@router.post("/{student_id}/payments")
def add_payment(student_id: str, payment: Payment):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
        
    payment_dict = payment.model_dump()
    payment_dict["id"] = f"payment-{uuid.uuid4()}"
    
    if payment_dict["status"] == PaymentStatus.completed:
        db.students[student_id]["tuitionBalance"] = max(0, db.students[student_id]["tuitionBalance"] - payment_dict["amount"])
        
    db.students[student_id].setdefault("payments", []).append(payment_dict)
    return {"message": "Payment added", "paymentId": payment_dict["id"]}


@router.put("/{student_id}/payments/{payment_id}/confirm")
def confirm_payment(student_id: str, payment_id: str):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
        
    payments = db.students[student_id].get("payments", [])
    for p in payments:
        if p["id"] == payment_id and p["status"] == PaymentStatus.pending:
            p["status"] = PaymentStatus.completed
            db.students[student_id]["tuitionBalance"] = max(0, db.students[student_id]["tuitionBalance"] - p["amount"])
            return {"message": "Payment confirmed"}
            
    raise HTTPException(status_code=404, detail="Pending payment not found")


@router.put("/{student_id}/payments/{payment_id}/cancel")
def cancel_payment(student_id: str, payment_id: str):
    if student_id not in db.students:
        raise HTTPException(status_code=404, detail="Student not found")
        
    payments = db.students[student_id].get("payments", [])
    for p in payments:
        if p["id"] == payment_id and p["status"] == PaymentStatus.pending:
            p["status"] = PaymentStatus.cancelled
            return {"message": "Payment canceled"}
            
    raise HTTPException(status_code=404, detail="Pending payment not found")
