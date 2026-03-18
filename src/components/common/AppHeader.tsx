import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, useSearchStore, useViewStore } from "@/stores";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CircleUser, Globe2, LayoutGrid, MessageCircle, Search } from "lucide-react";
import { useUser } from "@/hooks";
import { useDmUnreadCount } from "@/hooks";
import { AppHeaderMenu } from "./AppHeaderMenu";
import { AppNotificationDropdown } from "./AppNotificationDropDown";
import { CLASS_CATEGORY } from "@/constants/category.constant";
import { cn } from "@/lib/utils";

function AppHeader() {
  const navigate = useNavigate();
  const { user, reset } = useAuthStore();
  const { userInfo } = useUser();
  const { data: dmUnreadCount = 0 } = useDmUnreadCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { searchOpen, setSearchOpen } = useSearchStore();
  const { isCommunityView, setIsCommunityView } = useViewStore();

  const view = searchParams.get("view");
  const category = searchParams.get("category") ?? "";

  // 홈에서 URL 변경 시 store 동기화
  useEffect(() => {
    if (location.pathname !== "/") return;
    const urlView = view;
    if (urlView === "community") {
      setIsCommunityView(true);
    } else if (searchParams.has("view") && urlView !== "community") {
      setIsCommunityView(false);
    } else if (!searchParams.has("view")) {
      if (!user?.id) {
        setIsCommunityView(true);
      } else if (isCommunityView) {
        // 커뮤니티 뷰인데 URL에 view 파라미터 없으면 복원
        const params = new URLSearchParams();
        params.set("view", "community");
        if (category) params.set("category", category);
        navigate({ pathname: "/", search: `?${params}` }, { replace: true });
      }
    }
    // isCommunityView 의존성 제거 → 토글 클릭 후 루프 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, searchParams, user?.id]);

  const isOnDm = location.pathname === "/dm";

  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [categoryDropdownOpen]);

  useEffect(() => {
    if (categoryDropdownOpen) {
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
      });
    }
  }, [categoryDropdownOpen]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const handleScrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  useEffect(() => {
    if (isCommunityView) {
      document.documentElement.classList.add("community");
    } else {
      document.documentElement.classList.remove("community");
    }
    return () => document.documentElement.classList.remove("community");
  }, [isCommunityView]);

  const makeCategorySearch = (nextCategory: string) => {
    const params = new URLSearchParams();
    if (isCommunityView) params.set("view", "community");
    if (nextCategory) params.set("category", nextCategory);
    const query = params.toString();
    return query ? `?${query}` : "";
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
      <header
        className={`fixed top-0 left-0 right-0 z-20 w-full backdrop-blur-md shadow-sm dark:border-border dark:from-background dark:via-background dark:to-background dark:shadow-none ${isCommunityView ? "border-b border-blue-200/60 bg-gradient-to-r from-sky-50 via-white to-blue-50/60 shadow-blue-100/40" : "border-b border-primary/20 bg-gradient-to-r from-violet-50 via-white to-purple-50/60 shadow-primary/5"}`}
      >
        <div className="relative mx-auto flex h-15 w-full items-center justify-between px-3 sm:px-6">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-2.5 group"
            onClick={() =>
              navigate({
                pathname: "/",
                search: isCommunityView ? "?view=community" : user?.id ? "" : "?view=community",
              })
            }
          >
            <img src="/assets/my-page-icon.png" alt="@logo" className="h-8 w-8 sm:h-8 sm:w-8 drop-shadow-sm" />
            <span className="relative hidden sm:inline-block overflow-hidden h-7 sm:h-8">
              {/* My Page */}
              <span
                className={`text-[20px] sm:text-[22px] font-bold tracking-tight transition-all duration-500 ease-in-out absolute inset-0 flex items-center whitespace-nowrap ${
                  isCommunityView
                    ? "opacity-0 -translate-y-full pointer-events-none"
                    : "opacity-100 translate-y-0 text-primary dark:text-white"
                }`}
              >
                My Page
              </span>
              {/* Community Page */}
              <span
                className={`text-[20px] sm:text-[22px] font-bold tracking-tight transition-all duration-500 ease-in-out absolute inset-0 flex items-center whitespace-nowrap ${
                  isCommunityView
                    ? "opacity-100 translate-y-0 text-primary dark:text-white"
                    : "opacity-0 translate-y-full pointer-events-none"
                }`}
              >
                Community
              </span>
              {/* 레이아웃 유지용 투명 텍스트 */}
              <span className="text-[20px] sm:text-[22px] font-bold tracking-tight invisible">Community</span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Globe2 - 나의 글/커뮤니티 토글 (로그인 사용자만) */}
            {user?.id && (
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition",
                  isCommunityView
                    ? "border-primary/50 bg-primary/15 text-primary shadow-primary/10"
                    : "border-primary/30 bg-white text-primary/70 shadow-primary/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-foreground/10 dark:hover:text-foreground dark:shadow-none",
                )}
                onClick={() => {
                  const next = !isCommunityView;
                  setIsCommunityView(next);
                  const params = new URLSearchParams();
                  if (next) params.set("view", "community");
                  if (category) params.set("category", category);
                  navigate({ pathname: "/", search: params.toString() ? `?${params}` : "" });
                }}
                title={isCommunityView ? "나의 글로 이동" : "커뮤니티로 이동"}
              >
                <Globe2 className="h-4 w-4" />
              </button>
            )}

            {/* LayoutGrid - 카테고리 드롭다운 (모바일 전용 lg:hidden) */}
            <div ref={categoryDropdownRef} className="relative lg:hidden">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((v) => !v)}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition",
                  categoryDropdownOpen
                    ? "border-primary/50 bg-primary/15 text-primary shadow-primary/10"
                    : "border-primary/30 bg-white text-primary/70 shadow-primary/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-foreground/10 dark:hover:text-foreground dark:shadow-none",
                )}
                title="카테고리"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>

              {categoryDropdownOpen && (
                <div className="fixed left-0 right-0 top-[60px] z-50 border-b border-primary/15 dark:border-border bg-card shadow-lg shadow-black/8 dark:shadow-black/20">
                  <div className="relative flex items-center">
                    {/* 왼쪽 스크롤 화살표 */}
                    {canScrollLeft && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleScrollBy("left")}
                        className="absolute left-3 z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-card shadow-sm text-primary hover:bg-primary/10 transition"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {/* 스크롤 컨테이너 */}
                    <div
                      ref={scrollRef}
                      onScroll={checkScroll}
                      className="flex items-center gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      style={{
                        paddingLeft: canScrollLeft ? "48px" : "16px",
                        paddingRight: canScrollRight ? "48px" : "16px",
                        transition: "padding 0.15s",
                      }}
                    >
                      {CLASS_CATEGORY.map((menu) => {
                        const isActive = category === menu.category;
                        return (
                          <button
                            key={menu.id}
                            type="button"
                            onClick={() => {
                              navigate({ pathname: "/", search: makeCategorySearch(menu.category) });
                              setCategoryDropdownOpen(false);
                            }}
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                              isActive
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border bg-foreground/5 text-foreground/60 hover:border-primary/30 hover:bg-primary/8 hover:text-primary",
                            )}
                          >
                            {menu.icon}
                            <span>{menu.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* 오른쪽 스크롤 화살표 */}
                    {canScrollRight && (
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleScrollBy("right")}
                        className="absolute right-3 z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-card shadow-sm text-primary hover:bg-primary/10 transition"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DM - 로그인 사용자만, /dm 활성화 표시 */}
            {user?.id && (
              <button
                type="button"
                className={cn(
                  "relative inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition",
                  isOnDm
                    ? "border-primary/50 bg-primary/15 text-primary shadow-primary/10"
                    : "border-primary/30 bg-white text-primary/70 shadow-primary/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-foreground/10 dark:hover:text-foreground dark:shadow-none",
                )}
                onClick={() => navigate(isOnDm ? { pathname: "/", search: "" } : "/dm")}
                title={isOnDm ? "홈으로" : "다이렉트 메시지"}
              >
                <MessageCircle className="h-4 w-4" />
                {dmUnreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {dmUnreadCount > 9 ? "9+" : dmUnreadCount}
                  </span>
                )}
              </button>
            )}
            {/* 검색 버튼 - 메인(/), 비로그인 시에도 표시 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${
                searchOpen && location.pathname === "/"
                  ? "border-primary/50 bg-primary/15 text-primary shadow-primary/10 dark:border-border dark:bg-foreground/15 dark:text-foreground dark:shadow-none"
                  : "border-primary/30 bg-white text-primary/70 shadow-primary/10 hover:border-primary/50 hover:bg-primary/10 hover:text-primary dark:border-border dark:bg-foreground/5 dark:text-foreground/60 dark:hover:bg-foreground/10 dark:hover:text-foreground dark:shadow-none"
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
                className="inline-flex items-center rounded-full border border-primary/25 bg-white shadow-sm shadow-primary/10 dark:border-border dark:bg-foreground/5 dark:shadow-none p-1 sm:gap-2 sm:px-2.5 sm:py-1 text-foreground/90 transition hover:border-primary/40 hover:bg-primary/8 dark:hover:bg-foreground/10"
                onClick={() => setMenuOpen(true)}
              >
                {userInfo?.profile_image ? (
                  <img src={userInfo.profile_image} alt="user profile" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <CircleUser className="h-8 w-8 text-foreground/60" />
                )}
                <span className="hidden sm:block max-w-[132px] truncate text-sm">
                  {userInfo?.nickname || user.email}
                </span>
              </button>
            ) : (
              <NavLink
                to="/sign-in"
                className="text-sm text-primary/90 transition hover:text-primary dark:text-white/90 dark:hover:text-white"
              >
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
        isCommunityView={isCommunityView}
        dmUnreadCount={dmUnreadCount}
        onToggleCommunityView={() => {
          const next = !isCommunityView;
          setIsCommunityView(next);
          const params = new URLSearchParams();
          if (next) params.set("view", "community");
          if (category) params.set("category", category);
          navigate({ pathname: "/", search: params.toString() ? `?${params}` : "" });
        }}
        onSearchOpen={() => {
          if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => setSearchOpen(true), 50);
          } else {
            setSearchOpen(true);
          }
        }}
      />
    </>
  );
}

export { AppHeader };
