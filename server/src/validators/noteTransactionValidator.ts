import { z } from 'zod';

export const linkTransactionSchema = z.object({
  params: z.object({
    noteId: z.string(),
  }),
  body: z.object({
    transactionId: z.string(),
  }),
});

export const unlinkTransactionSchema = z.object({
  params: z.object({
    noteId: z.string(),
    transactionId: z.string(),
  }),
});

export const getLinkedTransactionsSchema = z.object({
  params: z.object({
    noteId: z.string(),
  }),
});

export const getNotesForTransactionSchema = z.object({
  params: z.object({
    transactionId: z.string(),
  }),
});
