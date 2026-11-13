"""Logica de disponibilitate: verificarea suprapunerilor (no overlap).

Doua intervale [a_start, a_end) si [b_start, b_end) se suprapun daca
a_start < b_end si a_end > b_start.
"""
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Maintenance, Reservation

ACTIVE_STATUSES = ("PENDING", "CONFIRMED")


def overlapping_reservations(db: Session, resource_id: int,
                             start_time: datetime, end_time: datetime,
                             exclude_id: int | None = None
                             ) -> list[Reservation]:
    query = select(Reservation).where(
        Reservation.resource_id == resource_id,
        Reservation.status.in_(ACTIVE_STATUSES),
        Reservation.start_time < end_time,
        Reservation.end_time > start_time,
    )
    if exclude_id is not None:
        query = query.where(Reservation.id != exclude_id)
    return list(db.scalars(query.order_by(Reservation.start_time)))


def overlapping_maintenance(db: Session, resource_id: int,
                            start_time: datetime, end_time: datetime
                            ) -> list[Maintenance]:
    query = select(Maintenance).where(
        Maintenance.resource_id == resource_id,
        Maintenance.start_time < end_time,
        Maintenance.end_time > start_time,
    )
    return list(db.scalars(query.order_by(Maintenance.start_time)))


def find_conflict(db: Session, resource_id: int, start_time: datetime,
                  end_time: datetime,
                  exclude_id: int | None = None) -> str | None:
    """Intoarce motivul conflictului sau None daca intervalul e liber."""
    if overlapping_maintenance(db, resource_id, start_time, end_time):
        return "Resursa este in mentenanta in intervalul ales"
    if overlapping_reservations(db, resource_id, start_time, end_time,
                                exclude_id):
        return "Intervalul este deja rezervat"
    return None
