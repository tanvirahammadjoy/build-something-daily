import api from './axios.js';

export const fetchMessages = (conversationId, page = 1, limit = 30) =>
  api.get(`/messages/${conversationId}`, { params: { page, limit } }).then((res) => res.data);

// REST fallback for sending - the live app sends via Socket.io instead (Phase 4 backend)
export const sendMessageRest = (payload) => api.post('/messages', payload).then((res) => res.data);
