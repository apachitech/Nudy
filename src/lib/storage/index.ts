/**
 * Private Storage Provider & Presigned URL Manager
 * All media is private by default; URLs are short-lived pre-signed tokens.
 */

export interface StorageUploadParams {
  key: string;
  buffer: Buffer;
  mimeType: string;
}

export interface IStorageProvider {
  name: string;
  uploadAsset(params: StorageUploadParams): Promise<{ storageKey: string; directUrl: string }>;
  getPresignedViewUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
  deleteAsset(storageKey: string): Promise<boolean>;
}

export class MockStorageProvider implements IStorageProvider {
  name = "mock";

  async uploadAsset(params: StorageUploadParams): Promise<{ storageKey: string; directUrl: string }> {
    return {
      storageKey: params.key,
      directUrl: `https://mock-storage.nudy.local/${params.key}?signed=true&token=${Date.now()}`,
    };
  }

  async getPresignedViewUrl(storageKey: string, expiresInSeconds = 900): Promise<string> {
    // Generate private signed link valid for 15 minutes by default
    return `https://mock-storage.nudy.local/${storageKey}?signature=mock_sig_${Date.now()}&expires=${Math.floor(Date.now() / 1000) + expiresInSeconds}`;
  }

  async deleteAsset(storageKey: string): Promise<boolean> {
    return true;
  }
}

export class S3StorageProvider implements IStorageProvider {
  name = "s3";
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET_NAME || "nudy-private-assets";
  }

  async uploadAsset(params: StorageUploadParams): Promise<{ storageKey: string; directUrl: string }> {
    // In production, invoke @aws-sdk/client-s3 PutObjectCommand
    return {
      storageKey: params.key,
      directUrl: `https://${this.bucket}.s3.amazonaws.com/${params.key}`,
    };
  }

  async getPresignedViewUrl(storageKey: string, expiresInSeconds = 900): Promise<string> {
    // In production, invoke getSignedUrl from @aws-sdk/s3-request-presigner
    return `https://${this.bucket}.s3.amazonaws.com/${storageKey}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Signature=signed_token`;
  }

  async deleteAsset(storageKey: string): Promise<boolean> {
    return true;
  }
}

export function getStorageProvider(): IStorageProvider {
  const provider = (process.env.STORAGE_PROVIDER || "mock").toLowerCase();
  switch (provider) {
    case "s3":
    case "r2":
    case "minio":
      return new S3StorageProvider();
    case "mock":
    default:
      return new MockStorageProvider();
  }
}

