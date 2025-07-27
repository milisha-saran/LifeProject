"""
Project, Goal, and Task models for hierarchical project management.
"""
from datetime import date, datetime
from typing import List, Optional

from pydantic import field_validator, model_validator
from sqlmodel import Field, Relationship, SQLModel

from .base import BaseUserOwnedNamedModel
from .enums import TaskStatus


class Project(BaseUserOwnedNamedModel, table=True):
    """Project model for organizing work into meaningful categories."""
    
    weekly_hours: float = Field(
        gt=0,
        le=168,  # Maximum hours in a week
        nullable=False,
        description="Weekly hours allocated to this project"
    )
    
    start_date: date = Field(
        nullable=False,
        description="Project start date"
    )
    
    end_date: Optional[date] = Field(
        default=None,
        nullable=True,
        description="Project end date (optional)"
    )
    
    status: TaskStatus = Field(
        default=TaskStatus.NOT_STARTED,
        nullable=False,
        description="Current project status"
    )
    
    color: str = Field(
        regex=r'^#[0-9A-Fa-f]{6}$',
        nullable=False,
        description="Hex color code for project visualization"
    )
    
    # Relationships
    goals: List["Goal"] = Relationship(back_populates="project", cascade_delete=True)
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[date], info) -> Optional[date]:
        """Validate that end_date is after start_date."""
        if v is not None and 'start_date' in info.data:
            start_date = info.data['start_date']
            if v <= start_date:
                raise ValueError('End date must be after start date')
        return v


class Goal(BaseUserOwnedNamedModel, table=True):
    """Goal model for breaking down projects into manageable objectives."""
    
    weekly_hours: float = Field(
        gt=0,
        le=168,  # Maximum hours in a week
        nullable=False,
        description="Weekly hours allocated to this goal"
    )
    
    start_date: date = Field(
        nullable=False,
        description="Goal start date"
    )
    
    end_date: Optional[date] = Field(
        default=None,
        nullable=True,
        description="Goal end date (optional)"
    )
    
    status: TaskStatus = Field(
        default=TaskStatus.NOT_STARTED,
        nullable=False,
        description="Current goal status"
    )
    
    project_id: int = Field(
        foreign_key="project.id",
        nullable=False,
        index=True,
        description="ID of the parent project"
    )
    
    # Relationships
    project: Project = Relationship(back_populates="goals")
    tasks: List["Task"] = Relationship(back_populates="goal", cascade_delete=True)
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[date], info) -> Optional[date]:
        """Validate that end_date is after start_date."""
        if v is not None and 'start_date' in info.data:
            start_date = info.data['start_date']
            if v <= start_date:
                raise ValueError('End date must be after start date')
        return v


class Task(BaseUserOwnedNamedModel, table=True):
    """Task model for breaking down goals into actionable items."""
    
    weekly_hours: float = Field(
        gt=0,
        le=168,  # Maximum hours in a week
        nullable=False,
        description="Weekly hours allocated to this task"
    )
    
    start_time: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="Task start time (optional)"
    )
    
    end_time: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="Task end time (optional)"
    )
    
    eta_hours: Optional[float] = Field(
        default=None,
        gt=0,
        nullable=True,
        description="Estimated time to complete in hours (optional)"
    )
    
    status: TaskStatus = Field(
        default=TaskStatus.NOT_STARTED,
        nullable=False,
        description="Current task status"
    )
    
    goal_id: int = Field(
        foreign_key="goal.id",
        nullable=False,
        index=True,
        description="ID of the parent goal"
    )
    
    # Relationships
    goal: Goal = Relationship(back_populates="tasks")
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate that end_time is after start_time."""
        if v is not None and 'start_time' in info.data:
            start_time = info.data['start_time']
            if start_time is not None and v <= start_time:
                raise ValueError('End time must be after start time')
        return v


# Pydantic models for API requests/responses

class ProjectCreate(SQLModel):
    """Schema for creating a new project."""
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    weekly_hours: float = Field(gt=0, le=168)
    start_date: date
    end_date: Optional[date] = None
    status: TaskStatus = TaskStatus.NOT_STARTED
    color: str = Field(regex=r'^#[0-9A-Fa-f]{6}$')
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[date], info) -> Optional[date]:
        """Validate that end_date is after start_date."""
        if v is not None and 'start_date' in info.data:
            start_date = info.data['start_date']
            if v <= start_date:
                raise ValueError('End date must be after start date')
        return v


class ProjectUpdate(SQLModel):
    """Schema for updating a project."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    weekly_hours: Optional[float] = Field(default=None, gt=0, le=168)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[TaskStatus] = None
    color: Optional[str] = Field(default=None, regex=r'^#[0-9A-Fa-f]{6}$')


class ProjectRead(SQLModel):
    """Schema for reading project data."""
    id: int
    name: str
    description: Optional[str]
    weekly_hours: float
    start_date: date
    end_date: Optional[date]
    status: TaskStatus
    color: str
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]


class GoalCreate(SQLModel):
    """Schema for creating a new goal."""
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    weekly_hours: float = Field(gt=0, le=168)
    start_date: date
    end_date: Optional[date] = None
    status: TaskStatus = TaskStatus.NOT_STARTED
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, v: Optional[date], info) -> Optional[date]:
        """Validate that end_date is after start_date."""
        if v is not None and 'start_date' in info.data:
            start_date = info.data['start_date']
            if v <= start_date:
                raise ValueError('End date must be after start date')
        return v


class GoalUpdate(SQLModel):
    """Schema for updating a goal."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    weekly_hours: Optional[float] = Field(default=None, gt=0, le=168)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[TaskStatus] = None


class GoalRead(SQLModel):
    """Schema for reading goal data."""
    id: int
    name: str
    description: Optional[str]
    weekly_hours: float
    start_date: date
    end_date: Optional[date]
    status: TaskStatus
    project_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]


class TaskCreate(SQLModel):
    """Schema for creating a new task."""
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    weekly_hours: float = Field(gt=0, le=168)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    eta_hours: Optional[float] = Field(default=None, gt=0)
    status: TaskStatus = TaskStatus.NOT_STARTED
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate that end_time is after start_time."""
        if v is not None and 'start_time' in info.data:
            start_time = info.data['start_time']
            if start_time is not None and v <= start_time:
                raise ValueError('End time must be after start time')
        return v


class TaskUpdate(SQLModel):
    """Schema for updating a task."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    weekly_hours: Optional[float] = Field(default=None, gt=0, le=168)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    eta_hours: Optional[float] = Field(default=None, gt=0)
    status: Optional[TaskStatus] = None


class TaskRead(SQLModel):
    """Schema for reading task data."""
    id: int
    name: str
    description: Optional[str]
    weekly_hours: float
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    eta_hours: Optional[float]
    status: TaskStatus
    goal_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]