"""
User model for authentication and user management.
"""
from datetime import datetime
from typing import Optional

from pydantic import EmailStr, field_validator, model_validator
from sqlmodel import Field, SQLModel

from .base import BaseModel


class User(BaseModel, table=True):
    """User model for authentication and user management."""
    
    username: str = Field(
        min_length=3,
        max_length=50,
        nullable=False,
        unique=True,
        index=True,
        description="Unique username for the user"
    )
    
    email: str = Field(
        nullable=False,
        unique=True,
        index=True,
        description="User's email address"
    )
    
    hashed_password: str = Field(
        nullable=False,
        description="Hashed password for authentication"
    )
    
    is_active: bool = Field(
        default=True,
        nullable=False,
        description="Whether the user account is active"
    )
    



class UserCreate(SQLModel):
    """Schema for creating a new user."""
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        # Check if username contains only allowed characters
        allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')
        if not all(c in allowed_chars for c in v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        """Validate and normalize email."""
        return str(v).lower()


class UserRead(SQLModel):
    """Schema for reading user data (excludes sensitive fields)."""
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime


class UserUpdate(SQLModel):
    """Schema for updating user data."""
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        """Validate username format."""
        if v is None:
            return v
        # Check if username contains only allowed characters
        allowed_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-')
        if not all(c in allowed_chars for c in v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: Optional[EmailStr]) -> Optional[str]:
        """Validate and normalize email."""
        if v is None:
            return v
        return str(v).lower()