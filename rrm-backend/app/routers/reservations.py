from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import Reservation, Resource, User
from app.schemas import ReservationIn, ReservationOut, SlotOut
from app.services.notifications import notify_team
from app.services.pricing import calculate_price
from app.services.reservations import (describe, find_conflict,
                                       overlapping_maintenance,
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


@router.post("", response_model=ReservationOut, status_code=201)
def create_reservation(data: ReservationIn,
                       user: User = Depends(require_roles("LEAD")),
                       db: Session = Depends(get_db)):
    """Creeaza rezervarea in starea PENDING, cu pretul calculat."""
    team_id = data.team_id if data.team_id is not None else user.team_id
    if team_id is None or team_id != user.team_id:
        raise HTTPException(status_code=403,
                            detail="Poti rezerva doar pentru echipa ta")
    if data.start_time < datetime.now():
        raise HTTPException(status_code=400,
                            detail="Nu poti rezerva un interval din trecut")
    resource = db.get(Resource, data.resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resursa nu exista")

    conflict = find_conflict(db, resource.id, data.start_time, data.end_time)
    if conflict:
        raise HTTPException(status_code=409, detail=conflict)

    quote = calculate_price(resource.price_per_hour, data.start_time,
                            data.end_time, user.affiliation_date)
    reservation = Reservation(
        resource_id=resource.id,
        team_id=team_id,
        user_id=user.id,
        start_time=data.start_time,
        end_time=data.end_time,
        price=quote.price,
        discount=quote.discount,
        final_price=quote.final_price,
        status="PENDING",
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


def get_team_reservation(db: Session, reservation_id: int,
                         user: User) -> Reservation:
    reservation = db.get(Reservation, reservation_id)
    if reservation is None:
        raise HTTPException(status_code=404, detail="Rezervarea nu exista")
    if user.role != "ADMIN" and reservation.team_id != user.team_id:
        raise HTTPException(status_code=403,
                            detail="Rezervarea nu apartine echipei tale")
    return reservation


@router.post("/{reservation_id}/confirm", response_model=ReservationOut)
def confirm_reservation(reservation_id: int,
                        user: User = Depends(require_roles("LEAD")),
                        db: Session = Depends(get_db)):
    """PENDING -> CONFIRMED. Membrii echipei primesc notificare."""
    reservation = get_team_reservation(db, reservation_id, user)
    if reservation.status != "PENDING":
        raise HTTPException(status_code=409,
                            detail="Doar rezervarile PENDING pot fi confirmate")
    if reservation.start_time <= datetime.now():
        reservation.status = "CANCELLED"
        db.commit()
        raise HTTPException(status_code=410, detail="Rezervarea a expirat")

    conflict = find_conflict(db, reservation.resource_id,
                             reservation.start_time, reservation.end_time,
                             exclude_id=reservation.id)
    if conflict:
        raise HTTPException(status_code=409, detail=conflict)

    reservation.status = "CONFIRMED"
    notify_team(db, reservation.team_id,
                f"Rezervare confirmata: {describe(reservation)}")
    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("", response_model=list[ReservationOut])
def get_team_reservations(status: str | None = None,
                          user: User = Depends(get_current_user),
                          db: Session = Depends(get_db)):
    """Rezervarile echipei utilizatorului logat (adminul le vede pe toate)."""
    query = select(Reservation).order_by(Reservation.start_time.desc())
    if user.role != "ADMIN":
        if user.team_id is None:
            return []
        query = query.where(Reservation.team_id == user.team_id)
    if status:
        query = query.where(Reservation.status == status.upper())
    return db.scalars(query).all()


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(reservation_id: int,
                    user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    return get_team_reservation(db, reservation_id, user)


@router.post("/{reservation_id}/cancel", response_model=ReservationOut)
def cancel_reservation(reservation_id: int,
                       user: User = Depends(require_roles("LEAD")),
                       db: Session = Depends(get_db)):
    """Anulare de catre Team Lead, doar daca rezervarea nu a inceput."""
    reservation = get_team_reservation(db, reservation_id, user)
    if reservation.status == "CANCELLED":
        raise HTTPException(status_code=409,
                            detail="Rezervarea este deja anulata")
    if reservation.start_time <= datetime.now():
        raise HTTPException(
            status_code=409,
            detail="Rezervarea a inceput deja si nu mai poate fi anulata",
        )

    reservation.status = "CANCELLED"
    notify_team(db, reservation.team_id,
                f"Rezervare anulata: {describe(reservation)}")
    db.commit()
    db.refresh(reservation)
    return reservation
