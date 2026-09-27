# Smart Task Manager

A full-stack task management web application designed to help users create, assign, organize, and track tasks efficiently. The application supports task priorities, statuses, user assignment, task dependencies, blocked-task detection, and dashboard-based tracking.

The project is built with **Next.js and React** on the frontend and **Node.js with Express.js** on the backend, using lightweight in-memory storage.

---

## Overview

Smart Task Manager provides a simple and intuitive workspace for managing tasks across multiple users.

Users can:

- Create and manage tasks
- Assign tasks to users
- Set task priorities
- Track task status
- Define dependencies between tasks
- Identify blocked tasks
- View their assigned tasks
- Manage users
- Update and delete tasks
- Monitor task progress through a dashboard

The backend exposes REST APIs that are consumed by the Next.js frontend.

---

## Key Features

### User Management

- User registration
- Mock user login
- View all users
- View individual user details
- Assign tasks to registered users
- Duplicate email validation

### Task Management

- Create new tasks
- Edit existing tasks
- Delete tasks
- View all tasks
- Assign tasks to users
- View tasks assigned to the current user
- Update task status
- Set task priority
- Add task descriptions
- Track task creation and modification timestamps

### Task Priorities

Each task can have one of three priority levels:

- **Low**
- **Medium**
- **High**

### Task Status

Each task can have one of three statuses:

- **To Do**
- **In Progress**
- **Done**

### Task Dependencies

Tasks can depend on other tasks.

A dependent task cannot be marked as **Done** until all of its required dependency tasks are completed.

Example:

```text
Design Login Page
        │
        ▼
Implement Login API
        │
        ▼
Integrate Login
```

If a dependency is incomplete, the dependent task is automatically identified as **Blocked**.

### Dashboard

The dashboard provides an overview of the task management workspace, including task progress and relevant task information.

### Task Views

The application provides dedicated views for:

- All Tasks
- My Tasks
- Blocked Tasks
- Users
- Dashboard

---

## Technology Stack

### Frontend

- Next.js
- React
- JavaScript
- JSX
- Tailwind CSS
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- JavaScript
- REST API
- CORS

### Storage

- In-memory storage
- JavaScript `Map`

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

---

## System Architecture

```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Next.js Frontend  │
                         │   React + JavaScript │
                         └──────────┬───────────┘
                                    │
                              REST API Calls
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Express Backend   │
                         │       Node.js        │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │   Users Routes   │                │   Tasks Routes   │
        └────────┬─────────┘                └────────┬─────────┘
                 │                                   │
                 └────────────────┬──────────────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │   In-Memory Storage  │
                       │   JavaScript Maps    │
                       └──────────────────────┘
```

---

## Project Structure

```text
smart-task-manager/
│
├── backend/
│   ├── src/
│   │   ├── data/
│   │   │   └── store.js
│   │   │
│   │   └── routes/
│   │       ├── users.js
│   │       └── tasks.js
│   │
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.js
│   │   ├── register/
│   │   │   └── page.js
│   │   ├── dashboard/
│   │   │   └── page.js
│   │   ├── tasks/
│   │   │   └── page.js
│   │   ├── my-tasks/
│   │   │   └── page.js
│   │   ├── blocked/
│   │   │   └── page.js
│   │   ├── users/
│   │   │   └── page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   │
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---