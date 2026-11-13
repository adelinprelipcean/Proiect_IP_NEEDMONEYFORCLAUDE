from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_roles
from app.models import Maintenance, Resource
from app.schemas import MaintenanceOut, ReservationOut
from app.services.reservations import overlapping_reservations

router = APIRouter(prefix="/api/resources", tags=["Maintenance"])


def _get_resource(db: Session, resource_id: int) -> Resource:
    resource = db.get(Resource, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resursa nu exista")
    return resource


@router.get("/{resource_id}/maintenance",
            response_model=list[MaintenanceOut])
def get_resource_maintenance(resource_id: int,
                             db: Session = Depends(get_db)):
    _get_resource(db, resource_id)
    query = (select(Maintenance)
             .where(Maintenance.resource_id == resource_id)
             .order_by(Maintenance.start_time))
    return db.scalars(query).all()


@router.get("/{resource_id}/maintenance/affected-reservations",
            response_model=list[ReservationOut])
def get_affected_reservations(resource_id: int, start_time: datetime,
                              end_time: datetime,
                              _admin=Depends(require_roles("ADMIN")),
                              db: Session = Depends(get_db)):
    """Rezervarile active care ar fi anulate de o mentenanta in interval.

    Folosit de dialogul de mentenanta inainte de salvare.
    """
    _get_resource(db, resource_id)
    if end_time <= start_time:
        raise HTTPException(
            status_code=400,
            detail="Ora de sfarsit trebuie sa fie dupa ora de start",
        )
    return overlapping_reservations(db, resource_id, start_time, end_time)
