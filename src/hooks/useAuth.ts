import { authApi, type SignInPayload, type SignUpPayload } from "@/api";
import { useAuthStore } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useAuth() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const signIn = useMutation({
    mutationFn: (payload: SignInPayload) => authApi.signInWithPassword(payload),
    meta: { scope: "auth" as const },
    onSuccess: (user) => {
      setUser(user);
      toast.success("로그인 성공");
      navigate("/");
    },
  });

  const signUp = useMutation({
    mutationFn: (payload: SignUpPayload) => authApi.signUp(payload),
    meta: { scope: "auth" as const },
    onSuccess: () => {
      toast.success("회원 가입이 완료되었습니다.");
      navigate("/sign-in");
    },
  });

  return { signIn, signUp };
}
