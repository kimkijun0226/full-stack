import supabase from "@/lib/supabase";
import { nanoid } from "nanoid";
import { TOPIC_STATUS, type Topic } from "@/types";

const FILES_BUCKET = "files";
const TOPICS_PATH_PREFIX = "topics";

export type TopicCreatePayload = {
  author: string;
  status?: TOPIC_STATUS | null;
  title?: string | null;
  content?: string | null;
  category?: string | null;
  thumbnail?: string | null;
};

export type TopicUpdatePayload = Partial<{
  title: string;
  content: string;
  category: string;
  thumbnail: string | null;
  author: string;
  status: TOPIC_STATUS;
}>;

async function getPublishedTopics(): Promise<Topic[]> {
  const { data, error } = await supabase.from("topic").select("*").eq("status", TOPIC_STATUS.PUBLISH);
  if (error) throw error;
  return data ?? [];
}

async function getDraftTopics(authorId: string): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topic")
    .select("*")
    .eq("author", authorId)
    .eq("status", TOPIC_STATUS.TEMP);
  if (error) throw error;
  return data ?? [];
}

async function getById(id: string | number): Promise<Topic | null> {
  const { data, error } = await supabase.from("topic").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
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
  return data;
}

async function update(id: string | number, payload: TopicUpdatePayload): Promise<Topic> {
  const { data, error } = await supabase.from("topic").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export const topicApi = {
  getPublishedTopics,
  getDraftTopics,
  getById,
  uploadThumbnail,
  create,
  update,
};
