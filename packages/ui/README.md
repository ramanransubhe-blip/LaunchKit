# @devlaunchkit/ui

An enterprise-grade, highly accessible, and visually stunning React 19 UI component library styled with Tailwind CSS v4 and Framer Motion.

---

## 📦 Installation

To use this library inside the monorepo workspace, add it to your `package.json` dependencies:

```json
"dependencies": {
  "@devlaunchkit/ui": "workspace:*"
}
```

Then run:
```bash
pnpm install
```

---

## 🎨 Theming

Configure `ThemeProvider` at the root of your React tree to support light, dark, and system themes:

```tsx
import { ThemeProvider } from "@devlaunchkit/ui";

export default function Layout({ children }) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
    </ThemeProvider>
  );
}
```

---

## 🧩 Component Directory

### 1. Typography & Layouts
*   `Heading`, `Title`, `Subtitle`, `Body`, `Caption`, `Code`, `Quote`, `GradientText`, `AnimatedText`
*   `Container`, `Section`, `Grid`, `Stack`, `Page`, `SidebarLayout`, `DashboardLayout`, `AuthLayout`

### 2. Navigation
*   `Navbar`, `Sidebar`, `Breadcrumbs`, `CommandMenu`, `SearchBar`, `Tabs`, `Pagination`, `DropdownMenu`, `ContextMenu`

### 3. Controls & Forms
*   `Button`, `IconButton`, `SplitButton`, `CopyButton`, `AnimatedButton`
*   `Input`, `Textarea`, `PasswordInput`, `OTPInput`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `Select`, `MultiSelect`, `Autocomplete`, `DatePicker`, `TimePicker`, `FileUpload`, `ImageUpload`, `ColorPicker`, `MarkdownEditor`, `RichTextEditor`

### 4. Data Display & Feedback
*   `Card`, `StatisticCard`, `Table`, `DataTable`, `Avatar`, `Badge`, `Tag`, `Timeline`, `Accordion`, `Alert`, `Callout`, `Tooltip`, `Popover`, `Progress`, `CircularProgress`, `Skeleton`, `Separator`, `Calendar`, `Charts` (responsive SVG charts)
*   `Toast` (context provider + hooks), `Notification`, `LoadingSpinner`, `LoadingScreen`, `SuccessAnimation`, `ErrorState`, `EmptyState`

### 5. Overlays, AI, Auth & Payments
*   `Dialog`, `Drawer`, `BottomSheet`, `DeleteDialog`
*   `ChatWindow`, `StreamingResponse`, `CodeBlock`, `MessageBubble`, `ThinkingIndicator`, `ToolCallRenderer`
*   `LoginCard`, `SignupCard`, `MagicLink`, `ProfileDropdown`
*   `PricingCard`, `SubscriptionCard`, `PlanComparison`, `CheckoutSummary`, `BillingHistory`, `UsageMeter`
*   `UserTable`, `RoleBadge`, `PermissionTable`, `AuditLogViewer`, `SystemStatus`

---

## ♿ Accessibility

All complex interactive elements utilize Radix UI primitives for full keyboard navigation, screen-reader support, and ARIA properties, complying with **WCAG AA** standards.
