"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatViews, formatDuration, formatRelativeTime } from "@/lib/format";

type VideoStatus = "PUBLIC" | "PRIVATE" | "DRAFT" | "PROCESSING";

type StudioVideo = {
  id: string; title: string; status: VideoStatus; views: number;
  thumbnailUrl: string | null; createdAt: Date; duration: number;
  _count: { likes: number; comments: number };
};

export function StudioVideoTable({ videos: initial }: { videos: StudioVideo[] }) {
  const router = useRouter();
  const [videos, setVideos] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", status: "" as VideoStatus });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (v: StudioVideo) => { setEditingId(v.id); setEditForm({ title: v.title, status: v.status }); };
  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editForm.title, status: editForm.status }) });
      if (!res.ok) throw new Error("Save failed");
      setVideos((prev) => prev.map((v) => v.id === id ? { ...v, title: editForm.title, status: editForm.status } : v));
      setEditingId(null);
    } finally { setSaving(false); }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setVideos((prev) => prev.filter((v) => v.id !== id));
      router.refresh();
    } finally { setDeletingId(null); }
  };

  const statusColors: Record<VideoStatus, string> = {
    PUBLIC: "bg-flare/10 text-flare ring-1 ring-flare/30",
    PRIVATE: "bg-ink-raised text-paper-faint ring-1 ring-ink-border",
    DRAFT: "bg-paper/10 text-paper-dim ring-1 ring-ink-border",
    PROCESSING: "bg-ink-raised text-paper-dim ring-1 ring-ink-border",
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 text-paper-faint">
        <p className="text-lg font-medium font-display text-paper-dim mb-2">No videos yet</p>
        <p className="text-sm">Upload your first video to see it here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl2 border border-ink-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ink-border text-paper-faint text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3 font-medium">Video</th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
            <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Views</th>
            <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Likes</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-border/60">
          {videos.map((video) => (
            <tr key={video.id} className="hover:bg-ink-raised/60 transition">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/video/${video.id}`} className="flex-shrink-0">
                    <div className="w-24 aspect-video rounded-lg overflow-hidden bg-ink-surface ring-1 ring-ink-border">
                      {video.thumbnailUrl
                        ? <Image src={video.thumbnailUrl} alt={video.title} width={96} height={54} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center text-paper-faint text-xs">{formatDuration(video.duration)}</div>}
                    </div>
                  </Link>
                  <div className="min-w-0">
                    {editingId === video.id
                      ? <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-2 py-1 bg-ink-surface border border-ink-borderStrong rounded text-paper text-sm focus:outline-none focus:border-flare" autoFocus />
                      : <p className="text-paper text-sm font-medium truncate max-w-xs">{video.title}</p>}
                    <p className="text-paper-faint text-xs mt-0.5">{formatRelativeTime(video.createdAt)}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {editingId === video.id
                  ? <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as VideoStatus })} className="px-2 py-1 bg-ink-surface border border-ink-borderStrong rounded text-paper text-xs focus:outline-none"><option value="PUBLIC">Public</option><option value="PRIVATE">Private</option><option value="DRAFT">Draft</option></select>
                  : <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[video.status]}`}>{video.status.charAt(0) + video.status.slice(1).toLowerCase()}</span>}
              </td>
              <td className="px-4 py-3 text-right hidden lg:table-cell"><span className="text-paper-dim text-sm tabular-nums">{formatViews(video.views)}</span></td>
              <td className="px-4 py-3 text-right hidden lg:table-cell"><span className="text-paper-dim text-sm tabular-nums">{video._count.likes.toLocaleString()}</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {editingId === video.id ? (
                    <>
                      <button onClick={() => saveEdit(video.id)} disabled={saving} className="px-3 py-1 bg-flare hover:bg-flare-dim text-ink text-xs rounded-lg transition disabled:opacity-50">{saving ? "..." : "Save"}</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-ink-raised hover:bg-ink-border text-paper-dim text-xs rounded-lg transition">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(video)} className="p-1.5 text-paper-faint hover:text-paper hover:bg-ink-raised rounded-lg transition" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button onClick={() => deleteVideo(video.id)} disabled={deletingId === video.id} className="p-1.5 text-paper-faint hover:text-flare hover:bg-ink-raised rounded-lg transition disabled:opacity-50" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
