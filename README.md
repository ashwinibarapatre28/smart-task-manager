# Smart Task Manager

A full-stack Smart Task Manager web application for creating, assigning, tracking, and managing tasks with priorities, statuses, and task dependencies.

The application is built using **Next.js and React** for the frontend and **Node.js with Express.js** for the backend. It uses **in-memory storage** for users and tasks.

---

## Features

### User Management

- User registration
- Mock user login
- View all users
- View user details
- Sequential user IDs
- User assignment for tasks

### Task Management

- Create tasks
- Edit tasks
- Delete tasks
- View all tasks
- Assign tasks to users
- View tasks assigned to the logged-in user
- Update task status
- Set task priority
- Add task descriptions
- Track task creation and update times

### Task Priorities

Tasks can have one of the following priorities:

- Low
- Medium
- High

### Task Status

Tasks can have the following statuses:

- To Do
- In Progress
- Done

### Task Dependencies

The application supports task dependencies.

A task can depend on another task being completed before it can be marked as **Done**.

For example:

```text
Task A: Design Login Page
        ↓
Task B: Implement Login API
        ↓
Task C: Integrate Login Page