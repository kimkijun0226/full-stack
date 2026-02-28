export enum TOPIC_STATUS {
  TEMP = "temp",
  PUBLISH = "publish",
}

/** 나만보기(본인만) / 전체 공개(커뮤니티 노출) */
export type TOPIC_VISIBILITY = "PRIVATE" | "PUBLIC";

export interface Topic {
  id: number;
  created_at: string;
  author: string;
  title: string;
  content: string;
  category: string;
  thumbnail: string | null;
  status: TOPIC_STATUS;
  /** 없으면 기존 데이터 호환용 public */
  visibility?: TOPIC_VISIBILITY;
}
