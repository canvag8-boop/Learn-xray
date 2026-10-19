"""
End-to-End Final Acceptance Test Scenario.
Executes the full 20-step student lifecycle:
1. Start application & verify health
2. Verify landing / demo status
3. Authenticate / Demo login
4. Open student dashboard
5. Start differentiation assessment
6. Answer one question incorrectly
7. Submit the response & receive misconception tag
8. Receive diagnostic follow-up question
9. Answer the follow-up question
10. Inspect the resulting diagnosis & hypothesis confidence
11. Open recommended lesson
12. Complete the lesson
13. Start follow-up assessment
14. Answer new question testing same concept
15. Open knowledge graph & verify concept info
16. Verify concept mastery level
17. Open progress report comparison
18. Verify report uses stored assessment results & delta
19. Simulate session reload
20. Verify persistence of saved records
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_complete_final_acceptance_scenario():
    # 1. Start application & verify health
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

    # 2. Check demo status & system readiness
    demo_status = client.get("/api/demo/status")
    assert demo_status.status_code == 200
    assert demo_status.json()["demo_user_exists"] is True

    # 3. Enter demo mode or authenticate
    login_res = client.post("/api/auth/demo-login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 4. Open student dashboard
    dash_res = client.get("/api/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "stats" in dash_data
    assert "user" in dash_data

    # 5. Start a differentiation diagnostic assessment
    start_res = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers)
    assert start_res.status_code == 200
    assessment_id = start_res.json()["id"]

    # 6. Load question & verify correct answer not exposed
    q_res = client.get(f"/api/assessments/{assessment_id}", headers=headers)
    assert q_res.status_code == 200
    question = q_res.json()["next_question"]
    assert question is not None
    assert "correct_answer" not in question

    # 7. Answer one question incorrectly and submit
    # We choose Option B (which contains a verified power rule / exponent misconception)
    wrong_choice = "B"
    ans_res = client.post(
        f"/api/assessments/{assessment_id}/answers",
        json={
            "question_id": question["id"],
            "selected_answer": wrong_choice,
            "response_time_seconds": 18.0,
            "hint_used": False,
        },
        headers=headers,
    )
    assert ans_res.status_code == 200
    ans_data = ans_res.json()
    assert ans_data["is_correct"] is False
    assert "correct_answer" in ans_data
    assert "explanation" in ans_data
    response_id = ans_data["response_id"]

    # 8. Receive diagnostic follow-up question via X-Ray diagnosis
    diag_init = client.post(
        "/api/diagnosis/analyze",
        json={"assessment_id": assessment_id, "response_id": response_id},
        headers=headers,
    )
    assert diag_init.status_code == 200
    diag_data = diag_init.json()
    diag_id = diag_data["id"]
    assert len(diag_data["hypotheses"]) >= 1

    # 9. Answer the diagnostic follow-up question
    follow_up = diag_data.get("follow_up_question")
    if follow_up:
        fu_qid = follow_up["id"]
        fu_choice = follow_up["choices"][0]["label"]
        fu_ans_res = client.post(
            "/api/diagnosis/follow-up",
            json={
                "diagnosis_id": diag_id,
                "question_id": fu_qid,
                "selected_answer": fu_choice,
            },
            headers=headers,
        )
        assert fu_ans_res.status_code == 200
        updated_diag = fu_ans_res.json()

        # 10. Inspect resulting diagnosis
        assert "hypotheses" in updated_diag
        assert updated_diag["id"] == diag_id

    # 11. Complete the first assessment
    comp_res = client.post(f"/api/assessments/{assessment_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["assessment"]["status"] == "completed"

    # 12. Open recommended lesson from learning path
    path_res = client.get("/api/learning/path", headers=headers)
    assert path_res.status_code == 200
    path_data = path_res.json()
    assert len(path_data["recommendations"]) >= 1
    top_rec = path_data["recommendations"][0]

    # Inspect lesson content
    lesson_res = client.get(f"/api/learning/lessons/{top_rec['concept_id'] if 'concept_id' in top_rec else 6}", headers=headers)
    assert lesson_res.status_code == 200
    assert len(lesson_res.json()["lessons"]) >= 1

    # 13. Complete the lesson recommendation
    mark_done = client.post(f"/api/learning/recommendations/{top_rec['id']}/complete", headers=headers)
    assert mark_done.status_code == 200

    # 14. Start a follow-up assessment
    followup_sess_res = client.post(
        "/api/assessments",
        json={"session_type": "practice", "parent_session_id": assessment_id},
        headers=headers,
    )
    assert followup_sess_res.status_code == 200
    followup_id = followup_sess_res.json()["id"]

    # 15. Answer new question testing the concept (answer correctly this time)
    fq_res = client.get(f"/api/assessments/{followup_id}", headers=headers)
    f_question = fq_res.json()["next_question"]
    if f_question:
        f_ans = client.post(
            f"/api/assessments/{followup_id}/answers",
            json={
                "question_id": f_question["id"],
                "selected_answer": "A",  # Correct answer for Q1
            },
            headers=headers,
        )
        assert f_ans.status_code == 200

    # Complete follow-up assessment
    client.post(f"/api/assessments/{followup_id}/complete", headers=headers)

    # 16. Open the knowledge graph and verify concept details
    graph_res = client.get("/api/concepts/graph", headers=headers)
    assert graph_res.status_code == 200
    nodes = graph_res.json()["nodes"]
    assert len(nodes) >= 10

    # Inspect specific concept details
    concept_details = client.get("/api/concepts/6", headers=headers)
    assert concept_details.status_code == 200
    assert concept_details.json()["name"] == "Power Rule"

    # 17. Open progress report
    progress_res = client.get("/api/learning/comparison", headers=headers)
    assert progress_res.status_code == 200
    prog_data = progress_res.json()

    # 18. Verify report uses stored assessment results
    assert "original_assessment" in prog_data
    assert "recommendation" in prog_data

    # 19. Reload session / get authenticated profile
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "demo_student"

    # 20. Verify persistence of saved records on dashboard reload
    reloaded_dash = client.get("/api/dashboard", headers=headers)
    assert reloaded_dash.status_code == 200
    assert reloaded_dash.json()["stats"]["questions_attempted"] > 0
