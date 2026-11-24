import { createClient } from '@supabase/supabase-js';
import { isPreviewMode } from './preview';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = !isPreviewMode && url && key ? createClient(url, key) : null;
