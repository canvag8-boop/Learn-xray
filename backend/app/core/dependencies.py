from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User


def _get_demo_user(db: Session) -> User:
    """Return the demo_student user, raising 503 if not seeded yet."""
    user = db.query(User).filter(User.username == "demo_student").first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo account not found. Run seed data first.",
        )
    return user


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Extract and validate the current user from the JWT cookie or Authorization header.
    Falls back to the demo user when no token is present so the app works without login."""
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]

    # No token at all — serve as demo user (open access mode)
    if not token:
        return _get_demo_user(db)

    payload = decode_access_token(token)
    if payload is None:
        # Expired / invalid token — fall back to demo user
        return _get_demo_user(db)

    user_id = payload.get("sub")
    if user_id is None:
        return _get_demo_user(db)

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        return _get_demo_user(db)

    return user


def get_optional_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user if authenticated, None otherwise."""
    try:
        return get_current_user(request, db)
    except HTTPException:
        return None

