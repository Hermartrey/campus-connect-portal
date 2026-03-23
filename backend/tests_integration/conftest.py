"""
Shared fixtures for integration tests.
Uses a named shared in-memory SQLite DB so every part of the app
(startup events, request handlers) uses the same physical database.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import os

from sqlalchemy.pool import StaticPool

# Set TEST_DATABASE_URL before any imports that might use it
TEST_DATABASE_URL = "sqlite:///file:integration?mode=memory&cache=shared&uri=true"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

from main import app
from db.models import Base
from db import deps   # we override deps.get_db


test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False, "uri": True},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Apply override before any TestClient is created
app.dependency_overrides[deps.get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    """Fresh tables + seeded admin before every test."""
    from datetime import datetime, timezone
    from db.models import UserRow

    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    # Seed the default admin (mirrors main.py startup logic)
    db = TestingSessionLocal()
    try:
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
    finally:
        db.close()

    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# ── Small helpers ────────────────────────────────────────────────────────────

def signup_student(client, email="student@test.com", password="pw1234", name="Test Student"):
    r = client.post("/api/auth/signup", json={"email": email, "password": password,
                                               "name": name, "role": "student"})
    assert r.status_code == 201

    # Auto-verify the user so subsequent tests function normally
    from db.models import PendingRegistrationRow
    db = TestingSessionLocal()
    try:
        pending = db.query(PendingRegistrationRow).filter(PendingRegistrationRow.email == email).first()
        if pending:
            token = pending.verification_token
    finally:
        db.close()
        
    if pending:
        client.post("/api/auth/verify-code", json={"email": email, "code": token})


def login(client, email, password):
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    return r.json()


def get_student_id(client):
    students = client.get("/api/students/").json()
    assert len(students) > 0
    return students[0]["id"]
