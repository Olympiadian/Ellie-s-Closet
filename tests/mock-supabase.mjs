// Test-only in-memory Supabase transport. Never imported by application code.
import { createServer } from "node:http";
export async function startMockDatabase() {
  const rows = new Map(), files = new Map(), limits = new Map();
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bytes = Buffer.concat(chunks);
    let body = {};
    try { body = JSON.parse(bytes.toString() || "{}"); } catch {}
    const send = (value, status = 200) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(value)); };
    if (url.pathname === "/rest/v1/closet_records") {
      if (req.method === "POST") {
        const row = body;
        const key = row.kind + ":" + row.id;
        if (rows.has(key) && !req.headers.prefer?.includes("resolution=merge-duplicates")) return send({ code: "23505" }, 409);
        rows.set(key, row); return send(null, 201);
      }
      const kind = url.searchParams.get("kind")?.slice(3), id = url.searchParams.get("id")?.slice(3);
      const matches = [...rows.values()].filter(r => (!kind || r.kind === kind) && (!id || r.id === id));
      if (req.method === "DELETE") { matches.forEach(r => rows.delete(r.kind + ":" + r.id)); return send(null); }
      const from = Number(url.searchParams.get("offset") || 0), count = Number(url.searchParams.get("limit") || 1000);
      return send(matches.sort((a,b) => a.id.localeCompare(b.id)).slice(from, from + count).map(row => ({ data: row.data })));
    }
    if (url.pathname === "/rest/v1/rpc/closet_patch") {
      const row = rows.get(body.record_kind + ":" + body.record_id);
      if (row) row.data = { ...row.data, ...body.patch };
      return send(row?.data ?? null);
    }
    if (url.pathname === "/rest/v1/rpc/closet_consume_invite") {
      const key = "invite:" + body.invite_id, row = rows.get(key);
      if (!row || +new Date(row.data.expiresAt) < Date.now()) return send(null);
      rows.delete(key); return send(row.data);
    }
    if (url.pathname === "/rest/v1/rpc/closet_rate_limit") {
      const n = (limits.get(body.bucket) ?? 0) + 1; limits.set(body.bucket, n); return send(n <= body.max_attempts);
    }
    if (url.pathname.startsWith("/storage/v1/object/upload/sign/")) {
      const path = decodeURIComponent(url.pathname.replace("/storage/v1/object/upload/sign/closet-private/", ""));
      if (req.method === "POST") return send({ url: "/object/upload/sign/closet-private/" + path + "?token=test-only" });
      files.set(path, { size: bytes.length }); return send({ Key: path });
    }
    if (url.pathname === "/storage/v1/object/list/closet-private") {
      return send([...files].filter(([p]) => p.startsWith(body.prefix + "/") && p.includes(body.search ?? "")).map(([p, metadata]) => ({ name: p.split("/").at(-1), metadata })));
    }
    if (url.pathname === "/storage/v1/object/sign/closet-private") return send(body.paths.map(path => ({ path, signedURL: "/object/sign/closet-private/" + path + "?token=test-only" })));
    if (url.pathname.startsWith("/storage/v1/object/sign/")) {
      res.writeHead(200, { "Content-Type": "image/png" });
      return res.end(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==", "base64"));
    }
    send({ error: "Mock route not implemented: " + req.method + " " + url.pathname }, 404);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return { url: "http://127.0.0.1:" + server.address().port, rows, files, close: () => new Promise(resolve => server.close(resolve)) };
}
