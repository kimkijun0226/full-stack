import supabase from "@/lib/supabase";

export type NotificationType = "follow" | "new_post" | "comment" | "reply" | "topic_like" | "comment_like";

export type Notification = {
  id: string;
  receiver_id: string;
  sender_id: string;
  type: NotificationType;
  content: string;
  is_read: boolean;
  link: string;
  thumbnail: string | null;
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

// 알림 생성 (sender === receiver이면 생략)
const createNotification = async (payload: {
  receiver_id: string;
  sender_id: string;
  type: NotificationType;
  content: string;
  link: string;
  thumbnail?: string | null;
}): Promise<void> => {
  if (payload.receiver_id === payload.sender_id) return;
  const { error } = await supabase.from("notification").insert(payload);
  if (error) throw error;
};

export const notificationApi = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
};
