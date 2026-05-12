# TaskFlow — Personal Task Manager

A clean, full-stack personal task manager built with Vanilla JavaScript and PHP. Create, read, update, delete, and toggle tasks with optional due-date tracking — all persisted in a MySQL database via a RESTful API.

**Live Demo:** [kabyahassan.42web.io](http://kabyahassan.42web.io)

---

## Tech Stack

| Layer    | Technology                       |
|----------|----------------------------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES Modules) |
| Backend  | PHP 7.4+                        |
| Database | MySQL 5.7+                      |
| Server   | PHP built-in server / Apache    |

---

## Prerequisites

- **PHP** 7.4 or higher (`php -v` to check)
- **MySQL** 5.7 or higher
- A local server environment — any one of:
  - PHP built-in server (recommended, no extra install)
  - XAMPP / WAMP / Laragon

---

## Local Setup (Step-by-Step)

### 1. Clone the Repository

```bash
git clone https://github.com/KabyaHassan/Task_Flow.git
cd Task_Flow
```

### 2. Set Up the Database

Create a MySQL database named `taskflow`:

```sql
CREATE DATABASE taskflow;
```

Then import the schema:

```bash
mysql -u root -p taskflow < backend/schema.sql
```

> **Note:** The application also auto-creates the `tasks` table on first connection, so manual import is optional.

### 3. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_NAME=taskflow
DB_USER=root
DB_PASS=your_mysql_password
DB_PORT=3306
```

See [`.env.example`](backend/.env.example) for the full list of required variables.

### 4. Start the Backend Server

From the **project root** directory:

```bash
php -S localhost:8000 backend/router.php
```

This starts the API at `http://localhost:8000/api/tasks`.

### 5. Start the Frontend

Open a **second terminal** and serve the frontend:

```bash
cd frontend
php -S localhost:5173
```

Or use the VS Code **Live Server** extension on `frontend/index.html`.

### 6. Open the App

Visit [http://localhost:5173](http://localhost:5173) in your browser. The task manager is ready to use!

---

## Project Structure

```
Task_Flow/
├── backend/
│   ├── api/
│   │   └── index.php          # API route handler (CRUD endpoints)
│   ├── config/
│   │   └── database.php       # DB connection + .env parser
│   ├── models/
│   │   └── Task.php           # Task model (prepared statements)
│   ├── .env.example           # Environment variable template
│   ├── .env                   # Local credentials (git-ignored)
│   ├── router.php             # PHP dev-server router + CORS
│   └── schema.sql             # Database schema
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css      # Application styles
│   │   └── js/
│   │       ├── api.js         # API client (fetch wrapper)
│   │       └── app.js         # UI logic and DOM manipulation
│   └── index.html             # Single-page frontend
├── .gitignore
├── .htaccess                  # Apache rewrite rules (production)
├── index.php                  # Root redirect to frontend
└── README.md
```

---

## API Documentation

All endpoints return JSON with a consistent shape:

```json
{ "success": true|false, "message": "...", "data": ... }
```

### Endpoints

| Method   | Endpoint                 | Description          | Status Codes       |
|----------|--------------------------|----------------------|--------------------|
| `GET`    | `/api/tasks`             | List all tasks       | `200 OK`           |
| `POST`   | `/api/tasks`             | Create a new task    | `201 Created`, `400 Bad Request` |
| `PUT`    | `/api/tasks/:id`         | Update a task        | `200 OK`, `400`, `404 Not Found` |
| `PATCH`  | `/api/tasks/:id/toggle`  | Toggle task status   | `200 OK`, `404 Not Found` |
| `DELETE` | `/api/tasks/:id`         | Delete a task        | `200 OK`, `404 Not Found` |

### Request / Response Examples

**Create a task:**
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread", "due_date": "2026-05-15"}'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "due_date": "2026-05-15",
    "created_at": "2026-05-12 10:00:00",
    "updated_at": "2026-05-12 10:00:00"
  }
}
```

**Validation error (400):**
```json
{ "success": false, "message": "Title is required" }
```

---

## Database Schema

```sql
CREATE TABLE tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      ENUM('pending', 'completed') NOT NULL DEFAULT 'pending',
  due_date    DATE DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Environment Variables

| Variable  | Description              | Default     |
|-----------|--------------------------|-------------|
| `DB_HOST` | MySQL server hostname    | `localhost` |
| `DB_NAME` | Database name            | `taskflow`  |
| `DB_USER` | MySQL username           | `root`      |
| `DB_PASS` | MySQL password           | *(empty)*   |
| `DB_PORT` | MySQL port               | `3306`      |

> **Security:** The `.env` file is listed in `.gitignore` and is never committed to version control.

---

## Features

- **Full CRUD** — Create, read, update, and delete tasks
- **Toggle Status** — Mark tasks as pending or completed with one click
- **Due Dates** — Optional due-date field with overdue visual indicators
- **Filter Tabs** — View All, Pending, or Completed tasks
- **Input Validation** — Client-side and server-side (400 errors for missing title)
- **Responsive UI** — Clean, mobile-friendly interface
- **No Authentication** — Single-user application by design
- **Live Deployment** — Hosted on InfinityFree

---

## Notes

- This is a single-user application — no login or authentication is required.
- AI assistance (Claude) was used during development. All code was reviewed and understood.
- Credentials are stored in `.env` and never hardcoded in source files.
- All database queries use **prepared statements** to prevent SQL injection.
