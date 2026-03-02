import { createActivityService } from './data-service/activity.js';
import { createFinanceService } from './data-service/finance.js';
import { createGetUser } from './data-service/helpers.js';
import { createHistoryService } from './data-service/history.js';
import { createJournalService } from './data-service/journal.js';
import { createMealsService } from './data-service/meals.js';
import { createTodoService } from './data-service/todo.js';

export const createDataService = (supabase) => {
    const getUser = createGetUser(supabase);

    return {
        ...createHistoryService(supabase),
        ...createMealsService(supabase, getUser),
        ...createTodoService(supabase, getUser),
        ...createActivityService(supabase, getUser),
        ...createJournalService(supabase, getUser),
        ...createFinanceService(supabase, getUser)
    };
};
