import { useNotification } from "@/hooks";
import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);
dayjs.locale("ko");

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
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:border-white/35 hover:bg-white/12 hover:text-white"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell className="h-4 w-4" />
        {/* 읽지 않은 알림 뱃지 */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 드롭다운 */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-2xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">알림</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs text-white/50 transition hover:text-white"
                onClick={() => markAllAsRead.mutate()}
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-white/30">
                <Bell className="h-8 w-8" />
                <p className="text-sm">알림이 없습니다</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/5",
                    !notification.is_read && "bg-white/3",
                  )}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                >
                  {/* 읽음 여부 표시 */}
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      notification.is_read ? "bg-transparent" : "bg-blue-400",
                    )}
                  />
                  {notification.thumbnail && (
                    <img
                      src={notification.thumbnail}
                      alt="썸네일"
                      className="h-12 w-12 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-line text-sm text-white/90">{notification.content}</p>
                    <p className="mt-0.5 text-xs text-white/40">{dayjs(notification.created_at).fromNow()}</p>
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
