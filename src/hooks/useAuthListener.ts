import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { userApi } from "@/api";
import { queryKeys } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";

export default function useAuthListener() {
  const { setUser } = useAuthStore();
  const { supabaseGetSession } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const session = await supabaseGetSession.mutateAsync();
      if (session) {
        setUser({
          id: session.id,
          email: session.email || "",
          role: session.role || "",
        });
      }
    };
    checkSession();

    // 실시간으로 세션 변경 감지
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userId = session.user.id;
        setUser({
          id: userId,
          email: session.user.email || "",
          role: session.user.role || "",
        });
        // navigate 전에 유저 정보를 캐시에 미리 채워 이미지 깜빡임 방지
        queryClient.prefetchQuery({
          queryKey: queryKeys.user.info(userId).queryKey,
          queryFn: () => userApi.getUserInfo(userId),
        });
      } else {
        setUser(null);
        queryClient.removeQueries({ queryKey: queryKeys.user._def });
      }
    });

    return () => authListener?.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
