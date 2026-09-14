// Local-only UI fixture. No production credentials, data, or external AI calls.
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { startMockDatabase } from "./mock-supabase.mjs";
const mock = await startMockDatabase();
for (let index = 0; index < 15; index++) {
  const id = randomUUID();
  const item = { id, name: "Preview item " + (index + 1), category: ["tops","bottoms","outerwear","shoes","other"][index % 5], subcategory: "", color: "Ivory", size: "", fit: "", store: "", cost: null, tags: ["Everyday"], occasions: [], details: "", issues: [], status: "published", favorite: index < 3, saved: index < 2, createdAt: new Date().toISOString() };
  mock.rows.set("item:" + id, { kind: "item", id, data: item });
}
mock.rows.set("scan:demo-preview", { kind: "scan", id: "demo-preview", data: {
  id: "demo-preview", checkedAt: new Date().toISOString(), status: "complete", isDemo: true,
  text: "Aritzia — DEMO SALE PREVIEW: Example sale-page result for a polished everyday layer. This is sample content only, not a verified current offer. [Open Aritzia sale page](https://www.aritzia.com/us/en/sale)\n\nNordstrom — DEMO NEW ARRIVAL: Example occasion-ready edit with direct browsing link. This is sample content only, not a verified current offer. [Browse Nordstrom sale](https://www.nordstrom.com/browse/sale)\n\nSephora — DEMO BEAUTY FIND: Example beauty promotion card included to show the daily scan’s retailer mix. This is sample content only, not a verified current offer. [Browse Sephora offers](https://www.sephora.com/beauty/beauty-offers)",
  sources: [
    { title: "Aritzia sale", url: "https://www.aritzia.com/us/en/sale" },
    { title: "Nordstrom sale", url: "https://www.nordstrom.com/browse/sale" },
    { title: "Sephora offers", url: "https://www.sephora.com/beauty/beauty-offers" },
  ],
} });
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "--port", "4318", "--hostname", "127.0.0.1"], { cwd: process.cwd(), env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: mock.url, SUPABASE_SERVICE_ROLE_KEY: "test-service-role", ADMIN_PASSWORD: "local-test-only-password", OPENAI_API_KEY: "", CRON_SECRET: "local-test-only-cron" }, stdio: "inherit" });
process.on("SIGINT", () => { app.kill(); void mock.close().then(() => process.exit()); });
