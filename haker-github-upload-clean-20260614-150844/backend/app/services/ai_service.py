import json
from typing import Any

from openai import OpenAI

from app.core.config import settings


class AIService:
    def __init__(self) -> None:
        self.provider = "fallback"
        self.model = ""
        self.client: OpenAI | None = None

        if settings.deepseek_api_key:
            self.client = OpenAI(
                api_key=settings.deepseek_api_key,
                base_url=settings.deepseek_base_url,
            )
            self.provider = "deepseek"
            self.model = settings.deepseek_chat_model
        elif settings.openai_api_key:
            self.client = OpenAI(api_key=settings.openai_api_key)
            self.provider = "openai"
            self.model = settings.openai_chat_model

    def analyze_text(self, text: str) -> dict[str, Any] | None:
        if not self.client:
            return None

        prompt = f"""
请分析下面这段文本的核心语义，只返回 JSON。

要求：
1. emotion 只输出一个词，例如：绝望、无语、愤怒、喜悦、紧张、震惊
2. relationship 只输出一个词，例如：压迫、对抗、追击、围困、拉扯、支持
3. scene 只输出一个短语，例如：逃跑失败、突发噩耗、荒诞职场、孤立无援、情绪爆发
4. concepts 输出 3 到 6 个中文抽象概念，例如：压迫、支配、追逐、失败、反转、权力不对等
5. search_focus 输出一句中文检索描述，用于查找具体画面和台词

文本：{text}

返回格式：
{{"emotion":"绝望","relationship":"压迫","scene":"逃跑失败","concepts":["压迫","支配","无力","追逐"],"search_focus":"被强势角色压着走、想逃也逃不掉的名场面或台词"}}
"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                temperature=0.3,
                messages=[
                    {"role": "system", "content": "你是一个只输出 JSON 的中文语义分析助手。"},
                    {"role": "user", "content": prompt},
                ],
            )
            content = response.choices[0].message.content or "{}"
            data: dict[str, Any] = json.loads(content)
            if {"emotion", "relationship", "scene"} <= set(data.keys()):
                concepts = data.get("concepts") or []
                if not isinstance(concepts, list):
                    concepts = []
                return {
                    "emotion": str(data["emotion"]),
                    "relationship": str(data["relationship"]),
                    "scene": str(data["scene"]),
                    "concepts": [str(item) for item in concepts[:6] if str(item).strip()],
                    "search_focus": str(data.get("search_focus", "")).strip(),
                }
        except Exception:
            return None
        return None


ai_service = AIService()
