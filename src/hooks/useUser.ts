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
    queryFn: () => userApi.getUserInfo(userId || ""),
    enabled: !!userId,
  });

  return {
    userInfo: userInfoQuery.data,
  };
};
