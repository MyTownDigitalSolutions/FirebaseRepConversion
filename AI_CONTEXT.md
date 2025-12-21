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
- Schema changes must be applied via Alembic migrations run on the VPS or via SSH tunnel.

## Connection Standard
- Use a single environment variable: DATABASE_URL
- Format:
  postgresql+psycopg2://<user>:<password>@127.0.0.1:<port>/<db>

## Required Implementation
- Backend must read DB URL from os.getenv("DATABASE_URL")
- SQLAlchemy engine/session uses DATABASE_URL (no hardcoded secrets)
- Alembic env.py uses the same DATABASE_URL for migrations

## Operating Procedure
- To create/modify tables: write Alembic migrations and run `alembic upgrade head` on the VPS
  (or run migrations locally via an SSH tunnel to the VPS).
- Frontend never connects to Postgres directly. It calls backend APIs only.The following snippets may be helpful:
From alembic/env.py in local codebase:
```
Line 39:      def run_migrations_online() -> None:
Line 40:          connectable = engine_from_config(
Line 41:              config.get_section(config.config_ini_section, {}),
Line 42:              prefix="sqlalchemy.",
Line 43:              poolclass=pool.NullPool,
Line 44:          )
Line 45:      
Line 46:          with connectable.connect() as connection:
Line 47:              context.configure(
Line 48:                  connection=connection, target_metadata=target_metadata
Line 49:              )
Line 50:      
Line 51:              with context.begin_transaction():
Line 52:                  context.run_migrations()
Line 53:      
Line 54:      
Line 55:      if context.is_offline_mode():
Line 56:          run_migrations_offline()
Line 57:      else:
Line 58:          run_migrations_online()
```

From attached_assets/Pasted-Detailed-Development-Structure-Prompts-for-the-Cover-Ma_1766002444242.txt in local codebase:
```
Line 119:     3.	Debugging – Use Python’s logging module to record errors and key events. Enable FastAPI’s automatic docs for manual testing. On the client side, use browser dev tools and React Developer Tools.
Line 120:     4.	Deployment – Package backend in a Docker image using Uvicorn. Build the React app and serve the static files behind an Nginx or using a service like Vercel. Provide a docker-compose file to run the API and a PostgreSQL database together.
Line 121:     Prompt:
Line 122:     “Generate pytest test cases for the /templates/import endpoint to ensure that importing the Carrier_Bag_Case file creates the correct number of ProductTypeFields and ProductTypeFieldValues. Use pandas to inspect the file during the test.”
Line 123:     “Write a Dockerfile for the FastAPI backend that installs dependencies, copies source code, exposes port 8000 and runs Uvicorn. Write a docker-compose configuration that starts a PostgreSQL container and the API, sets environment variables (like DATABASE_URL), and defines appropriate volumes.”
Line 124:     5. Conclusion
```

From replit.md in local codebase:
```
Line 30:      ## Project Structure
Line 31:      
Line 32:      \`\`\`
Line 33:      /
Line 34:      ├── app/                    # Backend Python application
Line 35:      │   ├── api/               # API route handlers
Line 36:      │   ├── models/            # SQLAlchemy database models
Line 37:      │   ├── schemas/           # Pydantic request/response schemas
Line 38:      │   ├── services/          # Business logic services
Line 39:      │   ├── database.py        # Database configuration
Line 40:      │   ├── main.py           # FastAPI application entry
Line 41:      │   └── seed_data.py      # Database seeding script
Line 42:      ├── client/                # React frontend application
Line 43:      │   ├── src/
Line 44:      │   │   ├── components/   # Reusable UI components
Line 45:      │   │   ├── pages/        # Page components
Line 46:      │   │   ├── services/     # API client functions
Line 47:      │   │   └── types/        # TypeScript type definitions
Line 48:      │   └── package.json
Line 49:      └── cover_app.db          # SQLite database file
Line 50:      \`\`\`
Line 51:      
Line 52:      ## API Endpoints
```