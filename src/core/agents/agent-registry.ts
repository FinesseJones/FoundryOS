import { ContextBuilder } from '../context';
import { BaseAgent } from './base-agent';
import { AgentRole, AgentTaskRequest, AgentTaskResult, AgentDescriptor } from './agent.types';
import { BrandAgent } from './brand-agent';
import { ContentAgent } from './content-agent';
import { PublishingAgent } from './publishing-agent';
import { WebsiteAgent } from './website-agent';
import { SecurityAgent } from './security-agent';
import { AnalyticsAgent } from './analytics-agent';
import { LearningAgent } from './learning-agent';

export class AgentRegistry {
  private agents: Map<AgentRole, BaseAgent> = new Map();

  constructor(contextBuilder: ContextBuilder) {
    this.registerAgent(new BrandAgent(contextBuilder));
    this.registerAgent(new ContentAgent(contextBuilder));
    this.registerAgent(new PublishingAgent(contextBuilder));
    this.registerAgent(new WebsiteAgent(contextBuilder));
    this.registerAgent(new SecurityAgent(contextBuilder));
    this.registerAgent(new AnalyticsAgent(contextBuilder));
    this.registerAgent(new LearningAgent(contextBuilder));
  }

  /**
   * Register an agent instance into the registry.
   */
  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.role, agent);
  }

  /**
   * Lookup an agent by role.
   */
  getAgent(role: AgentRole): BaseAgent {
    const agent = this.agents.get(role);
    if (!agent) {
      throw new Error(`No registered agent found for role: ${role}`);
    }
    return agent;
  }

  /**
   * List descriptors for all registered agents.
   */
  listAgents(): AgentDescriptor[] {
    return Array.from(this.agents.values()).map((agent) => agent.getDescriptor());
  }

  /**
   * Dispatch a task request to the target agent.
   */
  async dispatchTask(request: AgentTaskRequest): Promise<AgentTaskResult> {
    const agent = this.getAgent(request.role);
    return agent.executeTask(request);
  }
}
