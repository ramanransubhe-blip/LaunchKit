"use client";

import { cn } from "../utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Loader2, ChevronDown } from "lucide-react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-98 select-none",
  {
    variants: {
      variant: {
        primary: "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-500/20 active:bg-indigo-700",
        secondary: "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-800",
        outline: "border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-255 hover:bg-slate-50 dark:hover:bg-slate-900",
        ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900",
        danger: "bg-red-600 text-white shadow-md shadow-red-600/10 hover:bg-red-500 hover:shadow-red-500/20",
        success: "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-500 hover:shadow-emerald-500/20",
        warning: "bg-amber-500 text-slate-950 hover:bg-amber-400",
      },
      size: {
        sm: "h-9 px-3 text-xs rounded-lg gap-1.5",
        md: "h-11 px-5",
        lg: "h-13 px-7 text-base gap-2.5",
        icon: "h-9 w-9 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, icon, iconRight, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || props.disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!loading && icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
        {!loading && iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
      </button>
    );
  }
);
Button.displayName = "Button";

// IconButton
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  icon: ReactNode;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, variant = "secondary", size = "sm", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size === "sm" || size === "icon" ? "icon" : size}
        className={cn("p-0 w-9 h-9 flex items-center justify-center", className)}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

// SplitButton
export interface SplitButtonProps extends ButtonProps {
  options: string[];
  onSelectOption?: (option: string) => void;
}

export function SplitButton({
  children,
  options,
  onSelectOption,
  variant,
  size,
  className,
  ...props
}: SplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative inline-flex rounded-xl shadow-sm", className)}>
      <Button
        variant={variant}
        size={size}
        className="rounded-r-none border-r border-black/10 dark:border-white/10"
        {...props}
      >
        {children}
      </Button>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          buttonVariants({ variant, size }),
          "rounded-l-none px-2.5 hover:bg-opacity-90 active:scale-100"
        )}
      >
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onSelectOption?.(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// CopyButton
export interface CopyButtonProps extends ButtonProps {
  value: string;
}

export function CopyButton({ value, variant = "secondary", size = "sm", className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("relative overflow-hidden w-9 h-9 p-0 flex items-center justify-center", className)}
      {...props}
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
      )}
    </Button>
  );
}

// AnimatedButton
export interface AnimatedButtonProps extends ButtonProps {
  glow?: boolean;
}

export function AnimatedButton({ children, glow = false, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative inline-flex rounded-xl"
    >
      {glow && (
        <div className="absolute inset-0 bg-indigo-500 rounded-xl blur-lg opacity-40 animate-pulse pointer-events-none" />
      )}
      <Button className={cn("relative z-10", className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
