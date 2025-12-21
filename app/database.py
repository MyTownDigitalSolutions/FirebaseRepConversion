"""
============================================================
PROJECT DB RULES (READ BEFORE EDITING)
============================================================
Stack:
- FastAPI backend + SQLAlchemy ORM + Alembic migrations
- React + Vite frontend
- PostgreSQL database via self-hosted Supabase on VPS

Critical Security:
- Postgres/pooler ports on VPS are bound to 127.0.0.1 (NOT publicly reachable).
- Do NOT suggest opening 5432/6543 to the internet.

Connection Standard:
- Always read DATABASE_URL from environment variables.
  Format: postgresql+psycopg2://<DB_USER>:<DB_PASSWORD>@127.0.0.1:<DB_PORT>/<DB_NAME>
- Never hardcode credentials in code.

Migrations:
- All schema changes are done via Alembic migrations (run on VPS or via SSH tunnel).
============================================================
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Read database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "It must be defined for the application to start."
    )

# Create SQLAlchemy engine (PostgreSQL)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # Helps with dropped connections
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for models
Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
