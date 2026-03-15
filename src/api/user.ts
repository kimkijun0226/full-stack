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
  const { data, error } = await supabase.from("user").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data as UserInfo | null;
};

export const userApi = {
  getUserInfo,
};
