from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from sqlalchemy.orm import Session
import uuid
import random

from db.deps import get_db
from db.models import UserRow, StudentRow, PendingRegistrationRow
from models.models import User, AuthResponse, UserRole
from utils.email import send_verification_email

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    role: UserRole


class VerifyCodeRequest(BaseModel):
    email: str
    code: str


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
        # Check if the user is in pending registrations
        pending = db.query(PendingRegistrationRow).filter(PendingRegistrationRow.email == request.email).first()
        if pending and pending.password == request.password:
            raise HTTPException(status_code=403, detail="Email not verified")
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

    now = datetime.now(timezone.utc)
    # Generate a random 6-digit code
    verification_token = f"{random.randint(100000, 999999)}"

    # Check if a pending registration already exists and update it, else create
    pending = db.query(PendingRegistrationRow).filter(PendingRegistrationRow.email == request.email).first()
    if pending:
        pending.name = request.name
        pending.role = request.role.value
        pending.password = request.password
        pending.verification_token = verification_token
        pending.created_at = now
    else:
        pending = PendingRegistrationRow(
            email=request.email,
            name=request.name,
            role=request.role.value,
            password=request.password,
            verification_token=verification_token,
            created_at=now,
        )
        db.add(pending)

    db.commit()

    # Attempt to send real email
    email_sent = send_verification_email(request.email, verification_token)

    if not email_sent:
        # Fallback to local console log if SMTP is unconfigured or fails
        print(f"\n[{now}] === EMAIL VERIFICATION ===")
        print(f"To: {request.email}")
        print(f"Code: {verification_token}")
        print("===============================\n")

    return {"message": "User created. Please check your email for the verification code."}

@router.post("/verify-code", response_model=AuthResponse)
def verify_code(request: VerifyCodeRequest, db: Session = Depends(get_db)):
    # Check if user already exists and is verified
    user = db.query(UserRow).filter(UserRow.email == request.email).first()
    if user and user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    pending = db.query(PendingRegistrationRow).filter(PendingRegistrationRow.email == request.email).first()
    if not pending:
        # If no pending and no user, the email doesn't exist
        raise HTTPException(status_code=400, detail="User not found or code expired")
        
    if pending.verification_token != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Code is valid, create actual UserRow and StudentRow
    new_id = f"{pending.role}-{uuid.uuid4()}"
    
    user = UserRow(
        id=new_id,
        email=pending.email,
        name=pending.name,
        role=pending.role,
        password=pending.password,
        created_at=pending.created_at,
    )
    db.add(user)

    if pending.role == UserRole.student.value:
        student = StudentRow(
            id=new_id,
            enrollment_status="not_enrolled",
            tuition_balance=0.0,
        )
        db.add(student)
        
    db.delete(pending)
    db.commit()
    
    user_model = User(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        createdAt=user.created_at,
    )
    return {"success": True, "user": user_model, "token": f"mock-token-{user.id}"}


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
