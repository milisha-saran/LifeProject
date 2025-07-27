"""
API endpoints for habit management.
"""
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_session
from app.models.recurring import (
    Habit,
    HabitComplete,
    HabitCreate,
    HabitRead,
    HabitUpdate,
)
from app.models.user import User
from app.repositories.habit import HabitRepository

router = APIRouter(prefix="/habits", tags=["habits"])


def get_habit_repository(session: AsyncSession = Depends(get_session)) -> HabitRepository:
    """Dependency to get habit repository."""
    return HabitRepository(session)


@router.post("/", response_model=HabitRead, status_code=status.HTTP_201_CREATED)
async def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
    habit_repo: HabitRepository = Depends(get_habit_repository),
) -> HabitRead:
    """Create a new habit."""
    habit = await habit_repo.create(habit_data, current_user.id)
    return HabitRead.model_validate(habit)


@router.get("/", response_model=List[HabitRead])
async def get_habits(
    current_user: User = Depends(get_current_user),
    habit_repo: HabitRepository = Depends(get_habit_repository),
) -> List[HabitRead]:
    """Get all habits for the current user."""
    habits = await habit_repo.get_all_by_user(current_user.id)
    return [HabitRead.model_validate(habit) for habit in habits]


@router.get("/due", response_model=List[HabitRead])
async def get_due_habits(
    due_date: date | None = None,
    current_user: User = Depends(get_current_user),
    habit_repo: HabitRepository = Depends(get_habit_repository),
) -> List[HabitRead]:
    """Get habits that are due on or before the specified date."""
    habits = await habit_repo.get_due_habits(current_user.id, due_date)
    return [HabitRead.model_validate(habit) for habit in habits]


@router.get("/{habit_id}", response_model=HabitRead)
async def get_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    habit_repo: HabitRepository = Depends(get_habit_repository),
) -> HabitRead:
    """Get a specific habit by ID."""
    habit = await habit_repo.get_by_id(habit_id, current_user.id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    return HabitRead.model_validate(habit)


@router.put("/{habit_id}", response_model=HabitRead)
async def update_habit(
    habit_id: int,
    habit_data: HabitUpdate,
    current_user: User = Depends(get_current_user),
    habit_repo: HabitRepository = Depends(get_habit_repository),
) -> HabitRead:
    """Update a specific habit."""
    habit = await habit_repo.get_by_id(habit_id, current_user.id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    updated_habit = await habit_repo.update(habit, habit_data)
    return HabitRead.model_validate(updated_habit)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: int,
    current_user: User = Depends(get_current_user),
    habit_repo: HabitRepository = Depends(get_habit_repository),
) -> None:
    """Delete a specific habit."""
    habit = await habit_repo.get_by_id(habit_id, current_user.id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    await habit_repo.delete(habit)


@router.post("/{habit_id}/complete", response_model=HabitRead)
async def complete_habit(
    habit_id: int,
    completion_data: HabitComplete = HabitComplete(),
    current_user: User = Depends(get_current_user),
    habit_repo: HabitRepository = Depends(get_habit_repository),
) -> HabitRead:
    """Mark a habit as completed, update streak, and calculate next due date."""
    habit = await habit_repo.get_by_id(habit_id, current_user.id)
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found"
        )
    
    completed_habit = await habit_repo.complete_habit(habit, completion_data.completion_date)
    return HabitRead.model_validate(completed_habit)