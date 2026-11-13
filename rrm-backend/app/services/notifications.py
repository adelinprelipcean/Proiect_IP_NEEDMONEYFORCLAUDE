"""Serviciul de notificari (in aplicatie).

Notificarile se adauga in sesiunea curenta; commit-ul il face apelantul,
ca notificarile sa fie salvate in aceeasi tranzactie cu rezervarea.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Notification, User

MAX_MESSAGE_LENGTH = 255


def notify_user(db: Session, user_id: int, message: str) -> Notification:
    notification = Notification(user_id=user_id,
                                message=message[:MAX_MESSAGE_LENGTH],
                                is_read=False)
    db.add(notification)
    return notification


def notify_team(db: Session, team_id: int, message: str) -> int:
    """Trimite mesajul tuturor membrilor echipei. Intoarce cati au primit."""
    member_ids = db.scalars(select(User.id).where(User.team_id == team_id))
    count = 0
    for member_id in member_ids:
        notify_user(db, member_id, message)
        count += 1
    return count
