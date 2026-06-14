from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analysis, auth, copywriting, feedback, health, history
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.services.seed_service import ensure_runtime_schema, seed_default_admin, seed_knowledge_items


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_runtime_schema()
    seed_knowledge_items()
    seed_default_admin()
    yield


app = FastAPI(
    title="MemeBrain API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(history.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(copywriting.router, prefix="/api/v1")
