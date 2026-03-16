import supabase from "@/lib/supabase";

export type Follow = {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
};

// 팔로우 하기
const follow = async (followingId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("follow").insert({
    follower_id: user?.id, // ← 이게 없었던 것!
    following_id: followingId,
  });
  if (error) throw error;
};

// 언팔로우 하기
const unfollow = async (followingId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("follow").delete().eq("follower_id", user?.id).eq("following_id", followingId);
  if (error) throw error;
};

// 팔로우 여부 확인
const checkIsFollowing = async (followingId: string): Promise<boolean> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("follow")
    .select("id")
    .eq("follower_id", user?.id)
    .eq("following_id", followingId)
    .maybeSingle();
  return !!data;
};

// 팔로워 수 조회
const getFollowerCount = async (userId: string): Promise<number> => {
  const { count } = await supabase
    .from("follow")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);
  return count ?? 0;
};

// 팔로잉 수 조회
const getFollowingCount = async (userId: string): Promise<number> => {
  const { count } = await supabase.from("follow").select("*", { count: "exact", head: true }).eq("follower_id", userId);
  return count ?? 0;
};

export const followApi = {
  follow,
  unfollow,
  checkIsFollowing,
  getFollowerCount,
  getFollowingCount,
};
