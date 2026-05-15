from sqlalchemy import Boolean, Column, DateTime, Integer, String

from database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    number = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    paid = Column(Boolean, default=False, nullable=False)
    reserved_at = Column(DateTime, nullable=True)
