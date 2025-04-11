
export interface Prototype {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  tech_stack: 'react' | 'vanilla' | string;
  files: Record<string, string>;
  deployment_status?: 'pending' | 'deployed' | 'failed';
  deployment_url?: string;
  file_path?: string; // Path to uploaded file in storage
}
