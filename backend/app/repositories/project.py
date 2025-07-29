"""
Repository for Project CRUD operations.
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.project import Project, ProjectCreate, ProjectUpdate
from app.services.time_allocation import TimeAllocationService
from app.core.exceptions import TimeAllocationExceeded


class ProjectRepository:
    """Repository for Project CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.time_service = TimeAllocationService(session)
    
    async def create(self, project_data: ProjectCreate, user_id: int) -> Project:
        """
        Create a new project.
        
        Args:
            project_data: Project creation data
            user_id: ID of the user creating the project
            
        Returns:
            Created project
        """
        project = Project(
            **project_data.model_dump(),
            user_id=user_id
        )
        
        self.session.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project
    
    async def get_by_id(self, project_id: int, user_id: int) -> Optional[Project]:
        """
        Get a project by ID for a specific user.
        
        Args:
            project_id: ID of the project
            user_id: ID of the user
            
        Returns:
            Project if found, None otherwise
        """
        statement = select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
    
    async def get_all_for_user(self, user_id: int) -> List[Project]:
        """
        Get all projects for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of projects
        """
        statement = select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def update(self, project_id: int, project_data: ProjectUpdate, user_id: int) -> Optional[Project]:
        """
        Update a project.
        
        Args:
            project_id: ID of the project to update
            project_data: Updated project data
            user_id: ID of the user
            
        Returns:
            Updated project if found, None otherwise
            
        Raises:
            TimeAllocationExceeded: If hours update would violate constraints
        """
        # Get existing project
        project = await self.get_by_id(project_id, user_id)
        if not project:
            return None
        
        # Validate hours update if provided
        if project_data.weekly_hours is not None:
            await self.time_service.validate_project_hours_update(
                project_id, project_data.weekly_hours
            )
        
        # Update fields
        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
        
        await self.session.commit()
        await self.session.refresh(project)
        return project
    
    async def delete(self, project_id: int, user_id: int) -> bool:
        """
        Delete a project.
        
        Args:
            project_id: ID of the project to delete
            user_id: ID of the user
            
        Returns:
            True if deleted, False if not found
        """
        project = await self.get_by_id(project_id, user_id)
        if not project:
            return False
        
        await self.session.delete(project)
        await self.session.commit()
        return True
    
    async def get_allocation_summary(self, project_id: int, user_id: int) -> Optional[dict]:
        """
        Get time allocation summary for a project.
        
        Args:
            project_id: ID of the project
            user_id: ID of the user
            
        Returns:
            Allocation summary if project found, None otherwise
        """
        # Verify project belongs to user
        project = await self.get_by_id(project_id, user_id)
        if not project:
            return None
        
        return await self.time_service.get_project_allocation_summary(project_id)