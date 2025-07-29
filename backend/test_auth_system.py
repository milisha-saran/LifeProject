#!/usr/bin/env python3
"""
Live test script for authentication and user management system.

This script validates:
- User registration with validation
- Login with correct/incorrect credentials
- JWT token generation and validation
- Protected endpoint access with/without tokens
- User data isolation (users can't access others' data)

Requirements: 1.1-1.3, 7.2-7.4
"""
import asyncio
import httpx
import json
from typing import Dict, Any, Optional


class AuthSystemTester:
    """Test class for authentication system validation."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url)
        self.test_results = []
    
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
    
    async def test_user_registration_valid(self) -> Optional[Dict[str, Any]]:
        """Test user registration with valid data."""
        test_name = "User Registration - Valid Data"
        
        user_data = {
            "username": "testuser1",
            "email": "testuser1@example.com",
            "password": "securepassword123"
        }
        
        try:
            response = await self.client.post("/auth/register", json=user_data)
            
            if response.status_code == 201:
                user = response.json()
                if (user.get("username") == "testuser1" and 
                    user.get("email") == "testuser1@example.com" and
                    "id" in user and
                    "hashed_password" not in user):  # Ensure password not returned
                    self.log_test(test_name, True, f"User created with ID: {user['id']}")
                    return user
                else:
                    self.log_test(test_name, False, f"Invalid user data returned: {user}")
            else:
                self.log_test(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
        
        return None
    
    async def test_user_registration_duplicate_username(self):
        """Test user registration with duplicate username."""
        test_name = "User Registration - Duplicate Username"
        
        user_data = {
            "username": "testuser1",  # Same as previous test
            "email": "different@example.com",
            "password": "securepassword123"
        }
        
        try:
            response = await self.client.post("/auth/register", json=user_data)
            
            if response.status_code == 400:
                error = response.json()
                if "Username already registered" in error.get("detail", ""):
                    self.log_test(test_name, True, "Correctly rejected duplicate username")
                else:
                    self.log_test(test_name, False, f"Wrong error message: {error}")
            else:
                self.log_test(test_name, False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_user_registration_duplicate_email(self):
        """Test user registration with duplicate email."""
        test_name = "User Registration - Duplicate Email"
        
        user_data = {
            "username": "differentuser",
            "email": "testuser1@example.com",  # Same as previous test
            "password": "securepassword123"
        }
        
        try:
            response = await self.client.post("/auth/register", json=user_data)
            
            if response.status_code == 400:
                error = response.json()
                if "Email already registered" in error.get("detail", ""):
                    self.log_test(test_name, True, "Correctly rejected duplicate email")
                else:
                    self.log_test(test_name, False, f"Wrong error message: {error}")
            else:
                self.log_test(test_name, False, f"Expected 400, got {response.status_code}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_user_registration_invalid_data(self):
        """Test user registration with invalid data."""
        test_name = "User Registration - Invalid Data"
        
        # Test short password
        user_data = {
            "username": "testuser2",
            "email": "testuser2@example.com",
            "password": "short"  # Too short
        }
        
        try:
            response = await self.client.post("/auth/register", json=user_data)
            
            if response.status_code == 422:  # Validation error
                self.log_test(test_name, True, "Correctly rejected short password")
            else:
                self.log_test(test_name, False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_login_valid_credentials(self) -> Optional[str]:
        """Test login with valid credentials."""
        test_name = "Login - Valid Credentials"
        
        login_data = {
            "username": "testuser1",
            "password": "securepassword123"
        }
        
        try:
            response = await self.client.post(
                "/auth/login",
                data=login_data,  # OAuth2PasswordRequestForm expects form data
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                token_data = response.json()
                if (token_data.get("token_type") == "bearer" and 
                    "access_token" in token_data):
                    self.log_test(test_name, True, "Successfully obtained access token")
                    return token_data["access_token"]
                else:
                    self.log_test(test_name, False, f"Invalid token response: {token_data}")
            else:
                self.log_test(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
        
        return None
    
    async def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        test_name = "Login - Invalid Credentials"
        
        login_data = {
            "username": "testuser1",
            "password": "wrongpassword"
        }
        
        try:
            response = await self.client.post(
                "/auth/login",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 401:
                error = response.json()
                if "Incorrect username or password" in error.get("detail", ""):
                    self.log_test(test_name, True, "Correctly rejected invalid credentials")
                else:
                    self.log_test(test_name, False, f"Wrong error message: {error}")
            else:
                self.log_test(test_name, False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_login_nonexistent_user(self):
        """Test login with non-existent user."""
        test_name = "Login - Non-existent User"
        
        login_data = {
            "username": "nonexistentuser",
            "password": "anypassword"
        }
        
        try:
            response = await self.client.post(
                "/auth/login",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 401:
                self.log_test(test_name, True, "Correctly rejected non-existent user")
            else:
                self.log_test(test_name, False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_token_validation_valid_token(self, token: str):
        """Test accessing protected endpoint with valid token."""
        test_name = "Token Validation - Valid Token"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = await self.client.get("/auth/me", headers=headers)
            
            if response.status_code == 200:
                user_data = response.json()
                if user_data.get("username") == "testuser1":
                    self.log_test(test_name, True, "Successfully accessed protected endpoint")
                else:
                    self.log_test(test_name, False, f"Wrong user data: {user_data}")
            else:
                self.log_test(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_token_validation_invalid_token(self):
        """Test accessing protected endpoint with invalid token."""
        test_name = "Token Validation - Invalid Token"
        
        headers = {"Authorization": "Bearer invalid_token_here"}
        
        try:
            response = await self.client.get("/auth/me", headers=headers)
            
            if response.status_code == 401:
                self.log_test(test_name, True, "Correctly rejected invalid token")
            else:
                self.log_test(test_name, False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_token_validation_no_token(self):
        """Test accessing protected endpoint without token."""
        test_name = "Token Validation - No Token"
        
        try:
            response = await self.client.get("/auth/me")
            
            if response.status_code == 401:
                self.log_test(test_name, True, "Correctly rejected request without token")
            else:
                self.log_test(test_name, False, f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
    
    async def test_token_refresh(self, token: str) -> Optional[str]:
        """Test token refresh functionality."""
        test_name = "Token Refresh"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = await self.client.post("/auth/refresh", headers=headers)
            
            if response.status_code == 200:
                token_data = response.json()
                if (token_data.get("token_type") == "bearer" and 
                    "access_token" in token_data):
                    new_token = token_data["access_token"]
                    if new_token != token:  # Should be a new token
                        self.log_test(test_name, True, "Successfully refreshed token")
                        return new_token
                    else:
                        self.log_test(test_name, False, "New token is same as old token")
                else:
                    self.log_test(test_name, False, f"Invalid token response: {token_data}")
            else:
                self.log_test(test_name, False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
        
        return None
    
    async def test_user_data_isolation(self, user1_token: str) -> Optional[str]:
        """Test that users can't access each other's data."""
        test_name = "User Data Isolation"
        
        # First, create a second user
        user2_data = {
            "username": "testuser2",
            "email": "testuser2@example.com",
            "password": "securepassword456"
        }
        
        try:
            # Register second user
            response = await self.client.post("/auth/register", json=user2_data)
            if response.status_code != 201:
                self.log_test(test_name, False, f"Failed to create second user: {response.text}")
                return None
            
            # Login as second user
            login_data = {
                "username": "testuser2",
                "password": "securepassword456"
            }
            
            response = await self.client.post(
                "/auth/login",
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code != 200:
                self.log_test(test_name, False, f"Failed to login second user: {response.text}")
                return None
            
            user2_token = response.json()["access_token"]
            
            # Create a project as user1
            user1_headers = {"Authorization": f"Bearer {user1_token}"}
            project_data = {
                "name": "User1 Project",
                "description": "A project for user 1",
                "weekly_hours": 10,
                "start_date": "2024-01-01",
                "status": "Not Started",
                "color": "#FF0000"
            }
            
            response = await self.client.post("/projects/", json=project_data, headers=user1_headers)
            if response.status_code != 201:
                self.log_test(test_name, False, f"Failed to create project for user1: {response.text}")
                return None
            
            project = response.json()
            project_id = project["id"]
            
            # Try to access user1's projects as user2
            user2_headers = {"Authorization": f"Bearer {user2_token}"}
            response = await self.client.get("/projects/", headers=user2_headers)
            
            if response.status_code == 200:
                user2_projects = response.json()
                # User2 should not see user1's projects
                user1_project_visible = any(p["id"] == project_id for p in user2_projects)
                
                if not user1_project_visible:
                    self.log_test(test_name, True, "User data properly isolated - user2 cannot see user1's projects")
                else:
                    self.log_test(test_name, False, "User data not isolated - user2 can see user1's projects")
            else:
                self.log_test(test_name, False, f"Failed to get projects for user2: {response.text}")
            
            return user2_token
            
        except Exception as e:
            self.log_test(test_name, False, f"Exception: {str(e)}")
            return None
    
    async def test_protected_endpoints_access(self, token: str):
        """Test access to various protected endpoints."""
        test_name = "Protected Endpoints Access"
        
        headers = {"Authorization": f"Bearer {token}"}
        
        endpoints_to_test = [
            ("/projects/", "GET"),
            ("/chores/", "GET"),
            ("/habits/", "GET"),
        ]
        
        all_passed = True
        
        for endpoint, method in endpoints_to_test:
            try:
                if method == "GET":
                    response = await self.client.get(endpoint, headers=headers)
                
                if response.status_code == 200:
                    continue  # Success
                else:
                    all_passed = False
                    self.log_test(f"{test_name} - {endpoint}", False, f"Status: {response.status_code}")
                    
            except Exception as e:
                all_passed = False
                self.log_test(f"{test_name} - {endpoint}", False, f"Exception: {str(e)}")
        
        if all_passed:
            self.log_test(test_name, True, "All protected endpoints accessible with valid token")
    
    async def run_all_tests(self):
        """Run all authentication system tests."""
        print("🚀 Starting Authentication System Tests")
        print("=" * 50)
        
        # Test user registration
        user = await self.test_user_registration_valid()
        await self.test_user_registration_duplicate_username()
        await self.test_user_registration_duplicate_email()
        await self.test_user_registration_invalid_data()
        
        if not user:
            print("❌ Cannot continue tests - user registration failed")
            return
        
        # Test login
        token = await self.test_login_valid_credentials()
        await self.test_login_invalid_credentials()
        await self.test_login_nonexistent_user()
        
        if not token:
            print("❌ Cannot continue tests - login failed")
            return
        
        # Test token validation
        await self.test_token_validation_valid_token(token)
        await self.test_token_validation_invalid_token()
        await self.test_token_validation_no_token()
        
        # Test token refresh
        new_token = await self.test_token_refresh(token)
        if new_token:
            token = new_token  # Use refreshed token for remaining tests
        
        # Test protected endpoints
        await self.test_protected_endpoints_access(token)
        
        # Test user data isolation
        await self.test_user_data_isolation(token)
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 Test Summary")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All authentication tests passed!")
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Check the output above for details.")
        
        return passed == total


async def main():
    """Main function to run authentication tests."""
    print("Authentication System Live Test")
    print("This script tests the authentication and user management system")
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
    async with AuthSystemTester() as tester:
        success = await tester.run_all_tests()
        
        if success:
            print("\n✅ Authentication system validation completed successfully!")
        else:
            print("\n❌ Authentication system validation failed!")
            exit(1)


if __name__ == "__main__":
    asyncio.run(main())