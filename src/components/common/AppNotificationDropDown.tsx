import { useNotification } from "@/hooks";
import { Bell, FileText, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/api";

dayjs.extend(relativeTime);
dayjs.locale("ko");

const typeLabel: Record<NotificationType, string> = {
  follow: "팔로우",
  new_post: "새 글",
  comment: "댓글",
  reply: "답글",
  topic_like: "좀아요",
  comment_like: "댓글 좀아요",
};

export function AppNotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    // 열릴 때 읽지 않은 알림 전체 읽음 처리
    if (next && unreadCount > 0) {
      markAllAsRead.mutate();
    }
  };

  const handleNotificationClick = (id: string, link: string) => {
    markAsRead.mutate(id);
    setIsOpen(false);
    navigate(link);
  };

  return (
    <div ref={ref} className="relative">
      {/* 벨 아이콘 */}
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-white shadow-sm shadow-primary/10 text-primary/70 transition hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-foreground/5 dark:shadow-none dark:text-foreground/60 dark:hover:bg-foreground/10 dark:hover:text-foreground"
        onClick={handleOpen}
      >
        <Bell className={cn("h-4 w-4", unreadCount > 0 && "text-rose-500 dark:text-rose-400")} />
        {/* 읽지 않은 알림 뱃지 */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-card shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">알림</span>
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-foreground/30">
                <Bell className="h-8 w-8" />
                <p className="text-sm">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-foreground/5",
                    !notification.is_read && "bg-foreground/3",
                  )}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                >
                  {/* 타입별 아이콘 */}
                  {!notification.thumbnail && <NotificationIcon type={notification.type} />}
                  {notification.thumbnail && (
                    <img
                      src={notification.thumbnail}
                      alt="썸네일"
                      className="h-12 w-12 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-primary mb-0.5">{typeLabel[notification.type]}</p>
                    <p className="text-sm text-foreground/90 line-clamp-3 whitespace-pre-line leading-snug">
                      {notification.content}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground/40">{dayjs(notification.created_at).fromNow()}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { icon: React.ReactNode; className: string }> = {
    follow: { icon: <UserPlus className="h-4 w-4" />, className: "bg-emerald-500/20 text-emerald-400" },
    new_post: { icon: <FileText className="h-4 w-4" />, className: "bg-foreground/10 text-foreground/50" },
    comment: { icon: <MessageCircle className="h-4 w-4" />, className: "bg-blue-500/20 text-blue-400" },
    reply: { icon: <MessageCircle className="h-4 w-4" />, className: "bg-indigo-500/20 text-indigo-400" },
    topic_like: { icon: <Heart className="h-4 w-4" />, className: "bg-rose-500/20 text-rose-400" },
    comment_like: { icon: <Heart className="h-4 w-4" />, className: "bg-pink-500/20 text-pink-400" },
  };
  const { icon, className } = map[type] ?? map.new_post;
  return (
    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", className)}>{icon}</div>
  );
}
