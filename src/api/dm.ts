import supabase from "@/lib/supabase";

export type DmRoom = {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  // join
  other_user?: {
    id: string;
    nickname: string;
    profile_image: string | null;
    email?: string;
  };
  last_message?: string | null;
  last_message_content?: string | null;
  last_message_type?: string | null;
  last_message_at?: string | null;
  unread_count?: number;
};

export type DmMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  file_url: string | null;
  file_type: "image" | "file" | null;
  is_read: boolean;
  created_at: string;
};

// 내 DM 방 목록 조회 (상대방 정보 + 마지막 메시지 포함)
const getRooms = async (myId: string): Promise<DmRoom[]> => {
  const { data, error } = await supabase
    .from("dm_room")
    .select(
      `
      id, user1_id, user2_id, created_at,
      user1:user!dm_room_user1_id_fkey(id, nickname, profile_image, email),
      user2:user!dm_room_user2_id_fkey(id, nickname, profile_image, email)
    `,
    )
    .or(`user1_id.eq.${myId},user2_id.eq.${myId}`);

  if (error) throw error;

  const rooms = ((data ?? []) as unknown[]).map((row) => {
    const r = row as {
      id: string;
      user1_id: string;
      user2_id: string;
      created_at: string;
      user1: { id: string; nickname: string; profile_image: string | null; email?: string };
      user2: { id: string; nickname: string; profile_image: string | null; email?: string };
    };
    const other = r.user1_id === myId ? r.user2 : r.user1;
    return {
      id: r.id,
      user1_id: r.user1_id,
      user2_id: r.user2_id,
      created_at: r.created_at,
      other_user: other,
    } as DmRoom;
  });

  if (rooms.length === 0) return [];

  const roomIds = rooms.map((r) => r.id);

  // 마지막 메시지 조회 (내림차순, 룸별 첫 번째만 사용)
  const { data: allMessages } = await supabase
    .from("dm_message")
    .select("room_id, content, file_type, created_at")
    .in("room_id", roomIds)
    .order("created_at", { ascending: false });

  // 안읽은 메시지 수 조회
  const { data: unreadMessages } = await supabase
    .from("dm_message")
    .select("room_id")
    .in("room_id", roomIds)
    .eq("is_read", false)
    .neq("sender_id", myId);

  // 룸별 마지막 메시지 맵
  const lastMsgMap: Record<string, { content: string | null; file_type: string | null; created_at: string }> = {};
  for (const msg of allMessages ?? []) {
    const m = msg as { room_id: string; content: string | null; file_type: string | null; created_at: string };
    if (!lastMsgMap[m.room_id]) {
      lastMsgMap[m.room_id] = { content: m.content, file_type: m.file_type, created_at: m.created_at };
    }
  }

  // 룸별 안읽은 수 맵
  const unreadMap: Record<string, number> = {};
  for (const msg of unreadMessages ?? []) {
    const m = msg as { room_id: string };
    unreadMap[m.room_id] = (unreadMap[m.room_id] ?? 0) + 1;
  }

  // 데이터 합치기 + 마지막 메시지 시간순 정렬
  const enriched = rooms.map((room) => {
    const last = lastMsgMap[room.id];
    return {
      ...room,
      last_message_content: last?.content ?? null,
      last_message_type: last?.file_type ?? null,
      last_message_at: last?.created_at ?? room.created_at,
      unread_count: unreadMap[room.id] ?? 0,
    };
  });

  enriched.sort((a, b) => (b.last_message_at ?? "").localeCompare(a.last_message_at ?? ""));

  return enriched;
};

// 특정 방의 메시지 목록 조회
const getMessages = async (roomId: string): Promise<DmMessage[]> => {
  const { data, error } = await supabase
    .from("dm_message")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as DmMessage[];
};

// DM 방 생성 또는 기존 방 조회 (upsert)
const getOrCreateRoom = async (myId: string, otherId: string): Promise<string> => {
  // 정렬하여 항상 같은 순서로 저장
  const [user1_id, user2_id] = [myId, otherId].sort();

  const { data: existing } = await supabase
    .from("dm_room")
    .select("id")
    .eq("user1_id", user1_id)
    .eq("user2_id", user2_id)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase.from("dm_room").insert({ user1_id, user2_id }).select("id").single();
  if (error) throw error;
  return data.id;
};

// 메시지 전송
const sendMessage = async (payload: {
  room_id: string;
  sender_id: string;
  content?: string;
  file_url?: string;
  file_type?: "image" | "file";
}): Promise<DmMessage> => {
  const { data, error } = await supabase.from("dm_message").insert(payload).select().single();
  if (error) throw error;
  return data as DmMessage;
};

// 메시지 파일 업로드
const uploadFile = async (file: File): Promise<{ url: string; type: "image" | "file" }> => {
  const ext = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("files").upload(`dm/${fileName}`, file);
  if (error) throw error;
  const { data } = supabase.storage.from("files").getPublicUrl(`dm/${fileName}`);
  const type = file.type.startsWith("image/") ? "image" : "file";
  return { url: data.publicUrl, type };
};

// 읽음 처리
const markRoomAsRead = async (roomId: string, myId: string): Promise<void> => {
  await supabase
    .from("dm_message")
    .update({ is_read: true })
    .eq("room_id", roomId)
    .eq("is_read", false)
    .neq("sender_id", myId);
};

export const dmApi = {
  getRooms,
  getMessages,
  getOrCreateRoom,
  sendMessage,
  uploadFile,
  markRoomAsRead,
};
