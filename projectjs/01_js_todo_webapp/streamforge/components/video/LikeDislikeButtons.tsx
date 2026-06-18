"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Reaction = true | false | null;

interface Props { videoId: string; initialLikes: number; initialDislikes: number; isLoggedIn: boolean; }

export function LikeDislikeButtons({ videoId, initialLikes, initialDislikes, isLoggedIn }: Props) {
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [reaction, setReaction] = useState<Reaction>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/videos/${videoId}/like`).then((r) => r.json()).then((data) => {
      setLikes(data.likes); setDislikes(data.dislikes); setReaction(data.userReaction);
    }).catch(() => {});
  }, [videoId, isLoggedIn]);

  const handleReact = async (isLike: boolean) => {
    if (!isLoggedIn) { router.push("/sign-in"); return; }
    if (loading) return;
    const prev = { likes, dislikes, reaction };
    const isSame = reaction === isLike;
    setReaction(isSame ? null : isLike);
    if (isLike) { setLikes((n) => n + (isSame ? -1 : 1)); if (reaction === false) setDislikes((n) => n - 1); }
    else { setDislikes((n) => n + (isSame ? -1 : 1)); if (reaction === true) setLikes((n) => n - 1); }
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isLike }) });
      if (!res.ok) throw new Error("Failed");
    } catch { setLikes(prev.likes); setDislikes(prev.dislikes); setReaction(prev.reaction); }
    finally { setLoading(false); }
  };

  const btnBase = "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition disabled:opacity-50";
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => handleReact(true)} disabled={loading} className={reaction === true ? `${btnBase} bg-flare text-ink` : `${btnBase} bg-ink-surface hover:bg-ink-raised text-paper ring-1 ring-ink-border`}>
        <svg className="w-4 h-4" fill={reaction === true ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>
        {likes.toLocaleString()}
      </button>
      <button onClick={() => handleReact(false)} disabled={loading} className={reaction === false ? `${btnBase} bg-flare text-ink` : `${btnBase} bg-ink-surface hover:bg-ink-raised text-paper ring-1 ring-ink-border`}>
        <svg className="w-4 h-4 rotate-180" fill={reaction === false ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" /></svg>
        {dislikes.toLocaleString()}
      </button>
    </div>
  );
}
