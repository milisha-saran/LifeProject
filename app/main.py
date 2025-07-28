"""
Main FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError

from app.core.config import settings
from app.core.database import init_db, close_db
from app.core.exceptions import (
    ProductivitySystemException,
    TimeAllocationExceeded,
    ResourceNotFound,
    UnauthorizedAccess,
    ValidationError as CustomValidationError,
    DatabaseError
)
from app.core.error_handlers import (
    productivity_system_exception_handler,
    time_allocation_exceeded_handler,
    resource_not_found_handler,
    unauthorized_access_handler,
    validation_error_handler,
    database_error_handler,
    general_exception_handler
)
from app.api import auth, projects, goals, tasks, chores, habits


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Productivity Management System",
        description="A comprehensive personal productivity management API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register exception handlers
    app.add_exception_handler(ProductivitySystemException, productivity_system_exception_handler)
    app.add_exception_handler(TimeAllocationExceeded, time_allocation_exceeded_handler)
    app.add_exception_handler(ResourceNotFound, resource_not_found_handler)
    app.add_exception_handler(UnauthorizedAccess, unauthorized_access_handler)
    app.add_exception_handler(CustomValidationError, validation_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(ValidationError, validation_error_handler)
    app.add_exception_handler(DatabaseError, database_error_handler)
    app.add_exception_handler(SQLAlchemyError, database_error_handler)
    app.add_exception_handler(Exception, general_exception_handler)

    # Include routers
    app.include_router(auth.router)
    app.include_router(projects.router)
    app.include_router(goals.router)
    app.include_router(tasks.router)
    app.include_router(chores.router)
    app.include_router(habits.router)

    return app


app = create_app()


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {"message": "Productivity Management System API", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/db-health")
async def database_health_check():
    """Database health check endpoint."""
    try:
        from app.core.database import get_session
        from sqlalchemy import text
        async for session in get_session():
            # Simple query to test database connection
            result = await session.execute(text("SELECT 1"))
            result.fetchone()
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}