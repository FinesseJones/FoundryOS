import React, { useState } from 'react';
import { ViewTab } from './Navbar';
import { AgentRegistry, AgentTaskResult } from '../core/agents';

interface ContentGeneratorViewProps {
  agentRegistry: AgentRegistry;
  businessId: string;
  setActiveTab: (tab: ViewTab) => void;
  onContentGenerated: (result: AgentTaskResult) => void;
}

export const ContentGeneratorView: React.FC<ContentGeneratorViewProps> = ({
  agentRegistry,
  businessId,
  setActiveTab,
  onContentGenerated,
}) => {
  const [prompt, setPrompt] = useState('Create a high-converting announcement post for our new AI platform release');
  const [channel, setChannel] = useState('linkedin');
  const [taskType, setTaskType] = useState<'content_generation' | 'brand_analysis'>('content_generation');
  const [generating, setGenerating] = useState(false);
  const [latestResult, setLatestResult] = useState<AgentTaskResult | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const result = await agentRegistry.dispatchTask({
        taskId: `gen_${Date.now()}`,
        businessId,
        role: taskType === 'content_generation' ? 'content' : 'brand',
        taskType,
        prompt,
        targetChannel: channel,
      });

      setLatestResult(result);
      onContentGenerated(result);
    } catch (err) {
      console.error('Error generating content:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            AI Content Workbench — <span className="text-gradient">Content Strategy Agent</span>
          </h1>
          <p className="text-xs text-slate-400">
            Generates copy guided by Context Engine token budget optimization & Cognitive Engine self-reflection.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('approvals')}
          className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          View Pending Approvals 🛡️
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm border-b border-white/10 pb-3">Prompt Directive</h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Target Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="linkedin">LinkedIn Post</option>
                  <option value="x">X (Twitter) Thread</option>
                  <option value="instagram">Instagram Caption</option>
                  <option value="email">Email Campaign</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Prompt / Content Brief</label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {generating ? 'Processing Cognitive Pipeline...' : 'Generate Brand Copy ⚡'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Output & Cognitive Trace */}
        <div className="lg:col-span-7 space-y-6">
          {latestResult ? (
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="badge-approved text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    {latestResult.cognitiveResult.critique.passed ? 'Critique Passed' : 'Needs Review'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Quality: {Math.round(latestResult.cognitiveResult.critique.qualityScore * 100)}%
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {latestResult.cognitiveResult.decision.approvalStatus.toUpperCase()}
                </span>
              </div>

              {/* Output Content */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Draft</span>
                <div className="rounded-xl bg-slate-950/80 p-4 border border-white/10 text-slate-200 text-sm leading-relaxed font-sans">
                  {String(latestResult.outputData.draftText ?? latestResult.outputSummary)}
                </div>
              </div>

              {/* Cognitive Trace Breakdown */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="rounded-lg bg-slate-900/60 p-2.5 border border-white/5">
                  <span className="text-[10px] text-slate-500 block">Alignment Score</span>
                  <span className="font-bold text-indigo-400">
                    {Math.round(latestResult.cognitiveResult.reasoning.alignmentScore * 100)}%
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-2.5 border border-white/5">
                  <span className="text-[10px] text-slate-500 block">Confidence Score</span>
                  <span className="font-bold text-emerald-400">
                    {Math.round(latestResult.cognitiveResult.confidence.aggregateScore * 100)}%
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/60 p-2.5 border border-white/5">
                  <span className="text-[10px] text-slate-500 block">Token Budget</span>
                  <span className="font-bold text-purple-400">
                    {latestResult.context.tokenAllocation.totalUsed} tokens
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center space-y-3">
              <div className="text-4xl text-slate-600">⚡</div>
              <h4 className="text-slate-300 font-semibold text-sm">Ready to Generate</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Submit a prompt brief on the left to execute the Context & Cognitive Engine pipeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
