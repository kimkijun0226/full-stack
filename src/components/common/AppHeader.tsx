import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, useSearchStore } from "@/stores";
import { toast } from "sonner";
import { CircleUser, Home, MessageCircle, Search } from "lucide-react";
import { useUser } from "@/hooks";
import { useDmUnreadCount } from "@/hooks";
import { AppHeaderMenu } from "./AppHeaderMenu";
import { AppNotificationDropdown } from "./AppNotificationDropDown";

function AppHeader() {
  const navigate = useNavigate();
  const { user, reset } = useAuthStore();
  const { userInfo } = useUser();
  const { data: dmUnreadCount = 0 } = useDmUnreadCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { searchOpen, setSearchOpen } = useSearchStore();

  const handleLogout = async () => {
    try {
      await reset();
      toast.success("로그아웃 성공");
      setMenuOpen(false);
      navigate({ pathname: "/", search: "?view=community" });
    } catch (error) {
      console.error(error);
      toast.error("로그아웃 실패");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-20 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="relative mx-auto flex h-15 w-full max-w-[1328px] items-center justify-between px-3 sm:px-6">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2.5"
            onClick={() => navigate({ pathname: "/", search: user?.id ? "" : "?view=community" })}
          >
            <img src="/assets/my-page-icon.png" alt="@logo" className="h-8 w-8 sm:h-8 sm:w-8" />
            <span className="text-base font-semibold text-white sm:text-[17px]">My Page</span>
          </button>

          <div className="flex items-center gap-2">
            {/* 페이지에 따라 홈 ↔ DM 아이콘 전환 */}
            {location.pathname === "/dm" ? (
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-foreground/5 text-foreground/60 transition hover:bg-foreground/10 hover:text-foreground"
                onClick={() => navigate({ pathname: "/", search: user?.id ? "" : "?view=community" })}
                title="홈으로"
              >
                <Home className="h-4 w-4" />
              </button>
            ) : user?.id ? (
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-foreground/5 text-foreground/60 transition hover:bg-foreground/10 hover:text-foreground"
                onClick={() => navigate("/dm")}
                title="다이렉트 메시지"
              >
                <MessageCircle className="h-4 w-4" />
                {dmUnreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
                    {dmUnreadCount > 9 ? "9+" : dmUnreadCount}
                  </span>
                )}
              </button>
            ) : null}
            {/* 검색 버튼 - 메인(/), 비로그인 시에도 표시 */}
            <button
              type="button"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                searchOpen && location.pathname === "/"
                  ? "border-border bg-foreground/15 text-foreground"
                  : "border-border bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground"
              }`}
              onClick={() => {
                if (location.pathname !== "/") {
                  navigate("/");
                  setTimeout(() => setSearchOpen(true), 50);
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              title="검색"
            >
              <Search className="h-4 w-4" />
            </button>
            {user?.id && <AppNotificationDropdown />}
            {user?.id ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-foreground/90 transition hover:bg-foreground/10"
                onClick={() => setMenuOpen(true)}
              >
                {userInfo?.profile_image ? (
                  <img src={userInfo.profile_image} alt="user profile" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <CircleUser className="h-8 w-8 text-foreground/60" />
                )}
                <span className="max-w-[132px] truncate text-sm">{userInfo?.nickname || user.email}</span>
              </button>
            ) : (
              <NavLink to="/sign-in" className="text-sm text-white/90 transition hover:text-white">
                로그인
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <AppHeaderMenu
        isOpen={menuOpen}
        onLogout={handleLogout}
        onOpenChange={setMenuOpen}
        user={user}
        userInfo={userInfo}
      />
    </>
  );
}

export { AppHeader };
