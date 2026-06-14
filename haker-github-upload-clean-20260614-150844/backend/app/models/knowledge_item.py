import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(20), index=True)
    title: Mapped[str] = mapped_column(String(255))
    summary: Mapped[str] = mapped_column(Text)
    reason_template: Mapped[str] = mapped_column(Text)
    emotion_tag: Mapped[str] = mapped_column(String(50), index=True)
    relation_tag: Mapped[str] = mapped_column(String(50), index=True)
    scene_tag: Mapped[str] = mapped_column(String(50), index=True)
    keywords: Mapped[str] = mapped_column(Text)
    work_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    scene_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    scene_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    episode_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    timestamp_start: Mapped[str | None] = mapped_column(String(30), nullable=True)
    timestamp_end: Mapped[str | None] = mapped_column(String(30), nullable=True)
    speaker: Mapped[str | None] = mapped_column(String(120), nullable=True)
    quote_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    quote_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="0")
    concepts: Mapped[str | None] = mapped_column(Text, nullable=True)
    characters: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), server_default=func.now())
