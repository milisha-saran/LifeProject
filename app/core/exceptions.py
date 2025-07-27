"""
Custom exception classes for the productivity management system.
"""
from typing import Any, Dict, Optional


class ProductivitySystemException(Exception):
    """Base exception for the productivity system."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class TimeAllocationExceeded(ProductivitySystemException):
    """Raised when time allocation constraints are violated."""
    
    def __init__(
        self, 
        message: str, 
        project_id: Optional[int] = None,
        goal_id: Optional[int] = None,
        current_allocation: Optional[float] = None,
        requested_hours: Optional[float] = None,
        available_hours: Optional[float] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        error_details = details or {}
        if project_id is not None:
            error_details["project_id"] = project_id
        if goal_id is not None:
            error_details["goal_id"] = goal_id
        if current_allocation is not None:
            error_details["current_allocation"] = current_allocation
        if requested_hours is not None:
            error_details["requested_hours"] = requested_hours
        if available_hours is not None:
            error_details["available_hours"] = available_hours
            
        super().__init__(message, error_details)


class ResourceNotFound(ProductivitySystemException):
    """Raised when requested resource doesn't exist."""
    
    def __init__(
        self, 
        resource_type: str, 
        resource_id: Any, 
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if message is None:
            message = f"{resource_type} with ID {resource_id} not found"
        
        error_details = details or {}
        error_details.update({
            "resource_type": resource_type,
            "resource_id": resource_id
        })
        
        super().__init__(message, error_details)


class UnauthorizedAccess(ProductivitySystemException):
    """Raised when user tries to access resources they don't own."""
    
    def __init__(
        self, 
        user_id: int, 
        resource_type: str, 
        resource_id: Any,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if message is None:
            message = f"User {user_id} is not authorized to access {resource_type} {resource_id}"
        
        error_details = details or {}
        error_details.update({
            "user_id": user_id,
            "resource_type": resource_type,
            "resource_id": resource_id
        })
        
        super().__init__(message, error_details)


class ValidationError(ProductivitySystemException):
    """Raised when input validation fails."""
    
    def __init__(
        self, 
        field: str, 
        value: Any, 
        constraint: str,
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if message is None:
            message = f"Validation failed for field '{field}': {constraint}"
        
        error_details = details or {}
        error_details.update({
            "field": field,
            "value": value,
            "constraint": constraint
        })
        
        super().__init__(message, error_details)


class BusinessLogicError(ProductivitySystemException):
    """Raised when business logic constraints are violated."""
    
    def __init__(
        self,
        operation: str,
        constraint: str, 
        message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if message is None:
            message = f"Business logic error in {operation}: {constraint}"
        
        error_details = details or {}
        error_details.update({
            "operation": operation,
            "constraint": constraint
        })
        
        super().__init__(message, error_details)


class DatabaseError(ProductivitySystemException):
    """Raised when database operations fail."""
    
    def __init__(
        self,
        operation: str,
        message: Optional[str] = None,
        original_error: Optional[Exception] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        if message is None:
            message = f"Database error during {operation}"
        
        error_details = details or {}
        error_details.update({
            "operation": operation
        })
        if original_error:
            error_details["original_error"] = str(original_error)
            error_details["error_type"] = type(original_error).__name__
        
        super().__init__(message, error_details)