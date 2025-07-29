"""
Database initialization and utility functions.
"""
import asyncio
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlmodel import SQLModel

from app.core.config import settings


async def create_database_if_not_exists(database_url: str) -> None:
    """
    Create database if it doesn't exist.
    
    Args:
        database_url: Database URL
    """
    # Extract database name from URL
    db_name = database_url.split("/")[-1]
    
    # Create connection to postgres database to create our target database
    postgres_url = database_url.rsplit("/", 1)[0] + "/postgres"
    
    engine = create_async_engine(
        postgres_url.replace("postgresql://", "postgresql+asyncpg://"),
        isolation_level="AUTOCOMMIT"
    )
    
    try:
        async with engine.connect() as conn:
            # Check if database exists
            result = await conn.execute(
                f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"
            )
            exists = result.fetchone()
            
            if not exists:
                await conn.execute(f"CREATE DATABASE {db_name}")
                print(f"Database '{db_name}' created successfully")
            else:
                print(f"Database '{db_name}' already exists")
    finally:
        await engine.dispose()


async def drop_database_if_exists(database_url: str) -> None:
    """
    Drop database if it exists.
    
    Args:
        database_url: Database URL
    """
    # Extract database name from URL
    db_name = database_url.split("/")[-1]
    
    # Create connection to postgres database to drop our target database
    postgres_url = database_url.rsplit("/", 1)[0] + "/postgres"
    
    engine = create_async_engine(
        postgres_url.replace("postgresql://", "postgresql+asyncpg://"),
        isolation_level="AUTOCOMMIT"
    )
    
    try:
        async with engine.connect() as conn:
            # Terminate existing connections to the database
            await conn.execute(
                f"""
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = '{db_name}' AND pid <> pg_backend_pid()
                """
            )
            
            # Drop database if exists
            await conn.execute(f"DROP DATABASE IF EXISTS {db_name}")
            print(f"Database '{db_name}' dropped successfully")
    finally:
        await engine.dispose()


async def init_database(engine: Optional[AsyncEngine] = None) -> None:
    """
    Initialize database tables.
    
    Args:
        engine: Optional database engine. If not provided, creates one from settings.
    """
    if engine is None:
        from app.core.database import engine as default_engine
        engine = default_engine
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    print("Database tables initialized successfully")


async def reset_database(database_url: Optional[str] = None) -> None:
    """
    Reset database by dropping and recreating all tables.
    
    Args:
        database_url: Optional database URL. If not provided, uses settings.
    """
    if database_url is None:
        database_url = settings.DATABASE_URL
    
    engine = create_async_engine(
        database_url.replace("postgresql://", "postgresql+asyncpg://")
    )
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.drop_all)
            await conn.run_sync(SQLModel.metadata.create_all)
        
        print("Database reset successfully")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    # CLI utility for database operations
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python -m app.core.database_utils <command>")
        print("Commands: create, drop, init, reset")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        asyncio.run(create_database_if_not_exists(settings.DATABASE_URL))
    elif command == "drop":
        asyncio.run(drop_database_if_exists(settings.DATABASE_URL))
    elif command == "init":
        asyncio.run(init_database())
    elif command == "reset":
        asyncio.run(reset_database())
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)