import supabase from "@/lib/supabase";
import { nanoid } from "nanoid";
import { TOPIC_STATUS, type Topic, type TOPIC_VISIBILITY } from "@/types";

const FILES_BUCKET = "files";
const TOPICS_PATH_PREFIX = "topics";

export type TopicCreatePayload = {
  author: string;
  status?: TOPIC_STATUS | null;
  title?: string | null;
  content?: string | null;
  category?: string | null;
  thumbnail?: string | null;
  visibility?: TOPIC_VISIBILITY | null;
};

export type TopicUpdatePayload = Partial<{
  title: string;
  content: string;
  category: string;
  thumbnail: string | null;
  author: string;
  status: TOPIC_STATUS;
  visibility: TOPIC_VISIBILITY;
}>;

/** 내가 발행한 글 (나만보기 + 전체공개 모두) */
async function getMyPublishedTopics(authorId: string, category?: string): Promise<Topic[]> {
  let query = supabase
    .from("topic")
    .select("*")
    .eq("author", authorId)
    .eq("status", TOPIC_STATUS.PUBLISH)
    .order("created_at", { ascending: false });

  if (category && category.trim() !== "") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizeTopic);
}

/** 커뮤니티: 전체 공개된 글만 (다른 사람 글 포함). visibility 컬럼 없으면 발행된 전체 반환 */
async function getCommunityTopics(category?: string): Promise<Topic[]> {
  let query = supabase
    .from("topic")
    .select("*")
    .eq("status", TOPIC_STATUS.PUBLISH)
    .order("created_at", { ascending: false });

  if (category && category.trim() !== "") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  const rows = (data ?? []).map(normalizeTopic);
  return rows.filter((t) => t.visibility === "PUBLIC");
}

function normalizeTopic(row: Record<string, unknown>): Topic {
  return {
    ...row,
    visibility: (row.visibility as Topic["visibility"]) ?? "PUBLIC",
  } as Topic;
}

/** @deprecated 나의 글/커뮤니티 분리 후 사용처 없음. getMyPublishedTopics / getCommunityTopics 사용 */
async function getPublishedTopics(category?: string): Promise<Topic[]> {
  let query = supabase
    .from("topic")
    .select("*")
    .eq("status", TOPIC_STATUS.PUBLISH)
    .order("created_at", { ascending: false });

  if (category && category.trim() !== "") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(normalizeTopic);
}

async function getDraftTopics(authorId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topic")
    .select("*")
    .eq("author", authorId)
    .eq("status", TOPIC_STATUS.TEMP);
  if (error) throw error;
  return (data ?? []).map(normalizeTopic);
}

async function getTopicId(id: string | number): Promise<Topic | null> {
  const { data, error } = await supabase.from("topic").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalizeTopic(data) : null;
}

async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileName = `${nanoid()}.${ext}`;
  const filePath = `${TOPICS_PATH_PREFIX}/${fileName}`;
  const { error } = await supabase.storage.from(FILES_BUCKET).upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from(FILES_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("썸네일 URL 조회에 실패했습니다.");
  return data.publicUrl;
}

async function create(payload: TopicCreatePayload): Promise<Topic> {
  const { data, error } = await supabase.from("topic").insert([payload]).select().single();
  if (error) throw error;
  return normalizeTopic(data);
}

async function update(id: string | number, payload: TopicUpdatePayload): Promise<Topic> {
  const { data, error } = await supabase.from("topic").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return normalizeTopic(data);
}

async function deleteTopic(id: number): Promise<void> {
  const { error } = await supabase.from("topic").delete().eq("id", id).select().single();
  if (error) throw error;
}

/** 제목 / 닉네임 / 이메일로 검색 (PUBLIC 발행 글만) */
async function searchTopics(query: string, category?: string): Promise<Topic[]> {
  const { data: matchedUsers } = await supabase
    .from("user")
    .select("id")
    .or(`nickname.ilike.%${query}%,email.ilike.%${query}%`);

  const authorIds = (matchedUsers ?? []).map((u: { id: string }) => u.id);

  let q = supabase
    .from("topic")
    .select("*")
    .eq("status", TOPIC_STATUS.PUBLISH)
    .order("created_at", { ascending: false });

  if (authorIds.length > 0) {
    q = q.or(`title.ilike.%${query}%,author.in.(${authorIds.join(",")})`);
  } else {
    q = q.ilike("title", `%${query}%`);
  }

  if (category && category.trim() !== "") {
    q = q.eq("category", category);
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(normalizeTopic).filter((t) => t.visibility === "PUBLIC");
}

export const topicApi = {
  getPublishedTopics,
  getMyPublishedTopics,
  getCommunityTopics,
  getDraftTopics,
  getTopicId,
  uploadThumbnail,
  create,
  update,
  deleteTopic,
  searchTopics,
};
