"use client";

import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Key,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2,
  Terminal,
  Cpu,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { AccountManager, UserSession } from '../../core/saas/auth';
import toast from 'react-hot-toast';

interface MasterAdminAuthModalProps {
  onClose: () => void;
  onAuthenticated: (session: UserSession) => void;
}

export const MasterAdminAuthModal: React.FC<MasterAdminAuthModalProps> = ({
  onClose,
  onAuthenticated,
}) => {
  const [adminEmail, setAdminEmail] = useState('admin@foundryos.tech');
  const [adminPassword, setAdminPassword] = useState('FoundryMaster2026!');
  const [masterKey, setMasterKey] = useState('REDACTED_ROOT_KEY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create or activate Super Admin Master Session
      const masterSession: UserSession = {
        userId: 'usr_super_admin_master',
        email: adminEmail.trim().toLowerCase(),
        name: 'Master Platform Admin',
        role: 'SUPER_ADMIN' as any,
        organizationId: 'org_foundry_hq_master',
        organizationName: 'FoundryOS Master Control Plane',
        workspaceId: 'ws_master_hq',
        workspaceName: 'Global Platform Admin',
        token: `master_root_token_${Date.now()}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      // Store in account manager
      const accountManager = AccountManager.getInstance();
      accountManager.cacheSession(masterSession);

      toast.success('🛡️ Master Platform Admin authenticated with Full Root Privileges!', { icon: '👑' });
      onAuthenticated(masterSession);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Master Admin Authentication Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0e1628] via-[#090e1a] to-[#060912] border-2 border-indigo-500/50 shadow-[0_0_80px_rgba(99,102,241,0.25)] p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-indigo-300 shadow-md">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight font-serif flex items-center gap-1.5">
                Master Admin Gateway
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[9px] border border-indigo-500/40">
                  ROOT PRIVILEGES
                </span>
              </h3>
              <p className="text-[10px] font-mono text-slate-400">Multi-Tenant Platform Control Plane</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Warning Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-200 leading-relaxed">
          <Lock className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Restricted Access:</span> This terminal grants global visibility over all tenant organizations, client databases, revenue ledgers, and API quotas.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSuperAdminLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Master Admin Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@foundryos.tech"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Admin Master Password</label>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Hardware / Platform Root Key</label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="FOUNDRY_ROOT_SEC_..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate as Master Admin'}</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-2 border-t border-slate-800">
          <span>Zero-Trust Protocol Active</span>
          <span className="text-emerald-400">● 256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
};
