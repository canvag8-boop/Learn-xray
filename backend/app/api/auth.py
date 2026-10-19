from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, UserProfileUpdate

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=(settings.ENVIRONMENT == "production"),
        max_age=86400,
    )


def _clear_auth_cookie(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=(settings.ENVIRONMENT == "production"),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, response: Response, db: Session = Depends(get_db)):
    """Register a new student account."""
    # Check existing
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=data.email,
        username=data.username,
        display_name=data.display_name,
        hashed_password=hash_password(data.password),
        grade=data.grade or "JEE Aspirant",
        learning_goal="Master Differentiation",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    _set_auth_cookie(response, token)

    return TokenResponse(
        message="Registration successful",
        user=UserResponse.model_validate(user),
        access_token=token,
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Log in with username and password."""
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(data={"sub": str(user.id)})
    _set_auth_cookie(response, token)

    return TokenResponse(
        message="Login successful",
        user=UserResponse.model_validate(user),
        access_token=token,
    )


@router.post("/logout")
def logout(response: Response):
    """Log out by clearing the auth cookie."""
    _clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Get the current authenticated user."""
    return UserResponse.model_validate(user)


@router.put("/profile", response_model=UserResponse)
def update_profile(data: UserProfileUpdate, user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    """Update user profile."""
    if data.display_name is not None:
        user.display_name = data.display_name
    if data.grade is not None:
        user.grade = data.grade
    if data.learning_goal is not None:
        user.learning_goal = data.learning_goal
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/demo-login", response_model=TokenResponse)
def demo_login(response: Response, db: Session = Depends(get_db)):
    """Quick login with the demo account. For development and demonstration only."""
    user = db.query(User).filter(User.username == "demo_student").first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found. Run seed data first.")

    token = create_access_token(data={"sub": str(user.id)})
    _set_auth_cookie(response, token)

    return TokenResponse(
        message="Demo login successful",
        user=UserResponse.model_validate(user),
        access_token=token,
    )

