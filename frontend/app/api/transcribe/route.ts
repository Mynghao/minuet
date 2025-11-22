const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  const form = await req.formData();

  // Ensure the field name matches your backend ("audio").
  // If callers send "file", rewrite it to "audio".
  if (!form.has("audio") && form.has("file")) {
    const f = form.get("file") as File;
    form.delete("file");
    form.append("audio", f);
  }

  const res = await fetch(`${BASE}/transcribe`, { method: "POST", body: form });
  return new Response(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}
