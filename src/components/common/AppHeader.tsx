import { useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CircleUser, FileText, Globe2, MessageCircle } from "lucide-react";
import { useUser } from "@/hooks";
import { useDmUnreadCount } from "@/hooks";
import { AppHeaderMenu } from "./AppHeaderMenu";
import { AppNotificationDropdown } from "./AppNotificationDropDown";

const VIEW_MY = "my";
const VIEW_COMMUNITY = "community";

function AppHeader() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, reset } = useAuthStore();
  const { userInfo } = useUser();
  const { data: dmUnreadCount = 0 } = useDmUnreadCount();
  const [menuOpen, setMenuOpen] = useState(false);

  const category = searchParams.get("category") ?? "";

  const view = searchParams.get("view");
  const isCommunityView = !user?.id || view === VIEW_COMMUNITY;
  const activeView = isCommunityView ? VIEW_COMMUNITY : VIEW_MY;

  const communitySearch = category ? `?view=community&category=${category}` : "?view=community";
  const mySearch = user?.id ? (category ? `?category=${category}` : "") : communitySearch;

  const handleViewChange = (nextView: string) => {
    if (!user?.id && nextView === VIEW_MY) {
      toast(
        <>
          로그인이 필요한 서비스 입니다.
          <br />
          로그인 페이지로 이동 하시겠습니까?
        </>,
        {
          action: {
            label: "예",
            onClick: () => navigate("/sign-in"),
          },
          cancel: {
            label: "아니오",
            onClick: () => {},
          },
          invert: true,
        },
      );
      return;
    }

    if (nextView === VIEW_COMMUNITY) {
      navigate({ pathname: "/", search: communitySearch });
      return;
    }

    navigate({ pathname: "/", search: mySearch });
  };

  const handleMenuViewChange = (nextView: string) => {
    handleViewChange(nextView);
    setMenuOpen(false);
  };

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
      <header className="fixed top-0 left-0 right-0 z-20 w-full border-b border-white/10 bg-[#121212]/95 backdrop-blur-sm">
        <div className="relative mx-auto flex h-15 w-full max-w-[1328px] items-center justify-between px-3 sm:px-6">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2.5"
            onClick={() => navigate({ pathname: "/", search: user?.id ? "" : "?view=community" })}
          >
            <img src="/assets/my-page-icon.png" alt="@logo" className="h-8 w-8 sm:h-8 sm:w-8" />
            <span className="text-base font-semibold text-white sm:text-[17px]">My Page</span>
          </button>

          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
            <div className="pointer-events-auto rounded-md border border-white/35 bg-white/10 p-0.5">
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
                  aria-label="나의 글 보기"
                  title="나의 글"
                  className={cn(
                    "relative z-10 inline-flex h-8 w-10 items-center justify-center rounded-[4px] transition-colors duration-200",
                    !user?.id ? "cursor-not-allowed" : "cursor-pointer",
                    activeView === VIEW_MY ? "text-black" : "text-white/80 hover:text-white",
                  )}
                  onClick={() => handleViewChange(VIEW_MY)}
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="커뮤니티 보기"
                  title="커뮤니티"
                  className={cn(
                    "relative z-10 inline-flex h-8 w-10 items-center justify-center rounded-[4px] transition-colors duration-200",
                    activeView === VIEW_COMMUNITY ? "text-black" : "text-white/80 hover:text-white",
                  )}
                  onClick={() => handleViewChange(VIEW_COMMUNITY)}
                >
                  <Globe2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* DM 아이콘 - 로그인 시에만 */}
            {user?.id && (
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white/70 transition hover:border-white/35 hover:bg-white/12 hover:text-white"
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
            )}
            {/* 알림 아이콘 - 로그인 시에만 */}
            {user?.id && <AppNotificationDropdown />}
            {user?.id ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-2.5 py-1 text-white/90 transition hover:border-white/35 hover:bg-white/12"
                onClick={() => setMenuOpen(true)}
              >
                {userInfo?.profile_image ? (
                  <img src={userInfo.profile_image} alt="user profile" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <CircleUser className="h-8 w-8 text-white/70" />
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
        activeView={activeView}
        isOpen={menuOpen}
        onLogout={handleLogout}
        onOpenChange={setMenuOpen}
        onViewChange={handleMenuViewChange}
        user={user}
        userInfo={userInfo}
      />
    </>
  );
}

export { AppHeader };
