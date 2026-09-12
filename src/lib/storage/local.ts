import fs from "fs/promises";
import path from "path";

export class LocalStorageAdapter {
  private baseDir: string;

  constructor(dirName: string = ".storage") {
    this.baseDir = path.join(process.cwd(), /*turbopackIgnore: true*/ dirName);
  }

  private async ensureBaseDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch {
      // Ignore if already exists
    }
  }

  async upload(
    key: string,
    buffer: Buffer,
    _mimeType: string
  ): Promise<{ url: string; key: string }> {
    await this.ensureBaseDir();
    const filePath = path.join(this.baseDir, key);
    // Ensure parent dir of key exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    return {
      url: `/api/storage/local/${key}`,
      key,
    };
  }

  async download(key: string): Promise<Buffer> {
    const filePath = path.join(this.baseDir, key);
    return await fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if already gone
    }
  }
}
