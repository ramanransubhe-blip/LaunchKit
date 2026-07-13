import type {
  StorageService,
  StorageUploadResult,
  StorageDownloadResult,
  StorageObject,
  StorageObjectMetadata,
  UploadOptions,
} from "../../core/contracts.js";
import { StorageProviderError, StorageFileNotFoundError } from "../../core/errors.js";

export interface S3StorageConfig {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  isMock?: boolean;
}

export class S3StorageService implements StorageService {
  readonly providerName = "aws-s3";
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly region: string;
  private readonly isMock: boolean;

  constructor(config: S3StorageConfig = {}) {
    this.accessKeyId = config.accessKeyId || "";
    this.secretAccessKey = config.secretAccessKey || "";
    this.region = config.region || "us-east-1";
    this.isMock = config.isMock ?? true;
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
        url: `https://${bucket}.s3.${this.region}.amazonaws.com/${path}`,
        size,
      };
    }
    throw new StorageProviderError("Live S3 uploads not configured.");
  }

  async download(bucket: string, path: string): Promise<StorageDownloadResult> {
    if (this.isMock) {
      if (path.includes("not-found")) {
        throw new StorageFileNotFoundError(`Mock S3 file not found: ${path}`);
      }
      return {
        data: Buffer.from("Mock S3 file downloaded content"),
        contentType: "text/plain",
        size: 31,
      };
    }
    throw new StorageProviderError("Download not implemented in live mode.");
  }

  async delete(bucket: string, path: string): Promise<void> {
    if (this.isMock) return;
  }

  async move(bucket: string, fromPath: string, toPath: string): Promise<void> {
    if (this.isMock) return;
  }

  async copy(bucket: string, fromPath: string, toPath: string): Promise<void> {
    if (this.isMock) return;
  }

  async rename(bucket: string, path: string, newName: string): Promise<void> {
    const segments = path.split("/");
    segments[segments.length - 1] = newName;
    const dest = segments.join("/");
    await this.move(bucket, path, dest);
  }

  async list(bucket: string, folderPath?: string): Promise<readonly StorageObject[]> {
    return [
      { name: "s3_file.txt", path: folderPath ? `${folderPath}/s3_file.txt` : "s3_file.txt", isFolder: false, size: 2048, updatedAt: new Date() },
    ];
  }

  async exists(bucket: string, path: string): Promise<boolean> {
    return !path.includes("not-found");
  }

  async getMetadata(bucket: string, path: string): Promise<StorageObjectMetadata> {
    return {
      size: 2048,
      contentType: "text/plain",
      updatedAt: new Date(),
    };
  }

  async generateSignedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string> {
    return `https://${bucket}.s3.${this.region}.amazonaws.com/${path}?AWSAccessKeyId=mock_key&Expires=${Math.floor(Date.now() / 1000) + expiresInSeconds}&Signature=mock_sig`;
  }

  async createFolder(bucket: string, path: string): Promise<void> {
    await this.upload(bucket, `${path}/.keep`, "");
  }

  async deleteFolder(bucket: string, path: string): Promise<void> {
    if (this.isMock) return;
  }

  async share(bucket: string, path: string, access: "public" | "private" | "org"): Promise<void> {
    if (this.isMock) return;
  }
}

export function createS3StorageService(config: S3StorageConfig = {}): StorageService {
  return new S3StorageService(config);
}
