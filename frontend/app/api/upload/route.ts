// frontend/app/api/upload/route.ts
const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const form = await req.formData();

  // FastAPI expects "file"
  const res = await fetch(`${BASE}/api/upload`, {  // <-- note /api/upload
    method: "POST",
    body: form,
  });

  const headers = new Headers();
  headers.set("content-type", res.headers.get("content-type") || "application/json");
  return new Response(res.body, { status: res.status, headers });
}
