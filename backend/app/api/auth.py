"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.core.database import get_session
from app.core.security import create_access_token, verify_password, get_password_hash, verify_token
from app.core.auth import get_current_user
from app.models.user import User, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session),
):
    """Register a new user."""
    # Check if username already exists
    username_stmt = select(User).where(User.username == user_data.username)
    username_result = await session.execute(username_stmt)
    if username_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    email_stmt = select(User).where(User.email == user_data.email)
    email_result = await session.execute(email_stmt)
    if email_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    session.add(user)
    await session.commit()
    await session.refresh(user)
    
    return user


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_session),
):
    """Login and get access token."""
    # Find user by username
    stmt = select(User).where(User.username == form_data.username)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/refresh")
async def refresh_token(
    current_user: User = Depends(get_current_user),
):
    """Refresh access token for authenticated user."""
    access_token = create_access_token(subject=str(current_user.id))
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """Get current user information."""
    return current_user