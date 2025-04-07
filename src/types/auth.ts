
export type AccountType = 'individual' | 'team';

export interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  account_type: AccountType | null;
  has_completed_onboarding: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}
