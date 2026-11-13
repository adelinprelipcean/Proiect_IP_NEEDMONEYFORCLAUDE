from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Team, User
from app.schemas import LoginRequest, LoginResponse, RegisterRequest, UserOut
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == data.email))
    if existing is not None:
        raise HTTPException(status_code=409,
                            detail="Exista deja un cont cu acest email")
    if data.team_id is not None and db.get(Team, data.team_id) is None:
        raise HTTPException(status_code=400, detail="Echipa nu exista")

    user = User(
        email=data.email,
        password=hash_password(data.password),
        name=data.name.strip(),
        role="MEMBER",
        affiliation_date=data.affiliation_date or date.today(),
        team_id=data.team_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401,
                            detail="Email sau parola gresita")
    return LoginResponse(token=create_access_token(user.id, user.role),
                         user=UserOut.model_validate(user))
