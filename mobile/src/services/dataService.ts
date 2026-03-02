import { supabase } from '../lib/supabase';
import { createDataService } from '../../../shared/services/dataService';

export const dataService = createDataService(supabase);
