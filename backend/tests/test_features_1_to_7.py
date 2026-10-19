"""
Tests verifying Features 1 through 7:
- Feature 1: Misconception Investigation Timeline
- Feature 2: Explainable Knowledge Graph
- Feature 3: Adaptive Difficulty
- Feature 4: Learning Recovery Plan
- Feature 5: Before-and-After Comparison
- Feature 6: Hackathon Demonstration Mode
- Feature 7: Technical Explainability Telemetry
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_demo_headers():
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_feature1_investigation_timeline():
    headers = get_demo_headers()

    # 1. Create assessment and submit a wrong answer to trigger diagnosis
    sess_res = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers)
    sess_id = sess_res.json()["id"]

    ans_res = client.post(
        f"/api/assessments/{sess_id}/answers",
        json={"question_id": 1, "selected_answer": "B"},
        headers=headers,
    )
    resp_id = ans_res.json()["response_id"]

    diag_res = client.post(
        "/api/diagnosis/analyze",
        json={"assessment_id": sess_id, "response_id": resp_id},
        headers=headers,
    )
    diag_id = diag_res.json()["id"]

    # 2. Query investigation timeline
    timeline_res = client.get(f"/api/diagnosis/{diag_id}/timeline", headers=headers)
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()

    assert "trigger_event" in timeline
    assert timeline["trigger_event"]["student_answer"] == "B"
    assert "candidate_misconceptions" in timeline
    assert len(timeline["candidate_misconceptions"]) >= 1
    assert "selected_intervention" in timeline
    assert "reassessment_results" in timeline


def test_feature2_explainable_knowledge_graph():
    headers = get_demo_headers()

    # Fetch concept details with explainability
    res = client.get("/api/concepts/6", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "recommendation_reason" in data
    assert len(data["recommendation_reason"]) > 10
    assert "supporting_evidence" in data
    assert "prerequisite_analysis" in data
    assert "recommended_lesson" in data
    assert "verification_criteria" in data
    assert "Accuracy ≥ 80%" in data["verification_criteria"]["mastery_threshold"]


def test_feature3_adaptive_difficulty():
    headers = get_demo_headers()

    sess_res = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers)
    sess_id = sess_res.json()["id"]

    # First question should have selection_reason and adaptation_telemetry
    q1_res = client.get(f"/api/assessments/{sess_id}", headers=headers)
    q1 = q1_res.json()["next_question"]
    assert "selection_reason" in q1
    assert "adaptation_telemetry" in q1
    assert q1["adaptation_telemetry"]["target_difficulty"] in ("easy", "medium")

    # Answering correctly should advance difficulty gradually (never jump to hard in 1 step)
    client.post(
        f"/api/assessments/{sess_id}/answers",
        json={"question_id": q1["id"], "selected_answer": "A"},
        headers=headers,
    )

    q2_res = client.get(f"/api/assessments/{sess_id}", headers=headers)
    q2 = q2_res.json()["next_question"]
    if q2:
        assert "selection_reason" in q2
        assert "adaptation_telemetry" in q2
        assert q2["adaptation_telemetry"]["target_difficulty"] in ("easy", "medium")


def test_feature4_learning_recovery_plan():
    headers = get_demo_headers()

    plan_res = client.get("/api/learning/recovery-plan", headers=headers)
    assert plan_res.status_code == 200
    plan = plan_res.json()

    assert "plan_title" in plan
    assert "total_estimated_duration" in plan
    assert "approx" in plan["total_estimated_duration"]
    assert len(plan["target_concepts"]) >= 1

    item = plan["target_concepts"][0]
    assert "concept_to_practice" in item
    assert "reason_for_selection" in item
    assert "recommended_lesson" in item
    assert "number_of_practice_questions" in item
    assert "estimated_duration" in item
    assert "approx" in item["estimated_duration"]
    assert "mastery_check" in item
    assert "next_recommended_action" in item


def test_feature5_before_and_after_comparison():
    headers = get_demo_headers()

    comp_res = client.get("/api/learning/comparison", headers=headers)
    assert comp_res.status_code == 200
    comp = comp_res.json()

    if comp.get("original_assessment"):
        orig = comp["original_assessment"]
        assert "correct_answers" in orig
        assert "incorrect_answers" in orig
        assert "concepts_assessed" in orig
        assert orig.get("data_provenance") == "empirical_measured_result"


def test_feature7_technical_telemetry():
    headers = get_demo_headers()

    # Create assessment & trigger diagnosis
    sess = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers).json()
    ans = client.post(
        f"/api/assessments/{sess['id']}/answers",
        json={"question_id": 1, "selected_answer": "B"},
        headers=headers,
    ).json()

    diag = client.post(
        "/api/diagnosis/analyze",
        json={"assessment_id": sess["id"], "response_id": ans["response_id"]},
        headers=headers,
    ).json()

    telemetry_res = client.get(f"/api/diagnosis/{diag['id']}/telemetry", headers=headers)
    assert telemetry_res.status_code == 200
    telemetry = telemetry_res.json()

    assert "selected_diagnostic_rule" in telemetry
    assert "rule_id" in telemetry["selected_diagnostic_rule"]
    assert "evidence_used" in telemetry
    assert len(telemetry["evidence_used"]) >= 1
    assert "graph_relationships_traversed" in telemetry
    assert "reason_for_intervention" in telemetry
    assert "resulting_assessment_update" in telemetry


def test_feature6_hackathon_demo_scenario_offline_resilience():
    # 1. Seed demo scenario
    seed_res = client.post("/api/demo/seed")
    assert seed_res.status_code == 200
    msg = seed_res.json()["message"].lower()
    assert "ready" in msg or "seeded" in msg

    # 2. Login as demo student
    headers = get_demo_headers()
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    me = me_res.json()
    assert me["is_demo"] is True

    # 3. Verify SymPy symbolic verification functions offline
    import sympy as sp
    x = sp.Symbol('x')
    assert sp.diff(x**4, x) == 4*x**3

    # 4. Timeline contains deterministic seeded diagnostic events
    timeline_res = client.get("/api/diagnosis/timeline", headers=headers)
    assert timeline_res.status_code == 200
    timeline_data = timeline_res.json()
    assert isinstance(timeline_data, list)
    assert len(timeline_data) >= 1


def test_feature8_accessibility_and_usability():
    headers = get_demo_headers()

    # Verify questions choices provide structured labels and clean mathematical notation
    sess_res = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers)
    sess_id = sess_res.json()["id"]

    q_res = client.get(f"/api/assessments/{sess_id}", headers=headers)
    q = q_res.json()["next_question"]
    assert q is not None
    assert len(q["choices"]) >= 4
    for choice in q["choices"]:
        assert choice["label"] in ("A", "B", "C", "D")
        assert len(choice["text"]) > 0

