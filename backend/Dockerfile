FROM python:3.12-slim

WORKDIR /app

# Instala uv
RUN pip install --no-cache-dir uv

# Copia primeiro os arquivos de lock (camada de cache)
COPY pyproject.toml uv.lock ./

# Sincroniza dependências (sem instalar o projeto, só as deps)
RUN uv sync --frozen --no-install-project

# Copia o resto do código
COPY . .

# Pasta pra o SQLite (volume será montado aqui)
RUN mkdir -p /data
ENV DATABASE_URL=sqlite:////data/raffle.db

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]