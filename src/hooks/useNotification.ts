import { notificationApi } from "@/api";
import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

export const useNotification = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 알림 목록 조회
  const notifications = useQuery({
    queryKey: ["notification", "list"],
    queryFn: notificationApi.getNotifications,
    enabled: !!user?.id,
  });

  // 읽지 않은 알림 수
  const unreadCount = useQuery({
    queryKey: ["notification", "unread"],
    queryFn: notificationApi.getUnreadCount,
    enabled: !!user?.id,
  });

  // Supabase Realtime 구독 (실시간 알림)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("notification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          // 새 알림 오면 쿼리 무효화
          queryClient.invalidateQueries({ queryKey: ["notification"] });
          // 토스트로 알림 표시
          toast.info(payload.new.content);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // 읽음 처리
  const markAsRead = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
  });

  // 전체 읽음 처리
  const markAllAsRead = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
  });

  return {
    notifications: notifications.data ?? [],
    unreadCount: unreadCount.data ?? 0,
    markAsRead,
    markAllAsRead,
  };
};
