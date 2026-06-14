from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.copywriting import CopywritingRequest, CopywritingResponse, PlatformCopy
from app.schemas.analysis import RecommendationItem
from app.utils.deps import get_current_user

router = APIRouter(prefix="/copywriting", tags=["copywriting"])

STYLE_HINTS = {
    "balanced": "表达清楚，兼顾信息量和传播感",
    "funny": "更像吐槽和梗图旁白，节奏更轻快",
    "sharp": "观点更直接，钩子更强，适合短视频开头",
    "warm": "语气更共情，适合情绪记录和小红书",
    "cinematic": "更有画面感，强调镜头、场景和转场",
}

VARIANT_OPENERS = [
    "这个瞬间最适合被翻译成一个名场面。",
    "换个说法，它不是一句吐槽，而是一整段剧情。",
    "如果把这句话拍出来，前 3 秒就该这样开场。",
]


def _focus_item(payload: CopywritingRequest) -> RecommendationItem | None:
    if payload.focus_recommendation_id:
        for item in payload.recommendations:
            if str(item.id) == payload.focus_recommendation_id:
                return item
    return payload.recommendations[0] if payload.recommendations else None


def _pick_scene(payload: CopywritingRequest) -> str:
    item = _focus_item(payload)
    if item:
        return item.scene_title or item.title
    return payload.analysis.scene


def _pick_quote(payload: CopywritingRequest) -> str | None:
    focused = _focus_item(payload)
    if focused and focused.quote and focused.quote.text:
        return focused.quote.text
    for item in payload.recommendations:
        if item.quote and item.quote.text:
            return item.quote.text
    return None


def _tags(payload: CopywritingRequest, *extra: str) -> list[str]:
    base = [payload.analysis.emotion, payload.analysis.relationship, payload.analysis.scene]
    base.extend(payload.analysis.concepts[:3])
    base.extend(extra)
    result: list[str] = []
    for tag in base:
        clean = tag.strip().replace(" ", "")
        if clean and clean not in result:
            result.append(clean)
    return result[:8]


def _opener(payload: CopywritingRequest) -> str:
    return VARIANT_OPENERS[payload.variant_seed % len(VARIANT_OPENERS)]


def _style_line(payload: CopywritingRequest) -> str:
    return STYLE_HINTS.get(payload.style, STYLE_HINTS["balanced"])


@router.post("", response_model=CopywritingResponse)
def generate_copywriting(
    payload: CopywritingRequest,
    current_user: User = Depends(get_current_user),
) -> CopywritingResponse:
    _ = current_user.id
    scene = _pick_scene(payload)
    quote = _pick_quote(payload)
    focus = _focus_item(payload)
    focus_title = focus.title if focus else payload.analysis.scene
    opener = _opener(payload)
    style_line = _style_line(payload)
    copies: list[PlatformCopy] = []

    if "douyin" in payload.platforms:
        body_lines = [
            opener,
            f"输入：{payload.input_text}",
            f"联想到：{focus_title}。这条内容的核心是{payload.analysis.emotion}，但真正有冲突的是{payload.analysis.relationship}。",
            f"表达方式：{style_line}。",
        ]
        if quote:
            body_lines.append(f"可借用台词：{quote}")
        body_lines.append("剪辑建议：强钩子开头，接一个具体桥段，最后用现实语境收尾。")
        copies.append(
            PlatformCopy(
                platform="douyin",
                title=f"这不就是现实版《{scene}》吗？",
                body="\n".join(body_lines),
                tags=_tags(payload, "短视频", "情绪共鸣", payload.style),
            )
        )

    if "xiaohongshu" in payload.platforms:
        body_lines = [
            f"今天这段很适合用“{focus_title}”来形容。",
            f"表面是在说：{payload.input_text}",
            f"实际拆开是：{payload.analysis.emotion} / {payload.analysis.relationship} / {payload.analysis.scene}。",
            f"这版语气会更偏：{style_line}。",
            "做内容时可以少写抽象情绪，多写一个具体画面，读者会更容易代入。",
        ]
        if payload.recommendations:
            body_lines.append("可参考联想：" + " / ".join(item.title for item in payload.recommendations[:3]))
        copies.append(
            PlatformCopy(
                platform="xiaohongshu",
                title="这个表达方式，比直接吐槽更有画面感",
                body="\n".join(body_lines),
                tags=_tags(payload, "小红书文案", "灵感记录", payload.style),
            )
        )

    if "bilibili" in payload.platforms:
        body_lines = [
            f"本期主题：从一句“{payload.input_text}”拆出可视化表达。",
            f"核心情绪：{payload.analysis.emotion}；关系结构：{payload.analysis.relationship}；场景：{payload.analysis.scene}。",
            f"主联想桥段：{focus_title}。",
            f"风格方向：{style_line}。",
            "结构建议：先抛出现实文本，再切入经典桥段，最后回到当下语境做二次解读。",
        ]
        copies.append(
            PlatformCopy(
                platform="bilibili",
                title=f"如何把一句话变成一个名场面：{payload.analysis.scene}",
                body="\n".join(body_lines),
                tags=_tags(payload, "B站", "名场面", "创作思路", payload.style),
            )
        )

    return CopywritingResponse(copies=copies)