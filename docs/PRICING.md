# Pricing Matrix UI Components

The `@devlaunchkit/ui` package exports pricing matrices and summary cards:

---

## Reusable Pricing Table

Use pricing cards with monthly and yearly selectors:

```typescript
import { SettingsCard } from "@devlaunchkit/ui";

export function PlansGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SettingsCard title="Free Sandbox" footer={<button>Activate</button>}>
        <div className="text-xl font-bold">$0</div>
        <p className="text-xs text-neutral-500">Perfect for sandbox testing.</p>
      </SettingsCard>
      
      <SettingsCard title="Pro Subscription" footer={<button>Upgrade</button>}>
        <div className="text-xl font-bold">$29</div>
        <p className="text-xs text-neutral-500">Ideal for team collaborations.</p>
      </SettingsCard>
    </div>
  );
}
```
