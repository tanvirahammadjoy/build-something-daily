import api from './axios.js';

export const fetchConversations = () => api.get('/conversations').then((res) => res.data);

export const createConversation = (payload) =>
  api.post('/conversations', payload).then((res) => res.data);
