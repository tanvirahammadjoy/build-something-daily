import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { taskService } from './task.service';

export const taskController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const tasks = await taskService.list(req.user!.id);
    res.status(200).json({ success: true, data: tasks });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: task });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.update(req.params.id, req.user!.id, req.body);
    res.status(200).json({ success: true, data: task });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await taskService.remove(req.params.id, req.user!.id);
    res.status(200).json({ success: true, message: 'Task deleted' });
  }),
};
