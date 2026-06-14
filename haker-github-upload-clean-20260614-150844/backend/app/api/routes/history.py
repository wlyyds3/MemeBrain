from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.analysis_history import AnalysisHistory
from app.models.user import User
from app.schemas.analysis import HistoryItem
from app.utils.deps import get_current_user

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=list[HistoryItem])
def list_history(
    q: str | None = Query(default=None, max_length=100),
    emotion: str | None = Query(default=None, max_length=50),
    scene: str | None = Query(default=None, max_length=50),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AnalysisHistory]:
    stmt = select(AnalysisHistory).where(AnalysisHistory.user_id == current_user.id)
    if q:
        stmt = stmt.where(AnalysisHistory.input_text.contains(q.strip()))
    if emotion:
        stmt = stmt.where(AnalysisHistory.emotion == emotion)
    if scene:
        stmt = stmt.where(AnalysisHistory.scene == scene)
    stmt = stmt.order_by(AnalysisHistory.created_at.desc()).limit(limit)
    return list(db.scalars(stmt).all())


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(
    history_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = db.execute(
        delete(AnalysisHistory).where(
            AnalysisHistory.id == history_id,
            AnalysisHistory.user_id == current_user.id,
        )
    )
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="历史记录不存在")
    db.commit()