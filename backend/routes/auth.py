from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import uuid

from db.deps import get_db
from db.models import UserRow, StudentRow
from models.models import User, AuthResponse, UserRole

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: UserRole


class ProfileUpdateRequest(BaseModel):
    name: str
    email: str


class PasswordChangeRequest(BaseModel):
    oldPassword: str
    newPassword: str


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserRow).filter(UserRow.email == request.email).first()
    if not user or user.password != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_model = User(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        createdAt=user.created_at,
    )
    return {"success": True, "user": user_model, "token": f"mock-token-{user.id}"}


@router.post("/signup", status_code=201)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(UserRow).filter(UserRow.email == request.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")

    new_id = f"{request.role.value}-{uuid.uuid4()}"
    now = datetime.now(timezone.utc)

    user = UserRow(
        id=new_id,
        email=request.email,
        name=request.name,
        role=request.role.value,
        password=request.password,
        created_at=now,
    )
    db.add(user)

    if request.role == UserRole.student:
        student = StudentRow(
            id=new_id,
            enrollment_status="not_enrolled",
            tuition_balance=0.0,
        )
        db.add(student)

    db.commit()
    return {"message": "User created"}


@router.put("/profile")
def update_profile(request: ProfileUpdateRequest, user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserRow).filter(UserRow.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = request.name
    user.email = request.email
    db.commit()
    return {"message": "Profile updated"}


@router.put("/password")
def change_password(request: PasswordChangeRequest, user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserRow).filter(UserRow.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.password != request.oldPassword:
        raise HTTPException(status_code=400, detail="Incorrect old password")

    user.password = request.newPassword
    db.commit()
    return {"message": "Password changed"}
