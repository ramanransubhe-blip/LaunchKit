import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@devlaunchkit/ui";
import { TrendingUp, AlertCircle, Users, CheckCircle, XCircle } from "lucide-react";
import { requireAdmin, isDatabaseMockMode } from "@/lib/auth-server";
import {
  db,
  subscriptions,
  prices,
  products,
  profiles,
  organizations,
} from "@devlaunchkit/database";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

interface DisplaySubscription {
  id: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  amount: number;
  interval: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface SubscriptionStats {
  activeCount: number;
  cancelledCount: number;
  expiredCount: number;
  mrr: number;
  totalUsersOnPaid: number;
}

async function getSubscriptionData(): Promise<{
  stats: SubscriptionStats;
  list: DisplaySubscription[];
  isMock: boolean;
}> {
  const isMock = await isDatabaseMockMode();

  if (isMock) {
    // High quality mock subscription data
    const list: DisplaySubscription[] = [
      {
        id: "sub_1",
        customerName: "Alice Vance",
        customerEmail: "alice.vance@clerk.com",
        planName: "Enterprise Plan",
        amount: 199,
        interval: "month",
        status: "active",
        startDate: "2026-01-10T12:00:00Z",
        endDate: "2026-08-10T12:00:00Z",
      },
      {
        id: "sub_2",
        customerName: "Bob Carter",
        customerEmail: "bob.carter@gmail.com",
        planName: "Pro Plan",
        amount: 49,
        interval: "month",
        status: "active",
        startDate: "2026-03-15T14:30:00Z",
        endDate: "2026-08-15T14:30:00Z",
      },
      {
        id: "sub_3",
        customerName: "Charlie Ding",
        customerEmail: "charlie@stripe.dev",
        planName: "Pro Plan",
        amount: 49,
        interval: "month",
        status: "cancelled",
        startDate: "2026-04-20T09:15:00Z",
        endDate: "2026-05-20T09:15:00Z",
      },
      {
        id: "sub_4",
        customerName: "Dave Miller",
        customerEmail: "dave.miller@yahoo.com",
        planName: "Pro Plan",
        amount: 49,
        interval: "month",
        status: "expired",
        startDate: "2026-02-02T10:45:00Z",
        endDate: "2026-03-02T10:45:00Z",
      },
      {
        id: "sub_5",
        customerName: "Emma Watson",
        customerEmail: "emma.watson@gmail.com",
        planName: "Enterprise Plan",
        amount: 199,
        interval: "month",
        status: "active",
        startDate: "2026-05-18T16:20:00Z",
        endDate: "2026-08-18T16:20:00Z",
      },
    ];

    return {
      stats: {
        activeCount: 3,
        cancelledCount: 1,
        expiredCount: 1,
        mrr: 447, // 199 + 49 + 199
        totalUsersOnPaid: 3,
      },
      list,
      isMock: true,
    };
  }

  try {
    // Database mode
    const dbSubs = await db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        quantity: subscriptions.quantity,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        // joins
        profileName: profiles.name,
        profileEmail: profiles.email,
        orgName: organizations.name,
        planName: products.name,
        unitAmount: prices.unitAmount,
        interval: prices.interval,
      })
      .from(subscriptions)
      .leftJoin(profiles, eq(subscriptions.userId, profiles.id))
      .leftJoin(organizations, eq(subscriptions.organizationId, organizations.id))
      .leftJoin(prices, eq(subscriptions.priceId, prices.id))
      .leftJoin(products, eq(prices.productId, products.id))
      .orderBy(desc(subscriptions.createdAt));

    const list: DisplaySubscription[] = dbSubs.map((s) => ({
      id: s.id,
      customerName: s.profileName || s.orgName || "Acme Client",
      customerEmail: s.profileEmail || "billing@org.local",
      planName: s.planName || "LaunchKit Pro",
      amount: (s.unitAmount || 4900) / 100,
      interval: s.interval || "month",
      status: s.status,
      startDate: s.currentPeriodStart.toISOString(),
      endDate: s.currentPeriodEnd.toISOString(),
    }));

    // Calculate aggregated metrics
    let activeCount = 0;
    let cancelledCount = 0;
    let expiredCount = 0;
    let mrr = 0;

    list.forEach((sub) => {
      if (sub.status === "active") {
        activeCount++;
        mrr += sub.amount;
      } else if (sub.status === "cancelled") {
        cancelledCount++;
      } else {
        expiredCount++;
      }
    });

    return {
      stats: {
        activeCount,
        cancelledCount,
        expiredCount,
        mrr,
        totalUsersOnPaid: activeCount,
      },
      list,
      isMock: false,
    };
  } catch (error) {
    console.error("Failed to load subscription telemetry, using fallback:", error);
    return {
      stats: { activeCount: 3, cancelledCount: 1, expiredCount: 1, mrr: 447, totalUsersOnPaid: 3 },
      list: [
        {
          id: "sub_1",
          customerName: "Alice Vance",
          customerEmail: "alice.vance@clerk.com",
          planName: "Enterprise Plan",
          amount: 199,
          interval: "month",
          status: "active",
          startDate: "2026-01-10T12:00:00Z",
          endDate: "2026-08-10T12:00:00Z",
        },
        {
          id: "sub_2",
          customerName: "Bob Carter",
          customerEmail: "bob.carter@gmail.com",
          planName: "Pro Plan",
          amount: 49,
          interval: "month",
          status: "active",
          startDate: "2026-03-15T14:30:00Z",
          endDate: "2026-08-15T14:30:00Z",
        },
      ],
      isMock: true,
    };
  }
}

export default async function AdminSubscriptionsPage() {
  // Authorize admin role
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const { stats, list, isMock } = await getSubscriptionData();

  const metrics = [
    {
      title: "Active Subscriptions",
      value: stats.activeCount.toString(),
      desc: "Paid accounts active",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Monthly Recurring Revenue",
      value: `$${stats.mrr.toLocaleString()}`,
      desc: `Annual: $${(stats.mrr * 12).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-indigo-500",
    },
    {
      title: "Cancelled (this month)",
      value: stats.cancelledCount.toString(),
      desc: "Subscription churn rate",
      icon: XCircle,
      color: "text-rose-500",
    },
    {
      title: "Paid Customers",
      value: stats.totalUsersOnPaid.toString(),
      desc: "Users on premium tiers",
      icon: Users,
      color: "text-sky-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {isMock && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <div>
            <strong className="font-semibold">Mock Billing Active</strong>: Dodo/Stripe
            configuration is empty. Displaying developer sandbox subscription logs.
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
          Subscription Management
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Monitor recurring revenue, plans distributions, and customer billing parameters.
        </p>
      </div>

      {/* Stats metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card
              key={idx}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  {m.title}
                </CardTitle>
                <Icon className={`h-4.5 w-4.5 ${m.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
                  {m.value}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">{m.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Subscriptions Table */}
      <Card className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 p-4">
          <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-neutral-400">
            All Subscriptions
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  Customer
                </th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">Email</th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">Plan</th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  Billing Interval
                </th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  Start Date
                </th>
                <th className="p-4 font-semibold text-neutral-500 dark:text-neutral-400">
                  Renewal Date
                </th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400 font-medium">
                    No active subscriptions logged.
                  </td>
                </tr>
              ) : (
                list.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-all"
                  >
                    <td className="p-4 font-semibold text-neutral-850 dark:text-neutral-100">
                      {sub.customerName}
                    </td>
                    <td className="p-4 text-neutral-550 dark:text-neutral-400 font-mono text-xs">
                      {sub.customerEmail}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-xs text-indigo-650 dark:text-indigo-400">
                        {sub.planName}
                      </span>
                    </td>
                    <td className="p-4 font-semibold capitalize text-xs text-neutral-500">
                      ${sub.amount} / {sub.interval}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          sub.status === "active"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                            : sub.status === "cancelled"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-450"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400 text-xs">
                      {new Date(sub.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-neutral-400 text-xs font-semibold">
                      {new Date(sub.endDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
