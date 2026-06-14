from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.recommendation_feedback import RecommendationFeedback
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecommendationFeedback:
    feedback = RecommendationFeedback(
        user_id=current_user.id,
        history_id=payload.history_id,
        recommendation_id=payload.recommendation_id,
        category=payload.category,
        title=payload.title,
        action=payload.action,
        note=payload.note,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback