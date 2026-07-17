"use client";

import { cn } from "../utils/cn";
import { Check, ArrowRight, Download, Receipt } from "lucide-react";
import { Button } from "./button";
import { Progress } from "./data-display";

// PricingCard
export interface PricingPlan {
  name: string;
  price: string | number;
  period?: string;
  description: string;
  features: string[];
  buttonText?: string;
  popular?: boolean;
}

export function PricingCard({ plan, onSelect }: { plan: PricingPlan; onSelect?: () => void }) {
  return (
    <div
      className={cn(
        "p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col justify-between text-left relative overflow-hidden transition-all duration-200",
        plan.popular && "border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500"
      )}
    >
      {plan.popular && (
        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-indigo-500 text-white">
          Popular
        </span>
      )}
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            {plan.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-black tracking-tight">{plan.price}</span>
          {plan.period && (
            <span className="text-xs text-slate-400 font-medium">/{plan.period}</span>
          )}
        </div>
        <ul className="space-y-3 pt-2">
          {plan.features.map((f, i) => (
            <li key={i} className="flex gap-2.5 items-start text-sm">
              <Check className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-300 leading-normal">{f}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        <Button
          onClick={onSelect}
          variant={plan.popular ? "primary" : "secondary"}
          className="w-full h-11"
        >
          {plan.buttonText || "Choose Plan"}
        </Button>
      </div>
    </div>
  );
}

// SubscriptionCard
export interface Subscription {
  planName: string;
  status: "active" | "canceled" | "past_due";
  nextBillingDate: string;
  price: string;
}

export function SubscriptionCard({ sub, onManage }: { sub: Subscription; onManage?: () => void }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-lg leading-tight">{sub.planName} Plan</h4>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
              sub.status === "active" && "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500",
              sub.status === "canceled" && "bg-slate-50 dark:bg-slate-900 text-slate-500",
              sub.status === "past_due" && "bg-amber-50 dark:bg-amber-950/20 text-amber-500"
            )}
          >
            {sub.status}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your plan renews on{" "}
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {sub.nextBillingDate}
          </span>{" "}
          for {sub.price}.
        </p>
      </div>
      <Button variant="secondary" onClick={onManage} size="sm" className="h-10">
        Manage Billing
      </Button>
    </div>
  );
}

// PlanComparison Grid
export interface FeatureComparison {
  name: string;
  starter: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

export function PlanComparison({ features }: { features: FeatureComparison[] }) {
  const checkOrCross = (val: boolean | string) => {
    if (typeof val === "string") return val;
    return val ? (
      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
    ) : (
      <span className="text-slate-350 dark:text-slate-800">—</span>
    );
  };

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 text-sm">
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
        <div className="text-left">Feature</div>
        <div>Starter</div>
        <div>Pro</div>
        <div>Enterprise</div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-900">
        {features.map((f, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 items-center text-center">
            <div className="text-left font-bold text-slate-700 dark:text-slate-300">{f.name}</div>
            <div>{checkOrCross(f.starter)}</div>
            <div>{checkOrCross(f.pro)}</div>
            <div>{checkOrCross(f.enterprise)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CheckoutSummary
export interface CheckoutItem {
  name: string;
  price: number;
}

export function CheckoutSummary({
  items,
  discount = 0,
  onCheckout,
}: {
  items: CheckoutItem[];
  discount?: number;
  onCheckout?: () => void;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal - discount;

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-left space-y-4 max-w-sm mx-auto">
      <h4 className="font-bold text-base border-b border-slate-200 dark:border-slate-850 pb-3">
        Checkout Summary
      </h4>
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between text-sm text-slate-700 dark:text-slate-300 font-semibold"
          >
            <span>{item.name}</span>
            <span className="font-mono">${item.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-850 pt-3.5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-mono">${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-500 font-bold">
            <span>Discount</span>
            <span className="font-mono">-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2">
          <span>Total</span>
          <span className="font-mono">${total.toFixed(2)}</span>
        </div>
      </div>

      <Button onClick={onCheckout} className="w-full mt-4 flex items-center justify-center gap-2">
        Proceed to Payment <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// BillingHistory
export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
}

export function BillingHistory({
  invoices,
  onDownload,
}: {
  invoices: Invoice[];
  onDownload?: (id: string) => void;
}) {
  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden text-left text-sm">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 font-bold text-slate-650 dark:text-slate-300">
        <Receipt className="w-4 h-4" /> Billing & Invoices
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-900">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
          >
            <div className="space-y-1">
              <span className="font-bold font-mono">{inv.id}</span>
              <p className="text-xs text-slate-400 font-semibold">{inv.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-black">{inv.amount}</span>
              <button
                onClick={() => onDownload?.(inv.id)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// UsageMeter
export function UsageMeter({
  label,
  value,
  max,
  unit = "",
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
}) {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full space-y-2.5 text-left p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-xs font-bold font-mono">
          {value} / {max} {unit}
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
