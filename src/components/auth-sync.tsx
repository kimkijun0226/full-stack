import { useEffect } from "react";
import { authApi } from "@/api";
import { useAuthStore } from "@/stores";
import supabase from "@/lib/supabase";

/**
 * 앱 전역에서 Supabase 인증 상태를 스토어와 동기화합니다.
 * - 앱 로드/구글 리다이렉트 후: INITIAL_SESSION으로 세션 복원
 * - 로그인/회원가입 후: SIGNED_IN으로 스토어 갱신
 * - 로그아웃: SIGNED_OUT으로 스토어 null
 */
export function AuthSync() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const syncUser = async () => {
      const user = await authApi.supabaseGetSession();
      setUser(user);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }
      if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) {
        await syncUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return null;
}
