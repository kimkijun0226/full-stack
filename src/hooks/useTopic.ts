import { topicApi, type TopicCreatePayload, type TopicUpdatePayload } from "@/api";
import { topicKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTopic() {
  const client = useQueryClient();
  const { user } = useAuthStore();

  const published = useQuery({
    queryKey: topicKeys.publishedList.queryKey,
    queryFn: () => topicApi.getPublishedTopics(),
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

  return {
    topic: {
      publishedTopics: published.data ?? [],
      publishedLoading: published.isLoading,
      draftTopics: draft.data ?? [],
      draftLoading: draft.isLoading,
      createTopic,
      updateTopic,
    },
  };
}
