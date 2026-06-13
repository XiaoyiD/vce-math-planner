from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    anthropic_api_key: str
    chroma_path: str = str(Path(__file__).parents[2] / "chroma_db")

    class Config:
        env_file = Path(__file__).parents[2] / ".env"


settings = Settings()
