FROM python:3.12-slim

WORKDIR /app

# Install uv
RUN pip install --no-cache-dir uv

# Copy lock files first (cache layer)
COPY pyproject.toml uv.lock ./

# Sync dependencias (without installing project files)
RUN uv sync --frozen --no-install-project

COPY . .

# Directory for SQLite (volume will be mounted here)
RUN mkdir -p /data
ENV DATABASE_URL=sqlite:////data/raffle.db

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]