from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from models import Ticket
from schemas import TicketPublic, ReserveRequest, RaffleConfig
from config import settings

router = APIRouter(tags=["Tickets"])

@router.get("/tickets", response_model=list[TicketPublic])
def list_tickets(db: Session = Depends(get_db)):
    taken_numbers = {t.number for t in db.query(Ticket).all()}

    return [
        TicketPublic(number=n, taken=(n in taken_numbers))
        for n in range(1, settings.raffle_total_numbers + 1)
    ]

@router.post("/reserve", response_model=TicketPublic)
def reserve(payload: ReserveRequest, db: Session = Depends(get_db)):

    if payload.number > settings.raffle_total_numbers:
        raise HTTPException(status_code=400, detail="Number out of range")
    
    existing = db.query(Ticket).filter(Ticket.number == payload.number).first()
    if existing:
        raise HTTPException(status_code=409, detail="Number already reserved")

    ticket = Ticket(
        number=payload.number,
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        paid=False,
        reserved_at=datetime.utcnow(),
    )

    db.add(ticket)
    
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Number already reserved")

    db.refresh(ticket)

    return TicketPublic(number=ticket.number, taken=True)


@router.get("/config", response_model=RaffleConfig)
def get_config():
    return RaffleConfig(
        title=settings.raffle_title,
        prize=settings.raffle_prize,
        total_numbers=settings.raffle_total_numbers,
        price=settings.raffle_price,
        currency=settings.raffle_currency,
    )