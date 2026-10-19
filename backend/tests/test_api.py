import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_auth_headers():
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app"] == "LearnX-Ray"


def test_demo_login():
    response = client.post("/api/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "demo@learnxray.com"
    assert "access_token" in data
    assert response.cookies.get("access_token") is not None


def test_concepts_list():
    headers = get_auth_headers()
    response = client.get("/api/concepts", headers=headers)
    assert response.status_code == 200
    concepts = response.json()
    assert len(concepts) >= 5


def test_concept_graph():
    headers = get_auth_headers()
    response = client.get("/api/concepts/graph", headers=headers)
    assert response.status_code == 200
    graph = response.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) >= 5


def test_dashboard():
    headers = get_auth_headers()
    response = client.get("/api/dashboard", headers=headers)
    assert response.status_code == 200
    dash = response.json()
    assert "stats" in dash
    assert "user" in dash


def test_assessment_flow():
    headers = get_auth_headers()

    # 1. Create diagnostic assessment
    create_res = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers)
    assert create_res.status_code == 200
    assessment_id = create_res.json()["id"]

    # 2. Get assessment and next question
    get_res = client.get(f"/api/assessments/{assessment_id}", headers=headers)
    assert get_res.status_code == 200
    data = get_res.json()
    question = data["next_question"]
    assert question is not None
    # Crucial security verification: Correct answer MUST NOT be in the question payload!
    assert "correct_answer" not in question

    # 3. Submit an answer
    ans_res = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={
            "question_id": question["id"],
            "selected_answer": question["choices"][0]["label"],
            "response_time_seconds": 12.5,
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

    # 4. Complete assessment
    comp_res = client.post(f"/api/assessments/{assessment_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert "assessment" in comp_data


def test_tutor_conversation():
    headers = get_auth_headers()

    # Create tutor session
    create_res = client.post(
        "/api/tutor/sessions",
        json={"mode": "beginner"},
        headers=headers,
    )
    assert create_res.status_code == 200
    session_id = create_res.json()["id"]
    assert len(create_res.json()["messages"]) >= 1

    # Send message to tutor
    msg_res = client.post(
        f"/api/tutor/sessions/{session_id}/messages",
        json={"content": "Can you explain how to apply the power rule?"},
        headers=headers,
    )
    assert msg_res.status_code == 200
    res_data = msg_res.json()
    assert "assistant_message" in res_data
    assert len(res_data["assistant_message"]["content"]) > 10


def test_learning_path_and_lessons():
    headers = get_auth_headers()

    # Get learning path
    path_res = client.get("/api/learning/path", headers=headers)
    assert path_res.status_code == 200
    path_data = path_res.json()
    assert "recommendations" in path_data

    # Get lesson content
    lesson_res = client.get("/api/learning/lessons/1", headers=headers)
    assert lesson_res.status_code == 200
    lesson_data = lesson_res.json()
    assert "concept_name" in lesson_data
    assert "lessons" in lesson_data


def test_demo_status():
    res = client.get("/api/demo/status")
    assert res.status_code == 200
    data = res.json()
    assert data["concepts_count"] >= 5
    assert data["questions_count"] >= 10
    assert data["demo_user_exists"] is True
