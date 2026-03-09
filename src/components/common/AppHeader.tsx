import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Separator } from "../ui";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const VIEW_COMMUNITY = "community";

function AppHeader() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const view = searchParams.get("view");
  const isCommunityView = view === VIEW_COMMUNITY;

  const mySearch = category ? `?category=${category}` : "";
  const communitySearch = category ? `?view=community&category=${category}` : "?view=community";

  const { user, reset } = useAuthStore();

  const handleLogout = async () => {
    try {
      await reset();
      toast.success("로그아웃 성공");
      navigate("/sign-in");
    } catch (error) {
      console.error(error);
      toast.error("로그아웃 실패");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10 w-full flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-[1328px] h-full flex items-center justify-between px-6 py-3">
        {/* 로고 & 네비게이션 UI */}
        <div className="flex items-center gap-5">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=80&h=80&fit=crop"
            alt="@logo"
            className="w-6 h-6 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div className="flex items-center gap-2 rounded-lg bg-white/5 p-1">
            <Link
              to={{ pathname: "/", search: mySearch }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                !isCommunityView ? "bg-white/15 text-white" : "text-white/70 hover:text-white",
              )}
            >
              나의 글
            </Link>
            <Link
              to={{ pathname: "/", search: communitySearch }}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isCommunityView ? "bg-white/15 text-white" : "text-white/70 hover:text-white",
              )}
            >
              커뮤니티
            </Link>
          </div>
        </div>

        {/* 로그인 UI */}
        {user?.id ? (
          <div className="flex items-center gap-5">
            <span className="text-sm text-white">{user.email}</span>
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
