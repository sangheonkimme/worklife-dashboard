import { Router } from 'express';
import { dashboardChecklistController } from '../controllers/dashboardChecklistController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createDashboardChecklistItemSchema,
  updateDashboardChecklistItemSchema,
  deleteDashboardChecklistItemSchema,
} from '../validators/dashboardChecklistValidator';

const router = Router();

router.use(authenticate);

router.get('/', dashboardChecklistController.list);
router.post('/', validate(createDashboardChecklistItemSchema), dashboardChecklistController.create);
router.patch('/:id', validate(updateDashboardChecklistItemSchema), dashboardChecklistController.update);
router.delete('/:id', validate(deleteDashboardChecklistItemSchema), dashboardChecklistController.delete);

export default router;
