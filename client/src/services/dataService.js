import { supabase } from '../supabaseClient';
import { createDataService } from '../../../shared/services/dataService.js';

export const dataService = createDataService(supabase);
