import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
} from "@/components/ui";
import { useTopic } from "@/hooks";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

interface AppDraftsDialogProps {
  children: React.ReactNode;
}

export function AppDraftsDialog({ children }: AppDraftsDialogProps) {
  const { topic } = useTopic();
  const { draftTopics } = topic;
  const navigate = useNavigate();

  const handleDraftClick = (id: number) => {
    navigate(`/topics/${id}/create`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>임시 저장된 토픽</DialogTitle>
          <DialogDescription>임시 저장된 토픽 목록 입니다. 이어서 작성하거나 삭제할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          <div className="flex items-center gap-2">
            <p>임시 저장</p>
            <p className="text-base text-green-600 -mr-[6px]">{draftTopics.length || 0}</p>
            <p>건</p>
          </div>

          <Separator />

          {draftTopics.length === 0 ? (
            <div className="min-h-60 flex items-center justify-center">
              <p className="text-muted-foreground/50">조회 가능한 정보가 없습니다.</p>
            </div>
          ) : (
            <div className="min-h-60 h-60 flex flex-col items-center overflow-y-scroll ">
              {draftTopics.map((draft, index) => {
                return (
                  <div
                    key={draft.id}
                    className="w-full flex items-center justify-between hover:bg-card/50 gap-10 py-2 px-4 rounded-md cursor-pointer"
                    onClick={() => handleDraftClick(draft.id)}
                  >
                    <div className="flex items-start gap-2">
                      <Badge className="w-5 h-5 mt-[3px] rounded-sm  aspect-square bg-[#E25F24] hover:bg-[#E25F24] text-foreground">
                        {index + 1}
                      </Badge>
                      <div className="flex flex-col">
                        <p className="line-clamp-1">{draft.title || "등록된 제목이 없습니다."}</p>
                        <p className="text-xs text-muted-foreground/50">
                          작성일: {dayjs(draft.created_at).format("YYYY. MM. DD")}
                        </p>
                      </div>
                    </div>
                    <Badge variant={"outline"}>작성중</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant={"outline"} className="border-0">
              닫기
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
