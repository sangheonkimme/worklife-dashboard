import { prisma } from '../lib/prisma';

export interface SyncQuery {
  since?: string; // ISO8601 timestamp
  limit?: number;
}

// Flutter 앱 동기화 API 응답 형식
export interface SyncResponse {
  notes: SyncNote[];
  deletedNoteIds: string[];
  folders: SyncFolder[];
  deletedFolderIds: string[];
  lastSyncedAt: string;
}

export interface SyncNote {
  id: string;
  folderId: string | null;
  title: string;
  content: string | null;
  type: string;
  visibility: string;
  password: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  publishedUrl: string | null;
  deviceRevision: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  checklistItems: { content: string; isCompleted: boolean; order: number | null }[];
  attachments: { id: string; url: string; type: string; name: string | null; size: number | null; createdAt: string }[];
}

export interface SyncFolder {
  id: string;
  name: string;
  color: string | null;
  parentId: string | null;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const syncService = {
  /**
   * Flutter 앱 동기화 데이터 조회
   * since 이후 변경된 노트/폴더와 삭제된 ID 목록 반환
   */
  async getSyncData(userId: string, params: SyncQuery = {}): Promise<SyncResponse> {
    const { since, limit = 200 } = params;
    const sinceDate = since ? new Date(since) : new Date(0);
    const limitNum = Math.min(Math.max(limit, 1), 1000);

    // 변경된 노트 조회 (삭제되지 않은 것)
    const notes = await prisma.note.findMany({
      where: {
        userId,
        updatedAt: { gte: sinceDate },
        deletedAt: null,
      },
      include: {
        checklistItems: {
          select: {
            content: true,
            isCompleted: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        attachments: {
          select: {
            id: true,
            url: true,
            mimeType: true,
            fileName: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limitNum,
    });

    // 삭제된 노트 ID 조회 (since 이후 삭제된 것)
    const deletedNotes = await prisma.note.findMany({
      where: {
        userId,
        deletedAt: { not: null, gte: sinceDate },
      },
      select: { id: true },
    });
    const deletedNoteIds = deletedNotes.map((n) => n.id);

    // 변경된 폴더 조회 (삭제되지 않은 것)
    const folders = await prisma.folder.findMany({
      where: {
        userId,
        updatedAt: { gte: sinceDate },
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      take: limitNum,
    });

    // 삭제된 폴더 ID 조회 (since 이후 삭제된 것)
    const deletedFolders = await prisma.folder.findMany({
      where: {
        userId,
        deletedAt: { not: null, gte: sinceDate },
      },
      select: { id: true },
    });
    const deletedFolderIds = deletedFolders.map((f) => f.id);

    // Flutter 스펙에 맞게 노트 변환
    const formattedNotes: SyncNote[] = notes.map((note) => ({
      id: note.id,
      folderId: note.folderId,
      title: note.title,
      content: note.content,
      type: note.type,
      visibility: note.visibility,
      password: note.password,
      isPinned: note.isPinned,
      isFavorite: note.isFavorite,
      isArchived: note.isArchived,
      publishedUrl: note.publishedUrl,
      deviceRevision: note.deviceRevision,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      deletedAt: note.deletedAt?.toISOString() ?? null,
      checklistItems: note.checklistItems.map((item) => ({
        content: item.content,
        isCompleted: item.isCompleted,
        order: item.order,
      })),
      attachments: note.attachments.map((att) => ({
        id: att.id,
        url: att.url,
        type: att.mimeType,
        name: att.fileName,
        size: att.fileSize,
        createdAt: att.createdAt.toISOString(),
      })),
    }));

    // Flutter 스펙에 맞게 폴더 변환
    const formattedFolders: SyncFolder[] = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      color: folder.color,
      parentId: null, // 1 depth만 지원
      sortOrder: folder.sortOrder,
      createdAt: folder.createdAt.toISOString(),
      updatedAt: folder.updatedAt.toISOString(),
      deletedAt: folder.deletedAt?.toISOString() ?? null,
    }));

    return {
      notes: formattedNotes,
      deletedNoteIds,
      folders: formattedFolders,
      deletedFolderIds,
      lastSyncedAt: new Date().toISOString(),
    };
  },
};
