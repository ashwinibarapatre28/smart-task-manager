"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

export default function UsersPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("taskflowUser");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    setCurrentUser(JSON.parse(savedUser));

    loadUsers();
  }, [router]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load users"
        );
      }

      setUsers(data);
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

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText)
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

        {/* USER SECTION */}

        <div className="absolute bottom-0 left-0 w-full border-t border-slate-800 p-5">

          {currentUser && (
            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold">
                  {currentUser.name}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {currentUser.email}
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
              Users
            </p>

          </div>

          <Link
            href="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold hover:bg-indigo-700"
          >
            <span className="text-xl">
              +
            </span>

            Add User
          </Link>

        </header>

        {/* CONTENT */}

        <section className="mx-auto max-w-[1450px] px-6 py-10 md:px-12">

          {/* TITLE */}

          <div className="mb-8">

            <p className="text-sm font-medium text-indigo-400">
              Team Management
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Users
            </h1>

            <p className="mt-2 text-slate-400">
              View all users in your TaskFlow workspace.
            </p>

          </div>

          {/* USER COUNT */}

          <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">

              <p className="text-sm text-slate-400">
                Total Users
              </p>

              <p className="mt-3 text-3xl font-bold">
                {users.length}
              </p>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">

              <p className="text-sm text-slate-400">
                Current User
              </p>

              <p className="mt-3 truncate text-lg font-semibold">
                {currentUser?.name || "—"}
              </p>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5">

              <p className="text-sm text-slate-400">
                Workspace Status
              </p>

              <p className="mt-3 text-lg font-semibold text-green-400">
                Active
              </p>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-800 bg-red-950/40 px-5 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* SEARCH */}

          <div className="mb-6 rounded-2xl border border-slate-800 bg-[#111827] p-4">

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
                placeholder="Search users by name or email..."
                className="h-[50px] w-full rounded-xl border border-slate-700 bg-[#1e293b] pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
              />

            </div>

          </div>

          {/* USERS */}

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#111827]">

            {/* TABLE HEADER */}

            <div className="hidden grid-cols-[2fr_2fr_1fr] border-b border-slate-800 px-6 py-4 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">

              <div>
                User
              </div>

              <div>
                Email
              </div>

              <div>
                Account
              </div>

            </div>

            {/* USERS LIST */}

            {loading ? (
              <div className="p-12 text-center text-slate-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">

                <div className="text-4xl">
                  ♧
                </div>

                <h3 className="mt-4 font-semibold">
                  No users found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try a different search term.
                </p>

              </div>
            ) : (
              filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                />
              ))
            )}

          </div>

          <p className="mt-5 text-sm text-slate-500">
            Showing {filteredUsers.length} of{" "}
            {users.length} users
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
/* USER ROW */
/* ===================================================== */

function UserRow({
  user,
  currentUser,
}) {
  const isCurrentUser =
    currentUser?.id === user.id;

  return (
    <div className="border-b border-slate-800 px-6 py-6 last:border-b-0">

      <div className="grid gap-5 md:grid-cols-[2fr_2fr_1fr] md:items-center">

        {/* USER */}

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="font-semibold">
                {user.name}
              </h3>

              {isCurrentUser && (
                <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400">
                  You
                </span>
              )}

            </div>

            <p className="mt-1 text-xs text-slate-600">
              {user.id}
            </p>

          </div>

        </div>

        {/* EMAIL */}

        <div>

          <p className="text-sm text-slate-400">
            {user.email}
          </p>

        </div>

        {/* ACCOUNT */}

        <div>

          <span className="inline-block rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
            Active
          </span>

        </div>

      </div>

    </div>
  );
}