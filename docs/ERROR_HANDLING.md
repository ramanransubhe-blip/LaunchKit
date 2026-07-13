# Error Handling Guidelines

**DevLaunchKit** implements a unified, structured error handling architecture built on custom subclasses extending the native JS `Error` class.

## Error Hierarchy & HTTP Status Mapping

All custom errors inherit from the base `ApplicationError` class, which automatically maps error states to HTTP status codes and serializes details cleanly for API responses.

| Class Name | Error Code | HTTP Status | Use Case |
| :--- | :--- | :--- | :--- |
| `ValidationError` | `VALIDATION_ERROR` | `400` | Malformed payloads, invalid formats. |
| `AuthenticationError`| `AUTHENTICATION_ERROR` | `401` | Session token missing, expired, or invalid. |
| `AuthorizationError` | `AUTHORIZATION_ERROR` | `403` | Insufficient roles/permissions privileges. |
| `NotFoundError` | `NOT_FOUND_ERROR` | `404` | Database record or route resource not found. |
| `DatabaseError` | `DATABASE_ERROR` | `500` | Database queries or transaction failures. |
| `PaymentError` | `PAYMENT_ERROR` | `402` | Stripe declines, invalid cards, pricing mismatch. |
| `RateLimitError` | `RATE_LIMIT_ERROR` | `429` | Sliding window rate limits breached. |
| `UnknownError` | `UNKNOWN_ERROR` | `500` | Uncaught exceptions. |

---

## Usage Examples

### Throwing Errors
```typescript
import { ValidationError, NotFoundError } from "@devlaunchkit/errors";

// Throw validation error with details
if (!payload.email) {
  throw new ValidationError("Email is required", { email: ["Must not be blank"] });
}

// Throw not found
if (!user) {
  throw new NotFoundError("User profile does not exist");
}
```

### Catching & Serializing Errors in APIs
The `serializeError()` helper translates any error object (custom or native) into a unified JSON format:

```typescript
import { serializeError } from "@devlaunchkit/errors";

try {
  // run request logic
} catch (err) {
  const jsonResponse = serializeError(err);
  return Response.json(jsonResponse, { status: err.statusCode || 500 });
}
```

### Serialized JSON Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body payload",
    "details": {
      "email": ["Invalid email address format"]
    }
  }
}
```
