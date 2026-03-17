import type { UserInfo } from "@/api";
import { useTheme } from "@/components/theme-context";
import { CircleUser, LogOut, Moon, Sun, UserPen, X } from "lucide-react";
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
}

function AppHeaderMenu({ isOpen, onLogout, onOpenChange, user, userInfo }: AppHeaderMenuProps) {
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
        className={`fixed top-0 right-0 z-40 h-dvh w-[300px] border-l border-border bg-background p-4 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground/90">메뉴</h3>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-foreground/5 p-3">
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

        <div className="flex flex-col gap-2">
          {/* 다크/라이트 모드 토글 */}
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

        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-500 dark:text-rose-200 transition hover:bg-rose-500/20"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </aside>
    </>
  );
}

export { AppHeaderMenu };
