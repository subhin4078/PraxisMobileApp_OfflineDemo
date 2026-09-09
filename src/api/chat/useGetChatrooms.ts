import api from "@/src/lib/axios";
import { NonEmptyString } from "@/src/types";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const chatroomSchema = z.object({
  chatId: NonEmptyString(),
  title: NonEmptyString(),
  updatedAt: z.string(),
});

const chatroomsResponseSchema = z.object({
  chats: z.array(chatroomSchema),
});

export type Chatroom = z.infer<typeof chatroomSchema>;

const getChatrooms = async (userId: string): Promise<Chatroom[]> => {
  const result = await api.get(`/users/${userId}/chats`);
  const parsed = chatroomsResponseSchema.parse(result);
  return parsed.chats;
};

export const useGetChatrooms = (userId: string) => {
  return useQuery({
    queryKey: ["chatrooms", userId],
    queryFn: () => getChatrooms(userId),
    enabled: !!userId,
  });
};
