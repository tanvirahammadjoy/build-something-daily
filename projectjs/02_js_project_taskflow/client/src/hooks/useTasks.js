import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

function errorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function useTasks(filters, options = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const { data } = await api.get('/tasks', { params: filters });
      return data;
    },
    enabled: options.enabled ?? true,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/stats');
      return data.stats;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/tasks/categories');
      return data.categories;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/tasks', payload);
      return data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      showToast('Task created', 'success');
    },
    onError: (error) => showToast(errorMessage(error, "Couldn't create the task"), 'error'),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/tasks/${id}`, payload);
      return data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error) => showToast(errorMessage(error, "Couldn't save your changes"), 'error'),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/tasks/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      showToast('Task deleted', 'success');
    },
    onError: (error) => showToast(errorMessage(error, "Couldn't delete the task"), 'error'),
  });
}

export function useToggleComplete() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/tasks/${id}/complete`);
      return data.task;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (error) => showToast(errorMessage(error, "Couldn't update the task"), 'error'),
  });
}

export function useAddSubtask() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ taskId, title }) => {
      const { data } = await api.post(`/tasks/${taskId}/subtasks`, { title });
      return data.task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (error) => showToast(errorMessage(error, "Couldn't add the subtask"), 'error'),
  });
}

export function useUpdateSubtask() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ taskId, subtaskId, ...payload }) => {
      const { data } = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, payload);
      return data.task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (error) => showToast(errorMessage(error, "Couldn't update the subtask"), 'error'),
  });
}

export function useDeleteSubtask() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ taskId, subtaskId }) => {
      const { data } = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
      return data.task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (error) => showToast(errorMessage(error, "Couldn't remove the subtask"), 'error'),
  });
}

export function useUpdateRecurrence() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ taskId, ...recurrence }) => {
      const { data } = await api.patch(`/tasks/${taskId}/recurrence`, recurrence);
      return data.task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (error) => showToast(errorMessage(error, "Couldn't update repeat settings"), 'error'),
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ taskId, file }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // uploads legitimately take longer than the 15s global default
      });
      return data.task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (error) => showToast(errorMessage(error, "Couldn't upload the file"), 'error'),
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async ({ taskId, attachmentId }) => {
      const { data } = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
      return data.task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
    onError: (error) => showToast(errorMessage(error, "Couldn't remove the attachment"), 'error'),
  });
}
