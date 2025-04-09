import { AccountType } from './auth';

export interface OnboardingResult {
  success: boolean;
  error?: string;
}

export interface CompleteOnboardingParams {
  _user_id: string;
  _account_type: AccountType;
}
