const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${BASE}/api/audio/${params.id}/vad`, {
    cache: "no-store",
  });

  // mirror headers and status
  const headers = new Headers();
  headers.set("content-type", res.headers.get("content-type") || "application/json");

  return new Response(res.body, { status: res.status, headers });
}
