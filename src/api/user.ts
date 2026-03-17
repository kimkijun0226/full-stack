import supabase from "@/lib/supabase";

export type UserInfo = {
  id: string;
  email: string;
  nickname: string;
  profile_image: string | null;
  service_agreed: boolean;
  privacy_agreed: boolean;
  marketing_agreed: boolean;
  created_at?: string;
  updated_at?: string;
};

const getUserInfo = async (id: string): Promise<UserInfo | null> => {
  const { data, error } = await supabase
    .from("user")
    .select("id, nickname, profile_image, email") // 필요한 것만!
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as UserInfo | null;
};

const searchUsers = async (query: string, excludeId: string): Promise<UserInfo[]> => {
  const { data, error } = await supabase
    .from("user")
    .select("id, nickname, profile_image, email")
    .or(`nickname.ilike.%${query}%,email.ilike.%${query}%`)
    .neq("id", excludeId)
    .limit(10);
  if (error) throw error;
  return (data ?? []) as UserInfo[];
};

const updateUserInfo = async (
  id: string,
  data: { nickname?: string; profile_image?: string | null },
): Promise<UserInfo> => {
  const { data: updated, error } = await supabase.from("user").update(data).eq("id", id).select().single();
  if (error) throw error;
  return updated as UserInfo;
};

const deleteUserData = async (id: string): Promise<void> => {
  const { error } = await supabase.from("user").delete().eq("id", id);
  if (error) throw error;
};

export const userApi = {
  getUserInfo,
  searchUsers,
  updateUserInfo,
  deleteUserData,
};
