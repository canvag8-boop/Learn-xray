from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import re

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.ai_service import ai_service, AIService

router = APIRouter(prefix="/api/settings", tags=["Settings"])


class AIConfigRequest(BaseModel):
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None


@router.get("/ai-config")
def get_ai_config(user: User = Depends(get_current_user)):
    """Check active AI provider status."""
    has_gemini = bool(settings.GEMINI_API_KEY)
    has_openai = bool(settings.OPENAI_API_KEY)

    return {
        "active_provider": ai_service.mode,
        "is_live_ai": ai_service.is_ai_available,
        "gemini_configured": has_gemini,
        "openai_configured": has_openai,
        "model": settings.GEMINI_MODEL if ai_service.mode == "gemini" else (settings.OPENAI_MODEL if ai_service.mode == "openai" else "sympy_offline_solver"),
    }


@router.post("/ai-config")
def update_ai_config(data: AIConfigRequest, user: User = Depends(get_current_user)):
    """Update Gemini or OpenAI API keys directly from the application."""
    updated = False

    env_lines = []
    env_file = ".env"
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            env_lines = f.readlines()

    env_dict = {}
    for line in env_lines:
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.strip().split("=", 1)
            env_dict[k] = v
    api_key_regex = r"^[A-Za-z0-9_\-\.]{10,128}$"

    if data.gemini_api_key:
        cleaned_gemini = data.gemini_api_key.strip()
        if not re.match(api_key_regex, cleaned_gemini):
            raise HTTPException(status_code=400, detail="Invalid Gemini API key format")
        settings.GEMINI_API_KEY = cleaned_gemini
        os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
        env_dict["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
        updated = True

    if data.openai_api_key:
        cleaned_openai = data.openai_api_key.strip()
        if not re.match(api_key_regex, cleaned_openai):
            raise HTTPException(status_code=400, detail="Invalid OpenAI API key format")
        settings.OPENAI_API_KEY = cleaned_openai
        os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
        env_dict["OPENAI_API_KEY"] = settings.OPENAI_API_KEY
        updated = True

    if updated:
        # Write to .env file for persistence across server restarts
        with open(env_file, "w") as f:
            for k, v in env_dict.items():
                f.write(f"{k}={v}\n")

        # Re-initialize the global AI service
        import app.services.ai_service as ai_mod
        ai_mod.ai_service = AIService()

    return {
        "success": True,
        "active_provider": ai_service.mode,
        "is_live_ai": ai_service.is_ai_available,
        "message": f"AI provider successfully updated to: {ai_service.mode.upper()}",
    }
