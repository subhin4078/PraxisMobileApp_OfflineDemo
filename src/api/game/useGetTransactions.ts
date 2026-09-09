import api from "@/src/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const transactionDataSchema = z.object({
  type: z.enum(["purchase", "earn", "refund", "activate", "remove"]),
  itemId: z.string().nullable(),
  quantity: z.number().int().nullable(),
  coinsInvolved: z.number().int(),
  createdAt: z.string(),
  reason: z.string(),
});

const transactionSchema = z.object({
  id: z.string(),
  data: transactionDataSchema,
});

const transactionsResponseSchema = z.object({
  transactions: z.array(transactionSchema),
  nextCursor: z.string().nullable(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionsResponse = z.infer<typeof transactionsResponseSchema>;

const getTransactions = async (
  userId: string,
  params?: { limit?: number; cursor?: string },
) => {
  const result = await api.get(`/users/${userId}/transactions`, { params });
  return transactionsResponseSchema.parse(result);
};

export const useGetTransactions = (
  userId: string,
  params?: { limit?: number; cursor?: string },
) => {
  return useQuery({
    queryKey: ["transactions", userId, params],
    queryFn: () => getTransactions(userId, params),
    enabled: !!userId,
  });
};
