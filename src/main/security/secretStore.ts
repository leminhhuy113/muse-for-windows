/**
 * Windows DPAPI Encrypted Secret Store (via Electron safeStorage)
 * Stores optional Mode C independent API keys encrypted at rest; never stored in settings JSON.
 */
import fs from 'node:fs';
import path from 'node:path';
import { safeStorage } from 'electron';

interface EncryptedStoreMap {
  [key: string]: string; // base64 DPAPI ciphertext
}

export class DpapiSecretStore {
  private readonly filePath: string;

  constructor(userDataDir: string) {
    this.filePath = path.join(userDataDir, 'secrets.dpapi.json');
  }

  private readMap(): EncryptedStoreMap {
    try {
      if (!fs.existsSync(this.filePath)) return {};
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8')) as EncryptedStoreMap;
    } catch {
      return {};
    }
  }

  private writeMap(map: EncryptedStoreMap): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tmp = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(map, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tmp, this.filePath);
  }

  public setSecret(name: string, plainText: string): void {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('OS encryption (Windows DPAPI) is unavailable; refusing to store plaintext secret.');
    }
    const encrypted = safeStorage.encryptString(plainText);
    const map = this.readMap();
    map[name] = encrypted.toString('base64');
    this.writeMap(map);
  }

  public getSecret(name: string): string | null {
    const map = this.readMap();
    const b64 = map[name];
    if (!b64 || !safeStorage.isEncryptionAvailable()) return null;
    try {
      return safeStorage.decryptString(Buffer.from(b64, 'base64'));
    } catch {
      return null;
    }
  }

  public hasSecret(name: string): boolean {
    const map = this.readMap();
    return Boolean(map[name]);
  }

  public deleteSecret(name: string): void {
    const map = this.readMap();
    delete map[name];
    this.writeMap(map);
  }
}
