import { Task } from './task.model';
import { CreateTaskInput, UpdateTaskInput } from './task.schema';

export const taskRepository = {
  findAllByOwner: (owner: string) => Task.find({ owner }).sort({ createdAt: -1 }),
  findByIdAndOwner: (id: string, owner: string) => Task.findOne({ _id: id, owner }),
  create: (owner: string, data: CreateTaskInput) => Task.create({ ...data, owner }),
  updateByIdAndOwner: (id: string, owner: string, data: UpdateTaskInput) =>
    Task.findOneAndUpdate({ _id: id, owner }, data, { new: true }),
  deleteByIdAndOwner: (id: string, owner: string) => Task.findOneAndDelete({ _id: id, owner }),
};
