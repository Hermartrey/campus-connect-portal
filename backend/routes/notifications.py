from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import uuid

from db.deps import get_db
from db.models import NotificationRow
from models.models import Notification

router = APIRouter()


def _row_to_notif(row: NotificationRow) -> Notification:
    return Notification(
        id=row.id,
        userId=row.user_id,
        title=row.title,
        message=row.message,
        type=row.type,
        read=row.read,
        createdAt=row.created_at,
        link=row.link,
    )


@router.get("/", response_model=List[Notification])
def get_notifications(userId: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(NotificationRow)
    if userId:
        query = query.filter(
            (NotificationRow.user_id == userId) | (NotificationRow.user_id == "all")
        )
    rows = query.order_by(NotificationRow.created_at.desc()).all()
    return [_row_to_notif(r) for r in rows]


@router.post("/", status_code=201)
def create_notification(notification: Notification, db: Session = Depends(get_db)):
    row = NotificationRow(
        id=f"notif-{uuid.uuid4()}",
        user_id=notification.userId,
        title=notification.title,
        message=notification.message,
        type=notification.type.value,
        read=False,
        created_at=datetime.now(timezone.utc),
        link=notification.link,
    )
    db.add(row)
    db.commit()
    return {"message": "Notification created"}


@router.delete("/", status_code=204)
def clear_notifications(userId: str, db: Session = Depends(get_db)):
    db.query(NotificationRow).filter(
        (NotificationRow.user_id == userId) | (NotificationRow.user_id == "all")
    ).delete(synchronize_session=False)
    db.commit()
    return None


@router.put("/{notification_id}/read")
def mark_read(notification_id: str, db: Session = Depends(get_db)):
    notif = db.query(NotificationRow).filter(NotificationRow.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.put("/read-all")
def mark_all_read(userId: str, db: Session = Depends(get_db)):
    db.query(NotificationRow).filter(
        (NotificationRow.user_id == userId) | (NotificationRow.user_id == "all")
    ).update({"read": True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read"}
