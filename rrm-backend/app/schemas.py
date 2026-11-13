from datetime import date, datetime

from pydantic import (BaseModel, ConfigDict, Field, field_validator,
                      model_validator)


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class ResourceIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = None
    price_per_hour: float = Field(ge=0)
    category_id: int | None = None


class ResourceOut(ResourceIn):
    model_config = ConfigDict(from_attributes=True)

    id: int


class RegisterRequest(BaseModel):
    email: str = Field(max_length=100)
    password: str = Field(min_length=6, max_length=100)
    name: str = Field(min_length=1, max_length=100)
    team_id: int | None = None
    affiliation_date: date | None = None

    @field_validator("email")
    @classmethod
    def email_usv(cls, value: str) -> str:
        value = value.strip().lower()
        local_part, _, domain = value.partition("@")
        if not local_part or domain != "usv.ro":
            raise ValueError("Emailul trebuie sa fie de forma nume@usv.ro")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    role: str
    affiliation_date: date
    team_id: int | None


class LoginResponse(BaseModel):
    token: str
    user: UserOut


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    message: str
    is_read: bool
    created_at: datetime


class SlotOut(BaseModel):
    start_time: datetime
    end_time: datetime
    status: str  # FREE, BOOKED, MAINTENANCE, PAST


class ReservationIn(BaseModel):
    resource_id: int
    team_id: int | None = None
    start_time: datetime
    end_time: datetime

    @field_validator("start_time", "end_time")
    @classmethod
    def to_local_naive(cls, value: datetime) -> datetime:
        # in baza orele sunt salvate fara fus orar (ora locala)
        if value.tzinfo is not None:
            value = value.astimezone().replace(tzinfo=None)
        return value

    @model_validator(mode="after")
    def check_interval(self):
        if self.end_time <= self.start_time:
            raise ValueError("Ora de sfarsit trebuie sa fie dupa ora de start")
        return self


class ReservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resource_id: int
    resource_name: str | None = None
    team_id: int
    user_id: int
    start_time: datetime
    end_time: datetime
    price: float | None
    discount: float
    final_price: float | None
    status: str
