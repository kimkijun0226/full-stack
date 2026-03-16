import supabase from "@/lib/supabase";

export type Notification = {
  id: string;
  receiver_id: string;
  sender_id: string;
  type: "follow" | "new_post";
  content: string;
  is_read: boolean;
  link: string;
  created_at: string;
};

// 알림 목록 조회
const getNotifications = async (): Promise<Notification[]> => {
  const { data, error } = await supabase.from("notification").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Notification[];
};

// 읽지 않은 알림 수 조회
const getUnreadCount = async (): Promise<number> => {
  const { count } = await supabase
    .from("notification")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);
  return count ?? 0;
};

// 알림 읽음 처리
const markAsRead = async (id: string): Promise<void> => {
  const { error } = await supabase.from("notification").update({ is_read: true }).eq("id", id);
  if (error) throw error;
};

// 전체 읽음 처리
const markAllAsRead = async (): Promise<void> => {
  const { error } = await supabase.from("notification").update({ is_read: true }).eq("is_read", false);
  if (error) throw error;
};

export const notificationApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
