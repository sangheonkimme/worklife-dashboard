import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { getSyncSchema } from '../validators/syncValidator';
import { syncController } from '../controllers/syncController';

const router = Router();

router.use(authenticate);

// GET /api/sync - Flutter 앱 동기화 데이터 조회
router.get('/', validate(getSyncSchema), syncController.getSync);

export default router;
