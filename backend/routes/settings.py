from fastapi import APIRouter
from pydantic import BaseModel
from db.database import db
from models.models import TuitionConfig, TuitionRate
from typing import List

router = APIRouter()

class EnrollmentToggleRequest(BaseModel):
    isOpen: bool

@router.get("/settings/enrollment")
def get_enrollment_status():
    return {"isOpen": db.enrollment_open}

@router.put("/settings/enrollment")
def toggle_enrollment(request: EnrollmentToggleRequest):
    db.enrollment_open = request.isOpen
    return {"message": "Status toggled"}

@router.get("/tuition/config", response_model=TuitionConfig)
def get_tuition_config():
    return db.tuition_config

@router.put("/tuition/config")
def update_tuition_rate(request: TuitionRate):
    for i, rate in enumerate(db.tuition_config["rates"]):
        if rate["gradeLevel"] == request.gradeLevel:
            db.tuition_config["rates"][i]["amount"] = request.amount
            return {"message": "Rate updated"}
            
    # If not found, append
    db.tuition_config["rates"].append(request.model_dump())
    return {"message": "Rate added"}
