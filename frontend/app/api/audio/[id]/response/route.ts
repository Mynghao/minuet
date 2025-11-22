const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${BASE}/api/audio/${params.id}/response`, { cache: "no-store" });
  const headers = new Headers();
  headers.set("content-type", res.headers.get("content-type") || "text/plain");
  return new Response(res.body, { status: res.status, headers });
}
