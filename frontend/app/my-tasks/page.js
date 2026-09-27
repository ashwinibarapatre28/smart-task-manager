"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

export default function MyTasksPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    const savedUser = localStorage.getItem("taskflowUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    const currentUser = JSON.parse(savedUser);

    setUser(currentUser);

    loadMyTasks(currentUser.id);
  }, [router]);

  async function loadMyTasks(userId) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/tasks/user/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load your tasks"
        );
      }

      setTasks(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      setError("");

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
        throw new Error(
          data.message || "Failed to update task"
        );
      }

      if (user) {
        await loadMyTasks(user.id);
      }
    } catch (error) {
      setError(error.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("taskflowUser");
    router.push("/login");
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
              <span className="text-xl">
                ✓
              </span>
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
            active
          />

          <SidebarLink
            href="/tasks"
            icon="☷"
            label="All Tasks"
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

        {/* USER SECTION */}

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
            <span>
              ↪
            </span>

            Sign out
          </button>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="md:ml-[264px]">

        {/* TOP HEADER */}

        <header className="flex min-h-[80px] items-center justify-between border-b border-slate-800 px-6 md:px-12">

          <div>

            <p className="text-sm text-indigo-400">
              Workspace
            </p>

            <p className="text-lg font-bold">
              My Tasks
            </p>

          </div>

          <Link
            href="/tasks"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold hover:bg-indigo-700"
          >
            <span className="text-xl">
              +
            </span>

            New Task
          </Link>

        </header>

        {/* PAGE CONTENT */}

        <section className="mx-auto max-w-[1450px] px-6 py-10 md:px-12">

          {/* TITLE */}

          <div className="mb-8">

            <p className="text-sm font-medium text-indigo-400">
              Personal Workspace
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              My Tasks
            </h1>

            <p className="mt-2 text-slate-400">
              Tasks assigned to you.
            </p>

          </div>

          {/* USER INFO */}

          {user && (
            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-800 bg-[#111827] p-5">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>

                <p className="font-semibold">
                  {user.name}
                </p>

                <p className="text-sm text-slate-500">
                  {user.email}
                </p>

              </div>

              <div className="ml-auto text-right">

                <p className="text-2xl font-bold">
                  {tasks.length}
                </p>

                <p className="text-xs text-slate-500">
                  Assigned Tasks
                </p>

              </div>

            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-800 bg-red-950/40 px-5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* FILTER BAR */}

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
                  placeholder="Search your tasks..."
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

              {/* CLEAR FILTER */}

              <button
                onClick={() => {
                  setSearch("");
                  setFilterPriority("ALL");
                  setFilterStatus("ALL");
                }}
                className="flex h-[50px] items-center justify-center rounded-xl bg-[#1e293b] text-xl text-slate-400 hover:text-white"
                title="Clear filters"
              >
                ↻
              </button>

            </div>

          </div>

          {/* TASK TABLE */}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">

            {/* TABLE HEADER */}

            <div className="hidden grid-cols-[2.8fr_0.8fr_1fr_1.2fr_1fr] border-b border-slate-800 px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500 lg:grid">

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
                Dependencies
              </div>

              <div>
                Updated
              </div>

            </div>

            {/* TASKS */}

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                Loading your tasks...
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
                  You currently have no tasks matching
                  these filters.
                </p>

                <Link
                  href="/tasks"
                  className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-700"
                >
                  View All Tasks
                </Link>

              </div>
            ) : (
              filteredTasks.map((task) => (
                <MyTaskRow
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}

          </div>

          {/* COUNT */}

          <p className="mt-5 text-sm text-slate-500">
            Showing {filteredTasks.length} of{" "}
            {tasks.length} assigned tasks
          </p>

        </section>

      </main>

    </div>
  );
}


/* ===================================================== */
/* SIDEBAR LINK */
/* ===================================================== */

function SidebarLink({
  href,
  icon,
  label,
  active = false,
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${
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
/* MY TASK ROW */
/* ===================================================== */

function MyTaskRow({
  task,
  onStatusChange,
}) {
  return (
    <div className="border-b border-slate-800 px-5 py-6 last:border-b-0">

      <div className="grid gap-5 lg:grid-cols-[2.8fr_0.8fr_1fr_1.2fr_1fr] lg:items-center">

        {/* TASK */}

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-semibold">
              {task.title}
            </h3>

            {task.blocked && (
              <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                Blocked
              </span>
            )}

          </div>

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

        </div>

        {/* DEPENDENCIES */}

        <div>

          {task.dependencies?.length > 0 ? (
            <span className="text-sm text-slate-400">
              {task.dependencies.length} task
              {task.dependencies.length !== 1
                ? "s"
                : ""}
            </span>
          ) : (
            <span className="text-sm text-slate-500">
              None
            </span>
          )}

        </div>

        {/* UPDATED */}

        <div>

          <p className="text-sm text-slate-400">
            {formatDate(task.updatedAt)}
          </p>

        </div>

      </div>

    </div>
  );
}


/* ===================================================== */
/* PRIORITY BADGE */
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
/* DATE FORMAT */
/* ===================================================== */

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}