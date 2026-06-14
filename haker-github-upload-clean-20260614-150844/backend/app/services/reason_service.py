from typing import Any

from app.models.knowledge_item import KnowledgeItem


def build_reason(
    item: KnowledgeItem,
    text: str,
    analysis: dict[str, str],
    matched_signals: list[str],
    vector_score: float | None,
) -> str:
    signal_text = " + ".join(matched_signals[:3]) if matched_signals else "当前语义"
    clip_name = item.scene_title or item.title
    work_name = item.work_title or item.title
    base = f"当前输入“{text[:24]}”呈现出 {signal_text} 的特征"

    if item.category == "meme":
        tail = f"因此更适合联想到“{work_name}”里的这类表达模板。"
    elif item.category == "anime":
        tail = f"它和《{work_name}》中“{clip_name}”这段画面的冲突结构非常接近。"
    elif item.category == "film":
        tail = f"它和《{work_name}》里“{clip_name}”这场戏的压迫感与语气非常接近。"
    else:
        tail = f"它和“{work_name}”所代表的历史处境与人物关系高度相似。"

    vector_suffix = ""
    if vector_score is not None and vector_score > 0:
        vector_suffix = f" 同时，向量语义召回也给出了 {int(vector_score * 100)}% 的相似信号。"

    quote_suffix = ""
    if item.quote_text:
        quote_suffix = f" 推荐直接用的台词是“{item.quote_text}”。"

    episode_bits = [part for part in [item.episode_label, item.timestamp_start and item.timestamp_end and f"{item.timestamp_start} - {item.timestamp_end}"] if part]
    reference_suffix = f" 可参考片段：{' | '.join(episode_bits)}。" if episode_bits else ""

    analysis_suffix = (
        f" 系统识别为“{analysis['emotion']} / {analysis['relationship']} / {analysis['scene']}”，"
        f"因此优先联想到 {work_name}。"
    )
    return f"{base}，{tail}{analysis_suffix}{quote_suffix}{reference_suffix}{vector_suffix}"


def build_reason_meta(matched_signals: list[str], rule_score: float, vector_score: float | None) -> dict[str, Any]:
    return {
        "matched_signals": matched_signals,
        "rule_score": round(rule_score, 2),
        "vector_score": round(vector_score, 4) if vector_score is not None else None,
    }
