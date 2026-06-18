
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/format";

type CommentUser = { id: string; name: string | null; image: string | null; channelHandle: string | null; };
type Comment = { id: string; body: string; createdAt: string; user: CommentUser; replies: Comment[]; _count: { replies: number }; };

function Avatar({ user, size = 36 }: { user: CommentUser; size?: number }) {
  return user.image ? (
    <Image src={user.image} alt={user.name ?? "User"} width={size} height={size} className="rounded-full object-cover flex-shrink-0" />
  ) : (
    <div className="rounded-full bg-ink-raised flex items-center justify-center text-paper font-medium flex-shrink-0" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {user.name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function CommentThread({ comment, videoId, depth = 0, isLoggedIn, currentUserId }: { comment: Comment; videoId: string; depth?: number; isLoggedIn: boolean; currentUserId: string | null; }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<Comment[]>(comment.replies ?? []);
  const [replyCursor, setReplyCursor] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(depth < 2);
  const router = useRouter();

  const totalReplies = comment._count.replies;
  const hasMoreReplies = replyCursor !== null || replies.length < totalReplies;

  const loadMoreReplies = async () => {
    setLoadingReplies(true);
    try {
      const params = new URLSearchParams({ limit: "10" });
      if (replyCursor) params.set("cursor", replyCursor);
      const res = await fetch(`/api/videos/${videoId}/comments/${comment.id}/replies?${params}`);
      const data = await res.json();
      setReplies((prev) => { const ids = new Set(prev.map((r) => r.id)); return [...prev, ...data.replies.filter((r: Comment) => !ids.has(r.id))]; });
      setReplyCursor(data.nextCursor);
    } finally { setLoadingReplies(false); }
  };

  const submitReply = async () => {
    if (!replyText.trim() || submitting) return;
    if (!isLoggedIn) { router.push("/sign-in"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: replyText.trim(), parentId: comment.id }) });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReplies((prev) => [data.comment, ...prev]);
      setReplyText(""); setShowReplyBox(false); setExpanded(true);
    } finally { setSubmitting(false); }
  };

  return (
    <div className={`flex gap-3 ${depth > 0 ? "mt-3" : ""}`}>
      <Avatar user={comment.user} size={depth === 0 ? 36 : 28} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-paper text-sm font-medium">{comment.user.name ?? comment.user.channelHandle}</span>
          <span className="text-paper-faint text-xs">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-paper-dim text-sm mt-1 whitespace-pre-wrap break-words">{comment.body}</p>
        <div className="flex items-center gap-4 mt-2">
          {depth < 3 && <button onClick={() => setShowReplyBox((x) => !x)} className="text-paper-faint text-xs hover:text-paper-dim transition">Reply</button>}
          {totalReplies > 0 && <button onClick={() => setExpanded((x) => !x)} className="text-flare text-xs hover:text-flare-dim transition">{expanded ? "Hide" : `Show ${totalReplies} repl${totalReplies === 1 ? "y" : "ies"}`}</button>}
        </div>
        {showReplyBox && (
          <div className="mt-3 flex gap-2">
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." rows={2} className="flex-1 px-3 py-2 bg-ink-surface border border-ink-border rounded-lg text-paper text-sm placeholder-paper-faint focus:outline-none focus:border-flare transition resize-none" />
            <div className="flex flex-col gap-2">
              <button onClick={submitReply} disabled={!replyText.trim() || submitting} className="px-3 py-1.5 bg-flare hover:bg-flare-dim text-ink text-xs rounded-lg disabled:opacity-40 transition">{submitting ? "..." : "Reply"}</button>
              <button onClick={() => { setShowReplyBox(false); setReplyText(""); }} className="px-3 py-1.5 bg-ink-raised hover:bg-ink-border text-paper-dim text-xs rounded-lg transition">Cancel</button>
            </div>
          </div>
        )}
        {expanded && replies.length > 0 && (
          <div className="mt-3 border-l-2 border-ink-border pl-4 space-y-0">
            {replies.map((reply) => <CommentThread key={reply.id} comment={reply} videoId={videoId} depth={depth + 1} isLoggedIn={isLoggedIn} currentUserId={currentUserId} />)}
            {hasMoreReplies && <button onClick={loadMoreReplies} disabled={loadingReplies} className="mt-2 text-flare text-xs hover:text-flare-dim transition disabled:opacity-50">{loadingReplies ? "Loading..." : "Load more replies"}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

interface Props { videoId: string; initialCommentCount: number; isLoggedIn: boolean; currentUserId: string | null; currentUserImage?: string | null; }

export function CommentSection({ videoId, initialCommentCount, isLoggedIn, currentUserId, currentUserImage }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCommentCount);

  const fetchComments = useCallback(async (currentCursor?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "10" });
      if (currentCursor) params.set("cursor", currentCursor);
      const res = await fetch(`/api/videos/${videoId}/comments?${params}`);
      const data = await res.json();
      setComments((prev) => currentCursor ? [...prev, ...data.comments] : data.comments);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } finally { setLoading(false); }
  }, [videoId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const submitComment = async () => {
    if (!newComment.trim() || submitting) return;
    if (!isLoggedIn) { router.push("/sign-in"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: newComment.trim() }) });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setComments((prev) => [data.comment, ...prev]);
      setNewComment(""); setTotalCount((n) => n + 1);
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-8">
      <h2 className="font-display text-paper font-semibold mb-6">{totalCount.toLocaleString()} comment{totalCount !== 1 ? "s" : ""}</h2>
      <div className="flex gap-3 mb-8">
        <div className="w-9 h-9 rounded-full bg-ink-raised overflow-hidden flex-shrink-0">
          {currentUserImage ? <Image src={currentUserImage} alt="Your avatar" width={36} height={36} className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-sm">?</div>}
        </div>
        <div className="flex-1">
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} onClick={() => { if (!isLoggedIn) router.push("/sign-in"); }} placeholder="Add a comment..." rows={1} className="w-full px-4 py-2.5 bg-transparent border-b border-ink-border text-paper text-sm placeholder-paper-faint focus:outline-none focus:border-flare transition resize-none" />
          {newComment && (
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setNewComment("")} className="px-4 py-1.5 rounded-full text-paper-faint text-sm hover:bg-ink-raised transition">Cancel</button>
              <button onClick={submitComment} disabled={!newComment.trim() || submitting} className="px-4 py-1.5 rounded-full bg-flare hover:bg-flare-dim text-ink text-sm disabled:opacity-40 transition">{submitting ? "Posting..." : "Comment"}</button>
            </div>
          )}
        </div>
      </div>
      {loading && comments.length === 0 ? (
        <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="flex gap-3 animate-pulse"><div className="w-9 h-9 rounded-full bg-ink-surface flex-shrink-0" /><div className="flex-1 space-y-2 pt-1"><div className="h-3 bg-ink-surface rounded w-1/4" /><div className="h-3 bg-ink-surface rounded w-3/4" /></div></div>))}</div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => <CommentThread key={comment.id} comment={comment} videoId={videoId} depth={0} isLoggedIn={isLoggedIn} currentUserId={currentUserId} />)}
          {hasMore && <button onClick={() => fetchComments(cursor ?? undefined)} disabled={loading} className="text-flare text-sm hover:text-flare-dim transition disabled:opacity-50">{loading ? "Loading..." : "Load more comments"}</button>}
        </div>
      )}
    </div>
  );
}
