import { put, del } from "@vercel/blob";

export class VercelBlobStorageAdapter {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async upload(
    key: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<{ url: string; key: string }> {
    const blob = await put(key, buffer, {
      access: "public",
      contentType: mimeType,
      token: this.token,
    });

    return {
      url: blob.url,
      key: blob.url, // Vercel Blob uses blob.url as deletion key
    };
  }

  async download(key: string): Promise<Buffer> {
    const res = await fetch(key);
    if (!res.ok) {
      throw new Error(`Failed to download blob from ${key}: ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async delete(key: string): Promise<void> {
    try {
      await del(key, { token: this.token });
    } catch {
      // Non-fatal if already deleted
    }
  }
}
