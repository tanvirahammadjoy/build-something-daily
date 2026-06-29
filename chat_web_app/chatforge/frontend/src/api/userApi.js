import api from './axios.js';

export const fetchUsers = () => api.get('/users').then((res) => res.data);
