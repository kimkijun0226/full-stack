import { Button } from "@/components/ui";
import { ArrowLeft, Eye, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui";
import { useTopic, useTopicDetail, useUserInfo } from "@/hooks";
import { AppEditor, AuthorProfileCard, AppCommentSection } from "@/components/common";
import { toast } from "sonner";
import { topicApi } from "@/api";
import { queryClient } from "@/lib/queryClient";
import { topicKeys } from "@/constants/queryKeys";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("ko");

export function TopicDetail() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { id } = useParams();
  const topicId = Number(id);
  const { data: topic } = useTopicDetail(id);
  const { userInfo: authorInfo } = useUserInfo(topic?.author);
  const { deleteTopic } = useTopic();
  const viewCountedRef = useRef(false);

  useEffect(() => {
    // 이미 카운트했거나 본인 글이면 스킵
    if (!id || viewCountedRef.current) return;
    if (topic && topic.author === user?.id) return;
    if (!topic) return; // topic 로드 후 author 확인
    viewCountedRef.current = true;
    topicApi.incrementViewCount(id).then(() => {
      queryClient.invalidateQueries({ queryKey: topicKeys._def });
    });
  }, [id, topic, user?.id]);

  const handleDelete = async () => {
    deleteTopic.mutate(Number(id));
    navigate("/");
    toast.success("토픽이 삭제되었습니다.");
  };

  function formatCreatedAt(createdAt: string) {
    const date = dayjs(createdAt);
    return date.isSame(dayjs(), "day") ? date.fromNow() : date.format("YYYY. MM. DD");
  }

  return (
    <main className="w-full min-h-screen flex flex-col relative">
      <div
        className="relative w-full h-60 md:h-100 bg-cover bg-[50%_35%] bg-muted"
        style={{ backgroundImage: `url(${topic?.thumbnail})` }}
      >
        {/* 뒤로 가기 */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-border/60 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => navigate("/")}
          >
            <ArrowLeft />
          </Button>
          {/* 토픽을 작성한 사람의 user_id와 로그인한 사람의 user_id가 같은 경우에만 보이도록 한다. */}
          {topic?.author === user?.id && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="border-border/60 bg-primary/15 text-primary backdrop-blur-sm hover:bg-primary/25"
                onClick={() => navigate(`/topics/${id}/update`)}
              >
                <Pencil />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" className="!bg-red-800/50">
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말 해당 토픽을 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      삭제하시면 해당 토픽의 모든 내용이 영구적으로 삭제되어 복구할 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>닫기</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-800/50 text-white hover:bg-red-700/50" onClick={handleDelete}>
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
        {/* 좌, 우, 하단 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-background via-transparent to-transparent"></div>
      </div>

      <section className="relative w-full flex flex-col items-center -mt-40 px-4">
        <span className="mb-4 text-sm font-medium text-primary"># {topic?.category}</span>
        <h1 className="scroll-m-20 text-center font-extrabold tracking-tight text-xl sm:text-2xl md:text-4xl text-foreground drop-shadow-sm">
          {topic?.title}
        </h1>
        <Separator className="!w-6 my-6 bg-primary" />
        <span className="text-sm text-muted-foreground">{formatCreatedAt(topic?.created_at ?? "")}</span>
        <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
          <Eye size={14} />
          <span className="text-sm">{topic?.view_count ?? 0}</span>
        </div>
      </section>

      {/* 에디터 내용을 불러와 렌더링 */}
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-16 pb-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="min-w-0 flex-1 lg:max-w-[840px]">
          <div className="min-h-[600px]">
            {topic?.content && <AppEditor content={JSON.parse(topic?.content ?? "")} readonly />}
          </div>

          {/* 댓글 섹션 */}
          <div className="mt-8">
            <AppCommentSection topicId={topicId} topicAuthorId={topic?.author} topicTitle={topic?.title} />
          </div>
        </div>

        <AuthorProfileCard authorInfo={authorInfo} />
      </div>
    </main>
  );
}
