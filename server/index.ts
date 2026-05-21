import 'dotenv/config';
import cors from "cors";
import express from "express";
import path from "node:path";
import { documentVerificationRouter } from "./routes/documentVerification";
import { insightsRouter } from "./routes/insights";
import { skillSuggestionsRouter } from "./routes/skillSuggestions";

const app = express();
app.disable("x-powered-by");

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "20mb" }));

app.use("/admin-api/skill-suggestions", skillSuggestionsRouter);
app.use("/admin-api/document-verification", documentVerificationRouter);
app.use("/admin-api/insights", insightsRouter);

// Static file serving only when running as a standalone Node.js server (not Vercel).
// On Vercel, static files are served by the CDN from dist/ and this block is skipped.
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));
  app.get("/(.*)", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Only start the HTTP server when running locally (not in a Vercel serverless context).
if (!process.env.VERCEL) {
  const PORT = Number(process.env.ADMIN_SERVER_PORT ?? 4000);
  app.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
  });
}

export default app;
