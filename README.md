# LearnX-Ray ⚡

> **"Don't just learn the answer. Discover what's stopping you from understanding it."**

LearnX-Ray is an AI-powered adaptive learning platform designed for students preparing for competitive mathematics (JEE). Instead of treating mathematics as a checklist of formulas or simply revealing answers when a student fails, LearnX-Ray conducts **misconception diagnosis** through an interactive prerequisite knowledge graph.

---

## 🌟 Key Features

1. **Misconception Diagnosis Engine (X-Ray Inspector)**
   - When a student answers incorrectly, the engine generates candidate root-cause hypotheses (e.g. *Forgetting the inner derivative in chain rule* vs *Power rule exponent subtraction* vs *Algebraic prerequisite gap*).
   - Serves targeted **diagnostic follow-up questions** to isolate the root cause.
   - Adjusts confidence scores dynamically and prescribes tailored interventions.

2. **Topological Concept Knowledge Graph**
   - An interactive visual graph mapping prerequisite relationships across Differentiation (Basic Algebra, Exponents, Limits, Power Rule, Product/Quotient Rules, Chain Rule).
   - Live color-coded mastery tracking: **Mastered (≥80%)**, **Developing (40-79%)**, **Needs Practice (<40%)**, and **Unassessed**.
   - Click to inspect mathematical formulas, common pitfalls, and unlock paths.

3. **Prerequisite-Aware Learning Path**
   - Ranks recommendations by dependency priority—directing students to solidify upstream foundations before re-attempting composite calculus problems.
   - Built-in lesson modules and mathematical trap explanations with 1-click completion.

4. **Multi-Mode Socratic AI Tutor**
   - 5 pedagogical modes: **Beginner**, **Step-by-Step**, **Hint Only**, **JEE Exam Prep**, and **Practice**.
   - Built with deterministic fallback mode so the application runs with full fidelity even without third-party API keys configured.

5. **Diagnostic Progress Comparison**
   - Longitudinal delta reporting: compares baseline diagnostic results against post-intervention reassessments to demonstrate measurable performance improvement.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router v6, Lucide Icons, Canvas Confetti, Vanilla Glassmorphism CSS |
| **Backend** | Python 3.9+, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite / PostgreSQL-compatible schema |
| **Security** | JWT authentication (httpOnly cookies + Bearer auth), Bcrypt password hashing |
| **Testing** | Pytest, FastAPI TestClient |

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### 2. Backend Setup

```bash
cd backend

# Create virtual environment and install dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run backend test suite
PYTHONPATH=. pytest tests/test_api.py

# Start FastAPI server (runs on http://127.0.0.1:8000)
uvicorn app.main:app --reload --port 8000
```

> **Note:** The backend automatically initializes the database schema and seeds verified JEE Differentiation questions, concepts, and a demo student account on first launch.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (already prepared)
npm install

# Run frontend development server (runs on http://localhost:5173 with API proxy)
npm run dev
```

---

## 👤 Evaluator / Demo Credentials

For quick hackathon evaluation without filling out registration forms:
- Click **"Demo 1-Click"** in the top navigation bar or **"Quick Demo Login"** on the login page.
- Direct credentials:
  - **Username:** `demo_student`
  - **Password:** `demo123`
