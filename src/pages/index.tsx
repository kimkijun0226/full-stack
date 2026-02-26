import { CircleSmall, NotebookPen, PencilLine } from "lucide-react";
import { AppDraftsDialog, AppSidebar } from "../components/common";
import { SkeletonHotTopic, SkeletonNewTopic } from "../components/skeleton";
import { Button } from "../components/ui";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { useTopic } from "@/hooks";

function App() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { topic } = useTopic();

  const handleRoute = async () => {
    if (!user.id || !user.email || !user.role) {
      toast(
        <>
          토픽 작성은 로그인 후 이용 가능합니다.
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
      const created = await topic.createTopic.mutateAsync({
        author: user.id,
        status: null,
        title: null,
        content: null,
        category: null,
        thumbnail: null,
      });
      toast.success("토픽을 생성 하였습니다.");
      navigate(`/topics/${created.id}/create`);
    } catch (error) {
      console.log(error);
      toast.error("토픽 생성에 실패했습니다.");
    }
  };

  return (
    <main className="w-full h-full min-h-screen flex p-6 gap-6">
      <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 items-center flex gap-2">
        <Button variant={"destructive"} className="!py-5 !px-6 rounded-full" onClick={handleRoute}>
          <PencilLine />
          나만의 토픽 작성
        </Button>
        {user.id && (
          <AppDraftsDialog>
            <div className="relative">
              <Button variant={"outline"} className="rounded-full w-10 h-10">
                <NotebookPen />
              </Button>
              <CircleSmall size={14} className="absolute top-0 right-0 text-red-500" fill="#EF4444" />
            </div>
          </AppDraftsDialog>
        )}
      </div>
      {/* 카테고리 사이드바 */}
      <AppSidebar />
      {/* 토픽 콘텐츠 */}
      <section className="flex-1 flex flex-col gap-12">
        {/* 핫토픽 */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src="/assets/gifs/gif-001.gif" alt="@IMG" className="w-7 h-7" />
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">HOT 토픽</h4>
            </div>
            <p className="md:text-base text-muted-foreground">
              지금 가장 주목받는 주제들을 살펴보고, 다양한 관점의 인사이트를 얻어보세요.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {topic.publishedLoading ? (
              <>
                <SkeletonHotTopic />
                <SkeletonHotTopic />
                <SkeletonHotTopic />
                <SkeletonHotTopic />
              </>
            ) : (
              topic.publishedTopics.slice(0, 4).map((t) => <SkeletonHotTopic key={t.id} />)
            )}
          </div>
        </div>
        {/* 뉴 토픽 */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <img src="/assets/gifs/gif-002.gif" alt="@IMG" className="w-7 h-7" />
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">NEW 토픽</h4>
            </div>
            <p className="md:text-base text-muted-foreground">
              새로운 시선으로, 새로운 이야기를 시작하세요. 지금 바로 당신만의 토픽을 시작해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {topic.publishedLoading ? (
              <>
                <SkeletonNewTopic />
                <SkeletonNewTopic />
                <SkeletonNewTopic />
                <SkeletonNewTopic />
              </>
            ) : (
              topic.publishedTopics.slice(0, 4).map((t) => <SkeletonNewTopic key={t.id} />)
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
