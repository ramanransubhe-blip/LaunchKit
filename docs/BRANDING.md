# Brand Guidelines & Asset Prompts

Design system tokens, logo guidelines, and high-quality image generation prompts.

---

## Purpose

This document provides guidelines for DevLaunchKit's brand system (typography, color palette, iconography) and includes detailed prompts for Midjourney / DALL-E to generate all repository visual assets.

## Prerequisites

None.

---

## Design System Tokens

### 1. Typography

- **Headings & Accents**: **Outfit** (Google Fonts). Sleek, geometric, modern.
- **Body & Code**: **Inter** & **JetBrains Mono**. Neutral, highly legible.

### 2. Color Palette

- **Primary (Dark)**: Slate `#0f172a` (slate-900), deep black `#020617` (slate-950).
- **Accent (Emerald)**: Emerald `#10b981` (emerald-500), mint `#34d399` (emerald-400).
- **Secondary (Cyan)**: Cyan `#06b6d4` (cyan-500).

### 3. Iconography

- **Library**: Lucide React. Light weight (`stroke-width: 1.5`), modern, clean.

---

## AI Image Generation Prompts

Use these prompts inside Midjourney (v6) or DALL-E 3 to regenerate brand assets:

### 1. Hero Banner (`hero_banner.png`)

> **Prompt**: Modern SaaS landing page hero section illustration. Dark slate theme, glowing emerald green and cyan vector lines, tech grid dashboard pattern, clean minimalist UI mockup. Ultra-high resolution, studio lighting, vector style, 3D abstract shapes, Unreal Engine 5 render, cinematic lighting --ar 16:9 --style raw

### 2. Dashboard Screenshot (`dashboard_screenshot.png`)

> **Prompt**: Premium SaaS dashboard user interface design, dark mode. Analytics charts showing monthly recurring revenue, bar charts, collapsible sidebar with Lucide icons, glassmorphism card layouts, Outfit typography, Inter font. Clean, modern, high fidelity --ar 16:9

### 3. Authentication Screenshot (`authentication.png`)

> **Prompt**: Minimalist web sign-in login card, glassmorphic design, glowing border. Dark mode slate background. Input boxes for Email and Password, OAuth login buttons (Google, Github). Clean typography, premium design --ar 16:9

### 4. Billing Screenshot (`billing_platform.png`)

> **Prompt**: SaaS pricing matrix screen mockup. Two cards showing "Starter" and "Pro" subscription options. Monthly / Yearly toggle switch. Dark mode, slate theme, emerald green action buttons. Sleek card layout --ar 16:9

### 5. AI Platform Screenshot (`ai_platform.png`)

> **Prompt**: AI Chat assistant panel design. Chat bubbles displaying code formatting syntax highlighting, thinking state indicator, clean prompt input box. Slate dark background, glowing green accents. Futuristic UI design --ar 16:9

### 6. Storage Platform Screenshot (`storage_platform.png`)

> **Prompt**: SaaS media library uploader UI card. Drag-and-drop file dashed border, list of files (avatar.png, report.pdf) with upload progress indicators. Minimal design, dark mode --ar 16:9

### 7. Admin Dashboard (`admin_panel.png`)

> **Prompt**: Server telemetry console UI. Database connection health dials, user sessions list table, audit logs. Dark theme, neon green success ticks. Dashboard grid --ar 16:9

### 8. Architecture Diagram (`architecture_diagram.png`)

> **Prompt**: Minimalist tech architecture diagram, neat nodes. Flow showing user request hitting middleware, routing to auth, database, payments. Slate background, glowing cyan arrows. UI illustration --ar 16:9

### 9. GitHub Social Preview (`readme_illustration.png`)

> **Prompt**: Open source developer repository branding card, DevLaunchKit logo in center, glowing cyan and green lines, clean typography, dark theme --ar 16:9

---

## Screenshots Placeholder

![Branding Cover Sheet Layout](/assets/readme_illustration.png)
_DevLaunchKit flagship open-source brand preview card._

---

## Best Practices

- **Use consistent color accents**: In all UI designs and visual assets, keep the focus on deep Slate slate-900 background with glowing Emerald mint-400 borders to maintain a premium feel.
- **Keep spacing clean**: Adopt generous padding (`p-6` or `p-8`) to give UI elements breathing room.

## Common Mistakes

- **Using browser default fonts**: Leaving browser defaults active, which degrades the premium aesthetic. Use Outfit and Inter fonts.
- **Overusing neon colors**: Using plain primary colors rather than HSL-tailored slate and emerald gradients.

---

## Troubleshooting

- **Images don't render properly**:
  - Double check that asset image files are saved directly under the `assets/` root folder and linked using absolute file paths.
