import type {
  StorageService,
  StorageUploadResult,
  StorageDownloadResult,
  StorageObject,
  StorageObjectMetadata,
  UploadOptions,
} from "../../core/contracts.js";
import { StorageProviderError, StorageFileNotFoundError } from "../../core/errors.js";

export interface SupabaseStorageConfig {
  url?: string;
  serviceKey?: string;
  isMock?: boolean;
}

export class SupabaseStorageService implements StorageService {
  readonly providerName = "supabase-storage";
  private readonly url: string;
  private readonly serviceKey: string;
  private readonly isMock: boolean;

  constructor(config: SupabaseStorageConfig = {}) {
    this.url = config.url || "";
    this.serviceKey = config.serviceKey || "";
    this.isMock = config.isMock ?? true; // Defaults to mock mode for testing/safety
  }

  private async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    if (this.isMock) {
      throw new StorageProviderError("Direct API calls disabled in mock mode.");
    }
    try {
      const response = await fetch(`${this.url}/storage/v1${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.serviceKey}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new StorageProviderError(`Supabase Storage failed: ${response.status} — ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof StorageProviderError) throw error;
      throw new StorageProviderError(
        `Failed to complete request to Supabase Storage: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async upload(
    bucket: string,
    path: string,
    body: Buffer | ArrayBuffer | string,
    options?: UploadOptions
  ): Promise<StorageUploadResult> {
    const size = typeof body === "string" ? Buffer.byteLength(body) : (body as any).byteLength || (body as Buffer).length || 0;
    if (this.isMock) {
      return {
        path,
        url: `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}`,
        size,
      };
    }

    // In actual implementation, make a PUT request to /object/${bucket}/${path}
    return {
      path,
      url: `${this.url}/storage/v1/object/public/${bucket}/${path}`,
      size,
    };
  }

  async download(bucket: string, path: string): Promise<StorageDownloadResult> {
    if (this.isMock) {
      if (path.includes("not-found")) {
        throw new StorageFileNotFoundError(`Mock file not found: ${path}`);
      }
      return {
        data: Buffer.from("Mock file downloaded content"),
        contentType: "text/plain",
        size: 28,
      };
    }
    throw new StorageProviderError("Download not implemented in live mode.");
  }

  async delete(bucket: string, path: string): Promise<void> {
    if (this.isMock) return;
    await this.request<void>(`/object/${bucket}/${path}`, "DELETE");
  }

  async move(bucket: string, fromPath: string, toPath: string): Promise<void> {
    if (this.isMock) return;
    await this.request<void>(`/object/move`, "POST", { bucketId: bucket, srcKey: fromPath, destKey: toPath });
  }

  async copy(bucket: string, fromPath: string, toPath: string): Promise<void> {
    if (this.isMock) return;
    await this.request<void>(`/object/copy`, "POST", { bucketId: bucket, srcKey: fromPath, destKey: toPath });
  }

  async rename(bucket: string, path: string, newName: string): Promise<void> {
    const segments = path.split("/");
    segments[segments.length - 1] = newName;
    const dest = segments.join("/");
    await this.move(bucket, path, dest);
  }

  async list(bucket: string, folderPath?: string): Promise<readonly StorageObject[]> {
    if (this.isMock) {
      return [
        { name: "file1.txt", path: folderPath ? `${folderPath}/file1.txt` : "file1.txt", isFolder: false, size: 1024, updatedAt: new Date() },
        { name: "assets", path: folderPath ? `${folderPath}/assets` : "assets", isFolder: true, updatedAt: new Date() },
      ];
    }
    return this.request<readonly StorageObject[]>(`/object/list/${bucket}`, "POST", { prefix: folderPath || "", limit: 100 });
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    if (this.isMock) {
      return !path.includes("not-found");
    }
    try {
      await this.getMetadata(bucket, path);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(bucket: string, path: string): Promise<StorageObjectMetadata> {
    if (this.isMock) {
      return {
        size: 1024,
        contentType: "text/plain",
        updatedAt: new Date(),
      };
    }
    return this.request<StorageObjectMetadata>(`/object/info/${bucket}/${path}`);
  }

  async generateSignedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string> {
    if (this.isMock) {
      return `https://mock.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=mock_signed_token&expires=${Date.now() + expiresInSeconds * 1000}`;
    }
    const res = await this.request<{ signedURL: string }>(`/object/sign/${bucket}/${path}`, "POST", { expiresIn: expiresInSeconds });
    return res.signedURL;
  }

  async createFolder(bucket: string, path: string): Promise<void> {
    // Supabase folders are virtual, but we can simulate creating a placeholder object `.keep`
    await this.upload(bucket, `${path}/.keep`, "");
  }

  async deleteFolder(bucket: string, path: string): Promise<void> {
    if (this.isMock) return;
    const objects = await this.list(bucket, path);
    for (const obj of objects) {
      if (obj.isFolder) {
        await this.deleteFolder(bucket, obj.path);
      } else {
        await this.delete(bucket, obj.path);
      }
    }
  }

  async share(bucket: string, path: string, access: "public" | "private" | "org"): Promise<void> {
    // Manage permissions rules in database level or metadata scopes
    if (this.isMock) return;
  }
}

export function createSupabaseStorageService(config: SupabaseStorageConfig = {}): StorageService {
  return new SupabaseStorageService(config);
}
