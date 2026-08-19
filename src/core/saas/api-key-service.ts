import { ApiKeyManager, GeneratedApiKey, ApiKeyRecord } from './api-keys';

/**
 * Server-Only API Key Service Layer.
 * Executes strictly on Node.js server environments or API routes.
 */
const apiKeyManagerServer = new ApiKeyManager();

export async function generateApiKeyServer(
  organizationId: string,
  name: string = 'Default Production Key'
): Promise<GeneratedApiKey> {
  return apiKeyManagerServer.generateApiKey(organizationId, name);
}

export async function listApiKeysServer(organizationId: string): Promise<ApiKeyRecord[]> {
  return apiKeyManagerServer.listApiKeys(organizationId);
}
