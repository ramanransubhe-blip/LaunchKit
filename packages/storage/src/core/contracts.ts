export interface UploadOptions {
  readonly contentType?: string;
  readonly cacheControl?: string;
  readonly isPublic?: boolean;
}

export interface StorageUploadResult {
  readonly path: string;
  readonly url: string;
  readonly size: number;
}

export interface StorageDownloadResult {
  readonly data: Buffer;
  readonly contentType: string | null;
  readonly size: number;
}

export interface StorageObject {
  readonly name: string;
  readonly path: string;
  readonly isFolder: boolean;
  readonly size?: number;
  readonly updatedAt?: Date;
}

export interface StorageObjectMetadata {
  readonly size: number;
  readonly contentType: string | null;
  readonly updatedAt: Date;
  readonly etag?: string;
}

// Reusable provider-independent StorageService contract
export interface StorageService {
  readonly providerName: string;

  upload(bucket: string, path: string, body: Buffer | ArrayBuffer | string, options?: UploadOptions): Promise<StorageUploadResult>;
  download(bucket: string, path: string): Promise<StorageDownloadResult>;
  delete(bucket: string, path: string): Promise<void>;
  move(bucket: string, fromPath: string, toPath: string): Promise<void>;
  copy(bucket: string, fromPath: string, toPath: string): Promise<void>;
  rename(bucket: string, path: string, newName: string): Promise<void>;
  list(bucket: string, folderPath?: string): Promise<readonly StorageObject[]>;
  exists(bucket: string, path: string): Promise<boolean>;
  getMetadata(bucket: string, path: string): Promise<StorageObjectMetadata>;
  generateSignedUrl(bucket: string, path: string, expiresInSeconds: number): Promise<string>;
  createFolder(bucket: string, path: string): Promise<void>;
  deleteFolder(bucket: string, path: string): Promise<void>;
  share(bucket: string, path: string, access: "public" | "private" | "org"): Promise<void>;
}
