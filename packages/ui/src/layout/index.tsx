"use client";

import { cn } from "../utils/cn";
import { HTMLAttributes, ReactNode } from "react";

// Container
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  clean?: boolean;
}

export function Container({ clean = false, className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(!clean && "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Section
export function Section({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-12 md:py-16 lg:py-24", className)} {...props}>
      {children}
    </section>
  );
}

// Grid
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 2 | 4 | 6 | 8 | 10 | 12;
}

export function Grid({ cols = 3, gap = 6, className, children, ...props }: GridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-12",
  };

  const gapClasses = {
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
  };

  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)} {...props}>
      {children}
    </div>
  );
}

// Stack
export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  spacing?: 2 | 4 | 6 | 8;
}

export function Stack({
  direction = "col",
  align = "stretch",
  justify = "start",
  spacing = 4,
  className,
  children,
  ...props
}: StackProps) {
  const dirClass = direction === "row" ? "flex-row" : "flex-col";
  
  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align];

  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  }[justify];

  const spacingClass = {
    2: "gap-2",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  }[spacing];

  return (
    <div
      className={cn("flex", dirClass, alignClass, justifyClass, spacingClass, className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Page Wrapper
export function Page({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-200", className)} {...props}>
      {children}
    </div>
  );
}

// SidebarLayout
export interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SidebarLayout({ sidebar, children, className }: SidebarLayoutProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hidden md:block">
        {sidebar}
      </aside>
      <main className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}

// DashboardLayout
export interface DashboardLayoutProps {
  navbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({ navbar, sidebar, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <header className="sticky top-0 z-40 w-full">{navbar}</header>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden lg:block overflow-y-auto">
          {sidebar}
        </aside>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Container>{children}</Container>
        </main>
      </div>
    </div>
  );
}

// AuthLayout
export interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950/80 backdrop-blur-md shadow-xl flex flex-col gap-6">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
          {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        <div>{children}</div>
        {footer && <div className="border-t border-slate-100 dark:border-slate-900 pt-4 text-center">{footer}</div>}
      </div>
    </div>
  );
}

// CenteredLayout
export function CenteredLayout({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950", className)} {...props}>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}

// SplitLayout
export interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function SplitLayout({ left, right, className }: SplitLayoutProps) {
  return (
    <div className={cn("min-h-screen grid grid-cols-1 lg:grid-cols-2", className)}>
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">{left}</div>
      </div>
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-100 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
        {right}
      </div>
    </div>
  );
}

// EmptyStateLayout
export interface EmptyStateLayoutProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyStateLayout({ icon, title, description, action, className }: EmptyStateLayoutProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/20 max-w-lg mx-auto my-8", className)}>
      {icon && <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 mb-4">{icon}</div>}
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
