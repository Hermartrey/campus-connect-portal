from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

from db.database import db
from models.models import Notification

router = APIRouter()

@router.get("/", response_model=List[Notification])
def get_notifications(userId: Optional[str] = None):
    if userId:
        return [n for n in db.notifications if n["userId"] == userId or n["userId"] == "all"]
    return db.notifications

@router.post("/", status_code=201)
def create_notification(notification: Notification):
    notif_dict = notification.model_dump()
    notif_dict["id"] = f"notif-{uuid.uuid4()}"
    notif_dict["createdAt"] = datetime.utcnow()
    notif_dict["read"] = False
    
    db.notifications.append(notif_dict)
    return {"message": "Notification created"}

@router.delete("/", status_code=204)
def clear_notifications(userId: str):
    db.notifications = [n for n in db.notifications if n["userId"] != userId and n["userId"] != "all"]
    return None

@router.put("/{notification_id}/read")
def mark_read(notification_id: str):
    for n in db.notifications:
        if n["id"] == notification_id:
            n["read"] = True
            return {"message": "Notification marked as read"}
    raise HTTPException(status_code=404, detail="Notification not found")

@router.put("/read-all")
def mark_all_read(userId: str):
    for n in db.notifications:
        if n["userId"] == userId or n["userId"] == "all":
            n["read"] = True
    return {"message": "All notifications marked as read"}
