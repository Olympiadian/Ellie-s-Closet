import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { startMockDatabase } from "./mock-supabase.mjs";
const origin = "http://localhost:4317";
let mock, app, logs = "", adminCookie = "", viewerCookie = "";
const itemId = randomUUID(), buildId = randomUUID();
const fields = { name: "Test ivory top", category: "tops", subcategory: "T-shirt", color: "Ivory", size: "S", fit: "Relaxed", store: "Test store", cost: 32, tags: ["Everyday"], occasions: ["Work"], details: "Test fixture", issues: [] };
async function call(path, body, cookie = "", expected = 200, customOrigin = origin) {
  const response = await fetch(origin + path, { method: body ? "POST" : "GET", headers: { ...(body ? { "Content-Type": "application/json", Origin: customOrigin } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  assert.equal(response.status, expected, JSON.stringify(result));
  return { result, cookie: response.headers.get("set-cookie")?.split(";")[0] };
}
before(async () => {
  mock = await startMockDatabase();
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "4317", "--hostname", "127.0.0.1"], { cwd: process.cwd(), env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: mock.url, SUPABASE_SERVICE_ROLE_KEY: "test-service-role", ADMIN_PASSWORD: "local-test-only-password", CRON_SECRET: "local-test-only-cron", OPENAI_API_KEY: "" }, stdio: ["ignore", "pipe", "pipe"] });
  app.stdout.on("data", b => logs += b); app.stderr.on("data", b => logs += b);
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(origin + "/api/session")).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(logs);
}, { timeout: 20000 });
after(async () => { app?.kill(); if (mock) await mock.close(); });
test("viewer APIs are open while admin and cross-origin requests stay protected", async () => {
  await call("/api/closet", undefined, "", 200);
  await call("/api/closet", { action: "mark", id: itemId, field: "favorite", value: true }, "", 403, "https://untrusted.example");
  await call("/api/deals", undefined, "", 401);
  await call("/api/session", { action: "login", password: "wrong" }, "", 401);
});
test("admin login and single-use device pairing", async () => {
  const login = await call("/api/session", { action: "login", password: "local-test-only-password" });
  adminCookie = login.cookie;
  assert.ok(adminCookie);
  const invite = await call("/api/session", { action: "invite" }, adminCookie);
  const token = new URLSearchParams(new URL(invite.result.url).hash.slice(1)).get("token");
  const pair = await call("/api/session", { action: "pair", token });
  viewerCookie = pair.cookie;
  await call("/api/session", { action: "pair", token }, "", 401);
  await call("/api/closet?admin=1", undefined, viewerCookie, 403);
});
test("front/back upload stays private until admin publishes", async () => {
  for (const side of ["front", "back"]) {
    const upload = await call("/api/uploads", { action: "prepare", itemId, side, processed: false, contentType: "image/png", size: 64 }, viewerCookie);
    const uploaded = await fetch(upload.result.signedUrl, { method: "PUT", body: Buffer.alloc(64) });
    assert.equal(uploaded.status, 200);
    await call("/api/uploads", { action: "complete", itemId, side, processed: false, path: upload.result.path }, viewerCookie);
  }
  assert.equal((await call("/api/closet", undefined, viewerCookie)).result.items.length, 0);
  const review = (await call("/api/closet?admin=1", undefined, adminCookie)).result;
  assert.equal(review.items[0].status, "pending");
  await call("/api/closet", { action: "publish", id: itemId, published: true }, viewerCookie, 403);
  await call("/api/closet", { action: "editItem", id: itemId, fields }, adminCookie);
  await call("/api/closet", { action: "publish", id: itemId, published: true }, adminCookie);
  const published = (await call("/api/closet", undefined, viewerCookie)).result.items[0];
  assert.equal(published.name, fields.name);
  assert.ok(published.frontUrl && published.backUrl);
  assert.equal(published.originalFrontUrl, undefined);
});
test("favorites, saved items, builds, and calendar persist across sessions", async () => {
  await call("/api/closet", { action: "mark", id: itemId, field: "favorite", value: true }, viewerCookie);
  await call("/api/closet", { action: "mark", id: itemId, field: "saved", value: true }, viewerCookie);
  await call("/api/closet", { action: "saveBuild", id: buildId, name: "Test outfit", occasion: "Concert", kind: "outfit", itemIds: [itemId] }, viewerCookie);
  await call("/api/closet", { action: "plan", date: "2026-09-10", itemIds: [itemId], buildIds: [buildId], note: "Test planning" }, viewerCookie);
  await call("/api/closet", { action: "plan", date: "2026-02-31", itemIds: [], buildIds: [], note: "" }, viewerCookie, 400);
  const data = (await call("/api/closet", undefined, adminCookie)).result;
  assert.equal(data.items[0].favorite, true); assert.equal(data.items[0].saved, true);
  assert.equal(data.builds[0].name, "Test outfit"); assert.equal(data.plans[0].buildIds[0], buildId);
});
test("support inbox, future message privacy, item editing and settings", async () => {
  await call("/api/closet", { action: "request", subject: "Test help", body: "Test request", kind: "help" }, viewerCookie);
  await call("/api/closet", { action: "message", id: randomUUID(), title: "Today", body: "Visible", date: "2020-01-01" }, adminCookie);
  await call("/api/closet", { action: "message", id: randomUUID(), title: "Future", body: "Not visible", date: "2099-01-01" }, adminCookie);
  await call("/api/closet", { action: "editItem", id: itemId, fields: { ...fields, size: "M" } }, viewerCookie);
  await call("/api/closet", { action: "settings", reduceMotion: true }, viewerCookie);
  await call("/api/closet", { action: "settings", stores: "Tamper" }, viewerCookie, 403);
  const viewer = (await call("/api/closet", undefined, viewerCookie)).result;
  const admin = (await call("/api/closet?admin=1", undefined, adminCookie)).result;
  assert.equal(viewer.messages.length, 1); assert.equal(admin.messages.length, 2);
  assert.equal(viewer.requests.length, 0); assert.equal(admin.requests.length, 1);
  assert.equal(viewer.items[0].size, "M"); assert.equal(viewer.settings.reduceMotion, true);
  await call("/api/closet", { action: "resolveRequest", id: admin.requests[0].id, resolved: true }, adminCookie);
});
test("all pages respond, legacy routes redirect, logout revokes access", async () => {
  for (const route of ["/", "/closet", "/build", "/saved", "/calendar", "/favorites", "/recent", "/stats", "/deals", "/help", "/settings", "/admin", "/mobile/new-clothes", "/mobile/request", "/mobile/database"]) assert.equal((await fetch(origin + route)).status, 200, route);
  assert.equal((await fetch(origin + "/log")).status, 404);
  assert.equal((await fetch(origin + "/hub", { redirect: "manual" })).status, 307);
  await call("/api/session", { action: "logout" }, viewerCookie);
  await call("/api/closet", undefined, viewerCookie, 200);
});
