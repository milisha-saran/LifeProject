# Productivity Management System

A comprehensive personal productivity management API built with FastAPI that helps users organize their work through a hierarchical structure of Projects → Goals → Tasks, while also managing recurring Chores and Habits.

## 🚀 Features

- **Hierarchical Task Organization**: Organize work through Projects → Goals → Tasks structure
- **Time Allocation Management**: Track and validate time constraints across the hierarchy
- **Recurring Items**: Manage Chores and Habits with customizable frequency patterns
- **User Authentication**: Secure JWT-based authentication system
- **RESTful API**: Full REST API with automatic OpenAPI documentation
- **Data Persistence**: PostgreSQL database with proper indexing and relationships

## 📋 Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🏗️ Architecture

The system follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│           API Layer (FastAPI)       │
├─────────────────────────────────────┤
│         Service Layer               │
├─────────────────────────────────────┤
│         Repository Layer            │
├─────────────────────────────────────┤
│      Database Layer (PostgreSQL)   │
└─────────────────────────────────────┘
```

### Technology Stack

- **Backend Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 14+
- **ORM**: SQLModel (built on SQLAlchemy and Pydantic)
- **Authentication**: JWT tokens with FastAPI security utilities
- **API Documentation**: Automatic OpenAPI/Swagger generation
- **Database Migrations**: Alembic
- **Testing**: pytest with async support
- **Code Quality**: Black, isort, mypy, ruff

## 📁 Project Structure

```
productivity-management-system/
├── app/                          # Main application package
│   ├── __init__.py
│   ├── main.py                   # FastAPI application factory and configuration
│   ├── api/                      # API route definitions
│   │   └── __init__.py
│   ├── core/                     # Core application components
│   │   ├── __init__.py
│   │   └── config.py            # Application settings and configuration
│   ├── models/                   # SQLModel database models
│   │   └── __init__.py
│   ├── repositories/             # Data access layer
│   │   └── __init__.py
│   └── services/                 # Business logic layer
│       └── __init__.py
├── tests/                        # Test suite
│   ├── __init__.py
│   ├── conftest.py              # Pytest configuration and fixtures
│   ├── test_main.py             # Main application tests
│   ├── integration/             # Integration tests
│   │   └── __init__.py
│   └── unit/                    # Unit tests
│       └── __init__.py
├── .kiro/                       # Kiro IDE configuration
│   └── specs/                   # Project specifications
├── main.py                      # Application entry point
├── pyproject.toml              # Project configuration and dependencies
├── pytest.ini                 # Pytest configuration
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## 🛠️ Setup and Installation

### Prerequisites

- Python 3.11 or higher
- PostgreSQL 14 or higher
- uv (Python package manager) - recommended

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd productivity-management-system
   ```

2. **Install dependencies using uv**
   ```bash
   # Install uv if you haven't already
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Install project dependencies
   uv sync
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb productivity_db
   
   # Run migrations (when implemented)
   # alembic upgrade head
   ```

5. **Run the application**
   ```bash
   # Using uv
   uv run python main.py
   
   # Or activate virtual environment and run directly
   source .venv/bin/activate
   python main.py
   ```

The application will be available at `http://localhost:8000`

## ⚙️ Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost/productivity_db` |
| `SECRET_KEY` | JWT secret key (change in production!) | `your-secret-key-change-in-production` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `API_V1_STR` | API version prefix | `/api/v1` |
| `PROJECT_NAME` | Application name | `Productivity Management System` |
| `ALLOWED_HOSTS` | CORS allowed hosts | `*` |

### Configuration Class

The application uses Pydantic Settings for configuration management:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Configuration loaded from environment variables
    model_config = {"env_file": ".env"}
```

## 📚 API Documentation

### Interactive Documentation

Once the application is running, you can access:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

### Core Endpoints

#### Health Check
- `GET /` - Root endpoint with system status
- `GET /health` - Health check endpoint

#### Authentication (Planned)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

#### Projects (Planned)
- `GET /projects/` - List user projects
- `POST /projects/` - Create project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

#### Goals (Planned)
- `GET /projects/{project_id}/goals/` - List project goals
- `POST /projects/{project_id}/goals/` - Create goal
- `GET /goals/{id}` - Get goal details
- `PUT /goals/{id}` - Update goal
- `DELETE /goals/{id}` - Delete goal

#### Tasks (Planned)
- `GET /goals/{goal_id}/tasks/` - List goal tasks
- `POST /goals/{goal_id}/tasks/` - Create task
- `GET /tasks/{id}` - Get task details
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

#### Chores & Habits (Planned)
- `GET /chores/` - List user chores
- `POST /chores/` - Create chore
- `POST /chores/{id}/complete` - Mark chore complete
- `GET /habits/` - List user habits
- `POST /habits/` - Create habit
- `POST /habits/{id}/complete` - Mark habit complete

## 🧪 Development

### Code Quality Tools

The project uses several tools to maintain code quality:

```bash
# Format code
uv run black .
uv run isort .

# Lint code
uv run ruff check .

# Type checking
uv run mypy .
```

### Development Server

Run the development server with auto-reload:

```bash
uv run python main.py
```

Or using uvicorn directly:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Application Factory Pattern

The application uses the factory pattern for better testability and configuration:

```python
def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
        title="Productivity Management System",
        description="A comprehensive personal productivity management API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    return app
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app

# Run specific test categories
uv run pytest -m unit
uv run pytest -m integration
```

### Test Structure

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions and API endpoints
- **Test Fixtures**: Shared test data and configuration in `conftest.py`

### Current Test Coverage

The project includes comprehensive tests for:
- ✅ Application factory and configuration
- ✅ Health check endpoints
- ✅ API documentation accessibility
- ⏳ Authentication system (planned)
- ⏳ CRUD operations (planned)
- ⏳ Time allocation validation (planned)

## 🚀 Deployment

### Production Configuration

1. **Set secure environment variables**
   ```bash
   export SECRET_KEY="your-very-secure-secret-key"
   export DATABASE_URL="postgresql://user:password@db-host/productivity_db"
   export ALLOWED_HOSTS="yourdomain.com,www.yourdomain.com"
   ```

2. **Use production WSGI server**
   ```bash
   uv run gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Docker Deployment (Planned)

A Dockerfile and docker-compose.yml will be provided for containerized deployment.

## 📈 Current Implementation Status

Based on the implementation plan, the following has been completed:

- ✅ **Task 1**: Set up project structure and core dependencies
  - FastAPI project structure with proper directory organization
  - uv project configuration with all required dependencies
  - Basic FastAPI application with CORS and middleware setup
  - pytest configuration and test directory structure
  - Basic application startup tests

### Next Steps

The next phase of development will focus on:

- **Task 2**: Database configuration and connection management
- **Task 3**: Core data models and enums
- **Task 4**: Authentication system implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and code quality checks
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support, please refer to the project documentation or create an issue in the repository.