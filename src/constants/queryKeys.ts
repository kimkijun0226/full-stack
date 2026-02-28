import { createQueryKeys } from "@lukemorales/query-key-factory";

/**
 * 글(토픽) 쿼리 키
 * - myPublishedList: 내가 발행한 글
 * - communityList: 커뮤니티(전체 공개) 글
 * - draftList: 임시저장 리스트
 * - detail: 단일 상세
 */
export const topicKeys = createQueryKeys("topic", {
  all: null,
  publishedList: (category?: string) => [category ?? ""],
  myPublishedList: (authorId: string, category?: string) => [authorId, category ?? ""],
  communityList: (category?: string) => [category ?? ""],
  draftList: (userId: string) => [userId],
  detail: (id: string | number) => [String(id)],
});

export const queryKeys = { topic: topicKeys };
