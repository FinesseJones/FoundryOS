export type KnowledgeNodeType =
  | 'company'
  | 'product'
  | 'service'
  | 'customer'
  | 'competitor'
  | 'offer'
  | 'campaign'
  | 'content'
  | 'analytics'
  | 'learning';

export interface KnowledgeGraphNode {
  id: string;
  type: KnowledgeNodeType;
  label: string;
  properties: Record<string, unknown>;
  confidence: number;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relation: string; // e.g. "OFFERS", "SERVES", "COMPETES_WITH", "PRODUCES", "MEASURES"
  weight: number;
}

export interface BusinessKnowledgeGraph {
  businessId: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  nodeCount: number;
  edgeCount: number;
  updatedAt: string;
}

export class KnowledgeGraphBuilder {
  buildKnowledgeGraph(businessId: string, companyName: string): BusinessKnowledgeGraph {
    const nodes: KnowledgeGraphNode[] = [
      { id: 'node_comp_1', type: 'company', label: companyName, properties: { businessId }, confidence: 1.0 },
      { id: 'node_prod_1', type: 'product', label: 'Business DNA Engine', properties: { tier: 'core' }, confidence: 0.95 },
      { id: 'node_serv_1', type: 'service', label: 'Multi-Agent Automation', properties: { agents: 7 }, confidence: 0.95 },
      { id: 'node_cust_1', type: 'customer', label: 'Enterprise Marketing Teams', properties: { segment: 'B2B' }, confidence: 0.9 },
      { id: 'node_comp_2', type: 'competitor', label: 'Legacy CopyBot', properties: { threat: 'low' }, confidence: 0.85 },
      { id: 'node_off_1', type: 'offer', label: 'Growth Tier Trial', properties: { priceUsd: 997 }, confidence: 0.9 },
      { id: 'node_camp_1', type: 'campaign', label: 'Summer Scale 2026', properties: { status: 'active' }, confidence: 0.95 },
      { id: 'node_cont_1', type: 'content', label: 'Launch Announcement', properties: { channel: 'linkedin' }, confidence: 0.9 },
      { id: 'node_ana_1', type: 'analytics', label: 'ROI Benchmark', properties: { roiMultiplier: 3.4 }, confidence: 0.88 },
      { id: 'node_learn_1', type: 'learning', label: 'Voice Tuning Memory', properties: { iterations: 12 }, confidence: 0.92 },
    ];

    const edges: KnowledgeGraphEdge[] = [
      { id: 'edge_1', sourceNodeId: 'node_comp_1', targetNodeId: 'node_prod_1', relation: 'BUILDS', weight: 1.0 },
      { id: 'edge_2', sourceNodeId: 'node_comp_1', targetNodeId: 'node_serv_1', relation: 'DELIVERS', weight: 1.0 },
      { id: 'edge_3', sourceNodeId: 'node_prod_1', targetNodeId: 'node_cust_1', relation: 'SERVES', weight: 0.95 },
      { id: 'edge_4', sourceNodeId: 'node_comp_1', targetNodeId: 'node_comp_2', relation: 'COMPETES_WITH', weight: 0.85 },
      { id: 'edge_5', sourceNodeId: 'node_prod_1', targetNodeId: 'node_off_1', relation: 'PACKAGE_AS', weight: 0.9 },
      { id: 'edge_6', sourceNodeId: 'node_camp_1', targetNodeId: 'node_cont_1', relation: 'PRODUCES', weight: 0.95 },
      { id: 'edge_7', sourceNodeId: 'node_cont_1', targetNodeId: 'node_ana_1', relation: 'MEASURED_BY', weight: 0.9 },
      { id: 'edge_8', sourceNodeId: 'node_ana_1', targetNodeId: 'node_learn_1', relation: 'FEED_INTO', weight: 0.92 },
    ];

    return {
      businessId,
      nodes,
      edges,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      updatedAt: new Date().toISOString(),
    };
  }
}
