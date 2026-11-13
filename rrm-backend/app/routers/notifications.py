from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import Notification, User
from app.schemas import NotificationOut

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationOut])
def get_my_notifications(unread: bool | None = None,
                         user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    query = (select(Notification)
             .where(Notification.user_id == user.id)
             .order_by(Notification.created_at.desc(), Notification.id.desc()))
    if unread:
        query = query.where(Notification.is_read.is_(False))
    return db.scalars(query).all()


@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(notification_id: int,
                 user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):
    notification = db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404,
                            detail="Notificarea nu exista")
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
