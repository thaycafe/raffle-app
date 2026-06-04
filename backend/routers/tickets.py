from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import Ticket
from schemas import RaffleConfig, ReserveRequest, ReserveResponse, TicketPublic

router = APIRouter(tags=["Tickets"])


@router.get("/tickets", response_model=list[TicketPublic])
def list_tickets(db: Session = Depends(get_db)):
    taken_numbers = {t.number for t in db.query(Ticket).all()}

    return [
        TicketPublic(number=n, taken=(n in taken_numbers))
        for n in range(1, settings.raffle_total_numbers + 1)
    ]


@router.post("/reserve", response_model=ReserveResponse, status_code=201)
def reserve(payload: ReserveRequest, db: Session = Depends(get_db)):

    numbers = sorted(set(payload.numbers))

    for n in numbers:
        if n < 1 or n > settings.raffle_total_numbers:
            raise HTTPException(status_code=400, detail=f"Number {n} out of range")

    existing = db.query(Ticket).filter(Ticket.number.in_(numbers)).all()

    if existing:
        taken = sorted(t.number for t in existing)
        raise HTTPException(status_code=409, detail=f"Numbers already reserved: {taken}")

    now = datetime.now(UTC)
    for n in numbers:
        db.add(
            Ticket(
                number=n,
                name=payload.name.strip(),
                phone=payload.phone.strip(),
                paid=False,
                reserved_at=now,
            )
        )

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="One or more numbers were just reserved by someone else"
        ) from None

    return ReserveResponse(reserved=numbers)


@router.get("/config", response_model=RaffleConfig)
def get_config():
    return RaffleConfig(
        title=settings.raffle_title,
        total_numbers=settings.raffle_total_numbers,
        price=settings.raffle_price,
        currency=settings.raffle_currency,
    )
