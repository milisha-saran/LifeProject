#!/usr/bin/env python3
"""
Test script for recurring items API endpoints.
"""

import requests
import json
from datetime import date, timedelta


def test_api_endpoints():
    """Test the API endpoints for chores and habits."""
    base_url = "http://localhost:8000"
    
    print("🚀 Testing recurring items API endpoints...\n")
    
    # Test health check first
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Server is running")
        else:
            print("❌ Server health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        return False
    
    # Test chores endpoints
    print("\n📝 Testing chores endpoints...")
    
    # Test GET /chores (should work without auth for now, or return 401)
    try:
        response = requests.get(f"{base_url}/chores/")
        if response.status_code in [200, 401, 422]:  # 401 if auth required, 422 if validation error
            print(f"✅ GET /chores/ endpoint accessible (status: {response.status_code})")
        else:
            print(f"❌ GET /chores/ unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ GET /chores/ failed: {e}")
    
    # Test habits endpoints
    print("\n🔥 Testing habits endpoints...")
    
    try:
        response = requests.get(f"{base_url}/habits/")
        if response.status_code in [200, 401, 422]:  # 401 if auth required, 422 if validation error
            print(f"✅ GET /habits/ endpoint accessible (status: {response.status_code})")
        else:
            print(f"❌ GET /habits/ unexpected status: {response.status_code}")
    except Exception as e:
        print(f"❌ GET /habits/ failed: {e}")
    
    # Test API documentation
    print("\n📚 Testing API documentation...")
    
    try:
        response = requests.get(f"{base_url}/docs")
        if response.status_code == 200:
            print("✅ API documentation accessible at /docs")
        else:
            print(f"❌ API docs status: {response.status_code}")
    except Exception as e:
        print(f"❌ API docs failed: {e}")
    
    # Test OpenAPI schema
    try:
        response = requests.get(f"{base_url}/openapi.json")
        if response.status_code == 200:
            openapi_spec = response.json()
            
            # Check if our new endpoints are in the spec
            paths = openapi_spec.get("paths", {})
            
            chore_endpoints = [path for path in paths.keys() if "/chores" in path]
            habit_endpoints = [path for path in paths.keys() if "/habits" in path]
            
            print(f"✅ Found {len(chore_endpoints)} chore endpoints in OpenAPI spec")
            print(f"✅ Found {len(habit_endpoints)} habit endpoints in OpenAPI spec")
            
            # List the endpoints
            if chore_endpoints:
                print("  Chore endpoints:", chore_endpoints)
            if habit_endpoints:
                print("  Habit endpoints:", habit_endpoints)
                
        else:
            print(f"❌ OpenAPI spec status: {response.status_code}")
    except Exception as e:
        print(f"❌ OpenAPI spec failed: {e}")
    
    print("\n🎉 API endpoint tests completed!")
    return True


if __name__ == "__main__":
    test_api_endpoints()