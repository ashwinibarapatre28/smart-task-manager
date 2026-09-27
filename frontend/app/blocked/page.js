"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

export default function BlockedTasksPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");

  useEffect(() => {
    const savedUser = localStorage.getItem("taskflowUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));

    loadBlockedTasks();
  }, [router]);

  async function loadBlockedTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/tasks`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load tasks"
        );
      }

      const blocked = data.filter(
        (task) => task.blocked === true
      );

      setTasks(blocked);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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

    return matchesSearch && matchesPriority;
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
            active
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
            <span>
              ↪
            </span>

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
              Blocked Tasks
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

        {/* CONTENT */}

        <section className="mx-auto max-w-[1450px] px-6 py-10 md:px-12">

          {/* TITLE */}

          <div className="mb-8">

            <p className="text-sm font-medium text-red-400">
              Dependency Tracking
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Blocked Tasks
            </h1>

            <p className="mt-2 text-slate-400">
              Tasks that are waiting for their dependencies
              to be completed.
            </p>

          </div>

          {/* SUMMARY */}

          <div className="mb-6 rounded-2xl border border-red-900/50 bg-red-950/20 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-2xl text-red-400">
                △
              </div>

              <div>

                <p className="text-2xl font-bold">
                  {tasks.length}
                </p>

                <p className="text-sm text-slate-400">
                  Currently blocked tasks
                </p>

              </div>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-800 bg-red-950/40 px-5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* FILTER BAR */}

          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#111827] p-4">

            <div className="grid gap-3 md:grid-cols-[1fr_220px_50px]">

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
                  placeholder="Search blocked tasks..."
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

              {/* RESET */}

              <button
                onClick={() => {
                  setSearch("");
                  setFilterPriority("ALL");
                }}
                className="flex h-[50px] items-center justify-center rounded-xl bg-[#1e293b] text-xl text-slate-400 hover:text-white"
                title="Clear filters"
              >
                ↻
              </button>

            </div>

          </div>

          {/* ================= TASK TABLE ================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">

            {/* HEADER */}

            <div className="hidden grid-cols-[2.5fr_0.8fr_1fr_1.4fr_1fr] border-b border-slate-800 px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500 lg:grid">

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
                Reason
              </div>

            </div>

            {/* CONTENT */}

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                Checking blocked tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-400">
                  ✓
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No blocked tasks
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  All tasks are currently free from
                  incomplete dependencies.
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
                <BlockedTaskRow
                  key={task.id}
                  task={task}
                />
              ))
            )}

          </div>

          {/* COUNT */}

          <p className="mt-5 text-sm text-slate-500">
            Showing {filteredTasks.length} of{" "}
            {tasks.length} blocked tasks
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
/* BLOCKED TASK ROW */
/* ===================================================== */

function BlockedTaskRow({ task }) {
  return (
    <div className="border-b border-slate-800 px-5 py-6 last:border-b-0">

      <div className="grid gap-5 lg:grid-cols-[2.5fr_0.8fr_1fr_1.4fr_1fr] lg:items-center">

        {/* TASK */}

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-semibold">
              {task.title}
            </h3>

            <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
              Blocked
            </span>

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

          <span className="inline-block rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
            {formatStatus(task.status)}
          </span>

        </div>

        {/* DEPENDENCIES */}

        <div>

          {task.dependencies &&
          task.dependencies.length > 0 ? (
            <div className="space-y-1">

              {task.dependencies.map((dependency) => (
                <p
                  key={dependency}
                  className="text-xs text-slate-400"
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

        {/* REASON */}

        <div>

          <p className="text-sm text-red-400">
            Waiting for dependency
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Complete the required task first.
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
/* STATUS FORMAT */
/* ===================================================== */

function formatStatus(status) {
  if (status === "TODO") {
    return "To Do";
  }

  if (status === "IN_PROGRESS") {
    return "In Progress";
  }

  if (status === "DONE") {
    return "Done";
  }

  return status;
}