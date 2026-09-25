const express = require("express");
const { tasks, users } = require("../data/store");

const router = express.Router();

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Check whether all dependencies are completed
function areDependenciesComplete(task) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return true;
  }

  return task.dependencies.every((dependencyId) => {
    const dependency = tasks.get(dependencyId);

    return dependency && dependency.status === "DONE";
  });
}

// Check whether a task is blocked
function isTaskBlocked(task) {
  if (!task.dependencies || task.dependencies.length === 0) {
    return false;
  }

  return !areDependenciesComplete(task);
}

// Format task response
function formatTask(task) {
  return {
    ...task,
    blocked: isTaskBlocked(task),
  };
}

// Check whether user exists
function userExists(userId) {
  return users.has(userId);
}

// =====================================================
// GET ALL TASKS
// =====================================================

router.get("/", (req, res) => {
  const taskList = Array.from(tasks.values()).map(formatTask);

  res.json(taskList);
});

// =====================================================
// GET TASKS FOR A USER
// IMPORTANT: Keep this before GET /:id
// =====================================================

router.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  if (!users.has(userId)) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  const userTasks = Array.from(tasks.values())
    .filter((task) => task.assignedTo === userId)
    .map(formatTask);

  res.json(userTasks);
});

// =====================================================
// GET TASK BY ID
// =====================================================

router.get("/:id", (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  res.json(formatTask(task));
});

// =====================================================
// CREATE TASK
// =====================================================

router.post("/", (req, res) => {
  const {
    title,
    description = "",
    priority = "MEDIUM",
    status = "TODO",
    assignedTo,
    dependencies = [],
  } = req.body;

  // Validate title
  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Task title is required",
    });
  }

  // Validate priority
  const validPriorities = ["LOW", "MEDIUM", "HIGH"];

  if (!validPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Priority must be LOW, MEDIUM or HIGH",
    });
  }

  // Validate status
  const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be TODO, IN_PROGRESS or DONE",
    });
  }

  // Validate assigned user
  if (!assignedTo) {
    return res.status(400).json({
      message: "Assigned user is required",
    });
  }

  if (!userExists(assignedTo)) {
    return res.status(400).json({
      message: "Assigned user does not exist",
    });
  }

  // Validate dependencies
  if (!Array.isArray(dependencies)) {
    return res.status(400).json({
      message: "Dependencies must be an array",
    });
  }

  for (const dependencyId of dependencies) {
    if (!tasks.has(dependencyId)) {
      return res.status(400).json({
        message: `Dependency task ${dependencyId} does not exist`,
      });
    }
  }

  // A new task cannot be DONE if dependencies are incomplete
  if (status === "DONE" && !areDependenciesComplete({ dependencies })) {
    return res.status(400).json({
      message: "Task is blocked by incomplete dependencies",
    });
  }

  const taskId = `task-${Date.now()}`;
  const now = new Date().toISOString();

  const newTask = {
    id: taskId,
    title: title.trim(),
    description: description.trim(),
    priority,
    status,
    assignedTo,
    dependencies,
    createdAt: now,
    updatedAt: now,
  };

  tasks.set(taskId, newTask);

  res.status(201).json({
    message: "Task created successfully",
    task: formatTask(newTask),
  });
});

// =====================================================
// UPDATE TASK
// =====================================================

router.put("/:id", (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const {
    title,
    description,
    priority,
    status,
    assignedTo,
    dependencies,
  } = req.body;

  if (title !== undefined && !title.trim()) {
    return res.status(400).json({
      message: "Task title cannot be empty",
    });
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH"];

  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({
      message: "Priority must be LOW, MEDIUM or HIGH",
    });
  }

  const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be TODO, IN_PROGRESS or DONE",
    });
  }

  if (assignedTo !== undefined && !userExists(assignedTo)) {
    return res.status(400).json({
      message: "Assigned user does not exist",
    });
  }

  if (dependencies !== undefined) {
    if (!Array.isArray(dependencies)) {
      return res.status(400).json({
        message: "Dependencies must be an array",
      });
    }

    if (dependencies.includes(task.id)) {
      return res.status(400).json({
        message: "A task cannot depend on itself",
      });
    }

    for (const dependencyId of dependencies) {
      if (!tasks.has(dependencyId)) {
        return res.status(400).json({
          message: `Dependency task ${dependencyId} does not exist`,
        });
      }
    }
  }

  const updatedTask = {
    ...task,
    title: title !== undefined ? title.trim() : task.title,
    description:
      description !== undefined
        ? description.trim()
        : task.description,
    priority: priority !== undefined ? priority : task.priority,
    status: status !== undefined ? status : task.status,
    assignedTo:
      assignedTo !== undefined ? assignedTo : task.assignedTo,
    dependencies:
      dependencies !== undefined ? dependencies : task.dependencies,
    updatedAt: new Date().toISOString(),
  };

  // Prevent completing a blocked task
  if (
    updatedTask.status === "DONE" &&
    !areDependenciesComplete(updatedTask)
  ) {
    return res.status(400).json({
      message: "Task is blocked by incomplete dependencies",
    });
  }

  tasks.set(task.id, updatedTask);

  res.json({
    message: "Task updated successfully",
    task: formatTask(updatedTask),
  });
});

// =====================================================
// DELETE TASK
// =====================================================

router.delete("/:id", (req, res) => {
  const taskId = req.params.id;

  const task = tasks.get(taskId);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  // Don't allow deleting a task used as a dependency
  const dependentTasks = Array.from(tasks.values()).filter(
    (item) =>
      item.id !== taskId &&
      item.dependencies &&
      item.dependencies.includes(taskId)
  );

  if (dependentTasks.length > 0) {
    return res.status(400).json({
      message:
        "Cannot delete this task because another task depends on it",
    });
  }

  tasks.delete(taskId);

  res.json({
    message: "Task deleted successfully",
  });
});

// =====================================================
// UPDATE TASK STATUS
// =====================================================

router.patch("/:id/status", (req, res) => {
  const task = tasks.get(req.params.id);

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const { status } = req.body;

  const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be TODO, IN_PROGRESS or DONE",
    });
  }

  // Prevent completion when dependencies are incomplete
  if (status === "DONE" && !areDependenciesComplete(task)) {
    return res.status(400).json({
      message: "Task is blocked by incomplete dependencies",
    });
  }

  task.status = status;
  task.updatedAt = new Date().toISOString();

  tasks.set(task.id, task);

  res.json({
    message: "Task status updated successfully",
    task: formatTask(task),
  });
});

module.exports = router;