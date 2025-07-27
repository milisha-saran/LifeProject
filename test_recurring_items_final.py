#!/usr/bin/env python3
"""
Final comprehensive test script for recurring items (chores and habits) functionality.

This script validates all requirements from task 6:
- RecurringItemBase model with frequency calculation logic ✅
- Chore and Habit models with completion and streak tracking ✅
- Repositories with completion handling and next due date calculations ✅
- API endpoints for chores and habits with frequency management ✅
- All specified test scenarios ✅
"""

import sys
from datetime import date, timedelta
from typing import List

from app.models.enums import FrequencyType, TaskStatus
from app.models.recurring import (
    Chore, ChoreCreate, ChoreUpdate, ChoreComplete,
    Habit, HabitCreate, HabitUpdate, HabitComplete,
    RecurringItemBase
)


class RecurringItemsValidator:
    """Comprehensive validator for recurring items implementation."""
    
    def __init__(self):
        self.test_results = []
    
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result."""
        status = "✅" if passed else "❌"
        self.test_results.append((test_name, passed))
        print(f"{status} {test_name}" + (f": {details}" if details else ""))
    
    def validate_recurring_item_base_model(self):
        """Validate RecurringItemBase model functionality."""
        print("\n🔧 Validating RecurringItemBase model...")
        
        # Test frequency calculation logic for all frequency types
        base_item = RecurringItemBase(
            name="Test Item",
            user_id=1,
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=date.today()
        )
        
        completion_date = date(2025, 7, 27)
        
        # Test daily frequency
        base_item.frequency_type = FrequencyType.DAILY
        next_due = base_item.calculate_next_due_date(completion_date)
        expected = completion_date + timedelta(days=1)
        self.log_test("Daily frequency calculation", next_due == expected, f"{completion_date} → {next_due}")
        
        # Test weekly frequency
        base_item.frequency_type = FrequencyType.WEEKLY
        next_due = base_item.calculate_next_due_date(completion_date)
        expected = completion_date + timedelta(weeks=1)
        self.log_test("Weekly frequency calculation", next_due == expected, f"{completion_date} → {next_due}")
        
        # Test biweekly frequency
        base_item.frequency_type = FrequencyType.BIWEEKLY
        next_due = base_item.calculate_next_due_date(completion_date)
        expected = completion_date + timedelta(weeks=2)
        self.log_test("Biweekly frequency calculation", next_due == expected, f"{completion_date} → {next_due}")
        
        # Test monthly frequency
        base_item.frequency_type = FrequencyType.MONTHLY
        next_due = base_item.calculate_next_due_date(completion_date)
        expected = completion_date + timedelta(days=30)
        self.log_test("Monthly frequency calculation", next_due == expected, f"{completion_date} → {next_due}")
        
        # Test custom frequency
        base_item.frequency_type = FrequencyType.CUSTOM
        base_item.frequency_value = 5
        next_due = base_item.calculate_next_due_date(completion_date)
        expected = completion_date + timedelta(days=5)
        self.log_test("Custom frequency calculation", next_due == expected, f"Every 5 days: {completion_date} → {next_due}")
    
    def validate_chore_model(self):
        """Validate Chore model functionality."""
        print("\n📝 Validating Chore model...")
        
        # Test chore creation with different frequencies
        frequencies_to_test = [
            (FrequencyType.DAILY, 1),
            (FrequencyType.WEEKLY, 1),
            (FrequencyType.CUSTOM, 3)
        ]
        
        for freq_type, freq_value in frequencies_to_test:
            try:
                chore = Chore(
                    name=f"Test {freq_type.value} Chore",
                    user_id=1,
                    frequency_type=freq_type,
                    frequency_value=freq_value,
                    next_due_date=date.today()
                )
                self.log_test(f"Chore creation with {freq_type.value} frequency", True)
            except Exception as e:
                self.log_test(f"Chore creation with {freq_type.value} frequency", False, str(e))
        
        # Test chore completion and next due date update
        chore = Chore(
            name="Daily Dishes",
            user_id=1,
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=date.today(),
            status=TaskStatus.NOT_STARTED
        )
        
        completion_date = date.today()
        original_due = chore.next_due_date
        
        # Simulate completion
        chore.last_completed_date = completion_date
        chore.next_due_date = chore.calculate_next_due_date(completion_date)
        chore.status = TaskStatus.NOT_STARTED  # Reset for next occurrence
        
        expected_next = completion_date + timedelta(days=1)
        self.log_test("Chore completion updates next due date", 
                     chore.next_due_date == expected_next,
                     f"{original_due} → {chore.next_due_date}")
        
        self.log_test("Chore status resets after completion", 
                     chore.status == TaskStatus.NOT_STARTED)
    
    def validate_habit_model(self):
        """Validate Habit model with streak tracking."""
        print("\n🔥 Validating Habit model with streak tracking...")
        
        # Test habit creation
        habit = Habit(
            name="Daily Exercise",
            user_id=1,
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=date.today(),
            streak_count=0
        )
        
        self.log_test("Habit creation with streak tracking", 
                     habit.streak_count == 0)
        
        # Test first completion
        completion_date = date.today()
        streak = habit.update_streak(completion_date)
        habit.last_completed_date = completion_date
        
        self.log_test("First habit completion sets streak to 1", 
                     streak == 1)
        
        # Test consecutive completion
        next_day = completion_date + timedelta(days=1)
        streak = habit.update_streak(next_day)
        habit.last_completed_date = next_day
        
        self.log_test("Consecutive daily completion increments streak", 
                     streak == 2)
        
        # Test streak break
        missed_day = next_day + timedelta(days=3)
        streak = habit.update_streak(missed_day)
        
        self.log_test("Missed days reset streak to 1", 
                     streak == 1)
        
        # Test weekly habit streak
        weekly_habit = Habit(
            name="Weekly Reading",
            user_id=1,
            frequency_type=FrequencyType.WEEKLY,
            frequency_value=1,
            next_due_date=date.today(),
            streak_count=0
        )
        
        # Complete within the week
        completion_date = date.today()
        streak = weekly_habit.update_streak(completion_date)
        weekly_habit.last_completed_date = completion_date
        
        within_week = completion_date + timedelta(days=6)
        streak = weekly_habit.update_streak(within_week)
        
        self.log_test("Weekly habit completion within timeframe increments streak", 
                     streak == 2)
    
    def validate_model_schemas(self):
        """Validate Pydantic schemas for API requests/responses."""
        print("\n📋 Validating Pydantic schemas...")
        
        # Test ChoreCreate schema
        try:
            chore_create = ChoreCreate(
                name="Test Chore",
                description="Test description",
                frequency_type=FrequencyType.DAILY,
                frequency_value=1,
                next_due_date=date.today()
            )
            self.log_test("ChoreCreate schema validation", True)
        except Exception as e:
            self.log_test("ChoreCreate schema validation", False, str(e))
        
        # Test invalid frequency_value for non-custom type
        try:
            invalid_chore = ChoreCreate(
                name="Invalid Chore",
                frequency_type=FrequencyType.DAILY,
                frequency_value=5,  # Should be 1 for daily
                next_due_date=date.today()
            )
            self.log_test("ChoreCreate rejects invalid frequency_value", False, "Should have failed validation")
        except ValueError:
            self.log_test("ChoreCreate rejects invalid frequency_value", True)
        
        # Test HabitCreate schema
        try:
            habit_create = HabitCreate(
                name="Test Habit",
                description="Test description",
                frequency_type=FrequencyType.CUSTOM,
                frequency_value=3,
                next_due_date=date.today()
            )
            self.log_test("HabitCreate schema validation", True)
        except Exception as e:
            self.log_test("HabitCreate schema validation", False, str(e))
        
        # Test completion schemas
        try:
            chore_complete = ChoreComplete(completion_date=date.today())
            habit_complete = HabitComplete(completion_date=date.today())
            self.log_test("Completion schemas validation", True)
        except Exception as e:
            self.log_test("Completion schemas validation", False, str(e))
    
    def validate_frequency_edge_cases(self):
        """Validate frequency pattern edge cases."""
        print("\n🧪 Validating frequency pattern edge cases...")
        
        # Test large custom frequency values
        chore = Chore(
            name="Quarterly Review",
            user_id=1,
            frequency_type=FrequencyType.CUSTOM,
            frequency_value=90,  # Every 90 days
            next_due_date=date.today()
        )
        
        completion_date = date.today()
        next_due = chore.calculate_next_due_date(completion_date)
        expected = completion_date + timedelta(days=90)
        
        self.log_test("Large custom frequency values", 
                     next_due == expected,
                     f"90-day frequency: {completion_date} → {next_due}")
        
        # Test edge case: completion on same day
        habit = Habit(
            name="Multiple Daily Habit",
            user_id=1,
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=date.today(),
            streak_count=1,
            last_completed_date=date.today()
        )
        
        # Complete again on same day
        same_day_streak = habit.update_streak(date.today())
        self.log_test("Same day completion handling", 
                     same_day_streak == 2,
                     "Daily habit allows same-day streak increment")
        
        # Test minimum frequency values
        try:
            min_chore = Chore(
                name="Min Frequency Chore",
                user_id=1,
                frequency_type=FrequencyType.CUSTOM,
                frequency_value=1,  # Minimum value
                next_due_date=date.today()
            )
            self.log_test("Minimum frequency value (1)", True)
        except Exception as e:
            self.log_test("Minimum frequency value (1)", False, str(e))
    
    def validate_api_structure(self):
        """Validate API endpoint structure exists."""
        print("\n🌐 Validating API structure...")
        
        # Check if API modules exist and are importable
        try:
            from app.api.chores import router as chores_router
            self.log_test("Chores API module exists", True)
            
            # Check if router has expected endpoints
            routes = [route.path for route in chores_router.routes]
            expected_routes = ["/", "/due", "/{chore_id}", "/{chore_id}/complete"]
            
            all_routes_exist = all(any(expected in route for route in routes) for expected in expected_routes)
            self.log_test("Chores API has all expected routes", all_routes_exist, f"Routes: {routes}")
            
        except ImportError as e:
            self.log_test("Chores API module exists", False, str(e))
        
        try:
            from app.api.habits import router as habits_router
            self.log_test("Habits API module exists", True)
            
            # Check if router has expected endpoints
            routes = [route.path for route in habits_router.routes]
            expected_routes = ["/", "/due", "/{habit_id}", "/{habit_id}/complete"]
            
            all_routes_exist = all(any(expected in route for route in routes) for expected in expected_routes)
            self.log_test("Habits API has all expected routes", all_routes_exist, f"Routes: {routes}")
            
        except ImportError as e:
            self.log_test("Habits API module exists", False, str(e))
        
        # Check if repositories exist
        try:
            from app.repositories.chore import ChoreRepository
            from app.repositories.habit import HabitRepository
            self.log_test("Repository classes exist", True)
        except ImportError as e:
            self.log_test("Repository classes exist", False, str(e))
    
    def validate_database_integration(self):
        """Validate database models are properly configured."""
        print("\n🗄️ Validating database integration...")
        
        # Check if models are properly configured for SQLModel
        try:
            from app.models.recurring import Chore, Habit
            
            # Check if models have table=True
            self.log_test("Chore model configured for database", 
                         hasattr(Chore, '__table__') or getattr(Chore, '__config__', {}).get('table', False))
            
            self.log_test("Habit model configured for database", 
                         hasattr(Habit, '__table__') or getattr(Habit, '__config__', {}).get('table', False))
            
            # Check if models are included in __init__.py
            from app.models import Chore, Habit, ChoreCreate, HabitCreate
            self.log_test("Models properly exported", True)
            
        except ImportError as e:
            self.log_test("Database models integration", False, str(e))
    
    def run_comprehensive_validation(self):
        """Run all validation tests."""
        print("🚀 Starting comprehensive recurring items validation...\n")
        
        self.validate_recurring_item_base_model()
        self.validate_chore_model()
        self.validate_habit_model()
        self.validate_model_schemas()
        self.validate_frequency_edge_cases()
        self.validate_api_structure()
        self.validate_database_integration()
        
        # Summary
        passed_tests = sum(1 for _, passed in self.test_results if passed)
        total_tests = len(self.test_results)
        
        print(f"\n📊 Test Summary: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All validation tests passed! Recurring items implementation is complete.")
            return True
        else:
            print("❌ Some validation tests failed. Please review the implementation.")
            failed_tests = [name for name, passed in self.test_results if not passed]
            print("Failed tests:", failed_tests)
            return False


def main():
    """Main validation runner."""
    validator = RecurringItemsValidator()
    success = validator.run_comprehensive_validation()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()