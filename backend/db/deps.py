"""
FastAPI dependency for database sessions.
Use `db: Session = Depends(get_db)` in route functions.
"""
from typing import Generator
from sqlalchemy.orm import Session
from db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
