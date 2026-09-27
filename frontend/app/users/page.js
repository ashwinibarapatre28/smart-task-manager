"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function UsersPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [search, setSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [addingUser, setAddingUser] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("taskflowUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    loadData();
  }, [router]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, tasksResponse] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/tasks`),
      ]);

      const usersData = await usersResponse.json();
      const tasksData = await tasksResponse.json();

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message || "Failed to load users"
        );
      }

      if (!tasksResponse.ok) {
        throw new Error(
          tasksData.message || "Failed to load tasks"
        );
      }

      setUsers(usersData);
      setTasks(tasksData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getUserTasks(userId) {
    return tasks.filter(
      (task) => task.assignedTo === userId
    );
  }

  const filteredUsers = users.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.name.toLowerCase().includes(searchText) ||
      item.email.toLowerCase().includes(searchText)
    );
  });

  async function handleAddUser(event) {
    event.preventDefault();

    setAddingUser(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create user"
        );
      }

      setSuccess("User added successfully.");

      setNewUser({
        name: "",
        email: "",
        password: "",
      });

      setShowAddUser(false);

      await loadData();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingUser(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("taskflowUser");
    router.push("/login");
  }

  function handleAddTask(userId) {
    router.push(`/tasks?assignedTo=${userId}`);
  }

  function handleRemoveUser() {
    alert(
      "User removal is not available yet because the backend does not provide a DELETE user API."
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Sidebar user={user} onLogout={handleLogout} />

        <main className="min-h-screen md:ml-[264px]">
          <div className="p-6 md:p-10">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm text-slate-400">
                Loading users...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="min-h-screen md:ml-[264px]">
        {/* Top Workspace Header */}
        <header className="border-b border-slate-800 bg-[#020617]">
          <div className="flex items-center justify-between px-6 py-4 md:px-10">
            <div>
              <p className="text-sm font-medium text-indigo-400">
                Workspace
              </p>

              <h1 className="mt-1 text-xl font-bold text-white">
                Users
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddUser(true);
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <span className="text-lg">+</span>
              Add User
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10">
          <div className="mx-auto max-w-7xl">

            {/* Page Heading */}
            <div className="mb-8">
              <p className="text-sm font-medium text-indigo-400">
                Team Management
              </p>

              <h2 className="mt-1 text-3xl font-bold text-white">
                Users
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                View and manage all users in your TaskFlow workspace.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 rounded-xl border border-emerald-800 bg-emerald-950/40 px-5 py-4 text-sm text-emerald-300">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-800 bg-red-950/40 px-5 py-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Statistics Cards */}
            <div className="mb-6 grid gap-5 md:grid-cols-3">

              {/* Total Users */}
              <div className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-5">
                <p className="text-sm text-slate-400">
                  Total Users
                </p>

                <p className="mt-3 text-3xl font-bold text-white">
                  {users.length}
                </p>
              </div>

              {/* Current User */}
              <div className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-5">
                <p className="text-sm text-slate-400">
                  Current User
                </p>

                <p className="mt-3 text-lg font-bold text-white">
                  {user?.name || "Unknown"}
                </p>
              </div>

              {/* Workspace Status */}
              <div className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-5">
                <p className="text-sm text-slate-400">
                  Workspace Status
                </p>

                <p className="mt-3 text-lg font-bold text-emerald-400">
                  Active
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6 rounded-2xl border border-slate-800 bg-[#111827] p-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search users by name or email..."
                  className="w-full rounded-xl border border-slate-700 bg-[#1e293b] py-4 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] shadow-xl">

              {/* Table Header */}
              <div className="hidden grid-cols-[1.4fr_2.5fr_1.2fr_1.4fr] border-b border-slate-800 bg-[#0f172a] px-6 py-4 text-sm font-semibold text-slate-400 md:grid">
                <div>User</div>
                <div>Assigned Tasks</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* No Users */}
              {filteredUsers.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="text-4xl">👥</div>

                  <h3 className="mt-4 font-semibold text-white">
                    No users found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {search
                      ? "Try a different search term."
                      : "Add a user to get started."}
                  </p>
                </div>
              ) : (
                filteredUsers.map((userItem) => {
                  const userTasks = getUserTasks(userItem.id);

                  return (
                    <div
                      key={userItem.id}
                      className="border-b border-slate-800 px-5 py-6 last:border-b-0 md:px-6"
                    >
                      <div className="grid gap-6 md:grid-cols-[1.4fr_2.5fr_1.2fr_1.4fr] md:items-center">

                        {/* User */}
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-lg font-semibold text-indigo-400">
                            {userItem.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-semibold text-white">
                              {userItem.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {userTasks.length}{" "}
                              {userTasks.length === 1
                                ? "task"
                                : "tasks"}
                            </p>
                          </div>
                        </div>

                        {/* Assigned Tasks */}
                        <div>
                          {userTasks.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No tasks assigned
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {userTasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="text-sm text-slate-300"
                                >
                                  {task.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          {userTasks.length === 0 ? (
                            <span className="text-sm text-slate-600">
                              -
                            </span>
                          ) : (
                            <div className="space-y-3">
                              {userTasks.map((task) => (
                                <StatusBadge
                                  key={task.id}
                                  status={task.status}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAddTask(userItem.id)
                            }
                            className="rounded-lg border border-slate-700 bg-[#111827] px-4 py-2 text-sm font-medium text-indigo-400 transition hover:border-indigo-500 hover:bg-indigo-500/10"
                          >
                            + Task
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveUser(userItem)
                            }
                            className="rounded-lg border border-slate-700 bg-[#111827] px-4 py-2 text-sm font-medium text-red-400 transition hover:border-red-500 hover:bg-red-500/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            <p className="mt-5 text-sm text-slate-500">
              Showing {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "user"
                : "users"}
            </p>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Add User
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Create a new TaskFlow user.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="text-xl text-slate-500 transition hover:text-white"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddUser}
              className="space-y-5"
            >

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Name
                </label>

                <input
                  type="text"
                  value={newUser.name}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter user name"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Email
                </label>

                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      email: event.target.value,
                    })
                  }
                  placeholder="Enter email address"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>

                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      password: event.target.value,
                    })
                  }
                  placeholder="Create password"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-[#020617] px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingUser}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingUser
                    ? "Adding..."
                    : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "DONE") {
    return (
      <span className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
        Done
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-md bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-300">
      To Do
    </span>
  );
}

function Sidebar({ user, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[264px] border-r border-slate-800 bg-[#0f172a] md:block">

      <div className="flex h-[124px] items-center border-b border-slate-800 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            ✓
          </div>

          <span className="text-xl font-bold text-white">
            TaskFlow
          </span>
        </div>
      </div>

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
        />

        <SidebarLink
          href="/users"
          icon="♧"
          label="Users"
          active
        />
      </nav>

      <div className="absolute bottom-0 left-0 w-full border-t border-slate-800 p-5">

        {user && (
          <div className="mb-5 flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
              {user.name
                ?.charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
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