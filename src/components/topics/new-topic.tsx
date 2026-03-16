import { useNavigate } from "react-router-dom";
import { Card, Separator } from "../ui";
import { CaseSensitive } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import type { Topic } from "@/types";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface Props {
  props: Topic;
}

interface ContentBlock {
  content?: Array<{ text?: string }>;
}

function extractTextFromContent(content: string | ContentBlock[], maxChars = 200) {
  try {
    const parsed: unknown = typeof content === "string" ? JSON.parse(content) : content;

    if (!Array.isArray(parsed)) {
      console.warn("content 데이터 타입이 배열이 아닙니다.");
      return "";
    }

    const blocks = parsed as ContentBlock[];
    let result = "";

    for (const block of blocks) {
      if (Array.isArray(block.content)) {
        for (const child of block.content) {
          if (child?.text) {
            result += child.text + " ";

            if (result.length >= maxChars) {
              return result.slice(0, maxChars) + "...";
            }
          }
        }
      }
    }
    return result.trim();
  } catch (error) {
    console.log("콘텐츠 파싱 실패: ", error);
    return "";
  }
}

function formatCreatedAt(createdAt: string) {
  const date = dayjs(createdAt);
  return date.isSame(dayjs(), "day") ? date.fromNow() : date.format("YYYY. MM. DD");
}

export function NewTopicCard({ props }: Props) {
  const navigate = useNavigate();

  return (
    <Card
      className="w-full h-fit p-4 gap-4 cursor-pointer hover:scale-102 transition-transform duration-200 ease-out"
      onClick={() => navigate(`/topics/${props.id}/detail`)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 flex flex-col items-start gap-4">
          {/* 썸네일과 제목 */}
          <h3 className="h-16 text-base font-semibold tracking-tight line-clamp-2">
            <CaseSensitive size={16} className="text-muted-foreground" />
            <p>{props.title}</p>
          </h3>
          {/* 본문 */}
          <p className="line-clamp-3 text-muted-foreground">{extractTextFromContent(props.content)}</p>
        </div>
        <img
          src={props.thumbnail || ""}
          alt="@THUMBNAIL"
          className="w-[140px] h-[140px] aspect-square rounded-lg object-cover"
        />
      </div>
      <Separator />
      <div className="w-full flex items-center justify-between">
        <p>닉네임: 123</p>
        <p>{formatCreatedAt(props.created_at)}</p>
      </div>
    </Card>
  );
}
