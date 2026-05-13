# Raffle App

Simple app to organize a raffle among friends. Users reserve numbers through a public page, and an admin area (password-protected) lets the organizer manage reservations.

Payment is handled offline (MBWay, Pix, cash, whatever was agreed). The app only organizes the numbers.

## Stack

- **Backend**: Python 3.12+, FastAPI, SQLAlchemy, SQLite, Pydantic, uv
- **Frontend**: React + Vite (JavaScript)

## Project layout

```
raffle-app/
├── backend/
│   ├── main.py              # FastAPI entrypoint, registers routers
│   ├── database.py          # Engine, Session, Base, get_db
│   ├── models.py            # SQLAlchemy model (Ticket)
│   ├── schemas.py           # Pydantic schemas (input and output)
│   ├── config.py            # Settings via pydantic-settings
│   ├── auth.py              # require_admin dependency (HTTP Basic)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── tickets.py       # Public routes
│   │   └── admin.py         # Protected routes
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── .env                 # (gitignored) local configuration
│   └── .env.example         # Env vars template
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js       # Proxies /api → backend
```

## Environment variables

All configuration lives in the backend's `.env`. Copy the example file and edit it:

```bash
cd backend
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `RAFFLE_TITLE` | Raffle | Title shown at the top of the page |
| `RAFFLE_PRIZE` | Mystery prize | Prize description |
| `RAFFLE_TOTAL_NUMBERS` | 100 | Total number of tickets (1 to N) |
| `RAFFLE_PRICE` | 5.00 | Price per ticket |
| `RAFFLE_CURRENCY` | EUR | Currency code |
| `ADMIN_USERNAME` | admin | Admin area username |
| `ADMIN_PASSWORD` | changeme | Admin area password (**change this!**) |

## Running locally

### Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite starts at `http://localhost:5173` and proxies `/api/*` to the backend.

## API endpoints

### Public

- `GET /` — basic health check
- `GET /tickets` — lists all numbers from 1 to N with a `taken` flag
- `POST /reserve` — reserves a number, expects `{number, name, phone}`
- `GET /config` — returns the raffle's public configuration

### Admin (HTTP Basic Auth)

- `GET /admin/tickets` — full reservation list with name, phone, paid status

## Design notes

- The raffle number is the primary key of the `tickets` table. Uniqueness is enforced naturally.
- The table only stores reserved numbers. Available numbers are generated at runtime in the `GET /tickets` route, so the frontend gets a dense response without the DB needing to be pre-populated.
- Race conditions are handled: `POST /reserve` does an optimistic check, and in case of a concurrent insert it catches the SQLAlchemy `IntegrityError` and returns 409 instead of 500.
- Schemas are split (`TicketPublic` vs `TicketAdmin`) to avoid leaking names and phone numbers through the public route.

## To do

- [ ] `PATCH /admin/tickets/{n}/paid` — toggle paid status
- [ ] `DELETE /admin/tickets/{n}` — remove a reservation
- [ ] `GET /admin/export` — XLSX export
- [ ] `POST /admin/draw` — random winner draw
- [ ] Frontend: reservation form
- [ ] Frontend: admin page (`/admin`) with table and actions
- [ ] Frontend: styling (Tailwind or similar)
- [ ] Backend Dockerfile
- [ ] Frontend Dockerfile
- [ ] `docker-compose.yml`