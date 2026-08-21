import React, { useState } from 'react';
import { ViewTab } from '../Navbar';
import { AgentRegistry, AgentTaskResult } from '../../core/agents';
import { ApprovalManager } from '../../core/automation';
import { BusinessDNA } from '../../core/knowledge';
import { ContentGeneratorView } from '../ContentGeneratorView';
import { ApprovalsView } from '../ApprovalsView';
import { PublishingView } from '../PublishingView';

type WorkspaceTab = 'tasks' | 'campaigns' | 'recommendations' | 'generate' | 'approvals' | 'publishing';

interface TaskItem {
  id: string;
  title: string;
  agentRole: string;
  channel: string;
  priority: 'high' | 'medium' | 'normal';
  status: 'pending' | 'completed' | 'in_progress';
  dueDate: string;
}

interface CampaignItem {
  id: string;
  name: string;
  pillar: string;
  targetChannels: string[];
  progressPercent: number;
  status: 'active' | 'planning' | 'completed';
}

interface RecommendationItem {
  id: string;
  title: string;
  category: 'voice' | 'positioning' | 'conversion';
  impactScore: number;
  recommendation: string;
  actionText: string;
}

interface ContentWorkspaceViewProps {
  agentRegistry: AgentRegistry;
  approvalManager: ApprovalManager;
  businessId: string;
  dna: BusinessDNA;
  setActiveTab: (tab: ViewTab) => void;
  onContentGenerated: (result: AgentTaskResult) => void;
}

export const ContentWorkspaceView: React.FC<ContentWorkspaceViewProps> = ({
  agentRegistry,
  approvalManager,
  businessId,
  dna,
  setActiveTab,
  onContentGenerated,
}) => {
  const [subTab, setSubTab] = useState<WorkspaceTab>('tasks');

  const ci = dna.companyIdentity;
  const bv = dna.brandVoice;
  const cp = dna.customerProfile;
  const cpPos = dna.competitivePositioning;
  const companyName = ci.companyName.value;
  const uvp = ci.uniqueValueProposition.value;

  // Dynamically derived daily tasks per client Business DNA
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task_1',
      title: `Generate LinkedIn Launch Announcement for ${companyName}`,
      agentRole: 'content_creator',
      channel: 'LinkedIn',
      priority: 'high',
      status: 'pending',
      dueDate: 'Today, 2:00 PM',
    },
    {
      id: 'task_2',
      title: `Audit ${companyName} UVP Hook: "${uvp.substring(0, 45)}..."`,
      agentRole: 'strategic_planner',
      channel: 'Website & Social',
      priority: 'high',
      status: 'in_progress',
      dueDate: 'Today, 4:30 PM',
    },
    {
      id: 'task_3',
      title: `Enforce Brand Compliance: Filter Restricted Terms (${bv.wordsToAvoid.value.join(', ')})`,
      agentRole: 'brand_sentinel',
      channel: 'All Channels',
      priority: 'medium',
      status: 'completed',
      dueDate: 'Completed',
    },
  ]);

  // Dynamically derived campaigns per client Business DNA
  const campaigns: CampaignItem[] = [
    {
      id: 'camp_1',
      name: `${companyName} ${ci.industry.value.replace('_', ' ').toUpperCase()} Market Dominance`,
      pillar: uvp,
      targetChannels: ['LinkedIn', 'X (Twitter)', 'Email'],
      progressPercent: 65,
      status: 'active',
    },
    {
      id: 'camp_2',
      name: `${companyName} ${bv.primaryTone.value.toUpperCase()} Brand Identity Series`,
      pillar: `Targeting ${cp.targetAudience.value.substring(0, 40)}...`,
      targetChannels: ['LinkedIn', 'Blog', 'Whitepaper'],
      progressPercent: 40,
      status: 'active',
    },
  ];

  // Dynamically derived cognitive recommendations per client Business DNA
  const recommendations: RecommendationItem[] = [
    {
      id: 'rec_1',
      title: `Elevate UVP Hook in Social Headlines`,
      category: 'positioning',
      impactScore: 94,
      recommendation: `Incorporate "${uvp.substring(0, 50)}..." into top-of-funnel post titles to increase engagement by ~38%.`,
      actionText: 'Apply to Content Generator',
    },
    {
      id: 'rec_2',
      title: `Purge Restricted Terms from Draft Queue`,
      category: 'voice',
      impactScore: 90,
      recommendation: `Restricting ${bv.wordsToAvoid.value.length} terms (${bv.wordsToAvoid.value.join(', ')}) to maintain strictly ${bv.primaryTone.value} brand voice.`,
      actionText: 'Purge & Enforce Compliance',
    },
  ];

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  const subTabNav: { id: WorkspaceTab; label: string; badge?: number }[] = [
    { id: 'tasks', label: "Today's Tasks 📋", badge: tasks.filter((t) => t.status !== 'completed').length },
    { id: 'campaigns', label: 'Campaigns 🚀', badge: campaigns.length },
    { id: 'recommendations', label: 'Recommendations 💡', badge: recommendations.length },
    { id: 'generate', label: 'Generate ⚡' },
    { id: 'approvals', label: 'Approve 🛡️', badge: approvalManager.listPendingRequests(businessId).length },
    { id: 'publishing', label: 'Staged Publishing 📢' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <span>⚡ {companyName} — Action Workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Action-First <span className="text-gradient">Content Workspace</span>
          </h1>
          <p className="text-xs text-slate-400">
            Governed by canonical Business DNA • Prioritized daily task stack, campaign matrix, and cognitive recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('onboarding')}
            className="rounded-xl bg-slate-900 border border-indigo-500/30 px-5 py-3 font-bold text-xs text-indigo-300 hover:bg-indigo-950/50 hover:text-white transition-all shadow-sm"
          >
            🧬 Generate Business DNA
          </button>
          <button
            onClick={() => setSubTab('generate')}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 font-bold text-xs text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-opacity"
          >
            + Create AI Task ⚡
          </button>
        </div>
      </div>

      {/* 6 Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {subTabNav.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              subTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.label}</span>
            {Boolean(tab.badge && tab.badge > 0) && (
              <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px] font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sub-Tab 1: Today's Daily Tasks Stack */}
      {subTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Prioritized Daily Task Queue</h2>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {tasks.filter((t) => t.status === 'completed').length}/{tasks.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`glass-card p-5 flex flex-wrap items-center justify-between gap-4 transition-all ${
                  task.status === 'completed' ? 'opacity-50 bg-slate-900/40' : 'hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-white/20 hover:border-indigo-400'
                    }`}
                  >
                    {task.status === 'completed' && '✓'}
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-bold text-slate-100 ${
                        task.status === 'completed' ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>Agent: {task.agentRole}</span>
                      <span>•</span>
                      <span>Channel: {task.channel}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      task.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {task.priority} priority
                  </span>

                  <button
                    onClick={() => setSubTab('generate')}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                  >
                    Execute Task ⚡
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Campaigns */}
      {subTab === 'campaigns' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Active Campaign Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((c) => (
              <div key={c.id} className="glass-card p-6 space-y-4 border-indigo-500/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-base">{c.name}</span>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-medium">Strategic Pillar:</span>
                  <p className="text-indigo-300 font-semibold">{c.pillar}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-400 font-medium">Progress:</span>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                      style={{ width: `${c.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <div className="flex gap-2">
                    {c.targetChannels.map((ch, i) => (
                      <span key={i} className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-mono text-slate-300">
                        {ch}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setSubTab('generate')}
                    className="text-indigo-400 font-bold hover:underline"
                  >
                    Manage Campaign ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Cognitive Recommendations */}
      {subTab === 'recommendations' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Cognitive Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="glass-card p-6 space-y-3 border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💡</span>
                    <h3 className="font-bold text-slate-100 text-sm">{rec.title}</h3>
                  </div>
                  <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-0.5 text-[10px] font-bold">
                    Impact Score: {rec.impactScore}/100
                  </span>
                </div>

                <p className="text-xs text-slate-300">{rec.recommendation}</p>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSubTab('generate')}
                    className="rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-4 py-2 text-xs font-bold transition-all"
                  >
                    {rec.actionText} ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Generate */}
      {subTab === 'generate' && (
        <ContentGeneratorView
          agentRegistry={agentRegistry}
          businessId={businessId}
          setActiveTab={setActiveTab}
          onContentGenerated={onContentGenerated}
        />
      )}

      {/* Sub-Tab 5: Approvals */}
      {subTab === 'approvals' && (
        <ApprovalsView
          approvalManager={approvalManager}
          businessId={businessId}
          setActiveTab={setActiveTab}
          onApprovalResolved={() => {}}
        />
      )}

      {/* Sub-Tab 6: Publishing */}
      {subTab === 'publishing' && <PublishingView setActiveTab={setActiveTab} />}
    </div>
  );
};
