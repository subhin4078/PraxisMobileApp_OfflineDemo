import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { NonEmptyString } from "@/src/types";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const createChatroomResponseSchema = z.object({
  chatId: NonEmptyString(),
});

interface CreateChatroomData {
  title: string;
}

const createChatroom = async (
  userId: string,
  data: CreateChatroomData,
): Promise<string> => {
  const result = await api.post(`/users/${userId}/chats`, {
    title: data.title,
  });
  const parsed = createChatroomResponseSchema.parse(result);
  return parsed.chatId;
};

export const useCreateChatroom = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateChatroomData) => createChatroom(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms", userId] });
    },
    onError: (error) => {
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};
