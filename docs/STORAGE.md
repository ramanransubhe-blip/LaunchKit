# File Storage & Media Guide

Configuring and using the provider-agnostic File Storage Platform.

---

## Purpose
This document explains the architecture of `@devlaunchkit/storage`, detailing setup options for Supabase Storage and AWS S3 adapters, upload patterns, secure signed URLs generation, and media optimizations.

## Prerequisites
- Supabase account & project (if using Supabase storage)
- AWS account & S3 bucket permissions (if using AWS S3)

---

## Storage Adapter Abstraction

DevLaunchKit manages files through `@devlaunchkit/storage` which wraps operations behind a common interface:

```typescript
export interface StorageService {
  uploadFile(bucket: string, path: string, file: Buffer | Blob, mimeType: string): Promise<UploadResult>;
  downloadFile(bucket: string, path: string): Promise<Buffer>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getSignedUrl(bucket: string, path: string, expiresInSeconds?: number): Promise<string>;
  getPublicUrl(bucket: string, path: string): Promise<string>;
}
```

```
           ┌──────────────────────┐
           │ @devlaunchkit/storage│
           └──────────┬───────────┘
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
     [Supabase Storage]     [AWS S3]
```

---

## Configuration Setup

### 1. Supabase Storage Configuration (Default)
Supabase provides a fast, developer-friendly object storage service:
1. Create a public or private bucket named `avatars` or `media` in your Supabase console.
2. In `.env`, configure the connection endpoints:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
   ```

### 2. AWS S3 Configuration
AWS S3 is the industry gold-standard for scalable asset storage:
1. Create an S3 Bucket and configure IAM user credentials with S3 read/write policy access.
2. Add your AWS credentials to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=my-launchkit-bucket
   ```
3. When AWS credentials are set, `@devlaunchkit/storage` switches to the S3 Client adapter automatically.

---

## Usage Examples

### 1. Uploading user profile avatar
```typescript
import { storage } from "@devlaunchkit/storage";

const fileBuffer = Buffer.from("...");
const result = await storage.uploadFile("media", "avatars/user-1.png", fileBuffer, "image/png");
console.log("Uploaded successfully. Public URL:", result.url);
```

### 2. Generating Temporary Signed URLs
```typescript
import { storage } from "@devlaunchkit/storage";

// Generate a secure link valid for 1 hour
const secureUrl = await storage.getSignedUrl("media", "reports/invoice-102.pdf", 3600);
console.log("Secure invoice URL:", secureUrl);
```

---

## Screenshots Placeholder
![File Upload Dashboard Interface](/assets/storage_platform.png)
*Drag-and-drop media uploader component with upload progress state bars.*

---

## Best Practices
- **Use Signed URLs for private files**: Never put documents, invoices, or personal user data in public buckets. Always use private buckets and serve files using `getSignedUrl` with short expiry times.
- **Implement size limits**: Add middleware validation to restrict file upload sizes (e.g. max 5MB for avatars) to avoid storage capacity exhaustion.

## Common Mistakes
- **Unrestricted Public Buckets**: Creating public buckets for confidential items like customer data, leaving them open to scraping.
- **Missing CORS Configuration**: Forgetting to configure CORS rules in your AWS S3 bucket or Supabase parameters, resulting in browser uploader canvas fetch blockages.

---

## Troubleshooting
- **AWS S3 Access Denied (Status 403)**:
  - Check that the IAM user keys in `.env` match the user with write permissions on the target S3 bucket.
  - Verify that the S3 bucket is in the same AWS region specified in `AWS_REGION`.
- **CORS blockages in browser uploads**:
  - Add the following origin to your bucket CORS configuration list: `http://localhost:3000`.
