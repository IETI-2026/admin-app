export interface InsightsKpis {
  requestsPerDay: { date: string; count: number }[];
  errorsPerDay: { date: string; count: number }[];
  avgResponseTimePerDay: { date: string; avgMs: number }[];
  activeSessionsPerDay: { date: string; sessions: number }[];
  exceptionsPerDay: { date: string; count: number }[];
  topPages: { name: string; views: number }[];
  summary: { total: number; failures: number; avgDuration: number };
}
