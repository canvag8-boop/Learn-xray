"""
Seed data for LearnX-Ray demo mode.
Contains verified JEE Mathematics - Differentiation content.
All questions have been manually verified for mathematical correctness.
"""
import json
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models import (
    User, Subject, Topic, Concept, ConceptPrerequisite,
    Question, AnswerChoice, Lesson,
)


def seed_all(db: Session):
    """Seed all demo data. Idempotent - checks before inserting."""
    if db.query(Subject).first():
        print("Database already seeded. Skipping.")
        return

    print("Seeding database with demo data...")
    _seed_demo_user(db)
    subject = _seed_subject(db)
    topic = _seed_topic(db, subject.id)
    concepts = _seed_concepts(db, topic.id)
    _seed_prerequisites(db, concepts)
    _seed_questions(db, topic.id, concepts)
    _seed_lessons(db, concepts)
    db.commit()
    print("Seeding complete!")


def _seed_demo_user(db: Session):
    demo_user = User(
        email="demo@learnxray.com",
        username="demo_student",
        display_name="Demo Student",
        hashed_password=hash_password("demo123"),
        grade="JEE Aspirant",
        learning_goal="Master Differentiation",
        is_demo=True,
    )
    db.add(demo_user)
    db.flush()


def _seed_subject(db: Session) -> Subject:
    subject = Subject(name="Mathematics", description="JEE Mathematics curriculum")
    db.add(subject)
    db.flush()
    return subject


def _seed_topic(db: Session, subject_id: int) -> Topic:
    topic = Topic(
        subject_id=subject_id,
        name="Differentiation",
        description="Differential calculus - finding derivatives of functions",
        order_index=1,
    )
    db.add(topic)
    db.flush()
    return topic


def _seed_concepts(db: Session, topic_id: int) -> dict:
    concept_data = [
        {
            "name": "Basic Algebra",
            "description": "Fundamental algebraic operations and simplification",
            "difficulty": "beginner",
            "explanation": "Basic algebra involves simplifying expressions, combining like terms, and applying the distributive property. For example, 3x + 2x = 5x, and a(b + c) = ab + ac.",
            "key_formulas": json.dumps(["(a+b)² = a² + 2ab + b²", "(a-b)² = a² - 2ab + b²", "a² - b² = (a+b)(a-b)"]),
            "common_mistakes": json.dumps(["Forgetting to distribute negative signs", "Incorrectly combining unlike terms", "Errors with fraction arithmetic"]),
            "order_index": 1,
        },
        {
            "name": "Exponent Rules",
            "description": "Laws of exponents including product, quotient, and power rules",
            "difficulty": "beginner",
            "explanation": "Exponent rules govern operations with powers. Key rules: x^a · x^b = x^(a+b), x^a / x^b = x^(a-b), (x^a)^b = x^(ab), x^0 = 1, x^(-n) = 1/x^n.",
            "key_formulas": json.dumps(["x^a · x^b = x^(a+b)", "x^a / x^b = x^(a-b)", "(x^a)^b = x^(ab)", "x^(-n) = 1/x^n"]),
            "common_mistakes": json.dumps(["Confusing x^a · x^b with x^(ab)", "Forgetting that x^0 = 1", "Errors with negative exponents"]),
            "order_index": 2,
        },
        {
            "name": "Functions and Notation",
            "description": "Understanding function notation, domain, and range",
            "difficulty": "beginner",
            "explanation": "A function f(x) maps each input x to exactly one output. f(x) = x² means 'square the input'. f(3) = 9. The derivative f'(x) represents the rate of change of f(x).",
            "key_formulas": json.dumps(["f(x) notation", "Domain and range", "Composition: (f∘g)(x) = f(g(x))"]),
            "common_mistakes": json.dumps(["Confusing f(x+h) with f(x) + h", "Not understanding that f'(x) is a new function"]),
            "order_index": 3,
        },
        {
            "name": "Limits (Intuitive)",
            "description": "Intuitive understanding of limits as a foundation for derivatives",
            "difficulty": "intermediate",
            "explanation": "A limit describes the value a function approaches as the input approaches a specific point. lim(x→a) f(x) = L means f(x) gets arbitrarily close to L as x approaches a. Derivatives are defined as limits of difference quotients.",
            "key_formulas": json.dumps(["lim(x→a) f(x) = L", "lim(h→0) [f(x+h) - f(x)] / h = f'(x)"]),
            "common_mistakes": json.dumps(["Confusing the limit with the function value", "Not understanding that the limit may exist even if f(a) is undefined"]),
            "order_index": 4,
        },
        {
            "name": "Definition of Derivative",
            "description": "First principles definition of a derivative using limits",
            "difficulty": "intermediate",
            "explanation": "The derivative of f(x) is defined as f'(x) = lim(h→0) [f(x+h) - f(x)] / h. This represents the instantaneous rate of change of f at x, or the slope of the tangent line to the graph at (x, f(x)).",
            "key_formulas": json.dumps(["f'(x) = lim(h→0) [f(x+h) - f(x)] / h", "f'(a) = slope of tangent at x = a"]),
            "common_mistakes": json.dumps(["Algebraic errors when expanding f(x+h)", "Forgetting to take the limit after simplifying", "Confusing average rate with instantaneous rate"]),
            "order_index": 5,
        },
        {
            "name": "Power Rule",
            "description": "Derivative of x^n is n·x^(n-1)",
            "difficulty": "intermediate",
            "explanation": "The power rule states: if f(x) = x^n, then f'(x) = n·x^(n-1). This works for all real numbers n, including negative and fractional exponents. Examples: d/dx(x³) = 3x², d/dx(x^(-2)) = -2x^(-3), d/dx(√x) = d/dx(x^(1/2)) = (1/2)x^(-1/2).",
            "key_formulas": json.dumps(["d/dx(x^n) = n·x^(n-1)", "d/dx(constant) = 0", "d/dx(x) = 1"]),
            "common_mistakes": json.dumps(["Forgetting to subtract 1 from the exponent", "Not recognizing √x as x^(1/2)", "Applying power rule to e^x (which requires a different rule)"]),
            "order_index": 6,
        },
        {
            "name": "Constant Multiple Rule",
            "description": "d/dx[c·f(x)] = c·f'(x)",
            "difficulty": "intermediate",
            "explanation": "The constant multiple rule states that the derivative of a constant times a function equals the constant times the derivative: d/dx[c·f(x)] = c·f'(x). For example, d/dx(5x³) = 5·3x² = 15x².",
            "key_formulas": json.dumps(["d/dx[c·f(x)] = c·f'(x)", "d/dx(c) = 0 for any constant c"]),
            "common_mistakes": json.dumps(["Differentiating the constant as well", "Confusing this with the product rule"]),
            "order_index": 7,
        },
        {
            "name": "Sum and Difference Rule",
            "description": "d/dx[f(x) ± g(x)] = f'(x) ± g'(x)",
            "difficulty": "intermediate",
            "explanation": "The sum/difference rule states: the derivative of a sum (or difference) equals the sum (or difference) of the derivatives. d/dx[f(x) + g(x)] = f'(x) + g'(x). For example, d/dx(x³ + 2x) = 3x² + 2.",
            "key_formulas": json.dumps(["d/dx[f(x) + g(x)] = f'(x) + g'(x)", "d/dx[f(x) - g(x)] = f'(x) - g'(x)"]),
            "common_mistakes": json.dumps(["Forgetting to differentiate all terms", "Sign errors when subtracting derivatives"]),
            "order_index": 8,
        },
        {
            "name": "Product Rule",
            "description": "d/dx[f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x)",
            "difficulty": "advanced",
            "explanation": "The product rule states: d/dx[f(x)·g(x)] = f'(x)·g(x) + f(x)·g'(x). Example: d/dx[x²·sin(x)] = 2x·sin(x) + x²·cos(x).",
            "key_formulas": json.dumps(["d/dx[f·g] = f'·g + f·g'", "(uv)' = u'v + uv'"]),
            "common_mistakes": json.dumps(["Using d/dx[f·g] = f'·g' (simply multiplying derivatives)", "Forgetting one of the two terms", "Applying product rule when constant multiple rule suffices"]),
            "order_index": 9,
        },
        {
            "name": "Chain Rule",
            "description": "d/dx[f(g(x))] = f'(g(x))·g'(x)",
            "difficulty": "advanced",
            "explanation": "The chain rule is used for composite functions: d/dx[f(g(x))] = f'(g(x))·g'(x). Think: 'derivative of the outer function, evaluated at the inner function, times the derivative of the inner function'. Example: d/dx[(3x+1)⁵] = 5(3x+1)⁴·3 = 15(3x+1)⁴.",
            "key_formulas": json.dumps(["d/dx[f(g(x))] = f'(g(x))·g'(x)", "dy/dx = (dy/du)·(du/dx)"]),
            "common_mistakes": json.dumps(["Forgetting the inner derivative g'(x)", "Misidentifying the inner and outer functions", "Not applying chain rule when there is a composite function"]),
            "order_index": 10,
        },
    ]

    concepts = {}
    for data in concept_data:
        c = Concept(topic_id=topic_id, **data)
        db.add(c)
        db.flush()
        concepts[data["name"]] = c

    return concepts


def _seed_prerequisites(db: Session, concepts: dict):
    """Create prerequisite edges in the knowledge graph."""
    prereqs = [
        ("Exponent Rules", "Basic Algebra"),
        ("Functions and Notation", "Basic Algebra"),
        ("Limits (Intuitive)", "Functions and Notation"),
        ("Definition of Derivative", "Limits (Intuitive)"),
        ("Definition of Derivative", "Functions and Notation"),
        ("Power Rule", "Definition of Derivative"),
        ("Power Rule", "Exponent Rules"),
        ("Constant Multiple Rule", "Power Rule"),
        ("Sum and Difference Rule", "Power Rule"),
        ("Sum and Difference Rule", "Constant Multiple Rule"),
        ("Product Rule", "Power Rule"),
        ("Product Rule", "Sum and Difference Rule"),
        ("Chain Rule", "Power Rule"),
        ("Chain Rule", "Product Rule"),
    ]

    for concept_name, prereq_name in prereqs:
        if concept_name in concepts and prereq_name in concepts:
            db.add(ConceptPrerequisite(
                concept_id=concepts[concept_name].id,
                prerequisite_id=concepts[prereq_name].id,
                strength="required",
            ))
    db.flush()


def _seed_questions(db: Session, topic_id: int, concepts: dict):
    """Seed verified differentiation questions."""
    questions_data = [
        # --- Power Rule Questions ---
        {
            "concept": "Power Rule",
            "question_text": "What is the derivative of f(x) = x⁵?",
            "difficulty": "easy",
            "correct_answer": "A",
            "explanation": "Using the power rule: d/dx(x⁵) = 5x⁴. Bring down the exponent as a coefficient and reduce the exponent by 1.",
            "hint_1": "The power rule says d/dx(xⁿ) = n·xⁿ⁻¹",
            "hint_2": "Here n = 5, so bring down 5 and subtract 1 from the exponent",
            "misconception_categories": json.dumps(["power_rule_basic"]),
            "choices": [
                {"label": "A", "text": "5x⁴", "is_correct": True, "misconception_tag": None},
                {"label": "B", "text": "5x⁵", "is_correct": False, "misconception_tag": "forgot_reduce_exponent"},
                {"label": "C", "text": "x⁴", "is_correct": False, "misconception_tag": "forgot_coefficient"},
                {"label": "D", "text": "4x⁵", "is_correct": False, "misconception_tag": "wrong_coefficient"},
            ],
        },
        {
            "concept": "Power Rule",
            "question_text": "Find d/dx(x⁻³).",
            "difficulty": "medium",
            "correct_answer": "B",
            "explanation": "Using the power rule with negative exponents: d/dx(x⁻³) = -3x⁻⁴ = -3/x⁴. The power rule works for all real exponents, including negative ones.",
            "hint_1": "The power rule d/dx(xⁿ) = n·xⁿ⁻¹ works for negative n too",
            "hint_2": "n = -3, so the derivative is -3·x⁽⁻³⁻¹⁾ = -3x⁻⁴",
            "misconception_categories": json.dumps(["negative_exponents", "power_rule"]),
            "choices": [
                {"label": "A", "text": "3x⁻²", "is_correct": False, "misconception_tag": "sign_error_negative_exp"},
                {"label": "B", "text": "-3x⁻⁴", "is_correct": True, "misconception_tag": None},
                {"label": "C", "text": "-3x⁻²", "is_correct": False, "misconception_tag": "added_instead_of_subtracted"},
                {"label": "D", "text": "3x⁻⁴", "is_correct": False, "misconception_tag": "dropped_negative"},
            ],
        },
        {
            "concept": "Power Rule",
            "question_text": "What is the derivative of f(x) = √x?",
            "difficulty": "medium",
            "correct_answer": "C",
            "explanation": "First rewrite √x = x^(1/2). Then apply the power rule: d/dx(x^(1/2)) = (1/2)x^(-1/2) = 1/(2√x).",
            "hint_1": "Rewrite √x using fractional exponents: √x = x^(1/2)",
            "hint_2": "Now apply the power rule with n = 1/2",
            "misconception_categories": json.dumps(["fractional_exponents", "power_rule"]),
            "choices": [
                {"label": "A", "text": "1/2x", "is_correct": False, "misconception_tag": "wrong_simplification"},
                {"label": "B", "text": "2√x", "is_correct": False, "misconception_tag": "inverted_fraction"},
                {"label": "C", "text": "1/(2√x)", "is_correct": True, "misconception_tag": None},
                {"label": "D", "text": "√x/2", "is_correct": False, "misconception_tag": "forgot_reduce_exponent"},
            ],
        },
        # --- Constant Multiple Rule ---
        {
            "concept": "Constant Multiple Rule",
            "question_text": "Find the derivative of f(x) = 7x⁴.",
            "difficulty": "easy",
            "correct_answer": "A",
            "explanation": "Using the constant multiple rule and power rule: d/dx(7x⁴) = 7 · d/dx(x⁴) = 7 · 4x³ = 28x³.",
            "hint_1": "Constants can be pulled out of the derivative: d/dx(cf(x)) = c·f'(x)",
            "hint_2": "So d/dx(7x⁴) = 7 · d/dx(x⁴). Now apply the power rule to x⁴.",
            "misconception_categories": json.dumps(["constant_multiple"]),
            "choices": [
                {"label": "A", "text": "28x³", "is_correct": True, "misconception_tag": None},
                {"label": "B", "text": "7x³", "is_correct": False, "misconception_tag": "forgot_multiply_constant"},
                {"label": "C", "text": "28x⁴", "is_correct": False, "misconception_tag": "forgot_reduce_exponent"},
                {"label": "D", "text": "4x³", "is_correct": False, "misconception_tag": "dropped_constant"},
            ],
        },
        # --- Sum and Difference Rule ---
        {
            "concept": "Sum and Difference Rule",
            "question_text": "Find d/dx(3x² + 5x - 2).",
            "difficulty": "easy",
            "correct_answer": "B",
            "explanation": "Differentiate term by term: d/dx(3x²) + d/dx(5x) - d/dx(2) = 6x + 5 - 0 = 6x + 5.",
            "hint_1": "Differentiate each term separately",
            "hint_2": "d/dx(3x²) = 6x, d/dx(5x) = 5, d/dx(2) = 0",
            "misconception_categories": json.dumps(["sum_rule", "constant_derivative"]),
            "choices": [
                {"label": "A", "text": "6x + 5 - 2", "is_correct": False, "misconception_tag": "forgot_constant_derivative"},
                {"label": "B", "text": "6x + 5", "is_correct": True, "misconception_tag": None},
                {"label": "C", "text": "3x + 5", "is_correct": False, "misconception_tag": "power_rule_error"},
                {"label": "D", "text": "6x² + 5", "is_correct": False, "misconception_tag": "forgot_reduce_exponent"},
            ],
        },
        {
            "concept": "Sum and Difference Rule",
            "question_text": "What is the derivative of f(x) = x³ - 4x² + x?",
            "difficulty": "medium",
            "correct_answer": "A",
            "explanation": "Differentiate term by term: d/dx(x³) - d/dx(4x²) + d/dx(x) = 3x² - 8x + 1.",
            "hint_1": "Apply the sum/difference rule: differentiate each term separately",
            "hint_2": "d/dx(x³) = 3x², d/dx(4x²) = 8x, d/dx(x) = 1",
            "misconception_categories": json.dumps(["sum_rule", "power_rule"]),
            "choices": [
                {"label": "A", "text": "3x² - 8x + 1", "is_correct": True, "misconception_tag": None},
                {"label": "B", "text": "3x² - 4x + 1", "is_correct": False, "misconception_tag": "forgot_constant_multiple"},
                {"label": "C", "text": "3x² - 8x", "is_correct": False, "misconception_tag": "forgot_derivative_of_x"},
                {"label": "D", "text": "x² - 8x + 1", "is_correct": False, "misconception_tag": "power_rule_coefficient_error"},
            ],
        },
        # --- Exponent Rules (prerequisite) ---
        {
            "concept": "Exponent Rules",
            "question_text": "Simplify: x³ · x⁴",
            "difficulty": "easy",
            "correct_answer": "B",
            "explanation": "When multiplying powers with the same base, add the exponents: x³ · x⁴ = x^(3+4) = x⁷.",
            "hint_1": "When multiplying same bases, what do you do with exponents?",
            "hint_2": "x^a · x^b = x^(a+b)",
            "misconception_categories": json.dumps(["exponent_product_rule"]),
            "is_diagnostic": True,
            "choices": [
                {"label": "A", "text": "x¹²", "is_correct": False, "misconception_tag": "multiplied_exponents"},
                {"label": "B", "text": "x⁷", "is_correct": True, "misconception_tag": None},
                {"label": "C", "text": "2x⁷", "is_correct": False, "misconception_tag": "added_coefficients"},
                {"label": "D", "text": "x⁻¹", "is_correct": False, "misconception_tag": "subtracted_exponents"},
            ],
        },
        {
            "concept": "Exponent Rules",
            "question_text": "What is x⁰ equal to, for x ≠ 0?",
            "difficulty": "easy",
            "correct_answer": "C",
            "explanation": "Any non-zero number raised to the power 0 equals 1. This follows from x^n / x^n = x^(n-n) = x⁰ = 1.",
            "hint_1": "Think about what happens when you divide x^n by x^n",
            "hint_2": "x^n / x^n = 1, but also x^n / x^n = x^(n-n) = x^0",
            "misconception_categories": json.dumps(["zero_exponent"]),
            "is_diagnostic": True,
            "choices": [
                {"label": "A", "text": "0", "is_correct": False, "misconception_tag": "zero_exponent_equals_zero"},
                {"label": "B", "text": "x", "is_correct": False, "misconception_tag": "zero_exponent_equals_base"},
                {"label": "C", "text": "1", "is_correct": True, "misconception_tag": None},
                {"label": "D", "text": "Undefined", "is_correct": False, "misconception_tag": "zero_exponent_undefined"},
            ],
        },
        # --- Basic Algebra (prerequisite) ---
        {
            "concept": "Basic Algebra",
            "question_text": "Simplify: 3(2x + 4) - 2(x - 1)",
            "difficulty": "easy",
            "correct_answer": "A",
            "explanation": "Distribute: 6x + 12 - 2x + 2 = 4x + 14. Remember that distributing -2 over (x - 1) gives -2x + 2, not -2x - 2.",
            "hint_1": "First distribute the 3 and the -2 to each term inside the parentheses",
            "hint_2": "3(2x+4) = 6x+12 and -2(x-1) = -2x+2. Now combine like terms.",
            "misconception_categories": json.dumps(["distributive_property", "sign_errors"]),
            "is_diagnostic": True,
            "choices": [
                {"label": "A", "text": "4x + 14", "is_correct": True, "misconception_tag": None},
                {"label": "B", "text": "4x + 10", "is_correct": False, "misconception_tag": "sign_error_distribution"},
                {"label": "C", "text": "8x + 14", "is_correct": False, "misconception_tag": "addition_error"},
                {"label": "D", "text": "4x + 12", "is_correct": False, "misconception_tag": "forgot_second_distribution"},
            ],
        },
        # --- Definition of Derivative ---
        {
            "concept": "Definition of Derivative",
            "question_text": "Using the first principles definition, the derivative f'(x) is defined as:",
            "difficulty": "medium",
            "correct_answer": "B",
            "explanation": "The derivative is defined as f'(x) = lim(h→0) [f(x+h) - f(x)] / h. This is the limit of the difference quotient as h approaches 0.",
            "hint_1": "The derivative involves a limit as something approaches 0",
            "hint_2": "It measures the rate of change using a difference quotient",
            "misconception_categories": json.dumps(["first_principles"]),
            "choices": [
                {"label": "A", "text": "lim(h→0) [f(x+h) + f(x)] / h", "is_correct": False, "misconception_tag": "wrong_difference_quotient"},
                {"label": "B", "text": "lim(h→0) [f(x+h) - f(x)] / h", "is_correct": True, "misconception_tag": None},
                {"label": "C", "text": "lim(h→0) [f(x) - f(h)] / x", "is_correct": False, "misconception_tag": "confused_variables"},
                {"label": "D", "text": "[f(x+1) - f(x)] / 1", "is_correct": False, "misconception_tag": "no_limit_concept"},
            ],
        },
        # --- Product Rule ---
        {
            "concept": "Product Rule",
            "question_text": "Find the derivative of f(x) = x² · (3x + 1).",
            "difficulty": "medium",
            "correct_answer": "C",
            "explanation": "Using the product rule: f'(x) = (2x)(3x+1) + (x²)(3) = 6x² + 2x + 3x² = 9x² + 2x. Alternatively, expand first: f(x) = 3x³ + x², so f'(x) = 9x² + 2x.",
            "hint_1": "Use the product rule: (uv)' = u'v + uv'",
            "hint_2": "Let u = x² and v = 3x + 1. Then u' = 2x and v' = 3.",
            "misconception_categories": json.dumps(["product_rule"]),
            "choices": [
                {"label": "A", "text": "6x", "is_correct": False, "misconception_tag": "multiplied_derivatives_only"},
                {"label": "B", "text": "6x² + 2x + 3", "is_correct": False, "misconception_tag": "product_rule_extra_term"},
                {"label": "C", "text": "9x² + 2x", "is_correct": True, "misconception_tag": None},
                {"label": "D", "text": "6x² + 1", "is_correct": False, "misconception_tag": "incomplete_product_rule"},
            ],
        },
        # --- Chain Rule ---
        {
            "concept": "Chain Rule",
            "question_text": "Find the derivative of f(x) = (2x + 3)⁴.",
            "difficulty": "hard",
            "correct_answer": "A",
            "explanation": "Using the chain rule: let u = 2x + 3. Then f = u⁴, so f'(x) = 4u³ · u' = 4(2x+3)³ · 2 = 8(2x+3)³.",
            "hint_1": "This is a composite function. Identify the outer and inner functions.",
            "hint_2": "Outer: u⁴, Inner: u = 2x+3. Apply chain rule: derivative of outer × derivative of inner.",
            "misconception_categories": json.dumps(["chain_rule"]),
            "choices": [
                {"label": "A", "text": "8(2x + 3)³", "is_correct": True, "misconception_tag": None},
                {"label": "B", "text": "4(2x + 3)³", "is_correct": False, "misconception_tag": "forgot_inner_derivative"},
                {"label": "C", "text": "8(2x + 3)⁴", "is_correct": False, "misconception_tag": "forgot_reduce_exponent"},
                {"label": "D", "text": "2(2x + 3)³", "is_correct": False, "misconception_tag": "wrong_outer_derivative"},
            ],
        },
        {
            "concept": "Chain Rule",
            "question_text": "Find d/dx[(x² + 1)³].",
            "difficulty": "hard",
            "correct_answer": "B",
            "explanation": "Using the chain rule: outer = u³ → 3u², inner = x²+1 → 2x. So d/dx = 3(x²+1)² · 2x = 6x(x²+1)².",
            "hint_1": "Identify outer function (cubing) and inner function (x²+1)",
            "hint_2": "Chain rule: 3(x²+1)² · d/dx(x²+1) = 3(x²+1)² · 2x",
            "misconception_categories": json.dumps(["chain_rule"]),
            "choices": [
                {"label": "A", "text": "3(x² + 1)²", "is_correct": False, "misconception_tag": "forgot_inner_derivative"},
                {"label": "B", "text": "6x(x² + 1)²", "is_correct": True, "misconception_tag": None},
                {"label": "C", "text": "6x(x² + 1)³", "is_correct": False, "misconception_tag": "forgot_reduce_exponent"},
                {"label": "D", "text": "3x²(x² + 1)²", "is_correct": False, "misconception_tag": "wrong_inner_derivative"},
            ],
        },
        # --- Functions and Notation ---
        {
            "concept": "Functions and Notation",
            "question_text": "If f(x) = x² + 3x, what is f(2)?",
            "difficulty": "easy",
            "correct_answer": "D",
            "explanation": "Substitute x = 2: f(2) = (2)² + 3(2) = 4 + 6 = 10.",
            "hint_1": "Replace every x in the expression with 2",
            "hint_2": "f(2) = 2² + 3(2) = ?",
            "misconception_categories": json.dumps(["function_evaluation"]),
            "is_diagnostic": True,
            "choices": [
                {"label": "A", "text": "7", "is_correct": False, "misconception_tag": "forgot_square"},
                {"label": "B", "text": "8", "is_correct": False, "misconception_tag": "arithmetic_error"},
                {"label": "C", "text": "14", "is_correct": False, "misconception_tag": "wrong_substitution"},
                {"label": "D", "text": "10", "is_correct": True, "misconception_tag": None},
            ],
        },
        # --- Limits ---
        {
            "concept": "Limits (Intuitive)",
            "question_text": "What does lim(x→3) (x² - 9)/(x - 3) equal?",
            "difficulty": "medium",
            "correct_answer": "C",
            "explanation": "Factor numerator: x² - 9 = (x+3)(x-3). Cancel (x-3): lim(x→3) (x+3) = 6. Direct substitution gives 0/0, so factoring is needed.",
            "hint_1": "Direct substitution gives 0/0. Try factoring the numerator.",
            "hint_2": "x² - 9 = (x+3)(x-3). Cancel the common factor.",
            "misconception_categories": json.dumps(["limits_factoring", "indeterminate_forms"]),
            "is_diagnostic": True,
            "choices": [
                {"label": "A", "text": "0", "is_correct": False, "misconception_tag": "limit_equals_zero"},
                {"label": "B", "text": "Undefined", "is_correct": False, "misconception_tag": "confused_limit_with_value"},
                {"label": "C", "text": "6", "is_correct": True, "misconception_tag": None},
                {"label": "D", "text": "9", "is_correct": False, "misconception_tag": "wrong_factoring"},
            ],
        },
    ]

    for q_data in questions_data:
        concept = concepts[q_data["concept"]]
        q = Question(
            topic_id=topic_id,
            concept_id=concept.id,
            question_text=q_data["question_text"],
            difficulty=q_data["difficulty"],
            correct_answer=q_data["correct_answer"],
            explanation=q_data["explanation"],
            hint_1=q_data.get("hint_1"),
            hint_2=q_data.get("hint_2"),
            hint_3=q_data.get("hint_3"),
            misconception_categories=q_data.get("misconception_categories"),
            is_diagnostic=q_data.get("is_diagnostic", False),
            is_verified=True,
            source="curated",
        )
        db.add(q)
        db.flush()

        for choice in q_data["choices"]:
            db.add(AnswerChoice(
                question_id=q.id,
                label=choice["label"],
                text=choice["text"],
                is_correct=choice["is_correct"],
                misconception_tag=choice.get("misconception_tag"),
            ))
    db.flush()


def _seed_lessons(db: Session, concepts: dict):
    """Seed curated lessons for fallback mode."""
    lessons_data = [
        {
            "concept": "Power Rule",
            "title": "Understanding the Power Rule",
            "content": """# The Power Rule for Differentiation

## The Rule
If f(x) = xⁿ, then f'(x) = n·xⁿ⁻¹

## How to Apply It
1. **Identify the exponent** (n)
2. **Bring it down** as a coefficient
3. **Reduce the exponent** by 1

## Examples

### Example 1: f(x) = x³
- n = 3
- f'(x) = 3·x² = 3x²

### Example 2: f(x) = x⁻²
- n = -2
- f'(x) = -2·x⁻³ = -2/x³

### Example 3: f(x) = √x = x^(1/2)
- n = 1/2
- f'(x) = (1/2)·x^(-1/2) = 1/(2√x)

## Special Cases
- d/dx(x) = 1 (since x = x¹)
- d/dx(constant) = 0 (since constant = c·x⁰)

## Common Mistakes to Avoid
- ❌ Forgetting to subtract 1 from the exponent
- ❌ Not converting √x to x^(1/2) before differentiating
- ❌ Applying the power rule to eˣ (that's a different rule!)
""",
            "difficulty": "intermediate",
            "lesson_type": "explanation",
        },
        {
            "concept": "Exponent Rules",
            "title": "Mastering Exponent Rules",
            "content": """# Exponent Rules

## The Essential Rules

| Rule | Formula | Example |
|------|---------|---------|
| Product | x^a · x^b = x^(a+b) | x³ · x⁴ = x⁷ |
| Quotient | x^a / x^b = x^(a-b) | x⁵ / x² = x³ |
| Power | (x^a)^b = x^(ab) | (x²)³ = x⁶ |
| Zero | x⁰ = 1 | 5⁰ = 1 |
| Negative | x^(-n) = 1/x^n | x⁻² = 1/x² |
| Fractional | x^(1/n) = ⁿ√x | x^(1/2) = √x |

## Why These Matter for Differentiation
Before applying the power rule, you often need to **rewrite** expressions using exponent rules:
- √x → x^(1/2)
- 1/x² → x⁻²
- ³√x² → x^(2/3)

## Practice Converting
1. 1/x³ = x⁻³
2. ⁴√x = x^(1/4)
3. x²·√x = x^(5/2)
""",
            "difficulty": "beginner",
            "lesson_type": "explanation",
        },
        {
            "concept": "Chain Rule",
            "title": "The Chain Rule Step by Step",
            "content": """# The Chain Rule

## When to Use It
Use the chain rule when you have a **function inside another function** (composite function).

## The Formula
d/dx[f(g(x))] = f'(g(x)) · g'(x)

In words: **derivative of the outer × derivative of the inner**

## Step-by-Step Process
1. **Identify** the outer function f and inner function g
2. **Differentiate** the outer function, keeping the inner function unchanged
3. **Multiply** by the derivative of the inner function

## Worked Example: d/dx[(3x + 1)⁵]
1. Outer: u⁵, Inner: u = 3x + 1
2. Derivative of outer: 5u⁴ = 5(3x+1)⁴
3. Derivative of inner: 3
4. Result: 5(3x+1)⁴ · 3 = **15(3x+1)⁴**

## Common Mistake
Forgetting the inner derivative! d/dx[(3x+1)⁵] ≠ 5(3x+1)⁴
You MUST multiply by d/dx(3x+1) = 3.
""",
            "difficulty": "advanced",
            "lesson_type": "explanation",
        },
        {
            "concept": "Basic Algebra",
            "title": "Algebra Foundations for Calculus",
            "content": """# Algebra Foundations

## Distribution
a(b + c) = ab + ac
**Watch the signs!** -2(x - 3) = -2x + 6, NOT -2x - 6

## Combining Like Terms
3x² + 5x² = 8x²
But 3x² + 5x cannot be simplified (different powers!)

## Factoring
- Common factor: 6x² + 4x = 2x(3x + 2)
- Difference of squares: x² - 9 = (x+3)(x-3)
- Perfect square: x² + 6x + 9 = (x+3)²

## Fraction Operations
a/b + c/b = (a+c)/b
a/b · c/d = ac/(bd)

These skills are essential for simplifying derivatives!
""",
            "difficulty": "beginner",
            "lesson_type": "explanation",
        },
        {
            "concept": "Sum and Difference Rule",
            "title": "Sum and Difference Rule for Derivatives",
            "content": """# Sum and Difference Rule

## The Rules
- d/dx[f(x) + g(x)] = f'(x) + g'(x)
- d/dx[f(x) - g(x)] = f'(x) - g'(x)

## In Plain English
Differentiate each term **separately**, then add (or subtract) the results.

## Example: d/dx(3x⁴ - 2x² + 7x - 5)
1. d/dx(3x⁴) = 12x³
2. d/dx(-2x²) = -4x
3. d/dx(7x) = 7
4. d/dx(-5) = 0
5. Result: **12x³ - 4x + 7**

## Remember
- The derivative of a constant is always 0
- Don't forget the constant multiple rule within each term
""",
            "difficulty": "intermediate",
            "lesson_type": "explanation",
        },
    ]

    for l_data in lessons_data:
        concept = concepts[l_data["concept"]]
        db.add(Lesson(
            concept_id=concept.id,
            title=l_data["title"],
            content=l_data["content"],
            difficulty=l_data["difficulty"],
            lesson_type=l_data["lesson_type"],
        ))
    db.flush()
