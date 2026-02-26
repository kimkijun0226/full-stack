import { createQueryKeys } from "@lukemorales/query-key-factory";

/**
 * 토픽 쿼리 키
 * - _def: 전체 무효화 시 queryKey로 사용
 * - publishedList: 발행된 리스트
 * - draftList: 임시저장 리스트 (userId 필요)
 * - detail: 단일 토픽 상세
 */
export const topicKeys = createQueryKeys("topic", {
  all: null,
  publishedList: null,
  draftList: (userId: string) => [userId],
  detail: (id: string | number) => [String(id)],
});

export const queryKeys = { topic: topicKeys };
