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
    PUBLIC: "bg-green-500/10 text-green-400 border border-green-500/20",
    PRIVATE: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    DRAFT: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    PROCESSING: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg font-medium text-gray-400 mb-2">No videos yet</p>
        <p className="text-sm">Upload your first video to see it here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
            <th className="text-left px-4 py-3 font-medium">Video</th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Status</th>
            <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Views</th>
            <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Likes</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {videos.map((video) => (
            <tr key={video.id} className="hover:bg-gray-900/40 transition">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Link href={`/video/${video.id}`} className="flex-shrink-0">
                    <div className="w-24 aspect-video rounded-lg overflow-hidden bg-gray-800">
                      {video.thumbnailUrl
                        ? <Image src={video.thumbnailUrl} alt={video.title} width={96} height={54} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">{formatDuration(video.duration)}</div>}
                    </div>
                  </Link>
                  <div className="min-w-0">
                    {editingId === video.id
                      ? <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500" autoFocus />
                      : <p className="text-white text-sm font-medium truncate max-w-xs">{video.title}</p>}
                    <p className="text-gray-500 text-xs mt-0.5">{formatRelativeTime(video.createdAt)}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {editingId === video.id
                  ? <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as VideoStatus })} className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:outline-none"><option value="PUBLIC">Public</option><option value="PRIVATE">Private</option><option value="DRAFT">Draft</option></select>
                  : <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[video.status]}`}>{video.status.charAt(0) + video.status.slice(1).toLowerCase()}</span>}
              </td>
              <td className="px-4 py-3 text-right hidden lg:table-cell"><span className="text-gray-300 text-sm tabular-nums">{formatViews(video.views)}</span></td>
              <td className="px-4 py-3 text-right hidden lg:table-cell"><span className="text-gray-300 text-sm tabular-nums">{video._count.likes.toLocaleString()}</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {editingId === video.id ? (
                    <>
                      <button onClick={() => saveEdit(video.id)} disabled={saving} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition disabled:opacity-50">{saving ? "..." : "Save"}</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(video)} className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                      </button>
                      <button onClick={() => deleteVideo(video.id)} disabled={deletingId === video.id} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition disabled:opacity-50" title="Delete">
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
