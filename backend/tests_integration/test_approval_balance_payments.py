"""
Integration tests: Outstanding balance & payments after enrollment approval.

Covers:
  - After approval, tuition balance is set and visible on the student record
  - Outstanding balance starts at 0 before approval
  - Pending payment does NOT reduce balance
  - Confirmed payment reduces outstanding balance correctly
  - Cancelled payment leaves balance unchanged
  - Multiple confirmed payments accumulate correctly
  - Payments Made count reflects only completed payments
  - Balance cannot go below zero (overpayment guard)
  - Full end-to-end: signup → enroll → approve → set balance → pay → confirm → verify balance
"""
from tests_integration.conftest import signup_student, get_student_id


# ── Helpers ───────────────────────────────────────────────────────────────────

def _enroll_and_approve(client, grade="grade-11", balance=6000.0):
    """Helper: signup → enroll → approve → set tuition balance."""
    signup_student(client)
    sid = get_student_id(client)
    client.post(f"/api/students/{sid}/enroll", json={
        "gradeLevel": grade,
        "firstName": "Jane",
        "lastName": "Cruz",
        "paymentAmount": balance,
        "paymentMethod": "gcash",
    })
    client.put(f"/api/students/{sid}/status", json={"status": "approved"})
    client.put(f"/api/students/{sid}/balance", json={"newBalance": balance})
    return sid


def _add_payment(client, sid, amount, status="pending", description="Test Payment"):
    r = client.post(f"/api/students/{sid}/payments", json={
        "id": "temp",
        "amount": amount,
        "date": "2026-04-13T00:00:00",
        "status": status,
        "description": description,
    })
    assert r.status_code == 200, r.text
    return r.json()["paymentId"]


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_balance_is_zero_before_approval(client):
    """Student has no tuition balance until the admin sets it."""
    signup_student(client)
    sid = get_student_id(client)
    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 0.0
    assert student["payments"] == []


def test_balance_visible_after_approval_and_balance_set(client):
    """After approval + balance set, the student record shows the correct balance."""
    sid = _enroll_and_approve(client, grade="grade-10", balance=5500.0)
    student = client.get(f"/api/students/{sid}").json()

    assert student["enrollmentStatus"] == "approved"
    assert student["tuitionBalance"] == 5500.0


def test_pending_payment_does_not_reduce_balance(client):
    """A pending payment must NOT change the outstanding balance."""
    sid = _enroll_and_approve(client, balance=6000.0)

    _add_payment(client, sid, amount=1000.0, status="pending")

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 6000.0
    assert student["payments"][0]["status"] == "pending"


def test_confirmed_payment_reduces_balance(client):
    """Confirming a pending payment deducts the amount from the outstanding balance."""
    sid = _enroll_and_approve(client, balance=6000.0)
    pid = _add_payment(client, sid, amount=2000.0, status="pending")

    r = client.put(f"/api/students/{sid}/payments/{pid}/confirm")
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 4000.0   # 6000 - 2000
    assert student["payments"][0]["status"] == "completed"


def test_cancelled_payment_leaves_balance_unchanged(client):
    """Cancelling a pending payment must not change the balance."""
    sid = _enroll_and_approve(client, balance=6000.0)
    pid = _add_payment(client, sid, amount=1500.0, status="pending")

    r = client.put(f"/api/students/{sid}/payments/{pid}/cancel")
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 6000.0   # unchanged
    assert student["payments"][0]["status"] == "cancelled"


def test_payments_made_count_reflects_only_completed(client):
    """The completed payment count shown on dashboards is accurate."""
    sid = _enroll_and_approve(client, balance=9000.0)

    # 2 pending, 1 completed, 1 cancelled
    pid1 = _add_payment(client, sid, amount=1000.0, status="pending", description="P1")
    pid2 = _add_payment(client, sid, amount=2000.0, status="pending", description="P2")
    pid3 = _add_payment(client, sid, amount=3000.0, status="pending", description="P3")
    pid4 = _add_payment(client, sid, amount=500.0, status="pending", description="P4")

    client.put(f"/api/students/{sid}/payments/{pid3}/confirm")   # completed
    client.put(f"/api/students/{sid}/payments/{pid4}/cancel")    # cancelled

    student = client.get(f"/api/students/{sid}").json()
    completed = [p for p in student["payments"] if p["status"] == "completed"]
    pending = [p for p in student["payments"] if p["status"] == "pending"]
    cancelled = [p for p in student["payments"] if p["status"] == "cancelled"]

    assert len(completed) == 1
    assert len(pending) == 2
    assert len(cancelled) == 1
    assert student["tuitionBalance"] == 6000.0   # 9000 - 3000


def test_multiple_confirmed_payments_accumulate(client):
    """Multiple confirmed payments each correctly reduce the running balance."""
    sid = _enroll_and_approve(client, balance=9000.0)

    for amount in [1000.0, 2000.0, 1500.0]:
        pid = _add_payment(client, sid, amount=amount, status="pending")
        client.put(f"/api/students/{sid}/payments/{pid}/confirm")

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 4500.0   # 9000 - 4500
    assert len([p for p in student["payments"] if p["status"] == "completed"]) == 3


def test_balance_does_not_go_below_zero(client):
    """Confirming a payment larger than the balance should cap balance at 0."""
    sid = _enroll_and_approve(client, balance=500.0)
    pid = _add_payment(client, sid, amount=9999.0, status="pending")

    client.put(f"/api/students/{sid}/payments/{pid}/confirm")

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 0.0


def test_full_end_to_end_flow(client):
    """
    Complete happy-path:
    signup → enroll → admin approves → balance set → student makes payment →
    admin confirms payment → verify balance and payment status.
    """
    # 1. Student signs up
    signup_student(client, email="e2e@test.com", name="End To End")
    sid = get_student_id(client)

    # 2. Student submits enrollment for Grade 12
    r = client.post(f"/api/students/{sid}/enroll", json={
        "firstName": "End",
        "lastName": "ToEnd",
        "gradeLevel": "grade-12",
        "paymentMethod": "gcash",
        "paymentAmount": 7000.0,
    })
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["enrollmentStatus"] == "pending"
    assert student["tuitionBalance"] == 0.0   # not set yet

    # 3. Admin approves and sets the tuition balance
    client.put(f"/api/students/{sid}/status", json={"status": "approved"})
    client.put(f"/api/students/{sid}/balance", json={"newBalance": 7000.0})

    student = client.get(f"/api/students/{sid}").json()
    assert student["enrollmentStatus"] == "approved"
    assert student["tuitionBalance"] == 7000.0   # visible to student

    # 4. Student submits a payment of 3000
    pid = _add_payment(client, sid, amount=3000.0, status="pending",
                       description="First Installment")

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 7000.0   # still 7000 while pending
    assert student["payments"][0]["status"] == "pending"

    # 5. Admin confirms the payment
    r = client.put(f"/api/students/{sid}/payments/{pid}/confirm")
    assert r.status_code == 200

    student = client.get(f"/api/students/{sid}").json()
    assert student["tuitionBalance"] == 4000.0   # 7000 - 3000
    assert student["payments"][0]["status"] == "completed"

    # 6. Total paid amount calculation
    total_paid = sum(p["amount"] for p in student["payments"] if p["status"] == "completed")
    assert total_paid == 3000.0
