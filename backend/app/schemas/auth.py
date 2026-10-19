from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9_]+$")
    display_name: str = Field(..., min_length=1, max_length=200)
    password: str = Field(..., min_length=6, max_length=128)
    grade: Optional[str] = "JEE Aspirant"


class UserLogin(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    display_name: str
    grade: Optional[str]
    learning_goal: Optional[str]
    is_demo: bool
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    grade: Optional[str] = None
    learning_goal: Optional[str] = None


class TokenResponse(BaseModel):
    message: str
    user: UserResponse
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"
