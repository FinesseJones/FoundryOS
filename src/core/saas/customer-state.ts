export type CustomerLifecycleState =
  | 'TRIAL'
  | 'ONBOARDING'
  | 'DNA_BUILDING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'CANCELED';

export interface CustomerStateRecord {
  organizationId: string;
  businessId?: string;
  state: CustomerLifecycleState;
  onboardingStep: number;
  dnaCompletionPercent: number;
  updatedAt: string;
}

export class CustomerStateManager {
  private states: Map<string, CustomerStateRecord> = new Map();

  initializeState(organizationId: string, initialState: CustomerLifecycleState = 'ONBOARDING'): CustomerStateRecord {
    const record: CustomerStateRecord = {
      organizationId,
      state: initialState,
      onboardingStep: 1,
      dnaCompletionPercent: 0,
      updatedAt: new Date().toISOString(),
    };
    this.states.set(organizationId, record);
    return record;
  }

  getState(organizationId: string): CustomerStateRecord {
    return this.states.get(organizationId) || this.initializeState(organizationId);
  }

  updateState(
    organizationId: string,
    updates: Partial<Omit<CustomerStateRecord, 'organizationId'>>
  ): CustomerStateRecord {
    const record = this.getState(organizationId);
    const updated: CustomerStateRecord = {
      ...record,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.states.set(organizationId, updated);
    return updated;
  }
}
