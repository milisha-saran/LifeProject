#!/usr/bin/env python3
"""
Live test script for the hierarchical project management system.

This script validates:
- Creating a project with 10 hours/week allocation
- Adding goals that sum to exactly 10 hours
- Adding tasks that respect goal hour limits
- Testing time constraint violations
- Full CRUD operations on all entities
"""

import asyncio
import json
import sys
from datetime import date, datetime
from typing import Dict, Any

import httpx
from pydantic import BaseModel


class TestConfig:
    """Configuration for the test."""
    BASE_URL = "http://localhost:8000"
    TEST_USER = {
        "username": "testuser_hierarchy",
        "email": "testuser_hierarchy@example.com",
        "password": "testpassword123"
    }


class TestResult(BaseModel):
    """Result of a test operation."""
    success: bool
    message: str
    data: Dict[str, Any] = {}


class ProjectHierarchyTester:
    """Tester for the project hierarchy system."""
    
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=TestConfig.BASE_URL)
        self.auth_token = None
        self.test_data = {
            "user_id": None,
            "project_id": None,
            "goal_ids": [],
            "task_ids": []
        }
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers."""
        if not self.auth_token:
            raise ValueError("Not authenticated")
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    async def register_and_login(self) -> TestResult:
        """Register a test user and login."""
        try:
            # Try to register (might fail if user exists)
            register_response = await self.client.post("/auth/register", json=TestConfig.TEST_USER)
            
            # Login
            login_data = {
                "username": TestConfig.TEST_USER["username"],
                "password": TestConfig.TEST_USER["password"]
            }
            login_response = await self.client.post("/auth/login", data=login_data)
            
            if login_response.status_code != 200:
                return TestResult(
                    success=False,
                    message=f"Login failed: {login_response.text}",
                    data={"status_code": login_response.status_code}
                )
            
            login_result = login_response.json()
            self.auth_token = login_result["access_token"]
            
            return TestResult(
                success=True,
                message="Successfully registered and logged in",
                data={"token_type": login_result.get("token_type")}
            )
            
        except Exception as e:
            return TestResult(
                success=False,
                message=f"Authentication failed: {str(e)}"
            )
    
    async def create_project_with_10_hours(self) -> TestResult:
        """Create a project with 10 hours/week allocation."""
        try:
            project_data = {
                "name": "Test Project - 10 Hours",
                "description": "A test project with 10 hours weekly allocation",
                "weekly_hours": 10.0,
                "start_date": str(date.today()),
                "status": "Not Started",
                "color": "#3498db"
            }
            
            response = await self.client.post(
                "/projects/",
                json=project_data,
                headers=self._get_auth_headers()
            )
            
            if response.status_code != 201:
                return TestResult(
                    success=False,
                    message=f"Failed to create project: {response.text}",
                    data={"status_code": response.status_code}
                )
            
            project = response.json()
            self.test_data["project_id"] = project["id"]
            
            return TestResult(
                success=True,
                message="Successfully created project with 10 hours allocation",
                data={"project": project}
            )
            
        except Exception as e:
            return TestResult(
                success=False,
                message=f"Project creation failed: {str(e)}"
            )
    
    async def add_goals_summing_to_10_hours(self) -> TestResult:
        """Add goals that sum to exactly 10 hours."""
        try:
            goals_data = [
                {
                    "name": "Goal 1 - Development",
                    "description": "Development tasks",
                    "weekly_hours": 4.0,
                    "start_date": str(date.today()),
                    "status": "Not Started"
                },
                {
                    "name": "Goal 2 - Testing",
                    "description": "Testing and QA tasks",
                    "weekly_hours": 3.0,
                    "start_date": str(date.today()),
                    "status": "Not Started"
                },
                {
                    "name": "Goal 3 - Documentation",
                    "description": "Documentation tasks",
                    "weekly_hours": 3.0,
                    "start_date": str(date.today()),
                    "status": "Not Started"
                }
            ]
            
            created_goals = []
            for goal_data in goals_data:
                response = await self.client.post(
                    f"/goals/projects/{self.test_data['project_id']}/goals",
                    json=goal_data,
                    headers=self._get_auth_headers()
                )
                
                if response.status_code != 201:
                    return TestResult(
                        success=False,
                        message=f"Failed to create goal '{goal_data['name']}': {response.text}",
                        data={"status_code": response.status_code}
                    )
                
                goal = response.json()
                created_goals.append(goal)
                self.test_data["goal_ids"].append(goal["id"])
            
            # Verify total hours
            total_hours = sum(goal["weekly_hours"] for goal in created_goals)
            
            return TestResult(
                success=True,
                message=f"Successfully created {len(created_goals)} goals totaling {total_hours} hours",
                data={"goals": created_goals, "total_hours": total_hours}
            )
            
        except Exception as e:
            return TestResult(
                success=False,
                message=f"Goal creation failed: {str(e)}"
            )
    
    async def add_tasks_respecting_goal_limits(self) -> TestResult:
        """Add tasks that respect goal hour limits."""
        try:
            # Tasks for Goal 1 (4 hours): 2 + 2 = 4 hours
            goal1_tasks = [
                {
                    "name": "Task 1.1 - Setup",
                    "description": "Initial setup",
                    "weekly_hours": 2.0,
                    "status": "Not Started"
                },
                {
                    "name": "Task 1.2 - Implementation",
                    "description": "Core implementation",
                    "weekly_hours": 2.0,
                    "status": "Not Started"
                }
            ]
            
            # Tasks for Goal 2 (3 hours): 1.5 + 1.5 = 3 hours
            goal2_tasks = [
                {
                    "name": "Task 2.1 - Unit Tests",
                    "description": "Write unit tests",
                    "weekly_hours": 1.5,
                    "status": "Not Started"
                },
                {
                    "name": "Task 2.2 - Integration Tests",
                    "description": "Write integration tests",
                    "weekly_hours": 1.5,
                    "status": "Not Started"
                }
            ]
            
            # Tasks for Goal 3 (3 hours): 1 + 2 = 3 hours
            goal3_tasks = [
                {
                    "name": "Task 3.1 - API Docs",
                    "description": "API documentation",
                    "weekly_hours": 1.0,
                    "status": "Not Started"
                },
                {
                    "name": "Task 3.2 - User Guide",
                    "description": "User guide documentation",
                    "weekly_hours": 2.0,
                    "status": "Not Started"
                }
            ]
            
            all_tasks = [
                (self.test_data["goal_ids"][0], goal1_tasks),
                (self.test_data["goal_ids"][1], goal2_tasks),
                (self.test_data["goal_ids"][2], goal3_tasks)
            ]
            
            created_tasks = []
            for goal_id, tasks in all_tasks:
                for task_data in tasks:
                    response = await self.client.post(
                        f"/tasks/goals/{goal_id}/tasks",
                        json=task_data,
                        headers=self._get_auth_headers()
                    )
                    
                    if response.status_code != 201:
                        return TestResult(
                            success=False,
                            message=f"Failed to create task '{task_data['name']}': {response.text}",
                            data={"status_code": response.status_code}
                        )
                    
                    task = response.json()
                    created_tasks.append(task)
                    self.test_data["task_ids"].append(task["id"])
            
            return TestResult(
                success=True,
                message=f"Successfully created {len(created_tasks)} tasks respecting goal limits",
                data={"tasks": created_tasks}
            )
            
        except Exception as e:
            return TestResult(
                success=False,
                message=f"Task creation failed: {str(e)}"
            )
    
    async def test_time_constraint_violations(self) -> TestResult:
        """Test time constraint violations."""
        try:
            violations_tested = []
            
            # Test 1: Try to create a goal that exceeds project allocation
            try:
                excess_goal_data = {
                    "name": "Excess Goal",
                    "description": "This should fail",
                    "weekly_hours": 5.0,  # Would make total 15 hours (10 + 5)
                    "start_date": str(date.today()),
                    "status": "Not Started"
                }
                
                response = await self.client.post(
                    f"/goals/projects/{self.test_data['project_id']}/goals",
                    json=excess_goal_data,
                    headers=self._get_auth_headers()
                )
                
                if response.status_code == 400:
                    violations_tested.append({
                        "test": "Excess goal creation",
                        "result": "Correctly rejected",
                        "error": response.json().get("detail", "Unknown error")
                    })
                else:
                    violations_tested.append({
                        "test": "Excess goal creation",
                        "result": "FAILED - Should have been rejected",
                        "status_code": response.status_code
                    })
            except Exception as e:
                violations_tested.append({
                    "test": "Excess goal creation",
                    "result": f"Error during test: {str(e)}"
                })
            
            # Test 2: Try to create a task that exceeds goal allocation
            try:
                excess_task_data = {
                    "name": "Excess Task",
                    "description": "This should fail",
                    "weekly_hours": 2.0,  # Goal 1 already has 4 hours, this would make 6
                    "status": "Not Started"
                }
                
                response = await self.client.post(
                    f"/tasks/goals/{self.test_data['goal_ids'][0]}/tasks",
                    json=excess_task_data,
                    headers=self._get_auth_headers()
                )
                
                if response.status_code == 400:
                    violations_tested.append({
                        "test": "Excess task creation",
                        "result": "Correctly rejected",
                        "error": response.json().get("detail", "Unknown error")
                    })
                else:
                    violations_tested.append({
                        "test": "Excess task creation",
                        "result": "FAILED - Should have been rejected",
                        "status_code": response.status_code
                    })
            except Exception as e:
                violations_tested.append({
                    "test": "Excess task creation",
                    "result": f"Error during test: {str(e)}"
                })
            
            # Test 3: Try to reduce project hours below allocated goal hours
            try:
                update_data = {"weekly_hours": 5.0}  # Less than 10 hours already allocated
                
                response = await self.client.put(
                    f"/projects/{self.test_data['project_id']}",
                    json=update_data,
                    headers=self._get_auth_headers()
                )
                
                if response.status_code == 400:
                    violations_tested.append({
                        "test": "Reduce project hours below allocation",
                        "result": "Correctly rejected",
                        "error": response.json().get("detail", "Unknown error")
                    })
                else:
                    violations_tested.append({
                        "test": "Reduce project hours below allocation",
                        "result": "FAILED - Should have been rejected",
                        "status_code": response.status_code
                    })
            except Exception as e:
                violations_tested.append({
                    "test": "Reduce project hours below allocation",
                    "result": f"Error during test: {str(e)}"
                })
            
            success = all("Correctly rejected" in test["result"] for test in violations_tested)
            
            return TestResult(
                success=success,
                message=f"Time constraint violation tests completed. {len(violations_tested)} tests run.",
                data={"violations_tested": violations_tested}
            )
            
        except Exception as e:
            return TestResult(
                success=False,
                message=f"Constraint violation testing failed: {str(e)}"
            )
    
    async def test_full_crud_operations(self) -> TestResult:
        """Test full CRUD operations on all entities."""
        try:
            crud_results = []
            
            # Test Project CRUD
            # Read project
            response = await self.client.get(
                f"/projects/{self.test_data['project_id']}",
                headers=self._get_auth_headers()
            )
            if response.status_code == 200:
                crud_results.append({"operation": "Project READ", "result": "SUCCESS"})
            else:
                crud_results.append({"operation": "Project READ", "result": "FAILED"})
            
            # Update project
            update_data = {"description": "Updated project description"}
            response = await self.client.put(
                f"/projects/{self.test_data['project_id']}",
                json=update_data,
                headers=self._get_auth_headers()
            )
            if response.status_code == 200:
                crud_results.append({"operation": "Project UPDATE", "result": "SUCCESS"})
            else:
                crud_results.append({"operation": "Project UPDATE", "result": "FAILED"})
            
            # Test Goal CRUD
            if self.test_data["goal_ids"]:
                goal_id = self.test_data["goal_ids"][0]
                
                # Read goal
                response = await self.client.get(
                    f"/goals/{goal_id}",
                    headers=self._get_auth_headers()
                )
                if response.status_code == 200:
                    crud_results.append({"operation": "Goal READ", "result": "SUCCESS"})
                else:
                    crud_results.append({"operation": "Goal READ", "result": "FAILED"})
                
                # Update goal
                update_data = {"description": "Updated goal description"}
                response = await self.client.put(
                    f"/goals/{goal_id}",
                    json=update_data,
                    headers=self._get_auth_headers()
                )
                if response.status_code == 200:
                    crud_results.append({"operation": "Goal UPDATE", "result": "SUCCESS"})
                else:
                    crud_results.append({"operation": "Goal UPDATE", "result": "FAILED"})
            
            # Test Task CRUD
            if self.test_data["task_ids"]:
                task_id = self.test_data["task_ids"][0]
                
                # Read task
                response = await self.client.get(
                    f"/tasks/{task_id}",
                    headers=self._get_auth_headers()
                )
                if response.status_code == 200:
                    crud_results.append({"operation": "Task READ", "result": "SUCCESS"})
                else:
                    crud_results.append({"operation": "Task READ", "result": "FAILED"})
                
                # Update task
                update_data = {"description": "Updated task description"}
                response = await self.client.put(
                    f"/tasks/{task_id}",
                    json=update_data,
                    headers=self._get_auth_headers()
                )
                if response.status_code == 200:
                    crud_results.append({"operation": "Task UPDATE", "result": "SUCCESS"})
                else:
                    crud_results.append({"operation": "Task UPDATE", "result": "FAILED"})
            
            # Test List operations
            # List projects
            response = await self.client.get("/projects/", headers=self._get_auth_headers())
            if response.status_code == 200:
                crud_results.append({"operation": "List Projects", "result": "SUCCESS"})
            else:
                crud_results.append({"operation": "List Projects", "result": "FAILED"})
            
            # List goals
            response = await self.client.get("/goals/", headers=self._get_auth_headers())
            if response.status_code == 200:
                crud_results.append({"operation": "List Goals", "result": "SUCCESS"})
            else:
                crud_results.append({"operation": "List Goals", "result": "FAILED"})
            
            # List tasks
            response = await self.client.get("/tasks/", headers=self._get_auth_headers())
            if response.status_code == 200:
                crud_results.append({"operation": "List Tasks", "result": "SUCCESS"})
            else:
                crud_results.append({"operation": "List Tasks", "result": "FAILED"})
            
            success = all(result["result"] == "SUCCESS" for result in crud_results)
            
            return TestResult(
                success=success,
                message=f"CRUD operations test completed. {len(crud_results)} operations tested.",
                data={"crud_results": crud_results}
            )
            
        except Exception as e:
            return TestResult(
                success=False,
                message=f"CRUD operations testing failed: {str(e)}"
            )
    
    async def cleanup(self) -> TestResult:
        """Clean up test data."""
        try:
            cleanup_results = []
            
            # Delete tasks
            for task_id in self.test_data["task_ids"]:
                response = await self.client.delete(
                    f"/tasks/{task_id}",
                    headers=self._get_auth_headers()
                )
                cleanup_results.append(f"Task {task_id}: {response.status_code}")
            
            # Delete goals
            for goal_id in self.test_data["goal_ids"]:
                response = await self.client.delete(
                    f"/goals/{goal_id}",
                    headers=self._get_auth_headers()
                )
                cleanup_results.append(f"Goal {goal_id}: {response.status_code}")
            
            # Delete project
            if self.test_data["project_id"]:
                response = await self.client.delete(
                    f"/projects/{self.test_data['project_id']}",
                    headers=self._get_auth_headers()
                )
                cleanup_results.append(f"Project {self.test_data['project_id']}: {response.status_code}")
            
            return TestResult(
                success=True,
                message="Cleanup completed",
                data={"cleanup_results": cleanup_results}
            )
            
        except Exception as e:
            return TestResult(
                success=False,
                message=f"Cleanup failed: {str(e)}"
            )


async def main():
    """Run the project hierarchy tests."""
    print("🚀 Starting Project Hierarchy System Tests")
    print("=" * 50)
    
    async with ProjectHierarchyTester() as tester:
        tests = [
            ("Authentication", tester.register_and_login),
            ("Create Project (10 hours)", tester.create_project_with_10_hours),
            ("Add Goals (sum to 10 hours)", tester.add_goals_summing_to_10_hours),
            ("Add Tasks (respect limits)", tester.add_tasks_respecting_goal_limits),
            ("Test Constraint Violations", tester.test_time_constraint_violations),
            ("Test CRUD Operations", tester.test_full_crud_operations),
            ("Cleanup", tester.cleanup)
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n🧪 Running: {test_name}")
            result = await test_func()
            results.append((test_name, result))
            
            if result.success:
                print(f"✅ {result.message}")
            else:
                print(f"❌ {result.message}")
            
            if result.data:
                print(f"📊 Data: {json.dumps(result.data, indent=2, default=str)}")
    
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    
    passed = sum(1 for _, result in results if result.success)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result.success else "❌ FAIL"
        print(f"  {status} {test_name}")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Project hierarchy system is working correctly.")
        sys.exit(0)
    else:
        print("💥 Some tests failed. Please check the implementation.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())