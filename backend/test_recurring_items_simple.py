#!/usr/bin/env python3
"""
Simple test script for recurring items (chores and habits) functionality.
"""

import sys
from datetime import date, datetime, timedelta

from app.models.enums import FrequencyType, TaskStatus
from app.models.recurring import (
    Chore, ChoreCreate, ChoreComplete,
    Habit, HabitCreate, HabitComplete
)


def test_frequency_calculations():
    """Test frequency calculation logic."""
    print("🧪 Testing frequency calculations...")
    
    # Test daily frequency
    chore = Chore(
        name="Daily Task",
        user_id=1,
        frequency_type=FrequencyType.DAILY,
        frequency_value=1,
        next_due_date=date.today()
    )
    
    completion_date = date.today()
    next_due = chore.calculate_next_due_date(completion_date)
    expected = completion_date + timedelta(days=1)
    assert next_due == expected, f"Daily: expected {expected}, got {next_due}"
    print("  ✅ Daily frequency calculation")
    
    # Test weekly frequency
    chore.frequency_type = FrequencyType.WEEKLY
    next_due = chore.calculate_next_due_date(completion_date)
    expected = completion_date + timedelta(weeks=1)
    assert next_due == expected, f"Weekly: expected {expected}, got {next_due}"
    print("  ✅ Weekly frequency calculation")
    
    # Test custom frequency
    chore.frequency_type = FrequencyType.CUSTOM
    chore.frequency_value = 5
    next_due = chore.calculate_next_due_date(completion_date)
    expected = completion_date + timedelta(days=5)
    assert next_due == expected, f"Custom: expected {expected}, got {next_due}"
    print("  ✅ Custom frequency calculation")
    
    # Test monthly frequency
    chore.frequency_type = FrequencyType.MONTHLY
    chore.frequency_value = 1
    next_due = chore.calculate_next_due_date(completion_date)
    expected = completion_date + timedelta(days=30)
    assert next_due == expected, f"Monthly: expected {expected}, got {next_due}"
    print("  ✅ Monthly frequency calculation")


def test_habit_streak_logic():
    """Test habit streak tracking logic."""
    print("\n🔥 Testing habit streak logic...")
    
    # Test daily habit streak
    habit = Habit(
        name="Daily Habit",
        user_id=1,
        frequency_type=FrequencyType.DAILY,
        frequency_value=1,
        next_due_date=date.today(),
        streak_count=0
    )
    
    # First completion
    completion_date = date.today()
    streak = habit.update_streak(completion_date)
    assert streak == 1, f"First completion: expected 1, got {streak}"
    habit.last_completed_date = completion_date
    print("  ✅ First completion streak = 1")
    
    # Consecutive completion (next day)
    next_completion = completion_date + timedelta(days=1)
    streak = habit.update_streak(next_completion)
    assert streak == 2, f"Consecutive completion: expected 2, got {streak}"
    habit.last_completed_date = next_completion
    print("  ✅ Consecutive daily completion streak = 2")
    
    # Missed day (streak should reset)
    missed_completion = next_completion + timedelta(days=3)
    streak = habit.update_streak(missed_completion)
    assert streak == 1, f"Missed day: expected 1, got {streak}"
    print("  ✅ Missed day resets streak to 1")
    
    # Test weekly habit streak
    weekly_habit = Habit(
        name="Weekly Habit",
        user_id=1,
        frequency_type=FrequencyType.WEEKLY,
        frequency_value=1,
        next_due_date=date.today(),
        streak_count=0
    )
    
    # First completion
    completion_date = date.today()
    streak = weekly_habit.update_streak(completion_date)
    assert streak == 1, f"Weekly first completion: expected 1, got {streak}"
    weekly_habit.last_completed_date = completion_date
    print("  ✅ Weekly habit first completion streak = 1")
    
    # Complete within the week (should increment)
    within_week = completion_date + timedelta(days=6)
    streak = weekly_habit.update_streak(within_week)
    assert streak == 2, f"Within week completion: expected 2, got {streak}"
    print("  ✅ Weekly habit within-week completion streak = 2")


def test_model_validation():
    """Test model validation logic."""
    print("\n✅ Testing model validation...")
    
    # Test valid chore creation
    try:
        chore_data = ChoreCreate(
            name="Test Chore",
            description="Test description",
            frequency_type=FrequencyType.DAILY,
            frequency_value=1,
            next_due_date=date.today()
        )
        print("  ✅ Valid chore creation")
    except Exception as e:
        print(f"  ❌ Chore validation failed: {e}")
        return False
    
    # Test invalid frequency value for non-custom type
    try:
        invalid_chore_data = ChoreCreate(
            name="Invalid Chore",
            frequency_type=FrequencyType.DAILY,
            frequency_value=5,  # Should be 1 for daily
            next_due_date=date.today()
        )
        print("  ❌ Should have failed validation for invalid frequency_value")
        return False
    except ValueError:
        print("  ✅ Correctly rejected invalid frequency_value for daily type")
    
    # Test valid habit creation
    try:
        habit_data = HabitCreate(
            name="Test Habit",
            description="Test description",
            frequency_type=FrequencyType.CUSTOM,
            frequency_value=3,
            next_due_date=date.today()
        )
        print("  ✅ Valid habit creation with custom frequency")
    except Exception as e:
        print(f"  ❌ Habit validation failed: {e}")
        return False
    
    return True


def test_edge_cases():
    """Test edge cases and boundary conditions."""
    print("\n🧪 Testing edge cases...")
    
    # Test completion on same day
    habit = Habit(
        name="Same Day Habit",
        user_id=1,
        frequency_type=FrequencyType.DAILY,
        frequency_value=1,
        next_due_date=date.today(),
        streak_count=1,
        last_completed_date=date.today()
    )
    
    # Complete again on same day (should still increment for daily)
    same_day_streak = habit.update_streak(date.today())
    assert same_day_streak == 2, f"Same day completion: expected 2, got {same_day_streak}"
    print("  ✅ Same day completion handled correctly")
    
    # Test large custom frequency
    chore = Chore(
        name="Large Frequency Chore",
        user_id=1,
        frequency_type=FrequencyType.CUSTOM,
        frequency_value=100,
        next_due_date=date.today()
    )
    
    completion_date = date.today()
    next_due = chore.calculate_next_due_date(completion_date)
    expected = completion_date + timedelta(days=100)
    assert next_due == expected, f"Large frequency: expected {expected}, got {next_due}"
    print("  ✅ Large custom frequency handled correctly")
    
    # Test biweekly frequency
    chore.frequency_type = FrequencyType.BIWEEKLY
    chore.frequency_value = 1
    next_due = chore.calculate_next_due_date(completion_date)
    expected = completion_date + timedelta(weeks=2)
    assert next_due == expected, f"Biweekly: expected {expected}, got {next_due}"
    print("  ✅ Biweekly frequency handled correctly")


def main():
    """Run all tests."""
    print("🚀 Starting recurring items model tests...\n")
    
    try:
        test_frequency_calculations()
        test_habit_streak_logic()
        
        if not test_model_validation():
            return False
            
        test_edge_cases()
        
        print("\n🎉 All model tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)