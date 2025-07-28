"""
Repository for Task CRUD operations.
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.project import Task, TaskCreate, TaskUpdate, Goal
from app.services.time_allocation import TimeAllocationService


class TaskRepository:
    """Repository for Task CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
        self.time_service = TimeAllocationService(session)
    
    async def create(self, task_data: TaskCreate, goal_id: int, user_id: int) -> Task:
        """
        Create a new task.
        
        Args:
            task_data: Task creation data
            goal_id: ID of the parent goal
            user_id: ID of the user creating the task
            
        Returns:
            Created task
            
        Raises:
            ValueError: If goal not found or doesn't belong to user
            TimeAllocationError: If hours would exceed goal allocation
        """
        # Verify goal exists and belongs to user
        goal_stmt = select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == user_id
        )
        goal_result = await self.session.execute(goal_stmt)
        goal = goal_result.scalar_one_or_none()
        
        if not goal:
            raise ValueError(f"Goal with ID {goal_id} not found or access denied")
        
        # Validate time allocation
        await self.time_service.validate_task_hours_for_goal(
            goal_id, task_data.weekly_hours
        )
        
        task = Task(
            **task_data.model_dump(),
            goal_id=goal_id,
            user_id=user_id
        )
        
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task
    
    async def get_by_id(self, task_id: int, user_id: int) -> Optional[Task]:
        """
        Get a task by ID for a specific user.
        
        Args:
            task_id: ID of the task
            user_id: ID of the user
            
        Returns:
            Task if found, None otherwise
        """
        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
    
    async def get_all_for_goal(self, goal_id: int, user_id: int) -> List[Task]:
        """
        Get all tasks for a goal.
        
        Args:
            goal_id: ID of the goal
            user_id: ID of the user
            
        Returns:
            List of tasks
        """
        # Verify goal belongs to user
        goal_stmt = select(Goal).where(
            Goal.id == goal_id,
            Goal.user_id == user_id
        )
        goal_result = await self.session.execute(goal_stmt)
        goal = goal_result.scalar_one_or_none()
        
        if not goal:
            return []
        
        statement = select(Task).where(Task.goal_id == goal_id).order_by(Task.created_at.desc())
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def get_all_for_user(self, user_id: int) -> List[Task]:
        """
        Get all tasks for a user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of tasks
        """
        statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        result = await self.session.execute(statement)
        return result.scalars().all()
    
    async def update(self, task_id: int, task_data: TaskUpdate, user_id: int) -> Optional[Task]:
        """
        Update a task.
        
        Args:
            task_id: ID of the task to update
            task_data: Updated task data
            user_id: ID of the user
            
        Returns:
            Updated task if found, None otherwise
            
        Raises:
            TimeAllocationError: If hours update would violate constraints
        """
        # Get existing task
        task = await self.get_by_id(task_id, user_id)
        if not task:
            return None
        
        # Validate hours update if provided
        if task_data.weekly_hours is not None:
            await self.time_service.validate_task_hours_for_goal(
                task.goal_id, task_data.weekly_hours, exclude_task_id=task_id
            )
        
        # Update fields
        update_data = task_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        
        await self.session.commit()
        await self.session.refresh(task)
        return task
    
    async def delete(self, task_id: int, user_id: int) -> bool:
        """
        Delete a task.
        
        Args:
            task_id: ID of the task to delete
            user_id: ID of the user
            
        Returns:
            True if deleted, False if not found
        """
        task = await self.get_by_id(task_id, user_id)
        if not task:
            return False
        
        await self.session.delete(task)
        await self.session.commit()
        return True