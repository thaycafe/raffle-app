from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import Ticket
from schemas import TicketAdmin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(require_admin)],
)


@router.get("/tickets", response_model=list[TicketAdmin])
def list_all(db: Session = Depends(get_db)):
    return db.query(Ticket).order_by(Ticket.number).all()
