import { useRef } from 'react';
import Button from '../ui/Button';
import { useUploadAttachment, useDeleteAttachment } from '../../hooks/useTasks';

export default function AttachmentList({ task }) {
  const fileInputRef = useRef(null);
  const upload = useUploadAttachment();
  const remove = useDeleteAttachment();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload.mutate({ taskId: task._id, file });
    e.target.value = ''; // allow re-selecting the same file again later
  };

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-muted">Attachments</span>

      {task.attachments?.length > 0 && (
        <div className="space-y-1.5">
          {task.attachments.map((a) => (
            <div key={a._id} className="flex items-center gap-2 rounded-md border border-border bg-canvas px-3 py-2">
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-sm text-ink hover:text-accent"
              >
                {a.fileName}
              </a>
              <button
                onClick={() => remove.mutate({ taskId: task._id, attachmentId: a._id })}
                className="text-xs text-ink-muted hover:text-brick"
                aria-label="Remove attachment"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2">
        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
        <Button variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={upload.isPending}>
          {upload.isPending ? 'Uploading…' : '+ Add file'}
        </Button>
      </div>

      {upload.isError && (
        <p className="mt-1 text-xs text-brick">
          {upload.error?.response?.data?.message || 'Upload failed. Try again.'}
        </p>
      )}
    </div>
  );
}
