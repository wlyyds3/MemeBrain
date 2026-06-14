from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=2, max_length=2000)


class AnalysisResult(BaseModel):
    emotion: str
    relationship: str
    scene: str
    concepts: list[str] = Field(default_factory=list)
    search_focus: str | None = None


class QuoteInfo(BaseModel):
    speaker: str | None = None
    text: str | None = None
    verified: bool = False


class RecommendationItem(BaseModel):
    id: UUID | str
    category: Literal["meme", "anime", "history", "film"]
    title: str
    summary: str
    reason: str
    score: float
    source: str | None = None
    work_title: str | None = None
    scene_title: str | None = None
    scene_description: str | None = None
    episode_label: str | None = None
    timestamp_start: str | None = None
    timestamp_end: str | None = None
    quote: QuoteInfo | None = None
    concepts: list[str] = Field(default_factory=list)
    retrieval_methods: list[Literal["rule", "vector"]] = Field(default_factory=list)
    reason_meta: dict | None = None


class AnalyzeResponse(BaseModel):
    mode: Literal["text"] = "text"
    analysis: AnalysisResult
    recommendations: list[RecommendationItem]
    source: Literal["deepseek", "openai", "fallback"]
    vector_search_enabled: bool = False
    reserved_capabilities: dict[str, bool]


class MediaReserveResponse(BaseModel):
    mode: Literal["image", "video"]
    status: Literal["reserved"]
    enabled: bool
    message: str
    accepted_types: list[str]
    planned_pipeline: list[str]
    recommended_models: list[str]


class HistoryItem(BaseModel):
    id: UUID
    input_text: str
    emotion: str
    relationship: str
    scene: str
    recommendations: list[RecommendationItem]
    created_at: datetime

    model_config = {"from_attributes": True}
