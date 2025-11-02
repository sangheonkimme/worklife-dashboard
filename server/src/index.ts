import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import categoryRoutes from './routes/categoryRoutes';
import budgetRoutes from './routes/budgetRoutes';
import noteRoutes from './routes/noteRoutes';
import folderRoutes from './routes/folderRoutes';
import tagRoutes from './routes/tagRoutes';
import checklistRoutes from './routes/checklistRoutes';
import templateRoutes from './routes/templateRoutes';
import noteTransactionRoutes from './routes/noteTransactionRoutes';
import attachmentRoutes from './routes/attachmentRoutes';
import path from 'path';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(helmet()); // 보안 헤더
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
})); // CORS
app.use(morgan('dev')); // 로깅
app.use(compression()); // 응답 압축
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩 파싱
app.use(cookieParser()); // 쿠키 파싱

// 정적 파일 제공 (업로드된 파일)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 헬스 체크 엔드포인트
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api', checklistRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', noteTransactionRoutes);
app.use('/api', attachmentRoutes);
// app.use('/api/salary', salaryRoutes);

// 404 핸들러
app.use(notFoundHandler);

// 에러 핸들러 (반드시 마지막에 위치)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
