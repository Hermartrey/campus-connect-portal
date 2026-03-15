"""
Integration tests: Payment workflows.

Covers:
  - Adding a pending payment
  - Confirming a payment (balance reduces)
  - Cancelling a payment
  - Multiple payments accumulate
  - Completed payment deducts from balance immediately
"""
from tests_integration.conftest import signup_student, get_student_id


def _setup_student_with_balance(client, balance=6000.0):
    """Helper: signup + enroll + approve + set balance."""
    signup_student(client)
    sid = get_student_id(client)
    client.post(f"/api/students/{sid}/enroll", json={"gradeLevel": "grade-11"})
    client.put(f"/api/students/{sid}/status", json={"status": "approved"})
    client.put(f"/api/students/{sid}/balance", json={"newBalance": balance})
    return sid


def test_add_pending_payment(client):
    sid = _setup_student_with_balance(client)

    r = client.post(f"/api/students/{sid}/payments", json={
        "id": "temp", "amount": 1000.0, "date": "2026-01-01T00:00:00",
        "status": "pending", "description": "First installment",
    })
    assert r.status_code == 200
    assert "paymentId" in r.json()

    # Balance should NOT change for a pending payment
    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 6000.0
    assert len(student["payments"]) == 1
    assert student["payments"][0]["status"] == "pending"


def test_confirm_payment_reduces_balance(client):
    sid = _setup_student_with_balance(client, balance=6000.0)

    r = client.post(f"/api/students/{sid}/payments", json={
        "id": "temp", "amount": 2000.0, "date": "2026-01-01T00:00:00",
        "status": "pending", "description": "Installment",
    })
    payment_id = r.json()["paymentId"]

    # Confirm it
    r2 = client.put(f"/api/students/{sid}/payments/{payment_id}/confirm")
    assert r2.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 4000.0  # 6000 - 2000
    assert student["payments"][0]["status"] == "completed"


def test_cancel_payment_no_balance_change(client):
    sid = _setup_student_with_balance(client, balance=6000.0)

    r = client.post(f"/api/students/{sid}/payments", json={
        "id": "temp", "amount": 1500.0, "date": "2026-01-01T00:00:00",
        "status": "pending", "description": "To be cancelled",
    })
    payment_id = r.json()["paymentId"]

    r2 = client.put(f"/api/students/{sid}/payments/{payment_id}/cancel")
    assert r2.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 6000.0  # unchanged
    assert student["payments"][0]["status"] == "cancelled"


def test_completed_payment_deducts_immediately(client):
    sid = _setup_student_with_balance(client, balance=5500.0)

    r = client.post(f"/api/students/{sid}/payments", json={
        "id": "temp", "amount": 3000.0, "date": "2026-01-01T00:00:00",
        "status": "completed", "description": "Full payment",
    })
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 2500.0  # 5500 - 3000
    assert student["payments"][0]["status"] == "completed"


def test_balance_does_not_go_below_zero(client):
    sid = _setup_student_with_balance(client, balance=500.0)

    # Overpayment
    r = client.post(f"/api/students/{sid}/payments", json={
        "id": "temp", "amount": 9999.0, "date": "2026-01-01T00:00:00",
        "status": "completed", "description": "Overpayment",
    })
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 0.0  # capped at 0


def test_multiple_payments_accumulate(client):
    sid = _setup_student_with_balance(client, balance=6000.0)

    for i in range(3):
        client.post(f"/api/students/{sid}/payments", json={
            "id": "temp", "amount": 500.0, "date": "2026-01-01T00:00:00",
            "status": "pending", "description": f"Installment {i+1}",
        })

    student = client.get(f"/api/students/{sid}").json()
    assert len(student["payments"]) == 3


def test_confirm_nonexistent_payment_returns_404(client):
    sid = _setup_student_with_balance(client)
    r = client.put(f"/api/students/{sid}/payments/nonexistent-id/confirm")
    assert r.status_code == 404
