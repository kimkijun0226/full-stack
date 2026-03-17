import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, Globe2, NotebookPen, PencilLine, Search, X } from "lucide-react";
import { AppDraftsDialog, AppSidebar } from "../components/common";
import { SkeletonHotTopic } from "../components/skeleton";
import { Button } from "../components/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, useSearchStore } from "@/stores";
import { toast } from "sonner";
import { useTopic, useMyTopics, useCommunityTopics, useSearchTopics } from "@/hooks";
import { NewTopicCard } from "@/components/topics";
import type { Topic } from "@/types";
import { CLASS_CATEGORY } from "@/constants/category.constant";
import { cn } from "@/lib/utils";

const VIEW_MY = "my";
const VIEW_COMMUNITY = "community";

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const viewParam = searchParams.get("view");
  const { user } = useAuthStore();

  const view = user?.id ? (viewParam ?? VIEW_MY) : VIEW_COMMUNITY;
  const { createTopic, draftTopics } = useTopic();
  const { data: myTopics = [], isLoading: myLoading } = useMyTopics(category || undefined);
  const { data: communityTopics = [], isLoading: communityLoading } = useCommunityTopics(category || undefined);
  const draftCount = draftTopics.length;

  const isMyView = view === VIEW_MY;
  const list = isMyView ? myTopics : communityTopics;
  const listLoading = isMyView ? myLoading : communityLoading;
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  const { searchOpen, setSearchOpen } = useSearchStore();
  const [inputValue, setInputValue] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const isSearchMode = debouncedQuery.trim().length > 0;
  const { data: searchData, isLoading: searchLoading } = useSearchTopics(debouncedQuery, searchCategory || undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    if (!searchOpen) {
      setInputValue("");
      setSearchCategory("");
      setDebouncedQuery("");
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen, setSearchOpen]);

  const makeCategorySearch = (nextCategory: string) => {
    const params = new URLSearchParams();
    if (!isMyView) params.set("view", VIEW_COMMUNITY);
    if (nextCategory) params.set("category", nextCategory);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const handleCategorySlide = (direction: "left" | "right") => {
    const container = categoryScrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "right" ? 220 : -220,
      behavior: "smooth",
    });
  };

  const handleRoute = async () => {
    if (!user || !user.id || !user.email || !user.role) {
      toast(
        <>
          글 작성은 로그인 후 이용 가능합니다.
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
          classNames: {
            actionButton: "order-1",
            cancelButton: "order-2",
          },
        },
      );
      return;
    }

    try {
      const created = await createTopic.mutateAsync({
        author: user.id,
        status: null,
        title: null,
        content: null,
        category: null,
        thumbnail: null,
        visibility: "PRIVATE",
      });
      toast.success("글을 생성하였습니다.");
      navigate(`/topics/${created.id}/create`);
    } catch (error) {
      console.log(error);
      toast.error("글 생성에 실패했습니다.");
    }
  };

  return (
    <main className="w-full h-full min-h-screen flex p-3 sm:p-6 gap-4 sm:gap-6 mt-1 sm:mt-4">
      <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full border border-sky-200/60 bg-white/65 dark:border-sky-500/15 dark:bg-slate-950/40 shadow-2xl shadow-black/10 ring-1 ring-sky-300/15 dark:ring-sky-500/10 backdrop-blur-xl supports-backdrop-filter:bg-white/70 supports-backdrop-filter:dark:bg-slate-950/45">
        <Button
          variant="ghost"
          className="relative overflow-hidden py-5 px-6 rounded-full border border-sky-300/45 bg-linear-to-b from-sky-400/85 to-blue-600/70 text-white shadow-lg shadow-sky-500/20 hover:border-sky-200/70 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-6px_rgba(56,189,248,0.45)] active:translate-y-0 active:shadow-none transition-all duration-300 ease-out before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/25 before:to-white/0 before:translate-x-[-130%] hover:before:translate-x-[130%] before:transition-transform before:duration-700 before:ease-out"
          onClick={handleRoute}
        >
          <PencilLine />글 쓰기
        </Button>
        {user?.id ? (
          <AppDraftsDialog>
            <div className="relative">
              <Button
                variant="ghost"
                className="relative overflow-hidden rounded-full w-10 h-10 border border-sky-200/60 bg-white/55 dark:border-sky-500/15 dark:bg-white/10 text-foreground shadow-sm shadow-black/5 hover:bg-white/75 hover:border-sky-200/80 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-8px_rgba(59,130,246,0.4)] active:translate-y-0 active:shadow-none transition-all duration-300 ease-out before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-130%] hover:before:translate-x-[130%] before:transition-transform before:duration-700 before:ease-out"
              >
                <NotebookPen />
              </Button>
              {draftCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-linear-to-b from-rose-500 to-red-600 text-[10px] font-semibold text-white shadow-md shadow-red-500/25 ring-2 ring-background">
                  {draftCount > 99 ? "99+" : draftCount}
                </span>
              )}
            </div>
          </AppDraftsDialog>
        ) : null}
      </div>
      {/* 카테고리 사이드바 - 검색 시 숨김 */}
      <div className={`hidden lg:block lg:min-w-60 lg:w-60 lg:h-full${searchOpen ? " !hidden" : ""}`}>
        <AppSidebar />
      </div>
      {/* 글 목록 */}
      <section className={`w-full flex flex-col gap-12${searchOpen ? "" : " lg:w-[calc(100%-264px)]"}`}>
        <div className="w-full flex flex-col gap-6">
          {/* 검색 패널 */}
          {searchOpen && (
            <div ref={searchPanelRef} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="제목, 닉네임, 이메일로 검색..."
                  className="w-full rounded-xl border border-border bg-foreground/5 py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-border/80 focus:bg-foreground/8 transition"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue("")}
                    className="absolute right-3 text-foreground/40 hover:text-foreground transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CLASS_CATEGORY.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSearchCategory(searchCategory === cat.category ? "" : cat.category)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition",
                      searchCategory === cat.category
                        ? "border-foreground/30 bg-foreground/15 text-foreground"
                        : "border-border bg-foreground/5 text-foreground/60 hover:border-border/80 hover:text-foreground",
                    )}
                  >
                    {cat.icon}
                    <span className="ml-0.5">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 모바일/태블릿 카테고리 - 검색 시 숨김 */}
          {!searchOpen && (
            <div className="lg:hidden flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCategorySlide("left")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-foreground/5 text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground"
                aria-label="카테고리 왼쪽으로 이동"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div
                ref={categoryScrollRef}
                className="-mx-1 flex-1 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="inline-flex min-w-full items-center gap-2 px-1">
                  {CLASS_CATEGORY.map((menu) => {
                    const isActive = category === menu.category;
                    return (
                      <button
                        key={menu.id}
                        type="button"
                        onClick={() => navigate({ pathname: "/", search: makeCategorySearch(menu.category) })}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition",
                          isActive
                          ? "border-foreground/30 bg-foreground/15 text-foreground"
                          : "border-border bg-foreground/5 text-foreground/60 hover:border-border/80 hover:text-foreground",
                        )}
                      >
                        {menu.icon}
                        <span>{menu.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCategorySlide("right")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-foreground/5 text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground"
                aria-label="카테고리 오른쪽으로 이동"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 제목 + 토글 - 검색 시 숨김 */}
          {!searchOpen && (
            <div className="flex flex-row items-stretch justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                  {isMyView ? "나의 글" : "커뮤니티"}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    ({CLASS_CATEGORY.find((c) => c.category === category)?.label ?? "전체"})
                  </span>
                </h4>
                <p className="text-sm md:text-base text-muted-foreground">
                  {isMyView
                    ? "내가 발행한 글, 독후감, 여행일지 등을 모아봤어요."
                    : "다른 분들이 전체 공개한 글을 구경해 보세요."}
                </p>
              </div>
              {/* 나의 글 / 커뮤니티 토글 */}
              <div className="shrink-0 rounded-xl border border-border dark:border-white/25 bg-foreground/8 dark:bg-white/8 p-1 flex">
                <div className="relative grid grid-cols-2 gap-0.5 flex-1">
                  <span
                    aria-hidden
                    className={cn(
                    "pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-lg bg-foreground dark:bg-white transition-transform duration-250 ease-out",
                      !isMyView ? "translate-x-full" : "translate-x-0",
                    )}
                  />
                  <button
                    type="button"
                    title="나의 글"
                    className={cn(
                      "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 sm:px-4",
                      !user?.id ? "cursor-not-allowed" : "cursor-pointer",
                    isMyView ? "text-background dark:text-black" : "text-foreground/50 dark:text-white/60 hover:text-foreground dark:hover:text-white",
                    )}
                    onClick={() => {
                      if (!user?.id) return;
                      const params = new URLSearchParams();
                      if (category) params.set("category", category);
                      navigate({ pathname: "/", search: params.toString() ? `?${params}` : "" });
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">나의 글</span>
                  </button>
                  <button
                    type="button"
                    title="커뮤니티"
                    className={cn(
                      "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 cursor-pointer sm:px-4",
                      !isMyView ? "text-background dark:text-black" : "text-foreground/50 dark:text-white/60 hover:text-foreground dark:hover:text-white",
                    )}
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set("view", VIEW_COMMUNITY);
                      if (category) params.set("category", category);
                      navigate({ pathname: "/", search: `?${params}` });
                    }}
                  >
                    <Globe2 className="h-4 w-4" />
                    <span className="hidden sm:inline">커뮤니티</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 검색 결과 / 일반 목록 */}
          {isSearchMode ? (
            <>
              <p className="text-sm text-white/50">
                <span className="font-medium text-white/70">"{debouncedQuery}"</span>
                {searchCategory && (
                  <span className="ml-1">· {CLASS_CATEGORY.find((c) => c.category === searchCategory)?.label}</span>
                )}
                <span className="ml-1">검색 결과 {searchData?.length ?? 0}개</span>
              </p>
              {searchLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                </div>
              ) : searchData && searchData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchData.map((t: Topic) => (
                    <NewTopicCard key={t.id} props={t} />
                  ))}
                </div>
              ) : (
                <div className="w-full min-h-60 flex items-center justify-center">
                  <p className="text-muted-foreground/50">검색 결과가 없습니다.</p>
                </div>
              )}
            </>
          ) : searchOpen ? (
            <div className="w-full min-h-60 flex items-center justify-center">
              <p className="text-muted-foreground/40 text-sm">검색어를 입력해 주세요</p>
            </div>
          ) : listLoading ? (
            <div className="min-h-120 grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonHotTopic />
              <SkeletonHotTopic />
            </div>
          ) : list.length > 0 ? (
            <div className="min-h-120 grid grid-cols-1 md:grid-cols-2 gap-6">
              {list.map((t: Topic) => (
                <NewTopicCard key={t.id} props={t} />
              ))}
            </div>
          ) : (
            <div className="w-full min-h-120 flex items-center justify-center">
              <p className="text-muted-foreground/50">
                {isMyView
                  ? category
                    ? "해당 카테고리의 내 글이 없습니다."
                    : "아직 발행한 글이 없어요. 글을 써 보세요."
                  : category
                    ? "해당 카테고리의 커뮤니티 글이 없습니다."
                    : "전체 공개된 글이 없습니다."}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
