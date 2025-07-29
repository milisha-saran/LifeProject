"""
Enums for the productivity management system.
"""
from enum import Enum


class TaskStatus(str, Enum):
    """Status enum for tasks, goals, and projects."""
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class ProjectStatus(str, Enum):
    """Status enum specifically for projects (alias for TaskStatus for clarity)."""
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class FrequencyType(str, Enum):
    """Frequency types for recurring items (chores and habits)."""
    DAILY = "daily"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"  # Every N days