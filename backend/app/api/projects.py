"""
API endpoints for project management.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_active_user
from app.core.database import get_session
from app.models.project import (
    Project, ProjectCreate, ProjectRead, ProjectUpdate
)
from app.models.user import User
from app.repositories.project import ProjectRepository
from app.services.time_allocation import TimeAllocationService
from app.core.exceptions import ResourceNotFound, UnauthorizedAccess

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Create a new project."""
    repository = ProjectRepository(session)
    
    repository = ProjectRepository(session)
    project = await repository.create(project_data, current_user.id)
    return project


@router.get("/", response_model=List[ProjectRead])
async def get_projects(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all projects for the current user."""
    repository = ProjectRepository(session)
    projects = await repository.get_all_for_user(current_user.id)
    return projects


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific project."""
    repository = ProjectRepository(session)
    project = await repository.get_by_id(project_id, current_user.id)
    
    if not project:
        raise ResourceNotFound("Project", project_id)
    
    return project


@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Update a project."""
    repository = ProjectRepository(session)
    
    repository = ProjectRepository(session)
    project = await repository.update(project_id, project_data, current_user.id)
    
    if not project:
        raise ResourceNotFound("Project", project_id)
    
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a project."""
    repository = ProjectRepository(session)
    deleted = await repository.delete(project_id, current_user.id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )


@router.get("/{project_id}/allocation", response_model=dict)
async def get_project_allocation(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
):
    """Get time allocation summary for a project."""
    repository = ProjectRepository(session)
    allocation = await repository.get_allocation_summary(project_id, current_user.id)
    
    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return allocation