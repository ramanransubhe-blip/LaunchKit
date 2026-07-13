# Installation Guide

Follow these steps to configure DevLaunchKit locally:

---

## Prerequisites

- **Node.js**: Version 20 or higher.
- **pnpm**: Version 9 or higher.
- **PostgreSQL**: Local database or Supabase instance.

---

## Step-by-Step

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-org/LaunchKit.git
    cd LaunchKit
    ```
2.  **Install Monorepo Dependencies**:
    ```bash
    pnpm install
    ```
3.  **Configure Environment Variables**:
    Copy `.env.example` to `.env` and fill in credentials.
4.  **Run Development Server**:
    ```bash
    pnpm dev
    ```
