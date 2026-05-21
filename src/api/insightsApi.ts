import type { InsightsKpis } from '../types/insights';
import { localClient } from './localClient';

export const getInsightsKpis = async (days: number = 7): Promise<InsightsKpis> => {
  const response = await localClient.get<InsightsKpis>('/admin-api/insights/kpis', {
    params: { days },
  });
  return response.data;
};
