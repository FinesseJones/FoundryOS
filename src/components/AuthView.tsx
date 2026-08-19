import React, { useState } from 'react';
import { ViewTab } from './Navbar';

interface AuthViewProps {
  setActiveTab: (tab: ViewTab) => void;
  setOrganizationName: (org: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ setActiveTab, setOrganizationName }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('executive@acmecorp.com');
  const [password, setPassword] = useState('••••••••••••');
  const [orgInput, setOrgInput] = useState('Acme Corp Workspace');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgInput) {
      setOrganizationName(orgInput);
    }
    setActiveTab('onboarding');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass-card p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">
            {mode === 'signin' ? 'Welcome Back to Brand First' : 'Create Your Customer Portal Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'signin'
              ? 'Access your Business DNA layer and active AI agents.'
              : 'Initialize your organization and configure Business DNA.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-900/80 p-1 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Organization Name</label>
              <input
                type="text"
                value={orgInput}
                onChange={(e) => setOrgInput(e.target.value)}
                required
                className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Acme Corp"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-bold text-white shadow-lg hover:opacity-95 transition-opacity"
          >
            {mode === 'signin' ? 'Sign In to Portal' : 'Create Organization Workspace'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            Protected by Brand First Security Agent v1.0. All authentication sessions are audit-logged.
          </p>
        </div>
      </div>
    </div>
  );
};
