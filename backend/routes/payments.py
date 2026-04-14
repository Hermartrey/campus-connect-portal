from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from db.deps import get_db
from db.models import StudentRow, PaymentRow
from models.models import Payment, PaymentCreate, PaymentStatus

router = APIRouter()


@router.post("/{student_id}/payments")
def add_payment(student_id: str, payment: PaymentCreate, db: Session = Depends(get_db)):
    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    new_payment = PaymentRow(
        id=f"payment-{uuid.uuid4()}",
        student_id=student_id,
        amount=payment.amount,
        date=payment.date or datetime.now(timezone.utc),
        status=payment.status.value,
        description=payment.description,
        receipt=payment.receipt,
        receipt_name=payment.receiptName,
        type=payment.type.value if payment.type else None,
        adjustment_type=payment.adjustmentType.value if payment.adjustmentType else None,
    )
    db.add(new_payment)

    if payment.status == PaymentStatus.completed:
        student.tuition_balance = max(0.0, student.tuition_balance - payment.amount)

    db.commit()
    return {"message": "Payment added", "paymentId": new_payment.id}


@router.put("/{student_id}/payments/{payment_id}/confirm")
def confirm_payment(student_id: str, payment_id: str, db: Session = Depends(get_db)):
    payment = (
        db.query(PaymentRow)
        .filter(PaymentRow.id == payment_id, PaymentRow.student_id == student_id)
        .first()
    )
    if not payment or payment.status != "pending":
        raise HTTPException(status_code=404, detail="Pending payment not found")

    student = db.query(StudentRow).filter(StudentRow.id == student_id).first()
    payment.status = "completed"
    student.tuition_balance = max(0.0, student.tuition_balance - payment.amount)
    db.commit()
    return {"message": "Payment confirmed"}


@router.put("/{student_id}/payments/{payment_id}/cancel")
def cancel_payment(student_id: str, payment_id: str, db: Session = Depends(get_db)):
    payment = (
        db.query(PaymentRow)
        .filter(PaymentRow.id == payment_id, PaymentRow.student_id == student_id)
        .first()
    )
    if not payment or payment.status != "pending":
        raise HTTPException(status_code=404, detail="Pending payment not found")

    payment.status = "cancelled"
    db.commit()
    return {"message": "Payment canceled"}
