import { AutomationEvent, TriggerRule } from './automation.types';

export class TriggerEngine {
  private rules: Map<string, TriggerRule> = new Map();

  /**
   * Register a new trigger rule.
   */
  registerRule(rule: TriggerRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * List all registered trigger rules.
   */
  listRules(): TriggerRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Evaluate an incoming event against registered trigger rules and return matching rules.
   */
  evaluateEvent(event: AutomationEvent): TriggerRule[] {
    const matchedRules: TriggerRule[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.active) continue;

      // 1. Topic match
      if (rule.triggerType === 'event' && rule.topic === event.topic) {
        // 2. Custom filter condition check
        if (!rule.filterCondition || rule.filterCondition(event)) {
          matchedRules.push(rule);
        }
      }
    }

    return matchedRules;
  }
}
