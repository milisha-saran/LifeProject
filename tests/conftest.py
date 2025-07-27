"""
Pytest configuration and fixtures.
"""
import asyncio
from typing import Dict, Any

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def async_client():
    """Create an async test client for the FastAPI application."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest.fixture
def test_user_data() -> Dict[str, Any]:
    """Sample user data for testing."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }


@pytest.fixture
def test_project_data() -> Dict[str, Any]:
    """Sample project data for testing."""
    return {
        "name": "Test Project",
        "description": "A test project",
        "weekly_hours": 10,
        "start_date": "2024-01-01",
        "status": "Not Started",
        "color": "#FF5733"
    }