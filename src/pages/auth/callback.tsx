import supabase from "@/lib/supabase";
import { useAuthStore } from "@/stores";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        console.error("세션에 사용자 정보가 없습니다.");
        return;
      }

      const user = session.user;

      if (!user.id) {
        console.error("사용자 ID가 없습니다.");
        return;
      }

      try {
        const { data: existing } = await supabase.from("user").select("*").eq("id", user.id).single();

        if (!existing) {
          const { error: insertError } = await supabase.from("user").insert([
            {
              id: user.id,
              service_agreed: true,
              privacy_agreed: true,
              marketing_agreed: false,
            },
          ]);

          if (insertError) {
            console.error("사용자 정보 삽입 중 오류 발생: ", insertError);
            return;
          }
          return;
        }

        setUser({
          id: user.id,
          email: user.email ?? "알 수 없는 사용자",
          role: user.role ?? "",
        });

        navigate("/");
      } catch (error) {
        console.error("사용자 정보 설정 중 오류 발생: ", error);
        return;
      }
    });

    // 언마운트시, 구독 해지
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return <main className="w-full h-full min-h-screen flex items-center justify-center">로그인을 진행 중입니다.</main>;
}
