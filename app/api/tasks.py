"""
API endpoints for task management.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_active_user
from app.core.database import get_session
from app.models.project import (
    Task, TaskCreate, TaskRead, TaskUpdate
)
from app.models.user import User
from app.repositories.task import TaskRepository
from app.services.time_allocation import TimeAllocationError

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/goals/{goal_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    goal_id: int,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Create a new task for a goal."""
    repository = TaskRepository(session)
    
    try:
        task = await repository.create(task_data, goal_id, current_user.id)
        return task
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


@router.get("/goals/{goal_id}/tasks", response_model=List[TaskRead])
async def get_goal_tasks(
    goal_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all tasks for a goal."""
    repository = TaskRepository(session)
    tasks = await repository.get_all_for_goal(goal_id, current_user.id)
    return tasks


@router.get("/", response_model=List[TaskRead])
async def get_tasks(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all tasks for the current user."""
    repository = TaskRepository(session)
    tasks = await repository.get_all_for_user(current_user.id)
    return tasks


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific task."""
    repository = TaskRepository(session)
    task = await repository.get_by_id(task_id, current_user.id)
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Update a task."""
    repository = TaskRepository(session)
    
    try:
        task = await repository.update(task_id, task_data, current_user.id)
        
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        return task
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


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a task."""
    repository = TaskRepository(session)
    deleted = await repository.delete(task_id, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )