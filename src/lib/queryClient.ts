import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const isTopicQuery = (queryKey: readonly unknown[]): boolean =>
  queryKey[0] === "topic";

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (isTopicQuery(query.queryKey)) {
        toast.error(getErrorMessage(error, "토픽 조회 중 오류가 발생했습니다."));
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const scope = mutation.meta?.scope;
      if (scope === "topic") {
        toast.error(getErrorMessage(error, "토픽 처리 중 오류가 발생했습니다."));
      }
      if (scope === "auth") {
        toast.error(getErrorMessage(error, "인증 처리 중 오류가 발생했습니다."));
      }
    },
  }),
});
