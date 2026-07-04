# Full-Stack To-Do App

A full-stack To-Do application with a **FastAPI** (Python 3) backend and a **React 18 + TypeScript** frontend. Users can register, log in, and access a protected To-Do page. Authentication is handled with signed JWTs (HS256).

```
┌─────────────────────────┐        HTTP + CORS        ┌──────────────────────────┐
│   React SPA             │ ◄────────────────────────► │   FastAPI Server         │
│   localhost:3000        │   Authorization: Bearer    │   localhost:8000         │
│                         │                            │                          │
│  /register  /login      │                            │  POST /register          │
│  /todo  (protected)     │                            │  POST /login             │
│                         │                            │  GET  /protected         │
└─────────────────────────┘                            └──────────────────────────┘
```

---

## Project Structure

```
.
├── backend/                  # FastAPI application
│   ├── main.py               # App entry point (CORS, middleware, router)
│   ├── config.py             # Environment-based configuration
│   ├── requirements.txt      # Python dependencies
│   ├── routers/
│   │   └── auth.py           # /register, /login, /protected endpoints
│   ├── services/
│   │   └── auth_service.py   # register_user, authenticate_user, verify_token
│   ├── models/
│   │   └── schemas.py        # Pydantic request/response models
│   ├── store/
│   │   └── user_store.py     # In-memory user store (username → hashed password)
│   ├── middleware/
│   │   └── logging_middleware.py  # Request/response logging → app.log
│   └── tests/
│       └── unit/
│           └── test_user_store.py
│
└── frontend/                 # React + TypeScript SPA (Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── src/
        ├── main.tsx          # React root
        ├── App.tsx           # BrowserRouter + Routes
        ├── index.css         # Global responsive styles
        ├── api/
        │   ├── client.ts     # Axios instance with auth interceptors
        │   └── auth.ts       # registerUser, loginUser, getProtected
        ├── components/
        │   ├── Spinner.tsx
        │   ├── ErrorMessage.tsx
        │   └── ProtectedRoute.tsx
        ├── hooks/
        │   └── useAuth.ts    # login / logout / isAuthenticated
        ├── pages/
        │   ├── RegisterPage.tsx
        │   ├── LoginPage.tsx
        │   └── TodoPage.tsx
        └── types/
            └── api.ts        # Shared TypeScript interfaces
```

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Python | 3.8+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Backend Setup

### 1. Create and activate a virtual environment

```bash
# From the project root
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Windows (CMD)
.venv\Scripts\activate.bat
```

### 2. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Configure environment variables (optional)

The backend reads configuration from environment variables. All have safe defaults for local development:

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `dev-secret-key-change-in-production` | Secret used to sign JWTs. **Change in production.** |
| `ALGORITHM` | `HS256` | JWT signing algorithm. |
| `FRONTEND_ORIGIN` | `http://localhost:3000` | CORS allowed origin. |
| `LOG_FILE` | `app.log` | Path to the request/error log file. |

Set them in your shell before starting the server, e.g.:

```bash
export SECRET_KEY="my-super-secret-key"
```

Or on Windows PowerShell:

```powershell
$env:SECRET_KEY = "my-super-secret-key"
```

### 4. Start the development server

```bash
# Run from the project root (so Python imports resolve correctly)
uvicorn backend.main:app --reload --port 8000
```

> **Note:** Run from the project root, not from inside `backend/`. The `backend/` directory itself acts as the Python package root when running tests — see the testing section below.

The API will be available at **http://localhost:8000**.  
Interactive docs (Swagger UI): **http://localhost:8000/docs**

---

## Frontend Setup

### 1. Install dependencies

```bash
npm install --prefix frontend
```

### 2. Start the development server

```bash
npm run dev --prefix frontend
```

Or from inside the `frontend/` directory:

```bash
cd frontend
npm run dev
```

The app will be available at **http://localhost:3000** (or the port printed by Vite).

---

## Running Tests

### Backend

```bash
# From the backend/ directory so top-level imports (store, services, etc.) resolve
cd backend
pytest
```

### Frontend

```bash
# Type-check
cd frontend && npx tsc --noEmit

# Run tests (single pass, no watch)
cd frontend && npx vitest run
```

---

## API Reference

Base URL: `http://localhost:8000`

### `POST /register`

Create a new user account.

**Auth required:** No

**Request body:**
```json
{ "username": "alice", "password": "secret" }
```

**Responses:**

| Status | Body | Meaning |
|---|---|---|
| 201 | `{ "message": "User registered successfully" }` | Account created |
| 400 | `{ "detail": "Username and password are required" }` | Blank field |
| 409 | `{ "detail": "Username already exists" }` | Duplicate username |

---

### `POST /login`

Authenticate and receive a JWT.

**Auth required:** No

**Request body:**
```json
{ "username": "alice", "password": "secret" }
```

**Responses:**

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "token": "<jwt>" }` | Login successful |
| 400 | `{ "detail": "Username and password are required" }` | Blank field |
| 401 | `{ "detail": "Invalid username or password" }` | Bad credentials |

---

### `GET /protected`

Verify token and access protected content.

**Auth required:** Yes — `Authorization: Bearer <token>` header

**Responses:**

| Status | Body | Meaning |
|---|---|---|
| 200 | `{ "message": "Hello, alice! Your token is valid." }` | Token valid |
| 401 | `{ "detail": "Authorization header missing" }` | No header |
| 401 | `{ "detail": "Invalid or expired token" }` | Bad/expired token |

---

### `GET /health`

Liveness probe.

**Auth required:** No

**Response:** `{ "status": "ok" }`

---

## Logging

All requests and unhandled errors are written to `app.log` in the working directory where `uvicorn` is started. Log format:

```
2024-01-01 12:00:00,000  INFO      POST /register → 201
2024-01-01 12:00:01,000  ERROR     Unhandled exception: KeyError 'username'
```

---

## Pushing to GitHub

```bash
git init
git add .
git commit -m "feat: initial full-stack todo app"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

> Make sure `.venv/` and `node_modules/` are in your `.gitignore` before committing.

---

## .gitignore (recommended)

```
# Python
.venv/
__pycache__/
*.pyc
*.pyo
app.log
.hypothesis/

# Node
node_modules/
dist/
frontend/dist/
```
