"use client";

import { useState } from "react";
import {
  Navbar,
  ThemeToggle,
  Heading,
  Title,
  Subtitle,
  Body,
  Caption,
  Code,
  Quote,
  Muted,
  GradientText,
  AnimatedText,
  Container,
  Section,
  Grid,
  Stack,
  Page,
  SidebarLayout,
  Tabs,
  Button,
  IconButton,
  SplitButton,
  CopyButton,
  AnimatedButton,
  Input,
  Textarea,
  PasswordInput,
  OTPInput,
  Checkbox,
  Switch,
  Slider,
  Select,
  MultiSelect,
  Autocomplete,
  DatePicker,
  TimePicker,
  FileUpload,
  ImageUpload,
  ColorPicker,
  MarkdownEditor,
  RichTextEditor,
  Card,
  StatisticCard,
  Table,
  DataTable,
  Avatar,
  Badge,
  Tag,
  Timeline,
  Accordion,
  Alert,
  Callout,
  Tooltip,
  Popover,
  HoverCard,
  Progress,
  CircularProgress,
  Skeleton,
  Separator,
  Calendar,
  Charts,
  MetricCards,
  ToastProvider,
  useToast,
  Dialog,
  Drawer,
  BottomSheet,
  ConfirmationDialog,
  DeleteDialog,
  ImageViewer,
  ChatWindow,
  StreamingResponse,
  CodeBlock,
  MessageBubble,
  ThinkingIndicator,
  TypingIndicator,
  ToolCallRenderer,
  ConversationSidebar,
  UserTable,
  RoleBadge,
  PermissionTable,
  AuditLogViewer,
  SystemStatus,
  Icons,
  cn,
  AnalyticsCards,
  RevenueCards,
  PricingCard,
  SubscriptionCard,
  PlanComparison,
  CheckoutSummary,
  BillingHistory,
  UsageMeter,
} from "@devlaunchkit/ui";

export default function DemoPage() {
  const { showToast } = useToast();

  // Active Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Input states
  const [otp, setOtp] = useState("");
  const [checked, setChecked] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [sliderVal, setSliderVal] = useState([45]);
  const [selectVal, setSelectVal] = useState("pro");
  const [radioVal, setRadioVal] = useState("email");
  const [multiVal, setMultiVal] = useState(["react", "nextjs"]);
  const [autoVal, setAutoVal] = useState("usd");
  const [dateVal, setDateVal] = useState("2026-07-12");
  const [timeVal, setTimeVal] = useState("12:00");
  const [colorVal, setColorVal] = useState("#6366f1");

  // Dialog/Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // AI Chat States
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I am your LaunchKit AI Copilot. Ask me to write code or run system checks.",
      thinking: "Initializing session... Connected to devlaunchkit-engine-v1.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState([
    { id: "1", title: "Monorepo Setup Helper", active: true },
    { id: "2", title: "Drizzle Schema Design", active: false },
  ]);

  const handleSendMessage = (text: string) => {
    // Add user message
    const userMsg = { id: Math.random().toString(), role: "user", content: text };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    // Simulate AI thinking and calling a tool
    setTimeout(() => {
      setActiveTools([
        {
          name: "verify_system_health",
          arguments: { checkDatabase: true, inspectCache: false },
          status: "running",
        },
      ]);
    }, 1000);

    setTimeout(() => {
      setActiveTools([
        {
          name: "verify_system_health",
          arguments: { checkDatabase: true, inspectCache: false },
          result: { status: "all_operational", latencyMs: 45, nodes: 3 },
          status: "success",
        },
      ]);
    }, 2200);

    // Add assistant streaming response
    setTimeout(() => {
      setChatLoading(false);
      const aiMsg = {
        id: Math.random().toString(),
        role: "assistant",
        content:
          'I ran a system diagnostic check. All database connections and workspace nodes are healthy! Here is the config code:\n\n```typescript\nconst status = {\n  health: "operational",\n  timestamp: Date.now()\n};\n```',
        thinking: "Running diagnostic tool... DB check complete. CodeBlock response generated.",
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      setActiveTools([]);
      showToast("Diagnostic check completed!", "success");
    }, 3500);
  };

  // Mock Data
  const pricingPlans = [
    {
      name: "Starter",
      price: "$0",
      period: "month",
      description: "Perfect for local bootstrapping and testing",
      features: [
        "1 Workspace project",
        "Single developer seat",
        "Local Sqlite support",
        "Community forums access",
      ],
    },
    {
      name: "Pro",
      price: "$49",
      period: "month",
      description: "Ideal for growing SaaS applications",
      features: [
        "Unlimited workspace projects",
        "5 Developer seats",
        "PostgreSQL database client",
        "Stripe payment integration wrapper",
        "Next.js 15 optimization presets",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "month",
      description: "Scale globally with support",
      features: [
        "Unlimited everything",
        "Dedicated private registry support",
        "Supabase deployment hooks",
        "Advanced AI streaming tools",
        "24/7 Priority support",
      ],
    },
  ];

  const comparedFeatures = [
    { name: "Billed Monthly", starter: "$0", pro: "$49", enterprise: "$199" },
    { name: "Workspace seats", starter: "1 Seat", pro: "5 Seats", enterprise: "Unlimited" },
    {
      name: "Database support",
      starter: "Sqlite only",
      pro: "PostgreSQL",
      enterprise: "Multiple Pools",
    },
    { name: "Advanced AI Streaming", starter: false, pro: true, enterprise: true },
    {
      name: "SLA Support Guarantee",
      starter: false,
      status: "Community",
      pro: "Next business day",
      enterprise: "1 Hour SLA",
    },
  ];

  const mockUsers = [
    {
      id: "1",
      name: "Jane Cooper",
      email: "jane.c@devlaunchkit.com",
      role: "owner" as const,
      status: "active" as const,
    },
    {
      id: "2",
      name: "Cody Fisher",
      email: "cody.f@devlaunchkit.com",
      role: "admin" as const,
      status: "active" as const,
    },
    {
      id: "3",
      name: "Esther Howard",
      email: "esther.h@devlaunchkit.com",
      role: "member" as const,
      status: "pending" as const,
    },
    {
      id: "4",
      name: "Jenny Wilson",
      email: "jenny.w@devlaunchkit.com",
      role: "guest" as const,
      status: "suspended" as const,
    },
  ];

  const auditLogs = [
    {
      id: "AUD-920",
      timestamp: "2026-07-12 12:00:23",
      user: "jane.c@devlaunchkit.com",
      action: "workspace_build_triggered",
      resource: "packages/ui",
      ip: "192.168.1.42",
    },
    {
      id: "AUD-919",
      timestamp: "2026-07-12 11:58:12",
      user: "cody.f@devlaunchkit.com",
      action: "database_migration_applied",
      resource: "packages/database",
      ip: "192.168.1.13",
    },
    {
      id: "AUD-918",
      timestamp: "2026-07-12 11:34:00",
      user: "esther.h@devlaunchkit.com",
      action: "stripe_webhook_verified",
      resource: "packages/payments",
      ip: "192.168.1.9",
    },
  ];

  return (
    <Page>
      {/* Navbar */}
      <Navbar
        logo={
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 text-white">
              <Icons.Layers className="w-5 h-5" />
            </div>
            <Heading level={4} className="font-extrabold m-0">
              LaunchKit
            </Heading>
          </div>
        }
        links={
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold transition",
                activeTab === "dashboard"
                  ? "bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("playbook")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold transition",
                activeTab === "playbook"
                  ? "bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              UI Playbook
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold transition",
                activeTab === "ai"
                  ? "bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              AI Playground
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-bold transition",
                activeTab === "billing"
                  ? "bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Billing & Checkout
            </button>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button size="sm" onClick={() => showToast("Welcome to LaunchKit UI System!", "info")}>
              Install UI
            </Button>
          </div>
        }
      />

      <Container className="py-8">
        {/* Render Active Tab */}

        {/* 1. Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="text-left border-b border-slate-100 dark:border-slate-900 pb-4">
              <Heading level={2} className="font-black m-0">
                System Dashboard
              </Heading>
              <Subtitle className="mt-1">
                Real-time status, telemetry metrics, and system log monitors.
              </Subtitle>
            </div>

            <AnalyticsCards />

            <Grid cols={12} gap={6}>
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* SVG Chart */}
                <Card>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-3 mb-2">
                    <Heading level={4} className="font-bold m-0">
                      Platform Traffic Volume
                    </Heading>
                    <Badge variant="primary">Last 30 days</Badge>
                  </div>
                  <Charts type="area" data={[12, 19, 3, 5, 2, 3, 24, 18, 30, 45, 38, 50, 42, 60]} />
                </Card>

                {/* Audit Logs */}
                <AuditLogViewer logs={auditLogs} />
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* System health monitor */}
                <SystemStatus
                  services={[
                    { name: "Next.js Frontend Server", status: "operational", latency: "12ms" },
                    { name: "PostgreSQL Database Pool", status: "operational", latency: "8ms" },
                    { name: "Stripe Billing Webhook Client", status: "operational" },
                    { name: "Gemini Model Gateway", status: "degraded", latency: "2.4s" },
                  ]}
                />
              </div>
            </Grid>
          </div>
        )}

        {/* 2. UI Playbook Tab */}
        {activeTab === "playbook" && (
          <div className="space-y-8">
            <div className="text-left border-b border-slate-100 dark:border-slate-900 pb-4">
              <Heading level={2} className="font-black m-0">
                UI Playbook
              </Heading>
              <Subtitle className="mt-1">
                Playground for core design elements, buttons, overlay dialogs, and form items.
              </Subtitle>
            </div>

            <Grid cols={12} gap={6}>
              {/* Left Column: Form Controls */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <Card className="text-left">
                  <Heading
                    level={4}
                    className="font-bold border-b border-slate-100 dark:border-slate-900 pb-3"
                  >
                    Form Playbox
                  </Heading>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <Input label="Name" placeholder="John Doe" />
                    <PasswordInput label="Workspace Password" placeholder="••••••••" />
                    <Select
                      label="Pricing Plan"
                      value={selectVal}
                      onValueChange={setSelectVal}
                      options={[
                        { label: "Starter Edition", value: "starter" },
                        { label: "Pro Edition", value: "pro" },
                        { label: "Enterprise Edition", value: "enterprise" },
                      ]}
                    />
                    <MultiSelect
                      label="Workspace stack"
                      selected={multiVal}
                      onChange={setMultiVal}
                      options={[
                        { label: "React 19", value: "react" },
                        { label: "Next.js 15", value: "nextjs" },
                        { label: "Tailwind v4", value: "tailwind" },
                        { label: "PostgreSQL", value: "postgres" },
                      ]}
                    />
                    <Autocomplete
                      label="Project Currency"
                      value={autoVal}
                      onValueChange={setAutoVal}
                      options={[
                        { label: "US Dollar (USD)", value: "usd" },
                        { label: "Euro (EUR)", value: "eur" },
                        { label: "British Pound (GBP)", value: "gbp" },
                      ]}
                    />
                    <DatePicker
                      label="Billing Period Start"
                      value={dateVal}
                      onChange={setDateVal}
                    />
                    <TimePicker label="Daily Backup Time" value={timeVal} onChange={setTimeVal} />
                    <ColorPicker
                      label="Brand Primary Color"
                      value={colorVal}
                      onChange={setColorVal}
                    />
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-6 items-center">
                      <Checkbox
                        id="demo-check"
                        checked={checked}
                        onCheckedChange={setChecked}
                        label="Accept workspace rules"
                      />
                      <Switch
                        checked={switchChecked}
                        onCheckedChange={setSwitchChecked}
                        label="Notify on CPU spikes"
                      />
                    </div>
                    <Slider
                      value={sliderVal}
                      onValueChange={setSliderVal}
                      label="Database pool usage limit"
                    />
                  </div>
                  <Separator className="my-4" />
                  <FileUpload label="Attach legal documents" />
                  <ImageUpload label="User Avatar Image" />
                </Card>

                {/* Markdown Editors */}
                <Card>
                  <Heading
                    level={4}
                    className="font-bold border-b border-slate-100 dark:border-slate-900 pb-3"
                  >
                    Workspace Editors
                  </Heading>
                  <MarkdownEditor label="Workspace Wiki (Markdown)" />
                  <RichTextEditor label="System Updates Broadcast (Rich Text)" />
                </Card>
              </div>

              {/* Right Column: Buttons & Modal Triggers */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <Card>
                  <Heading
                    level={4}
                    className="font-bold border-b border-slate-100 dark:border-slate-900 pb-3"
                  >
                    Button Actions
                  </Heading>
                  <Stack spacing={4} className="pt-2">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="danger">Danger Button</Button>
                    <Button variant="success">Success Button</Button>
                    <Button loading variant="primary">
                      Loading State
                    </Button>
                    <div className="flex gap-2.5">
                      <IconButton
                        icon={<Icons.Trash className="w-4 h-4 text-red-500" />}
                        aria-label="Delete"
                      />
                      <CopyButton value="LaunchKit token: 928X-10XW-909" />
                      <SplitButton options={["Trigger Cache Clear", "Force Database Sync"]}>
                        Actions Menu
                      </SplitButton>
                    </div>
                    <AnimatedButton glow className="w-full">
                      Animated Glowing Button
                    </AnimatedButton>
                  </Stack>
                </Card>

                {/* Overlays / Modals Triggers */}
                <Card className="text-left">
                  <Heading
                    level={4}
                    className="font-bold border-b border-slate-100 dark:border-slate-900 pb-3"
                  >
                    Modals & Overlays
                  </Heading>
                  <Stack spacing={4} className="pt-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                      Open Standard Dialog
                    </Button>
                    <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
                      Open Right Drawer
                    </Button>
                    <Button variant="outline" onClick={() => setIsConfirmOpen(true)}>
                      Open Confirmation Dialog
                    </Button>
                    <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
                      Open Deletion Modal
                    </Button>
                  </Stack>

                  {/* Standard Dialog */}
                  <Dialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    title="Standard Workspace Dialog"
                    description="Manage database node rules."
                  >
                    <p className="text-sm leading-relaxed text-slate-500">
                      This dialog is styled in a premium dark glass look, fully accessible with
                      focus traps and keyboard escapes.
                    </p>
                  </Dialog>

                  {/* Drawer */}
                  <Drawer
                    open={isDrawerOpen}
                    onOpenChange={setIsDrawerOpen}
                    title="Sidebar Configurations Drawer"
                  >
                    <p className="text-sm text-slate-500">
                      Configure your local workspace folders, project dependencies, and environment
                      keys here.
                    </p>
                  </Drawer>

                  {/* Confirmation */}
                  <ConfirmationDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    title="Clear System Cache?"
                    message="Clearing the cache will cause momentary request latency spikes while resources reload."
                    onConfirm={() => showToast("System Cache Cleared", "success")}
                  />

                  {/* Deletion Dialog */}
                  <DeleteDialog
                    open={isDeleteOpen}
                    onOpenChange={setIsDeleteOpen}
                    onConfirm={() => showToast("Repository Deleted!", "error")}
                    itemName="LaunchKit"
                  />
                </Card>
              </div>
            </Grid>
          </div>
        )}

        {/* 3. AI Chat Playground */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="text-left border-b border-slate-100 dark:border-slate-900 pb-4">
              <Heading level={2} className="font-black m-0">
                AI Chat Playground
              </Heading>
              <Subtitle className="mt-1">
                Interactive assistant layout demonstrating message bubbles, thinking animations, and
                tool calls.
              </Subtitle>
            </div>

            <div className="flex h-[600px] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950">
              <ConversationSidebar
                sessions={chatSessions}
                onSelectSession={(id) => {
                  setChatSessions((prev) => prev.map((s) => ({ ...s, active: s.id === id })));
                  showToast("Session Switched", "info");
                }}
                onNewChat={() => showToast("New Chat Created", "success")}
              />
              <ChatWindow
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                loading={chatLoading}
                tools={activeTools}
              />
            </div>
          </div>
        )}

        {/* 4. Billing Tab */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="text-left border-b border-slate-100 dark:border-slate-900 pb-4">
              <Heading level={2} className="font-black m-0">
                Billing & Pricing Plan
              </Heading>
              <Subtitle className="mt-1">
                Mock checkout sheets, pricing tiers comparison, and receipt invoice lists.
              </Subtitle>
            </div>

            {/* Pricing tier list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <PricingCard
                  key={plan.name}
                  plan={plan}
                  onSelect={() => showToast(`Selected Plan: ${plan.name}`, "success")}
                />
              ))}
            </div>

            <Grid cols={12} gap={6}>
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Plan comparison */}
                <PlanComparison features={comparedFeatures} />

                {/* Billing invoice list */}
                <BillingHistory
                  invoices={[
                    { id: "INV-001", date: "July 12, 2026", amount: "$49.00", status: "paid" },
                    { id: "INV-002", date: "June 12, 2026", amount: "$49.00", status: "paid" },
                  ]}
                  onDownload={(id: string) => showToast(`Downloading Invoice ${id}...`, "info")}
                />
              </div>

              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Usage meter */}
                <div className="space-y-4">
                  <UsageMeter
                    label="API requests this month"
                    value={6542}
                    max={10000}
                    unit="reqs"
                  />
                  <UsageMeter label="Storage quota" value={42} max={50} unit="GB" />
                </div>

                {/* Checkout summary */}
                <CheckoutSummary
                  items={[
                    { name: "Pro Plan Subscription", price: 49.0 },
                    { name: "Addon AI Streaming API Keys", price: 10.0 },
                  ]}
                  discount={9.0}
                  onCheckout={() => showToast("Checkout payment simulation started", "success")}
                />
              </div>
            </Grid>
          </div>
        )}
      </Container>
    </Page>
  );
}
