import { useRef, useState, useEffect } from "react";
import { ChevronDown, NotebookPen, PencilLine, Search, X } from "lucide-react";
import { AppDraftsDialog, AppSidebar } from "../components/common";
import { SkeletonHotTopic } from "../components/skeleton";
import { Button } from "../components/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, useSearchStore, useViewStore } from "@/stores";
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
  const { isCommunityView } = useViewStore();
  const { createTopic, draftTopics } = useTopic();
  const { data: myTopics = [], isLoading: myLoading } = useMyTopics(category || undefined);
  const { data: communityTopics = [], isLoading: communityLoading } = useCommunityTopics(category || undefined);
  const draftCount = draftTopics.length;

  const isMyView = view === VIEW_MY;
  const list = isMyView ? myTopics : communityTopics;
  const listLoading = isMyView ? myLoading : communityLoading;
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchCatRef = useRef<HTMLDivElement>(null);

  const { searchOpen, setSearchOpen } = useSearchStore();
  const [inputValue, setInputValue] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchCatOpen, setSearchCatOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const isSearchMode = debouncedQuery.trim().length > 0;
  const { data: searchData, isLoading: searchLoading } = useSearchTopics(debouncedQuery, searchCategory || undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 300);
    return () => clearTimeout(t);
  }, [inputValue]);

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

  useEffect(() => {
    if (!searchCatOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchCatRef.current && !searchCatRef.current.contains(e.target as Node)) {
        setSearchCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchCatOpen]);

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
    <main className="w-full flex-1 min-h-screen lg:flex ">
      <div className="fixed right-1/2 bottom-5 lg:bottom-10 translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full border border-violet-200/60 bg-white/65 dark:border-sky-500/15 dark:bg-slate-950/40 shadow-2xl shadow-black/10 ring-1 ring-violet-300/15 dark:ring-sky-500/10 backdrop-blur-xl supports-backdrop-filter:bg-white/70 supports-backdrop-filter:dark:bg-slate-950/45">
        <Button
          variant="ghost"
          className={`relative overflow-hidden py-5 px-6 rounded-full border text-white shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-300 ease-out before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/25 before:to-white/0 before:translate-x-[-130%] hover:before:translate-x-[130%] before:transition-transform before:duration-700 before:ease-out ${
            isCommunityView
              ? "border-blue-400/45 bg-linear-to-b from-[#5b8ef0]/90 to-[#3a65c8]/80 shadow-blue-400/25 hover:border-blue-300/70 hover:brightness-110 hover:shadow-[0_10px_28px_-6px_rgba(68,114,227,0.5)]"
              : "border-violet-400/45 bg-linear-to-b from-[#9d9ad8]/90 to-[#5e5baa]/80 shadow-violet-400/25 hover:border-violet-300/70 hover:brightness-110 hover:shadow-[0_10px_28px_-6px_rgba(124,121,199,0.5)]"
          }`}
          onClick={handleRoute}
        >
          <PencilLine />글 쓰기
        </Button>
        {user?.id ? (
          <AppDraftsDialog>
            <div className="relative">
              <Button
                variant="ghost"
                className={`relative overflow-hidden rounded-full w-10 h-10 border dark:border-sky-500/15 dark:bg-white/10 shadow-sm shadow-black/5 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-300 ease-out before:absolute before:inset-0 before:bg-linear-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-130%] hover:before:translate-x-[130%] before:transition-transform before:duration-700 before:ease-out ${
                  isCommunityView
                    ? "border-blue-200/60 bg-white/55 text-blue-500 dark:text-foreground hover:bg-white/75 hover:border-blue-300/80 hover:shadow-[0_10px_28px_-8px_rgba(68,114,227,0.4)]"
                    : "border-violet-200/60 bg-white/55 text-primary dark:text-foreground hover:bg-white/75 hover:border-violet-300/80 hover:shadow-[0_10px_28px_-8px_rgba(124,121,199,0.4)]"
                }`}
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
      {/* 카테고리 사이드바 - YouTube처럼 fixed 좌측 */}
      <aside
        className={`hidden lg:flex fixed left-0 top-[60px] bottom-0 w-56 flex-col overflow-y-auto bg-background pt-4 pb-6 px-2${searchOpen ? " !hidden" : ""}`}
      >
        <AppSidebar />
      </aside>
      {/* 사이드바 자리 확보용 spacer */}
      {!searchOpen && <div className="hidden lg:block shrink-0 w-56" />}
      {/* 글 목록 */}
      <section className="flex-1 min-w-0 overflow-hidden flex flex-col gap-12 px-2 pt-2 pb-6">
        <div className="w-full flex flex-col gap-2">
          {/* 검색 패널 */}
          {searchOpen && (
            <div ref={searchPanelRef} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center rounded-xl border border-border bg-foreground/5 focus-within:border-primary/40 transition overflow-visible">
                {/* 카테고리 드롭다운 */}
                <div ref={searchCatRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setSearchCatOpen((v) => !v)}
                    className="inline-flex items-center gap-1 h-[42px] pl-3.5 pr-2 text-xs font-medium text-foreground/70 hover:text-primary transition"
                  >
                    <span className="max-w-[52px] truncate">
                      {searchCategory ? CLASS_CATEGORY.find((c) => c.category === searchCategory)?.label : "전체"}
                    </span>
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform duration-150", searchCatOpen && "rotate-180")}
                    />
                  </button>
                  {searchCatOpen && (
                    <div className="absolute left-0 top-full mt-1.5 z-50 w-40 rounded-xl border border-border bg-card py-1 shadow-xl shadow-black/10">
                      {CLASS_CATEGORY.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSearchCategory(searchCategory === cat.category ? "" : cat.category);
                            setSearchCatOpen(false);
                          }}
                          className={cn(
                            "w-full inline-flex items-center gap-2 px-3 py-2 text-xs transition [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0",
                            searchCategory === cat.category
                              ? "bg-primary/8 text-primary font-semibold"
                              : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                          )}
                        >
                          {cat.icon}
                          <span>{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* 구분선 */}
                <div className="h-5 w-px bg-border shrink-0" />
                {/* 텍스트 인풋 */}
                <div className="relative flex flex-1 items-center">
                  <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="제목, 닉네임, 이메일로 검색..."
                    className="w-full bg-transparent py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground outline-none"
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
              </div>
            </div>
          )}

          {/* 제목 - 검색 시 숨김 */}
          {/* {!searchOpen && (
            <div className="flex flex-col gap-1">
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                {isMyView ? "나의 글" : "커뮤니티"}
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({CLASS_CATEGORY.find((c) => c.category === category)?.label ?? "전체"})
                </span>
              </h4>
            </div>
          )} */}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                  <SkeletonHotTopic />
                </div>
              ) : searchData && searchData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              <SkeletonHotTopic />
              <SkeletonHotTopic />
              <SkeletonHotTopic />
            </div>
          ) : list.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
