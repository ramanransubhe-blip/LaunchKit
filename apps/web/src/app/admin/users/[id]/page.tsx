import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, Avatar, Badge } from "@devlaunchkit/ui";
import { ArrowLeft, CreditCard, Smartphone, History, User } from "lucide-react";
import { requireAdmin, isDatabaseMockMode } from "@/lib/auth-server";
import {
  db,
  profiles,
  oauthAccounts,
  subscriptions,
  prices,
  products,
  sessions,
  invoices,
  loginHistory,
} from "@devlaunchkit/database";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

interface DetailUserPayload {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  createdAt: string;
  provider: string;
  emailVerified: boolean;
  lockedUntil: string | null;
  subscription: {
    planName: string;
    status: string;
    amount: number;
    interval: string;
    quantity: number;
    start: string;
    end: string;
  } | null;
  invoices: {
    id: string;
    number: string;
    amount: number;
    status: string;
    date: string;
  }[];
  sessions: {
    id: string;
    token: string;
    expiresAt: string;
    createdAt: string;
  }[];
  timeline: {
    id: string;
    action: string;
    detail: string;
    time: string;
  }[];
}

async function getUserDetails(id: string): Promise<DetailUserPayload | null> {
  const isMock = await isDatabaseMockMode();

  if (isMock || id.startsWith("u_")) {
    // Return high quality mock details
    return {
      id,
      name: id === "u_1" ? "Alice Vance" : id === "u_3" ? "Charlie Ding" : "Bob Carter",
      email:
        id === "u_1"
          ? "alice.vance@clerk.com"
          : id === "u_3"
            ? "charlie@stripe.dev"
            : "bob.carter@gmail.com",
      avatarUrl: `https://avatar.vercel.sh/${id}`,
      role: id === "u_1" ? "admin" : "user",
      status: id === "u_3" ? "suspended" : "active",
      createdAt: "2026-01-10T12:00:00Z",
      provider: id === "u_1" ? "clerk" : "google",
      emailVerified: true,
      lockedUntil: null,
      subscription: {
        planName: id === "u_1" ? "Enterprise Plan" : "Pro Plan",
        status: id === "u_3" ? "past_due" : "active",
        amount: id === "u_1" ? 199 : 49,
        interval: "month",
        quantity: 1,
        start: "2026-01-10T12:00:00Z",
        end: "2026-08-10T12:00:00Z",
      },
      invoices: [
        {
          id: "inv_1",
          number: "INV-2026-001",
          amount: id === "u_1" ? 199 : 49,
          status: "paid",
          date: "2026-07-10T12:00:00Z",
        },
        {
          id: "inv_2",
          number: "INV-2026-002",
          amount: id === "u_1" ? 199 : 49,
          status: "paid",
          date: "2026-06-10T12:00:00Z",
        },
        {
          id: "inv_3",
          number: "INV-2026-003",
          amount: id === "u_1" ? 199 : 49,
          status: "paid",
          date: "2026-05-10T12:00:00Z",
        },
      ],
      sessions: [
        {
          id: "sess_1",
          token: "tok_...8f2a",
          expiresAt: "2026-07-17T12:00:00Z",
          createdAt: "2026-07-16T12:00:00Z",
        },
        {
          id: "sess_2",
          token: "tok_...12b9",
          expiresAt: "2026-07-10T09:30:00Z",
          createdAt: "2026-07-09T09:30:00Z",
        },
      ],
      timeline: [
        {
          id: "t1",
          action: "User Logged In",
          detail: "Authenticated successfully from IP 192.168.1.42",
          time: "10 mins ago",
        },
        {
          id: "t2",
          action: "Invoice Paid",
          detail: "Billing system recorded $49 subscription charge",
          time: "6 days ago",
        },
        {
          id: "t3",
          action: "MFA Key Registered",
          detail: "Added a hardware FIDO security key",
          time: "1 month ago",
        },
        {
          id: "t4",
          action: "User Registered",
          detail: "Account initialized via Google Provider link",
          time: "6 months ago",
        },
      ],
    };
  }

  try {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    if (!profile) return null;

    const [oauth] = await db.select().from(oauthAccounts).where(eq(oauthAccounts.profileId, id));

    const userSubs = await db
      .select({
        sub: subscriptions,
        price: prices,
        prod: products,
      })
      .from(subscriptions)
      .innerJoin(prices, eq(subscriptions.priceId, prices.id))
      .innerJoin(products, eq(prices.productId, products.id))
      .where(eq(subscriptions.userId, id))
      .limit(1);

    const sub = userSubs[0];

    const dbInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.subscriptionId, sub?.sub.id || ""))
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    const dbSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.profileId, id))
      .orderBy(desc(sessions.createdAt))
      .limit(5);

    const dbLogins = await db
      .select()
      .from(loginHistory)
      .where(eq(loginHistory.profileId, id))
      .orderBy(desc(loginHistory.createdAt))
      .limit(5);

    const timeline = dbLogins.map((l) => ({
      id: l.id,
      action: l.status === "success" ? "User Logged In" : "Login Failed",
      detail:
        l.status === "success"
          ? `Authenticated successfully from IP ${l.ipAddress || "Unknown"}`
          : `Failed login attempt: ${l.failureReason || "Incorrect credentials"}`,
      time: l.createdAt.toLocaleDateString(),
    }));

    if (timeline.length === 0) {
      timeline.push({
        id: "reg",
        action: "User Registered",
        detail: `Profile initialized in database under role ${profile.role}`,
        time: profile.createdAt.toLocaleDateString(),
      });
    }

    return {
      id: profile.id,
      name: profile.name || "User",
      email: profile.email,
      avatarUrl: profile.avatarUrl,
      role: profile.role,
      status: profile.status,
      createdAt: profile.createdAt.toISOString(),
      provider: oauth?.provider || "email",
      emailVerified: true, // Default true
      lockedUntil: null,
      subscription: sub
        ? {
            planName: sub.prod.name,
            status: sub.sub.status,
            amount: sub.price.unitAmount / 100,
            interval: sub.price.interval || "month",
            quantity: sub.sub.quantity,
            start: sub.sub.currentPeriodStart.toISOString(),
            end: sub.sub.currentPeriodEnd.toISOString(),
          }
        : null,
      invoices: dbInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        amount: inv.amountPaid / 100,
        status: inv.status,
        date: inv.createdAt.toISOString(),
      })),
      sessions: dbSessions.map((s) => ({
        id: s.id,
        token: `tok_...${s.token.substring(s.token.length - 4)}`,
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
      })),
      timeline,
    };
  } catch (error) {
    console.error("Failed to load user detail metrics:", error);
    return null;
  }
}

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Enforce server-side admin check
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const { id } = await params;
  const user = await getUserDetails(id);

  if (!user) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold">User profile not found.</h2>
          <p className="text-neutral-500 text-xs">Verify the profile identifier is correct.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back Link */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-white uppercase tracking-wider transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users Directory
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatarUrl || undefined}
              alt={user.name}
              fallback={user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
              className="h-16 w-16"
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                {user.name}
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
            <Badge variant="secondary">Role: {user.role}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card & Account Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-indigo-500" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
                  Account Details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
              <div>
                <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  User ID
                </span>
                <span className="text-xs font-mono text-neutral-600 dark:text-neutral-300 select-all">
                  {user.id}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Provider Link
                </span>
                <span className="text-xs font-semibold capitalize text-neutral-600 dark:text-neutral-300">
                  {user.provider}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Email Verified
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {user.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Registered At
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-300">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions & Billing */}
          <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-indigo-500" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
                  Subscription & Billing
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              {user.subscription ? (
                <div className="grid gap-4 sm:grid-cols-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div>
                    <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Current Plan
                    </span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {user.subscription.planName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Status & Amount
                    </span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      ${user.subscription.amount} / {user.subscription.interval}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Renewal Date
                    </span>
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      {new Date(user.subscription.end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-400 font-semibold border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  No active paid subscriptions found. Account is on Free Plan.
                </div>
              )}

              {/* Invoices List */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Recent Invoices
                </span>
                {user.invoices.length === 0 ? (
                  <div className="text-xs text-neutral-400 py-2">No invoices issued.</div>
                ) : (
                  <div className="space-y-2">
                    {user.invoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex justify-between items-center text-xs p-2.5 border border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-950/20 rounded-xl"
                      >
                        <div className="flex gap-4">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {inv.number}
                          </span>
                          <span className="text-neutral-400">
                            {new Date(inv.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            ${inv.amount}
                          </span>
                          <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px]">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions & Timeline */}
        <div className="space-y-6">
          {/* Active Sessions */}
          <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4.5 w-4.5 text-indigo-500" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
                  Active Sessions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {user.sessions.length === 0 ? (
                <div className="text-xs text-neutral-400 font-medium py-3 text-center">
                  No active credentials.
                </div>
              ) : (
                user.sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-1 bg-neutral-50/50 dark:bg-neutral-950/20 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-neutral-500 font-bold">{s.token}</span>
                      <span className="text-emerald-500 font-bold">Active</span>
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Created: {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-indigo-500" />
                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
                  Activity Timeline
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative pl-4 border-l border-neutral-200 dark:border-neutral-800 space-y-4">
                {user.timeline.map((t) => (
                  <div key={t.id} className="relative space-y-1">
                    <div className="absolute -left-[20.5px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 border border-white dark:border-neutral-900 shadow-sm" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-850 dark:text-neutral-100">
                        {t.action}
                      </span>
                      <span className="text-[10px] text-neutral-450 shrink-0">{t.time}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-normal">{t.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
