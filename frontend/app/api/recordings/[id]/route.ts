const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";
type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const res = await fetch(`${BASE}/recordings/${params.id}`, { cache: "no-store" });
  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}
