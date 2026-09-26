"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

export default function TasksPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    assignedTo: "",
    dependencies: [],
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("taskflowUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));

    loadTasks();
    loadUsers();
  }, [router]);

  async function loadTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("taskflowUser");
    router.push("/login");
  }

  function openCreateForm() {
    setEditingTask(null);

    setForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
      assignedTo: user?.id || "",
      dependencies: [],
    });

    setError("");
    setShowForm(true);
  }

  function openEditForm(task) {
    setEditingTask(task);

    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo,
      dependencies: task.dependencies || [],
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTask(null);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleDependency(taskId) {
    setForm((previous) => {
      if (previous.dependencies.includes(taskId)) {
        return {
          ...previous,
          dependencies: previous.dependencies.filter(
            (id) => id !== taskId
          ),
        };
      }

      return {
        ...previous,
        dependencies: [...previous.dependencies, taskId],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!form.assignedTo) {
      setError("Please select a user");
      return;
    }

    try {
      const url = editingTask
        ? `${API_URL}/tasks/${editingTask.id}`
        : `${API_URL}/tasks`;

      const method = editingTask ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save task");
      }

      await loadTasks();

      closeForm();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDelete(taskId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      await loadTasks();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      await loadTasks();
    } catch (error) {
      setError(error.message);
    }
  }

  function getUserName(userId) {
    const found = users.find((item) => item.id === userId);

    return found ? found.name : "Unknown User";
  }

  const filteredTasks = tasks.filter((task) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      task.title.toLowerCase().includes(searchText) ||
      (task.description || "")
        .toLowerCase()
        .includes(searchText);

    const matchesPriority =
      filterPriority === "ALL" ||
      task.priority === filterPriority;

    const matchesStatus =
      filterStatus === "ALL" ||
      task.status === filterStatus;

    return (
      matchesSearch &&
      matchesPriority &&
      matchesStatus
    );
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ================= SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 hidden h-screen w-[264px] border-r border-slate-800 bg-[#0f172a] md:block">

        {/* LOGO */}

        <div className="flex h-[124px] items-center border-b border-slate-800 px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <span className="text-xl">✓</span>
            </div>

            <span className="text-xl font-bold">
              TaskFlow
            </span>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="space-y-2 px-5 py-6">

          <SidebarLink
            href="/dashboard"
            icon="▦"
            label="Dashboard"
          />

          <SidebarLink
            href="/my-tasks"
            icon="☷"
            label="My Tasks"
          />

          <SidebarLink
            href="/tasks"
            icon="☷"
            label="All Tasks"
            active
          />

          <SidebarLink
            href="/blocked"
            icon="△"
            label="Blocked Tasks"
          />

          <SidebarLink
            href="/users"
            icon="♧"
            label="Users"
          />

        </nav>

        {/* USER */}

        <div className="absolute bottom-0 left-0 w-full border-t border-slate-800 p-5">

          {user && (
            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold">
                  {user.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user.email}
                </p>

              </div>

            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-slate-400 hover:text-white"
          >
            <span>↪</span>
            Sign out
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="md:ml-[264px]">

        {/* TOP HEADER */}

        <header className="flex min-h-[80px] items-center justify-between border-b border-slate-800 px-6 md:px-12">

          <div>

            <p className="text-sm text-indigo-400">
              Workspace
            </p>

            <p className="text-lg font-bold">
              All Tasks
            </p>

          </div>

          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold hover:bg-indigo-700"
          >
            <span className="text-xl">
              +
            </span>

            New Task
          </button>

        </header>

        {/* CONTENT */}

        <section className="mx-auto max-w-[1450px] px-6 py-10 md:px-12">

          {/* TITLE */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold">
              Task Management
            </h1>

            <p className="mt-2 text-slate-400">
              Create, assign, track and manage your team's tasks.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-800 bg-red-950/40 px-5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* ================= FILTER BAR ================= */}

          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#111827] p-4">

            <div className="grid gap-3 md:grid-cols-[1fr_195px_195px_50px]">

              {/* SEARCH */}

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tasks..."
                  className="h-[50px] w-full rounded-xl border border-slate-700 bg-[#1e293b] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                />

              </div>

              {/* PRIORITY */}

              <select
                value={filterPriority}
                onChange={(event) =>
                  setFilterPriority(event.target.value)
                }
                className="h-[50px] rounded-xl border border-slate-700 bg-[#1e293b] px-4 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="ALL">
                  All Priorities
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>

              </select>

              {/* STATUS */}

              <select
                value={filterStatus}
                onChange={(event) =>
                  setFilterStatus(event.target.value)
                }
                className="h-[50px] rounded-xl border border-slate-700 bg-[#1e293b] px-4 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="TODO">
                  To Do
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="DONE">
                  Done
                </option>

              </select>

              {/* FILTER ICON */}

              <button
                onClick={() => {
                  setSearch("");
                  setFilterPriority("ALL");
                  setFilterStatus("ALL");
                }}
                className="flex h-[50px] items-center justify-center rounded-xl bg-[#1e293b] text-xl text-slate-400 hover:text-white"
                title="Clear filters"
              >
                ⚱
              </button>

            </div>

          </div>

          {/* ================= TASK TABLE ================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">

            {/* TABLE HEADER */}

            <div className="hidden grid-cols-[2.8fr_0.8fr_1fr_1.3fr_1.2fr_0.7fr] border-b border-slate-800 px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500 lg:grid">

              <div>
                Task
              </div>

              <div>
                Priority
              </div>

              <div>
                Status
              </div>

              <div>
                Assigned To
              </div>

              <div>
                Dependencies
              </div>

              <div className="text-center">
                Actions
              </div>

            </div>

            {/* TASKS */}

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 text-center">

                <div className="text-4xl">
                  ✓
                </div>

                <h3 className="mt-4 font-semibold">
                  No tasks found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Create a new task to get started.
                </p>

              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskTableRow
                  key={task.id}
                  task={task}
                  userName={getUserName(task.assignedTo)}
                  onEdit={openEditForm}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}

          </div>

          {/* COUNT */}

          <p className="mt-5 text-sm text-slate-500">
            Showing {filteredTasks.length} of{" "}
            {tasks.length} tasks
          </p>

        </section>

      </main>

      {/* ================= CREATE / EDIT MODAL ================= */}

      {showForm && (
        <TaskModal
          form={form}
          setForm={setForm}
          users={users}
          tasks={tasks}
          editingTask={editingTask}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
          onDependencyChange={toggleDependency}
        />
      )}

    </div>
  );
}


/* ===================================================== */
/* SIDEBAR */
/* ===================================================== */

function SidebarLink({
  href,
  icon,
  label,
  active,
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium ${
        active
          ? "bg-indigo-600 text-white"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span className="w-5 text-center text-lg">
        {icon}
      </span>

      {label}
    </Link>
  );
}


/* ===================================================== */
/* TABLE ROW */
/* ===================================================== */

function TaskTableRow({
  task,
  userName,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <div className="border-b border-slate-800 px-5 py-6 last:border-b-0">

      <div className="grid gap-5 lg:grid-cols-[2.8fr_0.8fr_1fr_1.3fr_1.2fr_0.7fr] lg:items-center">

        {/* TASK */}

        <div>

          <h3 className="font-semibold text-white">
            {task.title}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            {task.description || "No description"}
          </p>

        </div>

        {/* PRIORITY */}

        <div>
          <PriorityBadge
            priority={task.priority}
          />
        </div>

        {/* STATUS */}

        <div>

          <select
            value={task.status}
            onChange={(event) =>
              onStatusChange(
                task.id,
                event.target.value
              )
            }
            className={`w-full rounded-lg border border-slate-700 bg-[#1e293b] px-3 py-2 text-xs outline-none ${
              task.status === "DONE"
                ? "text-green-400"
                : task.status === "IN_PROGRESS"
                ? "text-yellow-400"
                : "text-slate-200"
            }`}
          >

            <option value="TODO">
              To Do
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="DONE">
              Done
            </option>

          </select>

          {task.blocked && (
            <p className="mt-2 text-xs text-red-400">
              Blocked
            </p>
          )}

        </div>

        {/* ASSIGNED */}

        <div>

          <p className="text-sm text-slate-200">
            {userName}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {task.assignedTo}
          </p>

        </div>

        {/* DEPENDENCIES */}

        <div>

          {task.dependencies?.length > 0 ? (
            <div className="space-y-1">

              {task.dependencies.map((dependency) => (
                <p
                  key={dependency}
                  className="text-sm text-slate-400"
                >
                  {dependency}
                </p>
              ))}

            </div>
          ) : (
            <span className="text-sm text-slate-500">
              None
            </span>
          )}

        </div>

        {/* ACTIONS */}

        <div className="flex items-center justify-start gap-4 lg:justify-center">

          <button
            onClick={() => onEdit(task)}
            className="text-xl text-slate-400 hover:text-indigo-400"
            title="Edit task"
          >
            ✎
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-lg text-red-500 transition hover:bg-red-500/20 hover:text-red-400"
            title="Delete task"
          >
            🗑️
          </button>

        </div>

      </div>

    </div>
  );
}


/* ===================================================== */
/* PRIORITY */
/* ===================================================== */

function PriorityBadge({ priority }) {
  const styles = {
    LOW: "bg-green-500/10 text-green-400",
    MEDIUM: "bg-yellow-500/10 text-yellow-400",
    HIGH: "bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-block rounded-lg px-3 py-1.5 text-xs font-semibold ${
        styles[priority] || styles.MEDIUM
      }`}
    >
      {priority}
    </span>
  );
}


/* ===================================================== */
/* TASK MODAL */
/* ===================================================== */

function TaskModal({
  form,
  setForm,
  users,
  tasks,
  editingTask,
  onChange,
  onSubmit,
  onClose,
  onDependencyChange,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-[#0f172a]">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">

          <div>
            <h2 className="text-xl font-bold">
              {editingTask
                ? "Edit Task"
                : "New Task"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the task details below.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-white"
          >
            ×
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={onSubmit}
          className="space-y-5 p-6"
        >

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Task Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
              placeholder="Enter task title"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows="4"
              placeholder="Describe the task..."
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
              >
                <option value="LOW">
                  Low
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="HIGH">
                  High
                </option>
              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={onChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
              >
                <option value="TODO">
                  To Do
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="DONE">
                  Done
                </option>
              </select>

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Assigned To
            </label>

            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={onChange}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            >

              <option value="">
                Select user
              </option>

              {users.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm text-slate-300">
              Dependencies
            </label>

            <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-950 p-3">

              {tasks
                .filter(
                  (task) =>
                    !editingTask ||
                    task.id !== editingTask.id
                )
                .map((task) => (
                  <label
                    key={task.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-900"
                  >

                    <input
                      type="checkbox"
                      checked={form.dependencies.includes(
                        task.id
                      )}
                      onChange={() =>
                        onDependencyChange(task.id)
                      }
                      className="h-4 w-4 accent-indigo-600"
                    />

                    <span className="text-sm">
                      {task.title}
                    </span>

                  </label>
                ))}

              {tasks.length === 0 && (
                <p className="text-sm text-slate-500">
                  No other tasks available.
                </p>
              )}

            </div>

          </div>

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700"
            >
              {editingTask
                ? "Update Task"
                : "Create Task"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}