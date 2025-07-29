"""
Tests for the main FastAPI application.
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app, create_app


class TestApplication:
    """Test cases for the FastAPI application."""

    def test_create_app(self) -> None:
        """Test that create_app returns a FastAPI instance."""
        app_instance = create_app()
        assert app_instance is not None
        assert hasattr(app_instance, 'title')
        assert app_instance.title == "Productivity Management System"

    def test_app_instance(self) -> None:
        """Test that the app instance is properly configured."""
        assert app is not None
        assert app.title == "Productivity Management System"
        assert app.version == "1.0.0"

    @pytest.mark.asyncio
    async def test_root_endpoint(self) -> None:
        """Test the root endpoint returns expected response."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/")
            assert response.status_code == 200
            data = response.json()
            assert data["message"] == "Productivity Management System API"
            assert data["status"] == "running"

    @pytest.mark.asyncio
    async def test_health_check_endpoint(self) -> None:
        """Test the health check endpoint."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"

    @pytest.mark.asyncio
    async def test_database_health_check_endpoint(self) -> None:
        """Test the database health check endpoint."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/db-health")
            assert response.status_code == 200
            data = response.json()
            assert "status" in data
            assert "database" in data

    @pytest.mark.asyncio
    async def test_docs_endpoint_accessible(self) -> None:
        """Test that the API documentation is accessible."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/docs")
            assert response.status_code == 200
            assert "text/html" in response.headers["content-type"]

    @pytest.mark.asyncio
    async def test_openapi_schema_accessible(self) -> None:
        """Test that the OpenAPI schema is accessible."""
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            response = await client.get("/openapi.json")
            assert response.status_code == 200
            data = response.json()
            assert data["info"]["title"] == "Productivity Management System"
            assert data["info"]["version"] == "1.0.0"