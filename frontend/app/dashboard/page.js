"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("taskflowUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    loadTasks();
  }, [router]);

  async function loadTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const data = await response.json();

      if (response.ok) {
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("taskflowUser");
    router.push("/login");
  }

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter(
    (task) => task.status === "TODO"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "DONE"
  ).length;

  const blockedTasks = tasks.filter(
    (task) => task.blocked
  ).length;

  const completionPercentage =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const displayName = user?.name
    ? user.name.split(" ")[0]
    : "User";

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ================= SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[264px] border-r border-slate-800 bg-[#0f172a] md:block">

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
            active
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
          />

          <SidebarLink
            href="/users"
            icon="♧"
            label="Users"
          />

        </nav>

        {/* USER AREA */}

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

        {/* TOP BAR */}

        <header className="flex h-[80px] items-center justify-between border-b border-slate-800 px-6 md:px-8">

          <div>
            <p className="text-sm text-slate-500">
              Workspace
            </p>

            <p className="font-semibold">
              Task Management
            </p>
          </div>

          <Link
            href="/tasks"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold transition hover:bg-indigo-700"
          >
            <span className="text-lg">+</span>
            New Task
          </Link>

        </header>

        {/* CONTENT */}

        <section className="mx-auto max-w-[1400px] px-6 py-8 md:px-12">

          {/* WELCOME */}

          <div className="mb-8">

            <p className="text-sm font-medium text-indigo-400">
              Overview
            </p>

            <h1 className="mt-1 text-3xl font-bold md:text-4xl">
              Welcome, {displayName} 👋
            </h1>

            <p className="mt-2 text-slate-400">
              Here's what's happening with your tasks today.
            </p>

          </div>

          {/* STATISTICS */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <StatCard
              title="Total Tasks"
              value={totalTasks}
              icon="☷"
            />

            <StatCard
              title="To Do"
              value={todoTasks}
              icon="○"
            />

            <StatCard
              title="In Progress"
              value={inProgressTasks}
              icon="◷"
            />

            <StatCard
              title="Completed"
              value={completedTasks}
              icon="✓"
            />

            <StatCard
              title="Blocked"
              value={blockedTasks}
              icon="△"
            />

          </div>

          {/* RECENT TASKS */}

          <section className="mt-9">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Recent Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest activity in your workspace
                </p>
              </div>

              <Link
                href="/tasks"
                className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
              >
                View all
              </Link>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">

              {loading ? (
                <div className="p-10 text-center text-slate-500">
                  Loading tasks...
                </div>
              ) : tasks.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  No tasks available.
                </div>
              ) : (
                <div>
                  {tasks.slice(0, 5).map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                    />
                  ))}
                </div>
              )}

            </div>

          </section>

          {/* BOTTOM CARDS */}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            {/* COMPLETION */}

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

              <h2 className="text-lg font-bold">
                Completion Progress
              </h2>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-800">

                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />

              </div>

              <p className="mt-4 text-sm text-slate-400">
                {completedTasks} of {totalTasks} tasks completed
              </p>

            </div>

            {/* DEPENDENCY */}

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold">
                    Dependency Status
                  </h2>

                  <p className="mt-6 text-3xl font-bold">
                    {blockedTasks}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Blocked tasks
                  </p>

                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-500/10 text-2xl text-yellow-400">
                  △
                </div>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


/* ================= SIDEBAR LINK ================= */

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


/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">

      <div className="flex items-start justify-between">

        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-xl text-indigo-400">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}


/* ================= TASK ITEM ================= */

function TaskItem({ task }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800 p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <h3 className="font-medium">
          {task.title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {task.description || "No description"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">

        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {formatStatus(task.status)}
        </span>

        <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-xs text-indigo-300">
          {task.priority}
        </span>

        {task.blocked && (
          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
            Blocked
          </span>
        )}

      </div>

    </div>
  );
}


/* ================= STATUS ================= */

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