#!/usr/bin/env python3
"""
Live test script for comprehensive error handling and validation system.

This script validates:
- Time allocation constraint violations
- Invalid input data handling
- Authentication/authorization errors
- Database constraint violations
- Proper HTTP status codes and error messages

Requirements: 7.2, 7.3, 8.3, 8.4, 3.3, 3.4, 4.3, 4.4
"""
import asyncio
import httpx
import json
import uuid
from typing import Dict, Any, Optional


class ErrorHandlingTester:
    """Test class for error handling and validation system."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url)
        self.test_results = []
        self.auth_token = None
        self.test_user_id = str(uuid.uuid4())[:8]
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test result."""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
    
    async def setup_auth(self) -> bool:
        """Set up authentication for tests."""
        # Register test user
        user_data = {
            "username": f"testuser_{self.test_user_id}",
            "email": f"testuser_{self.test_user_id}@example.com",
            "password": "securepassword123"
        }
        
        try:
            response = await self.client.post("/auth/register", json=user_data)
            if response.status_code != 201:
                print(f"❌ Failed to register test user: {response.text}")
                return False
            
            # Login
            login_data = {
                "username": user_data["username"],
                "password": user_data["password"]
            }
            
            response = await self.client.post(
                "/auth/login",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                self.auth_token = response.json()["access_token"]
                return True
            else:
                print(f"❌ Failed to login test user: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error setting up auth: {e}")
            return False
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authorization headers."""
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    async def test_validation_errors(self):
        """Test input validation error responses."""
        test_name = "Input Validation Errors"
        
        # Test missing required fields
        invalid_project_data = {
            "name": "",  # Empty name
            "weekly_hours": -5,  # Negative hours
            "start_date": "invalid-date",  # Invalid date format
            "color": "not-a-hex-color"  # Invalid color format
        }
        
        try:
            response = await self.client.post(
                "/projects/",
                json=invalid_project_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                error_response = response.json()
                if ("error" in error_response and 
                    error_response["error"]["code"] == "VALIDATION_ERROR"):
                    self.log_test(test_name, True, "Validation errors properly formatted")
                else:
                    self.log_test(test_name, False, f"Wrong error format: {error_response}")
            else:
                self.log_test(test_name, False, f"Expected 422, got {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_time_allocation_violations(self):
        """Test time allocation constraint violations."""
        test_name = "Time Allocation Violations"
        
        try:
            # Create a project with 10 hours
            project_data = {
                "name": f"Test Project {self.test_user_id}",
                "description": "A test project",
                "weekly_hours": 10,
                "start_date": "2024-01-01",
                "status": "Not Started",
                "color": "#FF0000"
            }
            
            response = await self.client.post(
                "/projects/",
                json=project_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code != 201:
                self.log_test(test_name, False, f"Failed to create project: {response.text}")
                return
            
            project = response.json()
            project_id = project["id"]
            
            # Try to create a goal with 15 hours (exceeds project allocation)
            goal_data = {
                "name": "Oversized Goal",
                "description": "A goal that exceeds project hours",
                "weekly_hours": 15,  # Exceeds project's 10 hours
                "start_date": "2024-01-01",
                "status": "Not Started"
            }
            
            response = await self.client.post(
                f"/projects/{project_id}/goals/",
                json=goal_data,
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 422:
                error_response = response.json()
                if (error_response.get("error", {}).get("code") == "TIME_ALLOCATION_EXCEEDED" and
                    "details" in error_response["error"]):
                    details = error_response["error"]["details"]
                    if ("project_id" in details and 
                        "current_allocation" in details and
                        "requested_hours" in details and
                        "available_hours" in details):
                        self.log_test(test_name, True, "Time allocation error properly formatted")
                    else:
                        self.log_test(test_name, False, f"Missing details in error: {details}")
                else:
                    self.log_test(test_name, False, f"Wrong error format: {error_response}")
            else:
                self.log_test(test_name, False, f"Expected 422, got {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_resource_not_found_errors(self):
        """Test resource not found error responses."""
        test_name = "Resource Not Found Errors"
        
        try:
            # Try to access non-existent project
            response = await self.client.get(
                "/projects/99999",  # Non-existent ID
                headers=self.get_auth_headers()
            )
            
            if response.status_code == 404:
                error_response = response.json()
                if (error_response.get("error", {}).get("code") == "RESOURCE_NOT_FOUND" and
                    "details" in error_response["error"]):
                    details = error_response["error"]["details"]
                    if ("resource_type" in details and 
                        "resource_id" in details):
                        self.log_test(test_name, True, "Resource not found error properly formatted")
                    else:
                        self.log_test(test_name, False, f"Missing details in error: {details}")
                else:
                    self.log_test(test_name, False, f"Wrong error format: {error_response}")
            else:
                self.log_test(test_name, False, f"Expected 404, got {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_authentication_errors(self):
        """Test authentication error responses."""
        test_name = "Authentication Errors"
        
        try:
            # Try to access protected endpoint without token
            response = await self.client.get("/projects/")
            
            if response.status_code == 401:
                error_response = response.json()
                if "Could not validate credentials" in error_response.get("detail", ""):
                    self.log_test(f"{test_name} - No Token", True, "No token error handled correctly")
                else:
                    self.log_test(f"{test_name} - No Token", False, f"Wrong error message: {error_response}")
            else:
                self.log_test(f"{test_name} - No Token", False, f"Expected 401, got {response.status_code}")
            
            # Try with invalid token
            invalid_headers = {"Authorization": "Bearer invalid_token"}
            response = await self.client.get("/projects/", headers=invalid_headers)
            
            if response.status_code == 401:
                self.log_test(f"{test_name} - Invalid Token", True, "Invalid token error handled correctly")
            else:
                self.log_test(f"{test_name} - Invalid Token", False, f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_database_constraint_violations(self):
        """Test database constraint violation error responses."""
        test_name = "Database Constraint Violations"
        
        try:
            # Try to create user with duplicate username
            duplicate_user_data = {
                "username": f"testuser_{self.test_user_id}",  # Same as setup user
                "email": f"different_{self.test_user_id}@example.com",
                "password": "securepassword123"
            }
            
            response = await self.client.post("/auth/register", json=duplicate_user_data)
            
            if response.status_code == 400:
                error_response = response.json()
                if "Username already registered" in error_response.get("detail", ""):
                    self.log_test(test_name, True, "Duplicate username error handled correctly")
                else:
                    self.log_test(test_name, False, f"Wrong error message: {error_response}")
            else:
                self.log_test(test_name, False, f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_error_response_format_consistency(self):
        """Test that all error responses follow consistent format."""
        test_name = "Error Response Format Consistency"
        
        error_endpoints = [
            # Validation error
            ("/projects/", "POST", {"invalid": "data"}),
            # Not found error
            ("/projects/99999", "GET", None),
            # Auth error
            ("/projects/", "GET", None, False),  # No auth
        ]
        
        consistent_format = True
        
        for endpoint, method, data, *auth_required in error_endpoints:
            try:
                headers = self.get_auth_headers() if not auth_required or auth_required[0] != False else None
                
                if method == "POST":
                    response = await self.client.post(endpoint, json=data, headers=headers)
                elif method == "GET":
                    response = await self.client.get(endpoint, headers=headers)
                
                if response.status_code >= 400:
                    error_response = response.json()
                    
                    # Check for consistent error format
                    if not isinstance(error_response, dict):
                        consistent_format = False
                        break
                    
                    if "error" not in error_response:
                        # Some endpoints might return different format (like FastAPI default)
                        if "detail" not in error_response:
                            consistent_format = False
                            break
                    else:
                        error_obj = error_response["error"]
                        if not isinstance(error_obj, dict) or "code" not in error_obj or "message" not in error_obj:
                            consistent_format = False
                            break
                            
            except Exception:
                consistent_format = False
                break
        
        if consistent_format:
            self.log_test(test_name, True, "All error responses follow consistent format")
        else:
            self.log_test(test_name, False, "Inconsistent error response formats detected")
    
    async def test_http_status_codes(self):
        """Test that appropriate HTTP status codes are returned."""
        test_name = "HTTP Status Codes"
        
        status_tests = [
            # (endpoint, method, data, headers, expected_status, description)
            ("/projects/", "GET", None, None, 401, "Unauthorized access"),
            ("/projects/99999", "GET", None, self.get_auth_headers(), 404, "Resource not found"),
            ("/projects/", "POST", {"invalid": "data"}, self.get_auth_headers(), 422, "Validation error"),
        ]
        
        all_correct = True
        
        for endpoint, method, data, headers, expected_status, description in status_tests:
            try:
                if method == "POST":
                    response = await self.client.post(endpoint, json=data, headers=headers)
                elif method == "GET":
                    response = await self.client.get(endpoint, headers=headers)
                
                if response.status_code == expected_status:
                    continue  # Correct status code
                else:
                    all_correct = False
                    self.log_test(f"{test_name} - {description}", False, 
                                f"Expected {expected_status}, got {response.status_code}")
                    
            except Exception as e:
                all_correct = False
                self.log_test(f"{test_name} - {description}", False, f"Exception: {str(e)}")
        
        if all_correct:
            self.log_test(test_name, True, "All HTTP status codes correct")
    
    async def run_all_tests(self):
        """Run all error handling tests."""
        print("🚀 Starting Error Handling and Validation System Tests")
        print("=" * 60)
        
        # Setup authentication
        if not await self.setup_auth():
            print("❌ Cannot continue tests - authentication setup failed")
            return False
        
        # Run all tests
        await self.test_validation_errors()
        await self.test_time_allocation_violations()
        await self.test_resource_not_found_errors()
        await self.test_authentication_errors()
        await self.test_database_constraint_violations()
        await self.test_error_response_format_consistency()
        await self.test_http_status_codes()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 Test Summary")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All error handling tests passed!")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check the output above for details.")
        
        return passed == total


async def main():
    """Main function to run error handling tests."""
    print("Error Handling and Validation System Live Test")
    print("This script tests comprehensive error handling and validation")
    print("Make sure the FastAPI server is running on http://localhost:8000")
    print()
    
    # Test server connectivity
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8000/health")
            if response.status_code != 200:
                print("❌ Server health check failed. Make sure the server is running.")
                return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("Make sure the FastAPI server is running on http://localhost:8000")
        return
    
    # Run tests
    async with ErrorHandlingTester() as tester:
        success = await tester.run_all_tests()
        
        if success:
            print("\n✅ Error handling system validation completed successfully!")
        else:
            print("\n❌ Error handling system validation failed!")
            exit(1)


if __name__ == "__main__":
    asyncio.run(main())