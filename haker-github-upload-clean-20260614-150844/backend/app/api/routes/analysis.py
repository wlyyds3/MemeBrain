from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse, MediaReserveResponse
from app.services.analysis_service import analyze_and_save
from app.utils.deps import get_current_user

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("", response_model=AnalyzeResponse)
def analyze_text(
    payload: AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return analyze_and_save(db, current_user, payload.text)


@router.post("/image", response_model=MediaReserveResponse)
def analyze_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict:
    _ = current_user.id, file.filename
    raise HTTPException(status_code=501, detail="图片分析功能尚未实现")


@router.post("/video", response_model=MediaReserveResponse)
def analyze_video(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict:
    _ = current_user.id, file.filename
    raise HTTPException(status_code=501, detail="视频分析功能尚未实现")


