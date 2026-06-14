from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


FeedbackAction = Literal["useful", "not_accurate", "favorite", "dislike"]


class FeedbackCreate(BaseModel):
    history_id: UUID | None = None
    recommendation_id: str
    category: Literal["meme", "anime", "history", "film"]
    title: str = Field(min_length=1, max_length=255)
    action: FeedbackAction
    note: str | None = Field(default=None, max_length=500)


class FeedbackResponse(BaseModel):
    id: UUID
    recommendation_id: str
    action: FeedbackAction
    created_at: datetime

    model_config = {"from_attributes": True}