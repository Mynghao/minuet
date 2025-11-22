"use client";
import { useEffect, useRef, useState } from "react";
import { getRecording, type RecordingMeta } from "@/lib/recordings";

export function usePollRecording(id: string) {
  const [meta, setMeta] = useState<RecordingMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const m = await getRecording(id);
        if (cancelled) return;
        setMeta(m);
        if (m.status !== "complete") timer.current = setTimeout(poll, 1000);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to fetch recording");
      }
    }
    poll();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id]);

  return { meta, error };
}
