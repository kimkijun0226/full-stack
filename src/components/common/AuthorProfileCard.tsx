import type { UserInfo } from "@/api";
import { Button, Card, CardContent, Separator } from "@/components/ui";
import { useFollow, useGetOrCreateRoom } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { BadgeCheck, MessageCircle, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthorProfileCardProps = {
  authorInfo: UserInfo | null | undefined;
};

function AuthorProfileCard({ authorInfo }: AuthorProfileCardProps) {
  const [isImageError, setIsImageError] = useState(false);
  const hasProfileImage = !!authorInfo?.profile_image && !isImageError;
  const { user } = useAuthStore();
  const { isFollowing, followerCount, toggleFollow, isLoading } = useFollow(authorInfo?.id ?? "");
  const navigate = useNavigate();
  const getOrCreate = useGetOrCreateRoom();

  const handleDm = () => {
    if (!authorInfo?.id) return;
    getOrCreate.mutate(authorInfo.id, {
      onSuccess: (roomId) => navigate(`/dm?room=${roomId}`),
    });
  };

  return (
    <aside className="w-full lg:sticky lg:top-[68px] lg:w-52 lg:shrink-0">
      <Card className="rounded-2xl border-border bg-card py-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <h3 className="truncate text-sm font-semibold text-foreground">{authorInfo?.nickname || "작성자"}</h3>
              </div>
              <p className="text-xs text-muted-foreground">팔로우 {followerCount} 명</p>
            </div>

            {hasProfileImage ? (
              <img
                src={authorInfo.profile_image ?? undefined}
                alt="author profile"
                className="h-10 w-10 rounded-full object-cover"
                onError={() => setIsImageError(true)}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/8 text-xs text-muted-foreground">
                {authorInfo?.nickname?.charAt(0) || "작"}
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={cn(
                "w-full rounded-xl text-xs font-medium transition",
                isFollowing
                  ? "bg-red-500/15 text-red-500 dark:text-red-400 hover:bg-red-500/25"
                  : "bg-foreground/6 text-foreground hover:bg-foreground/10",
              )}
              onClick={toggleFollow}
              disabled={isLoading || user?.id === authorInfo?.id}
            >
              {isFollowing ? <UserMinus className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
              {isFollowing ? "언팔로우" : "팔로우"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full rounded-xl bg-foreground/6 text-xs font-medium text-foreground hover:bg-foreground/10"
              onClick={handleDm}
              disabled={getOrCreate.isPending || user?.id === authorInfo?.id}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              DM
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export { AuthorProfileCard };
