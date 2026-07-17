# Global Search & Command Palette

The global search system acts as a central command palette for quick navigation and actions.

---

## Keyboard Hotkey Listener

Pressing `Cmd+K` or `Ctrl+K` toggles the palette. Pressing `Esc` closes it.

---

## Interactive Command Items

Pass arrays of commands to `CommandPalette` to run arbitrary actions:

```typescript
const commands = [
  {
    id: "go-analytics",
    title: "Navigate to system analytics",
    category: "Navigation",
    action: () => router.push("/dashboard/analytics"),
    shortcut: ["G", "A"],
  },
];
```

## Fuzzy Search Groups

Typing in the search input performs category and title filter matching, grouping results dynamically into categories.

- Up and down arrows adjust the selected item index.
- Enter runs the command's callback.
