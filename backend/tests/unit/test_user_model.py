"""
Unit tests for User model and related schemas.
"""
from datetime import datetime

import pytest
from pydantic import ValidationError

from app.models.user import User, UserCreate, UserRead, UserUpdate


class TestUser:
    """Test User model."""
    
    def test_user_creation_valid(self):
        """Test creating a valid user."""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.hashed_password == "hashed_password_123"
        assert user.is_active is True  # Default value
        assert isinstance(user.created_at, datetime)
        assert user.updated_at is None
        assert user.id is None  # Will be set by database
    
    def test_user_username_case_sensitivity(self):
        """Test that username preserves case as entered."""
        user = User(
            username="TestUser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        
        assert user.username == "TestUser"
    
    def test_user_email_case_sensitivity(self):
        """Test that email preserves case as entered."""
        user = User(
            username="testuser",
            email="Test@Example.COM",
            hashed_password="hashed_password_123"
        )
        
        assert user.email == "Test@Example.COM"
    
    def test_user_username_special_characters_allowed(self):
        """Test that valid username characters are accepted."""
        user = User(
            username="test_user-123",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        
        assert user.username == "test_user-123"
    
    def test_user_username_validation_valid_characters(self):
        """Test that valid username characters are accepted."""
        valid_usernames = ["testuser", "test_user", "test-user", "test123", "123test"]
        
        for username in valid_usernames:
            user = User(
                username=username,
                email="test@example.com",
                hashed_password="hashed_password_123"
            )
            assert user.username == username
    
    def test_user_is_active_default(self):
        """Test that is_active defaults to True."""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123"
        )
        
        assert user.is_active is True
    
    def test_user_is_active_explicit_false(self):
        """Test that is_active can be set to False."""
        user = User(
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password_123",
            is_active=False
        )
        
        assert user.is_active is False


class TestUserCreate:
    """Test UserCreate schema."""
    
    def test_user_create_valid(self):
        """Test creating a valid UserCreate schema."""
        user_create = UserCreate(
            username="testuser",
            email="test@example.com",
            password="password123"
        )
        
        assert user_create.username == "testuser"
        assert user_create.email == "test@example.com"
        assert user_create.password == "password123"
    
    def test_user_create_username_lowercase_conversion(self):
        """Test that username is converted to lowercase in UserCreate."""
        user_create = UserCreate(
            username="TestUser",
            email="test@example.com",
            password="password123"
        )
        
        assert user_create.username == "testuser"
    
    def test_user_create_email_lowercase_conversion(self):
        """Test that email is converted to lowercase in UserCreate."""
        user_create = UserCreate(
            username="testuser",
            email="Test@Example.COM",
            password="password123"
        )
        
        assert user_create.email == "test@example.com"
    
    def test_user_create_username_invalid_characters(self):
        """Test that invalid username characters raise validation error in UserCreate."""
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(
                username="test@user",  # @ is not allowed
                email="test@example.com",
                password="password123"
            )
        
        assert "Username can only contain letters, numbers, underscores, and hyphens" in str(exc_info.value)
    
    def test_user_create_username_too_short(self):
        """Test that username must be at least 3 characters."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="ab",  # Too short
                email="test@example.com",
                password="password123"
            )
    
    def test_user_create_username_too_long(self):
        """Test that username cannot exceed 50 characters."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="a" * 51,  # Too long
                email="test@example.com",
                password="password123"
            )
    
    def test_user_create_password_too_short(self):
        """Test that password must be at least 8 characters."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                password="1234567"  # Too short
            )
    
    def test_user_create_password_too_long(self):
        """Test that password cannot exceed 100 characters."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                password="a" * 101  # Too long
            )
    
    def test_user_create_invalid_email(self):
        """Test that invalid email format raises validation error."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="invalid-email",  # Invalid format
                password="password123"
            )


class TestUserRead:
    """Test UserRead schema."""
    
    def test_user_read_valid(self):
        """Test creating a valid UserRead schema."""
        user_read = UserRead(
            id=1,
            username="testuser",
            email="test@example.com",
            is_active=True,
            created_at="2023-01-01T00:00:00"
        )
        
        assert user_read.id == 1
        assert user_read.username == "testuser"
        assert user_read.email == "test@example.com"
        assert user_read.is_active is True
        assert user_read.created_at == "2023-01-01T00:00:00"


class TestUserUpdate:
    """Test UserUpdate schema."""
    
    def test_user_update_all_fields_optional(self):
        """Test that all fields in UserUpdate are optional."""
        user_update = UserUpdate()
        
        assert user_update.username is None
        assert user_update.email is None
        assert user_update.is_active is None
    
    def test_user_update_partial_update(self):
        """Test partial update with some fields."""
        user_update = UserUpdate(
            username="newusername",
            is_active=False
        )
        
        assert user_update.username == "newusername"
        assert user_update.email is None
        assert user_update.is_active is False
    
    def test_user_update_username_validation(self):
        """Test that username validation applies to UserUpdate."""
        with pytest.raises(ValidationError):
            UserUpdate(username="ab")  # Too short
    
    def test_user_update_email_validation(self):
        """Test that email validation applies to UserUpdate."""
        with pytest.raises(ValidationError):
            UserUpdate(email="invalid-email")  # Invalid format