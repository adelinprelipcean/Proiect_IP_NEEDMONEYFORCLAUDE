from pydantic import BaseModel, ConfigDict, Field


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
