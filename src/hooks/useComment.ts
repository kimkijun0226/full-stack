import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "@/api";
import { notificationApi } from "@/api";
import { commentKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores";

export function useComments(topicId: number) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: commentKeys.list(topicId).queryKey,
    queryFn: () => commentApi.getComments(topicId, user?.id),
    enabled: !!topicId,
  });
}

export function useCreateComment(topicId: number, topicAuthorId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (payload: { content: string; parent_id?: number | null }) =>
      commentApi.createComment({ topic_id: topicId, author_id: user!.id, ...payload }),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(topicId).queryKey });

      if (!user || !topicAuthorId) return;

      const notifType = variables.parent_id ? "reply" : "comment";

      try {
        await notificationApi.createNotification({
          receiver_id: topicAuthorId,
          sender_id: user.id,
          type: notifType,
          content: variables.content.slice(0, 80),
          link: `/topics/${topicId}/detail`,
        });
      } catch {
        // 알림 실패는 무시
      }
    },
  });
}

export function useDeleteComment(topicId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => commentApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(topicId).queryKey });
    },
  });
}

export function useToggleCommentLike(topicId: number) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
      commentAuthorId,
    }: {
      commentId: number;
      isLiked: boolean;
      commentAuthorId?: string;
    }) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      if (isLiked) {
        await commentApi.unlikeComment(commentId, user.id);
      } else {
        await commentApi.likeComment(commentId, user.id);
        if (commentAuthorId) {
          await notificationApi.createNotification({
            receiver_id: commentAuthorId,
            sender_id: user.id,
            type: "comment_like",
            content: "회원님의 댓글을 좋아합니다.",
            link: `/topics/${topicId}/detail`,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(commentKeys.list(topicId));
    },
  });
}
