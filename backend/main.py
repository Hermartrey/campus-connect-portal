from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from routes import auth, students, payments, settings, notifications
from db.session import create_tables, SessionLocal
from db.models import UserRow

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_tables()
    db = SessionLocal()
    try:
        _seed_admin(db)
    finally:
        db.close()
    yield
    # Shutdown logic (if any) can go here


app = FastAPI(title="Campus Connect Portal API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(payments.router, prefix="/api/students", tags=["Payments"])
app.include_router(settings.router, prefix="/api", tags=["Settings", "Tuition"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])


def _seed_admin(db):
    """Ensure a default admin account always exists."""
    from datetime import datetime, timezone
    existing = db.query(UserRow).filter(UserRow.email == "admin@school.com").first()
    if not existing:
        admin = UserRow(
            id="admin-1",
            email="admin@school.com",
            name="School Admin",
            role="admin",
            password="admin123",
            created_at=datetime.now(timezone.utc),
        )
        db.add(admin)
        db.commit()


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)


if __name__ == "__main__":
    main()
