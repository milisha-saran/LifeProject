"""
Repository for habit operations.
"""
from datetime import date
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.recurring import Habit, HabitCreate, HabitUpdate


class HabitRepository:
    """Repository for habit CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, habit_data: HabitCreate, user_id: int) -> Habit:
        """Create a new habit."""
        habit = Habit(
            **habit_data.model_dump(),
            user_id=user_id
        )
        self.session.add(habit)
        await self.session.commit()
        await self.session.refresh(habit)
        return habit
    
    async def get_by_id(self, habit_id: int, user_id: int) -> Optional[Habit]:
        """Get a habit by ID for a specific user."""
        statement = select(Habit).where(
            Habit.id == habit_id,
            Habit.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
    
    async def get_all_by_user(self, user_id: int) -> List[Habit]:
        """Get all habits for a user."""
        statement = select(Habit).where(Habit.user_id == user_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
    
    async def get_due_habits(self, user_id: int, due_date: Optional[date] = None) -> List[Habit]:
        """Get habits that are due on or before the specified date."""
        if due_date is None:
            due_date = date.today()
        
        statement = select(Habit).where(
            Habit.user_id == user_id,
            Habit.next_due_date <= due_date
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
    
    async def update(self, habit: Habit, habit_data: HabitUpdate) -> Habit:
        """Update a habit."""
        update_data = habit_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(habit, field, value)
        
        self.session.add(habit)
        await self.session.commit()
        await self.session.refresh(habit)
        return habit
    
    async def delete(self, habit: Habit) -> None:
        """Delete a habit."""
        await self.session.delete(habit)
        await self.session.commit()
    
    async def complete_habit(self, habit: Habit, completion_date: Optional[date] = None) -> Habit:
        """Mark a habit as completed, update streak, and calculate next due date."""
        if completion_date is None:
            completion_date = date.today()
        
        # Update streak count
        habit.update_streak(completion_date)
        
        # Update completion date and calculate next due date
        habit.last_completed_date = completion_date
        habit.next_due_date = habit.calculate_next_due_date(completion_date)
        
        # Reset status to not started for the next occurrence
        from app.models.enums import TaskStatus
        habit.status = TaskStatus.NOT_STARTED
        
        self.session.add(habit)
        await self.session.commit()
        await self.session.refresh(habit)
        return habit