# Layout System Architecture

The layout system coordinates collapsible sidebars, dynamic spacing, and standard view container constraints.

## Major Layout Wrappers

### 1. `DashboardProviders`
Encapsulates state context for:
- Sidebar open/collapsed state (`useSidebar()`)
- Breadcrumbs title arrays (`useBreadcrumbs()`)
- Active organization properties.

### 2. `DashboardSidebar`
Collapsible side menu with groups and sub-items.
- **Desktop mode**: Collapses to `w-16` or expands to `w-64`. Supports favorite items and pinned options.
- **Mobile mode**: Rendered as a slide-out navigation drawer toggled by the header menu toggle button.

### 3. `Topbar`
Stickily positioned header bar with:
- Dynamic Breadcrumb links
- Quick Search command console buttons
- Notification indicators
- Account drop-down menus
