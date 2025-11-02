import { prisma } from '../lib/prisma';
import { getFileType, getFileHash } from '../middlewares/upload';
import fs from 'fs';
import path from 'path';

export const attachmentService = {
  // 파일 첨부
  async uploadAttachment(
    noteId: string,
    userId: string,
    file: Express.Multer.File
  ) {
    // 메모 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      // 권한이 없으면 업로드된 파일 삭제
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 파일 해시 생성
    const hash = getFileHash(file.path);

    // 파일 타입 판별
    const type = getFileType(file.mimetype);

    // 첨부파일 생성
    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        type,
        url: `/uploads/${file.filename}`,
        hash,
        noteId,
      },
    });

    return attachment;
  },

  // 여러 파일 첨부
  async uploadMultipleAttachments(
    noteId: string,
    userId: string,
    files: Express.Multer.File[]
  ) {
    // 메모 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      // 권한이 없으면 업로드된 파일들 모두 삭제
      files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      throw new Error('메모를 찾을 수 없습니다');
    }

    // 각 파일에 대해 첨부파일 생성
    const attachments = await Promise.all(
      files.map(async (file) => {
        const hash = getFileHash(file.path);
        const type = getFileType(file.mimetype);

        return prisma.attachment.create({
          data: {
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            type,
            url: `/uploads/${file.filename}`,
            hash,
            noteId,
          },
        });
      })
    );

    return attachments;
  },

  // 첨부파일 목록 조회
  async getAttachments(noteId: string, userId: string) {
    // 메모 권한 확인
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId, deletedAt: null },
    });

    if (!note) {
      throw new Error('메모를 찾을 수 없습니다');
    }

    return prisma.attachment.findMany({
      where: { noteId },
      orderBy: { createdAt: 'desc' },
    });
  },

  // 첨부파일 삭제
  async deleteAttachment(id: string, userId: string) {
    // 첨부파일 조회 및 권한 확인
    const attachment = await prisma.attachment.findFirst({
      where: {
        id,
        note: {
          userId,
          deletedAt: null,
        },
      },
    });

    if (!attachment) {
      throw new Error('첨부파일을 찾을 수 없습니다');
    }

    // 파일 시스템에서 파일 삭제
    const filePath = path.join(__dirname, '../../', attachment.url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('파일 삭제 실패:', error);
        // 파일 삭제 실패해도 DB 레코드는 삭제
      }
    }

    // DB에서 첨부파일 삭제
    await prisma.attachment.delete({
      where: { id },
    });

    return { message: '첨부파일이 삭제되었습니다' };
  },
};
