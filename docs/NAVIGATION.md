# Navigation & Menu Systems

LaunchKit provides nested sidebar items, active path highlighting, pinning features, and keybindings.

## Nested Side Navigation

Items in the sidebar can contain sub-links. Expanding an item shows sub-options:

```typescript
const navItem = {
  title: "Preferences",
  href: "/settings",
  items: [
    { title: "General", href: "/settings" },
    { title: "Account", href: "/account" },
  ],
};
```

## Active Route Highlight

The framework compares `activeHref` with current Next.js `pathname` segments to highlight active sidebar tabs with standard brand colors.

---

## Favorites and Pinned Items

Users can toggle custom pins on dashboard route paths.

- Pinned and favorited keys are persisted directly in local memory and sorted at the top of the navigation list.
