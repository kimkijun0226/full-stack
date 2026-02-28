import { NotebookPen, PencilLine } from "lucide-react";
import { AppDraftsDialog, AppSidebar } from "../components/common";
import { SkeletonHotTopic } from "../components/skeleton";
import { Button } from "../components/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { useTopic, useMyTopics, useCommunityTopics } from "@/hooks";
import { NewTopicCard } from "@/components/topics";
import type { Topic } from "@/types";

const VIEW_MY = "my";

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "";
  const view = searchParams.get("view") ?? VIEW_MY;
  const { user } = useAuthStore();
  const { createTopic, draftTopics } = useTopic();
  const { data: myTopics = [], isLoading: myLoading } = useMyTopics(category || undefined);
  const { data: communityTopics = [], isLoading: communityLoading } = useCommunityTopics(category || undefined);
  const draftCount = draftTopics.length;

  const isMyView = view === VIEW_MY;
  const list = isMyView ? myTopics : communityTopics;
  const listLoading = isMyView ? myLoading : communityLoading;

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
    <main className="w-full h-full min-h-screen flex p-6 gap-6">
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
      {/* 카테고리 사이드바 */}
      <div className="hidden lg:block lg:min-w-60 lg:w-60 lg:h-full">
        <AppSidebar />
      </div>
      {/* 글 목록 */}
      <section className="w-full lg:w-[calc(100%-264px)] flex flex-col gap-12">
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{isMyView ? "나의 글" : "커뮤니티"}</h4>
            <p className="md:text-base text-muted-foreground">
              {isMyView
                ? "내가 발행한 글, 독후감, 여행일지 등을 모아봤어요."
                : "다른 분들이 전체 공개한 글을 구경해 보세요."}
            </p>
          </div>

          {listLoading ? (
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
