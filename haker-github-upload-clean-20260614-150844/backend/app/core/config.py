from typing import List

from pydantic import Field, model_validator

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(
        default="sqlite:///./memebrain_dev.db",
        alias="DATABASE_URL",
    )
    secret_key: str = Field(default="change-this-in-production", alias="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_chat_model: str = Field(default="gpt-4o-mini", alias="OPENAI_CHAT_MODEL")
    deepseek_api_key: str = Field(default="", alias="DEEPSEEK_API_KEY")
    deepseek_base_url: str = Field(default="https://api.deepseek.com", alias="DEEPSEEK_BASE_URL")
    deepseek_chat_model: str = Field(default="deepseek-chat", alias="DEEPSEEK_CHAT_MODEL")
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    enable_vector_search: bool = Field(default=True, alias="ENABLE_VECTOR_SEARCH")
    vector_embedding_model: str = Field(default="text-embedding-3-small", alias="VECTOR_EMBEDDING_MODEL")
    enable_image_analysis: bool = Field(default=False, alias="ENABLE_IMAGE_ANALYSIS")
    enable_video_analysis: bool = Field(default=False, alias="ENABLE_VIDEO_ANALYSIS")
    default_admin_email: str = Field(default="admin@memebrain.com", alias="DEFAULT_ADMIN_EMAIL")
    default_admin_password: str = Field(default="Admin123456", alias="DEFAULT_ADMIN_PASSWORD")
    default_admin_name: str = Field(default="MemeBrain Admin", alias="DEFAULT_ADMIN_NAME")
    environment: str = Field(default="development", alias="ENVIRONMENT")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.environment.lower() in {"production", "prod"}:
            if self.secret_key == "change-this-in-production":
                raise ValueError("SECRET_KEY must be changed in production")
            if self.default_admin_password == "Admin123456":
                raise ValueError("DEFAULT_ADMIN_PASSWORD must be changed in production")
        return self

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


settings = Settings()


