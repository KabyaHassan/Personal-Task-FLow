# Task-Flow

A personal task manager built as a full-stack mini project.

## Tech Stack

- Frontend: Vanilla JavaScript (ES Modules)
- Backend: PHP
- Database: MySQL

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- A local server (XAMPP / WAMP / Laragon / php -S)

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/task-flow.git
cd task-flow
```

### 2. Set up the database
- Create a MySQL database named `taskflow`
- Import the schema:
```bash
mysql -u root -p taskflow < backend/schema.sql
```
- *Note:* The application will automatically attempt to create the `tasks` table on first connection if you configure the database properly.

### 3. Configure environment
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your MySQL credentials (DB_HOST, DB_NAME, DB_USER, DB_PASS)
```

### 4. Start the backend
**Option A — PHP built-in server (recommended):**
From the project root, start the PHP built-in server on port 8000 using the provided router:
```bash
php -S localhost:8000 -t backend/ backend/router.php
```

**Option B — Apache/Nginx (XAMPP/WAMP):**
Place the project in your `htdocs` or `www` directory. You will need to configure URL rewriting to map `/api/*` to `/backend/api/index.php`.

### 5. Start the frontend
Since this uses Vanilla JavaScript without a build step, simply serve the `frontend` folder:

**Option A — VS Code Live Server:**
Open the `frontend` directory in VS Code and use the "Live Server" extension to serve `index.html`.

**Option B — PHP built-in server:**
```bash
cd frontend
php -S localhost:5173
```

### 6. Open the app
Visit the frontend URL (e.g. `http://localhost:5173` or Live Server URL).

## API Routes

| Method | Endpoint               | Description        |
|--------|------------------------|--------------------|
| GET    | /api/tasks             | Get all tasks      |
| POST   | /api/tasks             | Create a task      |
| PUT    | /api/tasks/:id         | Update a task      |
| PATCH  | /api/tasks/:id/toggle  | Toggle task status |
| DELETE | /api/tasks/:id         | Delete a task      |

## Notes

- No authentication required — single-user application
- AI assistance (Claude) was used during development. All code was reviewed and understood.
