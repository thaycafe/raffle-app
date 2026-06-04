import random

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import Ticket
from schemas import DrawResultResponse, TicketAdmin, TicketPaidUpdate

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@router.get("/tickets", response_model=list[TicketAdmin])
def list_all(db: Session = Depends(get_db)):
    return db.query(Ticket).order_by(Ticket.number).all()


@router.patch("/tickets/{number}/paid", response_model=TicketAdmin)
def update_paid(number: int, payload: TicketPaidUpdate, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.number == number).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.paid = payload.paid

    db.commit()
    db.refresh(ticket)
    return ticket


@router.delete("/tickets/{number}", status_code=204)
def delete_ticket(number: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.number == number).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.delete(ticket)
    db.commit()
    return None


@router.post("/draw", response_model=list[DrawResultResponse])
def draw(winners: int = Query(1, ge=1), db: Session = Depends(get_db)):
    tickets = db.query(Ticket).all()

    if len(tickets) < winners:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough reservations: {len(tickets)} reserved, {winners} prizes",
        )

    selected = random.sample(tickets, winners)

    return [
        DrawResultResponse(
            position=i + 1,
            number=ticket.number,
            name=ticket.name,
            phone=ticket.phone,
        )
        for i, ticket in enumerate(selected)
    ]
