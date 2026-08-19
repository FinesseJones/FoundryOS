'use client';

import React, { useState, useMemo } from 'react';
import { Navbar, ViewTab, ClientWorkspaceOption } from '../components/Navbar';
import { LandingView } from '../components/LandingView';
import { LandingPage } from '../components/auth/LandingPage';
import { AuthView } from '../components/AuthView';
import { UploadWizardView, ClientWorkspaceDetails } from '../components/UploadWizardView';
import { BusinessReportView } from '../components/BusinessReportView';
import { ContentGeneratorView } from '../components/ContentGeneratorView';
import { ContentCalendarView } from '../components/ContentCalendarView';
import { ApprovalsView } from '../components/ApprovalsView';
import { PublishingView } from '../components/PublishingView';
import { AnalyticsView } from '../components/AnalyticsView';
import { BillingView } from '../components/BillingView';
import { ContentWorkspaceView } from '../components/workspace/ContentWorkspaceView';
import { AdminPortalView, AdminClientRecord } from '../components/saas/AdminPortalView';
import { AutomationMarketplaceView } from '../components/customer/AutomationMarketplaceView';

import { DashboardView } from '../components/customer/DashboardView';
import { TodayView } from '../components/customer/TodayView';
import { DigitalTwinView } from '../components/digital-twin/DigitalTwinView';
import { MarketingIntelligenceView } from '../components/customer/MarketingIntelligenceView';
import { SalesIntelligenceView } from '../components/customer/SalesIntelligenceView';
import { OperationsIntelligenceView } from '../components/customer/OperationsIntelligenceView';
import { CustomersView } from '../components/customers/CustomersView';
import { AIAgentsView } from '../components/agents/AIAgentsView';
import { KnowledgeGraphView } from '../components/knowledge/KnowledgeGraphView';

import { createDefaultBusinessDNA, BusinessDNA } from '../core/knowledge';
import { ContextBuilder } from '../core/context';
import { AgentRegistry, AgentTaskResult } from '../core/agents';
import { AutomationEngine } from '../core/automation';
import { BusinessDNARepository, AuditRepository, MemoryRepository } from '../core/persistence/repositories';
import { AutonomousExecutionService } from '../core/execution/autonomous-execution-service';
import { CustomerAutomationService } from '../core/automation/customer-automation-service';
import { SaaSAuthManager } from '../core/saas/auth';
import { SaaSBillingManager } from '../core/saas/billing';
import { CustomerStateManager } from '../core/saas/customer-state';

import { getDemoWorkspaces } from '../core/config/demo-fixtures';

export default function Home() {
  const isDemoEnv = typeof process !== 'undefined' && process.env?.TACF_MODE === 'demo';

  const [clientWorkspaces, setClientWorkspaces] = useState<
    {
      workspaceId: string;
      workspaceName: string;
      organizationId: string;
      organizationName: string;
      businessId: string;
      primaryContact: string;
      dna: BusinessDNA;
    }[]
  >(() => (isDemoEnv ? getDemoWorkspaces() : []));

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    () => (isDemoEnv ? 'ws_datadog_001' : '')
  );

  const [activeTab, setActiveTab] = useState<ViewTab>(() => (isDemoEnv ? 'today' : 'landing'));
  const [prefilledUrl, setPrefilledUrl] = useState<string | undefined>();
  const [prefilledCompanyName, setPrefilledCompanyName] = useState<string | undefined>();

  // Derive active workspace details
  const currentClient = useMemo(() => {
    return clientWorkspaces.find((w) => w.workspaceId === activeWorkspaceId) || clientWorkspaces[0];
  }, [clientWorkspaces, activeWorkspaceId]);

  const dna = useMemo(() => {
    return currentClient?.dna || createDefaultBusinessDNA('biz_default_trial');
  }, [currentClient]);

  const businessId = currentClient?.businessId || 'biz_default_trial';
  const organizationId = currentClient?.organizationId || 'org_default_trial';
  const organizationName = currentClient?.organizationName || 'Trial Organization';

  const dnaRepo = useMemo(() => {
    const r = new BusinessDNARepository();
    r.saveDNA(dna, organizationId);
    return r;
  }, [dna, organizationId]);

  const auditRepo = useMemo(() => new AuditRepository(), []);
  const memoryRepo = useMemo(() => new MemoryRepository(), []);
  const authManager = useMemo(() => new SaaSAuthManager(), []);
  const billingManager = useMemo(() => new SaaSBillingManager(), []);
  const stateManager = useMemo(() => new CustomerStateManager(), []);

  // Initialize Core Engines for Active Client Context
  const contextBuilder = useMemo(() => {
    const cb = new ContextBuilder();
    cb.registerBusinessDNA(dna);
    return cb;
  }, [dna]);

  const agentRegistry = useMemo(() => new AgentRegistry(contextBuilder), [contextBuilder]);

  const automationEngine = useMemo(() => {
    const ae = new AutomationEngine({ contextBuilder, agentRegistry });
    if (businessId && dna?.companyIdentity?.companyName?.value) {
      if (ae.approvalManager.listPendingRequests(businessId).length === 0) {
        ae.approvalManager.createRequest({
          workflowRunId: `run_${Date.now()}_1`,
          businessId,
          actionTitle: `${dna.companyIdentity.companyName.value} Market Launch Campaign`,
          description: `AI generated launch strategy using ${dna.brandVoice.primaryTone.value} brand tone. Target: ${dna.customerProfile.targetAudience.value.substring(0, 45)}...`,
          proposedByAgent: 'content',
        });
      }
    }
    return ae;
  }, [contextBuilder, agentRegistry, businessId, dna]);

  const execService = useMemo(() =>
    new AutonomousExecutionService(dnaRepo, auditRepo, memoryRepo, contextBuilder, undefined, automationEngine.approvalManager),
    [dnaRepo, auditRepo, memoryRepo, contextBuilder, automationEngine.approvalManager]
  );

  const autoService = useMemo(() =>
    new CustomerAutomationService(dnaRepo, auditRepo, memoryRepo, contextBuilder, execService),
    [dnaRepo, auditRepo, memoryRepo, contextBuilder, execService]
  );

  // Token Tracking State
  const [tokenUsage, setTokenUsage] = useState({ used: 14200, total: 500000 });

  const handleDNAUpdated = (newDNA: BusinessDNA, clientDetails?: ClientWorkspaceDetails) => {
    if (clientDetails) {
      const newClient = {
        workspaceId: clientDetails.workspaceId,
        workspaceName: clientDetails.workspaceName,
        organizationId: clientDetails.organizationId,
        organizationName: clientDetails.organizationName,
        businessId: newDNA.businessId,
        primaryContact: 'admin@client.com',
        dna: newDNA,
      };

      setClientWorkspaces((prev) => [...prev, newClient]);
      setActiveWorkspaceId(newClient.workspaceId);
    } else {
      setClientWorkspaces((prev) =>
        prev.map((w) => (w.workspaceId === activeWorkspaceId ? { ...w, dna: newDNA } : w))
      );
    }

    contextBuilder.registerBusinessDNA(newDNA);
    setActiveTab('home');
  };

  const handleContentGenerated = (result: AgentTaskResult) => {
    setTokenUsage((prev) => ({
      ...prev,
      used: prev.used + result.context.tokenAllocation.totalUsed,
    }));
  };

  const pendingApprovalsCount = automationEngine.approvalManager.listPendingRequests(businessId).length;

  // Transform clientWorkspaces for Navbar Dropdown
  const workspaceOptions: ClientWorkspaceOption[] = clientWorkspaces.map((w) => ({
    workspaceId: w.workspaceId,
    workspaceName: w.workspaceName,
    organizationName: w.organizationName,
  }));

  // Transform clientWorkspaces for Admin Dashboard Table
  const adminClients: AdminClientRecord[] = clientWorkspaces.map((w) => ({
    organizationId: w.organizationId,
    organizationName: w.organizationName,
    workspaceId: w.workspaceId,
    workspaceName: w.workspaceName,
    businessDnaVersion: `${w.dna.companyIdentity.companyName.value} DNA v1`,
    status: 'Active',
    planTier: 'Growth',
    tokenUsage: Math.floor(Math.random() * 15000) + 5000,
    primaryContact: w.primaryContact,
    createdAt: new Date().toISOString().split('T')[0],
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans">
      {/* Global Navbar with 10 Top-Level Nav Items */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workspaces={workspaceOptions}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={(wsId) => {
          setActiveWorkspaceId(wsId);
          setActiveTab('home');
        }}
        onCreateNewWorkspace={() => setActiveTab('onboarding')}
        tokenUsage={tokenUsage}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main View Shell — Living AI Executive Operating System */}
      <main className="flex-1">
        {/* Executive OS Navigation Tabs */}
        {activeTab === 'today' && <TodayView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'clients' && <CustomersView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'ai_team' && <AIAgentsView agentRegistry={agentRegistry} setActiveTab={setActiveTab} />}
        {activeTab === 'growth' && <MarketingIntelligenceView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'assets' && (
          <ContentWorkspaceView
            agentRegistry={agentRegistry}
            approvalManager={automationEngine.approvalManager}
            businessId={businessId}
            dna={dna}
            setActiveTab={setActiveTab}
            onContentGenerated={handleContentGenerated}
          />
        )}
        {activeTab === 'automation' && (
          <AutomationMarketplaceView
            autoService={autoService}
            organizationId={organizationId}
            businessId={businessId}
          />
        )}
        {activeTab === 'inbox' && (
          <ApprovalsView
            approvalManager={automationEngine.approvalManager}
            businessId={businessId}
            setActiveTab={setActiveTab}
            onApprovalResolved={() => {}}
          />
        )}
        {activeTab === 'digital_twin' && (
          <DigitalTwinView
            dna={dna}
            organizationId={organizationId}
            workspaceId={activeWorkspaceId}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Legacy & Workspace Fallback Tab Compatibility */}
        {activeTab === 'home' && <TodayView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'marketing' && <MarketingIntelligenceView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'sales' && <SalesIntelligenceView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'customers' && <CustomersView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'operations' && <OperationsIntelligenceView setActiveTab={setActiveTab} />}
        {activeTab === 'content' && (
          <ContentWorkspaceView
            agentRegistry={agentRegistry}
            approvalManager={automationEngine.approvalManager}
            businessId={businessId}
            dna={dna}
            setActiveTab={setActiveTab}
            onContentGenerated={handleContentGenerated}
          />
        )}
        {activeTab === 'automations' && (
          <AutomationMarketplaceView
            autoService={autoService}
            organizationId={organizationId}
            businessId={businessId}
          />
        )}
        {activeTab === 'ai_agents' && <AIAgentsView agentRegistry={agentRegistry} setActiveTab={setActiveTab} />}
        {activeTab === 'knowledge' && (
          <KnowledgeGraphView
            dna={dna}
            organizationId={organizationId}
            workspaceId={activeWorkspaceId}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === 'settings' && <BillingView tokenUsage={tokenUsage} />}

        {/* Platform Operations */}
        {activeTab === 'admin' && (
          <AdminPortalView
            authManager={authManager}
            billingManager={billingManager}
            stateManager={stateManager}
            auditRepo={auditRepo}
            setActiveTab={setActiveTab}
            clients={adminClients}
          />
        )}
        {activeTab === 'onboarding' && (
          <UploadWizardView
            setActiveTab={setActiveTab}
            onDNAUpdated={handleDNAUpdated}
            initialUrl={prefilledUrl}
            initialCompanyName={prefilledCompanyName}
          />
        )}
        {activeTab === 'landing' && (
          <LandingPage
            onStartOnboarding={(url, companyName) => {
              setPrefilledUrl(url);
              setPrefilledCompanyName(companyName);
              setActiveTab('onboarding');
            }}
          />
        )}
        {activeTab === 'report' && <BusinessReportView dna={dna} setActiveTab={setActiveTab} />}
        {activeTab === 'workspace' && (
          <ContentWorkspaceView
            agentRegistry={agentRegistry}
            approvalManager={automationEngine.approvalManager}
            businessId={businessId}
            dna={dna}
            setActiveTab={setActiveTab}
            onContentGenerated={handleContentGenerated}
          />
        )}
      </main>
    </div>
  );
}
