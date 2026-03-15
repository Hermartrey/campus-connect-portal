"""
Integration tests: Notifications and Settings workflows.

Covers:
  - Creating and fetching notifications by user
  - Mark as read / mark all as read
  - Clear notifications
  - Enrollment toggle (open/close)
  - Tuition rate CRUD
"""
from tests_integration.conftest import signup_student, get_student_id
import time


# ─── Notifications ───────────────────────────────────────────────────────────

def _create_notif(client, user_id, title="Test", message="Hello", type_="info"):
    return client.post("/api/notifications/", json={
        "id": "temp",
        "userId": user_id,
        "title": title,
        "message": message,
        "type": type_,
        "read": False,
        "createdAt": "2026-01-01T00:00:00",
    })


def test_create_and_fetch_notification(client):
    signup_student(client)
    uid = get_student_id(client)

    r = _create_notif(client, uid, title="Welcome", message="You signed up!")
    assert r.status_code == 201

    notes = client.get(f"/api/notifications/?userId={uid}").json()
    assert len(notes) == 1
    assert notes[0]["title"] == "Welcome"
    assert notes[0]["read"] is False


def test_notification_sorted_newest_first(client):
    signup_student(client)
    uid = get_student_id(client)

    _create_notif(client, uid, title="First")
    # Added tiny delay to ensure unique timestamps in SQLite for sorting
    time.sleep(0.01)
    _create_notif(client, uid, title="Second")
    time.sleep(0.01)
    _create_notif(client, uid, title="Third")

    notes = client.get(f"/api/notifications/?userId={uid}").json()
    assert notes[0]["title"] == "Third"
    assert notes[-1]["title"] == "First"


def test_mark_notification_as_read(client):
    signup_student(client)
    uid = get_student_id(client)
    _create_notif(client, uid)

    notif_id = client.get(f"/api/notifications/?userId={uid}").json()[0]["id"]
    r = client.put(f"/api/notifications/{notif_id}/read")
    assert r.status_code == 200

    notes = client.get(f"/api/notifications/?userId={uid}").json()
    assert notes[0]["read"] is True


def test_mark_all_notifications_as_read(client):
    signup_student(client)
    uid = get_student_id(client)

    for i in range(4):
        _create_notif(client, uid, title=f"Note {i}")

    r = client.put(f"/api/notifications/read-all?userId={uid}")
    assert r.status_code == 200

    notes = client.get(f"/api/notifications/?userId={uid}").json()
    assert all(n["read"] for n in notes)


def test_clear_user_notifications(client):
    signup_student(client)
    uid = get_student_id(client)

    for _ in range(3):
        _create_notif(client, uid)

    r = client.delete(f"/api/notifications/?userId={uid}")
    assert r.status_code == 204

    notes = client.get(f"/api/notifications/?userId={uid}").json()
    assert notes == []


def test_admin_sees_all_notifications(client):
    signup_student(client, email="s1@test.com")
    signup_student(client, email="s2@test.com")

    students = client.get("/api/students/").json()
    uid1, uid2 = students[0]["id"], students[1]["id"]

    _create_notif(client, uid1, title="For S1")
    _create_notif(client, uid2, title="For S2")

    all_notes = client.get("/api/notifications/").json()
    assert len(all_notes) == 2


def test_mark_nonexistent_notification_returns_404(client):
    r = client.put("/api/notifications/does-not-exist/read")
    assert r.status_code == 404


# ─── Settings ────────────────────────────────────────────────────────────────

def test_enrollment_open_by_default(client):
    r = client.get("/api/settings/enrollment")
    assert r.status_code == 200
    assert r.json()["isOpen"] is True


def test_toggle_enrollment_closed(client):
    client.put("/api/settings/enrollment", json={"isOpen": False})
    r = client.get("/api/settings/enrollment")
    assert r.json()["isOpen"] is False


def test_toggle_enrollment_reopen(client):
    client.put("/api/settings/enrollment", json={"isOpen": False})
    client.put("/api/settings/enrollment", json={"isOpen": True})
    r = client.get("/api/settings/enrollment")
    assert r.json()["isOpen"] is True


def test_tuition_config_returns_all_grades(client):
    r = client.get("/api/tuition/config")
    assert r.status_code == 200
    data = r.json()
    grade_levels = [rate["gradeLevel"] for rate in data["rates"]]
    for grade in ["grade-7", "grade-8", "grade-9", "grade-10", "grade-11", "grade-12"]:
        assert grade in grade_levels


def test_update_existing_tuition_rate(client):
    client.get("/api/tuition/config")  # seed defaults
    client.put("/api/tuition/config", json={"gradeLevel": "grade-10", "amount": 7500})
    config = client.get("/api/tuition/config").json()
    g10 = next(r for r in config["rates"] if r["gradeLevel"] == "grade-10")
    assert g10["amount"] == 7500


def test_add_new_tuition_grade(client):
    client.get("/api/tuition/config")  # seed defaults
    client.put("/api/tuition/config", json={"gradeLevel": "grade-college", "amount": 12000})
    config = client.get("/api/tuition/config").json()
    extra = next((r for r in config["rates"] if r["gradeLevel"] == "grade-college"), None)
    assert extra is not None
    assert extra["amount"] == 12000
