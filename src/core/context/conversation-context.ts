import { ConversationMessage } from './context.types';

export interface ConversationOptions {
  maxTurns?: number; // default 6
}

export class ConversationContextRetriever {
  private history: Map<string, ConversationMessage[]> = new Map();

  addMessage(conversationId: string, message: ConversationMessage): void {
    const messages = this.history.get(conversationId) ?? [];
    messages.push(message);
    this.history.set(conversationId, messages);
  }

  retrieveHistory(conversationId: string | undefined, options?: ConversationOptions): ConversationMessage[] {
    if (!conversationId) return [];
    const messages = this.history.get(conversationId) ?? [];
    const maxTurns = options?.maxTurns ?? 6;
    return messages.slice(-maxTurns);
  }

  static formatForPrompt(messages: ConversationMessage[]): string {
    if (messages.length === 0) return '';
    const lines = ['### Recent Conversation History'];
    for (const msg of messages) {
      lines.push(`**${msg.role.toUpperCase()}**: ${msg.content}`);
    }
    return lines.join('\n');
  }
}
