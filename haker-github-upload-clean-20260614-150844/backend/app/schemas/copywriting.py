from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.analysis import AnalysisResult, RecommendationItem


Platform = Literal["douyin", "xiaohongshu", "bilibili"]
CopyStyle = Literal["balanced", "funny", "sharp", "warm", "cinematic"]


class CopywritingRequest(BaseModel):
    input_text: str = Field(min_length=2, max_length=2000)
    analysis: AnalysisResult
    recommendations: list[RecommendationItem] = Field(default_factory=list, max_length=8)
    platforms: list[Platform] = Field(default_factory=lambda: ["douyin", "xiaohongshu", "bilibili"])
    style: CopyStyle = "balanced"
    focus_recommendation_id: str | None = None
    variant_seed: int = Field(default=0, ge=0, le=999)


class PlatformCopy(BaseModel):
    platform: Platform
    title: str
    body: str
    tags: list[str] = Field(default_factory=list)


class CopywritingResponse(BaseModel):
    copies: list[PlatformCopy]