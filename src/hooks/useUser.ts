import { userApi } from "@/api";
import { queryKeys } from "@/constants/queryKeys";
import { useAuthStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  const { user } = useAuthStore();

  const userInfoQuery = useQuery({
    queryKey: queryKeys.user.info(user?.id || "").queryKey,
    queryFn: () => userApi.getUserInfo(user?.id || ""),
    enabled: !!user?.id,
  });

  return {
    userInfo: userInfoQuery.data,
  };
};
