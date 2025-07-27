"""
Unit tests for enum models.
"""
import pytest

from app.models.enums import FrequencyType, ProjectStatus, TaskStatus


class TestTaskStatus:
    """Test TaskStatus enum."""
    
    def test_task_status_values(self):
        """Test that TaskStatus has correct values."""
        assert TaskStatus.NOT_STARTED == "Not Started"
        assert TaskStatus.IN_PROGRESS == "In Progress"
        assert TaskStatus.COMPLETED == "Completed"
    
    def test_task_status_is_string_enum(self):
        """Test that TaskStatus values are strings."""
        for status in TaskStatus:
            assert isinstance(status.value, str)
    
    def test_task_status_count(self):
        """Test that TaskStatus has exactly 3 values."""
        assert len(TaskStatus) == 3


class TestProjectStatus:
    """Test ProjectStatus enum."""
    
    def test_project_status_values(self):
        """Test that ProjectStatus has correct values."""
        assert ProjectStatus.NOT_STARTED == "Not Started"
        assert ProjectStatus.IN_PROGRESS == "In Progress"
        assert ProjectStatus.COMPLETED == "Completed"
    
    def test_project_status_is_string_enum(self):
        """Test that ProjectStatus values are strings."""
        for status in ProjectStatus:
            assert isinstance(status.value, str)
    
    def test_project_status_matches_task_status(self):
        """Test that ProjectStatus values match TaskStatus values."""
        assert ProjectStatus.NOT_STARTED == TaskStatus.NOT_STARTED
        assert ProjectStatus.IN_PROGRESS == TaskStatus.IN_PROGRESS
        assert ProjectStatus.COMPLETED == TaskStatus.COMPLETED
    
    def test_project_status_count(self):
        """Test that ProjectStatus has exactly 3 values."""
        assert len(ProjectStatus) == 3


class TestFrequencyType:
    """Test FrequencyType enum."""
    
    def test_frequency_type_values(self):
        """Test that FrequencyType has correct values."""
        assert FrequencyType.DAILY == "daily"
        assert FrequencyType.WEEKLY == "weekly"
        assert FrequencyType.BIWEEKLY == "biweekly"
        assert FrequencyType.MONTHLY == "monthly"
        assert FrequencyType.CUSTOM == "custom"
    
    def test_frequency_type_is_string_enum(self):
        """Test that FrequencyType values are strings."""
        for freq_type in FrequencyType:
            assert isinstance(freq_type.value, str)
    
    def test_frequency_type_count(self):
        """Test that FrequencyType has exactly 5 values."""
        assert len(FrequencyType) == 5
    
    def test_frequency_type_lowercase(self):
        """Test that all FrequencyType values are lowercase."""
        for freq_type in FrequencyType:
            assert freq_type.value.islower()