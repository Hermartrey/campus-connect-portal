import pytest
from fastapi.testclient import TestClient
from main import app
from db.database import db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    db.clear()
    yield
    db.clear()

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def _signup_and_login_helper():
    db.clear()
    # Signup
    signup_data = {
        "email": "test@student.com",
        "password": "password123",
        "name": "Test Student",
        "role": "student"
    }
    res = client.post("/api/auth/signup", json=signup_data)
    assert res.status_code == 201

    # Login
    login_data = {
        "email": "test@student.com",
        "password": "password123"
    }
    res = client.post("/api/auth/login", json=login_data)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["user"]["email"] == "test@student.com"
    return data["user"]["id"]

def test_signup_and_login():
    _signup_and_login_helper()

def test_get_students():
    student_id = _signup_and_login_helper()
    
    res = client.get("/api/students")
    assert res.status_code == 200
    students = res.json()
    assert len(students) == 1
    assert students[0]["id"] == student_id

def test_submit_enrollment():
    student_id = _signup_and_login_helper()
    
    enroll_data = {
        "firstName": "Test",
        "lastName": "Student",
        "gradeLevel": "grade-9"
    }
    res = client.post(f"/api/students/{student_id}/enroll", json=enroll_data)
    assert res.status_code == 200
    
    res = client.get(f"/api/students/{student_id}")
    student = res.json()
    assert student["enrollmentStatus"] == "pending"
    assert student["gradeLevel"] == "grade-9"
    assert student["enrollmentData"]["firstName"] == "Test"

def test_tuition_config():
    res = client.get("/api/tuition/config")
    assert res.status_code == 200
    config = res.json()
    assert len(config["rates"]) > 0
    assert config["rates"][0]["gradeLevel"] == "grade-7"

def test_add_payment():
    student_id = _signup_and_login_helper()
    
    payment_data = {
        "id": "temp",
        "amount": 500.0,
        "date": "2026-03-07T00:00:00Z",
        "status": "pending",
        "description": "Tuition downpayment"
    }
    
    res = client.post(f"/api/students/{student_id}/payments", json=payment_data)
    assert res.status_code == 200
    assert "paymentId" in res.json()
    
    payment_id = res.json()["paymentId"]
    
    # Confirm
    res = client.put(f"/api/students/{student_id}/payments/{payment_id}/confirm")
    assert res.status_code == 200
    
    res = client.get(f"/api/students/{student_id}")
    student = res.json()
    assert student["payments"][0]["status"] == "completed"
