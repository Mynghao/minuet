export type RecordingMeta = {
    id: string;
    status: "processing" | "complete";
    files: Record<string, string>; // vad, transcript, summary, response, input
  };
  
export async function uploadMp3(file: File): Promise<RecordingMeta> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/recordings", { method: "POST", body: fd });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
  
export async function getRecording(id: string): Promise<RecordingMeta> {
  const res = await fetch(`/api/recordings/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
  
/** Rewrite FastAPI absolute /files URLs to Next proxy /api/files URLs */
export function proxyFiles(files: Record<string, string>) {
  const re = /^https?:\/\/[^/]+\/files\//i;
  return Object.fromEntries(Object.entries(files).map(([k,u]) => [k, u.replace(re, "/api/files/")]));
}
  
/** Fetch & parse generated outputs */
export async function fetchAndParseOutputs(files: Record<string, string>) {
  const [vadRes, trRes, suRes, reRes] = await Promise.all([
    fetch(files.vad),
    fetch(files.transcript),
    fetch(files.summary),
    fetch(files.response),
  ]);
  return {
    vad: await vadRes.json(),
    transcript: await trRes.text(),
    summary: await suRes.text(),
    reply: await reRes.text(),
  };
}

/** POST to FastAPI /upload (expects field "file"); returns backend JSON */
// lib/recordings.ts
export async function uploadViaUploadEndpoint(
  file: File,
  opts?: { user_id?: string; session_id?: string }
): Promise<any> {
  const fd = new FormData();
  fd.append("file", file);                 // change to "audio" if backend expects that
  if (opts?.user_id) fd.append("user_id", opts.user_id);
  if (opts?.session_id) fd.append("session_id", opts.session_id);

  const res = await fetch("/api/upload", { method: "POST", body: fd });

  const text = await res.text();           // read the body once
  if (!res.ok) {
    console.error("upload /api/upload error:", res.status, text);
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  try { return JSON.parse(text); } catch { return { text }; }
}

// /** Fetch transcript; supports JSON or plain text responses */
// export async function fetchTranscript(audioId: string): Promise<string> {
//   const res = await fetch(`/api/audio/${audioId}/transcript`, { cache: "no-store" });
//   const ct = res.headers.get("content-type") || "";
//   const body = await res.text();
//   if (!res.ok) throw new Error(`transcript ${res.status}: ${body}`);
//   if (ct.includes("application/json")) {
//     try {
//       const j = JSON.parse(body);
//       return (j.transcript ?? j.text ?? "").toString().trim();
//     } catch {
//       return body.trim();
//     }
//   }
//   return body.trim();
// }

export function extractAudioId(obj: any): string {
  return obj?.audio_id ?? obj?.id ?? obj?.audioId ?? obj?.recording_id ?? "";
}

export async function startSummarize(audioId: string): Promise<void> {
  const r = await fetch(`/api/audio/${audioId}/summarize`, { method: "POST" });
  if (!r.ok) throw new Error(`summarize ${r.status}: ${await r.text()}`);
}

export async function pollAudioStatus(audioId: string, maxSecs = 120): Promise<any> {
  for (let i = 0; i < maxSecs; i++) {
    const r = await fetch(`/api/audio/${audioId}/status`, { cache: "no-store" });
    const text = await r.text();
    if (!r.ok) throw new Error(`status ${r.status}: ${text}`);
    let data: any = {};
    try { data = JSON.parse(text); } catch { /* might be plain text */ }

    // Debug in console so you can see what the server returns
    // eslint-disable-next-line no-console
    console.log("status", i, data || text);

    const s = (data.status ?? data.state ?? "").toString().toLowerCase();
    if (s.includes("complete") || s.includes("done") || s === "finished" || s === "ready") {
      return data;
    }

    // Fallback: if server gives a transcript flag/url, break early
    if (data.transcript || data.transcript_url) return data;

    await new Promise(res => setTimeout(res, 1000));
  }
  throw new Error("Timed out waiting for processing to complete.");
}

export async function fetchTranscript(audioId: string): Promise<string> {
  const r = await fetch(`/api/audio/${audioId}/transcript`, { cache: "no-store" });
  const ct = r.headers.get("content-type") || "";
  const body = await r.text();
  if (!r.ok) throw new Error(`transcript ${r.status}: ${body}`);
  if (ct.includes("application/json")) {
    try {
      const j = JSON.parse(body);
      return (j.transcript ?? j.text ?? "").toString().trim();
    } catch { /* fall through */ }
  }
  return body.trim();
}

/** After POST /api/upload, backend might return {audio_id} or {id} */
export function extractId(obj: any): string {
  return obj?.audio_id ?? obj?.id ?? obj?.audioId ?? "";
}

export async function uploadAudio(file: File, extra?: { user_id?: string; session_id?: string }) {
  const fd = new FormData();
  fd.append("file", file);
  if (extra?.user_id) fd.append("user_id", extra.user_id);
  if (extra?.session_id) fd.append("session_id", extra.session_id);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const text = await res.text();
  if (!res.ok) throw new Error(`upload ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return { text }; }
}

export async function startRespond(id: string) {
  const r = await fetch(`/api/audio/${id}/respond`, { method: "POST" });
  if (!r.ok) throw new Error(`respond ${r.status}: ${await r.text()}`);
}

export async function pollStatus(id: string, timeoutSec = 180) {
  for (let i = 0; i < timeoutSec; i++) {
    const r = await fetch(`/api/audio/${id}/status`, { cache: "no-store" });
    const body = await r.text();
    if (!r.ok) throw new Error(`status ${r.status}: ${body}`);
    let data: any = {};
    try { data = JSON.parse(body); } catch {}
    const s = (data.status ?? data.state ?? "").toString().toLowerCase();
    if (s.includes("complete") || s === "ready" || s === "done" || s === "finished") return data;
    await new Promise(res => setTimeout(res, 1000));
  }
  throw new Error("Timed out waiting for status");
}

async function fetchTextOrJsonField(url: string, field: string): Promise<string> {
  const r = await fetch(url, { cache: "no-store" });
  const ct = r.headers.get("content-type") || "";
  const body = await r.text();
  if (!r.ok) throw new Error(`${url} ${r.status}: ${body}`);
  if (ct.includes("application/json")) {
    try {
      const j = JSON.parse(body);
      return (j[field] ?? j.text ?? j.value ?? body).toString();
    } catch {
      return body;
    }
  }
  return body;
}

export async function fetchTranscriptById(id: string) {
  return (await fetchTextOrJsonField(`/api/audio/${id}/transcript`, "transcript")).trim();
}

export async function fetchSummaryById(id: string) {
  return (await fetchTextOrJsonField(`/api/audio/${id}/summary`, "summary")).trim();
}

export async function fetchResponseById(id: string) {
  return (await fetchTextOrJsonField(`/api/audio/${id}/response`, "response")).trim();
}

// export async function fetchVadById(id: string) {
//   const r = await fetch(`/api/audio/${id}/vad`, { cache: "no-store" });
//   if (!r.ok) throw new Error(`vad ${r.status}: ${await r.text()}`);
//   return r.json(); // usually JSON
// }


// /** Convenience: call /upload and try to extract a transcript string */
// export async function uploadAndExtractTranscript(
//   file: File,
//   opts?: { user_id?: string; session_id?: string }
// ): Promise<string> {
//   const data = await uploadViaUploadEndpoint(file, opts);
//   // adapt field names if your backend uses a different key
//   const text = (data?.text ?? data?.transcript ?? "").toString().trim();
//   return text || "(no speech detected)";
// }
// If you don't already have it:
export async function fetchVadById(id: string): Promise<{ valence?: number; arousal?: number; dominance?: number }> {
  const r = await fetch(`/api/audio/${id}/vad`, { cache: "no-store" });
  if (!r.ok) throw new Error(`vad ${r.status}: ${await r.text()}`);
  return r.json();
}

  
