"use client";

import { cn } from "../utils/cn";
import { motion } from "framer-motion";
import { ElementType, HTMLAttributes } from "react";

// Heading
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: ElementType;
}

export function Heading({ level = 1, as, className, children, ...props }: HeadingProps) {
  const Component = as || (`h${level}` as ElementType);
  const sizeClasses = {
    1: "text-4xl md:text-5xl font-black tracking-tight",
    2: "text-3xl md:text-4xl font-extrabold tracking-tight",
    3: "text-2xl md:text-3xl font-bold tracking-tight",
    4: "text-xl md:text-2xl font-semibold tracking-tight",
    5: "text-lg md:text-xl font-medium tracking-tight",
    6: "text-base md:text-lg font-medium tracking-tight",
  };

  return (
    <Component
      className={cn("text-slate-900 dark:text-slate-50 font-sans", sizeClasses[level], className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Title
export interface TitleProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
}

export function Title({ as: Component = "div", className, children, ...props }: TitleProps) {
  return (
    <Component
      className={cn("text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-50", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Subtitle
export function Subtitle({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-lg md:text-xl text-slate-500 dark:text-slate-400 font-normal leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

// Body
export function Body({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-base text-slate-700 dark:text-slate-350 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

// Caption
export function Caption({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide", className)}
      {...props}
    >
      {children}
    </span>
  );
}

// Code
export function Code({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "font-mono text-sm px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-medium",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

// Quote
export function Quote({ className, children, ...props }: HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "pl-4 border-l-4 border-slate-300 dark:border-slate-700 italic text-slate-600 dark:text-slate-400",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

// Muted
export function Muted({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props}>
      {children}
    </span>
  );
}

// GradientText
export interface GradientTextProps extends HTMLAttributes<HTMLSpanElement> {
  from?: string;
  to?: string;
}

export function GradientText({
  from = "from-indigo-500",
  to = "to-rose-500",
  className,
  children,
  ...props
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent font-extrabold",
        from,
        to,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// AnimatedText
export interface AnimatedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
}

export function AnimatedText({ text, className, ...props }: AnimatedTextProps) {
  const words = text.split(" ");
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={cn("inline-flex flex-wrap gap-x-1.5", className)}
      {...(props as any)}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} className="inline-block">
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
