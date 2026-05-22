import os
import urllib.parse
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import NullPool

# Load environment variables
load_dotenv()

# We expect a format like: postgresql://postgres.REF:PASSWORD@aws-1-region.pooler.supabase.com:6543/postgres
raw_url = os.getenv("DATABASE_URL")

if not raw_url:
    raise ValueError("DATABASE_URL environment variable is not set in .env")

# Supabase passwords often contain special characters.
# We must URL encode the password to safely parse it into the asyncpg URL.
# Let's split the URL to encode the password part safely.
try:
    if "@" in raw_url and "://" in raw_url:
        protocol_part, rest = raw_url.split("://", 1)
        credentials, host_part = rest.split("@", 1)
        user, password = credentials.split(":", 1)
        
        encoded_password = urllib.parse.quote_plus(password)
        
        # Replace the postgresql:// with postgresql+asyncpg:// for the async driver
        protocol_part = "postgresql+asyncpg" if protocol_part == "postgresql" else protocol_part
        
        SQLALCHEMY_DATABASE_URL = f"{protocol_part}://{user}:{encoded_password}@{host_part}"
    else:
        # Fallback for local sqlite or already encoded URLs
        SQLALCHEMY_DATABASE_URL = raw_url.replace("postgresql://", "postgresql+asyncpg://")
except Exception as e:
    # If parsing fails, just try replacing the protocol
    print(f"Warning: Failed to parse credentials for encoding. Attempting direct connection. Error: {e}")
    SQLALCHEMY_DATABASE_URL = raw_url.replace("postgresql://", "postgresql+asyncpg://")

# Create AsyncEngine
# When using Supabase Transaction Pooler (port 6543), we shouldn't use SQLAlchemy's built-in pooling.
# We use NullPool to let Supabase handle the connections.
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,
    poolclass=NullPool, 
    # PgBouncer transaction mode does not support prepared statements
    connect_args={
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0
    }
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
