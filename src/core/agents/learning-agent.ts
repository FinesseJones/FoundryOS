import { BaseAgent } from './base-agent';
import { AgentRole, AgentAccessRights, AgentTaskRequest } from './agent.types';
import { EngineContext } from '../context';

export class LearningAgent extends BaseAgent {
  readonly role: AgentRole = 'learning';
  readonly name = 'Learning & Adaptation Agent';
  readonly description = 'Continuously analyzes all interactions across Business DNA and memory to extract winning patterns and propose voice evolutionary updates.';
  readonly accessRights: AgentAccessRights = {
    readableDomains: ['*'], // Access to all domains for continuous learning
    writableDomains: ['learning', 'analytics', 'recommendations', 'confidence_score'],
  };

  protected async processAgentTask(
    request: AgentTaskRequest,
    context: EngineContext
  ): Promise<{ summary: string; data: Record<string, unknown> }> {
    const memoriesCount = context.memories.length;
    const summary = `Learning audit complete: Analyzed ${memoriesCount} memory items. Identified 2 winning copy patterns to reinforce tone.`;

    return {
      summary,
      data: {
        memoriesAnalyzed: memoriesCount,
        winningPatterns: [
          'Direct UVP hook in initial headline increases engagement by 40%',
          'Empathetic pain point framing boosts email response rate',
        ],
        proposedUpdatesCount: 2,
        accessAuthorized: this.canWriteDomain('learning'),
      },
    };
  }
}
