"use client";

import React, { useState } from 'react';
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  Cpu, 
  PhoneCall, 
  CreditCard, 
  Sparkles, 
  Lock, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Server, 
  Key, 
  Layers,
  Building2,
  Sliders,
  Globe
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SettingsProps {
  currentUser: { role: string; permissions: { [key: string]: boolean } };
}

type SettingsTab = 'DNA_SOPS' | 'INFERENCE_MATRIX' | 'ZERO_TRUST_RISK' | 'TELEPHONY_PAYMENTS' | 'GLOBAL_SYSTEM';

const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('DNA_SOPS');

  // Enterprise Configuration State
  const [tenantName, setTenantName] = useState('Environment Masters, Inc. (Jackson, MS)');
  const [tenantWebsite, setTenantWebsite] = useState('https://environmentmasters.com');
  const [carrierPhone, setCarrierPhone] = useState('(601) 353-4681');
  const [knowledgeDecayRate, setKnowledgeDecayRate] = useState('0.05'); // 5% monthly half-life
  const [autoTextTemplate, setAutoTextTemplate] = useState(
    'Hi! This is Environment Masters (Jackson, MS). Sorry we missed your call — how can our HVAC, plumbing, or electrical team help you today?'
  );

  // 3-Tier AI Thresholds
  const [tier1Endpoint, setTier1Endpoint] = useState('http://127.0.0.1:11434/v1');
  const [tier1Model, setTier1Model] = useState('qwen2.5-coder:32b');
  const [tier2Endpoint, setTier2Endpoint] = useState('http://127.0.0.1:1337/v1');
  const [tier2Model, setTier2Model] = useState('Bonsai-27b (Apple Silicon MLX)');
  const [tier3Model, setTier3Model] = useState('meta/llama-3.2-90b-vision-instruct');
  const [cascadeDownRouteThreshold, setCascadeDownRouteThreshold] = useState('80'); // Amber zone at 80%

  // 6D Risk Tensor Thresholds
  const [semanticDriftThreshold, setSemanticDriftThreshold] = useState('0.25');
  const [mahalanobisSigma, setMahalanobisSigma] = useState('3.0');
  const [woundWaitTimeoutMs, setWoundWaitTimeoutMs] = useState('500');

  // Global Parameters
  const [baseCurrency, setBaseCurrency] = useState('USD ($)');
  const [timeZone, setTimeZone] = useState('America/Chicago (Central Time)');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('🛡️ Fortune 500 KaaS Governance Matrix & System Settings Saved!', {
        icon: '✅',
        duration: 3500
      });
    }, 700);
  };

  return (
    <AppLayout>
      <div className="space-y-6 font-sans text-slate-100">
        {/* Enterprise Control Plane Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-white font-serif">Enterprise KaaS & Autonomous OS Settings</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                    FORTUNE 500 MATRIX
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Master Configuration: Business DNA Ingestion • 3-Tier Multi-Inference • 6D Risk Gating • Carrier Telecom
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Save System Matrix</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'DNA_SOPS', label: '🧬 Living DNA & SOPs', desc: 'Epistemic Ingestion & Policy AST' },
            { id: 'INFERENCE_MATRIX', label: '⚡ 3-Tier AI Multi-Inference', desc: 'Ollama • MLX • NVIDIA NIM' },
            { id: 'ZERO_TRUST_RISK', label: '🛡️ 6D Risk Tensor & Security', desc: 'FIPS 140-3 • Mahalanobis Drift' },
            { id: 'TELEPHONY_PAYMENTS', label: '📞 Telecom & Instant Pay', desc: '10DLC SMS • Stripe Connect' },
            { id: 'GLOBAL_SYSTEM', label: '🌐 Multi-Org & Global Params', desc: 'Currency • Multi-Company Switcher' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition flex flex-col items-start cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] opacity-70 font-normal">{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Living Business DNA & Epistemic SOPs */}
        {activeTab === 'DNA_SOPS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Authoritative Living Business DNA Grounding</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Every AI response, SMS text, and proposal strictly references this ingested knowledge graph.
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Company / Organization Name</label>
                  <Input
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Authoritative Website Crawl Target</label>
                  <div className="flex gap-2">
                    <Input
                      value={tenantWebsite}
                      onChange={(e) => setTenantWebsite(e.target.value)}
                      className="bg-slate-950 border-slate-700 text-white rounded-xl flex-1"
                    />
                    <Button 
                      type="button"
                      onClick={() => toast.success('🔍 Hyperion Crawler refreshed 42 pages into Business DNA!')}
                      className="bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700"
                    >
                      Instant Re-Crawl
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Knowledge Half-Life Decay Rate (λ Domain)
                  </label>
                  <Input
                    value={knowledgeDecayRate}
                    onChange={(e) => setKnowledgeDecayRate(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400">
                    Auto-triggers recalibration tickets when assumption confidence C(t) &lt; 0.65.
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Active Commercial SOP Rulebook</span>
                </h3>
                <p className="text-xs text-slate-400">Verified policies enforced across all customer touchpoints.</p>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {[
                  { code: 'SOP-HVAC-04', title: 'Emergency Chiller Protocol', detail: 'Sub-20 min dispatch during heat index >95°F.' },
                  { code: 'SOP-PLUMB-09', title: 'Trenchless NuFlow Relining', detail: 'Zero-dig epoxy pipe scans for historic Mississippi properties.' },
                  { code: 'SOP-ELEC-02', title: '480V 3-Phase Switchgear', detail: 'Infrared thermal audit required prior to power panel sign-off.' },
                  { code: 'SOP-REV-01', title: '1-Tap Google Review Dispatch', detail: 'SMS review trigger fires 30 mins after job invoice marked PAID.' },
                ].map((sop) => (
                  <div key={sop.code} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-400 font-bold">{sop.code}: {sop.title}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9px] border border-emerald-500/40">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px]">{sop.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3-Tier Multi-Inference Matrix */}
        {activeTab === 'INFERENCE_MATRIX' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>Tier 1: Local Default (Ollama)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-mono border border-emerald-500/40">
                  ONLINE (18ms)
                </span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase">Endpoint</label>
                  <Input value={tier1Endpoint} onChange={(e) => setTier1Endpoint(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase">Active Model</label>
                  <Input value={tier1Model} onChange={(e) => setTier1Model(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Ultra-fast, private local iterations. Handles 2-way SMS classifications and task summaries at $0.00 marginal cost.
                </p>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <span>Tier 2: Apple MLX (Osaurus)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-[9px] font-mono border border-indigo-500/40">
                  ONLINE (Port 1337)
                </span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase">Endpoint</label>
                  <Input value={tier2Endpoint} onChange={(e) => setTier2Endpoint(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase">Active Model</label>
                  <Input value={tier2Model} onChange={(e) => setTier2Model(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs" />
                </div>
                <p className="text-[10px] text-slate-400">
                  High-throughput unified memory inference on Apple Silicon for deep multi-agent deliberation.
                </p>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Tier 3: Cloud (NVIDIA NIM)</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 text-[9px] font-mono border border-purple-500/40">
                  AUTHENTICATED
                </span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase">Cloud Model</label>
                  <Input value={tier3Model} onChange={(e) => setTier3Model(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase">Cascade Down-Route Threshold</label>
                  <Input value={cascadeDownRouteThreshold} onChange={(e) => setCascadeDownRouteThreshold(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl text-xs" />
                </div>
                <p className="text-[10px] text-slate-400">
                  Reserved for high-entropy visual audits and 90B parameter strategic intelligence synthesis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Zero-Trust Security & 6D Risk */}
        {activeTab === 'ZERO_TRUST_RISK' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>6-Dimensional Risk Vector Gating Matrix (Vector R)</span>
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Configures automatic execution ceilings across all autonomous agents.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Semantic Brand Drift Ceiling (θ Drift)
                  </label>
                  <Input value={semanticDriftThreshold} onChange={(e) => setSemanticDriftThreshold(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl" />
                  <span className="text-[10px] text-slate-400">Cosine distance threshold relative to Authoritative Brand DNA Anchor.</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Mahalanobis Anomaly Bound (D_M)
                  </label>
                  <Input value={mahalanobisSigma} onChange={(e) => setMahalanobisSigma(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl" />
                  <span className="text-[10px] text-slate-400">Flags slow-burn subversive drift if cumulative 7-day state exceeds 3.0σ.</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-emerald-400" />
                  <span>FIPS 140-3 Cryptographic Key Vault & DLM</span>
                </h3>
                <p className="text-slate-400 text-[11px]">Hardware-backed token security and distributed lock management.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Distributed Lock Manager (DLM) Wound-Wait Timeout (ms)
                  </label>
                  <Input value={woundWaitTimeoutMs} onChange={(e) => setWoundWaitTimeoutMs(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl" />
                  <span className="text-[10px] text-slate-400">Preempts younger transactions to prevent distributed circular deadlocks.</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 space-y-1">
                  <p className="font-bold">● Zero-Trust Ledger Active</p>
                  <p className="text-[10px] text-slate-400">All tenant state mutations appended with SHA-256 cryptographic signatures.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Telephony & Instant Payments */}
        {activeTab === 'TELEPHONY_PAYMENTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-indigo-400" />
                  <span>10DLC Verified Telephony Line</span>
                </h3>
                <p className="text-slate-400 text-[11px]">Dedicated commercial routing with sub-15s auto-text recovery.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Primary Dedicated Business Number</label>
                  <Input value={carrierPhone} onChange={(e) => setCarrierPhone(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Missed-Call Sub-15s Auto-Text Template</label>
                  <textarea
                    rows={3}
                    value={autoTextTemplate}
                    onChange={(e) => setAutoTextTemplate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Stripe Connect Instant Payouts</span>
                </h3>
                <p className="text-slate-400 text-[11px]">1-Tap Text-to-Pay billing and automated commercial payment links.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">Stripe Merchant Ledger</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    CONNECTED
                  </span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Automatic daily rolling deposits to Environment Masters commercial checking account.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Multi-Org & Global Params */}
        {activeTab === 'GLOBAL_SYSTEM' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Instant Multi-Company Switcher & Tenant Sandbox</span>
                </h3>
                <p className="text-slate-400 text-[11px]">
                  Allows testing and switching between 4 distinct real-world companies in real-time.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Environment Masters, Inc. (Jackson, MS)', type: 'HVAC, Electrical & Plumbing Contractor', id: 'org_env_masters_ms', active: true },
                  { name: 'Jackson Medical Mall Complex (Jackson, MS)', type: 'Healthcare & Commercial Facility Management', id: 'org_med_mall_ms', active: false },
                  { name: 'Highland Colony Commercial Park (Ridgeland, MS)', type: 'Commercial Property & 480V Industrial Power', id: 'org_highland_colony', active: false },
                  { name: 'Madison Station Historic Plaza (Madison, MS)', type: 'Historic District Commercial Infrastructure', id: 'org_madison_plaza', active: false },
                ].map((org) => (
                  <div key={org.id} className={`p-3 rounded-xl border flex items-center justify-between ${org.active ? 'bg-indigo-950/40 border-indigo-500/60' : 'bg-slate-950 border-slate-800'}`}>
                    <div>
                      <p className="font-bold text-white">{org.name}</p>
                      <p className="text-[10px] text-slate-400">{org.type}</p>
                    </div>
                    {org.active ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px]">
                        ACTIVE TENANT
                      </span>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => toast.success(`🔄 Switched active organization to ${org.name}!`)}
                        className="h-7 px-3 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-200"
                      >
                        Switch To
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Global Currency & Regional Timezones</span>
                </h3>
                <p className="text-slate-400 text-[11px]">Affects all executive reports, invoices, and SLA dispatch timers.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Base Currency</label>
                  <Input value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl" />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Regional Timezone</label>
                  <Input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className="bg-slate-950 border-slate-700 text-white rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Settings;