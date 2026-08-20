export type UserRole = 'ADMIN' | 'EXECUTIVE' | 'MARKETER' | 'MEMBER';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  token: string;
  createdAt: string;
  expiresAt: string;
}

function generateSecureToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export class SaaSAuthManager {
  private sessions: Map<string, UserSession> = new Map();

  createSession(params: {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    organizationId: string;
    organizationName: string;
  }): UserSession {
    // 256-bit cryptographically secure session token
    const token = generateSecureToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const session: UserSession = {
      ...params,
      token,
      createdAt: now.toISOString(),
      expiresAt,
    };
    this.sessions.set(token, session);
    return session;
  }

  validateSession(token: string): UserSession | null {
    const session = this.sessions.get(token);
    if (!session) return null;

    // Verify session expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  hasPermission(session: UserSession, action: 'execute_agent' | 'approve_task' | 'manage_billing' | 'manage_team'): boolean {
    switch (action) {
      case 'manage_billing':
      case 'manage_team':
        return session.role === 'ADMIN' || session.role === 'EXECUTIVE';
      case 'approve_task':
        return session.role === 'ADMIN' || session.role === 'EXECUTIVE' || session.role === 'MARKETER';
      case 'execute_agent':
        return true;
      default:
        return false;
    }
  }
}
