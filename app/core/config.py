"""
Application configuration settings.
"""
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Productivity Management System"
    DEBUG: bool = False
    
    # CORS Configuration
    ALLOWED_HOSTS: Union[List[str], str] = ["*"]
    
    # Database Configuration
    DATABASE_URL: str
    TEST_DATABASE_URL: str = "postgresql://milisha:helloworld@localhost/life_project_test"
    
    # Security Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def parse_allowed_hosts(cls, v: Union[str, List[str]]) -> List[str]:
        """Parse ALLOWED_HOSTS from string or list."""
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    model_config = {"env_file": ".env"}


settings = Settings()