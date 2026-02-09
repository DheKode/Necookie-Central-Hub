import { aiService } from './services/aiService';
import { dataService } from './services/dataService';

export const api = {
  ...aiService,
  ...dataService
};