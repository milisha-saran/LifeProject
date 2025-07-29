"""
Global exception handlers for FastAPI application.
"""
import logging
from typing import Union

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from pydantic import ValidationError

from app.core.exceptions import (
    ProductivitySystemException,
    TimeAllocationExceeded,
    ResourceNotFound,
    UnauthorizedAccess,
    ValidationError as CustomValidationError,
    BusinessLogicError,
    DatabaseError
)

# Setup logging
logger = logging.getLogger(__name__)


def create_error_response(
    status_code: int,
    error_code: str,
    message: str,
    details: dict = None
) -> JSONResponse:
    """Create a standardized error response."""
    error_response = {
        "error": {
            "code": error_code,
            "message": message
        }
    }
    
    if details:
        error_response["error"]["details"] = details
    
    return JSONResponse(
        status_code=status_code,
        content=error_response
    )


async def productivity_system_exception_handler(
    request: Request, 
    exc: ProductivitySystemException
) -> JSONResponse:
    """Handle custom productivity system exceptions."""
    error_code = exc.__class__.__name__.upper()
    
    # Map exception types to HTTP status codes
    status_code_map = {
        "TimeAllocationExceeded": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "ResourceNotFound": status.HTTP_404_NOT_FOUND,
        "UnauthorizedAccess": status.HTTP_403_FORBIDDEN,
        "ValidationError": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "BusinessLogicError": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "DatabaseError": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }
    
    status_code = status_code_map.get(
        exc.__class__.__name__, 
        status.HTTP_500_INTERNAL_SERVER_ERROR
    )
    
    logger.warning(
        f"ProductivitySystemException: {exc.__class__.__name__} - {exc.message}",
        extra={"details": exc.details, "request_url": str(request.url)}
    )
    
    return create_error_response(
        status_code=status_code,
        error_code=error_code,
        message=exc.message,
        details=exc.details
    )


async def time_allocation_exceeded_handler(
    request: Request, 
    exc: TimeAllocationExceeded
) -> JSONResponse:
    """Handle time allocation exceeded exceptions."""
    logger.warning(
        f"Time allocation exceeded: {exc.message}",
        extra={"details": exc.details, "request_url": str(request.url)}
    )
    
    return create_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_code="TIME_ALLOCATION_EXCEEDED",
        message=exc.message,
        details=exc.details
    )


async def resource_not_found_handler(
    request: Request, 
    exc: ResourceNotFound
) -> JSONResponse:
    """Handle resource not found exceptions."""
    logger.info(
        f"Resource not found: {exc.message}",
        extra={"details": exc.details, "request_url": str(request.url)}
    )
    
    return create_error_response(
        status_code=status.HTTP_404_NOT_FOUND,
        error_code="RESOURCE_NOT_FOUND",
        message=exc.message,
        details=exc.details
    )


async def unauthorized_access_handler(
    request: Request, 
    exc: UnauthorizedAccess
) -> JSONResponse:
    """Handle unauthorized access exceptions."""
    logger.warning(
        f"Unauthorized access attempt: {exc.message}",
        extra={"details": exc.details, "request_url": str(request.url)}
    )
    
    return create_error_response(
        status_code=status.HTTP_403_FORBIDDEN,
        error_code="UNAUTHORIZED_ACCESS",
        message=exc.message,
        details=exc.details
    )


async def validation_error_handler(
    request: Request, 
    exc: Union[RequestValidationError, ValidationError, CustomValidationError]
) -> JSONResponse:
    """Handle validation errors."""
    if isinstance(exc, CustomValidationError):
        return create_error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            message=exc.message,
            details=exc.details
        )
    
    # Handle Pydantic validation errors
    error_details = []
    for error in exc.errors():
        error_details.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    logger.info(
        f"Validation error: {len(error_details)} field(s) failed validation",
        extra={"errors": error_details, "request_url": str(request.url)}
    )
    
    return create_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        error_code="VALIDATION_ERROR",
        message="Input validation failed",
        details={"errors": error_details}
    )


async def database_error_handler(
    request: Request, 
    exc: Union[SQLAlchemyError, DatabaseError]
) -> JSONResponse:
    """Handle database errors."""
    if isinstance(exc, DatabaseError):
        logger.error(
            f"Database error: {exc.message}",
            extra={"details": exc.details, "request_url": str(request.url)}
        )
        
        return create_error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="DATABASE_ERROR",
            message=exc.message,
            details=exc.details
        )
    
    # Handle SQLAlchemy integrity errors (unique constraints, foreign keys, etc.)
    if isinstance(exc, IntegrityError):
        error_message = "Database constraint violation"
        details = {"constraint_error": str(exc.orig)}
        
        # Check for common constraint violations
        if "unique constraint" in str(exc.orig).lower():
            error_message = "Duplicate entry - this value already exists"
        elif "foreign key constraint" in str(exc.orig).lower():
            error_message = "Referenced resource does not exist"
        elif "not null constraint" in str(exc.orig).lower():
            error_message = "Required field cannot be empty"
        
        logger.warning(
            f"Database integrity error: {error_message}",
            extra={"details": details, "request_url": str(request.url)}
        )
        
        return create_error_response(
            status_code=status.HTTP_400_BAD_REQUEST,
            error_code="INTEGRITY_ERROR",
            message=error_message,
            details=details
        )
    
    # Handle other SQLAlchemy errors
    logger.error(
        f"Database error: {str(exc)}",
        extra={"error_type": type(exc).__name__, "request_url": str(request.url)}
    )
    
    return create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code="DATABASE_ERROR",
        message="An unexpected database error occurred"
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    logger.error(
        f"Unexpected error: {str(exc)}",
        extra={
            "error_type": type(exc).__name__, 
            "request_url": str(request.url)
        },
        exc_info=True
    )
    
    return create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        error_code="INTERNAL_SERVER_ERROR",
        message="An unexpected error occurred"
    )