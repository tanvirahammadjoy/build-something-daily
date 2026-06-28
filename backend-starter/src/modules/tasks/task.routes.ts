import { Router } from 'express';
import { taskController } from './task.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createTaskSchema, updateTaskSchema } from './task.schema';

const router = Router();

router.use(requireAuth);

router.get('/', taskController.list);
router.post('/', validate(createTaskSchema), taskController.create);
router.patch('/:id', validate(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.remove);

export default router;
