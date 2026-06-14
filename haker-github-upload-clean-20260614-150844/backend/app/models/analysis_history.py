import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship

from app.db.base import Base


class AnalysisHistory(Base):
    __tablename__ = "analysis_histories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    input_text: Mapped[str] = mapped_column(Text)
    emotion: Mapped[str] = mapped_column(String(50))
    relationship: Mapped[str] = mapped_column(String(50))
    scene: Mapped[str] = mapped_column(String(50))
    recommendations: Mapped[list[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), server_default=func.now())

    user = orm_relationship("User", back_populates="histories")
