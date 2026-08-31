"use client";

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Globe,
  Sparkles,
  ArrowRight,
  Server,
  Play,
  Check,
  Clock,
  Eye,
  RefreshCw,
  Box,
  Volume2
} from 'lucide-react';
import {
  HyperionBridgeService,
  HyperionEngineStatus,
  HyperionJobRequest,
  HyperionJobResult
} from '../../core/hyperion/hyperion-bridge-service';
import toast from 'react-hot-toast';

export const HyperionEngineControl: React.FC = () => {
  const bridge = HyperionBridgeService.getInstance();
  const [status, setStatus] = useState<HyperionEngineStatus>(bridge.getEngineStatus());
  const [jobs, setJobs] = useState<HyperionJobResult[]>(bridge.getAllJobs());
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState<any>('GENERATE_FULLSTACK_APP');
  const [selectedTier, setSelectedTier] = useState<any>('TIER_1_OLLAMA');
  const [targetTenant, setTargetTenant] = useState('Apex HVAC Corp (org_apex_001)');

  const handleRunJob = async () => {
    setIsExecuting(true);
    const jobId = `job_hyp_${Date.now().toString().slice(-4)}`;

    const req: HyperionJobRequest = {
      id: jobId,
      tenantId: targetTenant.includes('apex') ? 'org_apex_001' : 'org_sweet_002',
      tenantName: targetTenant.split(' (')[0],
      jobType: selectedJobType,
      preferredTier: selectedTier,
      payload: {
        appName: 'Apex_Field_Service_Portal',
        spec: 'React 19, Tailwind CSS, Instant WebChat-to-Text',
      },
      createdAt: new Date().toISOString(),
    };

    toast.loading(`[Hyperion Engine] Dispatched ${selectedJobType} to Goose ACP runner...`, { id: jobId });

    const result = await bridge.dispatchJob(req);
    setJobs(bridge.getAllJobs());
    setIsExecuting(false);
    toast.success(`✅ Hyperion deliverable completed in ${result.executionTimeMs}ms!`, { id: jobId });
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Top Engine Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1628] via-[#090e1a] to-[#060a12] border border-indigo-500/40 shadow-2xl shadow-indigo-950/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-[#090e1a] rounded-[14px] flex items-center justify-center text-white font-serif font-black text-xl">
                H
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg tracking-tight font-serif">Hyperion Engine Active</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  CONNECTED
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">{status.repositoryPath}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
              Version: {status.version}
            </span>
          </div>
        </div>

        {/* 3-Tier Multi-Inference Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Tier 1 Ollama */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-indigo-400 font-bold">TIER 1 (LOCAL OLLAMA)</span>
              <span className="text-emerald-400 font-bold">● {status.inferenceTiers.tier1Ollama.latencyMs}ms</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{status.inferenceTiers.tier1Ollama.model}</p>
            <p className="text-[10px] font-mono text-slate-400">{status.inferenceTiers.tier1Ollama.endpoint}</p>
          </div>

          {/* Tier 2 Osaurus */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-purple-400 font-bold">TIER 2 (APPLE MLX)</span>
              <span className="text-emerald-400 font-bold">● READY</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{status.inferenceTiers.tier2Osaurus.model}</p>
            <p className="text-[10px] font-mono text-slate-400">{status.inferenceTiers.tier2Osaurus.endpoint}</p>
          </div>

          {/* Tier 3 NVIDIA NIM */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">TIER 3 (NVIDIA NIM CLOUD)</span>
              <span className="text-emerald-400 font-bold">● READY</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">{status.inferenceTiers.tier3NvidiaNim.model}</p>
            <p className="text-[10px] font-mono text-slate-400">https://integrate.api.nvidia.com</p>
          </div>
        </div>
      </div>

      {/* Dispatch Autonomous Worker Task */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatcher Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h4 className="font-bold text-sm text-white font-serif">Dispatch Autonomous Hyperion Job</h4>
          </div>
          <p className="text-xs text-slate-300">
            Execute fullstack code generation, visual QA verification, or 3D asset spawning on behalf of a tenant.
          </p>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Target Tenant Organization</label>
              <select
                value={targetTenant}
                onChange={(e) => setTargetTenant(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
              >
                <option>Apex HVAC Corp (org_apex_001)</option>
                <option>Sweet Harvest LLC (org_sweet_002)</option>
                <option>Datadog HQ Inc (org_datadog_003)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Autonomous Job Type</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
              >
                <option value="GENERATE_FULLSTACK_APP">Scaffold & Build Client Web App (Goose + dyad)</option>
                <option value="CHROME_DEVTOOLS_VISUAL_QA">Run Headless Chrome QA & DOM Verification</option>
                <option value="SPAWN_3D_SCENE_ASSET">Spawn 3D Product Mesh (Hunyuan3D-2)</option>
                <option value="SYNTHESIZE_KOKORO_VOICE">Synthesize Commercial Voiceover (Kokoro-82M)</option>
                <option value="DNA_DEEP_MARKET_AUDIT">Run Deep Multi-Domain Competitive Audit</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Compute Inference Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
              >
                <option value="TIER_1_OLLAMA">Tier 1: Ollama Local (qwen2.5-coder:32b)</option>
                <option value="TIER_2_OSAURUS">Tier 2: Apple Silicon MLX (Bonsai-27b)</option>
                <option value="TIER_3_NVIDIA_NIM">Tier 3: NVIDIA NIM Cloud (Llama 3.2 90B Vision)</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isExecuting}
              onClick={handleRunJob}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isExecuting ? 'Hyperion Agents Executing...' : 'Execute Autonomous Job'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Job Execution Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-white font-serif">Recent Hyperion Execution Logs</h4>
            <span className="text-[10px] font-mono text-slate-400">Real-Time Worker Log</span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.jobId} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{job.jobId}</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/40">
                      {job.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{job.executionTimeMs}ms • {job.executionTier}</span>
                </div>

                {/* Log Terminal Snippet */}
                <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 overflow-x-auto">
                  {job.logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>

                {/* Artifacts Pill */}
                {job.artifacts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {job.artifacts.map((art, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-[10px] font-mono text-indigo-300"
                      >
                        <Box className="w-3 h-3 text-indigo-400" />
                        <span>{art.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
