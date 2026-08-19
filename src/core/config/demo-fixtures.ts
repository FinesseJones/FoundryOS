import { createDefaultBusinessDNA, BusinessDNA } from '../knowledge';

export interface DemoWorkspaceRecord {
  workspaceId: string;
  workspaceName: string;
  organizationId: string;
  organizationName: string;
  businessId: string;
  primaryContact: string;
  dna: BusinessDNA;
}

export function getDemoWorkspaces(): DemoWorkspaceRecord[] {
  const datadogDNA = createDefaultBusinessDNA('biz_datadog_001', {
    companyIdentity: {
      companyName: { value: 'Datadog' },
      legalName: { value: 'Datadog Inc' },
      industry: { value: 'devops_cloud_observability' },
      stage: { value: 'enterprise' },
      mission: { value: 'Cloud Monitoring as a Service & Full-Stack Telemetry.' },
      uniqueValueProposition: { value: 'AI-Powered Observability and Cloud Security in a single pane of glass.' },
    },
    brandVoice: {
      primaryTone: { value: 'technical' },
      wordsToUse: { value: ['observability', 'telemetry', 'real-time', 'security'] },
    },
    customerProfile: {
      targetAudience: { value: 'DevOps Leads, SREs, and VPs of Infrastructure.' },
    },
    competitivePositioning: {
      primaryCompetitors: { value: ['Dynatrace', 'New Relic'] },
    },
    websiteAnalysis: {
      primaryUrl: { value: 'https://www.datadoghq.com' },
    },
  });

  const traneDNA = createDefaultBusinessDNA('biz_trane_002', {
    companyIdentity: {
      companyName: { value: 'Trane Technologies' },
      legalName: { value: 'Trane Technologies plc' },
      industry: { value: 'hvac_building_services' },
      stage: { value: 'enterprise' },
      mission: { value: 'Boldly challenging what’s possible for a sustainable world with climate solutions.' },
      uniqueValueProposition: { value: 'Industry-leading energy-efficient HVAC and building automation systems.' },
    },
    brandVoice: {
      primaryTone: { value: 'authoritative' },
      wordsToUse: { value: ['efficiency', 'sustainable', 'climate', 'innovation'] },
    },
    customerProfile: {
      targetAudience: { value: 'Facility managers, commercial building owners, and residential homeowners.' },
    },
    competitivePositioning: {
      primaryCompetitors: { value: ['Carrier', 'Lennox', 'Daikin'] },
    },
    websiteAnalysis: {
      primaryUrl: { value: 'https://www.trane.com' },
    },
  });

  return [
    {
      workspaceId: 'ws_datadog_001',
      workspaceName: 'Datadog HQ Workspace',
      organizationId: 'org_datadog_001',
      organizationName: 'Datadog Inc',
      businessId: 'biz_datadog_001',
      primaryContact: 'admin@datadoghq.com',
      dna: datadogDNA,
    },
    {
      workspaceId: 'ws_trane_002',
      workspaceName: 'Trane Climate Workspace',
      organizationId: 'org_trane_002',
      organizationName: 'Trane Technologies',
      businessId: 'biz_trane_002',
      primaryContact: 'contact@trane.com',
      dna: traneDNA,
    },
  ];
}
