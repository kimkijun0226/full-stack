import { dmApi, type DmMessage } from "@/api/dm";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// DM 방 목록
export function useDmRooms() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const rooms = useQuery({
    queryKey: ["dm", "rooms"],
    queryFn: () => dmApi.getRooms(user!.id),
    enabled: !!user?.id,
  });

  // 새 방 생성 또는 새 메시지 수신 시 목록 갱신 (마지막 메시지·안읽음 수 실시간 반영)
  useEffect(() => {
    if (!user?.id) return;
    let roomChannel: ReturnType<typeof supabase.channel> | null = null;
    let msgChannel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;

      roomChannel = supabase
        .channel(`dm_room:${user.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_room" }, () => {
          queryClient.invalidateQueries({ queryKey: ["dm", "rooms"] });
        })
        .subscribe();

      // dm_message 테이블에 새 메시지 오면 방 목록 전체 재조회
      msgChannel = supabase
        .channel(`dm_room_msg_watch:${user.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_message" }, () => {
          queryClient.invalidateQueries({ queryKey: ["dm", "rooms"] });
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (roomChannel) supabase.removeChannel(roomChannel);
      if (msgChannel) supabase.removeChannel(msgChannel);
    };
  }, [user?.id, queryClient]);

  return rooms;
}

// DM 방 생성 or 가져오기
export function useGetOrCreateRoom() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (otherId: string) => dmApi.getOrCreateRoom(user!.id, otherId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dm", "rooms"] }),
  });
}

// 특정 방의 메시지 + Realtime 구독
export function useDmMessages(roomId: string | null) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const messages = useQuery({
    queryKey: ["dm", "messages", roomId],
    queryFn: () => dmApi.getMessages(roomId!),
    enabled: !!roomId,
  });

  useEffect(() => {
    if (!roomId || !user?.id) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;

      channel = supabase
        .channel(`dm_messages:${roomId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "dm_message", filter: `room_id=eq.${roomId}` },
          (payload) => {
            // 이미 캐시에 있는 메시지면 추가하지 않음 (중복 방지)
            queryClient.setQueryData<DmMessage[]>(["dm", "messages", roomId], (old) => {
              if (!old) return [payload.new as DmMessage];
              if (old.some((m) => m.id === (payload.new as DmMessage).id)) return old;
              return [...old, payload.new as DmMessage];
            });
            // 방 목록 갱신 (마지막 메시지 업데이트)
            queryClient.invalidateQueries({ queryKey: ["dm", "rooms"] });
            // 상대방 메시지면 읽음 처리
            if ((payload.new as DmMessage).sender_id !== user.id) {
              dmApi.markRoomAsRead(roomId, user.id).then(() => {
                queryClient.invalidateQueries({ queryKey: ["dm", "rooms"] });
              });
            }
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [roomId, user?.id, queryClient]);

  // 방 진입 시 읽음 처리
  useEffect(() => {
    if (roomId && user?.id) {
      dmApi.markRoomAsRead(roomId, user.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ["dm", "rooms"] });
      });
    }
  }, [roomId, user?.id, queryClient]);

  return messages;
}

// 메시지 전송
export function useSendMessage(roomId: string | null) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      content,
      file_url,
      file_type,
    }: {
      content?: string;
      file_url?: string;
      file_type?: "image" | "file";
    }) => dmApi.sendMessage({ room_id: roomId!, sender_id: user!.id, content, file_url, file_type }),
    onSuccess: () => {
      // 캐시 직접 추가 제거 - Realtime INSERT 이벤트에서 중복 체크 후 단일 추가
      queryClient.invalidateQueries({ queryKey: ["dm", "rooms"] });
    },
  });
}

// DM 미읽음 메시지 총 개수 (Realtime 구독 포함)
export function useDmUnreadCount() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const location = useLocation();
  // 현재 URL에서 보고 있는 방 ID 추출 (/dm?room=xxx)
  const activeRoomId = new URLSearchParams(location.search).get("room");

  const query = useQuery({
    queryKey: ["dm", "unread", activeRoomId],
    queryFn: async () => {
      const { data: roomRows } = await supabase
        .from("dm_room")
        .select("id")
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`);

      if (!roomRows || roomRows.length === 0) return 0;

      const roomIds = roomRows.map((r) => r.id);
      let query = supabase
        .from("dm_message")
        .select("*", { count: "exact", head: true })
        .in("room_id", roomIds)
        .eq("is_read", false)
        .neq("sender_id", user!.id);

      // 현재 보고 있는 방은 카운트에서 제외
      if (activeRoomId) {
        query = query.neq("room_id", activeRoomId);
      }

      const { count } = await query;
      return count ?? 0;
    },
    enabled: !!user?.id,
  });

  // 새 DM 메시지 도착 시 카운트 실시간 갱신
  useEffect(() => {
    if (!user?.id) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session) return;

      channel = supabase
        .channel(`dm_unread:${user.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "dm_message" }, (payload) => {
          const msg = payload.new as { sender_id: string; room_id: string };
          // 내가 보낸 메시지 무시
          if (msg.sender_id === user.id) return;
          // 현재 보고 있는 방의 메시지 무시 (이미 읽고 있음)
          const currentRoomId = new URLSearchParams(window.location.search).get("room");
          if (currentRoomId && msg.room_id === currentRoomId) return;

          queryClient.invalidateQueries({ queryKey: ["dm", "unread"] });
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "dm_message" }, () => {
          queryClient.invalidateQueries({ queryKey: ["dm", "unread"] });
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
}
