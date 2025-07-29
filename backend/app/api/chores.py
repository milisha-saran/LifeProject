"""
API endpoints for chore management.
"""
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_session
from app.models.recurring import (
    Chore,
    ChoreComplete,
    ChoreCreate,
    ChoreRead,
    ChoreUpdate,
)
from app.models.user import User
from app.repositories.chore import ChoreRepository

router = APIRouter(prefix="/chores", tags=["chores"])


def get_chore_repository(session: AsyncSession = Depends(get_session)) -> ChoreRepository:
    """Dependency to get chore repository."""
    return ChoreRepository(session)


@router.post("/", response_model=ChoreRead, status_code=status.HTTP_201_CREATED)
async def create_chore(
    chore_data: ChoreCreate,
    current_user: User = Depends(get_current_user),
    chore_repo: ChoreRepository = Depends(get_chore_repository),
) -> ChoreRead:
    """Create a new chore."""
    chore = await chore_repo.create(chore_data, current_user.id)
    return ChoreRead.model_validate(chore)


@router.get("/", response_model=List[ChoreRead])
async def get_chores(
    current_user: User = Depends(get_current_user),
    chore_repo: ChoreRepository = Depends(get_chore_repository),
) -> List[ChoreRead]:
    """Get all chores for the current user."""
    chores = await chore_repo.get_all_by_user(current_user.id)
    return [ChoreRead.model_validate(chore) for chore in chores]


@router.get("/due", response_model=List[ChoreRead])
async def get_due_chores(
    due_date: date | None = None,
    current_user: User = Depends(get_current_user),
    chore_repo: ChoreRepository = Depends(get_chore_repository),
) -> List[ChoreRead]:
    """Get chores that are due on or before the specified date."""
    chores = await chore_repo.get_due_chores(current_user.id, due_date)
    return [ChoreRead.model_validate(chore) for chore in chores]


@router.get("/{chore_id}", response_model=ChoreRead)
async def get_chore(
    chore_id: int,
    current_user: User = Depends(get_current_user),
    chore_repo: ChoreRepository = Depends(get_chore_repository),
) -> ChoreRead:
    """Get a specific chore by ID."""
    chore = await chore_repo.get_by_id(chore_id, current_user.id)
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found"
        )
    return ChoreRead.model_validate(chore)


@router.put("/{chore_id}", response_model=ChoreRead)
async def update_chore(
    chore_id: int,
    chore_data: ChoreUpdate,
    current_user: User = Depends(get_current_user),
    chore_repo: ChoreRepository = Depends(get_chore_repository),
) -> ChoreRead:
    """Update a specific chore."""
    chore = await chore_repo.get_by_id(chore_id, current_user.id)
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found"
        )
    
    updated_chore = await chore_repo.update(chore, chore_data)
    return ChoreRead.model_validate(updated_chore)


@router.delete("/{chore_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chore(
    chore_id: int,
    current_user: User = Depends(get_current_user),
    chore_repo: ChoreRepository = Depends(get_chore_repository),
) -> None:
    """Delete a specific chore."""
    chore = await chore_repo.get_by_id(chore_id, current_user.id)
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found"
        )
    
    await chore_repo.delete(chore)


@router.post("/{chore_id}/complete", response_model=ChoreRead)
async def complete_chore(
    chore_id: int,
    completion_data: ChoreComplete = ChoreComplete(),
    current_user: User = Depends(get_current_user),
    chore_repo: ChoreRepository = Depends(get_chore_repository),
) -> ChoreRead:
    """Mark a chore as completed and update next due date."""
    chore = await chore_repo.get_by_id(chore_id, current_user.id)
    if not chore:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chore not found"
        )
    
    completed_chore = await chore_repo.complete_chore(chore, completion_data.completion_date)
    return ChoreRead.model_validate(completed_chore)