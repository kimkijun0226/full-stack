import { Skeleton } from "../ui";

function SkeletonHotTopic() {
  return (
    <div className="w-full min-w-50 flex flex-col gap-2">
      <Skeleton className="w-full h-70" />
      <div className="flex items-center gap-2">
        <Skeleton className="w-10 h-10 border-radius-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="w-32 h-3" />
          <Skeleton className="w-20 h-[14px]" />
        </div>
      </div>
    </div>
  );
}

export { SkeletonHotTopic };
