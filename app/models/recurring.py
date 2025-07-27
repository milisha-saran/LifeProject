"""
Recurring items models for Chores and Habits.
"""
from datetime import date, datetime, timedelta
from typing import Optional

from pydantic import field_validator, model_validator
from sqlmodel import Field, SQLModel

from .base import BaseUserOwnedNamedModel
from .enums import TaskStatus, FrequencyType


class RecurringItemBase(BaseUserOwnedNamedModel):
    """Base model for recurring items (chores and habits)."""
    
    start_time: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="Start time for the recurring item (optional)"
    )
    
    end_time: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="End time for the recurring item (optional)"
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
        description="Current status of the recurring item"
    )
    
    frequency_type: FrequencyType = Field(
        nullable=False,
        description="Type of frequency for recurrence"
    )
    
    frequency_value: int = Field(
        default=1,
        gt=0,
        nullable=False,
        description="Frequency value (for custom frequencies - every N days)"
    )
    
    next_due_date: date = Field(
        nullable=False,
        description="Next due date for this recurring item"
    )
    
    last_completed_date: Optional[date] = Field(
        default=None,
        nullable=True,
        description="Date when this item was last completed"
    )
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate that end_time is after start_time."""
        if v is not None and 'start_time' in info.data:
            start_time = info.data['start_time']
            if start_time is not None and v <= start_time:
                raise ValueError('End time must be after start time')
        return v
    
    @field_validator('frequency_value')
    @classmethod
    def validate_frequency_value(cls, v: int, info) -> int:
        """Validate frequency_value based on frequency_type."""
        if 'frequency_type' in info.data:
            frequency_type = info.data['frequency_type']
            if frequency_type != FrequencyType.CUSTOM and v != 1:
                raise ValueError('Frequency value must be 1 for non-custom frequency types')
        return v
    
    def calculate_next_due_date(self, completion_date: Optional[date] = None) -> date:
        """Calculate the next due date based on frequency settings."""
        base_date = completion_date or self.last_completed_date or date.today()
        
        if self.frequency_type == FrequencyType.DAILY:
            return base_date + timedelta(days=1)
        elif self.frequency_type == FrequencyType.WEEKLY:
            return base_date + timedelta(weeks=1)
        elif self.frequency_type == FrequencyType.BIWEEKLY:
            return base_date + timedelta(weeks=2)
        elif self.frequency_type == FrequencyType.MONTHLY:
            # Add one month (approximate with 30 days for simplicity)
            # In a real implementation, you might want to use dateutil.relativedelta
            return base_date + timedelta(days=30)
        elif self.frequency_type == FrequencyType.CUSTOM:
            return base_date + timedelta(days=self.frequency_value)
        else:
            raise ValueError(f"Unknown frequency type: {self.frequency_type}")


class Chore(RecurringItemBase, table=True):
    """Chore model for recurring maintenance tasks."""
    pass


class Habit(RecurringItemBase, table=True):
    """Habit model for recurring positive routines with streak tracking."""
    
    streak_count: int = Field(
        default=0,
        ge=0,
        nullable=False,
        description="Current streak count for this habit"
    )
    
    def update_streak(self, completion_date: date) -> int:
        """Update streak count based on completion date."""
        if self.last_completed_date is None:
            # First completion
            self.streak_count = 1
        else:
            # Check if completion is consecutive based on frequency
            if self.frequency_type == FrequencyType.DAILY:
                # For daily habits, check if completed within 1 day of last completion
                days_since_last = (completion_date - self.last_completed_date).days
                if days_since_last <= 1:
                    self.streak_count += 1
                else:
                    # Streak broken, reset to 1
                    self.streak_count = 1
            else:
                # For non-daily habits, check if completed on or before next due date
                expected_date = self.calculate_next_due_date(self.last_completed_date)
                if completion_date <= expected_date:
                    self.streak_count += 1
                else:
                    # Streak broken, reset to 1
                    self.streak_count = 1
        
        return self.streak_count


# Pydantic models for API requests/responses

class ChoreCreate(SQLModel):
    """Schema for creating a new chore."""
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    eta_hours: Optional[float] = Field(default=None, gt=0)
    status: TaskStatus = TaskStatus.NOT_STARTED
    frequency_type: FrequencyType
    frequency_value: int = Field(default=1, gt=0)
    next_due_date: date
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate that end_time is after start_time."""
        if v is not None and 'start_time' in info.data:
            start_time = info.data['start_time']
            if start_time is not None and v <= start_time:
                raise ValueError('End time must be after start time')
        return v
    
    @field_validator('frequency_value')
    @classmethod
    def validate_frequency_value(cls, v: int, info) -> int:
        """Validate frequency_value based on frequency_type."""
        if 'frequency_type' in info.data:
            frequency_type = info.data['frequency_type']
            if frequency_type != FrequencyType.CUSTOM and v != 1:
                raise ValueError('Frequency value must be 1 for non-custom frequency types')
        return v


class ChoreUpdate(SQLModel):
    """Schema for updating a chore."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    eta_hours: Optional[float] = Field(default=None, gt=0)
    status: Optional[TaskStatus] = None
    frequency_type: Optional[FrequencyType] = None
    frequency_value: Optional[int] = Field(default=None, gt=0)
    next_due_date: Optional[date] = None


class ChoreRead(SQLModel):
    """Schema for reading chore data."""
    id: int
    name: str
    description: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    eta_hours: Optional[float]
    status: TaskStatus
    frequency_type: FrequencyType
    frequency_value: int
    next_due_date: date
    last_completed_date: Optional[date]
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]


class HabitCreate(SQLModel):
    """Schema for creating a new habit."""
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    eta_hours: Optional[float] = Field(default=None, gt=0)
    status: TaskStatus = TaskStatus.NOT_STARTED
    frequency_type: FrequencyType
    frequency_value: int = Field(default=1, gt=0)
    next_due_date: date
    
    @field_validator('end_time')
    @classmethod
    def validate_end_time(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate that end_time is after start_time."""
        if v is not None and 'start_time' in info.data:
            start_time = info.data['start_time']
            if start_time is not None and v <= start_time:
                raise ValueError('End time must be after start time')
        return v
    
    @field_validator('frequency_value')
    @classmethod
    def validate_frequency_value(cls, v: int, info) -> int:
        """Validate frequency_value based on frequency_type."""
        if 'frequency_type' in info.data:
            frequency_type = info.data['frequency_type']
            if frequency_type != FrequencyType.CUSTOM and v != 1:
                raise ValueError('Frequency value must be 1 for non-custom frequency types')
        return v


class HabitUpdate(SQLModel):
    """Schema for updating a habit."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    eta_hours: Optional[float] = Field(default=None, gt=0)
    status: Optional[TaskStatus] = None
    frequency_type: Optional[FrequencyType] = None
    frequency_value: Optional[int] = Field(default=None, gt=0)
    next_due_date: Optional[date] = None


class HabitRead(SQLModel):
    """Schema for reading habit data."""
    id: int
    name: str
    description: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    eta_hours: Optional[float]
    status: TaskStatus
    frequency_type: FrequencyType
    frequency_value: int
    next_due_date: date
    last_completed_date: Optional[date]
    streak_count: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]


class ChoreComplete(SQLModel):
    """Schema for completing a chore."""
    completion_date: Optional[date] = Field(default_factory=date.today)


class HabitComplete(SQLModel):
    """Schema for completing a habit."""
    completion_date: Optional[date] = Field(default_factory=date.today)