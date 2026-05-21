import { Router } from 'express';
import axios from 'axios';

const router = Router();

function buildInsightsUrl(): string {
  const appId = process.env.APP_INSIGHTS_APP_ID ?? 'd927faba-c594-492d-a5a1-5b06c1837622';
  return `https://api.applicationinsights.io/v1/apps/${appId}/query`;
}

async function runKql(query: string): Promise<unknown[][]> {
  const apiKey = process.env.APP_INSIGHTS_API_KEY;
  if (!apiKey) return [];

  const response = await axios.post<{ tables: Array<{ rows: unknown[][] }> }>(
    buildInsightsUrl(),
    { query },
    { headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' } },
  );
  return response.data.tables?.[0]?.rows ?? [];
}

function toDateStr(value: unknown): string {
  return String(value).slice(0, 10);
}

router.get('/kpis', async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days ?? 7), 1), 90);

  try {
    const [
      requestRows,
      errorRows,
      responseTimeRows,
      sessionsRows,
      exceptionsRows,
      topPagesRows,
      summaryRows,
    ] = await Promise.all([
      runKql(
        `requests | where timestamp > ago(${days}d) | summarize requestCount = count() by bin(timestamp, 1d) | order by timestamp asc`,
      ),
      runKql(
        `requests | where timestamp > ago(${days}d) and success == false | summarize errorCount = count() by bin(timestamp, 1d) | order by timestamp asc`,
      ),
      runKql(
        `requests | where timestamp > ago(${days}d) | summarize avgMs = round(avg(duration)) by bin(timestamp, 1d) | order by timestamp asc`,
      ),
      runKql(
        `pageViews | where timestamp > ago(${days}d) | summarize sessions = dcount(session_Id) by bin(timestamp, 1d) | order by timestamp asc`,
      ),
      runKql(
        `exceptions | where timestamp > ago(${days}d) | summarize exceptionCount = count() by bin(timestamp, 1d) | order by timestamp asc`,
      ),
      runKql(
        `pageViews | where timestamp > ago(${days}d) | summarize viewCount = count() by name | order by viewCount desc | take 8`,
      ),
      runKql(
        `requests | where timestamp > ago(24h) | summarize total = count(), failures = countif(success == false), avgDuration = toint(round(avg(duration)))`,
      ),
    ]);

    const summary =
      summaryRows.length > 0
        ? {
            total: Number(summaryRows[0][0]),
            failures: Number(summaryRows[0][1]),
            avgDuration: Number(summaryRows[0][2]),
          }
        : { total: 0, failures: 0, avgDuration: 0 };

    res.json({
      requestsPerDay: requestRows.map((r) => ({ date: toDateStr(r[0]), count: Number(r[1]) })),
      errorsPerDay: errorRows.map((r) => ({ date: toDateStr(r[0]), count: Number(r[1]) })),
      avgResponseTimePerDay: responseTimeRows.map((r) => ({
        date: toDateStr(r[0]),
        avgMs: Number(r[1]),
      })),
      activeSessionsPerDay: sessionsRows.map((r) => ({
        date: toDateStr(r[0]),
        sessions: Number(r[1]),
      })),
      exceptionsPerDay: exceptionsRows.map((r) => ({
        date: toDateStr(r[0]),
        count: Number(r[1]),
      })),
      topPages: topPagesRows.map((r) => ({
        name: String(r[0] ?? 'Unknown'),
        views: Number(r[1]),
      })),
      summary,
    });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'Unknown error';
    res.status(502).json({ error: 'Failed to query Application Insights', detail });
  }
});

export { router as insightsRouter };
