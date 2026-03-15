"""
Integration tests: Full student enrollment workflow.

Covers:
  - Student signup & login
  - Submitting enrollment form
  - Admin approves enrollment (status update)
  - Tuition balance set on approval
  - Student views own record
  - Reset enrollment
"""
from tests_integration.conftest import signup_student, login, get_student_id


def test_student_signup_then_login(client):
    signup_student(client)
    data = login(client, "student@test.com", "pw1234")
    assert data["user"]["role"] == "student"
    assert data["user"]["email"] == "student@test.com"
    assert data["token"] is not None


def test_status_is_not_enrolled_after_signup(client):
    signup_student(client)
    sid = get_student_id(client)
    student = client.get(f"/api/students/{sid}").json()
    assert student["enrollmentStatus"] == "not_enrolled"
    assert student["tuitionBalance"] == 0.0
    assert student["payments"] == []


def test_submit_enrollment_form(client):
    signup_student(client)
    sid = get_student_id(client)

    r = client.post(f"/api/students/{sid}/enroll", json={
        "firstName": "John",
        "lastName": "Doe",
        "gradeLevel": "grade-11",
        "guardianName": "Jane Doe",
        "guardianRelationship": "Mother",
        "guardianPhone": "09123456789",
        "paymentMethod": "cash",
        "paymentAmount": 6000.0,
    })
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["enrollmentStatus"] == "pending"
    assert student["enrollmentData"]["gradeLevel"] == "grade-11"
    assert student["enrollmentData"]["firstName"] == "John"
    assert student["enrollmentSubmittedAt"] is not None


def test_admin_approves_enrollment(client):
    signup_student(client)
    sid = get_student_id(client)
    client.post(f"/api/students/{sid}/enroll", json={"gradeLevel": "grade-9"})

    r = client.put(f"/api/students/{sid}/status", json={"status": "approved"})
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["enrollmentStatus"] == "approved"


def test_admin_rejects_enrollment(client):
    signup_student(client)
    sid = get_student_id(client)
    client.post(f"/api/students/{sid}/enroll", json={"gradeLevel": "grade-9"})

    r = client.put(f"/api/students/{sid}/status", json={"status": "rejected"})
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["enrollmentStatus"] == "rejected"


def test_update_tuition_balance(client):
    signup_student(client)
    sid = get_student_id(client)

    r = client.put(f"/api/students/{sid}/balance", json={"newBalance": 5500.0})
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 5500.0


def test_reset_student_enrollment(client):
    signup_student(client)
    sid = get_student_id(client)
    client.post(f"/api/students/{sid}/enroll", json={"gradeLevel": "grade-10"})
    client.put(f"/api/students/{sid}/status", json={"status": "approved"})

    r = client.post(f"/api/students/{sid}/reset-enrollment")
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["enrollmentStatus"] == "not_enrolled"
    assert student["enrollmentData"] is None


def test_multiple_students_listed(client):
    signup_student(client, email="s1@test.com", name="Student One")
    signup_student(client, email="s2@test.com", name="Student Two")
    signup_student(client, email="s3@test.com", name="Student Three")

    r = client.get("/api/students/")
    assert r.status_code == 200
    students = r.json()
    assert len(students) == 3


def test_delete_student(client):
    signup_student(client)
    sid = get_student_id(client)

    r = client.delete(f"/api/students/{sid}")
    assert r.status_code == 204

    # Should be gone
    students = client.get("/api/students/").json()
    assert not any(s["id"] == sid for s in students)


def test_full_enrollment_flow(client):
    """Complete happy path: signup → enroll → approve → balance set."""
    signup_student(client, email="full@test.com", name="Full Flow")
    sid = get_student_id(client)

    # Submit enrollment
    client.post(f"/api/students/{sid}/enroll", json={
        "firstName": "Full",
        "lastName": "Flow",
        "gradeLevel": "grade-12",
        "paymentMethod": "bank",
        "paymentAmount": 6000.0,
    })

    s = client.get(f"/api/students/{sid}").json()
    assert s["enrollmentStatus"] == "pending"

    # Admin approves
    client.put(f"/api/students/{sid}/status", json={"status": "approved"})

    # Set tuition balance
    client.put(f"/api/students/{sid}/balance", json={"newBalance": 6000.0})

    s = client.get(f"/api/students/{sid}").json()
    assert s["enrollmentStatus"] == "approved"
    assert s["tuitionBalance"] == 6000.0
