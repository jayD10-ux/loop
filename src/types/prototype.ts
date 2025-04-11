
export interface Prototype {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  tech_stack: 'react' | 'vanilla' | 'zip-package' | 'external-url' | string;
  files: Record<string, string>;
  deployment_status?: 'pending' | 'deployed' | 'failed';
  deployment_url?: string;
  preview_url?: string;
  file_path?: string; // Path to uploaded file in storage
  figma_link?: string | null;
  figma_file_key?: string | null;
  figma_file_name?: string | null;
  figma_preview_url?: string | null;
}
