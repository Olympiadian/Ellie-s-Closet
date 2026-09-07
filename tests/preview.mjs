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
const app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "--port", "4318", "--hostname", "127.0.0.1"], { cwd: process.cwd(), env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: mock.url, SUPABASE_SERVICE_ROLE_KEY: "test-service-role", ADMIN_PASSWORD: "local-test-only-password", OPENAI_API_KEY: "", CRON_SECRET: "local-test-only-cron" }, stdio: "inherit" });
process.on("SIGINT", () => { app.kill(); void mock.close().then(() => process.exit()); });
