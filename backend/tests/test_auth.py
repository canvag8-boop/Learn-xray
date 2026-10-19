import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


import uuid

def test_successful_registration():
    unique_suffix = uuid.uuid4().hex[:8]
    response = client.post(
        "/api/auth/register",
        json={
            "email": f"student_{unique_suffix}@learnxray.com",
            "username": f"user_{unique_suffix}",
            "display_name": "Test Student",
            "password": "securepassword123",
            "grade": "JEE Aspirant",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == f"student_{unique_suffix}@learnxray.com"
    assert "access_token" in data
    assert response.cookies.get("access_token") is not None


def test_duplicate_registration_email():
    # Attempt to register with the same email as demo student or previous test student
    response = client.post(
        "/api/auth/register",
        json={
            "email": "demo@learnxray.com",
            "username": "different_username",
            "display_name": "Duplicate Email Student",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_duplicate_registration_username():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "unique_email_123@learnxray.com",
            "username": "demo_student",
            "display_name": "Duplicate Username Student",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]


def test_invalid_email_format():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "not-an-email",
            "username": "valid_user_abc",
            "display_name": "Valid User",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 422


def test_missing_required_fields():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "missing_password@learnxray.com",
            "username": "missing_pwd_user",
        },
    )
    assert response.status_code == 422


def test_invalid_short_password():
    response = client.post(
        "/api/auth/register",
        json={
            "email": "short_pwd@learnxray.com",
            "username": "short_pwd_user",
            "display_name": "Short Pwd",
            "password": "123",  # Less than min 6 chars
        },
    )
    assert response.status_code == 422


def test_successful_login():
    response = client.post(
        "/api/auth/login",
        json={
            "username": "demo_student",
            "password": "demo123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["username"] == "demo_student"
    assert "access_token" in data
    assert response.cookies.get("access_token") is not None


def test_incorrect_password():
    response = client.post(
        "/api/auth/login",
        json={
            "username": "demo_student",
            "password": "wrongpassword999",
        },
    )
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]


def test_logout():
    response = client.post("/api/auth/logout")
    assert response.status_code == 200
    assert "Logged out successfully" in response.json()["message"]


def test_protected_route_without_auth():
    # Make request with empty cookies and no Authorization header
    unauthed_client = TestClient(app)
    response = unauthed_client.get("/api/dashboard")
    assert response.status_code == 401


def test_invalid_or_expired_token():
    response = client.get(
        "/api/dashboard",
        headers={"Authorization": "Bearer invalid.token.payload"},
    )
    assert response.status_code == 401


def test_update_profile():
    # Login first
    login_res = client.post(
        "/api/auth/login",
        json={"username": "demo_student", "password": "demo123"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    update_res = client.put(
        "/api/auth/profile",
        json={
            "display_name": "Demo Student Pro",
            "grade": "JEE Advanced 2025",
            "learning_goal": "Master Calculus Integration & Differentiation",
        },
        headers=headers,
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["display_name"] == "Demo Student Pro"
    assert updated_data["grade"] == "JEE Advanced 2025"
    assert updated_data["learning_goal"] == "Master Calculus Integration & Differentiation"
