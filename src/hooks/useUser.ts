import { userApi } from "@/api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  const { user } = useAuthStore();
  return useUserInfo(user?.id);
};

export const useUserInfo = (userId?: string | null) => {
  const userInfoQuery = useQuery({
    queryKey: queryKeys.user.info(userId || "").queryKey,
    queryFn: async () => {
      if (!userId) return null;

      try {
        return await userApi.getUserInfo(userId);
      } catch {
        // 다른 작성자 정보가 조회 불가한 경우에도 상세 화면은 계속 렌더링한다.
        return null;
      }
    },
    enabled: !!userId,
  });

  return {
    userInfo: userInfoQuery.data,
  };
};
