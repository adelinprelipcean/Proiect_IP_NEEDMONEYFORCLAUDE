from datetime import date

from pydantic import BaseModel, ConfigDict, Field, field_validator


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
