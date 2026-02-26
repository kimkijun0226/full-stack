import { topicApi } from "@/api";
import { topicKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useTopicDetail(id: string | number | undefined) {
  return useQuery({
    queryKey: topicKeys.detail(id ?? "").queryKey,
    queryFn: () => topicApi.getById(id!),
    enabled: Boolean(id),
  });
}
