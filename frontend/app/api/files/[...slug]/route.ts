const BASE = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

export async function GET(req: Request, { params }: { params: { slug: string[] } }) {
  const target = `${BASE}/files/${params.slug.join("/")}`;
  const range = req.headers.get("range") || undefined;
  const res = await fetch(target, { headers: range ? { Range: range } : {} });

  const headers = new Headers();
  for (const h of ["content-type","content-length","accept-ranges","content-range","etag","last-modified","cache-control"]) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(res.body, { status: res.status, headers });
}
