from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import List

from db.deps import get_db
from db.models import TuitionRateRow, AppSettingRow
from models.models import TuitionConfig, TuitionRate

router = APIRouter()

DEFAULT_RATES = [
    ("grade-7", 5000.0),
    ("grade-8", 5000.0),
    ("grade-9", 5500.0),
    ("grade-10", 5500.0),
    ("grade-11", 6000.0),
    ("grade-12", 6000.0),
]


class EnrollmentToggleRequest(BaseModel):
    isOpen: bool


def _ensure_tuition_defaults(db: Session):
    """Seed default tuition rates if the table is empty."""
    if db.query(TuitionRateRow).count() == 0:
        now = datetime.now(timezone.utc)
        for grade, amount in DEFAULT_RATES:
            db.add(TuitionRateRow(grade_level=grade, amount=amount, last_updated=now))
        db.commit()


@router.get("/settings/enrollment")
def get_enrollment_status(db: Session = Depends(get_db)):
    setting = db.query(AppSettingRow).filter(AppSettingRow.key == "enrollment_open").first()
    is_open = (setting.value == "true") if setting else True
    return {"isOpen": is_open}


@router.put("/settings/enrollment")
def toggle_enrollment(request: EnrollmentToggleRequest, db: Session = Depends(get_db)):
    setting = db.query(AppSettingRow).filter(AppSettingRow.key == "enrollment_open").first()
    if setting:
        setting.value = str(request.isOpen).lower()
    else:
        db.add(AppSettingRow(key="enrollment_open", value=str(request.isOpen).lower()))
    db.commit()
    return {"message": "Status toggled"}


@router.get("/tuition/config", response_model=TuitionConfig)
def get_tuition_config(db: Session = Depends(get_db)):
    _ensure_tuition_defaults(db)
    rates = db.query(TuitionRateRow).all()
    last_updated = max((r.last_updated for r in rates), default=datetime.now(timezone.utc))
    return TuitionConfig(
        rates=[TuitionRate(gradeLevel=r.grade_level, amount=r.amount) for r in rates],
        lastUpdated=last_updated,
    )


@router.put("/tuition/config")
def update_tuition_rate(request: TuitionRate, db: Session = Depends(get_db)):
    rate = db.query(TuitionRateRow).filter(TuitionRateRow.grade_level == request.gradeLevel).first()
    now = datetime.now(timezone.utc)
    if rate:
        rate.amount = request.amount
        rate.last_updated = now
    else:
        db.add(TuitionRateRow(grade_level=request.gradeLevel, amount=request.amount, last_updated=now))
    db.commit()
    return {"message": "Rate updated"}
