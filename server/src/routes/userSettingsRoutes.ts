import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { userSettingsController } from '../controllers/userSettingsController';
import { updateUserSettingsSchema } from '../validators/userSettingsValidator';

const router = Router();

router.get('/', authenticate, userSettingsController.getSettings);
router.put(
  '/',
  authenticate,
  validate(updateUserSettingsSchema),
  userSettingsController.updateSettings
);

export default router;
