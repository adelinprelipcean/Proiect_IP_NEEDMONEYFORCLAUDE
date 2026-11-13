from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resource
from app.schemas import SlotOut
from app.services.reservations import (overlapping_maintenance,
                                       overlapping_reservations)

router = APIRouter(prefix="/api/reservations", tags=["Reservations"])

DAY_START_HOUR = 8
DAY_END_HOUR = 20
DAYS_IN_WEEK = 7


def _overlaps(start, end, items) -> bool:
    return any(item.start_time < end and item.end_time > start
               for item in items)


@router.get("/availability", response_model=list[SlotOut])
def get_availability(resource_id: int, week: date,
                     db: Session = Depends(get_db)):
    """Sloturile de cate o ora (08-20) din saptamana care contine `week`."""
    if db.get(Resource, resource_id) is None:
        raise HTTPException(status_code=404, detail="Resursa nu exista")

    monday = week - timedelta(days=week.weekday())
    week_start = datetime.combine(monday, time(0, 0))
    week_end = week_start + timedelta(days=DAYS_IN_WEEK)
    reservations = overlapping_reservations(db, resource_id,
                                            week_start, week_end)
    maintenance = overlapping_maintenance(db, resource_id,
                                          week_start, week_end)
    now = datetime.now()

    slots = []
    for day in range(DAYS_IN_WEEK):
        current_day = monday + timedelta(days=day)
        for hour in range(DAY_START_HOUR, DAY_END_HOUR):
            start = datetime.combine(current_day, time(hour, 0))
            end = start + timedelta(hours=1)
            if _overlaps(start, end, maintenance):
                status = "MAINTENANCE"
            elif _overlaps(start, end, reservations):
                status = "BOOKED"
            elif start < now:
                status = "PAST"
            else:
                status = "FREE"
            slots.append(SlotOut(start_time=start, end_time=end,
                                 status=status))
    return slots
