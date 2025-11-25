import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createSubscriptionSchema,
  getSubscriptionsSchema,
  updateSubscriptionSchema,
  cancelSubscriptionSchema,
} from '../validators/subscriptionValidator';
import { subscriptionController } from '../controllers/subscriptionController';

const router = Router();

router.use(authenticate);

router.get('/summary', subscriptionController.summary);
router.get('/', validate(getSubscriptionsSchema), subscriptionController.list);
router.post('/', validate(createSubscriptionSchema), subscriptionController.create);
router.patch('/:id', validate(updateSubscriptionSchema), subscriptionController.update);
router.post('/:id/cancel', validate(cancelSubscriptionSchema), subscriptionController.cancel);

export default router;
