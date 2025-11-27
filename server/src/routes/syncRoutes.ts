import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { getSyncSchema, getSyncMetaSchema } from '../validators/syncValidator';
import { syncController } from '../controllers/syncController';

const router = Router();

router.use(authenticate);

router.get('/', validate(getSyncSchema), syncController.getChanges);
router.get('/meta', validate(getSyncMetaSchema), syncController.getMeta);

export default router;
