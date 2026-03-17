import { useState } from "react";
import { useAuthStore } from "@/stores";
import { useComments, useCreateComment, useDeleteComment, useToggleCommentLike } from "@/hooks";
import type { Comment } from "@/api/comment";
import { Button } from "@/components/ui";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { toast } from "sonner";

dayjs.extend(relativeTime);
dayjs.locale("ko");

interface AppCommentSectionProps {
  topicId: number;
  topicAuthorId?: string;
}

export function AppCommentSection({ topicId, topicAuthorId }: AppCommentSectionProps) {
  const { user } = useAuthStore();
  const { data: comments = [], isLoading } = useComments(topicId);
  const createComment = useCreateComment(topicId, topicAuthorId);
  const deleteComment = useDeleteComment(topicId);
  const toggleLike = useToggleCommentLike(topicId);

  const [newComment, setNewComment] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const topLevel = comments.filter((c) => c.parent_id === null);
  const getReplies = (parentId: number) => comments.filter((c) => c.parent_id === parentId);

  const handleSubmit = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    createComment.mutate(
      { content: trimmed },
      {
        onSuccess: () => setNewComment(""),
        onError: () => toast.error("댓글 작성에 실패했습니다."),
      },
    );
  };

  const handleReplySubmit = (parentId: number) => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    createComment.mutate(
      { content: trimmed, parent_id: parentId },
      {
        onSuccess: () => {
          setReplyContent("");
          setReplyTargetId(null);
        },
        onError: () => toast.error("답글 작성에 실패했습니다."),
      },
    );
  };

  const handleDelete = (commentId: number) => {
    deleteComment.mutate(commentId, {
      onError: () => toast.error("댓글 삭제에 실패했습니다."),
    });
  };

  const handleLike = (comment: Comment) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    toggleLike.mutate({
      commentId: comment.id,
      isLiked: comment.is_liked,
      commentAuthorId: comment.author?.id,
    });
  };

  return (
    <div className="w-full">
      <h3 className="mb-4 text-base font-semibold text-foreground">
        댓글 <span className="text-foreground/40">{comments.length}</span>
      </h3>

      {/* 댓글 입력 */}
      <CommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handleSubmit}
        isLoading={createComment.isPending}
        placeholder="댓글을 작성해주세요..."
        userAvatar={undefined}
      />

      {/* 댓글 목록 */}
      <div className="mt-6 flex flex-col gap-0">
        {isLoading && <p className="py-6 text-center text-sm text-foreground/40">댓글을 불러오는 중...</p>}
        {!isLoading && topLevel.length === 0 && (
          <p className="py-6 text-center text-sm text-foreground/40">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
        )}
        {topLevel.map((comment) => (
          <div key={comment.id} className="border-b border-border last:border-0">
            <CommentItem
              comment={comment}
              currentUserId={user?.id}
              onLike={() => handleLike(comment)}
              onDelete={() => handleDelete(comment.id)}
              onReply={() => setReplyTargetId(replyTargetId === comment.id ? null : comment.id)}
            />

            {/* 답글 목록 */}
            {getReplies(comment.id).map((reply) => (
              <div key={reply.id} className="ml-10 border-l-2 border-border pl-4">
                <CommentItem
                  comment={reply}
                  currentUserId={user?.id}
                  onLike={() => handleLike(reply)}
                  onDelete={() => handleDelete(reply.id)}
                  isReply
                />
              </div>
            ))}

            {/* 답글 입력 */}
            {replyTargetId === comment.id && (
              <div className="ml-10 mb-3 border-l-2 border-border pl-4">
                <CommentInput
                  value={replyContent}
                  onChange={setReplyContent}
                  onSubmit={() => handleReplySubmit(comment.id)}
                  onCancel={() => {
                    setReplyTargetId(null);
                    setReplyContent("");
                  }}
                  isLoading={createComment.isPending}
                  placeholder="답글을 작성해주세요..."
                  autoFocus
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 입력 컴포넌트 ─── */
interface CommentInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isLoading: boolean;
  placeholder: string;
  autoFocus?: boolean;
  userAvatar?: string;
}

function CommentInput({ value, onChange, onSubmit, onCancel, isLoading, placeholder, autoFocus }: CommentInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-ring"
        rows={2}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
        }}
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
        )}
        <Button size="sm" onClick={onSubmit} disabled={!value.trim() || isLoading}>
          {isLoading ? "등록 중..." : "등록"}
        </Button>
      </div>
    </div>
  );
}

/* ─── 댓글 아이템 컴포넌트 ─── */
interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onLike: () => void;
  onDelete: () => void;
  onReply?: () => void;
  isReply?: boolean;
}

function CommentItem({ comment, currentUserId, onLike, onDelete, onReply, isReply }: CommentItemProps) {
  const isOwner = comment.author_id === currentUserId;
  const avatarUrl = comment.author?.profile_image;
  const nickname = comment.author?.nickname ?? "알 수 없음";

  return (
    <div className="flex gap-3 py-3">
      {/* 아바타 */}
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-accent">
        {avatarUrl ? (
          <img src={avatarUrl} alt={nickname} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-foreground/60">
            {nickname.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{nickname}</span>
          <span className="text-xs text-foreground/40">{dayjs(comment.created_at).fromNow()}</span>
        </div>
        <p className="mt-0.5 text-sm text-foreground/80 whitespace-pre-line">{comment.content}</p>

        {/* 액션 버튼 */}
        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            className={cn(
              "flex items-center gap-1 text-xs transition",
              comment.is_liked ? "text-rose-500" : "text-foreground/40 hover:text-foreground/70",
            )}
            onClick={onLike}
          >
            <Heart className={cn("h-3.5 w-3.5", comment.is_liked && "fill-rose-500")} />
            {comment.like_count > 0 && <span>{comment.like_count}</span>}
          </button>

          {!isReply && onReply && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-foreground/40 transition hover:text-foreground/70"
              onClick={onReply}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>답글</span>
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-foreground/30 transition hover:text-rose-500"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
