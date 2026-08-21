"use client";

import React, { useState, useMemo } from 'react';
import AppLayout from "@/components/AppLayout";
import { 
  Sparkles, 
  Activity, 
  Megaphone, 
  Target, 
  Sliders, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  ShoppingBag, 
  RefreshCw, 
  Database, 
  Key
} from 'lucide-react';

import { TodayView } from "@/components/customer/TodayView";
import { MarketingIntelligenceView } from "@/components/customer/MarketingIntelligenceView";
import { SalesIntelligenceView } from "@/components/customer/SalesIntelligenceView";
import { OperationsIntelligenceView } from "@/components/customer/OperationsIntelligenceView";
import { SecurityIntelligenceView } from "@/components/customer/SecurityIntelligenceView";
import { IntelligenceAnalyticsView } from "@/components/customer/IntelligenceAnalyticsView";
import { ExecutionIntelligenceView } from "@/components/customer/ExecutionIntelligenceView";
import { AutomationMarketplaceView } from "@/components/customer/AutomationMarketplaceView";
import { KnowledgeRefreshView } from "@/components/customer/KnowledgeRefreshView";
import { DataSourcesView } from "@/components/customer/DataSourcesView";
import { UsageDashboard } from "@/components/customer/UsageDashboard";

import { createDefaultBusinessDNA, BusinessDNA } from "@/core/knowledge";
import { ContextBuilder } from "@/core/context";
import { BusinessDNARepository, AuditRepository, MemoryRepository } from "@/core/persistence/repositories";
import { AutonomousExecutionService, ExecutionPlan, ExecutionApprovalRequest, ExecutionLearningRecord } from "@/core/execution/autonomous-execution-service";
import { CustomerAutomationService } from "@/core/automation/customer-automation-service";
import { DataSourceService, DataSourceRecord } from "@/core/ingestion/data-source-service";
import { KnowledgeRefreshService, RefreshRecord, RefreshSchedule } from "@/core/ingestion/knowledge-refresh-service";
import { SecurityIntelligenceService, SecurityPostureReport, DetectedSecurityRisk, SecurityRecommendation } from "@/core/security/security-intelligence-service";
import { OperationsIntelligenceService } from "@/core/operations/operations-intelligence-service";
import { SalesIntelligenceService } from "@/core/sales/sales-intelligence-service";
import { MarketingIntelligenceService } from "@/core/marketing/marketing-intelligence-service";
import { IntelligenceAnalyticsService } from "@/core/intelligence/intelligence-analytics-service";

import { BusinessDNADashboard } from "@/components/dna/BusinessDNADashboard";
import { AccountManager, StoredBusinessDNA } from "@/core/saas/auth";

export type CustomerIntelligenceTab = 
  | 'dna'
  | 'today' 
  | 'marketing' 
  | 'sales' 
  | 'operations' 
  | 'security' 
  | 'analytics' 
  | 'execution' 
  | 'marketplace' 
  | 'refresh' 
  | 'sources' 
  | 'usage';

interface CustomerIntelligenceProps {
  initialDna?: BusinessDNA;
  organizationId?: string;
  businessId?: string;
}

export default function CustomerIntelligence({
  initialDna,
  organizationId = 'org_tacf_enterprise',
  businessId = 'biz_tacf_enterprise'
}: CustomerIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<CustomerIntelligenceTab>('today');

  // 1. Initialize Authoritative DNA Model
  const dna = useMemo<BusinessDNA>(() => {
    return initialDna || createDefaultBusinessDNA(businessId);
  }, [initialDna, businessId]);

  // 2. Initialize Repositories & Context
  const dnaRepo = useMemo(() => {
    const r = new BusinessDNARepository();
    r.saveDNA(dna, organizationId);
    return r;
  }, [dna, organizationId]);

  const auditRepo = useMemo(() => new AuditRepository(), []);
  const memoryRepo = useMemo(() => new MemoryRepository(), []);

  const contextBuilder = useMemo(() => {
    const cb = new ContextBuilder();
    cb.registerBusinessDNA(dna);
    return cb;
  }, [dna]);

  // 3. Initialize Domain Intelligence Services
  const execService = useMemo(() => new AutonomousExecutionService(dnaRepo, auditRepo, memoryRepo, contextBuilder), [dnaRepo, auditRepo, memoryRepo, contextBuilder]);
  const autoService = useMemo(() => new CustomerAutomationService(dnaRepo, auditRepo, memoryRepo, contextBuilder, execService), [dnaRepo, auditRepo, memoryRepo, contextBuilder, execService]);
  const dataSourceService = useMemo(() => new DataSourceService(auditRepo), [auditRepo]);
  const refreshService = useMemo(() => new KnowledgeRefreshService(dnaRepo, auditRepo, dataSourceService), [dnaRepo, auditRepo, dataSourceService]);

  const securityService = useMemo(() => new SecurityIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder), [dnaRepo, auditRepo, memoryRepo, contextBuilder]);
  const operationsService = useMemo(() => new OperationsIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder), [dnaRepo, auditRepo, memoryRepo, contextBuilder]);
  const salesService = useMemo(() => new SalesIntelligenceService(dnaRepo, auditRepo, memoryRepo, contextBuilder), [dnaRepo, auditRepo, memoryRepo, contextBuilder]);
  const marketingService = useMemo(() => new MarketingIntelligenceService(dnaRepo, auditRepo, contextBuilder), [dnaRepo, auditRepo, contextBuilder]);
  const analyticsService = useMemo(() => new IntelligenceAnalyticsService(dnaRepo, auditRepo, memoryRepo, contextBuilder), [dnaRepo, auditRepo, memoryRepo, contextBuilder]);

  // Pre-seed sample security and operational signals for instant UI responsiveness
  const [securityReport] = useState<SecurityPostureReport>({
    id: 'posture_rep_01',
    organizationId,
    businessId,
    securityScore: 94,
    riskLevel: 'LOW',
    strengths: ['Cryptographic 256-bit token entropy', 'Strict multi-tenant workspace separation', 'Append-only audit integrity'],
    weaknesses: ['Review quarterly third-party webhook integrations'],
    recommendedActions: ['Maintain current 2-hop delegation boundary', 'Audit active API key rotation policies'],
    analyzedAt: new Date().toISOString(),
  });

  const [detectedRisks] = useState<DetectedSecurityRisk[]>([
    {
      id: 'risk_sec_01',
      organizationId,
      businessId,
      riskType: 'PERMISSION_RISK',
      severity: 'LOW',
      confidence: 0.95,
      evidence: 'Agent delegation depth is within normal parameters (depth = 1).',
      recommendedAction: 'Maintain current delegation policy.',
      status: 'ACTIVE',
      detectedAt: new Date().toISOString(),
    },
  ]);

  const [securityRecommendations] = useState<SecurityRecommendation[]>([
    {
      id: 'rec_sec_01',
      organizationId,
      businessId,
      priority: 'LOW',
      recommendation: 'Enable periodic API key rotation reminder for workspace admins.',
      affectedArea: 'Credentials & Access',
      actionPlan: ['Configure 90-day key expiry policy', 'Send automated notification on day 80'],
      expectedImprovement: '+2% to Overall Security Posture',
      timeline: 'Next 30 Days',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [samplePlans] = useState<ExecutionPlan[]>([
    {
      executionId: 'exec_auto_001',
      organizationId,
      businessId,
      objective: 'Synchronize Website Messaging & Value Proposition',
      domain: 'marketing',
      actions: ['Extract UVP from Business DNA', 'Synthesize Landing Page Headlines', 'Verify Brand Voice Alignment'],
      requiredAgents: ['system_brand_agent_v1', 'system_content_agent_v1'],
      estimatedImpact: '+18% brand messaging consistency',
      riskLevel: 'LOW',
      approvalRequired: false,
      status: 'COMPLETED',
      completionPercent: 100,
      results: ['Headlines synthesized successfully and checked against brand voice guidelines.'],
      failures: [],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [sampleApprovals] = useState<ExecutionApprovalRequest[]>([]);
  const [sampleLearnings] = useState<ExecutionLearningRecord[]>([
    {
      executionId: 'exec_auto_001',
      organizationId,
      businessId,
      outcome: 'SUCCESS',
      learnings: ['Direct extraction of Opportunity Pillars produced high-converting headlines.'],
      recordedAt: new Date().toISOString(),
    },
  ]);

  const [sampleSources, setSampleSources] = useState<DataSourceRecord[]>([
    {
      id: 'src_web_01',
      organizationId,
      businessId,
      sourceType: 'WEBSITE',
      sourceName: 'Primary Corporate Portal (https://brandfirst.ai)',
      sourceStatus: 'ACTIVE',
      connectionStatus: 'CONNECTED',
      syncCount: 14,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [sampleRefreshHistory] = useState<RefreshRecord[]>([
    {
      id: 'ref_001',
      organizationId,
      businessId,
      sourceId: 'src_web_01',
      sourceName: 'Primary Corporate Portal',
      status: 'COMPLETED',
      changesDetected: 0,
      changesDescription: ['No structural alterations detected in latest crawl.'],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
  ]);

  const [sampleSchedules] = useState<Record<string, RefreshSchedule>>({
    src_web_01: {
      sourceId: 'src_web_01',
      organizationId,
      businessId,
      frequency: 'DAILY',
      status: 'SCHEDULED',
      lastRefreshAt: new Date().toISOString(),
      nextRefreshAt: new Date(Date.now() + 86400000).toISOString(),
    },
  });

  const currentSession = useMemo(() => AccountManager.getInstance().getCurrentSession(), []);
  const storedDna = useMemo<StoredBusinessDNA>(() => {
    if (currentSession && currentSession.organizationId) {
      const found = AccountManager.getInstance().getBusinessDNA(currentSession.token, currentSession.organizationId);
      if (found) return found;
    }
    return {
      id: `dna_${organizationId}`,
      businessId,
      organizationId,
      schemaVersion: '1.0',
      confidenceScore: 0.94,
      companyIdentity: {
        companyName: dna.companyIdentity.companyName.value,
        industry: typeof dna.companyIdentity.industry.value === 'string' ? dna.companyIdentity.industry.value : 'technology_saas',
        stage: 'growth',
        mission: dna.companyIdentity.mission.value,
        uniqueValueProposition: dna.companyIdentity.uniqueValueProposition.value,
        coreValues: ['Operational Speed', 'Customer Excellence', 'Deterministic Accuracy', 'Zero-Trust Integrity'],
      },
      opportunityPillars: {
        financialPain: '$1.2M in annual overhead lost to execution friction.',
        processGap: 'Manual departmental workflows and tool fragmentation.',
        stakeholderAlignment: 'Executive Leadership (Direct Sponsor)',
      },
      brandVoice: {
        primaryTone: typeof dna.brandVoice.primaryTone.value === 'string' ? dna.brandVoice.primaryTone.value : 'authoritative',
        wordsToUse: ['autonomous', 'precision', 'streamlined', 'enterprise', 'intelligence'],
        wordsToAvoid: ['manual', 'slow', 'legacy', 'approximate'],
      },
      customerProfile: {
        targetAudience: dna.customerProfile.targetAudience.value,
        primaryPainPoints: ['Manual departmental workflows', '$1.2M annual overhead', 'Lack of unified operational visibility'],
        buyerPersonas: [
          { name: 'VP of Growth & Operations', role: 'Executive Champion', challenges: ['Process bottlenecks', 'Budget efficiency'] },
          { name: 'Head of Brand Strategy', role: 'Brand Custodian', challenges: ['Consistency across channels', 'Fast turnaround'] },
        ],
      },
      competitivePositioning: {
        marketPosition: 'Market Leader & Autonomous Pioneer',
        primaryCompetitors: ['Legacy Consultancies', 'Manual SaaS Point Tools'],
        keyDifferentiators: ['Closed-loop Business DNA', 'Self-generating websites', 'Multi-domain zero-trust governance'],
      },
      websiteAnalysis: {
        primaryUrl: 'https://brandfirst.ai',
        colors: ['#4f46e5', '#10b981', '#0f172a', '#6366f1', '#38bdf8'],
        fonts: ['Inter', 'Space Grotesk', 'JetBrains Mono'],
      },
      updatedAt: new Date().toISOString(),
    };
  }, [currentSession, organizationId, businessId, dna]);

  const navTabs: { id: CustomerIntelligenceTab; label: string; icon: React.ElementType }[] = [
    { id: 'dna', label: 'Business DNA Graph', icon: Sparkles },
    { id: 'today', label: 'Executive Briefing', icon: Activity },
    { id: 'marketing', label: 'Marketing Intel', icon: Megaphone },
    { id: 'sales', label: 'Sales Intel', icon: Target },
    { id: 'operations', label: 'Operations Intel', icon: Sliders },
    { id: 'security', label: 'Zero-Trust Security', icon: ShieldCheck },
    { id: 'analytics', label: 'Maturity Analytics', icon: BarChart3 },
    { id: 'execution', label: 'Autonomous Execution', icon: Zap },
    { id: 'marketplace', label: 'Automation Marketplace', icon: ShoppingBag },
    { id: 'refresh', label: 'Knowledge Refresh', icon: RefreshCw },
    { id: 'sources', label: 'Data Sources', icon: Database },
    { id: 'usage', label: 'Usage & Quotas', icon: Key },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header HUD Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>TACF Multi-Domain Intelligence Core</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {storedDna.companyIdentity.companyName} — Business DNA OS
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Active tenant intelligence models evaluated continuously across Marketing, Sales, Operations, and Zero-Trust Security.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
                Tenant: <strong className="text-white">{organizationId}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-xs font-bold text-emerald-300">
                ● Live Autonomous
              </span>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Workspace Rendering */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl">
          {activeTab === 'dna' && (
            <BusinessDNADashboard 
              dna={storedDna} 
              session={currentSession || {
                userId: 'usr_guest',
                email: 'guest@tacfos.tech',
                name: 'Guest',
                role: 'ADMIN',
                organizationId,
                organizationName: storedDna.companyIdentity.companyName,
                token: 'tok_guest',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 86400000).toISOString(),
              }} 
            />
          )}
          {activeTab === 'today' && (
            <TodayView 
              dna={dna} 
              setActiveTab={(tab: any) => {
                if (tab === 'marketing' || tab === 'growth') setActiveTab('marketing');
                else if (tab === 'sales') setActiveTab('sales');
                else if (tab === 'operations') setActiveTab('operations');
                else if (tab === 'automation') setActiveTab('marketplace');
              }} 
            />
          )}

          {activeTab === 'marketing' && (
            <MarketingIntelligenceView 
              dna={dna} 
              setActiveTab={(tab: any) => {
                if (tab === 'today') setActiveTab('today');
              }} 
            />
          )}

          {activeTab === 'sales' && (
            <SalesIntelligenceView 
              dna={dna} 
              setActiveTab={(tab: any) => {
                if (tab === 'today') setActiveTab('today');
              }} 
            />
          )}

          {activeTab === 'operations' && (
            <OperationsIntelligenceView 
              setActiveTab={(tab: any) => {
                if (tab === 'today') setActiveTab('today');
              }} 
            />
          )}

          {activeTab === 'security' && (
            <SecurityIntelligenceView 
              postureReport={securityReport}
              detectedRisks={detectedRisks}
              recommendations={securityRecommendations}
              onAnalyzePosture={() => {}}
              onDetectRisks={() => {}}
              onGenerateRecommendation={() => {}}
            />
          )}

          {activeTab === 'analytics' && (
            <IntelligenceAnalyticsView 
              performanceReports={[]}
              winningPatterns={[]}
              recommendations={[]}
              learningHistory={[]}
            />
          )}

          {activeTab === 'execution' && (
            <ExecutionIntelligenceView 
              plans={samplePlans}
              approvals={sampleApprovals}
              learnings={sampleLearnings}
            />
          )}

          {activeTab === 'marketplace' && (
            <AutomationMarketplaceView 
              autoService={autoService}
              organizationId={organizationId}
              businessId={businessId}
            />
          )}

          {activeTab === 'refresh' && (
            <KnowledgeRefreshView 
              sources={sampleSources}
              refreshHistory={sampleRefreshHistory}
              schedules={sampleSchedules}
            />
          )}

          {activeTab === 'sources' && (
            <DataSourcesView 
              sources={sampleSources}
              onAddSource={(type, name) => {
                const newSource: DataSourceRecord = {
                  id: `src_${Date.now()}`,
                  organizationId,
                  businessId,
                  sourceType: type,
                  sourceName: name,
                  sourceStatus: 'ACTIVE',
                  connectionStatus: 'CONNECTED',
                  syncCount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setSampleSources((prev) => [newSource, ...prev]);
              }}
              onDisconnectSource={(sourceId) => {
                setSampleSources((prev) => prev.filter((s) => s.id !== sourceId));
              }}
            />
          )}

          {activeTab === 'usage' && (
            <UsageDashboard 
              tokenUsage={{ used: 142000, total: 1000000 }}
              setActiveTab={() => {}}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
