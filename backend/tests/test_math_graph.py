import pytest
import sympy as sp
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def get_demo_headers():
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_mathematical_derivatives_correctness():
    """Verify standard calculus derivatives via SymPy symbolic mathematics."""
    x = sp.Symbol('x')

    # Expected: d/dx(x^2 + 3x) = 2x + 3
    expr1 = x**2 + 3*x
    assert sp.diff(expr1, x) == 2*x + 3

    # Expected: d/dx(x^3) = 3x^2
    expr2 = x**3
    assert sp.diff(expr2, x) == 3*x**2

    # Expected: d/dx(5x^4) = 20x^3
    expr3 = 5*x**4
    assert sp.diff(expr3, x) == 20*x**3

    # Expected: d/dx(7) = 0
    expr4 = sp.Integer(7)
    assert sp.diff(expr4, x) == 0

    # Expected: d/dx(3x^2 - 2x + 4) = 6x - 2
    expr5 = 3*x**2 - 2*x + 4
    assert sp.diff(expr5, x) == 6*x - 2


def test_knowledge_graph_structure():
    headers = get_demo_headers()
    response = client.get("/api/concepts/graph", headers=headers)
    assert response.status_code == 200
    graph = response.json()

    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) >= 10
    assert len(graph["edges"]) >= 5

    # Check node structure
    node = graph["nodes"][0]
    assert "id" in node
    assert "name" in node
    assert "difficulty" in node
    assert "mastery_level" in node
    assert "confidence_score" in node

    # Check edge structure
    edge = graph["edges"][0]
    assert "source" in edge
    assert "target" in edge


import uuid

def test_unassessed_concept_not_marked_weak():
    """Unassessed concepts must have mastery_level='unassessed', never 'needs_practice'."""
    suffix = uuid.uuid4().hex[:8]
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": f"fresh_graph_{suffix}@learnxray.com",
            "username": f"fresh_user_{suffix}",
            "display_name": "Fresh User",
            "password": "password123",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    graph_res = client.get("/api/concepts/graph", headers=headers)
    assert graph_res.status_code == 200
    graph = graph_res.json()

    for node in graph["nodes"]:
        assert node["mastery_level"] == "unassessed", f"Concept {node['name']} was prematurely marked as {node['mastery_level']}"


def test_single_correct_answer_does_not_establish_mastery():
    """A single correct attempt should not mark a concept as 'mastered' (requires >= 3 attempts)."""
    suffix = uuid.uuid4().hex[:8]
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": f"single_attempt_{suffix}@learnxray.com",
            "username": f"single_{suffix}",
            "display_name": "Single Attempt User",
            "password": "password123",
        },
    )
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Start assessment and answer 1 question correctly
    session_id = client.post("/api/assessments", json={"session_type": "diagnostic"}, headers=headers).json()["id"]
    ans_res = client.post(
        f"/api/assessments/{session_id}/answers",
        json={"question_id": 1, "selected_answer": "A"},  # Correct for Power Rule
        headers=headers,
    )
    assert ans_res.status_code == 200

    # Inspect concept graph for this user
    graph = client.get("/api/concepts/graph", headers=headers).json()
    power_rule_node = next(n for n in graph["nodes"] if n["name"] == "Power Rule")
    # Must NOT be 'mastered' because it only has 1 attempt
    assert power_rule_node["mastery_level"] != "mastered"
    assert power_rule_node["mastery_level"] in ("needs_practice", "developing")


def test_prerequisite_graph_dag_no_cycles():
    """Verify that the concept prerequisite graph contains no cyclic dependencies."""
    headers = get_demo_headers()
    graph = client.get("/api/concepts/graph", headers=headers).json()
    nodes = {n["id"] for n in graph["nodes"]}
    adj = {n: [] for n in nodes}
    for e in graph["edges"]:
        adj[e["source"]].append(e["target"])

    visited = {}

    def has_cycle(u):
        visited[u] = "visiting"
        for v in adj.get(u, []):
            if visited.get(v) == "visiting":
                return True
            if visited.get(v) is None:
                if has_cycle(v):
                    return True
        visited[u] = "visited"
        return False

    cycle_detected = False
    for n in nodes:
        if visited.get(n) is None:
            if has_cycle(n):
                cycle_detected = True
                break

    assert not cycle_detected, "Cyclic dependency detected in concept prerequisites!"
