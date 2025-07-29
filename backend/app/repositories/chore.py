"""
Repository for chore operations.
"""
from datetime import date
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.recurring import Chore, ChoreCreate, ChoreUpdate


class ChoreRepository:
    """Repository for chore CRUD operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, chore_data: ChoreCreate, user_id: int) -> Chore:
        """Create a new chore."""
        chore = Chore(
            **chore_data.model_dump(),
            user_id=user_id
        )
        self.session.add(chore)
        await self.session.commit()
        await self.session.refresh(chore)
        return chore
    
    async def get_by_id(self, chore_id: int, user_id: int) -> Optional[Chore]:
        """Get a chore by ID for a specific user."""
        statement = select(Chore).where(
            Chore.id == chore_id,
            Chore.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()
    
    async def get_all_by_user(self, user_id: int) -> List[Chore]:
        """Get all chores for a user."""
        statement = select(Chore).where(Chore.user_id == user_id)
        result = await self.session.execute(statement)
        return list(result.scalars().all())
    
    async def get_due_chores(self, user_id: int, due_date: Optional[date] = None) -> List[Chore]:
        """Get chores that are due on or before the specified date."""
        if due_date is None:
            due_date = date.today()
        
        statement = select(Chore).where(
            Chore.user_id == user_id,
            Chore.next_due_date <= due_date
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
    
    async def update(self, chore: Chore, chore_data: ChoreUpdate) -> Chore:
        """Update a chore."""
        update_data = chore_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(chore, field, value)
        
        self.session.add(chore)
        await self.session.commit()
        await self.session.refresh(chore)
        return chore
    
    async def delete(self, chore: Chore) -> None:
        """Delete a chore."""
        await self.session.delete(chore)
        await self.session.commit()
    
    async def complete_chore(self, chore: Chore, completion_date: Optional[date] = None) -> Chore:
        """Mark a chore as completed and update next due date."""
        if completion_date is None:
            completion_date = date.today()
        
        # Update completion date and calculate next due date
        chore.last_completed_date = completion_date
        chore.next_due_date = chore.calculate_next_due_date(completion_date)
        
        # Reset status to not started for the next occurrence
        from app.models.enums import TaskStatus
        chore.status = TaskStatus.NOT_STARTED
        
        self.session.add(chore)
        await self.session.commit()
        await self.session.refresh(chore)
        return chore