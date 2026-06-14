from collections import Counter
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis_history import AnalysisHistory
from app.models.knowledge_item import KnowledgeItem
from app.models.recommendation_feedback import RecommendationFeedback
from app.models.user import User
from app.services.ai_service import ai_service
from app.services.reason_service import build_reason, build_reason_meta
from app.services.vector_search_service import vector_search_service

EMOTION_RULES = {
    "绝望": ["加班", "崩溃", "完了", "没救", "天塌", "周末也要上班"],
    "无语": ["离谱", "无语", "又来", "服了", "怎么又"],
    "愤怒": ["气死", "愤怒", "生气", "压榨", "老板真行"],
    "紧张": ["马上", "来不及", "deadline", "截止", "赶工"],
    "坚决": ["不认命", "改命", "我会出手", "不服", "必须赢"],
    "脆弱": ["想你", "找到你了", "舍不得", "告别", "终于找到"],
}

RELATIONSHIP_RULES = {
    "压迫": ["老板", "加班", "任务", "KPI", "催"],
    "对抗": ["吵架", "对线", "反击", "争辩"],
    "追击": ["追", "逃", "抓", "追着"],
    "围困": ["包围", "四面", "没退路", "全都来"],
    "支持": ["帮我", "接住", "托底", "救场", "撑住"],
}

SCENE_RULES = {
    "逃跑失败": ["加班", "逃不掉", "又被抓", "周末加班"],
    "荒诞职场": ["老板", "开会", "流程", "汇报"],
    "突发噩耗": ["通知", "突然", "临时", "刚刚说"],
    "孤立无援": ["没人帮", "只能我", "全靠我", "一个人扛"],
    "情绪爆发": ["受不了", "炸了", "崩了", "破防"],
    "真相揭露": ["真相", "线索", "破案", "查出来", "找到真相"],
    "团队失控": ["队伍", "团队", "带不动", "人心散了", "内耗"],
    "逆天改命": ["我命由我不由天", "改命", "不认命", "命由我"],
    "现实重压": ["穷", "没钱", "药费", "生存", "现实"],
    "关键救场": ["救场", "兜底", "出手", "我来顶", "我会出手"],
    "迟到告别": ["找到你了", "想你", "重逢", "告别", "终于找到"],
}

CONCEPT_RULES = {
    "压迫": ["老板", "加班", "催", "命令", "压着"],
    "支配": ["支配", "拿捏", "被安排", "说了算"],
    "追逐": ["追", "追着", "追赶", "催着"],
    "逃跑": ["逃", "跑", "溜", "躲"],
    "失败": ["失败", "翻车", "完了", "没了", "跑不掉"],
    "反转": ["结果", "反而", "没想到", "最后"],
    "围困": ["包围", "四面", "没退路", "困住"],
    "无力": ["无力", "顶不住", "扛不住", "没办法"],
    "荒诞": ["离谱", "荒诞", "无语", "抽象"],
    "逆袭": ["逆袭", "翻盘", "硬刚", "赢了"],
    "真相": ["真相", "线索", "破案", "查出来"],
    "团队": ["团队", "队伍", "人心散了", "内耗"],
    "改命": ["改命", "不认命", "命由我"],
    "救场": ["救场", "托底", "兜底", "出手"],
    "贫困": ["穷", "没钱", "药费", "生存"],
}

FEEDBACK_WEIGHTS = {
    "favorite": 0.14,
    "useful": 0.1,
    "not_accurate": -0.12,
    "dislike": -0.16,
}


def infer_by_rules(text: str) -> dict[str, Any]:
    def pick_label(rules: dict[str, list[str]], default: str) -> str:
        scores: Counter[str] = Counter()
        for label, keywords in rules.items():
            for keyword in keywords:
                if keyword in text:
                    scores[label] += 1
        return scores.most_common(1)[0][0] if scores else default

    concept_scores: Counter[str] = Counter()
    for label, keywords in CONCEPT_RULES.items():
        for keyword in keywords:
            if keyword in text:
                concept_scores[label] += 1

    return {
        "emotion": pick_label(EMOTION_RULES, "无奈"),
        "relationship": pick_label(RELATIONSHIP_RULES, "压迫"),
        "scene": pick_label(SCENE_RULES, "荒诞职场"),
        "concepts": [item[0] for item in concept_scores.most_common(5)] or ["压迫", "无力", "荒诞"],
        "search_focus": "适合表达当前情绪和关系结构的具体画面、桥段或台词",
    }


def get_feedback_scores(db: Session, user: User) -> tuple[dict[str, float], dict[str, float]]:
    feedback_rows = db.execute(
        select(
            RecommendationFeedback.recommendation_id,
            RecommendationFeedback.category,
            RecommendationFeedback.action,
        ).where(RecommendationFeedback.user_id == user.id)
    ).all()

    item_scores: Counter[str] = Counter()
    category_scores: Counter[str] = Counter()
    for recommendation_id, category, action in feedback_rows:
        weight = FEEDBACK_WEIGHTS.get(action, 0)
        if not weight:
            continue
        item_scores[str(recommendation_id)] += weight
        category_scores[category] += round(weight * 0.45, 4)

    return dict(item_scores), dict(category_scores)


def recommend_items(db: Session, user: User, analysis: dict[str, str], text: str) -> tuple[list[dict[str, Any]], bool]:
    items = db.scalars(select(KnowledgeItem)).all()
    terms = {term.strip() for term in text.replace("，", ",").replace("。", ",").split(",") if term.strip()}
    concepts = set(analysis.get("concepts", []))
    item_feedback_scores, category_feedback_scores = get_feedback_scores(db, user)
    vector_result = vector_search_service.search(db, text, limit=12)
    vector_scores = vector_result["scores"]

    scored: list[tuple[KnowledgeItem, float, float]] = []
    score_meta: dict[str, dict[str, Any]] = {}
    for item in items:
        score = 0.4
        matched_signals: list[str] = []
        if item.emotion_tag == analysis["emotion"]:
            score += 0.25
            matched_signals.append(f"情绪:{analysis['emotion']}")
        if item.relation_tag == analysis["relationship"]:
            score += 0.2
            matched_signals.append(f"关系:{analysis['relationship']}")
        if item.scene_tag == analysis["scene"]:
            score += 0.2
            matched_signals.append(f"场景:{analysis['scene']}")
        item_concepts = [concept.strip() for concept in (item.concepts or "").split(",") if concept.strip()]
        for concept in item_concepts:
            if concept in concepts:
                score += 0.07
                matched_signals.append(f"概念:{concept}")
        direct_match_fields = [
            ("作品", item.work_title, 0.34),
            ("桥段", item.scene_title, 0.3),
            ("标题", item.title, 0.26),
            ("台词", item.quote_text, 0.42),
        ]
        for field_label, field_value, bonus in direct_match_fields:
            normalized_value = (field_value or "").strip()
            if normalized_value and normalized_value in text:
                score += bonus
                matched_signals.append(f"{field_label}直达")
        for keyword in item.keywords.split(","):
            if keyword.strip() in text or keyword.strip() in terms:
                score += 0.08
                matched_signals.append(f"关键词:{keyword.strip()}")
        if item.quote_text:
            score += 0.05
        if item.episode_label:
            score += 0.04
        if item.quote_verified:
            score += 0.04

        feedback_score = item_feedback_scores.get(str(item.id), 0) + category_feedback_scores.get(item.category, 0)
        if feedback_score:
            bounded_feedback_score = max(min(feedback_score, 0.18), -0.22)
            score += bounded_feedback_score
            matched_signals.append(f"feedback:{bounded_feedback_score:+.2f}")

        vector_score = vector_scores.get(str(item.id))
        if vector_score is not None:
            score += min(vector_score * 0.35, 0.25)
        raw_score = score
        total_score = round(min(raw_score, 0.99), 2)
        scored.append((item, raw_score, total_score))
        score_meta[str(item.id)] = {
            "matched_signals": matched_signals,
            "rule_score": total_score if vector_score is None else round(max(total_score - min(vector_score * 0.35, 0.25), 0), 2),
            "vector_score": vector_score,
            "item_concepts": item_concepts,
        }

    scored.sort(key=lambda pair: pair[1], reverse=True)

    category_counts = {"meme": 0, "anime": 0, "history": 0, "film": 0}
    results: list[dict[str, Any]] = []
    for item, _, score in scored:
        if category_counts[item.category] >= 2:
            continue
        category_counts[item.category] += 1
        meta = score_meta[str(item.id)]
        retrieval_methods = ["rule"]
        if meta["vector_score"] is not None:
            retrieval_methods.append("vector")
        reason = build_reason(
            item=item,
            text=text,
            analysis=analysis,
            matched_signals=meta["matched_signals"],
            vector_score=meta["vector_score"],
        )
        results.append(
            {
                "id": str(item.id),
                "category": item.category,
                "title": item.title,
                "summary": item.summary,
                "reason": reason,
                "score": score,
                "source": item.work_title or item.title,
                "work_title": item.work_title,
                "scene_title": item.scene_title,
                "scene_description": item.scene_description or item.summary,
                "episode_label": item.episode_label,
                "timestamp_start": item.timestamp_start,
                "timestamp_end": item.timestamp_end,
                "quote": {
                    "speaker": item.speaker,
                    "text": item.quote_text,
                    "verified": item.quote_verified,
                }
                if item.quote_text
                else None,
                "concepts": meta["item_concepts"],
                "retrieval_methods": retrieval_methods,
                "reason_meta": build_reason_meta(meta["matched_signals"], meta["rule_score"], meta["vector_score"]),
            }
        )
        if len(results) >= 8:
            break
    return results, vector_result["enabled"]


def analyze_and_save(db: Session, user: User, text: str) -> dict[str, Any]:
    ai_result = ai_service.analyze_text(text)
    analysis = ai_result or infer_by_rules(text)
    source = ai_service.provider if ai_result else "fallback"
    recommendations, vector_enabled = recommend_items(db, user, analysis, text)

    history = AnalysisHistory(
        user_id=user.id,
        input_text=text,
        emotion=analysis["emotion"],
        relationship=analysis["relationship"],
        scene=analysis["scene"],
        recommendations=recommendations,
    )
    db.add(history)
    db.commit()

    return {
        "mode": "text",
        "analysis": analysis,
        "recommendations": recommendations,
        "source": source,
        "vector_search_enabled": vector_enabled,
        "reserved_capabilities": {
            "image": True,
            "video": True,
        },
    }
