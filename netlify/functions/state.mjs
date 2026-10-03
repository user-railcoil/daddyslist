import { getStore } from "@netlify/blobs";

export default async (req) => {
  const token = process.env.SYNC_TOKEN;
  if (token && req.headers.get("x-sync-token") !== token) {
    return new Response("unauthorized", { status: 401 });
  }
  const store = getStore("daddys-list");
  const noCache = { "cache-control": "no-store" };

  if (req.method === "GET") {
    const rec = await store.get("state", { type: "json" });
    return Response.json(rec || { data: null, version: 0 }, { headers: noCache });
  }
  if (req.method === "PUT") {
    const body = await req.json();
    if (!body || typeof body.data !== "object") return new Response("bad request", { status: 400 });
    const rec = { data: body.data, version: Date.now() };
    await store.setJSON("state", rec);
    return Response.json({ version: rec.version }, { headers: noCache });
  }
  return new Response("method not allowed", { status: 405 });
};

export const config = { path: "/api/state" };
