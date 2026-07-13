# Authentication Flow & Routing Sequence

This document describes the routing flows, middleware checks, and callback sequences when a user interacts with the DevLaunchKit Authentication Platform.

---

## 1. Sign In / Sign Up Flow

The client invokes the auth platform, which routes the request to our API dispatcher:

```mermaid
sequenceDiagram
    participant User as Browser / Client
    participant API as /api/auth/[operation]
    participant Service as AuthService Decorator
    participant Adapter as Provider Bridge (Better Auth / Clerk)
    participant External as API Server

    User->>API: POST /api/auth/signIn (credentials)
    API->>Service: signIn(credentials)
    Note over Service: Assert not locked<br/>Validate complex password
    Service->>Adapter: signIn(credentials)
    Adapter->>External: POST /sign-in (REST call)
    External-->>Adapter: Return User + Session Payload
    Adapter-->>Service: Return AuthResult
    Note over Service: Record successful login attempt
    Service-->>API: Response (AuthResult)
    API-->>User: Set session cookies + JSON payload
```

---

## 2. Protected Routes Middleware Verification

```mermaid
graph TD
    Request[Incoming HTTP Request] --> MatchRoute{Matches Route Policy?}
    MatchRoute -- Public --> Allow[Allow request to proceed]
    MatchRoute -- Protected --> VerifyAuth{Session token present?}
    VerifyAuth -- No --> RedirectLogin[Redirect to /login?next=...]
    VerifyAuth -- Yes --> VerifyAdmin{Requires Admin Access?}
    VerifyAdmin -- Yes --> RoleCheck{User is Admin?}
    RoleCheck -- No --> Forbidden[Redirect to /403]
    RoleCheck -- Yes --> VerifyOrg{Requires Org Context?}
    VerifyOrg -- Yes --> OrgCheck{Organization active?}
    OrgCheck -- No --> SelectOrg[Redirect to /select-org]
    OrgCheck -- Yes --> Allow
    VerifyAdmin -- No --> VerifyOrg
    VerifyAuth -- Yes --> Allow
```
