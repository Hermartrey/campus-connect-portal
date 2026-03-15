"""
Database engine and session factory.
Reads DATABASE_URL from environment; defaults to SQLite for easy local dev.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./campus.db")

# SQLite needs check_same_thread=False for use with FastAPI.
# "uri": True is needed for shared-memory DBs in tests.
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "uri": True}
else:
    connect_args = {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all tables (called at startup)."""
    from db.models import Base  # noqa: import here to avoid circular imports
    Base.metadata.create_all(bind=engine)
