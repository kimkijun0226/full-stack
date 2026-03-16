import type { UserInfo } from "@/api";
import { cn } from "@/lib/utils";
import { CircleUser, FileText, Globe2, LogOut, X } from "lucide-react";

const VIEW_MY = "my";
const VIEW_COMMUNITY = "community";

interface AppHeaderMenuProps {
  activeView: string;
  isOpen: boolean;
  onLogout: () => void;
  onOpenChange: (open: boolean) => void;
  onViewChange: (view: string) => void;
  user: {
    email: string;
    id: string;
  } | null;
  userInfo: UserInfo | null | undefined;
}

function AppHeaderMenu({
  activeView,
  isOpen,
  onLogout,
  onOpenChange,
  onViewChange,
  user,
  userInfo,
}: AppHeaderMenuProps) {
  const navLogoBase =
    "inline-flex items-center justify-center gap-1 rounded-md px-0 py-0.5 text-[11px] font-semibold tracking-wide";

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-40 h-dvh w-[300px] border-l border-white/10 bg-[#141414] p-4 transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/90">메뉴</h3>
          <button
            type="button"
            className="rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          {userInfo?.profile_image ? (
            <img src={userInfo.profile_image} alt="user profile" className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <CircleUser className="h-11 w-11 text-white/70" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userInfo?.nickname || "사용자"}</p>
            <p className="truncate text-xs text-white/55">{user?.email ?? ""}</p>
          </div>
        </div>

        <div className="w-full rounded-md border border-white/35 bg-white/10 p-0.5">
          <div className="relative grid w-full grid-cols-2">
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-0 top-0 h-full w-1/2 rounded-[4px] bg-white transition-transform duration-250 ease-out",
                activeView === VIEW_COMMUNITY ? "translate-x-full" : "translate-x-0",
              )}
            />
            <button
              type="button"
              className={cn(
                navLogoBase,
                "relative z-10 w-full py-2 transition-colors duration-200",
                !user?.id ? "cursor-not-allowed" : "cursor-pointer",
                activeView === VIEW_MY ? "text-black" : "text-white/80 hover:text-white",
              )}
              onClick={() => onViewChange(VIEW_MY)}
            >
              <FileText className="h-3.5 w-3.5" />
              나의 글
            </button>
            <button
              type="button"
              className={cn(
                navLogoBase,
                "relative z-10 w-full cursor-pointer py-2 transition-colors duration-200",
                activeView === VIEW_COMMUNITY ? "text-black" : "text-white/80 hover:text-white",
              )}
              onClick={() => onViewChange(VIEW_COMMUNITY)}
            >
              <Globe2 className="h-3.5 w-3.5" />
              커뮤니티
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
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
