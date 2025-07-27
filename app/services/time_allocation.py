"""
Time allocation service for validating hour constraints in the project hierarchy.
"""
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func

from app.models.project import Project, Goal, Task
from app.core.exceptions import TimeAllocationExceeded, ResourceNotFound


class TimeAllocationService:
    """Service for managing and validating time allocation constraints."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def validate_goal_hours_for_project(
        self, 
        project_id: int, 
        new_goal_hours: float, 
        exclude_goal_id: Optional[int] = None
    ) -> None:
        """
        Validate that adding/updating a goal's hours won't exceed project allocation.
        
        Args:
            project_id: ID of the project
            new_goal_hours: Hours for the new/updated goal
            exclude_goal_id: Goal ID to exclude from calculation (for updates)
            
        Raises:
            TimeAllocationError: If the hours would exceed project allocation
        """
        # Get project
        project_stmt = select(Project).where(Project.id == project_id)
        project_result = await self.session.execute(project_stmt)
        project = project_result.scalar_one_or_none()
        
        if not project:
            raise ResourceNotFound("Project", project_id)
        
        # Calculate current goal hours (excluding the goal being updated if any)
        goals_stmt = select(func.sum(Goal.weekly_hours)).where(Goal.project_id == project_id)
        if exclude_goal_id:
            goals_stmt = goals_stmt.where(Goal.id != exclude_goal_id)
        
        result = await self.session.execute(goals_stmt)
        current_goal_hours = result.scalar() or 0.0
        
        # Check if adding new goal hours would exceed project allocation
        total_hours = current_goal_hours + new_goal_hours
        if total_hours > project.weekly_hours:
            available_hours = project.weekly_hours - current_goal_hours
            raise TimeAllocationExceeded(
                f"Goal hours ({new_goal_hours}) would exceed project allocation. "
                f"Project has {project.weekly_hours} hours total, "
                f"{current_goal_hours} already allocated to goals, "
                f"only {available_hours} hours available.",
                project_id=project_id,
                current_allocation=current_goal_hours,
                requested_hours=new_goal_hours,
                available_hours=available_hours
            )
    
    async def validate_task_hours_for_goal(
        self, 
        goal_id: int, 
        new_task_hours: float, 
        exclude_task_id: Optional[int] = None
    ) -> None:
        """
        Validate that adding/updating a task's hours won't exceed goal allocation.
        
        Args:
            goal_id: ID of the goal
            new_task_hours: Hours for the new/updated task
            exclude_task_id: Task ID to exclude from calculation (for updates)
            
        Raises:
            TimeAllocationError: If the hours would exceed goal allocation
        """
        # Get goal
        goal_stmt = select(Goal).where(Goal.id == goal_id)
        goal_result = await self.session.execute(goal_stmt)
        goal = goal_result.scalar_one_or_none()
        
        if not goal:
            raise ResourceNotFound("Goal", goal_id)
        
        # Calculate current task hours (excluding the task being updated if any)
        tasks_stmt = select(func.sum(Task.weekly_hours)).where(Task.goal_id == goal_id)
        if exclude_task_id:
            tasks_stmt = tasks_stmt.where(Task.id != exclude_task_id)
        
        result = await self.session.execute(tasks_stmt)
        current_task_hours = result.scalar() or 0.0
        
        # Check if adding new task hours would exceed goal allocation
        total_hours = current_task_hours + new_task_hours
        if total_hours > goal.weekly_hours:
            available_hours = goal.weekly_hours - current_task_hours
            raise TimeAllocationExceeded(
                f"Task hours ({new_task_hours}) would exceed goal allocation. "
                f"Goal has {goal.weekly_hours} hours total, "
                f"{current_task_hours} already allocated to tasks, "
                f"only {available_hours} hours available.",
                goal_id=goal_id,
                current_allocation=current_task_hours,
                requested_hours=new_task_hours,
                available_hours=available_hours
            )
    
    async def get_project_allocation_summary(self, project_id: int) -> dict:
        """
        Get a summary of time allocation for a project.
        
        Args:
            project_id: ID of the project
            
        Returns:
            Dictionary with allocation summary
        """
        # Get project
        project_stmt = select(Project).where(Project.id == project_id)
        project_result = await self.session.execute(project_stmt)
        project = project_result.scalar_one_or_none()
        
        if not project:
            raise ResourceNotFound("Project", project_id)
        
        # Get total goal hours
        goals_stmt = select(func.sum(Goal.weekly_hours)).where(Goal.project_id == project_id)
        goals_result = await self.session.execute(goals_stmt)
        total_goal_hours = goals_result.scalar() or 0.0
        
        # Get goal count
        goal_count_stmt = select(func.count(Goal.id)).where(Goal.project_id == project_id)
        goal_count_result = await self.session.execute(goal_count_stmt)
        goal_count = goal_count_result.scalar() or 0
        
        return {
            "project_id": project_id,
            "project_name": project.name,
            "total_hours": project.weekly_hours,
            "allocated_hours": total_goal_hours,
            "available_hours": project.weekly_hours - total_goal_hours,
            "goal_count": goal_count,
            "utilization_percentage": (total_goal_hours / project.weekly_hours) * 100 if project.weekly_hours > 0 else 0
        }
    
    async def get_goal_allocation_summary(self, goal_id: int) -> dict:
        """
        Get a summary of time allocation for a goal.
        
        Args:
            goal_id: ID of the goal
            
        Returns:
            Dictionary with allocation summary
        """
        # Get goal
        goal_stmt = select(Goal).where(Goal.id == goal_id)
        goal_result = await self.session.execute(goal_stmt)
        goal = goal_result.scalar_one_or_none()
        
        if not goal:
            raise ResourceNotFound("Goal", goal_id)
        
        # Get total task hours
        tasks_stmt = select(func.sum(Task.weekly_hours)).where(Task.goal_id == goal_id)
        tasks_result = await self.session.execute(tasks_stmt)
        total_task_hours = tasks_result.scalar() or 0.0
        
        # Get task count
        task_count_stmt = select(func.count(Task.id)).where(Task.goal_id == goal_id)
        task_count_result = await self.session.execute(task_count_stmt)
        task_count = task_count_result.scalar() or 0
        
        return {
            "goal_id": goal_id,
            "goal_name": goal.name,
            "project_id": goal.project_id,
            "total_hours": goal.weekly_hours,
            "allocated_hours": total_task_hours,
            "available_hours": goal.weekly_hours - total_task_hours,
            "task_count": task_count,
            "utilization_percentage": (total_task_hours / goal.weekly_hours) * 100 if goal.weekly_hours > 0 else 0
        }
    
    async def validate_project_hours_update(
        self, 
        project_id: int, 
        new_project_hours: float
    ) -> None:
        """
        Validate that updating a project's hours won't violate existing goal allocations.
        
        Args:
            project_id: ID of the project
            new_project_hours: New hours for the project
            
        Raises:
            TimeAllocationError: If the new hours would be less than allocated goal hours
        """
        # Get total goal hours
        goals_stmt = select(func.sum(Goal.weekly_hours)).where(Goal.project_id == project_id)
        goals_result = await self.session.execute(goals_stmt)
        total_goal_hours = goals_result.scalar() or 0.0
        
        if new_project_hours < total_goal_hours:
            raise TimeAllocationExceeded(
                f"Cannot reduce project hours to {new_project_hours}. "
                f"Goals already allocated {total_goal_hours} hours. "
                f"Please reduce goal allocations first.",
                current_allocation=total_goal_hours,
                requested_hours=new_project_hours
            )
    
    async def validate_goal_hours_update(
        self, 
        goal_id: int, 
        new_goal_hours: float
    ) -> None:
        """
        Validate that updating a goal's hours won't violate existing task allocations.
        
        Args:
            goal_id: ID of the goal
            new_goal_hours: New hours for the goal
            
        Raises:
            TimeAllocationError: If the new hours would be less than allocated task hours
        """
        # Get total task hours
        tasks_stmt = select(func.sum(Task.weekly_hours)).where(Task.goal_id == goal_id)
        tasks_result = await self.session.execute(tasks_stmt)
        total_task_hours = tasks_result.scalar() or 0.0
        
        if new_goal_hours < total_task_hours:
            raise TimeAllocationExceeded(
                f"Cannot reduce goal hours to {new_goal_hours}. "
                f"Tasks already allocated {total_task_hours} hours. "
                f"Please reduce task allocations first.",
                current_allocation=total_task_hours,
                requested_hours=new_goal_hours
            )