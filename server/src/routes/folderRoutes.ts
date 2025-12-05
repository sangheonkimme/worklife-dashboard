import { Router } from 'express';
import { folderController } from '../controllers/folderController';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createFolderSchema,
  updateFolderSchema,
  deleteFolderSchema,
  getFoldersSchema,
} from '../validators/folderValidator';

const router = Router();

// 모든 라우트에 인증 적용
router.use(authenticate);

// GET /api/folders - 폴더 목록 조회
router.get('/', validate(getFoldersSchema), folderController.getFolders);

// GET /api/folders/:id - 특정 폴더 조회
router.get('/:id', folderController.getFolderById);

// POST /api/folders - 폴더 생성
router.post('/', validate(createFolderSchema), folderController.createFolder);

// PUT /api/folders/:id - 폴더 수정
router.put('/:id', validate(updateFolderSchema), folderController.updateFolder);

// DELETE /api/folders/:id - 폴더 삭제 (soft delete)
router.delete('/:id', validate(deleteFolderSchema), folderController.deleteFolder);

export default router;
