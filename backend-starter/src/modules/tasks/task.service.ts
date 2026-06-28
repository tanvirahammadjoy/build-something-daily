import { AppError } from '../../utils/AppError';
import { taskRepository } from './task.repository';
import { CreateTaskInput, UpdateTaskInput } from './task.schema';

export const taskService = {
    async list(owner: string) {
        return taskRepository.findAllByOwner(owner);
    },

    async create(owner: string, input: CreateTaskInput) {
        return taskRepository.create(owner, input);
    },

    async update(id: string, owner: string, input: UpdateTaskInput) {
        const task = await taskRepository.updateByIdAndOwner(id, owner, input);
        if (!task) throw new AppError('Task not found', 404);
        return task;
    },

    async remove(id: string, owner: string) {
        const task = await taskRepository.deleteByIdAndOwner(id, owner);
        if (!task) throw new AppError('Task not found', 404);
        return task;
    },
};
