# Settings Framework

LaunchKit includes a modular Settings layout engine that structures preferences, billing pages, and user security forms.

---

## Settings Split Columns

Use `SettingsLayout` to pair a sidebar list with form content cards:

```typescript
import { SettingsLayout, SettingsCard, DangerZone } from "@devlaunchkit/ui";

export function CustomSettings() {
  return (
    <SettingsLayout
      sidebarItems={[
        { id: "profile", label: "Edit Profile" },
        { id: "security", label: "Security" }
      ]}
      activeId="profile"
      onSectionSelect={(id) => console.log(id)}
    >
      <SettingsCard title="User Avatar" description="Upload a workspace profile photo.">
        {/* Form elements */}
      </SettingsCard>
      
      <DangerZone
        title="Delete workspace"
        onAction={() => handleDelete()}
      />
    </SettingsLayout>
  );
}
```
