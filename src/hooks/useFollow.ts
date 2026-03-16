import { followApi } from "@/api";
import { useAuthStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useFollow = (targetUserId: string) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // 팔로우 여부 조회
  const isFollowing = useQuery({
    queryKey: ["follow", "isFollowing", targetUserId],
    queryFn: () => followApi.checkIsFollowing(targetUserId),
    enabled: !!user?.id && !!targetUserId && user.id !== targetUserId,
  });

  // 팔로워 수 조회
  const followerCount = useQuery({
    queryKey: ["follow", "followerCount", targetUserId],
    queryFn: () => followApi.getFollowerCount(targetUserId),
    enabled: !!targetUserId,
  });

  // 팔로우 하기
  const followMutation = useMutation({
    mutationFn: () => followApi.follow(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow", "isFollowing", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["follow", "followerCount", targetUserId] });
      toast.success("팔로우 했습니다.");
    },
    onError: () => toast.error("팔로우에 실패했습니다."),
  });

  // 언팔로우 하기
  const unfollowMutation = useMutation({
    mutationFn: () => followApi.unfollow(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow", "isFollowing", targetUserId] });
      queryClient.invalidateQueries({ queryKey: ["follow", "followerCount", targetUserId] });
      toast.success("언팔로우 했습니다.");
    },
    onError: () => toast.error("언팔로우에 실패했습니다."),
  });

  // 팔로우/언팔로우 토글
  const toggleFollow = () => {
    if (isFollowing.data) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return {
    isFollowing: isFollowing.data ?? false,
    followerCount: followerCount.data ?? 0,
    toggleFollow,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
};
