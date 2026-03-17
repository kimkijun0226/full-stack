import supabase from "@/lib/supabase";

export interface Comment {
  id: number;
  topic_id: number;
  author_id: string;
  parent_id: number | null;
  content: string;
  created_at: string;
  like_count: number;
  is_liked: boolean;
  author: {
    id: string;
    nickname: string;
    profile_image: string | null;
  } | null;
}

const getComments = async (topicId: number, currentUserId?: string): Promise<Comment[]> => {
  const { data: rawComments, error } = await supabase
    .from("comment")
    .select("*")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  const comments = rawComments ?? [];
  if (comments.length === 0) return [];

  // 작성자 정보 일괄 조회
  const authorIds = [...new Set(comments.map((c) => c.author_id as string))];
  const { data: users } = await supabase.from("user").select("id, nickname, profile_image").in("id", authorIds);

  const userMap: Record<string, { id: string; nickname: string; profile_image: string | null }> = {};
  for (const u of users ?? []) userMap[u.id] = u;

  // 좋아요 정보 일괄 조회
  const commentIds = comments.map((c) => c.id as number);
  const { data: likes } = await supabase
    .from("comment_like")
    .select("comment_id, user_id")
    .in("comment_id", commentIds);

  const likeMap: Record<number, { count: number; isLiked: boolean }> = {};
  for (const like of likes ?? []) {
    if (!likeMap[like.comment_id]) likeMap[like.comment_id] = { count: 0, isLiked: false };
    likeMap[like.comment_id].count++;
    if (currentUserId && like.user_id === currentUserId) likeMap[like.comment_id].isLiked = true;
  }

  return comments.map((c) => ({
    ...(c as Comment),
    author: userMap[c.author_id] ?? null,
    like_count: likeMap[c.id]?.count ?? 0,
    is_liked: likeMap[c.id]?.isLiked ?? false,
  }));
};

const createComment = async (payload: {
  topic_id: number;
  author_id: string;
  content: string;
  parent_id?: number | null;
}): Promise<Comment> => {
  const { data, error } = await supabase.from("comment").insert(payload).select().single();
  if (error) throw error;
  return { ...(data as Comment), author: null, like_count: 0, is_liked: false };
};

const deleteComment = async (id: number): Promise<void> => {
  const { error } = await supabase.from("comment").delete().eq("id", id);
  if (error) throw error;
};

const likeComment = async (commentId: number, userId: string): Promise<void> => {
  const { error } = await supabase.from("comment_like").insert({ comment_id: commentId, user_id: userId });
  if (error) throw error;
};

const unlikeComment = async (commentId: number, userId: string): Promise<void> => {
  const { error } = await supabase.from("comment_like").delete().eq("comment_id", commentId).eq("user_id", userId);
  if (error) throw error;
};

export const commentApi = { getComments, createComment, deleteComment, likeComment, unlikeComment };
