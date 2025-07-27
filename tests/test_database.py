"""
Test database utilities and fixtures.
"""
import asyncio
from typing import AsyncGenerator

import pytest
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.core.config import settings
from app.core.database_utils import create_database_if_not_exists, drop_database_if_exists


# Test database engine
test_engine = create_async_engine(
    settings.TEST_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=False,
    future=True,
)

# Test session factory
TestSessionLocal = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Set up test database for the entire test session."""
    # Create test database if it doesn't exist
    await create_database_if_not_exists(settings.TEST_DATABASE_URL)
    
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    yield
    
    # Clean up after all tests
    await test_engine.dispose()


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a test database session.
    
    This fixture creates a new session for each test and rolls back
    the transaction after the test completes to ensure test isolation.
    """
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


@pytest.fixture
async def clean_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a clean test database session.
    
    This fixture truncates all tables before yielding the session
    to ensure a completely clean state for tests that need it.
    """
    async with TestSessionLocal() as session:
        try:
            # Truncate all tables
            async with session.begin():
                for table in reversed(SQLModel.metadata.sorted_tables):
                    await session.execute(f"TRUNCATE TABLE {table.name} RESTART IDENTITY CASCADE")
            
            yield session
        finally:
            await session.rollback()
            await session.close()


async def reset_test_database() -> None:
    """Reset the test database by dropping and recreating all tables."""
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)