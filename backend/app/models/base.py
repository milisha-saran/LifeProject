"""
Base model classes with common fields and functionality.
"""
from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class TimestampMixin(SQLModel):
    """Mixin class for adding timestamp fields to models."""
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: Optional[datetime] = Field(default=None, nullable=True)


class BaseModel(TimestampMixin):
    """Base model class with common fields for all entities."""
    id: Optional[int] = Field(default=None, primary_key=True)


class BaseUserOwnedModel(BaseModel):
    """Base model for entities that belong to a user."""
    user_id: int = Field(foreign_key="user.id", nullable=False, index=True)


class BaseNamedModel(BaseModel):
    """Base model for entities with name and description."""
    name: str = Field(min_length=1, max_length=255, nullable=False, index=True)
    description: Optional[str] = Field(default=None, max_length=1000, nullable=True)


class BaseUserOwnedNamedModel(BaseUserOwnedModel, BaseNamedModel):
    """Base model combining user ownership with name/description fields."""
    pass