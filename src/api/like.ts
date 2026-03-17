import supabase from "@/lib/supabase";

export interface TopicLikeInfo {
  count: number;
  isLiked: boolean;
  shareCount: number;
}

const getTopicLikeInfo = async (topicId: number, userId?: string): Promise<TopicLikeInfo> => {
  const [{ data: likeData }, { data: topicData }] = await Promise.all([
    supabase.from("topic_like").select("user_id").eq("topic_id", topicId),
    supabase.from("topic").select("share_count").eq("id", topicId).single(),
  ]);

  const likes = likeData ?? [];
  const isLiked = !!userId && likes.some((l) => l.user_id === userId);

  return {
    count: likes.length,
    isLiked,
    shareCount: topicData?.share_count ?? 0,
  };
};

const likeTopic = async (topicId: number, userId: string): Promise<void> => {
  const { error } = await supabase.from("topic_like").insert({ topic_id: topicId, user_id: userId });
  if (error) throw error;
};

const unlikeTopic = async (topicId: number, userId: string): Promise<void> => {
  const { error } = await supabase.from("topic_like").delete().eq("topic_id", topicId).eq("user_id", userId);
  if (error) throw error;
};

const incrementShareCount = async (topicId: number): Promise<void> => {
  const { data } = await supabase.from("topic").select("share_count").eq("id", topicId).single();
  const current = data?.share_count ?? 0;
  await supabase
    .from("topic")
    .update({ share_count: current + 1 })
    .eq("id", topicId);
};

export const likeApi = { getTopicLikeInfo, likeTopic, unlikeTopic, incrementShareCount };
