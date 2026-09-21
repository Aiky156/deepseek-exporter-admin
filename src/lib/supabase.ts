import { createClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedClient: any = null;

export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'SUPABASE_URL 或 SUPABASE_SECRET_KEY 未配置，请在环境变量中设置。'
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: 'app',
    },
  });

  return cachedClient;
}
