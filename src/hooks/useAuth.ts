import { authApi, userApi, type SignInPayload, type SignUpPayload } from "@/api";
import { queryKeys } from "@/constants/queryKeys";
import { queryClient } from "@/lib/queryClient";
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
    onSuccess: async (user) => {
      setUser(user);
      await queryClient.prefetchQuery({
        queryKey: queryKeys.user.info(user.id).queryKey,
        queryFn: () => userApi.getUserInfo(user.id),
      });
      toast.success("로그인 성공");
      navigate("/");
    },
  });

  const signUp = useMutation({
    mutationFn: (payload: SignUpPayload) => authApi.signUp(payload),
    meta: { scope: "auth" as const },
    onSuccess: ({ authUser, profile }) => {
      setUser(authUser);
      queryClient.setQueryData(queryKeys.user.info(authUser.id).queryKey, profile);
      toast.success("회원 가입이 완료되었습니다.");
      navigate("/");
    },
  });

  const googleSignIn = useMutation({
    mutationFn: () => authApi.signInWithGoogle(),
    meta: { scope: "auth" as const },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const checkEmailDuplicate = useMutation({
    mutationFn: (email: string) => authApi.checkEmailDuplicate(email),
    meta: { scope: "auth" as const },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const supabaseGetSession = useMutation({
    mutationFn: () => authApi.supabaseGetSession(),
    meta: { scope: "auth" as const },
    onSuccess: async (user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email as string,
          role: user.role as string,
        });
        await queryClient.prefetchQuery({
          queryKey: queryKeys.user.info(user.id).queryKey,
          queryFn: () => userApi.getUserInfo(user.id),
        });
        navigate("/");
      }
    },
    onError: (error) => {
      toast.error("세션 가져오기 실패");
      toast.error(error.message);
    },
  });

  return { signIn, signUp, googleSignIn, supabaseGetSession, checkEmailDuplicate };
}
