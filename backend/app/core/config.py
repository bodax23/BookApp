import os
from typing import Optional, Dict, Any, List
from pydantic import validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Reading List API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "d2e818eb85ee6fce41f2f9dd2edc6a1ddcf6761c1c43db7abee916f9ffa3b4ff")
    
    # Token settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # Database settings
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_NAME: str = os.getenv("DB_NAME", "reading_list")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DATABASE_URI: Optional[str] = None
    
    # Open Library API
    OPEN_LIBRARY_SEARCH_URL: str = "https://openlibrary.org/search.json"
    OPEN_LIBRARY_BOOK_URL: str = "https://openlibrary.org/works/{}.json"
    OPEN_LIBRARY_COVER_URL: str = "https://covers.openlibrary.org/b/id/{}-M.jpg"

    @validator("DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return f"mysql+pymysql://{values.get('DB_USER')}:{values.get('DB_PASSWORD')}@" \
               f"{values.get('DB_HOST')}:{values.get('DB_PORT')}/{values.get('DB_NAME')}"

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost",
        "http://localhost:3009",
    ]
    
    # Logging settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "app.log")

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()