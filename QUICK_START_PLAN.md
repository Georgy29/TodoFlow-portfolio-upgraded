# Quick Start Plan - 3-7 Days

A focused, actionable checklist to improve the app without major refactoring.

---

## Task Checklist

### 🔧 Tooling Setup (Day 1 - Morning)

#### Task 1: Set up Prettier
**Type:** Tooling  
**Time:** 15-30 min

- [ ] Install Prettier: `npm install --save-dev prettier`
- [ ] Create `.prettierrc` with config
- [ ] Create `.prettierignore`
- [ ] Add script to `package.json`: `"format": "prettier --write \"src/**/*.{js,jsx}\""`
- [ ] Format all files: `npm run format`

**Files to create:**
- `client/.prettierrc`
- `client/.prettierignore`

---

#### Task 2: Configure ESLint properly
**Type:** Tooling  
**Time:** 20-30 min

- [ ] Review current `eslint.config.js`
- [ ] Add rules for React best practices
- [ ] Add rules for common mistakes (unused vars, etc.)
- [ ] Fix all existing lint errors
- [ ] Add script: `"lint:fix": "eslint . --fix"`

**Files to modify:**
- `client/eslint.config.js`

---

#### Task 3: Set up environment variables
**Type:** Tooling  
**Time:** 15-20 min

- [ ] Create `client/.env.example` with `VITE_API_BASE=`
- [ ] Create `client/.env.local` (gitignored) for local dev
- [ ] Create `api/.env.example` with `JWT_SECRET_KEY=` and `FRONTEND_ORIGIN=`
- [ ] Update `.gitignore` to exclude `.env.local` and `.env`
- [ ] Update README with env setup instructions

**Files to create:**
- `client/.env.example`
- `api/.env.example`
- Update `client/.gitignore` and `api/.gitignore` (or root `.gitignore`)

---

### 🐛 Bug Fixes (Day 1 - Afternoon)

#### Task 4: Fix backend error handling
**Type:** Backend  
**Time:** 30-45 min

- [ ] Add try-catch blocks to all route handlers
- [ ] Add database rollback on errors (`db.session.rollback()`)
- [ ] Create error handler middleware for consistent error responses
- [ ] Test error scenarios (invalid JSON, missing fields, etc.)

**Files to modify:**
- `api/app.py`

**Example pattern:**
```python
@app.post("/api/todos")
@jwt_required()
def add_todo():
    try:
        uid = int(get_jwt_identity())
        data = request.get_json(force=True) or {}
        # ... rest of logic
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500
```

---

#### Task 5: Add password validation
**Type:** Backend  
**Time:** 20-30 min

- [ ] Add minimum length check (8 characters)
- [ ] Return clear error message if password too short
- [ ] Optionally add basic complexity (at least one letter, one number)

**Files to modify:**
- `api/app.py` (register and login endpoints)

**Example:**
```python
if len(password) < 8:
    return jsonify({"error": "Password must be at least 8 characters"}), 400
```

---

#### Task 6: Require JWT_SECRET_KEY in production
**Type:** Backend  
**Time:** 10-15 min

- [ ] Check if `JWT_SECRET_KEY` is set and not default value
- [ ] Raise error on app startup if missing in production
- [ ] Add helpful error message

**Files to modify:**
- `api/app.py`

**Example:**
```python
jwt_secret = os.environ.get("JWT_SECRET_KEY")
if not jwt_secret or jwt_secret == "dev-secret-change-me":
    if os.environ.get("FLASK_ENV") == "production":
        raise ValueError("JWT_SECRET_KEY must be set in production")
```

---

### 🎨 Frontend Improvements (Day 2)

#### Task 7: Create Auth Context
**Type:** Frontend  
**Time:** 1-2 hours

- [ ] Create `src/contexts/AuthContext.jsx`
- [ ] Create `AuthProvider` component with:
  - `user` state
  - `loading` state
  - `login`, `logout`, `register` functions
  - Auto-load user on mount if token exists
- [ ] Wrap app in `AuthProvider` in `main.jsx`
- [ ] Replace all `getToken()` calls with `useAuth()` hook
- [ ] Update `PrivateRoute` to use context
- [ ] Update `Navbar` to use context

**Files to create:**
- `client/src/contexts/AuthContext.jsx`

**Files to modify:**
- `client/src/main.jsx`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/RegisterPage.jsx`
- `client/src/components/Navbar.jsx`
- `client/src/pages/TodosPage.jsx` (if it checks auth)

---

#### Task 8: Replace alert() with toast notifications
**Type:** Frontend  
**Time:** 1-2 hours

- [ ] Install a toast library: `npm install react-hot-toast`
- [ ] Create `ToastProvider` wrapper in `main.jsx`
- [ ] Replace all `alert()` calls with `toast.error()` or `toast.success()`
- [ ] Add toast for successful operations (todo added, deleted, etc.)
- [ ] Style toasts to match app theme

**Files to modify:**
- `client/src/pages/TodosPage.jsx`
- `client/src/pages/LoginPage.jsx` (if any alerts)
- `client/src/pages/RegisterPage.jsx` (if any alerts)
- `client/src/main.jsx` (add provider)

**Example:**
```jsx
import toast from 'react-hot-toast';

// Replace: alert('Failed to add')
// With: toast.error('Failed to add todo');
```

---

#### Task 9: Improve error display UI
**Type:** Frontend  
**Time:** 30-45 min

- [ ] Create reusable `ErrorMessage` component
- [ ] Replace inline error `<p>` tags with component
- [ ] Add consistent styling (red background, icon, etc.)
- [ ] Add dismiss button for errors
- [ ] Use toast for transient errors, component for form errors

**Files to create:**
- `client/src/components/ErrorMessage.jsx`

**Files to modify:**
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/RegisterPage.jsx`
- `client/src/pages/TodosPage.jsx`

---

#### Task 10: Add basic styling improvements
**Type:** Frontend  
**Time:** 1-2 hours

- [ ] Create `src/styles/` directory
- [ ] Create `variables.css` for colors, spacing, etc.
- [ ] Create `components.css` for reusable component styles
- [ ] Replace most inline styles with CSS classes
- [ ] Add hover states, transitions
- [ ] Improve spacing and typography
- [ ] Make it responsive (mobile-friendly)

**Files to create:**
- `client/src/styles/variables.css`
- `client/src/styles/components.css`

**Files to modify:**
- `client/src/index.css`
- All component files (remove inline styles, add classes)

**Example structure:**
```css
/* variables.css */
:root {
  --color-primary: #646cff;
  --color-error: #crimson;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --border-radius: 8px;
}
```

---

### 🔒 Security & Cleanup (Day 3)

#### Task 11: Add input sanitization
**Type:** Backend  
**Time:** 30-45 min

- [ ] Install `bleach` or use `html.escape` for todo titles
- [ ] Sanitize user input before saving
- [ ] Add max length validation (e.g., 500 chars for todos)
- [ ] Validate email format properly (use regex or library)

**Files to modify:**
- `api/app.py`

**Example:**
```python
import html

title = html.escape((data.get("title") or "").strip())
if len(title) > 500:
    return jsonify({"error": "Title too long"}), 400
```

---

#### Task 12: Add email validation
**Type:** Backend  
**Time:** 15-20 min

- [ ] Add proper email regex validation
- [ ] Or use `email-validator` library
- [ ] Return clear error if email format invalid

**Files to modify:**
- `api/app.py`

**Example:**
```python
import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
if not EMAIL_REGEX.match(email):
    return jsonify({"error": "Invalid email format"}), 400
```

---

#### Task 13: Clean up unused files
**Type:** Frontend  
**Time:** 10-15 min

- [ ] Delete `client/src/App.jsx` (unused)
- [ ] Delete or clean up `client/src/App.css` (unused)
- [ ] Remove unused imports from all files
- [ ] Run ESLint to find unused variables

**Files to delete:**
- `client/src/App.jsx`
- `client/src/App.css` (or clean it up if keeping)

---

#### Task 14: Add loading states consistently
**Type:** Frontend  
**Time:** 30-45 min

- [ ] Create `LoadingSpinner` component
- [ ] Add loading state to all async operations
- [ ] Disable buttons during loading
- [ ] Show spinner instead of "Loading..." text

**Files to create:**
- `client/src/components/LoadingSpinner.jsx`

**Files to modify:**
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/RegisterPage.jsx`
- `client/src/pages/TodosPage.jsx`

---

#### Task 15: Add form validation feedback
**Type:** Frontend  
**Time:** 30-45 min

- [ ] Add visual feedback for invalid form fields
- [ ] Show error messages below inputs

- [ ] Disable submit button until form is valid
- [ ] Add `required` attributes where needed
- [ ] Add email type validation in browser

**Files to modify:**
- `client/src/components/LoginForm.jsx`
- `client/src/pages/RegisterPage.jsx`

---

### 🚀 Portfolio Upgrade (Weeks 1–3)

These tasks are meant to be done **in this repo** (so your existing portfolio project becomes “job-ready”).  
Start the next bigger project (e.g. outreach bot) in a **new repo** after these are in place.

#### Task 16: Add backend tests (pytest)
**Type:** Backend  
**Time:** 2-4 hours

- [ ] Add `pytest` to backend dev deps
- [ ] Create `api/tests/` and a test setup (test app + test DB)
- [ ] Test auth: register → login → `/api/me`
- [ ] Test todos: create todo → list → toggle → delete
- [ ] Test at least one unhappy path: missing token → 401

**Files to create/modify (example):**
- `api/tests/test_auth.py`
- `api/tests/test_todos.py`
- `api/conftest.py` or `api/tests/conftest.py`
- `api/requirements.txt` (or equivalent)

---

#### Task 17: Add minimal frontend tests (Vitest)
**Type:** Frontend  
**Time:** 1-2 hours

- [ ] Add `vitest` + `@testing-library/react`
- [ ] Add `npm` scripts: `test`, `test:watch`
- [ ] Test at least:
  - Login form validation (shows error / disables submit)
  - Todos page render state (empty text)

**Files to create/modify (example):**
- `client/src/components/LoginForm.test.jsx`
- `client/vitest.config.js` (if needed)
- `client/package.json`

---

#### Task 18: Add Postgres + migrations (Alembic) + Docker Compose
**Type:** Backend + DevOps  
**Time:** 3-6 hours

- [ ] Add Postgres for local dev via `docker-compose.yml`
- [ ] Add Alembic migrations and create the first migration
- [ ] Make backend configurable via `DATABASE_URL`
- [ ] Update README: “Run with Docker” and “Run migrations”

**Files to create/modify (example):**
- `docker-compose.yml`
- `api/alembic.ini`, `api/migrations/`
- `api/app.py` (or new `api/config.py`)
- `README.md`

---

#### Task 19: Add CI (GitHub Actions)
**Type:** Tooling  
**Time:** 30-90 min

- [ ] Run backend tests on every push/PR
- [ ] Run frontend lint (and tests if added)
- [ ] Fail the build if tests/lint fail

**Files to create:**
- `.github/workflows/ci.yml`

---

#### Task 20: Refactor Flask app structure (Blueprints)
**Type:** Backend  
**Time:** 2-6 hours

- [ ] Split `api/app.py` into modules:
  - auth routes
  - todos routes
  - config
  - extensions (db/jwt init)
- [ ] Keep behavior the same (no new features), just structure
- [ ] Update imports and make sure tests still pass

**Example structure:**
- `api/app.py` (app factory only)
- `api/routes/auth.py`
- `api/routes/todos.py`
- `api/extensions.py`
- `api/config.py`

---

## ✅ V1 “Publish-Ready” Checklist (Minimum Signals)

If you want this repo to be a strong **V1 portfolio project**, focus on these first.

### Must-have (high ROI, not “slow you down”)
- [ ] Backend tests: `pytest` coverage for auth + todos (happy path + one 401) (Task 16)
- [ ] CI: GitHub Actions runs backend tests + frontend lint automatically (Task 19)
- [ ] README: clear “how to run”, env vars, architecture overview, endpoints list
- [ ] Clean repo: no local DB files tracked, no secrets committed, consistent scripts

### Nice-to-have (still V1, do if time)
- [ ] Docker Compose (API + Postgres) for reproducible local setup (Task 18)
- [ ] Migrations (Alembic) if you move to Postgres (Task 18)
- [ ] Minimal frontend tests (Vitest) (Task 17)
- [ ] Refactor into Blueprints for structure (Task 20)

## 🧭 V2 / Next Projects (New Repos)

Keep V1 focused. These are great, but don’t let them distract you before you ship the V1 signals (tests + CI) here.

- Django + HTMX + Alpine + Postgres + Docker (vibecoding guide): good learning, but finish V1 signals first.
- “Waterfall enrichment tool”: excellent second project (integrations + async jobs + data pipeline).
- WhatsApp/Telegram outreach bot: great but bigger/legal/business constraints; start with Telegram MVP first.

## Simple Tracking System (No Notion Needed)

If you feel lost, keep it simple and consistent:

- **Daily**: write 3 bullets somewhere you always have (phone notes app + paper is fine)
  - 1 “build” task (project)
  - 1 “practice” task (DS&A or SQL)
  - 1 “learn” task (read a doc and write 5 lines in notes)
- **Weekly**: one checklist (can be a plain markdown file)
  - Pick 2-3 tasks from this plan and finish them
  - Don’t start new tasks until you finish the current ones

If you want this inside the repo, add:
- `docs/ROADMAP.md` (weekly goals)
- `docs/LEARNING_LOG.md` (short notes: what/why/example)

## Summary by Type

**Tooling (3 tasks):** ~1-2 hours
- Prettier setup
- ESLint configuration
- Environment variables

**Backend (5 tasks):** ~2-3 hours
- Error handling
- Password validation
- JWT secret check
- Input sanitization
- Email validation

**Frontend (7 tasks):** ~5-7 hours
- Auth Context
- Toast notifications
- Error UI component
- Styling improvements
- Cleanup unused files
- Loading states
- Form validation

**Total estimated time:** 8-12 hours (spread over 3-7 days)

---

## Daily Breakdown (Suggested)

### Day 1: Tooling + Backend Basics
- Tasks 1-3 (Tooling setup)
- Tasks 4-6 (Backend fixes)

### Day 2: Frontend Core
- Task 7 (Auth Context) - Most important!
- Task 8 (Toast notifications)
- Task 9 (Error UI)

### Day 3: Polish
- Task 10 (Styling)
- Tasks 11-12 (Security)
- Tasks 13-15 (Cleanup & UX)

---

## Quick Reference: File Changes

### New Files to Create:
1. `client/.prettierrc`
2. `client/.env.example`
3. `api/.env.example`
4. `client/src/contexts/AuthContext.jsx`
5. `client/src/components/ErrorMessage.jsx`
6. `client/src/components/LoadingSpinner.jsx`
7. `client/src/styles/variables.css`
8. `client/src/styles/components.css`

### Files to Delete:
1. `client/src/App.jsx`
2. `client/src/App.css` (optional)

### Files to Modify:
- `api/app.py` (multiple tasks)
- `client/src/main.jsx`
- `client/src/pages/*.jsx` (all pages)
- `client/src/components/*.jsx` (all components)
- `client/package.json`
- `client/eslint.config.js`
- `.gitignore`

---

## Tips

1. **Start with Task 7 (Auth Context)** - It's the most impactful change
2. **Do tooling first** - Makes everything else easier
3. **Test after each task** - Don't break what works
4. **Commit frequently** - One commit per task
5. **Use feature branches** - `git checkout -b task-7-auth-context`

Good luck! 🚀
