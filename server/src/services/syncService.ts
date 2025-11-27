import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export interface SyncQuery {
  since: Date;
  limit: number;
}

export interface SyncResult<TFolder, TNote> {
  folders: {
    created: TFolder[];
    updated: TFolder[];
    deleted: TFolder[];
  };
  notes: {
    created: TNote[];
    updated: TNote[];
    deleted: TNote[];
  };
  latestTimestamp: string | null;
  hasMore: boolean;
}

export const syncService = {
  async getChangesSince(userId: string, params: SyncQuery): Promise<
    SyncResult<
      Prisma.FolderGetPayload<{
        select: {
          id: true;
          name: true;
          color: true;
          icon: true;
          createdAt: true;
          updatedAt: true;
          deletedAt: true;
        };
      }>,
      Prisma.NoteGetPayload<{
        select: {
          id: true;
          folderId: true;
          title: true;
          content: true;
          type: true;
          visibility: true;
          isPinned: true;
          isFavorite: true;
          isArchived: true;
          createdAt: true;
          updatedAt: true;
          deletedAt: true;
          checklistItems: {
            select: {
              id: true;
              content: true;
              isCompleted: true;
              order: true;
              createdAt: true;
              updatedAt: true;
            };
            orderBy: {
              order: 'asc';
            };
          };
          attachments: {
            select: {
              id: true;
              fileName: true;
              fileSize: true;
              mimeType: true;
              type: true;
              url: true;
              thumbnailUrl: true;
              createdAt: true;
            };
          };
        };
      }>
    >
  > {
    const limit = Math.min(Math.max(params.limit, 1), 1000);

    const [folders, notes] = await Promise.all([
      prisma.folder.findMany({
        where: {
          userId,
          OR: [
            { updatedAt: { gt: params.since } },
            { deletedAt: { gt: params.since } },
          ],
        },
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
        take: limit + 1,
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.note.findMany({
        where: {
          userId,
          OR: [
            { updatedAt: { gt: params.since } },
            { deletedAt: { gt: params.since } },
          ],
        },
        orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
        take: limit + 1,
        select: {
          id: true,
          folderId: true,
          title: true,
          content: true,
          type: true,
          visibility: true,
          isPinned: true,
          isFavorite: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          checklistItems: {
            select: {
              id: true,
              content: true,
              isCompleted: true,
              order: true,
              createdAt: true,
              updatedAt: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileSize: true,
              mimeType: true,
              type: true,
              url: true,
              thumbnailUrl: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    const folderHasMore = folders.length > limit;
    const noteHasMore = notes.length > limit;

    const trim = <T>(items: T[]): T[] => (items.length > limit ? items.slice(0, limit) : items);

    const trimmedFolders = trim(folders);
    const trimmedNotes = trim(notes);

    const folderBuckets = {
      created: [] as typeof trimmedFolders,
      updated: [] as typeof trimmedFolders,
      deleted: [] as typeof trimmedFolders,
    };

    trimmedFolders.forEach((folder) => {
      if (folder.deletedAt) {
        folderBuckets.deleted.push(folder);
      } else if (folder.createdAt > params.since) {
        folderBuckets.created.push(folder);
      } else {
        folderBuckets.updated.push(folder);
      }
    });

    const noteBuckets = {
      created: [] as typeof trimmedNotes,
      updated: [] as typeof trimmedNotes,
      deleted: [] as typeof trimmedNotes,
    };

    trimmedNotes.forEach((note) => {
      if (note.deletedAt) {
        noteBuckets.deleted.push(note);
      } else if (note.createdAt > params.since) {
        noteBuckets.created.push(note);
      } else {
        noteBuckets.updated.push(note);
      }
    });

    const latestTimestamp = [
      ...trimmedFolders.map((f) => f.deletedAt || f.updatedAt),
      ...trimmedNotes.map((n) => n.deletedAt || n.updatedAt),
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.getTime() > b!.getTime() ? -1 : 1))[0];

    return {
      folders: folderBuckets,
      notes: noteBuckets,
      latestTimestamp: latestTimestamp ? latestTimestamp.toISOString() : null,
      hasMore: folderHasMore || noteHasMore,
    };
  },

  async getLatestTimestamp(userId: string): Promise<string | null> {
    const [latestFolder, latestNote] = await Promise.all([
      prisma.folder.findFirst({
        where: { userId },
        orderBy: [{ updatedAt: 'desc' }],
        select: { updatedAt: true, deletedAt: true },
      }),
      prisma.note.findFirst({
        where: { userId },
        orderBy: [{ updatedAt: 'desc' }],
        select: { updatedAt: true, deletedAt: true },
      }),
    ]);

    const timestamps: Date[] = [];
    if (latestFolder?.updatedAt) timestamps.push(latestFolder.updatedAt);
    if (latestFolder?.deletedAt) timestamps.push(latestFolder.deletedAt);
    if (latestNote?.updatedAt) timestamps.push(latestNote.updatedAt);
    if (latestNote?.deletedAt) timestamps.push(latestNote.deletedAt);

    if (timestamps.length === 0) return null;

    const latest = timestamps.sort((a, b) => (a.getTime() > b.getTime() ? -1 : 1))[0];
    return latest.toISOString();
  },
};
