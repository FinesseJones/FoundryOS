import crypto from 'node:crypto';

export interface ApiKeyRecord {
  id: string;
  prefix: string;        // e.g. "bf_live_8f91a8d9..."
  keyHash: string;       // SHA-256 hash digest (stored in DB)
  name: string;
  organizationId: string;
  rateLimitPerMin: number;
  requestCount: number;
  lastUsedAt?: string;
  createdAt: string;
}

export interface GeneratedApiKey {
  rawKey: string;        // Secret raw key returned ONCE to caller
  record: ApiKeyRecord;  // Stored metadata record with hash
}

export class ApiKeyManager {
  private keysByHash: Map<string, ApiKeyRecord> = new Map();

  static hashKey(rawKey: string): string {
    return crypto.createHash('sha256').update(rawKey).digest('hex');
  }

  generateApiKey(organizationId: string, name: string = 'Default Production Key'): GeneratedApiKey {
    const randomHex = crypto.randomBytes(24).toString('hex');
    const rawKey = `bf_live_${randomHex}`;
    const prefix = `bf_live_${randomHex.substring(0, 8)}...`;
    const keyHash = ApiKeyManager.hashKey(rawKey);

    const record: ApiKeyRecord = {
      id: `key_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      prefix,
      keyHash,
      name,
      organizationId,
      rateLimitPerMin: 60,
      requestCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.keysByHash.set(keyHash, record);
    return { rawKey, record };
  }

  validateApiKey(rawKey: string): ApiKeyRecord | null {
    if (!rawKey || typeof rawKey !== 'string') return null;

    const keyHash = ApiKeyManager.hashKey(rawKey);
    const record = this.keysByHash.get(keyHash);
    if (!record) return null;

    record.requestCount += 1;
    record.lastUsedAt = new Date().toISOString();
    return record;
  }

  listApiKeys(organizationId: string): ApiKeyRecord[] {
    return Array.from(this.keysByHash.values()).filter((k) => k.organizationId === organizationId);
  }
}
