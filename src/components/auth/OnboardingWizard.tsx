import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Lock, 
  Building, 
  Layers, 
  Globe, 
  Sparkles, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { 
  AccountManager, 
  UserSession, 
  OrganizationRecord, 
  WorkspaceRecord 
} from '../../core/saas/auth';

interface OnboardingWizardProps {
  initialMode: 'signup' | 'login';
  onClose: () => void;
  onComplete: (session: UserSession) => void;
}

type OnboardingStep = 'auth' | 'organization' | 'workspace' | 'company_info' | 'complete';

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialMode,
  onClose,
  onComplete,
}) => {
  const accountManager = AccountManager.getInstance();

  // Mode: signup vs login
  const [authMode, setAuthMode] = useState<'signup' | 'login'>(initialMode);
  const [step, setStep] = useState<OnboardingStep>('auth');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State: Step 1 Auth
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State: Active Session & Org
  const [activeSession, setActiveSession] = useState<UserSession | null>(null);
  const [createdOrg, setCreatedOrg] = useState<OrganizationRecord | null>(null);
  const [createdWorkspace, setCreatedWorkspace] = useState<WorkspaceRecord | null>(null);

  // State: Step 2 Organization
  const [orgName, setOrgName] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('technology_saas');
  const [planTier, setPlanTier] = useState('growth');

  // State: Step 3 Workspace
  const [wsName, setWsName] = useState('Primary Production');
  const [wsSlug, setWsSlug] = useState('primary-prod');

  // State: Step 4 Company Information
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('https://');
  const [mission, setMission] = useState('');
  const [uvp, setUvp] = useState('');
  const [processGap, setProcessGap] = useState('');
  const [financialPain, setFinancialPain] = useState('');

  // ─── Step 1: Submit Auth (Sign Up / Sign In) ──────────────────────────────
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authMode === 'signup') {
        const result = await accountManager.registerAccount({
          email,
          password,
          name: name || email.split('@')[0],
          role: 'ADMIN',
        });
        setActiveSession(result.session);
        setOrgName(`${result.user.name}'s Enterprise`);
        setCompanyName(result.user.name);
        setStep('organization');
      } else {
        const result = await accountManager.login({
          email,
          password,
        });
        setActiveSession(result.session);

        if (result.organization && result.workspace) {
          // Returning user with complete onboarding -> launch directly
          onComplete(result.session);
        } else if (result.organization) {
          setCreatedOrg(result.organization);
          setStep('workspace');
        } else {
          setOrgName(`${result.user.name}'s Enterprise`);
          setCompanyName(result.user.name);
          setStep('organization');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Submit Organization ──────────────────────────────────────────
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    setError(null);
    setLoading(true);

    try {
      const org = await accountManager.createOrganization({
        sessionToken: activeSession.token,
        name: orgName.trim(),
        industry: orgIndustry,
        planTier,
      });
      setCreatedOrg(org);
      setCompanyName(org.name);
      setStep('workspace');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Submit Workspace ─────────────────────────────────────────────
  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !createdOrg) return;
    setError(null);
    setLoading(true);

    try {
      const ws = await accountManager.createWorkspace({
        sessionToken: activeSession.token,
        organizationId: createdOrg.id,
        name: wsName.trim(),
        slug: wsSlug.trim() || undefined,
      });
      setCreatedWorkspace(ws);
      setStep('company_info');
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 4: Submit Company Information ───────────────────────────────────
  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !createdOrg || !createdWorkspace) return;
    setError(null);
    setLoading(true);

    try {
      await accountManager.saveCompanyProfile({
        sessionToken: activeSession.token,
        organizationId: createdOrg.id,
        workspaceId: createdWorkspace.id,
        companyName: companyName.trim() || createdOrg.name,
        websiteUrl: websiteUrl.trim(),
        industry: orgIndustry,
        mission: mission.trim() || undefined,
        uvp: uvp.trim() || undefined,
        processGap: processGap.trim() || undefined,
        financialPain: financialPain.trim() || undefined,
      });

      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Failed to save company profile.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 5: Complete & Launch ─────────────────────────────────────────────
  const handleLaunch = () => {
    if (activeSession) {
      onComplete(activeSession);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#0c1017] shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-slate-100 overflow-hidden">
        {/* Top Accent Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stepper Progress Indicator */}
        <div className="px-8 pt-6 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono">
            {[
              { id: 'auth', label: '1. Identity' },
              { id: 'organization', label: '2. Organization' },
              { id: 'workspace', label: '3. Workspace' },
              { id: 'company_info', label: '4. Company DNA' },
              { id: 'complete', label: '5. Launch' },
            ].map((s, idx) => (
              <span
                key={s.id}
                className={`${
                  step === s.id
                    ? 'text-indigo-400 font-bold'
                    : 'text-slate-500'
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ──────────────── STEP 1: AUTH (SIGN UP / LOG IN) ──────────────── */}
          {step === 'auth' && (
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {authMode === 'signup' ? 'Create Your TACF Account' : 'Sign In to Your Workspace'}
                </h2>
                <p className="text-xs text-slate-400">
                  {authMode === 'signup'
                    ? 'Initialize your persistent enterprise identity.'
                    : 'Enter your credentials to access your tenant OS.'}
                </p>
              </div>

              {authMode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Finesse Jones"
                    className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@company.com"
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : authMode === 'signup' ? (
                  <>
                    <span>Create Account & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Sign In to TACF OS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs font-mono text-slate-400">
                {authMode === 'signup' ? (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    New to TACF OS?{' '}
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      Create Account
                    </button>
                  </span>
                )}
              </div>
            </form>
          )}

          {/* ──────────────── STEP 2: CREATE ORGANIZATION ──────────────── */}
          {step === 'organization' && (
            <form onSubmit={handleOrgSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 mb-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>Tenant Provisioning</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Create Organization</h2>
                <p className="text-xs text-slate-400">
                  Organizations are the authoritative multi-tenant boundary for your company.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. TACF Global Holdings"
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Industry Classification</label>
                  <select
                    value={orgIndustry}
                    onChange={(e) => setOrgIndustry(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="technology_saas">Technology & SaaS</option>
                    <option value="consulting_services">Consulting & Agency</option>
                    <option value="healthcare_medical">Healthcare & Life Sciences</option>
                    <option value="manufacturing">Manufacturing & Supply</option>
                    <option value="finance_fintech">Finance & FinTech</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Plan Tier</label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="starter">Starter ($49/mo)</option>
                    <option value="growth">Growth ($199/mo)</option>
                    <option value="enterprise">Enterprise ($499/mo)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>Provision Organization</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ──────────────── STEP 3: CREATE WORKSPACE ──────────────── */}
          {step === 'workspace' && (
            <form onSubmit={handleWorkspaceSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Workspace Environment</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Create First Workspace</h2>
                <p className="text-xs text-slate-400">
                  Workspaces house your active AI agents, websites, workflows, and lead pipelines.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Workspace Name</label>
                <input
                  type="text"
                  required
                  value={wsName}
                  onChange={(e) => {
                    setWsName(e.target.value);
                    setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="e.g. Primary Production"
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Workspace Slug</label>
                <div className="flex items-center rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-sm font-mono text-slate-400">
                  <span className="text-slate-500">app.tacfos.tech/</span>
                  <input
                    type="text"
                    required
                    value={wsSlug}
                    onChange={(e) => setWsSlug(e.target.value)}
                    className="w-full bg-transparent text-indigo-300 focus:outline-none pl-1"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>Initialize Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ──────────────── STEP 4: ENTER COMPANY INFORMATION ──────────────── */}
          {step === 'company_info' && (
            <form onSubmit={handleCompanyInfoSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 mb-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Business DNA Synthesis</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Enter Company Information</h2>
                <p className="text-xs text-slate-400">
                  This authoritative profile powers all 8 AI system agents and website generation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex AI"
                    className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Website URL</label>
                  <input
                    type="text"
                    required
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Core Value Proposition / Mission</label>
                <textarea
                  rows={2}
                  value={uvp}
                  onChange={(e) => setUvp(e.target.value)}
                  placeholder="e.g. Autonomous enterprise operating system reducing overhead by 40%."
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Primary Financial Pain</label>
                  <input
                    type="text"
                    value={financialPain}
                    onChange={(e) => setFinancialPain(e.target.value)}
                    placeholder="e.g. $1.2M annual operational drag"
                    className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-300">Primary Process Gap</label>
                  <input
                    type="text"
                    value={processGap}
                    onChange={(e) => setProcessGap(e.target.value)}
                    placeholder="e.g. Manual departmental silos"
                    className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <span>Generate Business DNA & Finalize</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ──────────────── STEP 5: ONBOARDING COMPLETE ──────────────── */}
          {step === 'complete' && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Check className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Tenant OS Initialized
                </h2>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Your organization <strong className="text-white">{createdOrg?.name}</strong> and workspace <strong className="text-white">{createdWorkspace?.name}</strong> are ready.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 text-left text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Account:</span>
                  <span className="text-slate-200">{activeSession?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Organization:</span>
                  <span className="text-indigo-300 font-bold">{createdOrg?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Workspace:</span>
                  <span className="text-emerald-400 font-bold">{createdWorkspace?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Business DNA:</span>
                  <span className="text-emerald-400">Constructed & Attached</span>
                </div>
              </div>

              <button
                onClick={handleLaunch}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter Authenticated TACF OS</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
