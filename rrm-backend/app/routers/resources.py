from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_roles
from app.models import Category, Resource
from app.schemas import CategoryOut, ResourceIn, ResourceOut

router = APIRouter(prefix="/api", tags=["Resources"])


def _check_category(db: Session, category_id: int | None):
    if category_id is not None and db.get(Category, category_id) is None:
        raise HTTPException(status_code=400, detail="Categoria nu exista")


@router.get("/categories", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.scalars(select(Category).order_by(Category.id)).all()


@router.get("/resources", response_model=list[ResourceOut])
def get_resources(category_id: int | None = None,
                  db: Session = Depends(get_db)):
    query = select(Resource).order_by(Resource.id)
    if category_id is not None:
        query = query.where(Resource.category_id == category_id)
    return db.scalars(query).all()


@router.get("/resources/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.get(Resource, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resursa nu exista")
    return resource


@router.post("/resources", response_model=ResourceOut, status_code=201)
def create_resource(data: ResourceIn,
                    _admin=Depends(require_roles("ADMIN")),
                    db: Session = Depends(get_db)):
    _check_category(db, data.category_id)
    resource = Resource(**data.model_dump())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.put("/resources/{resource_id}", response_model=ResourceOut)
def update_resource(resource_id: int, data: ResourceIn,
                    _admin=Depends(require_roles("ADMIN")),
                    db: Session = Depends(get_db)):
    resource = db.get(Resource, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resursa nu exista")
    _check_category(db, data.category_id)
    for key, value in data.model_dump().items():
        setattr(resource, key, value)
    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/resources/{resource_id}", status_code=204)
def delete_resource(resource_id: int,
                    _admin=Depends(require_roles("ADMIN")),
                    db: Session = Depends(get_db)):
    resource = db.get(Resource, resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resursa nu exista")
    db.delete(resource)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Resursa are rezervari sau mentenanta si nu poate fi stearsa",
        )
