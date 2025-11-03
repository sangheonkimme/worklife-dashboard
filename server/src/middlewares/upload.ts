import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, '../../uploads');

// 디렉토리가 없으면 생성 시도
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  console.warn('Upload directory creation failed, it may already exist or lack permissions:', error);
  // 디렉토리가 이미 존재하거나 권한이 없는 경우 계속 진행
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // 파일명 중복 방지를 위해 timestamp와 랜덤 문자열 추가
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// 파일 필터 (허용할 파일 타입)
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 이미지 파일
  const imageTypes = /jpeg|jpg|png|gif|webp|svg/;
  // 오디오 파일
  const audioTypes = /mp3|wav|ogg|m4a/;
  // 일반 파일 (문서, 압축 파일 등)
  const docTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|7z/;

  const extname = path.extname(file.originalname).toLowerCase().slice(1);
  const isAllowed =
    imageTypes.test(extname) || audioTypes.test(extname) || docTypes.test(extname);

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다'));
  }
};

// Multer 인스턴스 생성
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
});

// 파일 타입 판별 헬퍼 함수
export const getFileType = (mimetype: string): 'IMAGE' | 'AUDIO' | 'FILE' => {
  if (mimetype.startsWith('image/')) return 'IMAGE';
  if (mimetype.startsWith('audio/')) return 'AUDIO';
  return 'FILE';
};

// 파일 해시 생성 (중복 제거용)
export const getFileHash = (filepath: string): string => {
  const fileBuffer = fs.readFileSync(filepath);
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);
  return hash.digest('hex');
};
