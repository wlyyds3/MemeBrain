from typing import Literal

from app.core.config import settings


def get_media_reservation(mode: Literal["image", "video"]) -> dict:
    enabled = settings.enable_image_analysis if mode == "image" else settings.enable_video_analysis
    accepted_types = (
        ["image/png", "image/jpeg", "image/webp"]
        if mode == "image"
        else ["video/mp4", "video/quicktime", "video/webm"]
    )
    planned_pipeline = (
        ["上传文件", "视觉模型识别内容", "提取概念与情绪", "走知识库与向量召回", "生成推荐理由"]
        if mode == "image"
        else ["上传视频", "抽取关键帧", "识别动作与情绪", "走知识库与向量召回", "生成推荐理由"]
    )

    return {
        "mode": mode,
        "status": "reserved",
        "enabled": enabled,
        "message": (
            "该能力已完成接口预留，当前环境默认不开启。"
            if not enabled
            else "该能力的接口已开启，可继续接入视觉模型。"
        ),
        "accepted_types": accepted_types,
        "planned_pipeline": planned_pipeline,
        "recommended_models": ["Qwen-VL", "Qwen-VL-Video"] if mode == "video" else ["Qwen-VL"],
    }
