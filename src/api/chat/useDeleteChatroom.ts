import { useToast } from "@/src/hooks/useToast";
import api from "@/src/lib/axios";
import { getHttpErrorMessage, getHttpStatus } from "@/src/utils/httpError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const deleteChatroom = async (
  userId: string,
  chatId: string,
): Promise<void> => {
  await api.delete(`/users/${userId}/chats/${chatId}`);
};

export const useDeleteChatroom = (userId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (chatId: string) => deleteChatroom(userId, chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatrooms", userId] });
      toast.show(t("chat.deleteSuccess"), "success");
    },
    onError: (error) => {
      toast.show(getHttpErrorMessage(getHttpStatus(error), t), "error");
    },
  });
};
