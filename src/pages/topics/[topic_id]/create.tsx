import { topicApi } from "@/api";
import { AppEditor, AppFileUpload } from "@/components/common";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { SelectGroup, SelectLabel } from "@/components/ui/select";
import { TOPIC_CATEGORY } from "@/constants/category.constant";
import { useTopic, useTopicDetail } from "@/hooks";
import { useAuthStore } from "@/stores";
import { TOPIC_STATUS } from "@/types";
import type { Block } from "@blocknote/core";
import { ArrowLeft, Asterisk, BookOpenCheck, ImageOff, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function CreateTopic() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data: topic, isLoading: topicLoading } = useTopicDetail(id);
  const {
    topic: { updateTopic },
  } = useTopic();

  const [title, setTitle] = useState(topic?.title ?? "");
  const [content, setContent] = useState<Block[]>(topic?.content ? JSON.parse(topic.content) : []);
  const [category, setCategory] = useState<string>(topic?.category ?? "");
  const [thumbnail, setThumbnail] = useState<File | string | null>(topic?.thumbnail ?? null);

  const resolveThumbnailUrl = async (): Promise<string | null> => {
    if (!thumbnail) return null;
    if (thumbnail instanceof File) return topicApi.uploadThumbnail(thumbnail);
    return thumbnail;
  };

  const handleSave = async () => {
    if (!id || !user) return;
    if (!title && !content.length && !category && !thumbnail) {
      toast.warning("제목, 본문, 카테고리, 썸네일을 기입하세요.");
      return;
    }
    const thumbnailUrl = await resolveThumbnailUrl();
    updateTopic.mutate(
      {
        id: Number(id),
        payload: {
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user.id,
          status: TOPIC_STATUS.TEMP,
        },
      },
      {
        onSuccess: () => toast.success("토픽을 임시 저장 하였습니다."),
      },
    );
  };

  const handlePublish = async () => {
    if (!id || !user) return;
    if (!title || !content.length || !category || !thumbnail) {
      toast.warning("제목, 본문, 카테고리, 썸네일은 필수값 입니다.");
      return;
    }
    const thumbnailUrl = await resolveThumbnailUrl();
    if (!thumbnailUrl) {
      toast.warning("썸네일을 등록해주세요.");
      return;
    }
    updateTopic.mutate(
      {
        id: Number(id),
        payload: {
          title,
          content: JSON.stringify(content),
          category,
          thumbnail: thumbnailUrl,
          author: user.id,
          status: TOPIC_STATUS.PUBLISH,
        },
      },
      {
        onSuccess: () => {
          toast.success("토픽을 발행 하였습니다.");
          navigate(`/topics/${id}`);
        },
      },
    );
  };

  const handleBack = () => navigate("/");

  if (id && topicLoading) return null;

  return (
    <main className="w-full h-full min-h-[1024px] flex gap-6 p-6">
      <div className="fixed right-1/2 bottom-10 translate-x-1/2 z-20 flex items-center gap-2">
        <Button type="button" variant="outline" onClick={handleBack}>
          <ArrowLeft />
        </Button>
        <Button type="button" variant="outline" className="w-22 !bg-yellow-800/50" onClick={handleSave}>
          <Save />
          임시 저장
        </Button>
        <Button type="button" variant="outline" className="w-22 !bg-emerald-800/50" onClick={handlePublish}>
          <BookOpenCheck />
          발행
        </Button>
      </div>

      <section className="w-3/4 h-full flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#F96859] font-semibold">Step 01</span>
          <span className="font-semibold text-base">토픽 작성하기</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">제목</Label>
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="토픽 제목을 입력해주세요."
            className="h-16 pl-6 !text-lg placeholder:text-lg placeholder:font-semibold border-0"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">본문</Label>
          </div>
          <AppEditor content={content} setContent={setContent} />
        </div>
      </section>

      <section className="w-1/4 h-full flex flex-col gap-6">
        <div className="flex flex-col pb-6 border-b">
          <span className="text-[#F96859] font-semibold">Step 02</span>
          <span className="font-semibold text-base">카테고리 및 썸네일 등록</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">카테고리</Label>
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="토픽(주제) 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>카테고리(주제)</SelectLabel>
                {TOPIC_CATEGORY.map((cat) => (
                  <SelectItem key={cat.id} value={cat.category}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <Asterisk size={14} className="text-[#F96859]" />
            <Label className="text-muted-foreground">썸네일</Label>
          </div>
          <AppFileUpload file={thumbnail} setFile={setThumbnail} />
          <Button variant="outline" className="border-0" onClick={() => setThumbnail(null)}>
            <ImageOff />
            썸네일 제거
          </Button>
        </div>
      </section>
    </main>
  );
}
