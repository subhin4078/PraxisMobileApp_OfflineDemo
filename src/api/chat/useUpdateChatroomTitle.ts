import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface UpdateChatroomTitleData {
  chatId: string;
  title: string;
}

const updateChatroomTitle = async (
  userId: string,
  data: UpdateChatroomTitleData,
): Promise<void> => {
  await api.patch(`/users/${userId}/chats/${data.chatId}`, {
    title: data.title,
  });
};

export const useUpdateChatroomTitle = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateChatroomTitleData) =>
      updateChatroomTitle(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms", userId] });
      toast.show(t("chat.titleUpdated"), "success");
    },
    onError: (error) => {
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};
