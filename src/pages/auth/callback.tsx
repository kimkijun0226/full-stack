import { useEffect } from "react";
import { useNavigate } from "react-router";
import supabase from "@/lib/supabase";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // 1. 현재 세션 정보 가져오기
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      // 2. 세션 오류 또는 세션이 없는 경우 처리
      if (sessionError || !session) {
        console.error("세션 처리 오류, 다시 로그인 페이지로 리디렉션합니다.", sessionError);
        toast.error("로그인 처리 중 오류가 발생했습니다.");

        // 로그인 페이지로 리디렉션
        navigate("/sign-in");
        return;
      }

      // 3. 세션이 정상인 경우: DB 삽입 로직은 이미 Trigger가 처리했으므로,
      // 별도의 public.user 삽입 코드 없이 바로 메인 페이지로 리디렉션합니다.

      // 메인 페이지로 리디렉션
      toast.success("로그인을 성공하였습니다.");
      navigate("/");
    };

    // 이 useEffect는 OAuth 리디렉션 후 실행되며,
    // URL의 "code"나 해시를 통해 Supabase 세션이 이미 저장된 상태일 것입니다.
    handleAuthCallback();
  }, [navigate]);

  return (
    <main className="w-full h-full min-h-[720px] flex items-center justify-center">
      <p>로그인을 진행 중입니다. 잠시만 기다려주세요.</p>
      {/* 로딩 스피너 등을 추가할 수 있습니다. */}
    </main>
  );
}
