import * as React from "react";
import { Card, Avatar, Badge } from "@devlaunchkit/ui";
import {
  Search,
  ShieldAlert,
  CheckCircle,
  Ban,
  Shield,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import { requireAdmin, isDatabaseMockMode } from "@/lib/auth-server";
import {
  db,
  profiles,
  oauthAccounts,
  subscriptions,
  prices,
  products,
} from "@devlaunchkit/database";
import { and, or, like, eq, count, desc, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  suspendUserAction,
  unsuspendUserAction,
  promoteToAdminAction,
  demoteAdminAction,
  deleteUserAction,
} from "../actions";

interface SearchParams {
  q?: string;
  role?: string;
  status?: string;
  sort?: string;
  order?: string;
  page?: string;
}

// User shape representing display fields
interface DisplayUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider: string;
  role: string;
  plan: string;
  status: string;
  createdAt: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // 1. Authorize admin session
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const params = await searchParams;
  const q = params.q || "";
  const filterRole = params.role || "";
  const filterStatus = params.status || "";
  const sortField = params.sort || "createdAt";
  const sortOrder = params.order || "desc";
  const page = Number(params.page) || 1;
  const limit = 8;
  const offset = (page - 1) * limit;

  const isMock = await isDatabaseMockMode();
  let users: DisplayUser[] = [];
  let totalCount = 0;

  if (isMock) {
    // 2. Mock mode: generate and filter/sort/paginate mock users in-memory
    const mockUsers: DisplayUser[] = [
      {
        id: "u_1",
        name: "Alice Vance",
        email: "alice.vance@clerk.com",
        avatarUrl: "https://avatar.vercel.sh/alice",
        provider: "clerk",
        role: "admin",
        plan: "Enterprise Plan",
        status: "active",
        createdAt: "2026-01-10T12:00:00Z",
      },
      {
        id: "u_2",
        name: "Bob Carter",
        email: "bob.carter@gmail.com",
        avatarUrl: "https://avatar.vercel.sh/bob",
        provider: "google",
        role: "user",
        plan: "Pro Plan",
        status: "active",
        createdAt: "2026-03-15T14:30:00Z",
      },
      {
        id: "u_3",
        name: "Charlie Ding",
        email: "charlie@stripe.dev",
        avatarUrl: "https://avatar.vercel.sh/charlie",
        provider: "github",
        role: "user",
        plan: "Pro Plan",
        status: "suspended",
        createdAt: "2026-04-20T09:15:00Z",
      },
      {
        id: "u_4",
        name: "Dave Miller",
        email: "dave.miller@yahoo.com",
        avatarUrl: "https://avatar.vercel.sh/dave",
        provider: "email",
        role: "user",
        plan: "Free Plan",
        status: "active",
        createdAt: "2026-05-02T10:45:00Z",
      },
      {
        id: "u_5",
        name: "Emma Watson",
        email: "emma.watson@gmail.com",
        avatarUrl: "https://avatar.vercel.sh/emma",
        provider: "google",
        role: "user",
        plan: "Enterprise Plan",
        status: "active",
        createdAt: "2026-05-18T16:20:00Z",
      },
      {
        id: "u_6",
        name: "Frank Lampard",
        email: "frank@chelsea.fc",
        avatarUrl: "https://avatar.vercel.sh/frank",
        provider: "email",
        role: "user",
        plan: "Free Plan",
        status: "suspended",
        createdAt: "2026-06-01T11:00:00Z",
      },
      {
        id: "u_7",
        name: "Grace Hopper",
        email: "grace.hopper@navy.mil",
        avatarUrl: "https://avatar.vercel.sh/grace",
        provider: "github",
        role: "admin",
        plan: "Pro Plan",
        status: "active",
        createdAt: "2026-06-12T08:30:00Z",
      },
      {
        id: "u_8",
        name: "Henry Cavill",
        email: "henry@superman.com",
        avatarUrl: "https://avatar.vercel.sh/henry",
        provider: "email",
        role: "user",
        plan: "Free Plan",
        status: "active",
        createdAt: "2026-07-04T13:40:00Z",
      },
    ];

    // Filter
    const filtered = mockUsers.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase());
      const matchRole = filterRole ? u.role === filterRole : true;
      const matchStatus = filterStatus ? u.status === filterStatus : true;
      return matchSearch && matchRole && matchStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") comparison = a.name.localeCompare(b.name);
      else if (sortField === "email") comparison = a.email.localeCompare(b.email);
      else comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? comparison : -comparison;
    });

    totalCount = filtered.length;
    users = filtered.slice(offset, offset + limit);
  } else {
    // 3. Database mode: query postgres using Drizzle ORM
    try {
      const conditions = [];
      if (q) {
        conditions.push(or(like(profiles.name, `%${q}%`), like(profiles.email, `%${q}%`)));
      }
      if (filterRole) {
        conditions.push(eq(profiles.role, filterRole));
      }
      if (filterStatus) {
        conditions.push(eq(profiles.status, filterStatus));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Fetch count
      const [countResult] = await db.select({ val: count() }).from(profiles).where(whereClause);
      totalCount = countResult.val;

      // Resolve sort order
      let orderExpr = desc(profiles.createdAt);
      if (sortField === "name") {
        orderExpr = sortOrder === "asc" ? asc(profiles.name) : desc(profiles.name);
      } else if (sortField === "email") {
        orderExpr = sortOrder === "asc" ? asc(profiles.email) : desc(profiles.email);
      } else if (sortField === "createdAt") {
        orderExpr = sortOrder === "asc" ? asc(profiles.createdAt) : desc(profiles.createdAt);
      }

      // Query database
      const dbUsers = await db
        .select({
          id: profiles.id,
          name: profiles.name,
          email: profiles.email,
          avatarUrl: profiles.avatarUrl,
          role: profiles.role,
          status: profiles.status,
          createdAt: profiles.createdAt,
          provider: oauthAccounts.provider,
          plan: products.name,
        })
        .from(profiles)
        .leftJoin(oauthAccounts, eq(profiles.id, oauthAccounts.profileId))
        .leftJoin(subscriptions, eq(profiles.id, subscriptions.userId))
        .leftJoin(prices, eq(subscriptions.priceId, prices.id))
        .leftJoin(products, eq(prices.productId, products.id))
        .where(whereClause)
        .orderBy(orderExpr)
        .limit(limit)
        .offset(offset);

      users = dbUsers.map((u) => ({
        id: u.id,
        name: u.name || "User",
        email: u.email,
        avatarUrl: u.avatarUrl,
        provider: u.provider || "email",
        role: u.role,
        plan: u.plan || "Free Plan",
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      }));
    } catch (e) {
      console.error("Drizzle users query failed, using empty states:", e);
      totalCount = 0;
      users = [];
    }
  }

  const totalPages = Math.ceil(totalCount / limit) || 1;

  // Helpers to rebuild URL with new parameters
  const getHref = (updates: Partial<SearchParams>) => {
    const nextParams = new URLSearchParams();
    if (q) nextParams.set("q", q);
    if (filterRole) nextParams.set("role", filterRole);
    if (filterStatus) nextParams.set("status", filterStatus);
    if (sortField) nextParams.set("sort", sortField);
    if (sortOrder) nextParams.set("order", sortOrder);
    nextParams.set("page", String(page));

    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === "") nextParams.delete(key);
      else nextParams.set(key, val);
    });

    return `/admin/users?${nextParams.toString()}`;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
          Users Directory
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage user profiles, assignments, credentials, and state suspensions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
        {/* Search */}
        <form className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search users by name or email..."
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none text-neutral-900 dark:text-white"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase">
            <Filter className="h-3.5 w-3.5" /> Filters:
          </div>

          <Link
            href={getHref({ role: filterRole === "admin" ? "" : "admin", page: "1" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterRole === "admin"
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                : "bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            Admins
          </Link>

          <Link
            href={getHref({ status: filterStatus === "suspended" ? "" : "suspended", page: "1" })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterStatus === "suspended"
                ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                : "bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
            }`}
          >
            Suspended
          </Link>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  <Link
                    href={getHref({ sort: "name", order: sortOrder === "asc" ? "desc" : "asc" })}
                    className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-white"
                  >
                    Name <ArrowUpDown className="h-3 w-3" />
                  </Link>
                </th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  <Link
                    href={getHref({ sort: "email", order: sortOrder === "asc" ? "desc" : "asc" })}
                    className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-white"
                  >
                    Email <ArrowUpDown className="h-3 w-3" />
                  </Link>
                </th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  Provider
                </th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">Role</th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  Active Plan
                </th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  Registered
                </th>
                <th className="p-4 text-right font-semibold text-neutral-500 dark:text-neutral-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400 font-medium">
                    No users found matching parameters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-all"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatarUrl || undefined}
                          alt={user.name}
                          fallback={user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)}
                        />
                        <span className="font-semibold text-neutral-850 dark:text-neutral-100">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-500 dark:text-neutral-400 font-mono text-xs">
                      {user.email}
                    </td>
                    <td className="p-4 font-medium uppercase text-xs text-neutral-400">
                      {user.provider}
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === "admin" ? "secondary" : "primary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-300 font-medium text-xs">
                      {user.plan}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          user.status === "active"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1.5 shrink-0">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 inline-flex items-center"
                        title="View profile details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* Suspend / Unsuspend buttons */}
                      {user.status === "active" ? (
                        <form
                          action={async () => {
                            "use server";
                            await suspendUserAction(user.id);
                          }}
                          className="inline"
                        >
                          <button
                            type="submit"
                            className="p-1 text-amber-500 hover:text-amber-700"
                            title="Suspend user"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await unsuspendUserAction(user.id);
                          }}
                          className="inline"
                        >
                          <button
                            type="submit"
                            className="p-1 text-green-500 hover:text-green-700"
                            title="Reactivate user"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </form>
                      )}

                      {/* Role promote/demote buttons */}
                      {user.role !== "admin" ? (
                        <form
                          action={async () => {
                            "use server";
                            await promoteToAdminAction(user.id);
                          }}
                          className="inline"
                        >
                          <button
                            type="submit"
                            className="p-1 text-indigo-500 hover:text-indigo-700"
                            title="Promote to admin"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        </form>
                      ) : (
                        <form
                          action={async () => {
                            "use server";
                            await demoteAdminAction(user.id);
                          }}
                          className="inline"
                        >
                          <button
                            type="submit"
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Demote admin"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        </form>
                      )}

                      {/* Delete button */}
                      <form
                        action={async () => {
                          "use server";
                          await deleteUserAction(user.id);
                        }}
                        className="inline"
                        onSubmit={(e) => {
                          if (!confirm("Are you sure you want to delete this user profile?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <button
                          type="submit"
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="Delete account"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
            <span className="text-xs text-neutral-400 font-semibold">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={getHref({ page: String(Math.max(1, page - 1)) })}
                className={`p-1.5 border rounded-lg text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 ${
                  page <= 1
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-white dark:hover:bg-neutral-850"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link
                href={getHref({ page: String(Math.min(totalPages, page + 1)) })}
                className={`p-1.5 border rounded-lg text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 ${
                  page >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "hover:bg-white dark:hover:bg-neutral-850"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
