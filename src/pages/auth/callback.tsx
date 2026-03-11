import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { supabaseGetSession } = useAuth();

  useEffect(() => {
    supabaseGetSession.mutate(undefined, {
      onError: () => {
        toast.error("로그인 처리 중 오류가 발생했습니다.");
        navigate("/sign-in");
      },
    });
  }, []);

  return (
    <main className="w-full h-full min-h-[720px] flex items-center justify-center">
      <p>로그인을 진행 중입니다. 잠시만 기다려주세요.</p>
      {/* 로딩 스피너 등을 추가할 수 있습니다. */}
    </main>
  );
}
