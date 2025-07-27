"""
Authentication dependencies for FastAPI routes.
"""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import get_session
from app.core.security import verify_token
from app.models.user import User

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: AsyncSession = Depends(get_session),
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials containing the JWT token
        session: Database session
        
    Returns:
        The authenticated User object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Check if credentials are provided
    if credentials is None:
        raise credentials_exception
    
    # Verify the token and get the subject (user identifier)
    subject = verify_token(credentials.credentials)
    if subject is None:
        raise credentials_exception
    
    # Get user from database
    try:
        user_id = int(subject)
    except ValueError:
        raise credentials_exception
    
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current active user.
    
    Args:
        current_user: The current user from get_current_user dependency
        
    Returns:
        The active User object
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    session: AsyncSession = Depends(get_session),
) -> Optional[User]:
    """
    Get the current user if authenticated, otherwise return None.
    This is useful for endpoints that work for both authenticated and anonymous users.
    
    Args:
        credentials: Optional HTTP Bearer credentials
        session: Database session
        
    Returns:
        The authenticated User object or None if not authenticated
    """
    if credentials is None:
        return None
    
    # Verify the token and get the subject
    subject = verify_token(credentials.credentials)
    if subject is None:
        return None
    
    # Get user from database
    try:
        user_id = int(subject)
    except ValueError:
        return None
    
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    user = result.scalar_one_or_none()
    
    if user is None or not user.is_active:
        return None
    
    return user