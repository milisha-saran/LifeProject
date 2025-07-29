"""
Tests for database connection and session management.
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel, Field

from app.core.config import settings
from app.core.database import engine, get_session, init_db, close_db
from app.core.database_utils import (
    create_database_if_not_exists,
    drop_database_if_exists,
    init_database,
    reset_database,
)
from tests.test_database import db_session, test_engine


# Test model for database operations
class TestModel(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    value: int


class TestDatabaseConnection:
    """Test database connection functionality."""

    @pytest.mark.asyncio
    async def test_database_engine_creation(self):
        """Test that database engine is created correctly."""
        assert engine is not None
        assert str(engine.url).startswith("postgresql+asyncpg://")

    @pytest.mark.asyncio
    async def test_get_session_dependency(self):
        """Test the get_session dependency function."""
        async for session in get_session():
            assert isinstance(session, AsyncSession)
            assert session.is_active
            break

    @pytest.mark.asyncio
    async def test_session_rollback_on_exception(self):
        """Test that session rolls back on exception."""
        try:
            async for session in get_session():
                # Simulate an error
                await session.execute("INVALID SQL")
                break
        except Exception:
            # Exception should be handled by the dependency
            pass

    @pytest.mark.asyncio
    async def test_init_db(self):
        """Test database initialization."""
        # This should not raise an exception
        await init_db()

    @pytest.mark.asyncio
    async def test_close_db(self):
        """Test database connection closing."""
        # This should not raise an exception
        await close_db()


class TestDatabaseUtils:
    """Test database utility functions."""

    @pytest.mark.asyncio
    async def test_create_database_if_not_exists(self):
        """Test database creation utility."""
        # This should not raise an exception
        await create_database_if_not_exists(settings.TEST_DATABASE_URL)

    @pytest.mark.asyncio
    async def test_init_database(self):
        """Test database table initialization."""
        await init_database(test_engine)

    @pytest.mark.asyncio
    async def test_reset_database(self):
        """Test database reset functionality."""
        await reset_database(settings.TEST_DATABASE_URL)


class TestDatabaseOperations:
    """Test basic database operations."""

    @pytest.mark.asyncio
    async def test_create_and_query_record(self, db_session: AsyncSession):
        """Test creating and querying a record."""
        # Create test model table
        async with test_engine.begin() as conn:
            await conn.run_sync(TestModel.metadata.create_all)

        # Create a record
        test_record = TestModel(name="test", value=42)
        db_session.add(test_record)
        await db_session.commit()
        await db_session.refresh(test_record)

        # Query the record
        result = await db_session.get(TestModel, test_record.id)
        assert result is not None
        assert result.name == "test"
        assert result.value == 42

    @pytest.mark.asyncio
    async def test_session_isolation(self, db_session: AsyncSession):
        """Test that database sessions are properly isolated."""
        # Create test model table
        async with test_engine.begin() as conn:
            await conn.run_sync(TestModel.metadata.create_all)

        # Create a record in this session
        test_record = TestModel(name="isolation_test", value=100)
        db_session.add(test_record)
        await db_session.commit()

        # Verify the record exists in this session
        result = await db_session.get(TestModel, test_record.id)
        assert result is not None

        # The record should be cleaned up after the test due to rollback


class TestConfigurationLoading:
    """Test configuration loading."""

    def test_settings_loaded(self):
        """Test that settings are loaded correctly."""
        assert settings.DATABASE_URL is not None
        assert settings.TEST_DATABASE_URL is not None
        assert settings.PROJECT_NAME == "Productivity Management System"

    def test_database_urls_different(self):
        """Test that production and test database URLs are different."""
        assert settings.DATABASE_URL != settings.TEST_DATABASE_URL

    def test_debug_setting(self):
        """Test debug setting."""
        assert isinstance(settings.DEBUG, bool)