from typing import Dict, List
from models.models import User, Student, Payment, TuitionConfig, Notification

class MockDatabase:
    def __init__(self):
        self.users: Dict[str, dict] = {}
        self.students: Dict[str, dict] = {}
        self.enrollment_open: bool = True
        self.tuition_config: dict = {
            "rates": [
                {"gradeLevel": "grade-7", "amount": 5000},
                {"gradeLevel": "grade-8", "amount": 5000},
                {"gradeLevel": "grade-9", "amount": 5500},
                {"gradeLevel": "grade-10", "amount": 5500},
                {"gradeLevel": "grade-11", "amount": 6000},
                {"gradeLevel": "grade-12", "amount": 6000},
            ],
            "lastUpdated": "2026-03-07T00:00:00Z"
        }
        self.notifications: List[dict] = []

    def clear(self):
        self.users.clear()
        self.students.clear()
        self.notifications.clear()
        self.enrollment_open = True
        self.tuition_config = {
            "rates": [
                {"gradeLevel": "grade-7", "amount": 5000},
                {"gradeLevel": "grade-8", "amount": 5000},
            ],
            "lastUpdated": "2026-03-07T00:00:00Z"
        }

db = MockDatabase()
