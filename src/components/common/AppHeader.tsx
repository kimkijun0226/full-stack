import { useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CircleUser, FileText, Globe2, LogOut, X } from "lucide-react";
import { useUser } from "@/hooks";

const VIEW_MY = "my";
const VIEW_COMMUNITY = "community";

function AppHeader() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, reset } = useAuthStore();
  const { userInfo } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const category = searchParams.get("category") ?? "";

  const view = searchParams.get("view");
  const isCommunityView = !user?.id || view === VIEW_COMMUNITY;
  const activeView = isCommunityView ? VIEW_COMMUNITY : VIEW_MY;

  const communitySearch = category ? `?view=community&category=${category}` : "?view=community";
  const mySearch = user?.id ? (category ? `?category=${category}` : "") : communitySearch;

  const navLogoBase =
    "inline-flex items-center justify-center gap-1 rounded-md px-0 py-0.5 text-[11px] font-semibold tracking-wide";

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
      </header>

      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 ${menuOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`fixed top-0 right-0 z-40 h-dvh w-[300px] border-l border-white/10 bg-[#141414] p-4 transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/90">메뉴</h3>
          <button
            type="button"
            className="rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
            onClick={() => setMenuOpen(false)}
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

        <div className="rounded-md border border-white/35 bg-white/10 p-0.5 w-full">
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
              onClick={() => handleViewChange(VIEW_MY)}
            >
              <FileText className="h-3.5 w-3.5" />
              나의 글
            </button>
            <button
              type="button"
              className={cn(
                navLogoBase,
                "relative z-10 w-full py-2 cursor-pointer transition-colors duration-200",
                activeView === VIEW_COMMUNITY ? "text-black" : "text-white/80 hover:text-white",
              )}
              onClick={() => handleViewChange(VIEW_COMMUNITY)}
            >
              <Globe2 className="h-3.5 w-3.5" />
              커뮤니티
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </aside>
    </>
  );
}

export { AppHeader };
