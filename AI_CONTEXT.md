# AI Context – Database & Migrations (READ FIRST)

## Application Stack
- Backend: FastAPI (Python)
- ORM: SQLAlchemy
- Migrations: Alembic
- Frontend: React + Vite
- Database: PostgreSQL (self-hosted Supabase on VPS)

## Security & Networking (Critical)
- PostgreSQL and Supabase pooler ports are bound to 127.0.0.1 on the VPS (not publicly reachable).
- Do NOT suggest opening ports 5432/6543 to the internet.
- Schema changes must be applied via Alembic migrations run on the VPS OR via SSH tunnel.

## Connection Standard
- Use a single environment variable: DATABASE_URL
- Format:
  postgresql+psycopg2://<DB_USER>:<DB_PASSWORD>@127.0.0.1:<DB_PORT>/<DB_NAME>

Notes:
- DB_PORT is typically 5432 (local Postgres) or 6543 (transaction pooler), depending on configuration.
- DB_NAME is commonly `postgres` in Supabase self-host setups.

## Required Implementation
- Backend must read DB URL from os.getenv("DATABASE_URL")
- SQLAlchemy engine/session uses DATABASE_URL (no hardcoded secrets)
- Alembic env.py uses the same DATABASE_URL for migrations

## Operating Procedure
- To create/modify tables: create Alembic migrations and run `alembic upgrade head` on the VPS
  (or run migrations locally via an SSH tunnel to the VPS).
- Frontend never connects to Postgres directly. It calls backend APIs only.
