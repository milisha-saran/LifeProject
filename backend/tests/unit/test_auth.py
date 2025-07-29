"""
Unit tests for authentication dependencies.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.core.auth import get_current_user, get_current_active_user, get_optional_current_user
from app.core.security import create_access_token
from app.models.user import User


class TestGetCurrentUser:
    """Test get_current_user dependency."""
    
    @pytest.fixture
    def mock_session(self):
        """Mock database session."""
        session = AsyncMock()
        return session
    
    @pytest.fixture
    def mock_user(self):
        """Mock user object."""
        user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=True
        )
        return user
    
    @pytest.fixture
    def valid_credentials(self):
        """Valid HTTP authorization credentials."""
        token = create_access_token("1")  # User ID 1
        return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    
    @pytest.fixture
    def invalid_credentials(self):
        """Invalid HTTP authorization credentials."""
        return HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_token")
    
    @pytest.mark.asyncio
    async def test_get_current_user_valid_token(self, mock_session, mock_user, valid_credentials):
        """Test getting current user with valid token."""
        # Mock database query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_session.execute.return_value = mock_result
        
        user = await get_current_user(valid_credentials, mock_session)
        
        assert user == mock_user
        assert user.id == 1
        assert user.username == "testuser"
        assert user.is_active is True
    
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_token(self, mock_session, invalid_credentials):
        """Test getting current user with invalid token."""
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(invalid_credentials, mock_session)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Could not validate credentials" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_current_user_user_not_found(self, mock_session, valid_credentials):
        """Test getting current user when user doesn't exist in database."""
        # Mock database query returning None
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(valid_credentials, mock_session)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Could not validate credentials" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_current_user_inactive_user(self, mock_session, valid_credentials):
        """Test getting current user when user is inactive."""
        # Mock inactive user
        inactive_user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=False
        )
        
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = inactive_user
        mock_session.execute.return_value = mock_result
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(valid_credentials, mock_session)
        
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Inactive user" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_get_current_user_invalid_user_id_format(self, mock_session):
        """Test getting current user with non-integer user ID in token."""
        # Create token with non-integer subject
        token = create_access_token("not_an_integer")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(credentials, mock_session)
        
        assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Could not validate credentials" in exc_info.value.detail


class TestGetCurrentActiveUser:
    """Test get_current_active_user dependency."""
    
    @pytest.fixture
    def active_user(self):
        """Active user object."""
        return User(
            id=1,
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=True
        )
    
    @pytest.fixture
    def inactive_user(self):
        """Inactive user object."""
        return User(
            id=1,
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=False
        )
    
    @pytest.mark.asyncio
    async def test_get_current_active_user_active(self, active_user):
        """Test getting current active user when user is active."""
        user = await get_current_active_user(active_user)
        assert user == active_user
        assert user.is_active is True
    
    @pytest.mark.asyncio
    async def test_get_current_active_user_inactive(self, inactive_user):
        """Test getting current active user when user is inactive."""
        with pytest.raises(HTTPException) as exc_info:
            await get_current_active_user(inactive_user)
        
        assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "Inactive user" in exc_info.value.detail


class TestGetOptionalCurrentUser:
    """Test get_optional_current_user dependency."""
    
    @pytest.fixture
    def mock_session(self):
        """Mock database session."""
        session = AsyncMock()
        return session
    
    @pytest.fixture
    def mock_user(self):
        """Mock user object."""
        user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=True
        )
        return user
    
    @pytest.mark.asyncio
    async def test_get_optional_current_user_no_credentials(self, mock_session):
        """Test getting optional current user with no credentials."""
        user = await get_optional_current_user(None, mock_session)
        assert user is None
    
    @pytest.mark.asyncio
    async def test_get_optional_current_user_valid_token(self, mock_session, mock_user):
        """Test getting optional current user with valid token."""
        token = create_access_token("1")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        # Mock database query result
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = mock_user
        mock_session.execute.return_value = mock_result
        
        user = await get_optional_current_user(credentials, mock_session)
        
        assert user == mock_user
        assert user.id == 1
        assert user.is_active is True
    
    @pytest.mark.asyncio
    async def test_get_optional_current_user_invalid_token(self, mock_session):
        """Test getting optional current user with invalid token."""
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_token")
        
        user = await get_optional_current_user(credentials, mock_session)
        assert user is None
    
    @pytest.mark.asyncio
    async def test_get_optional_current_user_user_not_found(self, mock_session):
        """Test getting optional current user when user doesn't exist."""
        token = create_access_token("999")  # Non-existent user ID
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        # Mock database query returning None
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_session.execute.return_value = mock_result
        
        user = await get_optional_current_user(credentials, mock_session)
        assert user is None
    
    @pytest.mark.asyncio
    async def test_get_optional_current_user_inactive_user(self, mock_session):
        """Test getting optional current user when user is inactive."""
        token = create_access_token("1")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        # Mock inactive user
        inactive_user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            hashed_password="hashed_password",
            is_active=False
        )
        
        mock_result = AsyncMock()
        mock_result.scalar_one_or_none.return_value = inactive_user
        mock_session.execute.return_value = mock_result
        
        user = await get_optional_current_user(credentials, mock_session)
        assert user is None
    
    @pytest.mark.asyncio
    async def test_get_optional_current_user_invalid_user_id_format(self, mock_session):
        """Test getting optional current user with non-integer user ID in token."""
        token = create_access_token("not_an_integer")
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        user = await get_optional_current_user(credentials, mock_session)
        assert user is None