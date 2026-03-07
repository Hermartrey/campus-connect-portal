from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from db.database import db
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
def login(request: LoginRequest):
    for user_id, user_data in db.users.items():
        if user_data["email"] == request.email and user_data["password"] == request.password:
            user_model = User(**user_data)
            return {"success": True, "user": user_model, "token": "mock-token-123"}
    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/signup", status_code=201)
def signup(request: SignupRequest):
    for user_data in db.users.values():
        if user_data["email"] == request.email:
            raise HTTPException(status_code=409, detail="Email already exists")

    new_id = f"{request.role.value}-{uuid.uuid4()}"
    new_user = {
        "id": new_id,
        "email": request.email,
        "name": request.name,
        "role": request.role,
        "password": request.password,
        "createdAt": datetime.utcnow()
    }
    db.users[new_id] = new_user

    if request.role == UserRole.student:
        db.students[new_id] = {
            **new_user,
            "enrollmentStatus": "not_enrolled",
            "tuitionBalance": 0.0,
            "payments": []
        }
    return {"message": "User created"}


@router.put("/profile")
def update_profile(request: ProfileUpdateRequest, user_id: str = "student-123"): # Mokcing auth middleware for now
    if user_id not in db.users:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.users[user_id]["name"] = request.name
    db.users[user_id]["email"] = request.email
    
    if user_id in db.students:
        db.students[user_id]["name"] = request.name
        db.students[user_id]["email"] = request.email
        
    return {"message": "Profile updated"}


@router.put("/password")
def change_password(request: PasswordChangeRequest, user_id: str = "student-123"): # Mokcing auth
    if user_id not in db.users:
        raise HTTPException(status_code=404, detail="User not found")
        
    if db.users[user_id]["password"] != request.oldPassword:
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    db.users[user_id]["password"] = request.newPassword
    return {"message": "Password changed"}
