import { useEffect, useState } from 'react';
import { fetchUsers } from '../../api/userApi.js';
import { createConversation } from '../../api/conversationApi.js';
import Avatar from '../common/Avatar.jsx';

export default function NewChatModal({ onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const isGroup = selected.length > 1;

  const handleCreate = async () => {
    if (selected.length === 0) return;
    if (isGroup && !groupName.trim()) {
      setError('Give your group a name');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const data = await createConversation({
        type: isGroup ? 'group' : 'direct',
        participantIds: selected,
        groupName: isGroup ? groupName.trim() : undefined,
      });
      onCreated(data.conversation);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start chat');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Start a new chat</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading && <p className="sidebar-empty">Loading people…</p>}

        <div className="user-pick-list">
          {users.map((u) => (
            <label key={u._id} className={`user-pick-row ${selected.includes(u._id) ? 'picked' : ''}`}>
              <input type="checkbox" checked={selected.includes(u._id)} onChange={() => toggleUser(u._id)} />
              <Avatar username={u.username} size={32} />
              <span>{u.username}</span>
            </label>
          ))}
          {!loading && users.length === 0 && <p className="sidebar-empty">No other users yet.</p>}
        </div>

        {isGroup && (
          <label className="field">
            <span>Group name</span>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Project Falcon"
            />
          </label>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" onClick={handleCreate} disabled={submitting || selected.length === 0}>
          {submitting ? 'Starting…' : isGroup ? 'Create group' : 'Start chat'}
        </button>
      </div>
    </div>
  );
}
