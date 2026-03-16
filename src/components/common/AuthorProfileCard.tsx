import type { UserInfo } from "@/api";
import { Button, Card, CardContent, Separator } from "@/components/ui";
import { BadgeCheck, UserPlus, UserRoundSearch } from "lucide-react";

type AuthorProfileCardProps = {
  authorInfo: UserInfo | null | undefined;
};

function AuthorProfileCard({ authorInfo }: AuthorProfileCardProps) {
  return (
    <aside className="w-full lg:sticky lg:top-24 lg:w-52 lg:shrink-0">
      <Card className="rounded-2xl border-white/10 bg-[#121212] py-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <h3 className="truncate text-sm font-semibold text-white">{authorInfo?.nickname || "작성자"}</h3>
              </div>
              <p className="text-xs text-white/50">팔로우 0 명</p>
            </div>

            {authorInfo?.profile_image ? (
              <img
                src={authorInfo.profile_image}
                alt="author profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-xs text-white/50">
                {authorInfo?.nickname?.charAt(0) || "작"}
              </div>
            )}
          </div>

          <Separator className="my-4 bg-white/10" />

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full rounded-xl bg-white/6 text-xs font-medium text-white hover:bg-white/10"
            >
              <UserPlus className="h-3.5 w-3.5" />
              팔로우
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full rounded-xl bg-white/6 text-xs font-medium text-white hover:bg-white/10"
            >
              <UserRoundSearch className="h-3.5 w-3.5" />
              프로필
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

export { AuthorProfileCard };
