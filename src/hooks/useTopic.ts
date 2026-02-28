import { topicApi, type TopicCreatePayload, type TopicUpdatePayload } from "@/api";
import { topicKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTopicDetail(id: string | number | undefined) {
  return useQuery({
    queryKey: topicKeys.detail(id ?? "").queryKey,
    queryFn: () => topicApi.getTopicId(id!),
    enabled: Boolean(id),
  });
}

/** 내가 발행한 글 목록 (나의 글 뷰) */
export function useMyTopics(category?: string) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: topicKeys.myPublishedList(userId ?? "", category ?? "").queryKey,
    queryFn: () => topicApi.getMyPublishedTopics(userId!, category),
    enabled: Boolean(userId),
  });
}

/** 커뮤니티 전체 공개 글 목록 */
export function useCommunityTopics(category?: string) {
  return useQuery({
    queryKey: topicKeys.communityList(category ?? "").queryKey,
    queryFn: () => topicApi.getCommunityTopics(category),
  });
}

export function useTopic(category?: string) {
  const client = useQueryClient();
  const { user } = useAuthStore();

  const published = useQuery({
    queryKey: topicKeys.publishedList(category ?? "").queryKey,
    queryFn: () => topicApi.getPublishedTopics(category),
  });

  const draft = useQuery({
    queryKey: topicKeys.draftList(user?.id ?? "").queryKey,
    queryFn: () => topicApi.getDraftTopics(user!.id),
    enabled: Boolean(user?.id),
  });

  const createTopic = useMutation({
    mutationFn: (payload: TopicCreatePayload) => topicApi.create(payload),
    meta: { scope: "topic" as const },
    onSuccess: () => client.invalidateQueries({ queryKey: topicKeys._def }),
  });

  const updateTopic = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TopicUpdatePayload }) => topicApi.update(id, payload),
    meta: { scope: "topic" as const },
    onSuccess: (_, { id }) => {
      client.invalidateQueries({ queryKey: topicKeys.detail(id).queryKey });
      client.invalidateQueries({ queryKey: topicKeys._def });
    },
  });

  const deleteTopic = useMutation({
    mutationFn: (id: number) => topicApi.deleteTopic(id),
    meta: { scope: "topic" as const },
    onSuccess: () => client.invalidateQueries({ queryKey: topicKeys._def }),
  });

  return {
    publishedTopics: published.data ?? [],
    publishedLoading: published.isLoading,
    draftTopics: draft.data ?? [],
    draftLoading: draft.isLoading,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}
