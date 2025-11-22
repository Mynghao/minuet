const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const form = await req.formData(); // must contain "file"
  const res = await fetch(`${BASE}/recordings`, { method: "POST", body: form });
  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}
