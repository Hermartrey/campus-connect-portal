import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Allow both local dev origins and the Render production URL
RENDER_URL = os.getenv("RENDER_EXTERNAL_URL", "")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8080",
]
if RENDER_URL:
    allowed_origins.append(RENDER_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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


# ---------- Serve frontend static files in production ----------
STATIC_DIR = Path(__file__).parent / "static"

if STATIC_DIR.exists():
    # Serve JS/CSS/images/assets from the Vite build
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """
        SPA catch-all: serve the file if it exists in the static build,
        otherwise return index.html so React Router can handle client-side routes.
        """
        # Exclude API routes from the SPA catch-all
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API route not found")

        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=3000, reload=True)


if __name__ == "__main__":
    main()
