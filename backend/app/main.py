from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.seed.seed_data import seed_all
import app.models  # Ensures all models are imported and registered with Base

# Import API routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.assessments import router as assessments_router
from app.api.concepts import router as concepts_router
from app.api.diagnosis import router as diagnosis_router
from app.api.tutor import router as tutor_router
from app.api.learning import router as learning_router
from app.api.demo import router as demo_router
from app.api.settings import router as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()

    # Automatically seed demo data if database is new
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="LearnX-Ray: AI-powered adaptive learning & misconception diagnosis platform",
    lifespan=lifespan,
)

# CORS middleware
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]
if settings.cors_origins_list:
    for o in settings.cors_origins_list:
        if o not in origins:
            origins.append(o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# Register routes
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(assessments_router)
app.include_router(concepts_router)
app.include_router(diagnosis_router)
app.include_router(tutor_router)
app.include_router(learning_router)
app.include_router(demo_router)
app.include_router(settings_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "ai_mode": "online" if settings.ai_available else "fallback_demo",
    }
