from datetime import datetime

from pydantic import BaseModel, Field


class TicketPublic(BaseModel):
    number: int
    taken: bool


class TicketAdmin(BaseModel):
    number: int
    name: str
    phone: str
    paid: bool
    reserved_at: datetime | None

    class Config:
        from_attributes = True


class ReserveRequest(BaseModel):
    numbers: list[int] = Field(..., min_length=1)
    name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=3, max_length=30)


class ReserveResponse(BaseModel):
    reserved: list[int]


class RaffleConfig(BaseModel):
    title: str
    total_numbers: int
    price: float
    currency: str


class TicketPaidUpdate(BaseModel):
    paid: bool


class DrawResultResponse(BaseModel):
    position: int
    number: int
    name: str
    phone: str
