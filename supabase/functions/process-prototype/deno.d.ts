// deno.d.ts
declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.7.1' {
  import { SupabaseClient } from '@supabase/supabase-js';
  export function createClient(url: string, key: string): SupabaseClient;
}

declare module 'https://deno.land/x/zip@v1.2.5/mod.ts' {
  export function extract(zipPath: string, destinationPath: string): Promise<void>;
}

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function makeTempDir(): Promise<string>;
  export function writeFile(path: string, data: Uint8Array): Promise<void>;
  export function readFile(path: string): Promise<Uint8Array>;
  export function remove(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function readDir(path: string): AsyncIterable<{
    name: string;
    isFile: boolean;
    isDirectory: boolean;
  }>;
}
