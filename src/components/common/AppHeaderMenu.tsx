import type { UserInfo } from "@/api";
import { useTheme } from "@/components/theme-context";
import {
  Bell,
  BookOpen,
  CircleUser,
  FileText,
  Heart,
  Info,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserPen,
  X,
} from "lucide-react";
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

function AppHeaderMenu({ isOpen, onLogout, onOpenChange, user, userInfo }: AppHeaderMenuProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const menuItems = [
    {
      icon: <FileText className="h-4 w-4" />,
      label: "내 글 목록",
      onClick: () => {
        navigate("/");
        onOpenChange(false);
      },
    },
    {
      icon: <Heart className="h-4 w-4" />,
      label: "좋아요한 글",
      onClick: () => {
        onOpenChange(false);
      },
      soon: true,
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      label: "읽기 목록",
      onClick: () => {
        onOpenChange(false);
      },
      soon: true,
    },
    {
      icon: <Bell className="h-4 w-4" />,
      label: "알림 설정",
      onClick: () => {
        onOpenChange(false);
      },
      soon: true,
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "설정",
      onClick: () => {
        onOpenChange(false);
      },
      soon: true,
    },
    {
      icon: <Info className="h-4 w-4" />,
      label: "앱 정보",
      onClick: () => {
        onOpenChange(false);
      },
      soon: true,
    },
  ];

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
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
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
          {user?.id && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-foreground/5 p-3">
                {userInfo?.profile_image ? (
                  <img
                    src={userInfo.profile_image}
                    alt="user profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <CircleUser className="h-10 w-10 text-foreground/50" />
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
          )}

          {/* 메뉴 아이템 */}
          <div className="px-3">
            {user?.id && (
              <>
                <p className="px-2 mb-1 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/50">
                  메뉴
                </p>
                <div className="flex flex-col gap-0.5">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      className="inline-flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
                      onClick={item.onClick}
                    >
                      <span className="text-foreground/40">{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.soon && (
                        <span className="text-[9px] font-semibold tracking-wider uppercase text-muted-foreground/40 border border-border rounded px-1">
                          soon
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="my-3 mx-4 h-px bg-border" />

          {/* 테마 토글 */}
          <div className="px-3">
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

          {user?.id && (
            <>
              <div className="my-3 mx-4 h-px bg-border" />
              {/* 로그아웃 */}
              <div className="px-3">
                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-500 dark:text-rose-300 transition hover:bg-rose-500/20"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-4 py-3.5 border-t border-border">
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
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
          <p className="text-[11px] text-muted-foreground/40">&copy; 2026 My Page</p>
        </div>
      </aside>
    </>
  );
}

export { AppHeaderMenu };
