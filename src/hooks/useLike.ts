import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likeApi, userApi } from "@/api";
import { notificationApi } from "@/api";
import { likeKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores";

export function useTopicLike(topicId: number) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: likeKeys.topic(topicId).queryKey,
    queryFn: () => likeApi.getTopicLikeInfo(topicId, user?.id),
    enabled: !!topicId,
  });
}

export function useToggleTopicLike(topicId: number, topicAuthorId?: string, topicTitle?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (isLiked: boolean) => {
      if (!user) throw new Error("로그인이 필요합니다.");
      if (isLiked) {
        await likeApi.unlikeTopic(topicId, user.id);
      } else {
        await likeApi.likeTopic(topicId, user.id);
        if (topicAuthorId) {
          const titlePreview = topicTitle
            ? `"${topicTitle.length > 24 ? topicTitle.slice(0, 24) + "…" : topicTitle}"`
            : null;
          const senderInfo = await userApi.getUserInfo(user.id);
          const senderName = senderInfo?.nickname || user.email;
          await notificationApi.createNotification({
            receiver_id: topicAuthorId,
            sender_id: user.id,
            type: "topic_like",
            content: titlePreview
              ? `${senderName}님이 ${titlePreview} 글에 좋아요를 눌렀습니다.`
              : `${senderName}님이 회원님의 글을 좋아합니다.`,
            link: `/topics/${topicId}/detail`,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: likeKeys.topic(topicId).queryKey });
    },
  });
}

export function useShareTopic(topicId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      await likeApi.incrementShareCount(topicId);
    },
    onSuccess: () => {
      // 공유수 즉시 반영
      queryClient.setQueryData(
        likeKeys.topic(topicId).queryKey,
        (prev: { count: number; isLiked: boolean; shareCount: number } | undefined) =>
          prev ? { ...prev, shareCount: prev.shareCount + 1 } : prev,
      );
    },
  });
}
