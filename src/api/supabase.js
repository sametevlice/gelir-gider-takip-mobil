import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://iymbwbrwlhwowolnyuvq.supabase.co';
const supabaseKey = 'sb_publishable_hDLksIYCV3D2PnWwJFtHHw_lWjJDhBP';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});