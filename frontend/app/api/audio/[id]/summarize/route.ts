const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${BASE}/api/audio/${params.id}/summarize`, { method: "POST" });
  const headers = new Headers();
  headers.set("content-type", res.headers.get("content-type") || "application/json");
  return new Response(res.body, { status: res.status, headers });
}
