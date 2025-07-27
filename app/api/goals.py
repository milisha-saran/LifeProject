"""
API endpoints for goal management.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_active_user
from app.core.database import get_session
from app.models.project import (
    Goal, GoalCreate, GoalRead, GoalUpdate
)
from app.models.user import User
from app.repositories.goal import GoalRepository
from app.services.time_allocation import TimeAllocationError

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/projects/{project_id}/goals", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
async def create_goal(
    project_id: int,
    goal_data: GoalCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Create a new goal for a project."""
    repository = GoalRepository(session)
    
    try:
        goal = await repository.create(goal_data, project_id, current_user.id)
        return goal
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except TimeAllocationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/projects/{project_id}/goals", response_model=List[GoalRead])
async def get_project_goals(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all goals for a project."""
    repository = GoalRepository(session)
    goals = await repository.get_all_for_project(project_id, current_user.id)
    return goals


@router.get("/", response_model=List[GoalRead])
async def get_goals(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all goals for the current user."""
    repository = GoalRepository(session)
    goals = await repository.get_all_for_user(current_user.id)
    return goals


@router.get("/{goal_id}", response_model=GoalRead)
async def get_goal(
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific goal."""
    repository = GoalRepository(session)
    goal = await repository.get_by_id(goal_id, current_user.id)
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return goal


@router.put("/{goal_id}", response_model=GoalRead)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Update a goal."""
    repository = GoalRepository(session)
    
    try:
        goal = await repository.update(goal_id, goal_data, current_user.id)
        
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goal not found"
            )
        
        return goal
    except TimeAllocationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a goal."""
    repository = GoalRepository(session)
    deleted = await repository.delete(goal_id, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )


@router.get("/{goal_id}/allocation", response_model=dict)
async def get_goal_allocation(
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get time allocation summary for a goal."""
    repository = GoalRepository(session)
    allocation = await repository.get_allocation_summary(goal_id, current_user.id)
    
    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    return allocation