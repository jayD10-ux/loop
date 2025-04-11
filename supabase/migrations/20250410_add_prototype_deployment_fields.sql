
-- Add deployment fields to prototypes table
ALTER TABLE prototypes
ADD COLUMN IF NOT EXISTS deployment_status TEXT CHECK (deployment_status IN ('pending', 'deployed', 'failed')),
ADD COLUMN IF NOT EXISTS deployment_url TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Create storage buckets for prototype uploads and deployments
INSERT INTO storage.buckets (id, name, public)
VALUES ('prototype-uploads', 'prototype-uploads', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('prototype-deployments', 'prototype-deployments', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for prototype uploads
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Authenticated users can upload prototypes',
  '(bucket_id = ''prototype-uploads'' AND auth.role() = ''authenticated'')',
  'prototype-uploads'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Authenticated users can read their uploads',
  '(bucket_id = ''prototype-uploads'' AND auth.role() = ''authenticated'' AND (storage.foldername(name))[1] = auth.uid())',
  'prototype-uploads'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Set up storage policies for prototype deployments
-- Public access for reading deployed prototypes
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Public can view deployed prototypes',
  '(bucket_id = ''prototype-deployments'')',
  'prototype-deployments'
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Only service role can write to deployments
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Only service role can write to deployments',
  '(bucket_id = ''prototype-deployments'' AND auth.role() = ''service_role'')',
  'prototype-deployments'
)
ON CONFLICT (name, bucket_id) DO NOTHING;
