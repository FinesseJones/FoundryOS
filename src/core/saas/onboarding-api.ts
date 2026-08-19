import { CustomerOnboardingService, OnboardingParams, OnboardingResult } from './onboarding-service';
import { SaaSAuthManager } from './auth';
import { SaaSBillingManager } from './billing';
import { CustomerStateManager } from './customer-state';
import { BusinessDNARepository } from '../persistence/repositories';

/**
 * Server-only API route interface for customer onboarding execution.
 * Isolates web crawler, HTML parser, LLM provider, and database drivers behind an API boundary.
 */
export async function executeCustomerOnboardingApi(input: OnboardingParams): Promise<OnboardingResult> {
  const authManager = new SaaSAuthManager();
  const billingManager = new SaaSBillingManager();
  const stateManager = new CustomerStateManager();
  const dnaRepo = new BusinessDNARepository();
  const onboardingService = new CustomerOnboardingService(authManager, billingManager, stateManager, dnaRepo);

  return onboardingService.executeCustomerOnboarding(input);
}
