import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_user_headers(username="demo_student", password="demo123"):
    login_res = client.post(
        "/api/auth/login",
        json={"username": username, "password": password},
    )
    if login_res.status_code != 200:
        # Try demo login
        login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_start_assessment():
    headers = get_user_headers()
    response = client.post(
        "/api/assessments",
        json={"session_type": "diagnostic"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["session_type"] == "diagnostic"
    assert data["status"] == "in_progress"


def test_question_security_and_answer_hiding():
    headers = get_user_headers()
    # Create new session
    session_res = client.post(
        "/api/assessments",
        json={"session_type": "diagnostic"},
        headers=headers,
    )
    assessment_id = session_res.json()["id"]

    # Fetch next question
    get_res = client.get(f"/api/assessments/{assessment_id}", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    question = data["next_question"]
    assert question is not None

    # CRITICAL: Confirm correct answer is NOT exposed to student before submission!
    assert "correct_answer" not in question
    for choice in question["choices"]:
        assert "is_correct" not in choice


def test_submit_correct_and_incorrect_answers():
    headers = get_user_headers()
    session_res = client.post(
        "/api/assessments",
        json={"session_type": "diagnostic"},
        headers=headers,
    )
    assessment_id = session_res.json()["id"]

    # Fetch next question
    get_res = client.get(f"/api/assessments/{assessment_id}", headers=headers)
    question = get_res.json()["next_question"]
    q_id = question["id"]

    # Submit an answer
    ans_res = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={
            "question_id": q_id,
            "selected_answer": question["choices"][0]["label"],
            "response_time_seconds": 15.0,
            "hint_used": False,
            "hints_revealed": 0,
        },
        headers=headers,
    )
    assert ans_res.status_code == 200
    ans_data = ans_res.json()
    assert "is_correct" in ans_data
    assert "correct_answer" in ans_data
    assert "explanation" in ans_data
    assert "response_id" in ans_data


def test_duplicate_submission_prevention():
    headers = get_user_headers()
    session_res = client.post(
        "/api/assessments",
        json={"session_type": "diagnostic"},
        headers=headers,
    )
    assessment_id = session_res.json()["id"]

    get_res = client.get(f"/api/assessments/{assessment_id}", headers=headers)
    question = get_res.json()["next_question"]
    q_id = question["id"]

    # First submission
    first_sub = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={
            "question_id": q_id,
            "selected_answer": "A",
            "response_time_seconds": 10.0,
        },
        headers=headers,
    )
    assert first_sub.status_code == 200

    # Duplicate submission to same question in same assessment must be rejected!
    duplicate_sub = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={
            "question_id": q_id,
            "selected_answer": "B",
            "response_time_seconds": 10.0,
        },
        headers=headers,
    )
    assert duplicate_sub.status_code == 400
    assert "Question already answered" in duplicate_sub.json()["detail"]


def test_nonexistent_question_id_rejection():
    headers = get_user_headers()
    session_res = client.post(
        "/api/assessments",
        json={"session_type": "diagnostic"},
        headers=headers,
    )
    assessment_id = session_res.json()["id"]

    response = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={
            "question_id": 9999999,  # Nonexistent
            "selected_answer": "A",
        },
        headers=headers,
    )
    assert response.status_code == 400
    assert "Question not found" in response.json()["detail"]


def test_complete_assessment_summary():
    headers = get_user_headers()
    session_res = client.post(
        "/api/assessments",
        json={"session_type": "diagnostic"},
        headers=headers,
    )
    assessment_id = session_res.json()["id"]

    # Answer at least one question
    get_res = client.get(f"/api/assessments/{assessment_id}", headers=headers)
    question = get_res.json()["next_question"]
    if question:
        client.post(
            f"/api/assessments/{assessment_id}/answers",
            json={
                "question_id": question["id"],
                "selected_answer": question["choices"][0]["label"],
            },
            headers=headers,
        )

    # Complete
    comp_res = client.post(f"/api/assessments/{assessment_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    summary = comp_res.json()
    assert summary["assessment"]["status"] == "completed"
    assert "questions_answered" in summary
    assert "accuracy" in summary
    assert "recommendations" in summary


def test_cross_user_assessment_isolation():
    # User 1 creates an assessment
    user1_headers = get_user_headers("demo_student", "demo123")
    res1 = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=user1_headers)
    assessment_id = res1.json()["id"]

    # User 2 registers and attempts to access User 1's assessment
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "user2_isolated@learnxray.com",
            "username": "user2_isolated",
            "display_name": "User Two",
            "password": "password123",
        },
    )
    if reg_res.status_code == 201:
        user2_token = reg_res.json()["access_token"]
    else:
        login_res = client.post(
            "/api/auth/login",
            json={"username": "user2_isolated", "password": "password123"},
        )
        user2_token = login_res.json()["access_token"]
    user2_headers = {"Authorization": f"Bearer {user2_token}"}

    # User 2 should NOT be able to view User 1's assessment (404 Not Found)
    unauthorized_view = client.get(f"/api/assessments/{assessment_id}", headers=user2_headers)
    assert unauthorized_view.status_code == 404

    # User 2 should NOT be able to submit answers to User 1's assessment
    unauthorized_submit = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={"question_id": 1, "selected_answer": "A"},
        headers=user2_headers,
    )
    assert unauthorized_submit.status_code == 400 or unauthorized_submit.status_code == 404
