import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseInitService } from '../database-init-service';

test('DatabaseInitService: Reads DATABASE_URL and initializes SQLite database status', async () => {
  const service = new DatabaseInitService('file:./dev.db');
  const status = await service.initializeDatabase();

  assert.equal(status.connected, true, 'Prisma SQLite database must connect successfully');
  assert.equal(status.provider, 'sqlite');
  assert.equal(status.databaseUrl, 'file:./dev.db');
  assert.ok(status.tablesVerified.includes('Organization'));
  assert.ok(status.tablesVerified.includes('BusinessDNA'));
  assert.ok(status.tablesVerified.includes('DNARevision'));
  assert.ok(status.tablesVerified.includes('MemoryRecord'));
  assert.ok(status.tablesVerified.includes('AuditEvent'));
  assert.ok(status.tablesVerified.includes('ApprovalRequest'));
  assert.ok(status.tablesVerified.includes('AutomationWorkflow'));

  const currentStatus = service.getStatus();
  assert.equal(currentStatus.isInitialized, true);
});
