from fastapi import FastAPI

from database import Base, engine
from routers import admin, tickets

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(tickets.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Welcome to the Raffle App!"}
