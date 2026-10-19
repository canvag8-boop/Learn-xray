from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.concept import Concept
from app.services import graph_service

router = APIRouter(prefix="/api/concepts", tags=["Concepts & Knowledge Graph"])


@router.get("")
def list_concepts(topic_id: Optional[int] = Query(None),
                  user: User = Depends(get_current_user),
                  db: Session = Depends(get_db)):
    """List all concepts, optionally filtered by topic."""
    query = db.query(Concept)
    if topic_id:
        query = query.filter(Concept.topic_id == topic_id)
    concepts = query.order_by(Concept.order_index).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "difficulty": c.difficulty,
            "topic_id": c.topic_id,
            "order_index": c.order_index,
        }
        for c in concepts
    ]


@router.get("/graph")
def get_concept_graph(topic_id: Optional[int] = Query(None),
                      user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    """Get the concept knowledge graph with nodes, edges, and mastery levels."""
    return graph_service.get_concept_graph(db, user.id, topic_id)


@router.get("/{concept_id}")
def get_concept_details(concept_id: int,
                        user: User = Depends(get_current_user),
                        db: Session = Depends(get_db)):
    """Get concept details including formulas, common mistakes, prerequisites, and mastery."""
    details = graph_service.get_concept_details(db, concept_id, user.id)
    if not details:
        raise HTTPException(status_code=404, detail="Concept not found")
    return details


@router.get("/{concept_id}/practice")
def get_practice_questions(concept_id: int,
                           limit: int = Query(5, ge=1, le=20),
                           user: User = Depends(get_current_user),
                           db: Session = Depends(get_db)):
    """Get practice questions for a concept."""
    return graph_service.get_practice_questions(db, concept_id, user.id, limit)
