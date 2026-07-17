"use client";

import { cn } from "../utils/cn";
import { useState, HTMLAttributes } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Github,
  ArrowRight,
  Settings,
  LogOut,
  Loader2,
  Sparkles,
  Check,
  Key,
} from "lucide-react";
import { Input, Checkbox, OTPInput } from "./forms";
import { Button } from "./button";
import { Avatar } from "./data-display";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

// LoginCard
export interface LoginCardProps {
  onLogin?: (email: string, pass: string) => void;
  onSocialLogin?: (provider: "google" | "github") => void;
  onToggleSignUp?: () => void;
  onForgotPassword?: () => void;
  loading?: boolean;
}

export function LoginCard({
  onLogin,
  onSocialLogin,
  onToggleSignUp,
  onForgotPassword,
  loading,
}: LoginCardProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.(email, pass);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-left">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Log in to manage your workspace and applications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          required
          icon={<Mail className="w-4 h-4" />}
        />
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-350">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-bold text-indigo-650 hover:underline cursor-pointer"
            >
              Forgot?
            </button>
          </div>
          <Input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            required
            icon={<Lock className="w-4 h-4" />}
          />
        </div>

        <Checkbox
          id="remember-me"
          checked={remember}
          onCheckedChange={setRemember}
          label="Keep me logged in"
        />

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-100 dark:border-slate-900"></div>
        <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          or continue with
        </span>
        <div className="flex-grow border-t border-slate-100 dark:border-slate-900"></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          onClick={() => onSocialLogin?.("github")}
          className="w-full flex items-center justify-center gap-2 h-10"
        >
          <Github className="w-4 h-4" /> Github
        </Button>
        <Button
          variant="secondary"
          onClick={() => onSocialLogin?.("google")}
          className="w-full flex items-center justify-center gap-2 h-10"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.483 0-6.312-2.83-6.312-6.313s2.83-6.312 6.312-6.312c1.625 0 3.098.622 4.225 1.636l3.056-3.056C19.388 2.766 15.992 1.5 12.24 1.5 6.42 1.5 1.69 6.229 1.69 12.05s4.729 10.55 10.55 10.55c5.772 0 10.589-4.708 10.589-10.55 0-.693-.06-1.343-.173-1.965H12.24z" />
          </svg>
          Google
        </Button>
      </div>

      <div className="text-center text-xs text-slate-400">
        New here?{" "}
        <button
          onClick={onToggleSignUp}
          className="font-bold text-indigo-650 hover:underline cursor-pointer"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}

// SignupCard
export interface SignupCardProps {
  onSignUp?: (email: string, pass: string, name: string) => void;
  onToggleSignIn?: () => void;
  loading?: boolean;
}

export function SignupCard({ onSignUp, onToggleSignIn, loading }: SignupCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const hasLength = pass.length >= 8;
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasLength && hasNumber && hasSpecial) {
      onSignUp?.(email, pass, name);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-left">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Create Account
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Get started with your free workspace today.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          required
          icon={<User className="w-4 h-4" />}
        />
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          required
          icon={<Mail className="w-4 h-4" />}
        />
        <Input
          type="password"
          label="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="••••••••"
          required
          icon={<Lock className="w-4 h-4" />}
        />

        {/* Password Strength Indicator */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-xl p-3.5 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Password Requirements
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs">
              <Check
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  hasLength ? "text-emerald-500 animate-pulse" : "text-slate-400"
                )}
              />
              <span className={hasLength ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Check
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  hasNumber ? "text-emerald-500 animate-pulse" : "text-slate-400"
                )}
              />
              <span className={hasNumber ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}>
                At least one number (0-9)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Check
                className={cn(
                  "w-3.5 h-3.5 shrink-0",
                  hasSpecial ? "text-emerald-500 animate-pulse" : "text-slate-400"
                )}
              />
              <span
                className={hasSpecial ? "text-slate-700 dark:text-slate-200" : "text-slate-400"}
              >
                At least one special character (@, $, !)
              </span>
            </div>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Sign Up
        </Button>
      </form>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{" "}
        <button
          onClick={onToggleSignIn}
          className="font-bold text-indigo-650 hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

// ForgotPassword
export function ForgotPassword({
  onSubmit,
  onBack,
  loading,
}: {
  onSubmit: (email: string) => void;
  onBack: () => void;
  loading?: boolean;
}) {
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-left">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto mb-4">
          <Key className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Forgot Password?</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your email and we will send a password reset link.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(email);
        }}
        className="space-y-4"
      >
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          required
          icon={<Mail className="w-4 h-4" />}
        />
        <Button type="submit" loading={loading} className="w-full">
          Send Reset Link
        </Button>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}

// ResetPassword
export function ResetPassword({
  onSubmit,
  loading,
}: {
  onSubmit: (pass: string) => void;
  loading?: boolean;
}) {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const error = pass !== confirm && confirm ? "Passwords do not match" : "";

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-left">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Reset Password</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your new secure password.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!error) onSubmit(pass);
        }}
        className="space-y-4"
      >
        <Input
          type="password"
          label="New Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="••••••••"
          required
          icon={<Lock className="w-4 h-4" />}
        />
        <Input
          type="password"
          label="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          error={error}
          icon={<Lock className="w-4 h-4" />}
        />
        <Button type="submit" loading={loading} className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}

// EmailVerification
export function EmailVerification({
  onSubmit,
  email,
  onResend,
  loading,
}: {
  onSubmit: (otp: string) => void;
  email: string;
  onResend?: () => void;
  loading?: boolean;
}) {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (code.length === 6) onSubmit(code);
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-left">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Verify Email</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We sent a verification code to{" "}
          <span className="font-bold text-slate-700 dark:text-slate-200">{email}</span>.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <OTPInput length={6} value={code} onChange={setCode} />
        <Button onClick={handleVerify} loading={loading} className="w-full">
          Confirm Code
        </Button>
      </div>

      {onResend && (
        <div className="text-center text-xs text-slate-400">
          Didn't receive the code?{" "}
          <button
            onClick={onResend}
            className="font-bold text-indigo-650 hover:underline cursor-pointer"
          >
            Resend
          </button>
        </div>
      )}
    </div>
  );
}

// MagicLink card state
export function MagicLink({ email, loading }: { email: string; loading?: boolean }) {
  return (
    <div className="w-full max-w-sm mx-auto p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center space-y-4 text-left">
      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center mx-auto">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Sparkles className="w-6 h-6 animate-pulse" />
        )}
      </div>
      <div className="text-center space-y-1">
        <h4 className="font-bold text-lg">Check Your Email</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We sent a secure, one-click magic sign-in link to{" "}
          <span className="font-bold">{email}</span>.
        </p>
      </div>
      <p className="text-[10px] text-slate-400 text-center">
        Clicking the link inside your email will log you in automatically.
      </p>
    </div>
  );
}

// ProfileDropdown & UserMenu
export interface UserMenuProps {
  user: { name: string; email: string; avatar?: string };
  onSettings?: () => void;
  onLogout?: () => void;
}

export function ProfileDropdown({ user, onSettings, onLogout }: UserMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger className="focus:outline-none cursor-pointer">
        <Avatar
          src={user.avatar}
          fallback={user.name}
          className="w-9 h-9 cursor-pointer hover:border-indigo-500/40"
        />
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          className="z-50 w-56 p-1 mt-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg focus:outline-none"
        >
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-900 text-left">
            <p className="text-sm font-bold truncate text-slate-900 dark:text-white leading-tight">
              {user.name}
            </p>
            <p className="text-xs truncate text-slate-500 dark:text-slate-450 mt-0.5 leading-none">
              {user.email}
            </p>
          </div>

          <DropdownMenuPrimitive.Item
            onClick={onSettings}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-slate-50 dark:focus:bg-slate-900 focus:outline-none cursor-pointer select-none"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </DropdownMenuPrimitive.Item>

          <DropdownMenuPrimitive.Separator className="h-px bg-slate-100 dark:bg-slate-900 my-1" />

          <DropdownMenuPrimitive.Item
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm text-red-650 hover:bg-red-50/20 dark:hover:bg-red-950/10 focus:outline-none cursor-pointer select-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export function UserMenu(props: UserMenuProps) {
  return <ProfileDropdown {...props} />;
}
