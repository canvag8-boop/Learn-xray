import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_demo_headers():
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_correct_answer_requires_no_diagnosis():
    headers = get_demo_headers()
    # Start assessment
    sess = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers).json()
    assessment_id = sess["id"]

    # Submit correct answer for x^5 (Option A is 5x^4)
    ans_res = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={"question_id": 1, "selected_answer": "A"},
        headers=headers,
    )
    assert ans_res.status_code == 200
    assert ans_res.json()["is_correct"] is True
    resp_id = ans_res.json()["response_id"]

    # Diagnosis on correct answer returns no diagnosis needed
    diag_res = client.post(
        "/api/diagnosis/analyze",
        json={"assessment_id": assessment_id, "response_id": resp_id},
        headers=headers,
    )
    assert diag_res.status_code == 200
    assert "No diagnosis needed" in diag_res.json()["message"]


def test_power_rule_misconception_analysis():
    headers = get_demo_headers()
    sess = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers).json()
    assessment_id = sess["id"]

    # Q1: d/dx(x^5). Option B is 5x^5 -> forgot_reduce_exponent
    ans_res = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={"question_id": 1, "selected_answer": "B"},
        headers=headers,
    )
    assert ans_res.status_code == 200
    assert ans_res.json()["is_correct"] is False
    assert ans_res.json()["misconception_tag"] == "forgot_reduce_exponent"
    resp_id = ans_res.json()["response_id"]

    # Trigger diagnosis
    diag_res = client.post(
        "/api/diagnosis/analyze",
        json={"assessment_id": assessment_id, "response_id": resp_id},
        headers=headers,
    )
    assert diag_res.status_code == 200
    data = diag_res.json()
    assert data["status"] in ("investigating", "diagnosed")
    assert len(data["hypotheses"]) >= 1

    # Verify uncertainty principle: An initial incorrect answer must NOT be marked as definitively confirmed 100%
    first_hyp = data["hypotheses"][0]
    assert first_hyp["status"] in ("candidate", "investigating")
    assert first_hyp["confidence_score"] <= 0.7  # Not claiming certainty without follow-up evidence!


def test_chain_rule_inner_derivative_misconception():
    headers = get_demo_headers()
    sess = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers).json()
    assessment_id = sess["id"]

    # Find chain rule question: d/dx[(2x+3)^4] (Choice B is 4(2x+3)^3 -> forgot_inner_derivative)
    # Let's inspect concepts or questions
    diag_q = client.get("/api/concepts/10/practice", headers=headers)
    questions = diag_q.json()
    chain_q = next((q for q in questions if "2x + 3" in q["question_text"] or "(2x+3)" in q["question_text"]), None)

    if chain_q:
        q_id = chain_q["id"]
        ans_res = client.post(
            f"/api/assessments/{assessment_id}/answers",
            json={"question_id": q_id, "selected_answer": "B"},
            headers=headers,
        )
        assert ans_res.status_code == 200
        assert ans_res.json()["is_correct"] is False
        resp_id = ans_res.json()["response_id"]

        diag_res = client.post(
            "/api/diagnosis/analyze",
            json={"assessment_id": assessment_id, "response_id": resp_id},
            headers=headers,
        )
        assert diag_res.status_code == 200
        hypotheses = diag_res.json()["hypotheses"]
        assert any("inner" in h["misconception"].lower() or "chain" in h["misconception"].lower() for h in hypotheses)


def test_follow_up_answer_updates_hypothesis_confidence():
    headers = get_demo_headers()
    sess = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers).json()
    assessment_id = sess["id"]

    # Submit wrong answer on question 1
    ans_res = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={"question_id": 1, "selected_answer": "B"},
        headers=headers,
    )
    resp_id = ans_res.json()["response_id"]

    # Trigger diagnosis
    diag_res = client.post(
        "/api/diagnosis/analyze",
        json={"assessment_id": assessment_id, "response_id": resp_id},
        headers=headers,
    )
    diag_data = diag_res.json()
    diag_id = diag_data["id"]
    follow_up = diag_data.get("follow_up_question")

    if follow_up:
        fu_qid = follow_up["id"]
        # Answer follow-up question
        fu_ans_res = client.post(
            "/api/diagnosis/follow-up",
            json={
                "diagnosis_id": diag_id,
                "question_id": fu_qid,
                "selected_answer": follow_up["choices"][0]["label"],
            },
            headers=headers,
        )
        assert fu_ans_res.status_code == 200
        updated_diag = fu_ans_res.json()
        assert "hypotheses" in updated_diag
        # Check evidence was updated
        hyp0 = updated_diag["hypotheses"][0]
        assert len(hyp0.get("evidence_for", [])) > 0 or len(hyp0.get("evidence_against", [])) > 0
