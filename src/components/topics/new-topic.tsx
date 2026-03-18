import { useNavigate } from "react-router-dom";
import { Card, Separator } from "../ui";
import { Eye, Heart, Share2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import type { Topic } from "@/types";
import { useShareTopic, useToggleTopicLike, useTopicLike, useUserInfo } from "@/hooks";
import { toast } from "sonner";
import { useAuthStore } from "@/stores";

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
  const { userInfo: authorInfo } = useUserInfo(props?.author);
  const { data } = useTopicLike(props.id);
  const { user } = useAuthStore();
  const toggleLike = useToggleTopicLike(props.id, props?.author, props.title);
  const shareTopic = useShareTopic(props.id);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    toggleLike.mutate(data?.isLiked ?? false);
  };

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    shareTopic.mutate(window.location.href, {
      onSuccess: () => toast.success("링크가 복사되었습니다!"),
    });
  };

  const isPublic = props.visibility === "PUBLIC";

  return (
    <Card
      className={`w-full h-fit p-4 gap-4 cursor-pointer hover:scale-102 transition-all duration-200 ease-out bg-card ${
        isPublic
          ? "border border-[#4472e3]/40 shadow-[0_2px_10px_rgba(68,114,227,0.30)] hover:shadow-[0_3px_14px_rgba(68,114,227,0.48)]"
          : "border border-[#7c79c7]/30 shadow-[0_2px_10px_rgba(124,121,199,0.24)] hover:shadow-[0_3px_14px_rgba(124,121,199,0.40)]"
      }`}
      onClick={() => navigate(`/topics/${props.id}/detail`)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 flex flex-col items-start gap-4">
          {/* 제목 */}
          <h3 className="h-12 text-base font-semibold tracking-tight line-clamp-2">
            <p>{props.title}</p>
          </h3>
          {/* 본문 */}
          <p className="line-clamp-3 text-muted-foreground text-sm">{extractTextFromContent(props.content)}</p>
        </div>
        <img
          src={props.thumbnail || ""}
          alt="@THUMBNAIL"
          className="w-[130px] h-[130px] aspect-square rounded-lg object-cover"
        />
      </div>
      <Separator />
      <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <img
            src={authorInfo?.profile_image || undefined}
            alt="author profile"
            className="w-5 h-5 rounded-full object-cover shrink-0"
          />
          <p className="text-xs truncate min-w-0">{authorInfo?.nickname}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span className="text-xs">{props.view_count ?? 0}</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform duration-200 ease-out"
            onClick={(e) => handleLike(e)}
          >
            <Heart size={13} className={`text-rose-400 ${data?.isLiked ? "fill-rose-400" : ""}`} />
            <span className="text-xs">{data?.count || 0}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 cursor-pointer hover:scale-110 transition-transform duration-200 ease-out"
            onClick={(e) => handleShare(e)}
          >
            <Share2 size={13} className="text-muted-foreground" />
            <span className="text-xs">{props.share_count || 0}</span>
          </button>
          <span className="text-xs ml-auto">{formatCreatedAt(props.created_at)}</span>
        </div>
      </div>
    </Card>
  );
}
