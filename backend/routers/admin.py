from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import Ticket
from schemas import TicketAdmin, TicketPaidUpdate

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
