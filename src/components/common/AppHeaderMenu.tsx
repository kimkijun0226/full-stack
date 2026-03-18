import type { UserInfo } from "@/api";
import { useTheme } from "@/components/theme-context";
import { CircleUser, LogOut, Moon, MessageSquareDot, Sun, UserPen, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppHeaderMenuProps {
  isOpen: boolean;
  onLogout: () => void;
  onOpenChange: (open: boolean) => void;
  user: {
    email: string;
    id: string;
  } | null;
  userInfo: UserInfo | null | undefined;
  isCommunityView?: boolean;
  onToggleCommunityView?: () => void;
  onSearchOpen?: () => void;
  dmUnreadCount?: number;
}

function AppHeaderMenu({ isOpen, onLogout, onOpenChange, user, userInfo, dmUnreadCount }: AppHeaderMenuProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-40 h-dvh w-[300px] border-l border-border bg-background flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <img src="/assets/my-page-icon.png" alt="logo" className="h-6 w-6 drop-shadow-sm" />
            <span className="text-sm font-bold text-primary">My Page</span>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          {/* 프로필 카드 */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-foreground/5 p-3">
              {userInfo?.profile_image ? (
                <img src={userInfo.profile_image} alt="user profile" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <CircleUser className="h-11 w-11 text-foreground/50" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{userInfo?.nickname || "사용자"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
              </div>
              <button
                type="button"
                title="프로필 수정"
                className="shrink-0 h-8 w-8 rounded-full border border-border bg-foreground/5 flex items-center justify-center text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
                onClick={() => {
                  navigate("/profile");
                  onOpenChange(false);
                }}
              >
                <UserPen className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 메뉴 아이템 */}
          <div className="px-4 flex flex-col gap-1">
            <button
              type="button"
              className="inline-flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground"
              onClick={() => {
                navigate("/dm");
                onOpenChange(false);
              }}
            >
              <div className="relative shrink-0">
                <MessageSquareDot className="h-4 w-4" />
                {!!dmUnreadCount && dmUnreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {dmUnreadCount > 9 ? "9+" : dmUnreadCount}
                  </span>
                )}
              </div>
              Direct Message
            </button>
          </div>

          {/* 구분선 */}
          <div className="my-3 mx-4 h-px bg-border" />

          {/* 다크/라이트 모드 */}
          <div className="px-4">
            <button
              type="button"
              className="inline-flex w-full items-center justify-between gap-2.5 rounded-lg border border-border bg-foreground/5 px-3 py-2.5 text-sm text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <span className="inline-flex items-center gap-2.5">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {isDark ? "다크 모드" : "라이트 모드"}
              </span>
              <span className="text-xs text-muted-foreground">{isDark ? "ON" : "OFF"}</span>
            </button>
          </div>

          {/* 구분선 */}
          <div className="my-3 mx-4 h-px bg-border" />

          {/* 로그아웃 */}
          <div className="px-4">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-500 dark:text-rose-200 transition hover:bg-rose-500/20"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>

        {/* 푸터 영역 */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
            {["이용약관", "개인정보처리방침", "오픈소스"].map((label) => (
              <button
                key={label}
                type="button"
                className="text-[11px] text-muted-foreground hover:text-foreground transition"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            글씁이, 일기, 여행일지—
            <br />
            나만의 페이지를 기록하는 공간
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground/40">&copy; 2026 My Page</p>
        </div>
      </aside>
    </>
  );
}

export { AppHeaderMenu };
