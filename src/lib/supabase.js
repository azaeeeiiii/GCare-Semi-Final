import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wozyrvysthwwlgxcscha.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AJBYjEbYIUfBYg1BO3QHbg_jkxdXD8j';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
