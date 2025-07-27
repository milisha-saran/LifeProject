"""
Repository for Goal CRUD operations.
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.project import Goal, GoalCreate, GoalUpdate, Project
from app.services.time_allocation import TimeAllocationService, TimeAllocationError


class GoalRepository:
    """Repository for Goal CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.time_service = TimeAllocationService(session)
    
    async def create(self, goal_data: GoalCreate, project_id: int, user_id: int) -> Goal:
        """
        Create a new goal.
        
        Args:
            goal_data: Goal creation data
            project_id: ID of the parent project
            user_id: ID of the user creating the goal
            
        Returns:
            Created goal
            
        Raises:
            ValueError: If project not found or doesn't belong to user
            TimeAllocationError: If hours would exceed project allocation
        """
        # Verify project exists and belongs to user
        project_stmt = select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id
        )
        project_result = await self.session.execute(project_stmt)
        project = project_result.scalar_one_or_none()
        
        if not project:
            raise ValueError(f"Project with ID {project_id} not found or access denied")
        
        # Validate time allocation
        await self.time_service.validate_goal_hours_for_project(
            project_id, goal_data.weekly_hours
        )
        
        goal = Goal(
            **goal_data.model_dump(),
            project_id=project_id,
            user_id=user_id
        )
        
        self.session.add(goal)
        await self.session.commit()
        await self.session.refresh(goal)
        return goal
    
    async def get_by_id(self, goal_id: int, user_id: int) -> Optional[Goal]:
        """
        Get a goal by ID for a specific user.
        
        Args:
            goal_id: ID of the goal
            user_id: ID of the user
            
        Returns:
            Goal if found, None otherwise
        """
        statement = select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
    
    async def get_all_for_project(self, project_id: int, user_id: int) -> List[Goal]:
        """
        Get all goals for a project.
        
        Args:
            project_id: ID of the project
            user_id: ID of the user
            
        Returns:
            List of goals
        """
        # Verify project belongs to user
        project_stmt = select(Project).where(
            Project.id == project_id,
            Project.user_id == user_id
        )
        project_result = await self.session.execute(project_stmt)
        project = project_result.scalar_one_or_none()
        
        if not project:
            return []
        
        statement = select(Goal).where(Goal.project_id == project_id).order_by(Goal.created_at.desc())
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def get_all_for_user(self, user_id: int) -> List[Goal]:
        """
        Get all goals for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of goals
        """
        statement = select(Goal).where(Goal.user_id == user_id).order_by(Goal.created_at.desc())
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def update(self, goal_id: int, goal_data: GoalUpdate, user_id: int) -> Optional[Goal]:
        """
        Update a goal.
        
        Args:
            goal_id: ID of the goal to update
            goal_data: Updated goal data
            user_id: ID of the user
            
        Returns:
            Updated goal if found, None otherwise
            
        Raises:
            TimeAllocationError: If hours update would violate constraints
        """
        # Get existing goal
        goal = await self.get_by_id(goal_id, user_id)
        if not goal:
            return None
        
        # Validate hours update if provided
        if goal_data.weekly_hours is not None:
            # Check if new hours would violate project constraints
            await self.time_service.validate_goal_hours_for_project(
                goal.project_id, goal_data.weekly_hours, exclude_goal_id=goal_id
            )
            
            # Check if new hours would violate existing task allocations
            await self.time_service.validate_goal_hours_update(
                goal_id, goal_data.weekly_hours
            )
        
        # Update fields
        update_data = goal_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(goal, field, value)
        
        await self.session.commit()
        await self.session.refresh(goal)
        return goal
    
    async def delete(self, goal_id: int, user_id: int) -> bool:
        """
        Delete a goal.
        
        Args:
            goal_id: ID of the goal to delete
            user_id: ID of the user
            
        Returns:
            True if deleted, False if not found
        """
        goal = await self.get_by_id(goal_id, user_id)
        if not goal:
            return False
        
        await self.session.delete(goal)
        await self.session.commit()
        return True
    
    async def get_allocation_summary(self, goal_id: int, user_id: int) -> Optional[dict]:
        """
        Get time allocation summary for a goal.
        
        Args:
            goal_id: ID of the goal
            user_id: ID of the user
            
        Returns:
            Allocation summary if goal found, None otherwise
        """
        # Verify goal belongs to user
        goal = await self.get_by_id(goal_id, user_id)
        if not goal:
            return None
        
        return await self.time_service.get_goal_allocation_summary(goal_id)