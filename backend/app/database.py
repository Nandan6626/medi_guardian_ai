import os
import urllib.parse
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool

# Load environment variables
load_dotenv()

raw_url = os.getenv("DATABASE_URL")

if raw_url:
    # Supabase/Postgres passwords often contain special characters.
    # Encode the password when the URL uses a username/password form.
    try:
        if "://" in raw_url and "@" in raw_url:
            protocol_part, rest = raw_url.split("://", 1)
            credentials, host_part = rest.split("@", 1)
            user, password = credentials.split(":", 1)
            encoded_password = urllib.parse.quote_plus(password)
            protocol_part = "postgresql+asyncpg" if protocol_part == "postgresql" else protocol_part
            SQLALCHEMY_DATABASE_URL = f"{protocol_part}://{user}:{encoded_password}@{host_part}"
        else:
            SQLALCHEMY_DATABASE_URL = raw_url.replace(
                "postgresql://", "postgresql+asyncpg://")
    except Exception as e:
        print(
            f"Warning: Failed to parse DATABASE_URL. Attempting direct connection. Error: {e}")
        SQLALCHEMY_DATABASE_URL = raw_url.replace(
            "postgresql://", "postgresql+asyncpg://")
else:
    db_path = Path(__file__).resolve().parents[1] / "mediguardian.db"
    SQLALCHEMY_DATABASE_URL = f"sqlite+aiosqlite:///{db_path.as_posix()}"

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )
else:
    # When using Supabase Transaction Pooler (port 6543), we shouldn't use SQLAlchemy's built-in pooling.
    # NullPool lets Supabase handle the connections.
    engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        echo=False,
        poolclass=NullPool,
        connect_args={
            "prepared_statement_cache_size": 0,
            "statement_cache_size": 0,
        },
    )

# Create sessionmaker
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

# Async Dependency for FastAPI endpoints


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
