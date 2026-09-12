import { LocalStorageAdapter } from "./local";
import { VercelBlobStorageAdapter } from "./vercel-blob";

export interface StorageAdapter {
  upload(
    key: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<{ url: string; key: string }>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (storageInstance) {
    return storageInstance;
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token && token.trim().length > 0) {
    storageInstance = new VercelBlobStorageAdapter(token.trim());
  } else {
    storageInstance = new LocalStorageAdapter();
  }

  return storageInstance;
}
