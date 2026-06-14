from math import sqrt
from typing import Any

from openai import OpenAI
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.knowledge_item import KnowledgeItem


class VectorSearchService:
    def __init__(self) -> None:
        self.client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.item_embedding_cache: dict[str, list[float]] = {}

    @property
    def enabled(self) -> bool:
        return bool(settings.enable_vector_search and self.client)

    def _embed(self, text: str) -> list[float] | None:
        if not self.client:
            return None
        response = self.client.embeddings.create(
            model=settings.vector_embedding_model,
            input=text,
        )
        return list(response.data[0].embedding)

    @staticmethod
    def _cosine_similarity(left: list[float], right: list[float]) -> float:
        if not left or not right or len(left) != len(right):
            return 0.0
        dot = sum(a * b for a, b in zip(left, right))
        left_norm = sqrt(sum(a * a for a in left))
        right_norm = sqrt(sum(b * b for b in right))
        if left_norm == 0 or right_norm == 0:
            return 0.0
        return dot / (left_norm * right_norm)

    @staticmethod
    def _searchable_text(item: KnowledgeItem) -> str:
        return "\n".join(
            [
                f"category: {item.category}",
                f"work: {item.work_title or ''}",
                f"title: {item.title}",
                f"scene_title: {item.scene_title or ''}",
                f"summary: {item.summary}",
                f"scene_description: {item.scene_description or ''}",
                f"reason: {item.reason_template}",
                f"emotion: {item.emotion_tag}",
                f"relation: {item.relation_tag}",
                f"scene: {item.scene_tag}",
                f"keywords: {item.keywords}",
                f"concepts: {item.concepts or ''}",
                f"quote: {item.quote_text or ''}",
                f"speaker: {item.speaker or ''}",
            ]
        )

    def search(self, db: Session, text: str, limit: int = 6) -> dict[str, Any]:
        if not self.enabled:
            return {"enabled": False, "scores": {}}

        try:
            query_vector = self._embed(text)
            if not query_vector:
                return {"enabled": False, "scores": {}}

            items = db.scalars(select(KnowledgeItem)).all()
            scored: list[tuple[str, float]] = []
            for item in items:
                cache_key = str(item.id)
                item_vector = self.item_embedding_cache.get(cache_key)
                if not item_vector:
                    item_vector = self._embed(self._searchable_text(item))
                    if item_vector:
                        self.item_embedding_cache[cache_key] = item_vector
                if not item_vector:
                    continue
                similarity = self._cosine_similarity(query_vector, item_vector)
                scored.append((cache_key, round(max(similarity, 0.0), 4)))

            scored.sort(key=lambda pair: pair[1], reverse=True)
            top_scores = dict(scored[:limit])
            return {"enabled": True, "scores": top_scores}
        except Exception:
            return {"enabled": False, "scores": {}}


vector_search_service = VectorSearchService()
