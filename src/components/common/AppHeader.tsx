import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Separator } from "../ui";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BookText, CircleUser, Users } from "lucide-react";
import { useUser } from "@/hooks";

const VIEW_MY = "my";
const VIEW_COMMUNITY = "community";

function AppHeader() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, reset } = useAuthStore();
  const { userInfo } = useUser();

  const category = searchParams.get("category") ?? "";
  const view = searchParams.get("view");
  const isCommunityView = !user?.id || view === VIEW_COMMUNITY;
  const activeView = isCommunityView ? VIEW_COMMUNITY : VIEW_MY;

  const communitySearch = category ? `?view=community&category=${category}` : "?view=community";
  const mySearch = user?.id ? (category ? `?category=${category}` : "") : communitySearch;
  const navLogoBase =
    "inline-flex items-center justify-center gap-0.5 rounded-full px-0 py-0.5 text-[11px] font-semibold tracking-wide";

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
      navigate({ pathname: "/", search: "?view=community" });
    } catch (error) {
      console.error(error);
      toast.error("로그아웃 실패");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 w-full flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-[1328px] h-full flex items-center justify-between px-6 py-3">
        {/* 로고 & 네비게이션 UI */}
        <div className="flex items-center gap-3">
          <h1
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate({ pathname: "/", search: user?.id ? "" : "?view=community" })}
          >
            <img src="/assets/my-page-icon.png" alt="@logo" className="w-8 h-8 " />
            <p className="text-lg">My Page</p>
          </h1>

          <Separator orientation="vertical" className="!h-4" />

          <div className="rounded-full border border-white/35 bg-white/10 p-0.5">
            <div className="relative grid w-[152px] grid-cols-2">
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute left-0 top-0 h-6.5 w-1/2 rounded-full bg-white transition-transform duration-250 ease-out",
                  activeView === VIEW_COMMUNITY ? "translate-x-full" : "translate-x-0",
                )}
              />
              <button
                type="button"
                className={cn(
                  navLogoBase,
                  "relative z-10 h-6 w-full transition-colors duration-200",
                  !user?.id ? "cursor-not-allowed" : "cursor-pointer",
                  activeView === VIEW_MY ? "text-black" : "text-white/80 hover:text-white",
                )}
                onClick={() => handleViewChange(VIEW_MY)}
              >
                <BookText className="h-3 w-3" />
                나의 글
              </button>
              <button
                type="button"
                className={cn(
                  navLogoBase,
                  "relative z-10 h-6.5 w-full transition-colors duration-200 cursor-pointer",
                  activeView === VIEW_COMMUNITY ? "text-black" : "text-white/80 hover:text-white",
                )}
                onClick={() => handleViewChange(VIEW_COMMUNITY)}
              >
                <Users className="h-3 w-3" />
                커뮤니티
              </button>
            </div>
          </div>
        </div>

        {/* 로그인 UI */}
        {user?.id ? (
          <div className="flex items-center gap-5">
            <div className="flex gap-2 items-center">
              {userInfo?.profile_image ? (
                <img src={userInfo.profile_image} alt="user profile" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <CircleUser className="w-7 h-7 text-white/70" />
              )}
              <span className="text-sm text-white">{userInfo?.nickname || user.email}</span>
            </div>
            <Separator orientation="vertical" className="!h-4" />
            <span className="text-sm text-white cursor-pointer" onClick={handleLogout}>
              로그아웃
            </span>
          </div>
        ) : (
          <NavLink to="/sign-in">로그인</NavLink>
        )}
      </div>
    </header>
  );
}

export { AppHeader };
