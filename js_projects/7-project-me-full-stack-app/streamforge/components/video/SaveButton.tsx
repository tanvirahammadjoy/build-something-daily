"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props { videoId: string; isLoggedIn: boolean; initialSaved?: boolean; }

export function SaveButton({ videoId, isLoggedIn, initialSaved = false }: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || initialSaved) return;
    fetch(`/api/videos/${videoId}/watch-later`).then((r) => r.json()).then((d) => setSaved(d.saved)).catch(() => {});
  }, [videoId, isLoggedIn, initialSaved]);

  const toggle = async () => {
    if (!isLoggedIn) { router.push("/sign-in"); return; }
    if (loading) return;
    const prev = saved;
    setSaved(!saved);
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/watch-later`, { method: saved ? "DELETE" : "POST" });
      if (!res.ok) throw new Error();
    } catch { setSaved(prev); }
    finally { setLoading(false); }
  };

  return (
    <button onClick={toggle} disabled={loading} title={saved ? "Remove from Watch Later" : "Save to Watch Later"}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50 ${saved ? "bg-white text-gray-950" : "bg-gray-800 hover:bg-gray-700 text-white"}`}>
      <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
