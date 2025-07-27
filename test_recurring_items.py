#!/usr/bin/env python3
"""
Live test script for recurring items (chores and habits) functionality.

This script validates:
- Creating daily, weekly, and custom frequency chores/habits
- Completing items and verifying next due date calculations
- Habit streak tracking functionality
- Frequency pattern edge cases
- CRUD operations for both chores and habits
"""

import asyncio
import sys
from datetime import date, datetime, timedelta
from typing import Dict, Any

import httpx
from sqlmodel import Session

from app.core.database import get_session
from app.models.enums import FrequencyType, TaskStatus
from app.models.recurring import (
    Chore, ChoreCreate, ChoreComplete,
    Habit, HabitCreate, HabitComplete
)
from app.models.user import User, UserCreate
from app.repositories.chore import ChoreRepository
from app.repositories.habit import HabitRepository


class RecurringItemsTestRunner:
    """Test runner for recurring items functionality."""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_user_id = None
        self.session = None
        self.chore_repo = None
        self.habit_repo = None
        
    async def setup(self):
        """Set up test environment."""
        print("🔧 Setting up test environment...")
        
        # Get database session
        async for session in get_session():
            self.session = session
            break
            
        # Create repositories
        self.chore_repo = ChoreRepository(self.session)
        self.habit_repo = HabitRepository(self.session)
        
        # Create test user
        test_user = User(
            username="test_recurring_user",
            email="test_recurring@example.com",
            hashed_password="hashed_password",
            is_active=True
        )
        self.session.add(test_user)
        self.session.commit()
        self.session.refresh(test_user)
        self.test_user_id = test_user.id
        
        print(f"✅ Test user created with ID: {self.test_user_id}")
    
    async def cleanup(self):
        """Clean up test data."""
        print("🧹 Cleaning up test data...")
        
        if self.session and self.test_user_id:
            # Delete test user and related data (cascade should handle the rest)
            test_user = self.session.get(User, self.test_user_id)
            if test_user:
                self.session.delete(test_user)
                self.session.commit()
        
        print("✅ Cleanup completed")
    
    def test_chore_creation(self):
        """Test creating chores with different frequencies."""
        print("\n📝 Testing chore creation...")
        
        test_cases = [
            {
                "name": "Daily Dishes",
                "description": "Wash the dishes every day",
                "frequency_type": FrequencyType.DAILY,
                "frequency_value": 1,
                "next_due_date": date.today()
            },
            {
                "name": "Weekly Laundry",
                "description": "Do laundry every week",
                "frequency_type": FrequencyType.WEEKLY,
                "frequency_value": 1,
                "next_due_date": date.today()
            },
            {
                "name": "Custom Task",
                "description": "Every 3 days task",
                "frequency_type": FrequencyType.CUSTOM,
                "frequency_value": 3,
                "next_due_date": date.today()
            }
        ]
        
        created_chores = []
        for case in test_cases:
            chore_data = ChoreCreate(**case)
            chore = self.chore_repo.create(chore_data, self.test_user_id)
            created_chores.append(chore)
            print(f"  ✅ Created {case['frequency_type'].value} chore: {chore.name}")
        
        return created_chores
    
    def test_habit_creation(self):
        """Test creating habits with different frequencies."""
        print("\n📝 Testing habit creation...")
        
        test_cases = [
            {
                "name": "Daily Exercise",
                "description": "Exercise every day",
                "frequency_type": FrequencyType.DAILY,
                "frequency_value": 1,
                "next_due_date": date.today()
            },
            {
                "name": "Weekly Reading",
                "description": "Read a book chapter weekly",
                "frequency_type": FrequencyType.WEEKLY,
                "frequency_value": 1,
                "next_due_date": date.today()
            },
            {
                "name": "Biweekly Meditation",
                "description": "Meditate every two weeks",
                "frequency_type": FrequencyType.BIWEEKLY,
                "frequency_value": 1,
                "next_due_date": date.today()
            }
        ]
        
        created_habits = []
        for case in test_cases:
            habit_data = HabitCreate(**case)
            habit = self.habit_repo.create(habit_data, self.test_user_id)
            created_habits.append(habit)
            print(f"  ✅ Created {case['frequency_type'].value} habit: {habit.name}")
        
        return created_habits
    
    def test_chore_completion_and_due_dates(self, chores):
        """Test chore completion and next due date calculations."""
        print("\n✅ Testing chore completion and due date calculations...")
        
        for chore in chores:
            original_due_date = chore.next_due_date
            completion_date = date.today()
            
            # Complete the chore
            completed_chore = self.chore_repo.complete_chore(chore, completion_date)
            
            # Verify completion
            assert completed_chore.last_completed_date == completion_date
            assert completed_chore.status == TaskStatus.NOT_STARTED  # Reset for next occurrence
            
            # Verify next due date calculation
            expected_next_due = chore.calculate_next_due_date(completion_date)
            assert completed_chore.next_due_date == expected_next_due
            
            print(f"  ✅ {chore.name}: {original_due_date} → {completed_chore.next_due_date}")
    
    def test_habit_completion_and_streaks(self, habits):
        """Test habit completion and streak tracking."""
        print("\n🔥 Testing habit completion and streak tracking...")
        
        for habit in habits:
            original_streak = habit.streak_count
            completion_date = date.today()
            
            # Complete the habit
            completed_habit = self.habit_repo.complete_habit(habit, completion_date)
            
            # Verify completion and streak update
            assert completed_habit.last_completed_date == completion_date
            assert completed_habit.status == TaskStatus.NOT_STARTED  # Reset for next occurrence
            assert completed_habit.streak_count == original_streak + 1
            
            print(f"  ✅ {habit.name}: streak {original_streak} → {completed_habit.streak_count}")
            
            # Test consecutive completion
            next_completion = completion_date + timedelta(days=1)
            completed_again = self.habit_repo.complete_habit(completed_habit, next_completion)
            
            if habit.frequency_type == FrequencyType.DAILY:
                # Should increment streak for daily habits
                expected_streak = completed_habit.streak_count + 1
            else:
                # Should reset streak for non-daily habits completed too early
                expected_streak = 1
            
            assert completed_again.streak_count == expected_streak
            print(f"  ✅ {habit.name}: consecutive completion streak = {completed_again.streak_count}")
    
    def test_frequency_edge_cases(self):
        """Test frequency pattern edge cases."""
        print("\n🧪 Testing frequency pattern edge cases...")
        
        # Test custom frequency with large values
        custom_chore_data = ChoreCreate(
            name="Monthly Deep Clean",
            description="Deep clean every 30 days",
            frequency_type=FrequencyType.CUSTOM,
            frequency_value=30,
            next_due_date=date.today()
        )
        custom_chore = self.chore_repo.create(custom_chore_data, self.test_user_id)
        
        # Complete and verify 30-day increment
        completion_date = date.today()
        completed_custom = self.chore_repo.complete_chore(custom_chore, completion_date)
        expected_next = completion_date + timedelta(days=30)
        assert completed_custom.next_due_date == expected_next
        print(f"  ✅ Custom 30-day frequency: {completion_date} → {expected_next}")
        
        # Test monthly frequency (approximate)
        monthly_habit_data = HabitCreate(
            name="Monthly Review",
            description="Monthly habit review",
            frequency_type=FrequencyType.MONTHLY,
            frequency_value=1,
            next_due_date=date.today()
        )
        monthly_habit = self.habit_repo.create(monthly_habit_data, self.test_user_id)
        
        completed_monthly = self.habit_repo.complete_habit(monthly_habit, completion_date)
        expected_monthly_next = completion_date + timedelta(days=30)  # Approximate month
        assert completed_monthly.next_due_date == expected_monthly_next
        print(f"  ✅ Monthly frequency: {completion_date} → {expected_monthly_next}")
    
    def test_crud_operations(self):
        """Test CRUD operations for chores and habits."""
        print("\n🔄 Testing CRUD operations...")
        
        # Test chore CRUD
        chore_data = ChoreCreate(
            name="Test CRUD Chore",
            description="Testing CRUD operations",
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=date.today()
        )
        
        # Create
        chore = self.chore_repo.create(chore_data, self.test_user_id)
        assert chore.name == "Test CRUD Chore"
        print("  ✅ Chore CREATE operation")
        
        # Read
        retrieved_chore = self.chore_repo.get_by_id(chore.id, self.test_user_id)
        assert retrieved_chore is not None
        assert retrieved_chore.name == chore.name
        print("  ✅ Chore READ operation")
        
        # Update
        from app.models.recurring import ChoreUpdate
        update_data = ChoreUpdate(name="Updated CRUD Chore")
        updated_chore = self.chore_repo.update(chore, update_data)
        assert updated_chore.name == "Updated CRUD Chore"
        print("  ✅ Chore UPDATE operation")
        
        # Delete
        self.chore_repo.delete(updated_chore)
        deleted_chore = self.chore_repo.get_by_id(chore.id, self.test_user_id)
        assert deleted_chore is None
        print("  ✅ Chore DELETE operation")
        
        # Test habit CRUD
        habit_data = HabitCreate(
            name="Test CRUD Habit",
            description="Testing CRUD operations",
            frequency_type=FrequencyType.WEEKLY,
            frequency_value=1,
            next_due_date=date.today()
        )
        
        # Create
        habit = self.habit_repo.create(habit_data, self.test_user_id)
        assert habit.name == "Test CRUD Habit"
        assert habit.streak_count == 0
        print("  ✅ Habit CREATE operation")
        
        # Read
        retrieved_habit = self.habit_repo.get_by_id(habit.id, self.test_user_id)
        assert retrieved_habit is not None
        assert retrieved_habit.name == habit.name
        print("  ✅ Habit READ operation")
        
        # Update
        from app.models.recurring import HabitUpdate
        update_data = HabitUpdate(name="Updated CRUD Habit")
        updated_habit = self.habit_repo.update(habit, update_data)
        assert updated_habit.name == "Updated CRUD Habit"
        print("  ✅ Habit UPDATE operation")
        
        # Delete
        self.habit_repo.delete(updated_habit)
        deleted_habit = self.habit_repo.get_by_id(habit.id, self.test_user_id)
        assert deleted_habit is None
        print("  ✅ Habit DELETE operation")
    
    def test_due_items_queries(self):
        """Test querying for due items."""
        print("\n📅 Testing due items queries...")
        
        # Create items with different due dates
        today = date.today()
        yesterday = today - timedelta(days=1)
        tomorrow = today + timedelta(days=1)
        
        # Overdue chore
        overdue_chore_data = ChoreCreate(
            name="Overdue Chore",
            description="This chore is overdue",
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=yesterday
        )
        overdue_chore = self.chore_repo.create(overdue_chore_data, self.test_user_id)
        
        # Due today chore
        due_today_chore_data = ChoreCreate(
            name="Due Today Chore",
            description="This chore is due today",
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=today
        )
        due_today_chore = self.chore_repo.create(due_today_chore_data, self.test_user_id)
        
        # Future chore
        future_chore_data = ChoreCreate(
            name="Future Chore",
            description="This chore is due tomorrow",
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=tomorrow
        )
        future_chore = self.chore_repo.create(future_chore_data, self.test_user_id)
        
        # Test due chores query
        due_chores = self.chore_repo.get_due_chores(self.test_user_id, today)
        due_chore_names = [chore.name for chore in due_chores]
        
        assert "Overdue Chore" in due_chore_names
        assert "Due Today Chore" in due_chore_names
        assert "Future Chore" not in due_chore_names
        
        print(f"  ✅ Found {len(due_chores)} chores due today or earlier")
        
        # Similar test for habits
        overdue_habit_data = HabitCreate(
            name="Overdue Habit",
            description="This habit is overdue",
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=yesterday
        )
        overdue_habit = self.habit_repo.create(overdue_habit_data, self.test_user_id)
        
        due_habits = self.habit_repo.get_due_habits(self.test_user_id, today)
        assert len(due_habits) >= 1
        assert any(habit.name == "Overdue Habit" for habit in due_habits)
        
        print(f"  ✅ Found {len(due_habits)} habits due today or earlier")
    
    async def run_all_tests(self):
        """Run all tests."""
        print("🚀 Starting recurring items functionality tests...\n")
        
        try:
            await self.setup()
            
            # Test creation
            chores = self.test_chore_creation()
            habits = self.test_habit_creation()
            
            # Test completion and calculations
            self.test_chore_completion_and_due_dates(chores)
            self.test_habit_completion_and_streaks(habits)
            
            # Test edge cases
            self.test_frequency_edge_cases()
            
            # Test CRUD operations
            self.test_crud_operations()
            
            # Test due items queries
            self.test_due_items_queries()
            
            print("\n🎉 All tests passed successfully!")
            return True
            
        except Exception as e:
            print(f"\n❌ Test failed with error: {e}")
            import traceback
            traceback.print_exc()
            return False
            
        finally:
            await self.cleanup()


async def main():
    """Main test runner."""
    runner = RecurringItemsTestRunner()
    success = await runner.run_all_tests()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())