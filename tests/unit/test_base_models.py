"""
Unit tests for base model classes.
"""
from datetime import datetime
from typing import Optional

import pytest
from sqlmodel import Field, SQLModel

from app.models.base import (
    BaseModel,
    BaseNamedModel,
    BaseUserOwnedModel,
    BaseUserOwnedNamedModel,
    TimestampMixin,
)


class TestTimestampMixin:
    """Test TimestampMixin functionality."""
    
    def test_timestamp_mixin_fields(self):
        """Test that TimestampMixin has correct fields."""
        
        class TestModel(TimestampMixin):
            pass
        
        model = TestModel()
        
        # Check that created_at is set automatically
        assert hasattr(model, 'created_at')
        assert isinstance(model.created_at, datetime)
        
        # Check that updated_at is optional and defaults to None
        assert hasattr(model, 'updated_at')
        assert model.updated_at is None
    
    def test_timestamp_mixin_created_at_auto_set(self):
        """Test that created_at is automatically set to current time."""
        
        class TestModel(TimestampMixin):
            pass
        
        before = datetime.utcnow()
        model = TestModel()
        after = datetime.utcnow()
        
        assert before <= model.created_at <= after


class TestBaseModel:
    """Test BaseModel functionality."""
    
    def test_base_model_has_id_and_timestamps(self):
        """Test that BaseModel has id and timestamp fields."""
        
        class TestModel(BaseModel):
            pass
        
        model = TestModel()
        
        # Check id field
        assert hasattr(model, 'id')
        assert model.id is None  # Should default to None for auto-increment
        
        # Check timestamp fields from TimestampMixin
        assert hasattr(model, 'created_at')
        assert hasattr(model, 'updated_at')
        assert isinstance(model.created_at, datetime)
        assert model.updated_at is None


class TestBaseUserOwnedModel:
    """Test BaseUserOwnedModel functionality."""
    
    def test_base_user_owned_model_has_user_id(self):
        """Test that BaseUserOwnedModel has user_id field."""
        
        class TestModel(BaseUserOwnedModel):
            pass
        
        model = TestModel(user_id=1)
        
        # Check user_id field
        assert hasattr(model, 'user_id')
        assert model.user_id == 1
        
        # Check inherited fields
        assert hasattr(model, 'id')
        assert hasattr(model, 'created_at')
        assert hasattr(model, 'updated_at')


class TestBaseNamedModel:
    """Test BaseNamedModel functionality."""
    
    def test_base_named_model_has_name_and_description(self):
        """Test that BaseNamedModel has name and description fields."""
        
        class TestModel(BaseNamedModel):
            pass
        
        model = TestModel(name="Test Name", description="Test Description")
        
        # Check name and description fields
        assert hasattr(model, 'name')
        assert hasattr(model, 'description')
        assert model.name == "Test Name"
        assert model.description == "Test Description"
        
        # Check inherited fields
        assert hasattr(model, 'id')
        assert hasattr(model, 'created_at')
        assert hasattr(model, 'updated_at')
    
    def test_base_named_model_description_optional(self):
        """Test that description is optional in BaseNamedModel."""
        
        class TestModel(BaseNamedModel):
            pass
        
        model = TestModel(name="Test Name")
        
        assert model.name == "Test Name"
        assert model.description is None


class TestBaseUserOwnedNamedModel:
    """Test BaseUserOwnedNamedModel functionality."""
    
    def test_base_user_owned_named_model_combines_features(self):
        """Test that BaseUserOwnedNamedModel combines user ownership and naming."""
        
        class TestModel(BaseUserOwnedNamedModel):
            pass
        
        model = TestModel(
            user_id=1,
            name="Test Name",
            description="Test Description"
        )
        
        # Check all fields are present
        assert model.user_id == 1
        assert model.name == "Test Name"
        assert model.description == "Test Description"
        assert hasattr(model, 'id')
        assert hasattr(model, 'created_at')
        assert hasattr(model, 'updated_at')
    
    def test_base_user_owned_named_model_description_optional(self):
        """Test that description is optional in BaseUserOwnedNamedModel."""
        
        class TestModel(BaseUserOwnedNamedModel):
            pass
        
        model = TestModel(user_id=1, name="Test Name")
        
        assert model.user_id == 1
        assert model.name == "Test Name"
        assert model.description is None