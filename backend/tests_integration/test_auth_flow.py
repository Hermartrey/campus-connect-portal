"""
Integration tests: Authentication workflows.

Covers:
  - Signup (student and admin roles)
  - Login success and failure
  - Duplicate email rejected
  - Password change
  - Profile update
"""
from tests_integration.conftest import signup_student, login


def test_admin_seeded_on_startup(client):
    """Admin account should exist without explicit signup."""
    data = login(client, "admin@school.com", "admin123")
    assert data["user"]["role"] == "admin"
    assert data["user"]["email"] == "admin@school.com"


def test_student_signup_creates_account(client):
    r = client.post("/api/auth/signup", json={
        "email": "new@test.com",
        "password": "secure123",
        "name": "New User",
        "role": "student",
    })
    assert r.status_code == 201

    data = login(client, "new@test.com", "secure123")
    assert data["success"] is True
    assert data["user"]["role"] == "student"


def test_duplicate_email_rejected(client):
    signup_student(client)
    r = client.post("/api/auth/signup", json={
        "email": "student@test.com",
        "password": "other123",
        "name": "Copy Cat",
        "role": "student",
    })
    assert r.status_code == 409


def test_wrong_password_rejected(client):
    signup_student(client)
    r = client.post("/api/auth/login", json={
        "email": "student@test.com",
        "password": "wrongpassword",
    })
    assert r.status_code == 401


def test_nonexistent_user_login_rejected(client):
    r = client.post("/api/auth/login", json={
        "email": "ghost@nowhere.com",
        "password": "whatever",
    })
    assert r.status_code == 401


def test_change_password(client):
    signup_student(client)
    data = login(client, "student@test.com", "pw1234")
    uid = data["user"]["id"]

    r = client.put(f"/api/auth/password?user_id={uid}", json={
        "oldPassword": "pw1234",
        "newPassword": "newpw9999",
    })
    assert r.status_code == 200

    # Old password should no longer work
    r2 = client.post("/api/auth/login", json={
        "email": "student@test.com", "password": "pw1234"
    })
    assert r2.status_code == 401

    # New password should work
    r3 = client.post("/api/auth/login", json={
        "email": "student@test.com", "password": "newpw9999"
    })
    assert r3.status_code == 200


def test_change_password_wrong_old_rejected(client):
    signup_student(client)
    data = login(client, "student@test.com", "pw1234")
    uid = data["user"]["id"]

    r = client.put(f"/api/auth/password?user_id={uid}", json={
        "oldPassword": "WRONG",
        "newPassword": "newpw9999",
    })
    assert r.status_code == 400


def test_update_profile(client):
    signup_student(client)
    data = login(client, "student@test.com", "pw1234")
    uid = data["user"]["id"]

    r = client.put(f"/api/auth/profile?user_id={uid}", json={
        "name": "Updated Name",
        "email": "updated@test.com",
    })
    assert r.status_code == 200

    # Verify login with new email
    r2 = client.post("/api/auth/login", json={
        "email": "updated@test.com", "password": "pw1234"
    })
    assert r2.status_code == 200
    assert r2.json()["user"]["name"] == "Updated Name"


def test_token_returned_on_login(client):
    signup_student(client)
    data = login(client, "student@test.com", "pw1234")
    assert data["token"] is not None
    assert len(data["token"]) > 0
