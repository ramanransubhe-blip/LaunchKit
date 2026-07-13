import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider, ToastProvider } from "@devlaunchkit/ui";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LaunchKit — Enterprise SaaS Foundation",
  description: "Next.js 15, React 19, Tailwind CSS v4 monorepo template.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider defaultTheme="system">
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
