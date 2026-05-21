import { useQuery } from '@tanstack/react-query';
import { getInsightsKpis } from '../../../api/insightsApi';

export function useInsightsKpis(days: 7 | 30 = 7) {
  return useQuery({
    queryKey: ['insights-kpis', days],
    queryFn: () => getInsightsKpis(days),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
